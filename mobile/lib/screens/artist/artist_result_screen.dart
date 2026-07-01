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

/// Screen 13 — Artist pricing result.
class ArtistResultScreen extends StatelessWidget {
  const ArtistResultScreen({super.key, required this.result, this.image});

  final ArtistPricingResult result;
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
            if (r.belowCost) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.warningBg,
                  borderRadius: AppRadius.card,
                  border: Border.all(color: AppColors.gold),
                ),
                child: Text(
                  'Heads up: the recommended ask is below your direct costs of ${formatInr(r.costFloorInr)}. '
                  'Consider a higher positioning or lower costs.',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.warningText),
                ),
              ),
            ],
            if (r.costFloorInr > 0 || r.framingInr > 0 || r.shippingInr > 0) ...[
              const SizedBox(height: 16),
              _costs(r),
            ],
            if (r.channels.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text('Price by channel', style: AppTypography.displaySmall),
              const SizedBox(height: 4),
              Text('What to quote where. After deductions, you take home roughly the same.',
                  style: AppTypography.bodySmall),
              const SizedBox(height: 12),
              _channelTable(r),
            ],
            const SizedBox(height: 24),
            Text('How we got there', style: AppTypography.displaySmall),
            const SizedBox(height: 12),
            _reasoning(r),
            const SizedBox(height: 20),
            Text(kArtistPricingDisclaimer, style: AppTypography.bodySmall.copyWith(color: AppColors.grey400)),
            const SizedBox(height: 24),
            PrimaryButton(label: 'Price another artwork', onPressed: () => context.pop()),
            const SizedBox(height: 10),
            TertiaryButton(label: 'Done', onPressed: () => context.go('/')),
          ],
        ),
      ),
    );
  }

  Widget _hero(ArtistPricingResult r) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      decoration: const BoxDecoration(color: AppColors.burgundy, borderRadius: AppRadius.bigCard),
      child: Column(children: [
        EyebrowLabel('Recommended ask price', color: AppColors.goldLight),
        const SizedBox(height: 12),
        Text(formatInr(r.askInr), style: AppTypography.priceHero),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 16),
          decoration: const BoxDecoration(
            border: Border(
              top: BorderSide(color: Color(0x33F0DEB4)),
              bottom: BorderSide(color: Color(0x33F0DEB4)),
            ),
          ),
          child: Row(children: [
            _bandCell('Floor', formatInr(r.floorInr), false),
            _bandCell('Sweet spot', formatInr(r.askInr), true),
            _bandCell('Ceiling', formatInr(r.ceilingInr), false),
          ]),
        ),
        if (r.perSqFtInr > 0) ...[
          const SizedBox(height: 14),
          Text('Per square foot: ${formatInr(r.perSqFtInr)} / sq ft',
              style: AppTypography.bodySmall.copyWith(color: AppColors.beige.withValues(alpha: 0.7))),
        ],
      ]),
    );
  }

  Widget _bandCell(String label, String amount, bool mid) => Expanded(
        child: Column(children: [
          Text(label.toUpperCase(),
              style: AppTypography.eyebrow.copyWith(
                  color: AppColors.beige.withValues(alpha: 0.7), fontSize: 9, letterSpacing: 1.2)),
          const SizedBox(height: 4),
          Text(amount,
              style: mid
                  ? AppTypography.price.copyWith(color: AppColors.goldLight)
                  : AppTypography.headlineSmall.copyWith(color: AppColors.beige)),
        ]),
      );

  Widget _costs(ArtistPricingResult r) => VaayuCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          if (r.costFloorInr > 0) ...[
            Text('Your cost floor', style: AppTypography.headlineSmall),
            const SizedBox(height: 2),
            Text("Materials + your time. Don't sell below this.",
                style: AppTypography.bodySmall.copyWith(color: AppColors.grey400)),
            const SizedBox(height: 10),
            _row('Materials', formatInr(r.materialsInr)),
            _row('Your time', formatInr(r.labourInr)),
            _row('Cost floor', formatInr(r.costFloorInr), strong: true),
          ],
          if (r.framingInr > 0 || r.shippingInr > 0) ...[
            if (r.costFloorInr > 0) const Divider(height: 24),
            Text('Add-ons (buyer pays on top)', style: AppTypography.headlineSmall),
            const SizedBox(height: 10),
            if (r.framingInr > 0) _row('Framing', formatInr(r.framingInr)),
            if (r.shippingInr > 0) _row('Shipping', formatInr(r.shippingInr)),
          ],
        ]),
      );

  Widget _row(String label, String value, {bool strong = false}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(label,
              style: AppTypography.bodyMedium
                  .copyWith(color: strong ? AppColors.burgundy : AppColors.grey600, fontWeight: strong ? FontWeight.w600 : null)),
          Text(value,
              style: AppTypography.bodyMedium.copyWith(fontWeight: strong ? FontWeight.w600 : null, color: AppColors.burgundy)),
        ]),
      );

  Widget _channelTable(ArtistPricingResult r) => VaayuCard(
        padding: EdgeInsets.zero,
        child: Column(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(color: AppColors.gold.withValues(alpha: 0.06)),
            child: Row(children: [
              Expanded(flex: 3, child: _th('Channel')),
              Expanded(flex: 2, child: _th('Quote', right: true)),
              Expanded(flex: 2, child: _th('You net', right: true)),
            ]),
          ),
          for (final c in r.channels)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.grey100))),
              child: Row(children: [
                Expanded(
                    flex: 3,
                    child: Text(c.channel.label,
                        style: AppTypography.bodySmall.copyWith(color: AppColors.burgundy))),
                Expanded(
                    flex: 2,
                    child: Text(formatInr(c.quotedInr),
                        textAlign: TextAlign.right, style: AppTypography.price.copyWith(fontSize: 18))),
                Expanded(
                    flex: 2,
                    child: Text(formatInr(c.netInr),
                        textAlign: TextAlign.right, style: AppTypography.bodySmall.copyWith(color: AppColors.grey600))),
              ]),
            ),
        ]),
      );

  Widget _th(String s, {bool right = false}) => Text(s.toUpperCase(),
      textAlign: right ? TextAlign.right : TextAlign.left,
      style: AppTypography.eyebrow.copyWith(color: AppColors.grey600, fontSize: 10, letterSpacing: 1));

  Widget _reasoning(ArtistPricingResult r) {
    final v = r.valuation.reasoning;
    return VaayuCard(
      child: Column(children: [
        _layer('Base value', formatInr(v.baseValue.amount), v.baseValue.rationale),
        _layer('Artist multiplier', '× ${v.artistMultiplier.multiplier}', v.artistMultiplier.rationale),
        _layer('Work-level adjustment', '× ${v.workAdjustment.multiplier}', v.workAdjustment.rationale),
        _layer('Complexity', r.complexity.label, null),
        _layer('Market positioning', r.positioning.label, null),
        _layer('Posture', r.posture.label, null, last: true),
      ]),
    );
  }

  Widget _layer(String name, String value, String? rationale, {bool last = false}) => Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          border: last ? null : const Border(bottom: BorderSide(color: AppColors.grey100)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text(name, style: AppTypography.labelLarge.copyWith(color: AppColors.burgundy)),
            Text(value, style: AppTypography.bodySmall.copyWith(color: AppColors.gold, fontWeight: FontWeight.w600)),
          ]),
          if (rationale != null && rationale.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(rationale, style: AppTypography.bodySmall),
          ],
        ]),
      );
}
