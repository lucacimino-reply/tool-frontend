import type { CleanType, Location, RoomCount } from '../home/home.types';

export type BookingStep = 1 | 2 | 3 | 4 | 5;
export type ArrivalSelection = { type: 'flexible' } | { type: 'fixed'; time: string };

export interface BookingDraft {
  service: { location: Location; rooms: RoomCount; cleanType: CleanType };
  arrival: ArrivalSelection;
  details: { frequency: 'onetime' | 'weekly' | 'biweekly' | 'monthly'; extras: string[] };
  promoCode?: string;
  schedule?: { date: string; customerTimeZone: string };
  address?: string;
  apartmentNumber?: string;
  accessMethod?: 'home' | 'doorman' | 'hidden_key' | 'other';
  hasPets?: boolean;
  petDescription?: string;
  additionalNotes?: string;
}

export interface BookingQuoteRequest {
  service: BookingDraft['service'];
  arrival: ArrivalSelection;
  details: BookingDraft['details'];
  promoCode?: string;
}

export function createBookingDraft(service: BookingDraft['service']): BookingDraft {
  return { service, arrival: { type: 'flexible' }, details: { frequency: 'onetime', extras: [] } };
}

export function toBookingQuoteRequest(draft: BookingDraft): BookingQuoteRequest {
  return { service: draft.service, arrival: draft.arrival, details: draft.details, ...(draft.promoCode ? { promoCode: draft.promoCode } : {}) };
}
