import { AuthApiError, type AuthenticatedCustomer, type LoginRequest, type SignUpRequest } from './auth.types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  if (response.ok) return response.json() as Promise<T>;

  const problem: { message?: string; fieldErrors?: Record<string, string> } = await response.json().catch(() => ({}));
  throw new AuthApiError(response.status, problem.fieldErrors, problem.message);
}

export function getSession() {
  return request<AuthenticatedCustomer>('/auth/session');
}

export function logIn(credentials: LoginRequest) {
  return request<AuthenticatedCustomer>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
}

export function signUp(credentials: SignUpRequest) {
  return request<AuthenticatedCustomer>('/auth/signup', { method: 'POST', body: JSON.stringify(credentials) });
}
