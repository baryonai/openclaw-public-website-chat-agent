export type Locale = "ko" | "en";

const dict = {
  ko: {
    // layout
    siteTitle: "웹사이트 챗 에이전트",
    siteDescription: "웹사이트에 바로 붙일 수 있는 AI 채팅 에이전트 MVP",

    // landing
    eyebrow: "미니멀 MVP",
    heroTitle: "웹사이트 챗 에이전트를 빠르게 시작하세요.",
    heroCopy:
      "깔끔한 랜딩 페이지, 가벼운 채팅 UI, 그리고 바로 동작하는 API 라우트가 포함된 스타터입니다.",
    ctaChat: "채팅 데모 열기",
    ctaFeatures: "포함된 기능 보기",

    feat1Title: "웹사이트 위젯 준비 완료",
    feat1Desc: "고객 지원이나 세일즈 위젯으로 바로 활용할 수 있는 간결한 채팅 경험입니다.",
    feat2Title: "API 라우트 포함",
    feat2Desc: "OpenClaw 게이트웨이에 연결된 /api/chat 엔드포인트가 포함되어 있습니다.",
    feat3Title: "작은 MVP 구성",
    feat3Desc: "로컬에서 실행하고, 빠르게 데모하고, 나중에 확장하기에 딱 알맞은 구조입니다.",

    // chat
    chatEyebrow: "데모 채팅",
    chatTitle: "웹사이트 챗 에이전트",
    chatSubtitle: "메시지는 OpenClaw 게이트웨이를 통해 에이전트에게 전달됩니다.",
    chatWelcome: "안녕하세요! 웹사이트 챗 에이전트입니다. 무엇이든 물어보세요.",
    chatPlaceholder: "가격, 지원, 온보딩 등에 대해 물어보세요...",
    chatSend: "보내기",
    chatSending: "전송 중...",
    chatYou: "나",
    chatAgent: "에이전트",
    chatError: "API에 연결할 수 없습니다. 개발 서버가 실행 중인지 확인하세요.",
    chatUnexpected: "예상치 못한 응답이 반환되었습니다.",
  },
  en: {
    siteTitle: "Website Chat Agent",
    siteDescription: "Minimal Next.js starter for a website chat agent with landing page, chat UI, and API route.",

    eyebrow: "Minimal MVP",
    heroTitle: "Launch a website chat agent fast.",
    heroCopy:
      "This starter gives you a clean landing page, a lightweight chat UI, and a working API route so you can start building your own website assistant.",
    ctaChat: "Open chat demo",
    ctaFeatures: "See what\u2019s included",

    feat1Title: "Website widget ready",
    feat1Desc: "A simple chat experience you can adapt into an embeddable support or sales widget.",
    feat2Title: "API route included",
    feat2Desc: "A /api/chat endpoint connected to the OpenClaw gateway is included.",
    feat3Title: "Tiny MVP footprint",
    feat3Desc: "Just enough UI and structure to run locally, demo quickly, and extend later.",

    chatEyebrow: "Demo chat",
    chatTitle: "Website Chat Agent",
    chatSubtitle: "Messages are delivered to the agent via the OpenClaw gateway.",
    chatWelcome: "Hi — I\u2019m your website chat agent. Ask me anything to get started.",
    chatPlaceholder: "Ask about pricing, support, onboarding...",
    chatSend: "Send",
    chatSending: "Sending...",
    chatYou: "You",
    chatAgent: "Agent",
    chatError: "Couldn\u2019t reach the API route. Make sure the dev server is running.",
    chatUnexpected: "The chat endpoint returned an unexpected response.",
  },
} as const;

export type Dict = { [K in keyof (typeof dict)["ko"]]: string };

export function getDict(locale: Locale): Dict {
  return dict[locale] as Dict;
}

export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return "ko";
  // Check if any English locale appears before Korean
  const parts = acceptLanguage.toLowerCase();
  const enIdx = parts.search(/\ben/);
  const koIdx = parts.search(/\bko/);
  if (enIdx !== -1 && (koIdx === -1 || enIdx < koIdx)) return "en";
  return "ko";
}
