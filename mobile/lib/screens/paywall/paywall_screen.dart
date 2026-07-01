import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../services/payment_service.dart';
import '../../services/valuation_service.dart' show PaymentProof, PaymentsUnconfiguredException;
import '../../state/auth.dart';
import '../../state/locale.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';

/// Screen 10 — Paywall. First valuation is free; each further valuation is ₹99.
/// Completes the checkout and pops with a verified [PaymentProof].
class PaywallScreen extends ConsumerStatefulWidget {
  const PaywallScreen({super.key});

  @override
  ConsumerState<PaywallScreen> createState() => _PaywallScreenState();
}

class _PaywallScreenState extends ConsumerState<PaywallScreen> {
  bool _paying = false;
  String? _error;

  Future<void> _pay() async {
    setState(() {
      _paying = true;
      _error = null;
    });
    try {
      final user = ref.read(currentUserProvider);
      final proof = await PaymentService(ref.read(supabaseProvider)).payForValuation(
        contactEmail: user?.email,
        contactPhone: user?.phone,
      );
      if (mounted) Navigator.of(context).pop(proof);
    } on PaymentsUnconfiguredException {
      if (mounted) {
        setState(() => _error = 'Payments aren’t set up yet. Please try again later.');
      }
    } on PaymentCancelledException catch (e) {
      if (mounted) {
        setState(() => _error = e.message?.isNotEmpty == true
            ? 'Payment didn’t complete: ${e.message}'
            : 'Payment was cancelled.');
      }
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = ref.watch(stringsProvider);
    return Scaffold(
      appBar: const VaayuAppBar(showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                decoration:
                    const BoxDecoration(color: AppColors.burgundy, borderRadius: AppRadius.bigCard),
                child: Column(children: [
                  EyebrowLabel(s.freeUsed, color: AppColors.goldLight),
                  const SizedBox(height: 16),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: AppTypography.displayMedium.copyWith(color: AppColors.cream),
                      children: [
                        const TextSpan(text: '₹'),
                        TextSpan(text: '99', style: AppTypography.priceHero),
                      ],
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(s.perValuation,
                      style: AppTypography.bodyMedium.copyWith(color: AppColors.beige)),
                ]),
              ),
              const SizedBox(height: 24),

              Text(s.whatYouGet, style: AppTypography.displaySmall),
              const SizedBox(height: 12),
              _perk(s.perk1),
              _perk(s.perk2),
              _perk(s.perk3),
              _perk(s.perk4),
              const SizedBox(height: 24),

              if (_error != null) ...[ErrorBanner(_error!), const SizedBox(height: 16)],
              PrimaryButton(
                label: s.payAndContinue,
                icon: Icons.lock_open,
                loading: _paying,
                onPressed: _pay,
              ),
              const SizedBox(height: 10),
              Center(
                child: TertiaryButton(
                    label: s.notNow, onPressed: () => Navigator.of(context).pop()),
              ),
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.shield_outlined, size: 14, color: AppColors.grey400),
                const SizedBox(width: 6),
                Text(s.securePayment,
                    style: AppTypography.bodySmall.copyWith(color: AppColors.grey400)),
              ]),
            ],
          ),
        ),
      ),
    );
  }

  Widget _perk(String text) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 7),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(Icons.check_circle, size: 18, color: AppColors.gold),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: AppTypography.bodyMedium)),
        ]),
      );
}
