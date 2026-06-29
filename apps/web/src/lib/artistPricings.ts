/**
 * Persistence for Artist Mode pricings. Saved client-side from the calculator
 * (RLS restricts every query to the signed-in user's own rows). The full
 * ArtistPricingResult is stored as JSON; scalar columns drive the dashboard list.
 */
import type { ArtistPricingResult, CareerStage, Dimensions, PricingPosture } from '@vaayu/shared';
import type { Database } from '@vaayu/supabase';
import { supabase } from './supabase';

type Row = Database['public']['Tables']['artist_pricings']['Row'];

const BUCKET = 'valuation-uploads';

export interface ArtistPricingRecord {
  id: string;
  createdAt: string;
  imagePath: string | null;
  /** Short-lived signed URL for the thumbnail (null if absent/failed). */
  imageUrl: string | null;
  tradition: string;
  askInr: number;
  perSqFtInr: number | null;
  /** The full recommendation, reconstructed from the row. */
  result: ArtistPricingResult;
}

function extensionFor(type: string): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

function rowToRecord(row: Row, imageUrl: string | null): ArtistPricingRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    imagePath: row.artwork_image_url,
    imageUrl,
    tradition: row.tradition ?? '',
    askInr: row.ask_inr,
    perSqFtInr: row.per_sqft_inr,
    result: row.result as unknown as ArtistPricingResult,
  };
}

/** Batch-sign storage paths into display URLs; missing/failed ones map to null. */
async function signPaths(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (paths.length === 0) return map;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
  for (const item of data ?? []) {
    if (item.signedUrl && item.path) map.set(item.path, item.signedUrl);
  }
  return map;
}

export interface SaveArtistPricingParams {
  userId: string;
  image: Blob;
  tradition: string;
  medium: string;
  dimensions: Dimensions;
  careerStage: CareerStage;
  posture: PricingPosture;
  result: ArtistPricingResult;
}

/**
 * Upload the artwork and persist one pricing. Best-effort: callers run this
 * after the recommendation is already shown, so a failure here must not lose
 * the user's result — it only means the row won't appear in history.
 */
export async function saveArtistPricing(params: SaveArtistPricingParams): Promise<string | null> {
  let imagePath: string | null = null;
  try {
    const path = `${params.userId}/${crypto.randomUUID()}.${extensionFor(params.image.type)}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, params.image, {
      contentType: params.image.type || 'image/jpeg',
      upsert: false,
    });
    if (!uploadError) imagePath = path;
  } catch {
    // ignore — image is optional for the history row
  }

  const { data, error } = await supabase
    .from('artist_pricings')
    .insert({
      user_id: params.userId,
      artwork_image_url: imagePath,
      tradition: params.tradition || null,
      medium: params.medium || null,
      dimensions_height_cm: params.dimensions.heightCm || null,
      dimensions_width_cm: params.dimensions.widthCm || null,
      career_stage: params.careerStage,
      posture: params.posture,
      ask_inr: params.result.askInr,
      floor_inr: params.result.floorInr,
      ceiling_inr: params.result.ceilingInr,
      per_sqft_inr: params.result.perSqFtInr || null,
      result:
        params.result as unknown as Database['public']['Tables']['artist_pricings']['Insert']['result'],
    })
    .select('id')
    .single();
  if (error) throw error;
  return data?.id ?? null;
}

/** All of the current user's artist pricings, newest first, with signed thumbnails. */
export async function listArtistPricings(): Promise<ArtistPricingRecord[]> {
  const { data, error } = await supabase
    .from('artist_pricings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  const paths = rows.map((r) => r.artwork_image_url).filter((p): p is string => Boolean(p));
  const signed = await signPaths(paths);
  return rows.map((r) =>
    rowToRecord(r, r.artwork_image_url ? (signed.get(r.artwork_image_url) ?? null) : null),
  );
}

/** A single artist pricing by id, with a signed image URL. */
export async function getArtistPricing(id: string): Promise<ArtistPricingRecord | null> {
  const { data, error } = await supabase
    .from('artist_pricings')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const signed = data.artwork_image_url ? await signPaths([data.artwork_image_url]) : new Map();
  return rowToRecord(
    data,
    data.artwork_image_url ? (signed.get(data.artwork_image_url) ?? null) : null,
  );
}
