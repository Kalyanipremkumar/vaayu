import { useRef, useState, type DragEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ART_COMPLEXITIES,
  CAREER_STAGES,
  CM_PER_INCH,
  GALLERY_CUT_RANGE,
  MARKET_POSITIONINGS,
  MEDIUMS,
  PRICING_POSTURES,
  SELLING_CHANNELS,
  TRADITIONS,
  type ArtComplexity,
  type ArtworkCondition,
  type CareerStage,
  type EditionType,
  type MarketPositioning,
  type PricingPosture,
  type SellingChannel,
  type SizeUnit,
} from '@vaayu/shared';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { SelectField, type SelectOption } from '../components/SelectField';
import { TextAreaField } from '../components/TextAreaField';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { ArtistResult } from '../components/artist/ArtistResult';
import { validateImageFile } from '../lib/upload';
import { submitArtistPricing } from '../lib/artistPricing';
import { useAuth } from '../hooks/useAuth';

const traditionOptions: SelectOption[] = TRADITIONS.map((t) => ({ value: t.key, label: t.label }));
const mediumOptions: SelectOption[] = MEDIUMS.map((m) => ({ value: m.key, label: m.label }));

/** A titled group of fields. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-6">
      <h2 className="mb-4 font-heading text-xl text-ink">{title}</h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

/**
 * Artist Mode — Phase 1 single-screen pricing calculator. Collects the artist
 * profile, artwork, deeper criteria, and selling intent, then calls the
 * server-side engine and renders the ask/floor/ceiling + channel pricing.
 */
