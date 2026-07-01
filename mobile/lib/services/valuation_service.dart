import 'dart:convert';
import 'dart:typed_data';

import 'package:supabase_flutter/supabase_flutter.dart';

import '../engine/enums.dart';
import '../engine/pricing.dart';

/// Thrown when the free quota is spent and a verified payment is required.
class PaymentRequiredException implements Exception {}

/// Thrown when payments aren't configured on the server yet.
class PaymentsUnconfiguredException implements Exception {}

/// Verified Razorpay payment, re-sent to unlock a paid valuation.
class PaymentProof {
  const PaymentProof({required this.orderId, required this.paymentId, required this.signature});
  final String orderId;
  final String paymentId;
  final String signature;
}

/// A parsed collector valuation plus the server row id (for history).
class SavedValuation {
  const SavedValuation(this.id, this.result);
  final String? id;
  final ValuationResult result;
}

/// Calls the server-side `generate-valuation` edge function (collector or
/// artist mode) and returns the parsed three-layer valuation. Artist add-ons
/// (channel/posture/etc.) are computed client-side by [computeArtistPricing].
class ValuationService {
  ValuationService(this._client);
  final SupabaseClient _client;

  String _dataUrl(Uint8List bytes, String mime) =>
      'data:$mime;base64,${base64Encode(bytes)}';

  Future<Map<String, dynamic>> _invoke(Map<String, dynamic> body) async {
    try {
      final res = await _client.functions.invoke('generate-valuation', body: body);
      final data = res.data;
      if (data is Map && data['error'] != null) {
        throw Exception(data['error'].toString());
      }
      if (data is! Map) {
        throw Exception('The engine returned an unexpected response.');
      }
      return Map<String, dynamic>.from(data);
    } on FunctionException catch (e) {
      final details = e.details;
      final code = details is Map ? details['code']?.toString() : null;
      if (code == 'payment_required') throw PaymentRequiredException();
      if (code == 'payments_unconfigured') throw PaymentsUnconfiguredException();
      final msg = details is Map ? details['error']?.toString() : null;
      throw Exception(msg ?? 'The valuation could not be generated. Please try again.');
    }
  }

  /// Collector Mode: upload a photo + a little context, get the three-layer
  /// valuation (estimate range + reasoning) straight from the server. The image
  /// must already be uploaded ([artworkImageUrl] = storage path). Pass [payment]
  /// after the free quota is spent. Throws [PaymentRequiredException] when the
  /// free quota is spent and no valid payment was supplied.
  Future<SavedValuation> valueArtwork({
    required Uint8List imageBytes,
    required String mime,
    required String artworkImageUrl,
    required bool artistKnown,
    String? artistName,
    required String tradition,
    required String medium,
    String? style,
    required double heightCm,
    required double widthCm,
    required ArtworkCondition condition,
    int? yearCreated,
    bool? signed,
    bool? framed,
    PaymentProof? payment,
  }) async {
    final data = await _invoke({
      'mode': 'collector',
      'imageBase64': _dataUrl(imageBytes, mime),
      'artworkImageUrl': artworkImageUrl,
      'artistKnown': artistKnown,
      if (artistKnown && artistName != null && artistName.isNotEmpty) 'artistName': artistName,
      'tradition': tradition,
      'medium': medium,
      if (style != null && style.isNotEmpty) 'style': style,
      'dimensions': {'heightCm': heightCm, 'widthCm': widthCm},
      'condition': condition.key,
      if (yearCreated != null) 'yearCreated': yearCreated,
      'criteria': {
        if (signed != null) 'signed': signed,
        if (framed != null) 'framed': framed,
      },
      if (payment != null) ...{
        'razorpayOrderId': payment.orderId,
        'razorpayPaymentId': payment.paymentId,
        'razorpaySignature': payment.signature,
      },
    });
    return SavedValuation(data['id']?.toString(), ValuationResult.fromJson(data));
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
    final valuation = ValuationResult.fromJson(await _invoke({
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
    }));

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
