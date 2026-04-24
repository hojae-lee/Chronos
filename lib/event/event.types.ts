export interface CreateEventInput {
  title: string
  description?: string | null
  startAt: string
  endAt?: string | null
  isAllDay?: boolean
  location?: string | null
  color?: string | null
}

export interface UpdateEventInput {
  title?: string
  description?: string | null
  startAt?: string
  endAt?: string | null
  isAllDay?: boolean
  location?: string | null
  color?: string
}
