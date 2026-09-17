import { CLEAN_TYPES, LOCATIONS, ROOM_COUNTS, type CleanType, type Location, type RoomCount } from '../home/home.types';
import type { HomeSelection } from '../home/HomePage';

interface BookingStepOneProps {
  selection: HomeSelection;
  onSelectionChange: (selection: HomeSelection) => void;
  onExit: () => void;
}

export function BookingStepOne({ selection, onSelectionChange, onExit }: BookingStepOneProps) {
  return <main className="booking-page">
    <header className="booking-summary"><button type="button" onClick={onExit} aria-label="Abandon booking">×</button><div><strong>{selection.location}</strong><span>Location</span></div><div><strong>{selection.rooms}</strong><span>Rooms</span></div><div><strong>{selection.cleanType}</strong><span>Clean Type</span></div><div><strong>--</strong><span>Schedule Date</span></div><div><strong>--</strong><span>Address</span></div><aside>$0<span>Total</span></aside></header>
    <section className="requirements" aria-labelledby="requirements-heading"><h1 id="requirements-heading">Customize Your<br />Requirements</h1>
      <ChoiceGroup title="Location" values={LOCATIONS} selected={selection.location} onSelect={(location) => onSelectionChange({ ...selection, location: location as Location })} />
      <ChoiceGroup title="Number of Rooms" values={ROOM_COUNTS} selected={selection.rooms} onSelect={(rooms) => onSelectionChange({ ...selection, rooms: Number(rooms) as RoomCount })} compact />
      <ChoiceGroup title="Clean Type" values={CLEAN_TYPES.map((item) => item.name)} selected={selection.cleanType} onSelect={(cleanType) => onSelectionChange({ ...selection, cleanType: cleanType as CleanType })} />
      <button className="next-button" type="button">Next</button>
    </section>
  </main>;
}

function ChoiceGroup({ title, values, selected, onSelect, compact = false }: { title: string; values: readonly (string | number)[]; selected: string | number; onSelect: (value: string | number) => void; compact?: boolean }) {
  return <fieldset className={`choice-group ${compact ? 'compact' : ''}`}><legend>{title}</legend><div>{values.map((value) => <button className={value === selected ? 'selected' : ''} type="button" key={value} onClick={() => onSelect(value)}>{value}</button>)}</div></fieldset>;
}
