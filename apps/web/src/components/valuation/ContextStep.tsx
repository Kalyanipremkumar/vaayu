import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const CONDITION_KEYS: ArtworkCondition[] = ['excellent', 'good', 'fair', 'poor'];
const CONDITION_LABEL_KEYS: Record<ArtworkCondition, string> = {
  excellent: 'wizard.condExcellent',
  good: 'wizard.condGood',
  fair: 'wizard.condFair',
  poor: 'wizard.condPoor',
};
const PURPOSE_LABEL_KEYS: Record<ValuationPurpose, string> = {
  fair_market: 'wizard.purposeFairMarket',
  insurance: 'wizard.purposeInsurance',
  auction: 'wizard.purposeAuction',
};

/** Step 2 — collect the context the pricing engine needs. */
export function ContextStep() {
  const { t } = useTranslation();
  const store = useValuationStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const conditionOptions: SelectOption[] = CONDITION_KEYS.map((key) => ({
    value: key,
    label: t(CONDITION_LABEL_KEYS[key]),
  }));
  const purposeOptions: SelectOption[] = VALUATION_PURPOSES.map((p) => ({
    value: p.key,
    label: t(PURPOSE_LABEL_KEYS[p.key as ValuationPurpose] ?? p.label),
  }));

  function validateAndContinue() {
    const next: Record<string, string> = {};
    if (!store.tradition) next.tradition = t('wizard.errTradition');
    if (!store.medium) next.medium = t('wizard.errMedium');
    if (!(store.dimensions.heightCm > 0)) next.height = t('wizard.errHeight');
    if (!(store.dimensions.widthCm > 0)) next.width = t('wizard.errWidth');
    if (store.artistKnown && !store.artistName.trim()) {
      next.artistName = t('wizard.errArtist');
    }
    setErrors(next);
    if (Object.keys(next).length === 0) store.setStep('review');
  }

  return (
    <div className="flex flex-col gap-5">
      <SelectField
        label={t('wizard.fieldTradition')}
        name="tradition"
        placeholder={t('wizard.selectTradition')}
        options={traditionOptions}
        value={store.tradition}
        error={errors.tradition}
        onChange={(e) => store.update({ tradition: e.target.value })}
      />

      <SelectField
        label={t('wizard.fieldMedium')}
        name="medium"
        placeholder={t('wizard.selectMedium')}
        options={mediumOptions}
        value={store.medium}
        error={errors.medium}
        onChange={(e) => store.update({ medium: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label={t('wizard.fieldHeight')}
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
          label={t('wizard.fieldWidth')}
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
        label={t('wizard.fieldYear')}
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
        label={t('wizard.fieldCondition')}
        name="condition"
        options={conditionOptions}
        value={store.condition}
        onChange={(e) => store.update({ condition: e.target.value as ArtworkCondition })}
      />

      <SelectField
        label={t('wizard.fieldPurpose')}
        name="purpose"
        options={purposeOptions}
        value={store.purpose}
        onChange={(e) => store.update({ purpose: e.target.value as ValuationPurpose })}
      />

      <div className="flex flex-col gap-2">
        <TextField
          label={t('wizard.fieldArtist')}
          name="artistName"
          value={store.artistName}
          disabled={!store.artistKnown}
          error={errors.artistName}
          placeholder={store.artistKnown ? '' : t('wizard.unknown')}
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
          {t('wizard.dontKnowArtist')}
        </label>
      </div>

      <TextAreaField
        label={t('wizard.fieldProvenance')}
        name="provenance"
        hint={t('wizard.provenanceHint')}
        value={store.provenanceNotes}
        onChange={(e) => store.update({ provenanceNotes: e.target.value })}
      />

      <div className="mt-2 flex justify-between">
        <Button variant="ghost" onClick={() => store.setStep('upload')}>
          {t('common.back')}
        </Button>
        <Button onClick={validateAndContinue}>{t('wizard.continueReview')}</Button>
      </div>
    </div>
  );
}
