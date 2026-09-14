export type ContactField = 'name' | 'email'

export type ContactValues = Record<ContactField, string>

export type ContactErrors = Partial<Record<ContactField, string>>
