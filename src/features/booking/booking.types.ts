import type { CleanType, Location, RoomCount } from '../home/home.types';

export type BookingStep = 1 | 2 | 3 | 4 | 5;
export const FIXED_ARRIVAL_TIMES = [
  '08:00am', '08:30am', '09:00am', '09:30am', '10:00am', '10:30am',
  '11:00am', '11:30am', '12:00pm', '12:30pm', '01:00pm', '01:30pm',
  '02:00pm', '02:30pm', '03:00pm', '03:30pm', '04:00pm',
] as const;

export type FixedArrivalTime = (typeof FIXED_ARRIVAL_TIMES)[number];
export type ArrivalSelection = { type: 'flexible' } | { type: 'fixed'; time: FixedArrivalTime };
export const FREQUENCIES = ['onetime', 'weekly', 'every_2_weeks', 'every_4_weeks'] as const;
export const ACCESS_METHODS = ['someone_is_home', 'doorman', 'hidden_key', 'others'] as const;
export const EXTRAS = ['inside_fridge', 'inside_oven', 'inside_cabinets'] as const;
export type Frequency = (typeof FREQUENCIES)[number];
export type AccessMethod = (typeof ACCESS_METHODS)[number];
export type Extra = (typeof EXTRAS)[number];

export interface BookingDraft {
  service: { location: Location; rooms: RoomCount; cleanType: CleanType };
  arrival: ArrivalSelection;
  details: { frequency: Frequency; extras: Extra[] };
  promoCode?: string;
  schedule?: { date: string; customerTimeZone: string };
  address?: string;
  apartmentNumber?: string;
  accessMethod?: AccessMethod;
  hasPets?: boolean;
  petDescription?: string;
  additionalNotes?: string;
}

export interface BookingQuoteRequest {
  service: { location: 'studio' | 'house' | 'commercial' | 'residential'; rooms: RoomCount; cleanType: 'standard' | 'deep_clean' | 'moving_in_out' | 'post_construction' };
  arrival: ArrivalSelection;
  details: BookingDraft['details'];
  promoCode?: string;
}

export interface BillingSnapshot {
  currency: 'USD';
  baseService: string;
  flexibleDiscount: string;
  extrasTotal: string;
  frequencyDiscount: string;
  appointmentValue: string;
  promoCode?: string;
  promoDiscount: string;
  subtotal: string;
  tax: string;
  total: string;
}

export interface BookingQuote { billing: BillingSnapshot }

export type ContactPreference = 'text' | 'call' | 'email';

export interface PaymentInput {
  cardNumber: string;
  expiry: string;
  cvv: string;
  fullName: string;
  email: string;
  phone: string;
  contactPreference: ContactPreference;
}

export interface CreateBookingRequest {
  service: BookingQuoteRequest['service'];
  schedule: { date: string; customerTimeZone: string; arrival: ArrivalSelection };
  details: {
    frequency: Frequency;
    address: string;
    apartmentNumber?: string;
    accessMethod: AccessMethod;
    extras: Extra[];
    hasPets: boolean;
    petDescription?: string;
    additionalNotes?: string;
  };
  promoCode?: string;
  payment: PaymentInput;
}

export interface CompletedBooking {
  id: string;
  customer: { id: string; name: string; email: string };
  service: CreateBookingRequest['service'];
  schedule: CreateBookingRequest['schedule'];
  details: Omit<CreateBookingRequest['details'], 'extras'> & { extras: Array<{ name: Extra; price: string }> };
  contact: Omit<PaymentInput, 'cardNumber' | 'expiry' | 'cvv'> & { cardLastFour: string };
  billing: BillingSnapshot;
  createdAt: string;
}

export function createBookingDraft(service: BookingDraft['service']): BookingDraft {
  const now = new Date();
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  return {
    service,
    arrival: { type: 'flexible' },
    details: { frequency: 'onetime', extras: [] },
    address: '',
    accessMethod: 'someone_is_home',
    hasPets: false,
    schedule: { date, customerTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  };
}

export function toBookingQuoteRequest(draft: BookingDraft): BookingQuoteRequest {
  const location = { Studio: 'studio', House: 'house', Commercial: 'commercial', Residential: 'residential' } as const;
  const cleanType = { Standard: 'standard', 'Deep Clean': 'deep_clean', 'Moving In/Out': 'moving_in_out', 'Post Construction': 'post_construction' } as const;
  const promoCode = draft.promoCode?.trim();
  return { service: { location: location[draft.service.location], rooms: draft.service.rooms, cleanType: cleanType[draft.service.cleanType] }, arrival: draft.arrival, details: draft.details, ...(promoCode ? { promoCode } : {}) };
}

export function toCreateBookingRequest(draft: BookingDraft, payment: PaymentInput): CreateBookingRequest {
  if (!draft.schedule || !draft.accessMethod || draft.hasPets === undefined) throw new Error('Your booking details are incomplete.');
  const quote = toBookingQuoteRequest(draft);
  const optional = (value: string | undefined) => value?.trim() || undefined;
  return {
    service: quote.service,
    schedule: { ...draft.schedule, customerTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, arrival: draft.arrival },
    details: {
      frequency: draft.details.frequency,
      address: draft.address?.trim() ?? '',
      ...(optional(draft.apartmentNumber) ? { apartmentNumber: optional(draft.apartmentNumber) } : {}),
      accessMethod: draft.accessMethod,
      extras: draft.details.extras,
      hasPets: draft.hasPets,
      ...(draft.hasPets && optional(draft.petDescription) ? { petDescription: optional(draft.petDescription) } : {}),
      ...(optional(draft.additionalNotes) ? { additionalNotes: optional(draft.additionalNotes) } : {}),
    },
    ...(quote.promoCode ? { promoCode: quote.promoCode } : {}),
    payment,
  };
}
