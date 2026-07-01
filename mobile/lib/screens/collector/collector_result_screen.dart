import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../engine/constants.dart';
import '../../engine/format.dart';
import '../../engine/pricing.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';

/// Screen 12 — Collector valuation result. Estimate range up top, the three
/// layers of reasoning below, comparables, and the disclaimer.
class CollectorResultScreen extends StatelessWidget {
  const CollectorResultScreen({super.key, required this.result, this.image});

  final ValuationResult result;
  final Uint8List? image;

  @override
  Widget build(BuildContext context) {
    final r = result;
    return Scaffold(
      appBar: const VaayuAppBar(showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _hero(r),
            const SizedBox(height: 24),
            Text('How we got there', style: AppTypography.displaySmall),
            const SizedBox(height: 4),
            Text('Three layers, fully shown.',
                style: AppTypography.bodySmall.copyWith(color: AppColors.grey400)),
            const SizedBox(height: 12),
            _reasoning(r),
            if (r.reasoning.comparables.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text('Comparable works', style: AppTypography.displaySmall),
              const SizedBox(height: 12),
              _comparables(r),
            ],
            const SizedBox(height: 20),
            Text(kValuationDisclaimer,
                style: AppTypography.bodySmall.copyWith(color: AppColors.grey400)),
            const SizedBox(height: 24),
            PrimaryButton(label: 'Value another work', onPressed: () => context.pop()),
            const SizedBox(height: 10),
            TertiaryButton(label: 'Done', onPressed: () => context.go('/')),
          ],
        ),
      ),
    );
  }

  Widget _hero(ValuationResult r) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
        decoration: const BoxDecoration(color: AppColors.burgundy, borderRadius: AppRadius.bigCard),
        child: Column(children: [
          if (image != null) ...[
            ClipRRect(
              borderRadius: AppRadius.card,
              child: Image.memory(image!, height: 150, fit: BoxFit.cover),
            ),
            const SizedBox(height: 20),
          ],
          EyebrowLabel('Estimated value', color: AppColors.goldLight),
          const SizedBox(height: 10),
          Text(formatInr(r.estimatedMidInr), style: AppTypography.priceHero),
          const SizedBox(height: 8),
          Text('${formatInr(r.estimatedLowInr)} — ${formatInr(r.estimatedHighInr)}',
              style: AppTypography.bodyMedium.copyWith(color: AppColors.beige)),
          const SizedBox(height: 18),
          _confidence(r.confidenceScore),
        ]),
      );

  Widget _confidence(int score) {
    final pct = (score.clamp(0, 100)) / 100;
    final label = score >= 75
        ? 'High confidence'
        : (score >= 50 ? 'Moderate confidence' : 'Indicative');
    return Column(children: [
      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label.toUpperCase(),
            style: AppTypography.eyebrow
                .copyWith(color: AppColors.beige.withValues(alpha: 0.8), letterSpacing: 1.2)),
        Text('$score / 100',
            style: AppTypography.bodySmall.copyWith(color: AppColors.goldLight)),
      ]),
      const SizedBox(height: 8),
      ClipRRect(
        borderRadius: BorderRadius.circular(3),
        child: LinearProgressIndicator(
          value: pct,
          minHeight: 5,
          backgroundColor: const Color(0x33F0DEB4),
          color: AppColors.goldLight,
        ),
      ),
    ]);
  }

  Widget _reasoning(ValuationResult r) {
    final v = r.reasoning;
    return VaayuCard(
      child: Column(children: [
        _layer('01', 'Base value', formatInr(v.baseValue.amount), v.baseValue.rationale),
        _layer('02', 'Artist standing', '× ${v.artistMultiplier.multiplier}',
            v.artistMultiplier.rationale,
            tier: v.artistMultiplier.tier),
        _layer('03', 'Work adjustment', '× ${v.workAdjustment.multiplier}',
            v.workAdjustment.rationale,
            last: true),
      ]),
    );
  }

  Widget _layer(String n, String name, String value, String rationale,
          {String? tier, bool last = false}) =>
      Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          border: last ? null : const Border(bottom: BorderSide(color: AppColors.grey100)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Text(n, style: AppTypography.eyebrow.copyWith(color: AppColors.gold, fontSize: 11)),
            const SizedBox(width: 8),
            Expanded(
                child: Text(name, style: AppTypography.labelLarge.copyWith(color: AppColors.burgundy))),
            Text(value,
                style: AppTypography.bodyMedium
                    .copyWith(color: AppColors.gold, fontWeight: FontWeight.w600)),
          ]),
          if (tier != null && tier.isNotEmpty) ...[
            const SizedBox(height: 4),
            Padding(
              padding: const EdgeInsets.only(left: 27),
              child: Text(tier.toUpperCase(),
                  style: AppTypography.eyebrow.copyWith(color: AppColors.grey400, fontSize: 9)),
            ),
          ],
          if (rationale.isNotEmpty) ...[
            const SizedBox(height: 6),
            Padding(
              padding: const EdgeInsets.only(left: 27),
              child: Text(rationale, style: AppTypography.bodySmall),
            ),
          ],
        ]),
      );

  Widget _comparables(ValuationResult r) => VaayuCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            for (var i = 0; i < r.reasoning.comparables.length; i++) ...[
              if (i > 0) const Divider(height: 20, color: AppColors.grey100),
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Padding(
                  padding: EdgeInsets.only(top: 3),
                  child: Icon(Icons.circle, size: 5, color: AppColors.gold),
                ),
                const SizedBox(width: 10),
                Expanded(
                    child: Text(r.reasoning.comparables[i], style: AppTypography.bodySmall)),
              ]),
            ],
          ],
        ),
      );
}
