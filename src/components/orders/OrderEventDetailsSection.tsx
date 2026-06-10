import { FieldLabel, Input, Select, Textarea } from '../ui/Input';
import type { DietaryPreference } from '../../lib/order-receipt';
import { MEAL_TYPES } from '../../types';

interface OrderEventDetailsSectionProps {
  eventDate: string;
  eventTime: string;
  mealType: string;
  dietaryPreference: DietaryPreference;
  persons: string;
  eventAddress: string;
  onEventDateChange: (v: string) => void;
  onEventTimeChange: (v: string) => void;
  onMealTypeChange: (v: string) => void;
  onDietaryPreferenceChange: (v: DietaryPreference) => void;
  onPersonsChange: (v: string) => void;
  onEventAddressChange: (v: string) => void;
}

const dateTimeFieldClass = 'field-datetime';

export function OrderEventDetailsSection({
  eventDate,
  eventTime,
  mealType,
  dietaryPreference,
  persons,
  eventAddress,
  onEventDateChange,
  onEventTimeChange,
  onMealTypeChange,
  onDietaryPreferenceChange,
  onPersonsChange,
  onEventAddressChange,
}: OrderEventDetailsSectionProps) {
  return (
    <section className="space-y-3 rounded-md border border-ledger-200 bg-surface p-3 sm:space-y-3 sm:p-4">
      <div>
        <h3 className="text-sm font-semibold text-ledger-900">Event details</h3>
        <p className="mt-0.5 hidden text-sm text-ledger-700 sm:block">
          When and where the catering will be served.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        <div className="min-w-0">
          <FieldLabel htmlFor="ord-event">Event date</FieldLabel>
          <Input
            id="ord-event"
            type="date"
            value={eventDate}
            onChange={(e) => onEventDateChange(e.target.value)}
            required
            className={dateTimeFieldClass}
          />
        </div>
        <div className="min-w-0">
          <FieldLabel htmlFor="ord-time">Event time</FieldLabel>
          <Input
            id="ord-time"
            type="time"
            value={eventTime}
            onChange={(e) => onEventTimeChange(e.target.value)}
            required
            className={dateTimeFieldClass}
          />
        </div>
        <div className="min-w-0">
          <FieldLabel htmlFor="ord-meal">Meal</FieldLabel>
          <Select id="ord-meal" value={mealType} onChange={(e) => onMealTypeChange(e.target.value)}>
            {MEAL_TYPES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-0">
          <FieldLabel htmlFor="ord-dietary">Dietary</FieldLabel>
          <Select
            id="ord-dietary"
            value={dietaryPreference}
            onChange={(e) => onDietaryPreferenceChange(e.target.value as DietaryPreference)}
          >
            <option value="regular">Regular</option>
            <option value="without_onion_garlic">No onion/garlic</option>
          </Select>
        </div>
        <div className="min-w-0">
          <FieldLabel htmlFor="ord-persons">Persons</FieldLabel>
          <Input
            id="ord-persons"
            type="number"
            min={1}
            value={persons}
            onChange={(e) => onPersonsChange(e.target.value)}
            required
            className="w-full font-mono"
          />
        </div>
        <div className="col-span-2 min-w-0">
          <FieldLabel htmlFor="ord-venue">Event address</FieldLabel>
          <Textarea
            id="ord-venue"
            value={eventAddress}
            onChange={(e) => onEventAddressChange(e.target.value)}
            required
            rows={2}
            className="w-full min-w-0"
          />
        </div>
      </div>
    </section>
  );
}
