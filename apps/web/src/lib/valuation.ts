/**
 * Client orchestration for submitting a valuation: compress the image once,
 * upload it to the user's private storage folder, base64 the same compressed
 * bytes for the model, and invoke the server-side generate-valuation function.
 */
import type {
  ArtworkCondition,
  Dimensions,
  ValuationPurpose,
  ValuationResult,
} from '@vaayu/shared';
import { supabase } from './supabase';
import { compressImage } from './upload';

const BUCKET = 'valuation-uploads';

function extensionFor(type: string): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

function blobToBase64DataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(blob);
  });
}

export interface SubmitValuationParams {
  imageFile: File;
  userId: string;
  artistKnown: boolean;
  artistName: string;
  tradition: string;
  medium: string;
  dimensions: Dimensions;
  yearCreated: number | null;
  condition: ArtworkCondition;
  provenanceNotes: string;
  purpose: ValuationPurpose;
  /** Razorpay/Stripe payment id when this valuation was paid for. */
  paymentId?: string | null;
}

export interface SavedValuation extends ValuationResult {
  id: string;
}

/** Run the full submit pipeline and return the persisted valuation. */
export async function submitValuation(params: SubmitValuationParams): Promise<SavedValuation> {
  const compressed = await compressImage(params.imageFile);
  const path = `${params.userId}/${crypto.randomUUID()}.${extensionFor(compressed.type)}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: compressed.type || 'image/jpeg',
    upsert: false,
  });
  if (uploadError) throw uploadError;

  const imageBase64 = await blobToBase64DataUrl(compressed);

  const { data, error } = await supabase.functions.invoke<SavedValuation>('generate-valuation', {
    body: {
      imageBase64,
      artworkImageUrl: path,
      artistKnown: params.artistKnown,
      artistName: params.artistName,
      tradition: params.tradition,
      medium: params.medium,
      dimensions: params.dimensions,
      yearCreated: params.yearCreated,
      condition: params.condition,
      provenanceNotes: params.provenanceNotes,
      purpose: params.purpose,
      paymentId: params.paymentId ?? null,
    },
  });

  if (error) throw error;
  if (!data) throw new Error('The valuation engine returned no result.');
  return data;
}
