import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../engine/pricing.dart';
import 'storage_service.dart';

/// One row in the user's valuation history — either a collector valuation or an
/// artist pricing, unified for the Orders list.
class HistoryItem {
  HistoryItem({
    required this.id,
    required this.isArtist,
    required this.createdAt,
    required this.title,
    required this.imagePath,
    this.imageUrl,
    this.collector,
    this.artist,
  });

  final String id;
  final bool isArtist;
  final DateTime createdAt;
  final String title;
  final String? imagePath;
  String? imageUrl;
  final ValuationResult? collector;
  final ArtistPricingResult? artist;

  /// Headline rupee amount for the list row (artist ask / collector mid).
  int get amountInr => isArtist ? (artist?.askInr ?? 0) : (collector?.estimatedMidInr ?? 0);
}

/// Reads and writes the signed-in user's valuation history. RLS scopes every
/// query to the current user's own rows.
class HistoryService {
  HistoryService(this._client) : _storage = StorageService(_client);
  final SupabaseClient _client;
  final StorageService _storage;

  /// Persist an artist pricing (best-effort image upload). Returns the row id.
  Future<String?> saveArtistPricing({
    required String userId,
    required ArtistPricingResult result,
    required String tradition,
    required String medium,
    required String careerStage,
    Uint8List? imageBytes,
    String imageMime = 'image/jpeg',
  }) async {
    String? imagePath;
    if (imageBytes != null) {
      try {
        imagePath = await _storage.uploadArtwork(userId, imageBytes, imageMime);
      } catch (_) {
        // image is optional for the history row
      }
    }
    final inserted = await _client
        .from('artist_pricings')
        .insert({
          'user_id': userId,
          'artwork_image_url': imagePath,
          'tradition': tradition.isEmpty ? null : tradition,
          'medium': medium.isEmpty ? null : medium,
          'dimensions_height_cm': null,
          'dimensions_width_cm': null,
          'career_stage': careerStage,
          'posture': result.posture.key,
          'ask_inr': result.askInr,
          'floor_inr': result.floorInr,
          'ceiling_inr': result.ceilingInr,
          'per_sqft_inr': result.perSqFtInr == 0 ? null : result.perSqFtInr,
          'result': result.toJson(),
        })
        .select('id')
        .maybeSingle();
    return inserted?['id']?.toString();
  }

  /// All of the user's history, newest first, with signed thumbnails.
  Future<List<HistoryItem>> list() async {
    final vals = await _client
        .from('valuations')
        .select('*')
        .order('created_at', ascending: false);
    final pricings = await _client
        .from('artist_pricings')
        .select('*')
        .order('created_at', ascending: false);

    final items = <HistoryItem>[];

    for (final r in (vals as List)) {
      final row = Map<String, dynamic>.from(r as Map);
      items.add(HistoryItem(
        id: row['id'].toString(),
        isArtist: false,
        createdAt: DateTime.tryParse(row['created_at']?.toString() ?? '') ?? DateTime(2020),
        title: (row['tradition']?.toString().isNotEmpty == true)
            ? row['tradition'].toString()
            : 'Valuation',
        imagePath: row['artwork_image_url']?.toString(),
        collector: _collectorFromRow(row),
      ));
    }

    for (final r in (pricings as List)) {
      final row = Map<String, dynamic>.from(r as Map);
      final result = row['result'] is Map
          ? ArtistPricingResult.fromJson(Map<String, dynamic>.from(row['result'] as Map))
          : null;
      items.add(HistoryItem(
        id: row['id'].toString(),
        isArtist: true,
        createdAt: DateTime.tryParse(row['created_at']?.toString() ?? '') ?? DateTime(2020),
        title: (row['tradition']?.toString().isNotEmpty == true)
            ? row['tradition'].toString()
            : 'Pricing',
        imagePath: row['artwork_image_url']?.toString(),
        artist: result,
      ));
    }

    items.sort((a, b) => b.createdAt.compareTo(a.createdAt));

    final paths = items.map((i) => i.imagePath).whereType<String>().toList();
    final signed = await _storage.signedUrls(paths);
    for (final i in items) {
      if (i.imagePath != null) i.imageUrl = signed[i.imagePath];
    }
    return items;
  }

  ValuationResult _collectorFromRow(Map<String, dynamic> row) {
    final reasoning = row['ai_reasoning'] is Map
        ? Map<String, dynamic>.from(row['ai_reasoning'] as Map)
        : <String, dynamic>{};
    return ValuationResult.fromJson({
      'estimatedLowInr': row['estimated_low_inr'],
      'estimatedMidInr': row['estimated_mid_inr'],
      'estimatedHighInr': row['estimated_high_inr'],
      'confidenceScore': row['confidence_score'],
      'reasoning': reasoning,
      'fullReport': row['full_report'] ?? '',
    });
  }
}
