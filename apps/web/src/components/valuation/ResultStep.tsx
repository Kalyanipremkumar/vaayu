import { useNavigate } from 'react-router-dom';
import { Button } from '../Button';
import { ValuationReport } from './ValuationReport';
import { useValuationStore } from '../../store/valuationStore';

/** Step 6 — the finished report plus save / share / new-valuation actions. */
export function ResultStep() {
  const navigate = useNavigate();
  const { result, imagePreviewUrl, reset } = useValuationStore();

  if (!result) return null;

  async function handleShare() {
    const url = window.location.href;
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
      <ValuationReport result={result} imageUrl={imagePreviewUrl} />

      <div className="flex flex-wrap gap-3 border-t border-border pt-6 print:hidden">
        <Button onClick={() => window.print()}>Save as PDF</Button>
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
    </div>
  );
}
