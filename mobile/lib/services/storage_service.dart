import 'dart:math';
import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

/// Uploads artwork photos to the private `valuation-uploads` bucket and mints
/// short-lived signed URLs to display them. Object keys are prefixed with the
/// user id so the storage RLS policy permits the write.
class StorageService {
  StorageService(this._client);
  final SupabaseClient _client;

  static const String bucket = 'valuation-uploads';

  String _ext(String mime) => switch (mime) {
        'image/png' => 'png',
        'image/webp' => 'webp',
        _ => 'jpg',
      };

  String _seed() {
    final r = Random();
    final rand = List.generate(8, (_) => r.nextInt(36).toRadixString(36)).join();
    return '${DateTime.now().microsecondsSinceEpoch}-$rand';
  }

  /// Upload [bytes] for [userId]; returns the storage path stored on the row.
  Future<String> uploadArtwork(String userId, Uint8List bytes, String mime) async {
    final path = '$userId/${_seed()}.${_ext(mime)}';
    await _client.storage.from(bucket).uploadBinary(
          path,
          bytes,
          fileOptions: FileOptions(contentType: mime, upsert: false),
        );
    return path;
  }

  /// A signed URL for a stored path (null on failure — thumbnails are optional).
  Future<String?> signedUrl(String path, {int expiresIn = 3600}) async {
    try {
      return await _client.storage.from(bucket).createSignedUrl(path, expiresIn);
    } catch (_) {
      return null;
    }
  }

  /// Batch-sign paths → map of path → signed URL (missing ones simply absent).
  Future<Map<String, String>> signedUrls(List<String> paths, {int expiresIn = 3600}) async {
    final map = <String, String>{};
    if (paths.isEmpty) return map;
    try {
      final signed = await _client.storage.from(bucket).createSignedUrls(paths, expiresIn);
      for (final s in signed) {
        if (s.signedUrl.isNotEmpty && s.path.isNotEmpty) map[s.path] = s.signedUrl;
      }
    } catch (_) {
      // best effort
    }
    return map;
  }
}
