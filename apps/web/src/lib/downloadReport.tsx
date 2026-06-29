/**
 * Builds the branded PDF from a valuation and triggers a download. Kept as .tsx
 * because it renders the @react-pdf <ReportDocument/> element.
 */
import { pdf } from '@react-pdf/renderer';
import { MEDIUMS, TRADITIONS, type ArtworkCondition, type Dimensions } from '@vaayu/shared';
import { ReportDocument } from '../components/valuation/ReportDocument';
import type { SavedValuation } from './valuation';

function labelFor(list: readonly { key: string; label: string }[], key: string): string {
  return list.find((item) => item.key === key)?.label ?? (key || '—');
}

function titleCase(value: string): string {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '—';
}

/**
 * Render a Blob image onto a canvas and export JPEG. react-pdf's <Image> only
 * supports PNG/JPEG (not WebP), so this normalises any source and downscales it
 * to keep the PDF small. Using an object URL keeps the canvas same-origin, so a
 * remote (signed) image fetched to a Blob never taints it.
 */
function blobToJpegDataUrl(blob: Blob, maxPx = 1100): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new window.Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not available.');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not process the image.'));
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not load the image.'));
    };
    img.src = objectUrl;
  });
}

/** Resolve the report image to a JPEG data URL from a File or a (signed) URL. */
async function resolveImageDataUrl(file: File | null, url: string | null): Promise<string | null> {
  if (file) return blobToJpegDataUrl(file);
  if (url) {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await blobToJpegDataUrl(await res.blob());
    } catch {
      return null;
    }
  }
  return null;
}

export interface DownloadReportArgs {
  result: SavedValuation;
  tradition: string;
  medium: string;
  dimensions: Dimensions;
  condition: ArtworkCondition;
  artistKnown: boolean;
  artistName: string;
  yearCreated: number | null;
  /** Freshly uploaded file (result step) — takes precedence if present. */
  imageFile?: File | null;
  /** Signed image URL (re-download from history). */
  imageUrl?: string | null;
}

/** Generate the branded report PDF and save it to the user's device. */
export async function downloadValuationPdf(args: DownloadReportArgs): Promise<void> {
  const imageDataUrl = await resolveImageDataUrl(args.imageFile ?? null, args.imageUrl ?? null);
  const traditionLabel = labelFor(TRADITIONS, args.tradition);
  const reportId = `VAY-${args.result.id.replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const blob = await pdf(
    <ReportDocument
      title={traditionLabel}
      traditionLabel={traditionLabel}
      mediumLabel={labelFor(MEDIUMS, args.medium)}
      dimensions={`${args.dimensions.heightCm} × ${args.dimensions.widthCm} cm`}
      condition={titleCase(args.condition)}
      artist={args.artistKnown ? args.artistName || 'Unknown' : 'Unknown / unverified'}
      year={args.yearCreated ? String(args.yearCreated) : '—'}
      result={args.result}
      imageDataUrl={imageDataUrl}
      reportId={reportId}
      dateStr={dateStr}
    />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Vaayu-Valuation-${reportId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
