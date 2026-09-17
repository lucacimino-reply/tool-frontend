export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface AuthenticatedCustomer {
  customer: Customer;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest extends LoginRequest {
  name: string;
  termsAccepted: true;
}

export type FieldErrors = Record<string, string>;

export class AuthApiError extends Error {
  constructor(public readonly status: number, public readonly fieldErrors: FieldErrors = {}, message = 'Unable to continue. Please try again.') {
    super(message);
  }
}
