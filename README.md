# Chronos

외부 캘린더 라이브러리 없이 처음부터 직접 만든 캘린더. 가볍고 빠르며 필요한 기능만 담고, OpenAI 기반 오케스트레이터와 Function Calling을 탑재해 자연어 한 문장으로 일정을 완전히 제어할 수 있다.

---

## Why custom-built

기성 캘린더 라이브러리(FullCalendar 등)는 무겁고, AI 에이전트가 직접 캘린더 상태를 조작하는 구조를 끼워 넣기 어렵다. Chronos는 캘린더 렌더링부터 AI 파이프라인까지 하나의 코드베이스에서 설계했기 때문에, 에이전트가 일정을 만들고 지우고 이동시키는 흐름이 자연스럽게 연결된다.

---

## Tech Stack

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 6 |
| Database | SQLite + Prisma 7 (`@prisma/adapter-libsql`) |
| AI | OpenAI GPT-4.1-mini (Function Calling + Orchestrator) |
| Styling | Tailwind CSS v4 |
| Test | Vitest + Testing Library |
| Package Manager | pnpm |

---

## Features

### 캘린더

- **월간 뷰** — 7열 CSS Grid 기반. 외부 라이브러리 없이 직접 구현
- **멀티데이 이벤트 배너** — 여러 날에 걸친 일정을 셀 내부에 가로로 이어지는 배너로 렌더링. 그리디 알고리즘으로 배너 행 충돌 방지
- **일간 패널** — 날짜 탭 클릭 시 해당 일의 일정 목록 슬라이드업
- **연/월 피커** — 헤더 타이틀 탭으로 연도·월 빠른 이동
- **일정 CRUD** — 생성·조회·수정·삭제·취소 전체 지원
- **종일/시간 지정 전환** — 토글로 즉시 전환, 시간 지정 시 종료 시간 자동 +1시간 (최대 23:59 캡)
- **멀티데이 날짜 입력** — 커스텀 DateInput / TimeInput 컴포넌트 (네이티브 피커 오버레이)
- **일정 공유** — 읽기 전용 공개 링크 생성

### 타임라인 (월간 회고)

- 월 단위 일정을 시각적으로 나열하는 타임라인 뷰
- AI 월간 회고록 생성 — 전체 슬라이드업 오버레이로 표시

### AI 자연어 제어

자연어 한 문장으로 일정의 전체 CRUD와 캘린더 네비게이션을 수행한다.

```
"담주 화요일 오후 2시 치과 예약 잡아줘"     → 일정 생성
"치과 예약 제목 바꿔줘, 스케일링으로"        → 일정 수정
"치과 어딨어?"                             → 해당 날짜로 이동 + 상세 열기
"팀 스탠드업 삭제해줘"                      → 일정 삭제 (5초 실행취소)
"치과 찾아서 다음 주 같은 시간으로 옮겨줘"   → find → update 자동 연결
"5월로 이동해줘"                           → 캘린더 네비게이션
```

---

## AI Architecture

### Function Calling 도구 (5종)

AI가 호출할 수 있는 도구는 스키마로 정의되어 있으며, 각 도구는 역할이 명확하게 분리된다.

| 도구 | 동작 |
|------|------|
| `create_event` | 새 일정 DB 저장. title / startAt / endAt / isAllDay / location / description 수신 |
| `update_event` | eventId 기반 일정 부분 수정. 변경할 필드만 전달 |
| `delete_event` | eventId 기반 일정 영구 삭제. 삭제 전 스냅샷 보존 → 실행취소 가능 |
| `find_event` | 키워드로 일정 검색. 부분 일치 허용 (예: "치과" → "치과 예약" 매칭) |
| `navigate_to_date` | 캘린더를 특정 날짜/월로 이동. DB 조작 없음 |

### 시스템 프롬프트 규칙

매 요청마다 오늘 날짜(요일 포함)와 전체 등록 일정 목록(ID 포함)을 컨텍스트로 주입한다. LLM은 ID를 직접 사용해 `update_event` / `delete_event`를 호출하므로 불필요한 `find_event` 선행 호출을 하지 않는다.

```
Today is 2026-04-23 (목요일)

등록된 일정:
- ID:12 "치과 예약" (2026-04-25T14:00)
- ID:13 "팀 스탠드업" (2026-04-24T10:00)
...

규칙:
1. DELETE → delete_event 즉시 호출. find_event 선행 금지
2. UPDATE → update_event 즉시 호출. find_event 선행 금지
3. 위치/날짜 조회 → find_event
4. 신규 생성 → create_event
5. 날짜 이동 → navigate_to_date
```

