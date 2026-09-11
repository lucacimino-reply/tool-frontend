export interface ContactSubmissionRequest {
  name: string;
  email: string;
}

export interface ContactFormProps {
  onSubmissionSuccess?: () => void;
  submitContact?: (submission: ContactSubmissionRequest) => Promise<boolean>;
}

export interface ContactsPageProps {
  onSubmissionSuccess?: () => void;
}

export interface FieldErrors {
  name?: string;
  email?: string;
}
