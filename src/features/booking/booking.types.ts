import type { CleanType, Location, RoomCount } from '../home/home.types';

export type BookingStep = 1 | 2 | 3 | 4 | 5;
export const FIXED_ARRIVAL_TIMES = [
  '08:00am', '08:30am', '09:00am', '09:30am', '10:00am', '10:30am',
  '11:00am', '11:30am', '12:00pm', '12:30pm', '01:00pm', '01:30pm',
  '02:00pm', '02:30pm', '03:00pm', '03:30pm', '04:00pm',
] as const;

export type FixedArrivalTime = (typeof FIXED_ARRIVAL_TIMES)[number];
export type ArrivalSelection = { type: 'flexible' } | { type: 'fixed'; time: FixedArrivalTime };

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
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  return {
    service,
    arrival: { type: 'flexible' },
    details: { frequency: 'onetime', extras: [] },
    schedule: { date, customerTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  };
}

export function toBookingQuoteRequest(draft: BookingDraft): BookingQuoteRequest {
  return { service: draft.service, arrival: draft.arrival, details: draft.details, ...(draft.promoCode ? { promoCode: draft.promoCode } : {}) };
}
