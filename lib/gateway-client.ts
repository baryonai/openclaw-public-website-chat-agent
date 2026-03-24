import crypto from "node:crypto";
import WebSocket from "ws";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DeviceIdentity = {
  deviceId: string;
  publicKeyPem: string;
  privateKeyPem: string;
  publicKeyRaw: string; // base64url
};

type GatewayConfig = {
  url: string;
  token: string;
};

type ChatEvent = {
  runId: string;
  sessionKey: string;
  seq: number;
  state: "delta" | "final" | "aborted" | "error";
  message?: { role: string; content: { type: string; text: string }[] } | string;
  errorMessage?: string;
  usage?: unknown;
  stopReason?: string;
};

type Frame = {
  type: "req" | "res" | "event";
  id?: string;
  method?: string;
  params?: unknown;
  ok?: boolean;
  payload?: unknown;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  event?: string;
  seq?: number;
};

// ---------------------------------------------------------------------------
// Device identity helpers (Ed25519)
// ---------------------------------------------------------------------------

function createDeviceIdentity(): DeviceIdentity {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519", {
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const pubDer = crypto.createPublicKey(publicKey).export({ type: "spki", format: "der" });
  // Ed25519 SPKI prefix is 12 bytes; raw key is the remaining 32 bytes
  const rawKey = pubDer.subarray(12);
  const rawB64url = rawKey.toString("base64url");
  const deviceId = crypto.createHash("sha256").update(rawKey).digest("hex");

  return { deviceId, publicKeyPem: publicKey, privateKeyPem: privateKey, publicKeyRaw: rawB64url };
}

function signPayload(privateKeyPem: string, payload: string): string {
  const sig = crypto.sign(null, Buffer.from(payload, "utf8"), privateKeyPem);
  return sig.toString("base64url");
}

// ---------------------------------------------------------------------------
// Singleton device identity (generated once per process)
// ---------------------------------------------------------------------------

let _device: DeviceIdentity | null = null;
function getDevice(): DeviceIdentity {
  if (!_device) _device = createDeviceIdentity();
  return _device;
}

// ---------------------------------------------------------------------------
// Extract text from chat message (can be string or structured object)
// ---------------------------------------------------------------------------

function extractText(msg: ChatEvent["message"]): string {
  if (typeof msg === "string") return msg;
  if (msg && typeof msg === "object" && Array.isArray(msg.content)) {
    return msg.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");
  }
  return String(msg ?? "");
}

// ---------------------------------------------------------------------------
// Gateway config from environment
// ---------------------------------------------------------------------------

function getConfig(): GatewayConfig {
  return {
    url: process.env.OPENCLAW_GATEWAY_URL ?? "ws://127.0.0.1:18789",
    token: process.env.OPENCLAW_GATEWAY_TOKEN ?? "",
  };
}

// ---------------------------------------------------------------------------
// Send a message to the gateway and collect the full response
// ---------------------------------------------------------------------------

export async function sendToGateway(
  userMessages: { role: "user" | "assistant"; content: string }[],
): Promise<string> {
  const config = getConfig();
  if (!config.token) {
    throw new Error("OPENCLAW_GATEWAY_TOKEN is not set");
  }

  const lastUserMsg = [...userMessages].reverse().find((m) => m.role === "user");
  if (!lastUserMsg) throw new Error("No user message provided");

  return new Promise<string>((resolve, reject) => {
    const ws = new WebSocket(config.url);
    const device = getDevice();
    let reqCounter = 0;
    const nextId = () => `web-${++reqCounter}`;

    let chatRunId: string | null = null;
    const chunks: string[] = [];
    let settled = false;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        ws.close();
        reject(new Error("Gateway response timeout (60s)"));
      }
    }, 60_000);

    const cleanup = () => {
      clearTimeout(timeout);
      try { ws.close(); } catch { /* ignore */ }
    };

    const send = (frame: Frame) => ws.send(JSON.stringify(frame));

    ws.on("error", (err) => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(err);
      }
    });

    ws.on("close", () => {
      if (!settled) {
        settled = true;
        cleanup();
        reject(new Error("Gateway connection closed unexpectedly"));
      }
    });

    ws.on("message", (raw) => {
      if (settled) return;

      let frame: Frame;
      try {
        frame = JSON.parse(raw.toString()) as Frame;
      } catch {
        return;
      }

      // ---- connect.challenge → send connect ----
      if (frame.type === "event" && frame.event === "connect.challenge") {
        const challenge = frame.payload as { nonce: string; ts: number };
        const signedAt = Date.now();
        const scopes = "operator.read,operator.write";
        const payloadStr = [
          "v3",
          device.deviceId,
          "gateway-client",   // must match GATEWAY_CLIENT_IDS
          "backend",          // must match GATEWAY_CLIENT_MODES
          "operator",
          scopes,
          String(signedAt),
          config.token,
          challenge.nonce,
          "web",
          "",
        ].join("|");
        const signature = signPayload(device.privateKeyPem, payloadStr);

        send({
          type: "req",
          id: nextId(),
          method: "connect",
          params: {
            minProtocol: 3,
            maxProtocol: 3,
            client: {
              id: "gateway-client",
              version: "1.0.0",
              platform: "web",
              mode: "backend",
            },
            role: "operator",
            scopes: ["operator.read", "operator.write"],
            caps: [],
            commands: [],
            permissions: {},
            auth: { token: config.token },
            locale: "ko-KR",
            userAgent: "website-chat-agent/1.0.0",
            device: {
              id: device.deviceId,
              publicKey: device.publicKeyRaw,
              signature,
              signedAt,
              nonce: challenge.nonce,
            },
          },
        });
        return;
      }

      // ---- connect response → send chat.send ----
      if (frame.type === "res" && frame.ok === true) {
        const payload = frame.payload as Record<string, unknown> | undefined;
        if (payload?.type === "hello-ok") {
          const idempotencyKey = crypto.randomUUID();
          send({
            type: "req",
            id: nextId(),
            method: "chat.send",
            params: {
              sessionKey: "main",
              message: lastUserMsg.content,
              deliver: true,
              attachments: [],
              idempotencyKey,
            },
          });
          return;
        }
      }

      // ---- connect error ----
      if (frame.type === "res" && frame.ok === false) {
        settled = true;
        cleanup();
        const errMsg = frame.error?.message ?? "Gateway connect failed";
        reject(new Error(errMsg));
        return;
      }

      // ---- chat.send response (runId) ----
      if (frame.type === "res" && frame.ok === true && !chatRunId) {
        const payload = frame.payload as Record<string, unknown> | undefined;
        if (payload?.runId) {
          chatRunId = payload.runId as string;
        }
        return;
      }

      // ---- chat events (streaming response) ----
      if (frame.type === "event" && frame.event === "chat") {
        const evt = frame.payload as ChatEvent;
        if (chatRunId && evt.runId !== chatRunId) return;

        if (evt.state === "delta" && evt.message) {
          chunks.push(extractText(evt.message));
        }

        if (evt.state === "final") {
          settled = true;
          cleanup();
          const finalText = evt.message ? extractText(evt.message) : chunks.join("");
          resolve(finalText);
          return;
        }

        if (evt.state === "error") {
          settled = true;
          cleanup();
          reject(new Error(evt.errorMessage ?? "Agent error"));
          return;
        }

        if (evt.state === "aborted") {
          settled = true;
          cleanup();
          resolve(chunks.join("") || "(응답이 중단되었습니다)");
          return;
        }
      }
    });
  });
}
