import type { BookingQuote, BookingQuoteRequest } from './booking.types';

export class QuoteRequestError extends Error {
  constructor(public readonly status: number, public readonly fieldErrors: Record<string, string> = {}, message = 'We could not update your appointment value. Please try again.') { super(message); }
}

export async function quoteBooking(request: BookingQuoteRequest): Promise<BookingQuote> {
  const response = await fetch('/api/booking-quotes', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const problem = body as { message?: string; fieldErrors?: Record<string, string> };
    throw new QuoteRequestError(response.status, problem.fieldErrors ?? {}, problem.message);
  }
  return body as BookingQuote;
}
