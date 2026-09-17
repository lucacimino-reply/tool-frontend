import { useState } from 'react';

import { CLEAN_TYPES, LOCATIONS, ROOM_COUNTS, type CleanType, type Location, type RoomCount } from '../home/home.types';
import type { BookingDraft } from './booking.types';

interface BookingStepOneProps {
  draft: BookingDraft;
  onDraftChange: (draft: BookingDraft) => void;
  onNext: () => void;
}

export function BookingStepOne({ draft, onDraftChange, onNext }: BookingStepOneProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selection = draft.service;
  function updateService(next: BookingDraft['service']) {
    onDraftChange({ ...draft, service: next });
    setErrors({});
  }
  function continueToSchedule() {
    const nextErrors: Record<string, string> = {};
    if (!selection.location) nextErrors.location = 'Select a location.';
    if (!selection.rooms) nextErrors.rooms = 'Select the number of rooms.';
    if (!selection.cleanType) nextErrors.cleanType = 'Select a clean type.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onNext();
  }
  return <section className="requirements" aria-labelledby="requirements-heading"><h1 id="requirements-heading">Customize Your<br />Requirements</h1>
    <ChoiceGroup title="Location" values={LOCATIONS} selected={selection.location} error={errors.location} onSelect={(location) => updateService({ ...selection, location: location as Location })} />
    <ChoiceGroup title="Number of Rooms" values={ROOM_COUNTS} selected={selection.rooms} error={errors.rooms} onSelect={(rooms) => updateService({ ...selection, rooms: Number(rooms) as RoomCount })} compact />
    <ChoiceGroup title="Clean Type" values={CLEAN_TYPES.map((item) => item.name)} selected={selection.cleanType} error={errors.cleanType} onSelect={(cleanType) => updateService({ ...selection, cleanType: cleanType as CleanType })} estimates />
    <button className="next-button" type="button" onClick={continueToSchedule}>Next</button>
  </section>;
}

function ChoiceGroup({ title, values, selected, error, onSelect, compact = false, estimates = false }: { title: string; values: readonly (string | number)[]; selected: string | number; error?: string; onSelect: (value: string | number) => void; compact?: boolean; estimates?: boolean }) {
  return <fieldset className={`choice-group ${compact ? 'compact' : ''}`}><legend>{title}</legend><div>{values.map((value) => <div key={value}><button className={value === selected ? 'selected' : ''} type="button" aria-pressed={value === selected} onClick={() => onSelect(value)}>{value}</button>{estimates && <small>{CLEAN_TYPES.find((type) => type.name === value)?.estimate.replace('Estimated ', '')}</small>}</div>)}</div>{error && <p className="booking-field-error" role="alert">{error}</p>}</fieldset>;
}
