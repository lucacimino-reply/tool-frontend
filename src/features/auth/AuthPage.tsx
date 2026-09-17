import { useState, type FormEvent } from 'react';

import { AuthApiError, type AuthenticatedCustomer, type FieldErrors } from './auth.types';
import { logIn, signUp } from './auth.api';

type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSuccess: (customer: AuthenticatedCustomer) => void;
  onExit: () => void;
}

function credentialErrors(mode: AuthMode, name: string, email: string, password: string, termsAccepted: boolean): FieldErrors {
  const errors: FieldErrors = {};
  if (mode === 'signup') {
    if (!name.trim()) errors.name = 'Enter your name.';
    else if (name.trim().length > 100) errors.name = 'Name must be 100 characters or fewer.';
  }
  if (!email.trim()) errors.email = 'Enter your email address.';
  else if (email.trim().length > 254) errors.email = 'Email must be 254 characters or fewer.';
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (password.length < 8 || password.length > 64) errors.password = 'Password must be between 8 and 64 characters.';
  if (mode === 'signup' && !termsAccepted) errors.termsAccepted = 'You must accept the Terms of Service and Privacy Policy.';
  return errors;
}

export function AuthPage({ mode, onModeChange, onSuccess, onExit }: AuthPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const isSignup = mode === 'signup';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = credentialErrors(mode, name, email, password, termsAccepted);
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setSubmitting(true);
    setErrors({});
    try {
      const customer = isSignup
        ? await signUp({ name: name.trim(), email: email.trim(), password, termsAccepted: true })
        : await logIn({ email: email.trim(), password });
      onSuccess(customer);
    } catch (error) {
      if (error instanceof AuthApiError) {
        if (!isSignup && error.status === 401) setErrors({ email: 'The email or password you entered is incorrect.' });
        else if (Object.keys(error.fieldErrors).length) setErrors(error.fieldErrors);
        else setErrors({ form: 'Unable to continue. Please try again.' });
      } else setErrors({ form: 'Unable to continue. Please try again.' });
    } finally { setSubmitting(false); }
  }

  function fieldError(field: string) { return errors[field] && <p className="field-error" id={`${field}-error`}>{errors[field]}</p>; }

  return <main className="auth-page">
    <button className="auth-wordmark" type="button" onClick={onExit} aria-label="Clean home">Clean<span>✦</span></button>
    <form className="auth-form" onSubmit={submit} noValidate>
      <h1>{isSignup ? 'Sign up' : 'Login'}</h1>
      {isSignup && <label>Name<input aria-describedby={errors.name ? 'name-error' : undefined} aria-invalid={Boolean(errors.name)} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />{fieldError('name')}</label>}
      <label>Email<input aria-describedby={errors.email ? 'email-error' : undefined} aria-invalid={Boolean(errors.email)} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" inputMode="email" />{fieldError('email')}</label>
      <label>{isSignup ? 'Enter New Password' : 'Password'}<span className="password-input"><input aria-describedby={errors.password ? 'password-error' : undefined} aria-invalid={Boolean(errors.password)} type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignup ? 'new-password' : 'current-password'} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>◉</button></span>{fieldError('password')}</label>
      {isSignup && <label className="consent"><input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} /> <span>I agree to the <a href="#terms" onClick={(event) => event.preventDefault()}>Terms of Service</a> and <a href="#privacy" onClick={(event) => event.preventDefault()}>Privacy Policy</a></span>{fieldError('termsAccepted')}</label>}
      {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
      <button className="continue-button" type="submit" disabled={submitting}>{submitting ? 'Continuing...' : 'Continue'}</button>
      <p className="account-switch">{isSignup ? 'Already have an account? ' : "Don't have an account? "}<button type="button" onClick={() => onModeChange(isSignup ? 'login' : 'signup')}>{isSignup ? 'Login' : 'Sign up'}</button></p>
    </form>
  </main>;
}
