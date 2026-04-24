export const EVENT = {
  DEFAULT_COLOR: '#2ECC8F',
  STATUS: {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
  },
} as const

export const EVENT_COLORS = [
  { hex: '#2ECC8F', label: '민트' },
  { hex: '#8FAFD9', label: '블루' },
  { hex: '#D08E9D', label: '핑크' },
  { hex: '#7DC4A8', label: '그린' },
  { hex: '#E8C07A', label: '옐로' },
  { hex: '#B8A9D9', label: '라벤더' },
  { hex: '#D0707A', label: '레드' },
  { hex: '#A09BB8', label: '그레이' },
] as const

export const NL_PLACEHOLDERS = [
  '담주 화요일 오후 2시 치과 추가해줘',
  '이번 주 금요일 팀 회식 일정 넣어줘',
  '프로젝트 발표 일정 어딨어?',
  '5월로 이동해줘',
  '다음 달 일정 알려줘',
  '오늘 일정 삭제해줘',
  '내년 1월 1일 새해 종일 일정 추가해줘',
] as const
