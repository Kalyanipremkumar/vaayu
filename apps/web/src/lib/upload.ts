/**
 * Client-side image handling for the valuation upload step: validation,
 * downscaling, and upload to the user's private folder in the
 * `valuation-uploads` Supabase Storage bucket.
 */
import imageCompression from 'browser-image-compression';
import { UPLOAD_LIMITS } from '@vaayu/shared';
import { supabase } from './supabase';

const BUCKET = 'valuation-uploads';

/** Validate a picked file against the brand's upload constraints. Returns an
 * error string, or null when the file is acceptable. */
export function validateImageFile(file: File): string | null {
  if (
    !UPLOAD_LIMITS.allowedMimeTypes.includes(
      file.type as (typeof UPLOAD_LIMITS.allowedMimeTypes)[number],
    )
  ) {
    return 'Please upload a JPG, PNG, or WebP image.';
  }
  if (file.size > UPLOAD_LIMITS.maxBytes) {
    return 'That image is over 10 MB. Please choose a smaller file.';
  }
  return null;
}

/** Downscale a large image to the max width before upload, to save bandwidth
 * and storage. Returns the original file if it is already small enough. */
export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxWidthOrHeight: UPLOAD_LIMITS.maxWidthPx,
    maxSizeMB: 5,
    useWebWorker: true,
    initialQuality: 0.9,
  });
}

/** Extension for a given mime type. */
function extensionFor(type: string): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  return 'jpg';
}

export interface UploadedImage {
  /** Path within the bucket, e.g. "<uid>/169...-ab12.jpg". Stored on the row. */
  path: string;
}

/**
 * Compress and upload an image to the signed-in user's folder. The object key
 * is prefixed with the user id so the storage RLS policy permits it.
 * @param file   The validated image file.
 * @param userId The authenticated user's id (folder name).
 * @param seed   A caller-supplied unique-ish token for the filename (avoids
 *               Math.random/Date in shared code; pass e.g. crypto.randomUUID()).
 */
export async function uploadValuationImage(
  file: File,
  userId: string,
  seed: string,
): Promise<UploadedImage> {
  const compressed = await compressImage(file);
  const ext = extensionFor(compressed.type || file.type);
  const path = `${userId}/${seed}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
    contentType: compressed.type || file.type,
    upsert: false,
  });
  if (error) throw error;

  return { path };
}

/** Create a short-lived signed URL to display a private upload. */
export async function getSignedImageUrl(path: string, expiresInSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
