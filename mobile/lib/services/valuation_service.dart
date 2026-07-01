import 'dart:convert';
import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../engine/enums.dart';
import '../engine/pricing.dart';

/// Calls the server-side `generate-valuation` edge function (collector or
/// artist mode) and returns the parsed three-layer valuation. Artist add-ons
/// (channel/posture/etc.) are computed client-side by [computeArtistPricing].
class ValuationService {
  ValuationService(this._client);
  final SupabaseClient _client;

  String _dataUrl(Uint8List bytes, String mime) =>
      'data:$mime;base64,${base64Encode(bytes)}';

  Future<ValuationResult> _invoke(Map<String, dynamic> body) async {
    final res = await _client.functions.invoke('generate-valuation', body: body);
    final data = res.data;
    if (data is Map && data['error'] != null) {
      throw Exception(data['error'].toString());
    }
    if (data is! Map) {
      throw Exception('The engine returned an unexpected response.');
    }
    return ValuationResult.fromJson(Map<String, dynamic>.from(data));
  }

  /// Artist Mode: returns the full recommendation (Layers 1–3 from the server,
  /// Layers 4–5 + cost floor + add-ons computed locally).
  Future<ArtistPricingResult> priceArtwork({
    required Uint8List imageBytes,
    required String mime,
    required String tradition,
    required String medium,
    String? style,
    required double heightCm,
    required double widthCm,
    required ArtworkCondition condition,
    int? yearCreated,
    // criteria
    EditionType? editionType,
    String? seriesName,
    bool? signed,
    bool? framed,
    // artist profile
    required CareerStage careerStage,
    required int yearsSelling,
    required int exhibitions3yr,
    String? institutionalCollectors,
    // pricing knobs
    required ArtComplexity complexity,
    required MarketPositioning positioning,
    required PricingPosture posture,
    required List<SellingChannel> channels,
    required double galleryCutPct,
    int materialsCostInr = 0,
    int hoursWorked = 0,
    int? hourlyRateInr,
    int framingCostInr = 0,
    int shippingCostInr = 0,
    String? pastSalePrices,
    String? recognition,
  }) async {
    final valuation = await _invoke({
      'mode': 'artist',
      'imageBase64': _dataUrl(imageBytes, mime),
      'artistKnown': false,
      'tradition': tradition,
      'medium': medium,
      if (style != null && style.isNotEmpty) 'style': style,
      'dimensions': {'heightCm': heightCm, 'widthCm': widthCm},
      'condition': condition.key,
      if (yearCreated != null) 'yearCreated': yearCreated,
      'criteria': {
        if (editionType != null) 'editionType': editionType.key,
        if (seriesName != null && seriesName.isNotEmpty) 'seriesName': seriesName,
        if (signed != null) 'signed': signed,
        if (framed != null) 'framed': framed,
      },
      'artist': {
        'careerStage': careerStage.key,
        'yearsSelling': yearsSelling,
        'exhibitions3yr': exhibitions3yr,
        if (institutionalCollectors != null && institutionalCollectors.isNotEmpty)
          'institutionalCollectors': institutionalCollectors,
        if (materialsCostInr > 0) 'materialsCostInr': materialsCostInr,
        if (hoursWorked > 0) 'hoursWorked': hoursWorked,
        if (pastSalePrices != null && pastSalePrices.isNotEmpty) 'pastSalePrices': pastSalePrices,
        if (recognition != null && recognition.isNotEmpty) 'recognition': recognition,
      },
    });

    return computeArtistPricing(
      valuation: valuation,
      heightCm: heightCm,
      widthCm: widthCm,
      complexity: complexity,
      positioning: positioning,
      posture: posture,
      channels: channels,
      galleryCutPct: galleryCutPct,
      materialsCostInr: materialsCostInr,
      hoursWorked: hoursWorked,
      hourlyRateInr: hourlyRateInr,
      framingCostInr: framingCostInr,
      shippingCostInr: shippingCostInr,
    );
  }
}
