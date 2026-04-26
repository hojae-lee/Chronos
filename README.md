# Chronos

자연어 한 문장으로 캘린더를 완전히 제어하는 AI 플래너.  
대화형 인터페이스와 단일 오케스트레이터 에이전트 루프를 중심으로 설계되었다.

---

## 대화형 캘린더 제어

입력창에 하고 싶은 것을 그냥 말하면 된다. AI가 의도를 파악해 필요한 도구를 조합하여 실행한다.

### 업무 지시 예시

#### 일정 생성
```
"담주 화요일 오후 2시 치과 예약 잡아줘"
"오늘 저녁 7시 팀 회식 추가해줘"
"다음 달 1일부터 3일까지 제주도 여행 잡아줘"
"매주 월요일 오전 10시 스탠드업 만들어줘"
"내일 오전 9시 병원 예약, 강남구 삼성동"
```

#### 일정 수정
```
"치과 예약 제목 스케일링으로 바꿔줘"
"팀 스탠드업 30분 뒤로 밀어줘"
"치과 찾아서 다음 주 같은 시간으로 옮겨줘"
"오늘 회의 장소 강남역 2번 출구로 업데이트해줘"
"제주도 여행 하루 더 늘려줘"
```

#### 일정 삭제 / 취소
```
"팀 스탠드업 삭제해줘"
"치과 예약 취소해줘"
"이번 주 금요일 일정 다 지워줘"
```

#### 일정 검색 및 이동
```
"치과 어딨어?"
"다음 주 일정 보여줘"
"5월로 이동해줘"
"오늘로 돌아가줘"
"팀 회식 언제야?"
```

#### 멀티스텝 (자동 연결)
```
"치과 찾아서 다음 주 같은 시간으로 옮겨줘"   → find → update 자동 연결
"병원 예약 찾아서 하루 전으로 앞당겨줘"       → find → update 자동 연결
"스탠드업 찾아서 삭제해줘"                   → find → delete 자동 연결
```

---

## 단일 오케스트레이터 에이전트 루프

모든 자연어 요청은 하나의 오케스트레이터(`lib/ai/orchestrator.ts`)가 처리한다.  
별도의 라우팅 없이 단일 엔드포인트(`POST /api/ai/chat`)로 진입하며, 오케스트레이터가 루프를 돌며 필요한 도구를 스스로 결정한다.

### 루프 동작 원리

```
사용자: "치과 찾아서 다음 주 같은 시간으로 옮겨줘"

Iteration 1:  LLM → find_event("치과")
              결과: { id: 12, title: "치과 예약", startAt: "2026-04-25T14:00" }
              → messages에 결과 주입

Iteration 2:  LLM → update_event(id: 12, startAt: "2026-05-02T14:00")
              결과: { success: true }
              → messages에 결과 주입

Iteration 3:  LLM → 도구 호출 없음 (스스로 완료 판단)
              → "치과 예약을 5월 2일 오후 2시로 옮겼어요!" 반환
```

**LLM이 매 이터레이션마다 "다음 도구가 필요한가"를 스스로 결정한다.**  
도구 호출이 없는 응답이 오면 루프가 종료된다. 최대 6회 반복으로 무한루프를 방지한다.

### 아키텍처 구조도

```
┌─────────────────────────────────────────────────────────┐
│                     사용자 자연어 입력                     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               POST /api/ai/chat (단일 진입점)             │
│  - 전체 이벤트 목록 + 오늘 날짜 컨텍스트 주입 (DB)          │
│  - runOrchestrator(text, today, events) 호출             │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  orchestrator.ts                         │
│                                                         │
│   messages = [system prompt + 컨텍스트, user input]      │
│                                                         │
│   ┌─────────────────────────────────────────────────┐  │
│   │            Agentic Loop (최대 6회)               │  │
│   │                                                  │  │
│   │  ① LLM 호출 (GPT-5.4-mini, tools 전달)          │  │
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
        안내)     (기존 흐름)  + buildSideEffects()
                                    │
                          ┌─────────┴──────────┐
                          │    SideEffects       │
                          │  - refresh           │
                          │  - navigateTo        │
                          │  - openEventId       │
                          └─────────┬──────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────┐
│               hooks/useCalendarAI.ts                     │
│  - onRefresh()      캘린더 이벤트 재조회                  │
│  - onNavigateTo()   해당 날짜/월로 이동                   │
│  - onOpenEvent()    이벤트 상세 모달 열기                 │
│  - onToast()        성공/실행취소 토스트                  │
└─────────────────────────────────────────────────────────┘
```

### Function Calling 도구 (5종)

| 도구 | 동작 |
|------|------|
| `create_event` | 새 일정 DB 저장. title / startAt / endAt / isAllDay / location / description 수신 |
| `update_event` | eventId 기반 일정 부분 수정. 변경할 필드만 전달 |
| `delete_event` | eventId 기반 일정 영구 삭제. 삭제 전 스냅샷 보존 → 실행취소 가능 |
| `find_event` | 키워드로 일정 검색. 부분 일치 허용 ("치과" → "치과 예약" 매칭) |
| `navigate_to_date` | 캘린더를 특정 날짜/월로 이동. DB 조작 없음 |

### 시스템 프롬프트 컨텍스트

매 요청마다 오늘 날짜와 전체 등록 일정 목록(ID 포함)을 주입한다.  
LLM은 ID를 직접 사용해 `update_event` / `delete_event`를 호출하므로 `find_event` 선행 호출이 불필요하다.

```
Today is 2026-04-27 (일요일)

등록된 일정:
- ID:12 "치과 예약" (2026-04-29T14:00)
- ID:13 "팀 스탠드업" (2026-04-28T10:00)

규칙:
1. DELETE → delete_event 즉시 호출. find_event 선행 금지
2. UPDATE → update_event 즉시 호출. find_event 선행 금지
3. 위치/날짜 조회 → find_event
4. 신규 생성 → create_event
5. 날짜 이동 → navigate_to_date
```

### AI 모듈 구조

```
lib/ai/
  types.ts           — AIResponse discriminated union 타입 정의
  tools.ts           — Function Calling 스키마 (5종)
  actions.ts         — 도구별 DB 실행 로직
  function-caller.ts — 단일 도구 실행 + rawResult 생성
  orchestrator.ts    — 에이전트 루프 (핵심)
  index.ts           — 외부 export 진입점
```

---

## 캘린더 기능

- **월간 뷰** — 7열 CSS Grid. 외부 라이브러리 없이 직접 구현
- **멀티데이 배너** — 여러 날에 걸친 일정을 가로 배너로 렌더링. 그리디 알고리즘으로 행 충돌 방지
- **일간 패널** — 날짜 탭 클릭 시 슬라이드업
- **연/월 피커** — 헤더 타이틀 탭으로 빠른 이동
- **일정 공유** — 읽기 전용 공개 링크 생성
- **타임라인** — 월 단위 세로형 카드 뷰 + AI 월간 회고록 생성

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
