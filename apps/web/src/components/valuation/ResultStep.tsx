import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VALUATION_PURPOSES } from '@vaayu/shared';
import { Button } from '../Button';
import { ValuationReport } from './ValuationReport';
import { useValuationStore } from '../../store/valuationStore';

/** Step 6 — the finished report plus save / share / new-valuation actions. */
export function ResultStep() {
  const navigate = useNavigate();
  const store = useValuationStore();
  const { result, imagePreviewUrl, reset } = store;
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (!result) return null;

  async function handleDownloadPdf() {
    if (!result) return;
    setPdfError(null);
    setPdfBusy(true);
    try {
      // Load the (heavy) PDF generator on demand, not in the main bundle.
      const { downloadValuationPdf } = await import('../../lib/downloadReport');
      await downloadValuationPdf({
        result,
        tradition: store.tradition,
        medium: store.medium,
        dimensions: store.dimensions,
        condition: store.condition,
        artistKnown: store.artistKnown,
        artistName: store.artistName,
        yearCreated: store.yearCreated,
        purpose: store.purpose,
        imageFile: store.imageFile,
      });
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Could not generate the PDF.');
    } finally {
      setPdfBusy(false);
    }
  }

  async function handleShare() {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Vaayu valuation', url });
      } catch {
        // user cancelled the share sheet — ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <ValuationReport
        result={result}
        imageUrl={imagePreviewUrl}
        purposeLabel={VALUATION_PURPOSES.find((p) => p.key === store.purpose)?.label}
      />

      <div className="flex flex-col gap-2 border-t border-border pt-6">
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleDownloadPdf} loading={pdfBusy}>
            Download PDF report
          </Button>
          <Button variant="outline" onClick={handleShare}>
            Share
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              navigate('/dashboard');
            }}
          >
            Done
          </Button>
        </div>
        {pdfError ? <p className="font-body text-sm text-red-700">{pdfError}</p> : null}
      </div>
    </div>
  );
}
