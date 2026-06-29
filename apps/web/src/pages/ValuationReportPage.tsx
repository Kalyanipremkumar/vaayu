import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { VALUATION_PURPOSES } from '@vaayu/shared';
import { Button } from '../components/Button';
import { ValuationReport } from '../components/valuation/ValuationReport';
import { useValuation } from '../hooks/useValuations';

/**
 * View a single saved valuation report (from history) and re-download its PDF.
 */
export function ValuationReportPage() {
  const { id } = useParams<{ id: string }>();
  const { data: record, isLoading, isError } = useValuation(id);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  async function handleDownloadPdf() {
    if (!record) return;
    setPdfError(null);
    setPdfBusy(true);
    try {
      const { downloadValuationPdf } = await import('../lib/downloadReport');
      await downloadValuationPdf({
        result: record.result,
        tradition: record.tradition,
        medium: record.medium,
        dimensions: {
          heightCm: record.dimensionsHeightCm ?? 0,
          widthCm: record.dimensionsWidthCm ?? 0,
        },
        condition: record.condition ?? 'good',
        artistKnown: record.artistKnown,
        artistName: record.artistName ?? '',
        yearCreated: record.yearCreated,
        purpose: record.purpose,
        imageUrl: record.imageUrl,
      });
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Could not generate the PDF.');
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/dashboard" className="font-body text-sm text-muted hover:text-ink">
        ← Your valuations
      </Link>

      <div className="mt-8">
        {isLoading ? (
          <p className="py-12 text-center font-body text-sm text-muted">Loading report…</p>
        ) : isError || !record ? (
          <p className="py-12 text-center font-body text-sm text-red-700">
            This valuation could not be found.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            <ValuationReport
              result={record.result}
              imageUrl={record.imageUrl}
              purposeLabel={VALUATION_PURPOSES.find((p) => p.key === record.purpose)?.label}
            />
            <div className="flex flex-col gap-2 border-t border-border pt-6">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDownloadPdf} loading={pdfBusy}>
                  Download PDF report
                </Button>
                <Link to="/valuations/new">
                  <Button variant="outline">New valuation</Button>
                </Link>
              </div>
              {pdfError ? <p className="font-body text-sm text-red-700">{pdfError}</p> : null}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
