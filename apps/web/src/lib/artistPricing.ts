/**
 * Client orchestration for Artist Mode pricing. Compresses the image, sends it
 * (with the artist's self-reported profile + deeper criteria) to the same
 * server-side generate-valuation function in `mode: 'artist'`, then applies the
 * deterministic channel/posture math from @vaayu/shared to the returned net mid
 * value. Artist pricing is not persisted in Phase 1 — this is a live calculator.
 */
import {
  computeArtistPricing,
  type ArtistPricingResult,
  type ArtworkCondition,
  type CareerStage,
  type Dimensions,
  type EditionType,
  type PricingPosture,
  type SellingChannel,
  type ValuationResult,
} from '@vaayu/shared';
import { supabase } from './supabase';
import { compressImage } from './upload';
import { saveArtistPricing } from './artistPricings';

function blobToBase64DataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.readAsDataURL(blob);
  });
}

export interface SubmitArtistPricingParams {
  imageFile: File;
  /** The signed-in user, used to persist the pricing to their history. */
  userId: string;
  // Artist profile (Layer 2)
  careerStage: CareerStage;
  yearsSelling: number;
  exhibitions3yr: number;
  institutionalCollectors: string;
  // The artwork
  tradition: string;
  medium: string;
  dimensions: Dimensions;
  condition: ArtworkCondition;
  yearCreated: number | null;
  // Deeper criteria (Layer 3)
  editionType?: EditionType;
  seriesName?: string;
  signed?: boolean;
  framed?: boolean;
  // Selling intent (Layers 4 & 5)
  channels: SellingChannel[];
  galleryCutPct: number;
  posture: PricingPosture;
  // Extra context
  materialsCostInr: number | null;
  hoursWorked: number | null;
  pastSalePrices: string;
  recognition: string;
}

/** Run the artist pricing pipeline and return the full recommendation. */
export async function submitArtistPricing(
  params: SubmitArtistPricingParams,
): Promise<ArtistPricingResult> {
  const compressed = await compressImage(params.imageFile);
  const imageBase64 = await blobToBase64DataUrl(compressed);

  const { data, error } = await supabase.functions.invoke<ValuationResult>('generate-valuation', {
    body: {
      mode: 'artist',
      imageBase64,
      artistKnown: false,
      tradition: params.tradition,
      medium: params.medium,
      dimensions: params.dimensions,
      condition: params.condition,
      yearCreated: params.yearCreated,
      criteria: {
        editionType: params.editionType,
        seriesName: params.seriesName || undefined,
        signed: params.signed,
        framed: params.framed,
      },
      artist: {
        careerStage: params.careerStage,
        yearsSelling: params.yearsSelling,
        exhibitions3yr: params.exhibitions3yr,
        institutionalCollectors: params.institutionalCollectors || undefined,
        materialsCostInr: params.materialsCostInr ?? undefined,
        hoursWorked: params.hoursWorked ?? undefined,
        pastSalePrices: params.pastSalePrices || undefined,
        recognition: params.recognition || undefined,
      },
    },
  });

  if (error) throw error;
  if (!data) throw new Error('The pricing engine returned no result.');

  const breakdown = computeArtistPricing({
    netMidInr: data.estimatedMidInr,
    dimensions: params.dimensions,
    posture: params.posture,
    channels: params.channels,
    galleryCutPct: params.galleryCutPct,
  });

  const result: ArtistPricingResult = { ...breakdown, posture: params.posture, valuation: data };

  // Persist to the user's history (best-effort — never fail the result on this).
  try {
    await saveArtistPricing({
      userId: params.userId,
      image: compressed,
      tradition: params.tradition,
      medium: params.medium,
      dimensions: params.dimensions,
      careerStage: params.careerStage,
      posture: params.posture,
      result,
    });
  } catch (err) {
    console.error('Could not save artist pricing to history:', err);
  }

  return result;
}
