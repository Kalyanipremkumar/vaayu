import { useState } from 'react';
import {
  MEDIUMS,
  TRADITIONS,
  VALUATION_PURPOSES,
  type ArtworkCondition,
  type ValuationPurpose,
} from '@vaayu/shared';
import { Button } from '../Button';
import { SelectField, type SelectOption } from '../SelectField';
import { TextField } from '../TextField';
import { TextAreaField } from '../TextAreaField';
import { useValuationStore } from '../../store/valuationStore';

const traditionOptions: SelectOption[] = TRADITIONS.map((t) => ({ value: t.key, label: t.label }));
const mediumOptions: SelectOption[] = MEDIUMS.map((m) => ({ value: m.key, label: m.label }));
const conditionOptions: SelectOption[] = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];
const purposeOptions: SelectOption[] = VALUATION_PURPOSES.map((p) => ({
  value: p.key,
  label: p.label,
}));

/** Step 2 — collect the context the pricing engine needs. */
export function ContextStep() {
  const store = useValuationStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateAndContinue() {
    const next: Record<string, string> = {};
    if (!store.tradition) next.tradition = 'Please choose a tradition or style.';
    if (!store.medium) next.medium = 'Please choose a medium.';
    if (!(store.dimensions.heightCm > 0)) next.height = 'Enter a height greater than 0.';
    if (!(store.dimensions.widthCm > 0)) next.width = 'Enter a width greater than 0.';
    if (store.artistKnown && !store.artistName.trim()) {
      next.artistName = 'Enter the artist’s name, or tick “I don’t know”.';
    }
    setErrors(next);
    if (Object.keys(next).length === 0) store.setStep('review');
  }

  return (
    <div className="flex flex-col gap-5">
      <SelectField
        label="Tradition / style"
        name="tradition"
        placeholder="Select a tradition"
        options={traditionOptions}
        value={store.tradition}
        error={errors.tradition}
        onChange={(e) => store.update({ tradition: e.target.value })}
      />

      <SelectField
        label="Medium"
        name="medium"
        placeholder="Select a medium"
        options={mediumOptions}
        value={store.medium}
        error={errors.medium}
        onChange={(e) => store.update({ medium: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Height (cm)"
          name="height"
          type="number"
          min={0}
          step="0.1"
          value={store.dimensions.heightCm || ''}
          error={errors.height}
          onChange={(e) =>
            store.update({
              dimensions: { ...store.dimensions, heightCm: Number(e.target.value) },
            })
          }
        />
        <TextField
          label="Width (cm)"
          name="width"
          type="number"
          min={0}
          step="0.1"
          value={store.dimensions.widthCm || ''}
          error={errors.width}
          onChange={(e) =>
            store.update({
              dimensions: { ...store.dimensions, widthCm: Number(e.target.value) },
            })
          }
        />
      </div>

      <TextField
        label="Year created (optional)"
        name="year"
        type="number"
        min={0}
        max={2100}
        value={store.yearCreated ?? ''}
        onChange={(e) =>
          store.update({ yearCreated: e.target.value ? Number(e.target.value) : null })
        }
      />

      <SelectField
        label="Condition"
        name="condition"
        options={conditionOptions}
        value={store.condition}
        onChange={(e) => store.update({ condition: e.target.value as ArtworkCondition })}
      />

      <SelectField
        label="Valuation for"
        name="purpose"
        options={purposeOptions}
        value={store.purpose}
        onChange={(e) => store.update({ purpose: e.target.value as ValuationPurpose })}
      />

      <div className="flex flex-col gap-2">
        <TextField
          label="Artist name"
          name="artistName"
          value={store.artistName}
          disabled={!store.artistKnown}
          error={errors.artistName}
          placeholder={store.artistKnown ? '' : 'Unknown'}
          onChange={(e) => store.update({ artistName: e.target.value })}
        />
        <label className="flex items-center gap-2 font-body text-sm text-muted">
          <input
            type="checkbox"
            checked={!store.artistKnown}
            onChange={(e) =>
              store.update({
                artistKnown: !e.target.checked,
                ...(e.target.checked ? { artistName: '' } : {}),
              })
            }
            className="h-4 w-4 rounded border-border text-ink focus:ring-gold"
          />
          I don’t know the artist
        </label>
      </div>

      <TextAreaField
        label="Provenance notes (optional)"
        name="provenance"
        hint="Acquisition history, exhibitions, certificates — anything that documents the work."
        value={store.provenanceNotes}
        onChange={(e) => store.update({ provenanceNotes: e.target.value })}
      />

      <div className="mt-2 flex justify-between">
        <Button variant="ghost" onClick={() => store.setStep('upload')}>
          Back
        </Button>
        <Button onClick={validateAndContinue}>Continue to review</Button>
      </div>
    </div>
  );
}