export function ArtistPricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  // Profile
  const [careerStage, setCareerStage] = useState<CareerStage>('mid-career');
  const [yearsSelling, setYearsSelling] = useState(6);
  const [exhibitions3yr, setExhibitions3yr] = useState(4);
  const [institutional, setInstitutional] = useState('');

  // Artwork
  const [tradition, setTradition] = useState('');
  const [medium, setMedium] = useState('');
  const [style, setStyle] = useState('');
  const [sizeUnit, setSizeUnit] = useState<SizeUnit>('in');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [condition, setCondition] = useState<ArtworkCondition>('excellent');
  const [yearCreated, setYearCreated] = useState('');
  const [complexity, setComplexity] = useState<ArtComplexity>('moderate');

  // Criteria
  const [editionType, setEditionType] = useState<EditionType>('unique');
  const [seriesName, setSeriesName] = useState('');
  const [signed, setSigned] = useState(true);
  const [framed, setFramed] = useState(false);

  // Selling intent + positioning
  const [channels, setChannels] = useState<SellingChannel[]>(['gallery', 'direct']);
  const [galleryCutPct, setGalleryCutPct] = useState<number>(GALLERY_CUT_RANGE.default);
  const [posture, setPosture] = useState<PricingPosture>('balanced');
  const [positioning, setPositioning] = useState<MarketPositioning>('standard');

  // Costs & add-ons
  const [materialsCost, setMaterialsCost] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [framingCost, setFramingCost] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [pastSalePrices, setPastSalePrices] = useState('');
  const [recognition, setRecognition] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  /** Convert the entered dimension to centimetres for the engine. */
  const toCm = (v: string) => {
    const n = Number(v) || 0;
    return sizeUnit === 'in' ? n * CM_PER_INCH : n;
  };

  const conditionOptions: SelectOption[] = [
    { value: 'excellent', label: t('wizard.condExcellent') },
    { value: 'good', label: t('wizard.condGood') },
    { value: 'fair', label: t('wizard.condFair') },
    { value: 'poor', label: t('wizard.condPoor') },
  ];
  const editionOptions: SelectOption[] = [
    { value: 'unique', label: t('artist.editionUnique') },
    { value: 'limited', label: t('artist.editionLimited') },
    { value: 'open', label: t('artist.editionOpen') },
  ];

  function acceptFile(file: File) {
    const err = validateImageFile(file);
    if (err) {
      setImageError(err);
      return;
    }
    setImageError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  }

  function toggleChannel(channel: SellingChannel) {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel],
    );
  }

  const mutation = useMutation({
    mutationFn: () => {
      if (!imageFile) throw new Error(t('artist.errImage'));
      if (!user) throw new Error(t('artist.errImage'));
      return submitArtistPricing({
        imageFile,
        userId: user.id,
        careerStage,
        yearsSelling,
        exhibitions3yr,
        institutionalCollectors: institutional,
        tradition,
        medium,
        style,
        dimensions: { heightCm: toCm(height), widthCm: toCm(width) },
        condition,
        yearCreated: yearCreated ? Number(yearCreated) : null,
        complexity,
        editionType,
        seriesName,
        signed,
        framed,
        channels,
        galleryCutPct,
        posture,
        positioning,
        materialsCostInr: materialsCost ? Number(materialsCost) : null,
        hoursWorked: hoursWorked ? Number(hoursWorked) : null,
        hourlyRateInr: hourlyRate ? Number(hourlyRate) : null,
        framingCostInr: framingCost ? Number(framingCost) : null,
        shippingCostInr: shippingCost ? Number(shippingCost) : null,
        pastSalePrices,
        recognition,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['artistPricings'] });
    },
  });

  function handleSubmit() {
    setFormError(null);
    if (!imageFile) return setFormError(t('artist.errImage'));
    if (!tradition) return setFormError(t('wizard.errTradition'));
    if (!medium) return setFormError(t('wizard.errMedium'));
    if (!(Number(height) > 0)) return setFormError(t('wizard.errHeight'));
    if (!(Number(width) > 0)) return setFormError(t('wizard.errWidth'));
    if (channels.length === 0) return setFormError(t('artist.errChannels'));
    mutation.mutate();
  }

  // Result view
  if (mutation.isSuccess && mutation.data) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" className="font-body text-sm text-muted hover:text-ink">
            ← {t('wizard.dashboard')}
          </Link>
          <LanguageSwitcher />
        </div>
        <ArtistResult result={mutation.data} />
        <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
          <Button onClick={() => mutation.reset()}>{t('artist.priceAnother')}</Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            {t('wizard.done')}
          </Button>
        </div>
      </main>
    );
  }

  // Processing view
  if (mutation.isPending) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-ink" />
          <div>
            <p className="font-heading text-2xl text-ink">{t('artist.processingTitle')}</p>
            <p className="mt-2 font-body text-sm text-muted">{t('artist.processingSub')}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/dashboard" className="font-body text-sm text-muted hover:text-ink">
          ← {t('wizard.dashboard')}
        </Link>
        <LanguageSwitcher />
      </div>

      <p className="font-body text-xs uppercase tracking-[0.25em] text-gold">
        {t('artist.kicker')}
      </p>
      <h1 className="mt-2 font-heading text-3xl text-ink">{t('artist.calculatorTitle')}</h1>
      <p className="mt-2 font-body text-sm text-muted">{t('artist.calculatorLead')}</p>

      <div className="mt-8 flex flex-col gap-8">
        {/* Image */}
        <section>
          {previewUrl ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={previewUrl}
                alt={t('artist.artworkPreview')}
                className="max-h-72 w-auto rounded-md border border-border object-contain"
              />
              <Button variant="outline" onClick={() => inputRef.current?.click()}>
                {t('wizard.chooseDifferent')}
              </Button>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
                dragging ? 'border-gold bg-gold/5' : 'border-border bg-cream'
              }`}
            >
              <p className="font-heading text-xl text-ink">{t('wizard.drop')}</p>
              <p className="mt-2 font-body text-sm text-muted">{t('wizard.browse')}</p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) acceptFile(file);
              e.target.value = '';
            }}
          />
          {imageError ? <p className="mt-2 font-body text-sm text-red-700">{imageError}</p> : null}
        </section>

        {/* Profile */}
        <Section title={t('artist.sectionYou')}>
          <SelectField
            label={t('artist.careerStage')}
            name="careerStage"
            options={CAREER_STAGES.map((s) => ({ value: s.key, label: s.label }))}
            value={careerStage}
            onChange={(e) => setCareerStage(e.target.value as CareerStage)}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label={t('artist.yearsSelling')}
              name="yearsSelling"
              type="number"
              min={0}
              max={60}
              value={yearsSelling}
              onChange={(e) => setYearsSelling(Number(e.target.value))}
            />
            <TextField
              label={t('artist.exhibitions')}
              name="exhibitions"
              type="number"
              min={0}
              max={100}
              value={exhibitions3yr}
              onChange={(e) => setExhibitions3yr(Number(e.target.value))}
            />
          </div>
          <TextField
            label={t('artist.institutional')}
            name="institutional"
            value={institutional}
            placeholder={t('artist.institutionalHint')}
            onChange={(e) => setInstitutional(e.target.value)}
          />
        </Section>

        {/* Artwork */}
        <Section title={t('artist.sectionWork')}>
          <SelectField
            label={t('wizard.fieldTradition')}
            name="tradition"
            placeholder={t('wizard.selectTradition')}
            options={traditionOptions}
            value={tradition}
            onChange={(e) => setTradition(e.target.value)}
          />
          <SelectField
            label={t('wizard.fieldMedium')}
            name="medium"
            placeholder={t('wizard.selectMedium')}
            options={mediumOptions}
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
          />
          <TextField
            label={t('artist.style')}
            name="style"
            value={style}
            placeholder={t('artist.styleHint')}
            onChange={(e) => setStyle(e.target.value)}
          />

          {/* Size — with an inches/cm unit toggle. */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="font-body text-sm text-ink">{t('artist.size')}</label>
              <div className="inline-flex rounded-full border border-border p-0.5">
                {(['in', 'cm'] as SizeUnit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setSizeUnit(u)}
                    className={`rounded-full px-2.5 py-0.5 font-body text-xs transition-colors ${
                      sizeUnit === u ? 'bg-ink text-cream' : 'text-muted hover:text-ink'
                    }`}
                    aria-pressed={sizeUnit === u}
                  >
                    {u === 'in' ? t('artist.inches') : t('artist.cm')}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label={t('artist.width')}
                name="width"
                type="number"
                min={0}
                step="0.1"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
              <TextField
                label={t('artist.height')}
                name="height"
                type="number"
                min={0}
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label={t('wizard.fieldCondition')}
              name="condition"
              options={conditionOptions}
              value={condition}
              onChange={(e) => setCondition(e.target.value as ArtworkCondition)}
            />
            <TextField
              label={t('wizard.fieldYear')}
              name="year"
              type="number"
              min={0}
              max={2100}
              value={yearCreated}
              onChange={(e) => setYearCreated(e.target.value)}
            />
          </div>
          <SelectField
            label={t('artist.complexity')}
            name="complexity"
            options={ART_COMPLEXITIES.map((c) => ({ value: c.key, label: c.label }))}
            value={complexity}
            onChange={(e) => setComplexity(e.target.value as ArtComplexity)}
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label={t('artist.edition')}
              name="edition"
              options={editionOptions}
              value={editionType}
              onChange={(e) => setEditionType(e.target.value as EditionType)}
            />
            <TextField
              label={t('artist.series')}
              name="series"
              value={seriesName}
              placeholder={t('artist.seriesHint')}
              onChange={(e) => setSeriesName(e.target.value)}
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 font-body text-sm text-muted">
              <input
                type="checkbox"
                checked={signed}
                onChange={(e) => setSigned(e.target.checked)}
                className="h-4 w-4 rounded border-border text-ink focus:ring-gold"
              />
              {t('artist.signed')}
            </label>
            <label className="flex items-center gap-2 font-body text-sm text-muted">
              <input
                type="checkbox"
                checked={framed}
                onChange={(e) => setFramed(e.target.checked)}
                className="h-4 w-4 rounded border-border text-ink focus:ring-gold"
              />
              {t('artist.framed')}
            </label>
          </div>
        </Section>

        {/* Selling intent */}
        <Section title={t('artist.sectionIntent')}>
          <div>
            <label className="mb-2 block font-body text-sm text-ink">{t('artist.channels')}</label>
            <div className="flex flex-wrap gap-2">
              {SELLING_CHANNELS.map((c) => {
                const active = channels.includes(c.key);
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => toggleChannel(c.key)}
                    className={`rounded-full border px-3 py-1.5 font-body text-sm transition-colors ${
                      active
                        ? 'border-gold bg-gold text-ink'
                        : 'border-border text-muted hover:border-gold/60'
                    }`}
                    aria-pressed={active}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <TextField
            label={t('artist.galleryCut')}
            name="galleryCut"
            type="number"
            min={GALLERY_CUT_RANGE.min}
            max={GALLERY_CUT_RANGE.max}
            step="5"
            value={galleryCutPct}
            onChange={(e) => setGalleryCutPct(Number(e.target.value))}
          />
          <SelectField
            label={t('artist.postureLabel')}
            name="posture"
            options={PRICING_POSTURES.map((p) => ({ value: p.key, label: p.label }))}
            value={posture}
            onChange={(e) => setPosture(e.target.value as PricingPosture)}
          />
          <SelectField
            label={t('artist.positioning')}
            name="positioning"
            options={MARKET_POSITIONINGS.map((p) => ({ value: p.key, label: p.label }))}
            value={positioning}
            onChange={(e) => setPositioning(e.target.value as MarketPositioning)}
          />
        </Section>

        {/* Costs & add-ons */}
        <Section title={t('artist.sectionCosts')}>
          <p className="font-body text-xs text-muted">{t('artist.costsHint')}</p>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label={t('artist.materialsCost')}
              name="materials"
              type="number"
              min={0}
              value={materialsCost}
              onChange={(e) => setMaterialsCost(e.target.value)}
            />
            <TextField
              label={t('artist.hoursWorked')}
              name="hours"
              type="number"
              min={0}
              value={hoursWorked}
              onChange={(e) => setHoursWorked(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label={t('artist.hourlyRate')}
              name="hourlyRate"
              type="number"
              min={0}
              placeholder={t('artist.hourlyRateHint')}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
            <TextField
              label={t('artist.framingCost')}
              name="framingCost"
              type="number"
              min={0}
              value={framingCost}
              onChange={(e) => setFramingCost(e.target.value)}
            />
          </div>
          <TextField
            label={t('artist.shippingCost')}
            name="shippingCost"
            type="number"
            min={0}
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
          />
        </Section>

        {/* Optional context */}
        <Section title={t('artist.sectionContext')}>
          <TextField
            label={t('artist.pastSales')}
            name="pastSales"
            value={pastSalePrices}
            placeholder={t('artist.pastSalesHint')}
            onChange={(e) => setPastSalePrices(e.target.value)}
          />
          <TextAreaField
            label={t('artist.recognition')}
            name="recognition"
            value={recognition}
            onChange={(e) => setRecognition(e.target.value)}
          />
        </Section>

        {formError ? <p className="font-body text-sm text-red-700">{formError}</p> : null}
        {mutation.isError ? (
          <p className="font-body text-sm text-red-700">
            {mutation.error instanceof Error ? mutation.error.message : t('artist.submitError')}
          </p>
        ) : null}

        <Button onClick={handleSubmit}>{t('artist.getPricing')}</Button>
      </div>
    </main>
  );
}
