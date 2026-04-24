export const API = {
  EVENTS: {
    BASE: '/api/events',
    DETAIL: (id: number) => `/api/events/${id}`,
    CANCEL: (id: number) => `/api/events/${id}/cancel`,
    SHARE: (id: number) => `/api/events/${id}/share`,
    PHOTO: (id: number) => `/api/events/${id}/photo`,
  },
  SHARE: {
    BY_TOKEN: (token: string) => `/api/share/${token}`,
  },
  AI: {
    CHAT: '/api/ai/chat',
    PARSE: '/api/ai/parse',
    RETROSPECTIVE: '/api/ai/retrospective',
    TIMELINE_NOTE: '/api/ai/timeline-note',
  },
} as const
