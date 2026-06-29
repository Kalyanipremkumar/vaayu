import { useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../Button';
import { useValuationStore } from '../../store/valuationStore';
import { validateImageFile } from '../../lib/upload';

/**
 * Step 1 — pick or drop an artwork image. Validates type/size, shows a preview,
 * and stores the File + a local preview URL in the wizard store. The actual
 * upload to Supabase Storage happens when the valuation is submitted.
 */
export function UploadStep() {
  const { t } = useTranslation();
  const { imagePreviewUrl, update, setStep } = useValuationStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function acceptFile(file: File) {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    // Revoke any previous preview URL to avoid leaking object URLs.
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    update({ imageFile: file, imagePreviewUrl: URL.createObjectURL(file) });
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  }

  return (
    <div className="flex flex-col gap-6">
      {imagePreviewUrl ? (
        <div className="flex flex-col items-center gap-4">
          <img
            src={imagePreviewUrl}
            alt="Selected artwork preview"
            className="max-h-96 w-auto rounded-md border border-border object-contain"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              {t('wizard.chooseDifferent')}
            </Button>
            <Button onClick={() => setStep('context')}>{t('wizard.useImage')}</Button>
          </div>
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
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-16 text-center transition-colors ${
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

      {error ? <p className="font-body text-sm text-red-700">{error}</p> : null}

      {!imagePreviewUrl ? (
        <div className="rounded-lg border border-border bg-gold/[0.04] p-4">
          <p className="font-body text-xs font-medium uppercase tracking-wider text-gold">
            {t('wizard.tipsTitle')}
          </p>
          <ul className="mt-2 space-y-1 font-body text-sm text-muted">
            <li>· {t('wizard.tip1')}</li>
            <li>· {t('wizard.tip2')}</li>
            <li>· {t('wizard.tip3')}</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
