import 'constants.dart';
import 'enums.dart';

/// Pure pricing math ported from @vaayu/shared. No network, no secrets.

const double _sqCmPerSqFt = 929.0304;

double squareFeet(double heightCm, double widthCm) {
  final h = heightCm < 0 ? 0.0 : heightCm;
  final w = widthCm < 0 ? 0.0 : widthCm;
  return (h * w) / _sqCmPerSqFt;
}

// ── Layer 1–3 valuation (produced server-side, parsed here) ──────────────────

class LayerBase {
  const LayerBase(this.amount, this.rationale);
  final int amount;
  final String rationale;
  factory LayerBase.fromJson(Map<String, dynamic> j) =>
      LayerBase((j['amount'] as num?)?.round() ?? 0, (j['rationale'] ?? '') as String);
  Map<String, dynamic> toJson() => {'amount': amount, 'rationale': rationale};
}

class LayerMultiplier {
  const LayerMultiplier(this.multiplier, this.rationale, this.tier);
  final double multiplier;
  final String rationale;
  final String? tier;
  factory LayerMultiplier.fromJson(Map<String, dynamic> j) => LayerMultiplier(
        (j['multiplier'] as num?)?.toDouble() ?? 1.0,
        (j['rationale'] ?? '') as String,
        j['tier'] as String?,
      );
  Map<String, dynamic> toJson() =>
      {'multiplier': multiplier, 'rationale': rationale, if (tier != null) 'tier': tier};
}

class ValuationReasoning {
  const ValuationReasoning(this.baseValue, this.artistMultiplier, this.workAdjustment, this.comparables);
  final LayerBase baseValue;
  final LayerMultiplier artistMultiplier;
  final LayerMultiplier workAdjustment;
  final List<String> comparables;
  factory ValuationReasoning.fromJson(Map<String, dynamic> j) => ValuationReasoning(
        LayerBase.fromJson((j['baseValue'] ?? {}) as Map<String, dynamic>),
        LayerMultiplier.fromJson((j['artistMultiplier'] ?? {}) as Map<String, dynamic>),
        LayerMultiplier.fromJson((j['workAdjustment'] ?? {}) as Map<String, dynamic>),
        ((j['comparables'] as List?)?.cast<String>()) ?? const [],
      );
  Map<String, dynamic> toJson() => {
        'baseValue': baseValue.toJson(),
        'artistMultiplier': artistMultiplier.toJson(),
        'workAdjustment': workAdjustment.toJson(),
        'comparables': comparables,
      };
}

class ValuationResult {
  const ValuationResult({
    required this.estimatedLowInr,
    required this.estimatedMidInr,
    required this.estimatedHighInr,
    required this.confidenceScore,
    required this.reasoning,
    required this.fullReport,
  });
  final int estimatedLowInr;
  final int estimatedMidInr;
  final int estimatedHighInr;
  final int confidenceScore;
  final ValuationReasoning reasoning;
  final String fullReport;

  factory ValuationResult.fromJson(Map<String, dynamic> j) => ValuationResult(
        estimatedLowInr: (j['estimatedLowInr'] as num?)?.round() ?? 0,
        estimatedMidInr: (j['estimatedMidInr'] as num?)?.round() ?? 0,
        estimatedHighInr: (j['estimatedHighInr'] as num?)?.round() ?? 0,
        confidenceScore: (j['confidenceScore'] as num?)?.round() ?? 0,
        reasoning: ValuationReasoning.fromJson((j['reasoning'] ?? {}) as Map<String, dynamic>),
        fullReport: (j['fullReport'] ?? '') as String,
      );
  Map<String, dynamic> toJson() => {
        'estimatedLowInr': estimatedLowInr,
        'estimatedMidInr': estimatedMidInr,
        'estimatedHighInr': estimatedHighInr,
        'confidenceScore': confidenceScore,
        'reasoning': reasoning.toJson(),
        'fullReport': fullReport,
      };
}

// ── Layer 4 (channel) + 5 (posture) + cost floor + add-ons ───────────────────

class ChannelPrice {
  const ChannelPrice(this.channel, this.quotedInr, this.netInr);
  final SellingChannel channel;
  final int quotedInr;
  final int netInr;
  Map<String, dynamic> toJson() =>
      {'channel': channel.key, 'quotedInr': quotedInr, 'netInr': netInr};
  factory ChannelPrice.fromJson(Map<String, dynamic> j) => ChannelPrice(
        SellingChannel.values.firstWhere((c) => c.key == j['channel'],
            orElse: () => SellingChannel.direct),
        (j['quotedInr'] as num?)?.round() ?? 0,
        (j['netInr'] as num?)?.round() ?? 0,
      );
}

T _enumByKey<T>(List<T> values, dynamic key, T fallback, String Function(T) keyOf) =>
    values.firstWhere((v) => keyOf(v) == key, orElse: () => fallback);

ChannelPrice channelPrice(SellingChannel channel, int askInr, double galleryCutPct) {
  switch (channel) {
    case SellingChannel.gallery:
      final cut = (galleryCutPct.clamp(0, 90)) / 100;
      return ChannelPrice(channel, (askInr / (1 - cut)).round(), askInr);
    case SellingChannel.varnam:
      return ChannelPrice(channel, (askInr / (1 - kVarnamCommissionPct / 100)).round(), askInr);
    case SellingChannel.artFair:
      return ChannelPrice(channel, (askInr * kArtFairPremium).round(), askInr);
    case SellingChannel.commission:
      final quoted = (askInr * kCommissionPremium).round();
      return ChannelPrice(channel, quoted, quoted);
    case SellingChannel.direct:
      return ChannelPrice(channel, askInr, askInr);
  }
}

