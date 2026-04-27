# Chronos

자연어 한 문장으로 캘린더를 완전히 제어하는 AI 플래너.  
대화형 채팅 인터페이스와 단일 오케스트레이터 에이전트 루프를 중심으로 설계되었다.

---

## 랜딩 페이지

`/` 루트는 랜딩 페이지로 렌더된다. 세 개 섹션으로 구성된다.

- **Hero** — Iridescence WebGL 배경(ogl), BlurText 헤드라인, RotatingText 서브헤드, AIChatDemo 자동 타이핑 루프 (motion/react)
- **Features** — 자연어 입력 / 가볍고 빠른 캘린더 / AI 월간 회고록
- **RetroSection** — 다크 배경 AI 회고록 프리뷰 (stats + 타임라인 카드)

SSR/CSR 경계: `page.tsx`, `LandingNav`, `HeroSection`, `FeaturesSection`, `RetroSection`은 Server Component. 애니메이션 컴포넌트(`Iridescence`, `BlurText`, `RotatingText`, `ShinyText`, `AIChatDemo`, `ScrollFade`)만 `'use client'`.

```
components/
  react-bits/       — Iridescence.tsx, BlurText.tsx, RotatingText.tsx, ShinyText.tsx
  landing/          — LandingNav.tsx, HeroSection.tsx, AIChatDemo.tsx,
                      FeaturesSection.tsx, RetroSection.tsx, ScrollFade.tsx
```

---

## 대화형 캘린더 제어

캘린더 화면 우하단의 Wand2 버튼을 누르면 채팅 카드가 열린다.  
카드에 말을 걸면 AI가 의도를 파악해 필요한 도구를 조합하여 실행한다.  
AI 응답은 채팅 버블로 표시되고, 캘린더는 제자리에서 갱신된다(이동 없음).

### 업무 지시 예시

#### 일정 생성
```
"담주 화요일 오후 2시 치과 예약 잡아줘"
"오늘 저녁 7시 팀 회식 추가해줘"
"다음 달 1일부터 3일까지 제주도 여행 잡아줘"
"내일 오전 9시 병원 예약, 강남구 삼성동"
```

#### 일정 수정
```
"치과 예약 제목 스케일링으로 바꿔줘"
"팀 스탠드업 30분 뒤로 밀어줘"
"치과 찾아서 다음 주 같은 시간으로 옮겨줘"
```

#### 일정 삭제 / 취소
```
"팀 스탠드업 삭제해줘"
"치과 예약 취소해줘"
```

#### 일정 검색
```
"치과 어딨어?"
"팀 회식 언제야?"
"다음 주 일정 보여줘"
```

#### 멀티스텝 (자동 연결)
```
"치과 찾아서 다음 주 같은 시간으로 옮겨줘"   → find → update 자동 연결
"병원 예약 찾아서 하루 전으로 앞당겨줘"       → find → update 자동 연결
"스탠드업 찾아서 삭제해줘"                   → find → delete 자동 연결
```

#### AI 월간 회고록
```
"이번달 어땠어?"
"이번달 일정 어떻게 보냈어?"
"회고록 만들어줘"
```
→ 회고록 패널이 열리고 AI가 한 달 일정을 분석해 회고록을 생성한다.

---

## 단일 오케스트레이터 에이전트 루프

모든 자연어 요청은 `POST /api/ai/chat` 단일 엔드포인트로 진입한다.  
회고록 인텐트는 오케스트레이터 호출 전에 패턴 매칭으로 먼저 분기된다.

### 라우팅 흐름

```
사용자 입력
    │
    ├─ 회고록 패턴 감지? ──→ { action: 'retrospective', year, month } 즉시 반환
    │   (이번달 어땠어? 등)
    │
    └─ runOrchestrator(text, today, events)
           │
           └─ Agentic Loop (최대 6회)
                  ① LLM 호출 (GPT-5.4-mini, tools 전달)
                  ② tool_calls 없음 → 루프 종료
                  ③ tool_calls 있음 → executeSingleToolCall → messages에 결과 주입 → ①
```

### Function Calling 도구 (5종)

| 도구 | 동작 |
|------|------|
| `create_event` | 새 일정 DB 저장 |
| `update_event` | eventId 기반 일정 부분 수정 |
| `delete_event` | eventId 기반 일정 삭제. 삭제 전 스냅샷 보존 → 실행취소 가능 |
| `find_event` | 키워드로 일정 검색. 부분 일치 허용 |
| `navigate_to_date` | 클라이언트 날짜 이동 응답 반환 (DB 조작 없음) |

### AI 모듈 구조

```
lib/ai/
  types.ts           — AIResponse discriminated union (retrospective 포함)
  tools.ts           — Function Calling 스키마
  actions.ts         — 도구별 DB 실행 로직
  function-caller.ts — 단일 도구 실행 + rawResult 생성
  orchestrator.ts    — 에이전트 루프 (핵심)
  index.ts           — 외부 export 진입점
```

---

## AI 월간 회고록

타임라인 화면 또는 캘린더 채팅("이번달 어땠어?")에서 접근 가능하다.

- `POST /api/ai/retrospective` — 해당 월 일정 분석 → 마크다운 회고문 + 카테고리 분석 JSON 생성
- 결과: 친근한 말투의 마크다운 회고문, 카테고리별 비중(%), 하이라이트 목록
- UI: 랜딩 RetroSection과 동일한 에디토리얼 스타일 (대형 타이포 + stats 그리드 + 컬러 하이라이트 카드)

---

## 캘린더 기능

- **월간 뷰** — 7열 CSS Grid. 외부 라이브러리 없이 직접 구현
- **멀티데이 배너** — 여러 날에 걸친 일정을 가로 배너로 렌더링. 그리디 알고리즘으로 행 충돌 방지
- **일간 패널** — 날짜 탭 클릭 시 슬라이드업
- **연/월 피커** — 헤더 타이틀 탭으로 빠른 이동
- **일정 공유** — 읽기 전용 공개 링크 생성
- **타임라인** — 월 단위 세로형 카드 뷰 + AI 월간 회고록

---

## Tech Stack

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6 |
| Database | SQLite + Prisma 7 (`@prisma/adapter-libsql`) |
| AI | OpenAI GPT-5.4-mini (Function Calling + Agentic Loop) |
| State | TanStack Query v5 |
| Styling | Tailwind CSS v4 + Pretendard |
| Animation | motion/react (Framer Motion v12), ogl (WebGL) |
| Markdown | react-markdown |
| Test | Vitest + Testing Library |
| Package Manager | pnpm |

---

## Getting Started

```bash
pnpm install
pnpm prisma db push
pnpm dev
```

`.env.local`:

```env
OPENAI_API_KEY=sk-...
```

브라우저: `http://localhost:3000`
