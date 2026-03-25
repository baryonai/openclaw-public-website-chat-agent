# 작업 이력 (Change Agent Log)

**날짜:** 2025-03-25
**작업자:** Claude Opus 4.6 + 대표님

---

## 1. 프로젝트 테스트 및 검증

- 기존 MVP 프로젝트 구조 파악 (Next.js 16.2.1 + TypeScript + React 19)
- `npm run build`, `npm run lint` 통과 확인
- dev 서버 기동 후 랜딩 페이지(`/`), 채팅 UI(`/chat`), API 엔드포인트(`/api/chat`) 정상 동작 확인
- API stub 응답 확인: 정상 메시지, 빈 메시지, 잘못된 JSON 모두 올바르게 처리

## 2. OpenClaw 게이트웨이 연동 (`4c556cf`)

- `ws` 패키지 설치 (WebSocket 클라이언트)
- `lib/gateway-client.ts` 신규 작성
  - Ed25519 디바이스 ID 자동 생성
  - v3 프로토콜 서명 (connect.challenge → connect handshake)
  - `chat.send` → `chat.event` 스트리밍 응답 수집
  - 구조화된 메시지 객체에서 텍스트 추출 (`extractText`)
- `app/api/chat/route.ts` 수정: stub 응답 → `sendToGateway()` 호출
- `.env.local` 생성: 게이트웨이 URL 및 토큰 설정
- 실제 테스트 결과:
  - `"hello"` → `"hello!"` (에이전트 실제 응답)
  - `"오늘 날씨 어때?"` → 실제 날씨 답변 반환

### 디버깅 과정

- `client.id`, `client.mode` 값이 게이트웨이 스키마와 불일치하여 connect 실패 → `gateway-client` / `backend`로 수정
- 이벤트 이름이 `chat.event`가 아닌 `chat`이었음 → 수정
- `message` 필드가 문자열이 아닌 구조화된 객체(`{role, content: [{type, text}]}`)였음 → `extractText()` 추가

## 3. i18n 다국어 지원 (`a6fe793`)

- `lib/i18n.ts` 신규 작성: 한국어(기본)/영어 번역 사전
- `detectLocale()`: 브라우저 `Accept-Language` 헤더에서 언어 자동 감지
- `app/layout.tsx` 수정: 동적 `lang` 속성, `data-locale` 전달
- `app/page.tsx` 수정: 서버 컴포넌트에서 번역 적용
- `app/chat/page.tsx` 수정: 클라이언트 컴포넌트에서 `data-locale`로 번역 로드
- 테스트 결과:
  - 기본 요청 → 한국어 (`웹사이트 챗 에이전트를 빠르게 시작하세요.`)
  - `Accept-Language: en-US` → 영어 (`Launch a website chat agent fast.`)

## 4. NemoClaw 샌드박스 배포 가이드 (`4130713`)

- README.md 전면 개편 (한국어)
  - 보안 경고: 로컬 OpenClaw 직접 연결의 위험성 명시
  - NemoClaw 샌드박스 배포 방식을 권장으로 안내
  - 로컬 OpenClaw 방식은 개발 전용으로 구분
- `.env.example` 추가: 게이트웨이 설정 템플릿
- `.gitignore` 수정: `.env.example`은 추적하도록 예외 처리
- 피처 카드 업데이트: NemoClaw 샌드박스 지원, 게이트웨이 연동, 자동 언어 감지

## 5. GitHub 퍼블릭 레포 생성 및 푸시

- `baryonai/openclaw-public-website-chat-agent` 퍼블릭 레포 생성
- 전체 커밋 히스토리 푸시 완료
- URL: https://github.com/baryonai/openclaw-public-website-chat-agent

## 6. NemoClaw 실행 환경 준비

- Colima + Docker CLI 설치 (`brew install colima docker`)
- Colima 기동 (8GB RAM, 40GB 디스크)
- NemoClaw CLI 설치 (`curl -fsSL https://www.nvidia.com/nemoclaw.sh | bash`)
- 포트 충돌 해결: NemoClaw 대시보드 포트를 18789 → **18790**으로 변경
  - `bin/lib/onboard.js`: 포트 체크, 포워딩, CHAT_UI_URL 기본값 변경
  - `nemoclaw/src/blueprint/runner.ts`: forward_ports 기본값 변경
  - `nemoclaw-blueprint/blueprint.yaml`: forward_ports 변경
  - NemoClaw 플러그인 리빌드 완료
- `.env.local` 업데이트: NemoClaw 샌드박스 포트(18790)로 전환

### 보안 설계 메모

- **현재 구조의 위험**: 앱 레벨에서 OpenClaw 게이트웨이에 `operator.read/write` 권한으로 직접 연결 → 퍼블릭 노출 시 호스트 파일 시스템/도구 접근 위험
- **NemoClaw 해결책**: 격리된 컨테이너(Landlock + seccomp + netns)에서 전용 OpenClaw 인스턴스 운영 → 네트워크/파일 시스템/프로세스 정책 제어
- **포트 분리**: 로컬 OpenClaw(18789)와 NemoClaw 샌드박스(18790) 공존 가능

---

## 미완료 / 다음 단계

- [ ] `nemoclaw onboard` 실행하여 샌드박스 생성
- [ ] 샌드박스 게이트웨이 토큰을 `.env.local`에 설정
- [ ] 스트리밍 응답 (SSE) 구현
- [ ] 위젯 임베드 모드
- [ ] 차기작: nemoclaw 기반 안전한 퍼블릭 배포