class ArtistPricingResult {
  const ArtistPricingResult({
    required this.askInr,
    required this.floorInr,
    required this.ceilingInr,
    required this.perSqFtInr,
    required this.areaSqFt,
    required this.complexity,
    required this.positioning,
    required this.posture,
    required this.costFloorInr,
    required this.materialsInr,
    required this.labourInr,
    required this.belowCost,
    required this.framingInr,
    required this.shippingInr,
    required this.channels,
    required this.valuation,
  });

  final int askInr;
  final int floorInr;
  final int ceilingInr;
  final int perSqFtInr;
  final double areaSqFt;
  final ArtComplexity complexity;
  final MarketPositioning positioning;
  final PricingPosture posture;
  final int costFloorInr;
  final int materialsInr;
  final int labourInr;
  final bool belowCost;
  final int framingInr;
  final int shippingInr;
  final List<ChannelPrice> channels;
  final ValuationResult valuation;

  Map<String, dynamic> toJson() => {
        'askInr': askInr,
        'floorInr': floorInr,
        'ceilingInr': ceilingInr,
        'perSqFtInr': perSqFtInr,
        'areaSqFt': areaSqFt,
        'complexity': complexity.key,
        'positioning': positioning.key,
        'posture': posture.key,
        'costFloorInr': costFloorInr,
        'materialsInr': materialsInr,
        'labourInr': labourInr,
        'belowCost': belowCost,
        'framingInr': framingInr,
        'shippingInr': shippingInr,
        'channels': channels.map((c) => c.toJson()).toList(),
        'valuation': valuation.toJson(),
      };

  factory ArtistPricingResult.fromJson(Map<String, dynamic> j) => ArtistPricingResult(
        askInr: (j['askInr'] as num?)?.round() ?? 0,
        floorInr: (j['floorInr'] as num?)?.round() ?? 0,
        ceilingInr: (j['ceilingInr'] as num?)?.round() ?? 0,
        perSqFtInr: (j['perSqFtInr'] as num?)?.round() ?? 0,
        areaSqFt: (j['areaSqFt'] as num?)?.toDouble() ?? 0,
        complexity: _enumByKey(
            ArtComplexity.values, j['complexity'], ArtComplexity.moderate, (e) => e.key),
        positioning: _enumByKey(
            MarketPositioning.values, j['positioning'], MarketPositioning.standard, (e) => e.key),
        posture:
            _enumByKey(PricingPosture.values, j['posture'], PricingPosture.balanced, (e) => e.key),
        costFloorInr: (j['costFloorInr'] as num?)?.round() ?? 0,
        materialsInr: (j['materialsInr'] as num?)?.round() ?? 0,
        labourInr: (j['labourInr'] as num?)?.round() ?? 0,
        belowCost: j['belowCost'] == true,
        framingInr: (j['framingInr'] as num?)?.round() ?? 0,
        shippingInr: (j['shippingInr'] as num?)?.round() ?? 0,
        channels: ((j['channels'] as List?) ?? const [])
            .map((c) => ChannelPrice.fromJson(Map<String, dynamic>.from(c as Map)))
            .toList(),
        valuation: ValuationResult.fromJson(
            Map<String, dynamic>.from((j['valuation'] ?? {}) as Map)),
      );
}

/// Apply complexity × positioning × posture to the net mid value, then derive
/// floor/ceiling/per-sq-ft, the direct-cost floor, add-ons, and channel prices.
ArtistPricingResult computeArtistPricing({
  required ValuationResult valuation,
  required double heightCm,
  required double widthCm,
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
}) {
  final adjusted =
      valuation.estimatedMidInr * complexity.factor * positioning.factor * posture.factor;
  final ask = adjusted.round();
  final floor = (ask * kFloorFactor).round();
  final ceiling = (ask * kCeilingFactor).round();
  final area = squareFeet(heightCm, widthCm);
  final perSqFt = area > 0 ? (ask / area).round() : 0;

  final materials = materialsCostInr < 0 ? 0 : materialsCostInr;
  final rate = (hourlyRateInr != null && hourlyRateInr > 0) ? hourlyRateInr : kDefaultHourlyRateInr;
  final labour = (hoursWorked < 0 ? 0 : hoursWorked) * rate;
  final costFloor = materials + labour;

  final seen = <SellingChannel>{};
  final channelPrices = channels
      .where((c) => seen.add(c))
      .map((c) => channelPrice(c, ask, galleryCutPct))
      .toList();

  return ArtistPricingResult(
    askInr: ask,
    floorInr: floor,
    ceilingInr: ceiling,
    perSqFtInr: perSqFt,
    areaSqFt: area,
    complexity: complexity,
    positioning: positioning,
    posture: posture,
    costFloorInr: costFloor,
    materialsInr: materials,
    labourInr: labour,
    belowCost: costFloor > 0 && ask < costFloor,
    framingInr: framingCostInr < 0 ? 0 : framingCostInr,
    shippingInr: shippingCostInr < 0 ? 0 : shippingCostInr,
    channels: channelPrices,
    valuation: valuation,
  );
}