### Orchestrator (멀티스텝 에이전트 루프)

단일 요청으로 여러 도구를 순차적으로 실행해야 할 때 오케스트레이터가 작동한다.

```
사용자: "치과 찾아서 다음 주 같은 시간으로 옮겨줘"

Iteration 1:  LLM → find_event("치과")
              결과: { id: 12, title: "치과 예약", startAt: "2026-04-25T14:00" }
              → 결과를 messages에 주입

Iteration 2:  LLM → update_event(id: 12, startAt: "2026-05-02T14:00")
              결과: { success: true }
              → 결과를 messages에 주입

Iteration 3:  LLM → 도구 호출 없음 (완료 판단)
              → "치과 예약을 5월 2일 오후 2시로 옮겼어요!" 반환
```

**판단 기준**: LLM이 매 이터레이션마다 "다음 도구가 필요한가"를 스스로 결정한다. 도구 호출이 없는 응답이 오면 루프 종료. 최대 6회 반복으로 무한루프 방지.

**응답 타입 분기**:
- 도구 0회 → `clarify` (입력창에 인라인 메시지)
- 도구 1회 → `SingleAIResponse` (기존 흐름 그대로)
- 도구 2회 이상 → `OrchestratedResponse` (사이드이펙트 집약)

**사이드이펙트 집약**: 멀티스텝 완료 후 프론트엔드에 필요한 동작(캘린더 새로고침, 날짜 이동, 이벤트 상세 열기)을 한 번에 전달한다.

### 오케스트레이터 구조도

```
┌─────────────────────────────────────────────────────────┐
│                     사용자 자연어 입력                     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               app/api/ai/chat  (Route Handler)           │
│  - 전체 이벤트 목록 + 오늘 날짜 조회 (DB)                  │
│  - runOrchestrator(text, today, events) 호출             │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  orchestrator.ts                         │
│                                                         │
│   messages = [system prompt, user input]                │
│                                                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │              Agentic Loop (max 6회)              │  │
│   │                                                  │  │
│   │  ① LLM 호출 (GPT-4.1-mini, tools 전달)          │  │
│   │         │                                        │  │
│   │         ├─ tool_calls 없음 → 루프 종료           │  │
│   │         │                                        │  │
│   │         └─ tool_calls 있음                       │  │
│   │                   │                              │  │
│   │                   ▼                              │  │
│   │  ② executeSingleToolCall(name, args)             │  │
│   │     → response  (프론트용 구조화 결과)            │  │
│   │     → rawResult (LLM 피드백용 compact JSON)      │  │
│   │                   │                              │  │
│   │                   ▼                              │  │
│   │  ③ messages에 tool result 주입 → ①로 반복        │  │
│   └─────────────────────────────────────────────────┘  │
│                        │                                │
│            steps 배열 누적 (실행된 도구 기록)             │
└───────────────────────┬─────────────────────────────────┘
                        │
            ┌───────────┼───────────┐
            ▼           ▼           ▼
        steps=0      steps=1    steps≥2
            │           │           │
        clarify    SingleAI    Orchestrated
        (인라인     Response    Response
         메시지)   (기존 흐름)  + buildSideEffects()
                                    │
                          ┌─────────┴──────────┐
                          │   SideEffects       │
                          │  - refresh          │
                          │  - navigateTo       │
                          │  - openEventId      │
                          └─────────┬──────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────┐
│               hooks/useCalendarAI.ts                     │
│  - onRefresh()       캘린더 이벤트 재조회                 │
│  - onNavigateTo()    해당 날짜로 이동                     │
│  - onOpenEvent()     이벤트 상세 모달 열기                │
│  - onToast()         성공/실행취소 토스트                 │
└─────────────────────────────────────────────────────────┘
```

### 모듈 구조

```
lib/ai/
  types.ts           — AIResponse discriminated union 타입 정의
  tools.ts           — OpenAI Function Calling 스키마 (5종)
  actions.ts         — 도구별 DB 실행 로직 (Prisma)
  function-caller.ts — 단일 도구 실행 + rawResult(LLM 피드백용) 생성
  orchestrator.ts    — 멀티스텝 에이전트 루프
  index.ts           — 외부 export 진입점
```

---

## Getting Started

```bash
pnpm install
pnpm prisma generate
pnpm prisma db push
pnpm dev
```

환경 변수:

```env
OPENAI_API_KEY=sk-...
DATABASE_URL=file:./dev.db
```

브라우저: `http://localhost:3000`
