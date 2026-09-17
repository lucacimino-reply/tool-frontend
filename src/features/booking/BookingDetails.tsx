import { useState } from 'react';

import { ACCESS_METHODS, EXTRAS, FREQUENCIES, type AccessMethod, type BookingDraft, type Extra, type Frequency } from './booking.types';

interface BookingDetailsProps { draft: BookingDraft; quoteErrors: Record<string, string>; onDraftChange: (draft: BookingDraft) => void; onNext: () => void; }
const frequencyLabels: Record<Frequency, string> = { onetime: 'Onetime', weekly: 'Weekly', every_2_weeks: 'Every 2 weeks', every_4_weeks: 'Every 4 weeks' };
const accessLabels: Record<AccessMethod, string> = { someone_is_home: 'Someone is home', doorman: 'Doorman', hidden_key: 'Hidden Key', others: 'Others' };
const extraLabels: Record<Extra, string> = { inside_fridge: 'Inside fridge ($25.00)', inside_oven: 'Inside oven ($20.00)', inside_cabinets: 'Inside Cabinets ($25.00)' };

function validate(draft: BookingDraft) {
  const errors: Record<string, string> = {};
  const required255 = (key: string, value: string | undefined, label: string) => {
    const trimmed = value?.trim() ?? '';
    if (!trimmed) errors[key] = `${label} is required.`;
    else if (trimmed.length > 255) errors[key] = `${label} must be 255 characters or fewer.`;
  };
  required255('address', draft.address, 'Address');
  if ((draft.apartmentNumber?.trim().length ?? 0) > 255) errors.apartmentNumber = 'Apartment number must be 255 characters or fewer.';
  if ((draft.additionalNotes?.trim().length ?? 0) > 2000) errors.additionalNotes = 'Additional Notes must be 2,000 characters or fewer.';
  if (draft.hasPets) required255('petDescription', draft.petDescription, 'Pet description');
  return errors;
}

export function BookingDetails({ draft, quoteErrors, onDraftChange, onNext }: BookingDetailsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = (changes: Partial<BookingDraft>) => onDraftChange({ ...draft, ...changes });
  const showError = (name: string) => errors[name] ?? quoteErrors[name] ?? quoteErrors[`details.${name}`];
  function continueToCheckout() { const nextErrors = validate(draft); setErrors(nextErrors); if (Object.keys(nextErrors).length === 0) onNext(); }
  function toggleExtra(extra: Extra) { const extras = draft.details.extras.includes(extra) ? draft.details.extras.filter((item) => item !== extra) : [...draft.details.extras, extra]; update({ details: { ...draft.details, extras } }); }
  return <section className="booking-details" aria-labelledby="details-heading">
    <h1 id="details-heading">Select Frequency</h1><p className="stage-copy">Book recurring service and save with every visit.</p>
    <fieldset className="detail-choices"><legend>Recurring</legend><div>{FREQUENCIES.map((frequency) => <button type="button" key={frequency} className={draft.details.frequency === frequency ? 'selected' : ''} aria-pressed={draft.details.frequency === frequency} onClick={() => update({ details: { ...draft.details, frequency } })}>{frequencyLabels[frequency]}</button>)}</div></fieldset>
    <h2>Add Your Address &amp; Details</h2><p className="stage-copy">Be specific of any additional details we might need from you.</p>
    <div className="address-fields"><Field label="Address" name="address" value={draft.address ?? ''} error={showError('address')} onChange={(address) => update({ address })} /><Field label="Apt. Number" name="apartmentNumber" value={draft.apartmentNumber ?? ''} error={showError('apartmentNumber')} onChange={(apartmentNumber) => update({ apartmentNumber })} /></div>
    <fieldset className="detail-choices"><legend>How do we get in?</legend><div>{ACCESS_METHODS.map((accessMethod) => <button type="button" key={accessMethod} className={draft.accessMethod === accessMethod ? 'selected' : ''} aria-pressed={draft.accessMethod === accessMethod} onClick={() => update({ accessMethod })}>{accessLabels[accessMethod]}</button>)}</div></fieldset>
    <fieldset className="detail-choices extras"><legend>Extra Cleaning</legend><div>{EXTRAS.map((extra) => <button type="button" key={extra} className={draft.details.extras.includes(extra) ? 'selected' : ''} aria-pressed={draft.details.extras.includes(extra)} onClick={() => toggleExtra(extra)}>{extraLabels[extra]}</button>)}</div></fieldset>
    <fieldset className="detail-choices pets"><legend>Any pets?</legend><div>{[true, false].map((hasPets) => <button type="button" key={String(hasPets)} className={draft.hasPets === hasPets ? 'selected' : ''} aria-pressed={draft.hasPets === hasPets} onClick={() => update(hasPets ? { hasPets: true } : { hasPets: false, petDescription: undefined })}>{hasPets ? 'Yes' : 'No'}</button>)}</div></fieldset>
    {draft.hasPets && <Field label="Pet description" name="petDescription" value={draft.petDescription ?? ''} error={showError('petDescription')} onChange={(petDescription) => update({ petDescription })} />}
    <Field label="Additional Notes" name="additionalNotes" value={draft.additionalNotes ?? ''} error={showError('additionalNotes')} multiline onChange={(additionalNotes) => update({ additionalNotes })} />
    <button className="next-button" type="button" onClick={continueToCheckout}>Next</button>
  </section>;
}

function Field({ label, name, value, error, multiline = false, onChange }: { label: string; name: string; value: string; error?: string; multiline?: boolean; onChange: (value: string) => void }) {
  return <label className="detail-field">{label}{multiline ? <textarea aria-label={label} name={name} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} /> : <input aria-label={label} name={name} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} />}{error && <span className="booking-field-error" role="alert">{error}</span>}</label>;
}
