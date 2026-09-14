import type { ContactValues } from './contacts.types'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

export async function createSubmission(values: ContactValues): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      body: JSON.stringify({ name: values.name, email: values.email }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })

    return response?.status === 201
  } catch {
    return false
  }
}
