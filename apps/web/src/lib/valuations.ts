/**
 * Reads persisted valuations and maps DB rows into report-ready records.
 * RLS already restricts every query to the signed-in user's own rows.
 */
import type { ValuationReasoning, ValuationResult, ArtworkCondition } from '@vaayu/shared';
import type { Database } from '@vaayu/supabase';
import { supabase } from './supabase';

type Row = Database['public']['Tables']['valuations']['Row'];

const BUCKET = 'valuation-uploads';

export interface ValuationRecord {
  id: string;
  createdAt: string;
  imagePath: string;
  /** Short-lived signed URL for displaying the artwork (null if signing failed). */
  imageUrl: string | null;
  tradition: string;
  medium: string;
  condition: ArtworkCondition | null;
  artistKnown: boolean;
  artistName: string | null;
  yearCreated: number | null;
  dimensionsHeightCm: number | null;
  dimensionsWidthCm: number | null;
  /** The full valuation result, reconstructed from the row. */
  result: ValuationResult & { id: string };
}

function rowToResult(row: Row): ValuationResult & { id: string } {
  return {
    id: row.id,
    estimatedLowInr: row.estimated_low_inr ?? 0,
    estimatedMidInr: row.estimated_mid_inr ?? 0,
    estimatedHighInr: row.estimated_high_inr ?? 0,
    confidenceScore: row.confidence_score ?? 0,
    reasoning: (row.ai_reasoning as unknown as ValuationReasoning) ?? {
      baseValue: { amount: 0, rationale: '' },
      artistMultiplier: { multiplier: 1, rationale: '' },
      workAdjustment: { multiplier: 1, rationale: '' },
    },
    fullReport: row.full_report ?? '',
  };
}

function rowToRecord(row: Row, imageUrl: string | null): ValuationRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    imagePath: row.artwork_image_url,
    imageUrl,
    tradition: row.tradition ?? '',
    medium: row.medium ?? '',
    condition: row.condition,
    artistKnown: row.artist_known,
    artistName: row.artist_name,
    yearCreated: row.year_created,
    dimensionsHeightCm: row.dimensions_height_cm,
    dimensionsWidthCm: row.dimensions_width_cm,
    result: rowToResult(row),
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

/** All of the current user's valuations, newest first, with signed thumbnails. */
export async function listValuations(): Promise<ValuationRecord[]> {
  const { data, error } = await supabase
    .from('valuations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const rows = data ?? [];
  const signed = await signPaths(rows.map((r) => r.artwork_image_url));
  return rows.map((r) => rowToRecord(r, signed.get(r.artwork_image_url) ?? null));
}

/** A single valuation by id, with a signed image URL. */
export async function getValuation(id: string): Promise<ValuationRecord | null> {
  const { data, error } = await supabase.from('valuations').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const signed = await signPaths([data.artwork_image_url]);
  return rowToRecord(data, signed.get(data.artwork_image_url) ?? null);
}
