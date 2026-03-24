# OpenClaw Public Website Chat Agent

웹사이트에 임베드할 수 있는 AI 채팅 에이전트 MVP입니다.
OpenClaw 게이트웨이를 통해 에이전트와 대화합니다.

> **보안 경고:** 이 프로젝트는 앱 레벨에서 OpenClaw 게이트웨이에 직접 연결합니다.
> 퍼블릭 배포 시 반드시 **NemoClaw 샌드박스** 환경에서 운영하세요.
> 로컬 OpenClaw에 직접 연결하면 에이전트가 호스트 파일 시스템과 도구에 접근할 수 있어 위험합니다.

## 구성

```text
app/
  api/chat/route.ts   # OpenClaw 게이트웨이 연동 API
  chat/page.tsx       # 채팅 UI (클라이언트)
  layout.tsx          # 레이아웃 (i18n 자동 감지)
  page.tsx            # 랜딩 페이지
lib/
  gateway-client.ts   # 게이트웨이 WebSocket 클라이언트
  i18n.ts             # 한국어(기본)/영어 번역
```

## 로컬 실행

```bash
npm install
cp .env.example .env.local   # 게이트웨이 설정 편집
npm run dev
```

- `http://localhost:3000` — 랜딩 페이지
- `http://localhost:3000/chat` — 채팅 데모

## 배포 방식

### 방식 1: NemoClaw 샌드박스 (권장)

NemoClaw는 OpenClaw를 격리된 컨테이너에서 실행하여 네트워크, 파일 시스템, 프로세스를 정책으로 제어합니다.

```bash
# 1. NemoClaw 설치 및 샌드박스 생성
curl -fsSL https://www.nvidia.com/nemoclaw.sh | bash

# 2. 샌드박스 연결 확인
nemoclaw my-assistant status

# 3. 포트 포워딩 (18789 → 샌드박스 게이트웨이)
nemoclaw my-assistant connect
```

`.env.local`에서 샌드박스 게이트웨이를 가리키도록 설정:

```env
OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=<샌드박스_게이트웨이_토큰>
```

NemoClaw 샌드박스의 보호 레이어:
- **네트워크**: 허용된 외부 엔드포인트만 접근 가능
- **파일 시스템**: 샌드박스 외부 읽기/쓰기 차단
- **프로세스**: 권한 상승 차단
- **추론**: 모델 호출을 통제된 백엔드로 라우팅

### 방식 2: 로컬 OpenClaw (개발 전용)

> **주의:** 개발/테스트 목적으로만 사용하세요. 퍼블릭 배포에는 부적합합니다.

```env
OPENCLAW_GATEWAY_URL=ws://127.0.0.1:18789
OPENCLAW_GATEWAY_TOKEN=<로컬_게이트웨이_토큰>
```

## i18n

브라우저의 `Accept-Language` 헤더를 감지하여 자동으로 언어를 전환합니다.

| 조건 | 언어 |
|------|------|
| 한국어 브라우저 또는 기본 | 한국어 |
| 영어 브라우저 (`en-US`, `en-GB` 등) | English |

## 빌드

```bash
npm run build
npm run start
```

## 차기 로드맵

- [ ] NemoClaw 전용 배포 스크립트
- [ ] 스트리밍 응답 (SSE)
- [ ] 위젯 임베드 모드
- [ ] 멀티 에이전트 라우팅

## 라이선스

MIT
