import type { ContactSubmissionRequest } from './contacts.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

function contactSubmissionsUrl(): string {
  return `${API_BASE_URL.replace(/\/$/, '')}/contact-submissions`;
}

export async function createContactSubmission(
  submission: ContactSubmissionRequest,
): Promise<boolean> {
  try {
    const response = await fetch(contactSubmissionsUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: submission.name, email: submission.email }),
    });

    return response.status === 201;
  } catch {
    return false;
  }
}
