import { NextResponse } from 'next/server'

export class NotFoundError extends Error {
  constructor(message = 'Not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function toErrorResponse(e: unknown): NextResponse | null {
  if (e instanceof ValidationError) return NextResponse.json({ error: e.message }, { status: 422 })
  if (e instanceof NotFoundError) return NextResponse.json({ error: e.message }, { status: 404 })
  if (e instanceof ForbiddenError) return NextResponse.json({ error: e.message }, { status: 403 })
  return null
}
