import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

/// Uppercase, letter-spaced eyebrow label.
class EyebrowLabel extends StatelessWidget {
  const EyebrowLabel(this.text, {super.key, this.color, this.align});
  final String text;
  final Color? color;
  final TextAlign? align;

  @override
  Widget build(BuildContext context) {
    return Text(text.toUpperCase(),
        textAlign: align, style: AppTypography.eyebrow.copyWith(color: color ?? AppColors.gold));
  }
}

/// Uppercase chip; white by default, gold when selected.
class VaayuChip extends StatelessWidget {
  const VaayuChip({super.key, required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? AppColors.gold : AppColors.white,
          borderRadius: AppRadius.chip,
          border: Border.all(color: selected ? AppColors.gold : AppColors.grey100),
        ),
        child: Text(
          label.toUpperCase(),
          style: AppTypography.eyebrow.copyWith(
            fontSize: 10,
            letterSpacing: 1,
            color: selected ? AppColors.white : AppColors.grey700,
          ),
        ),
      ),
    );
  }
}

/// A white card with a hairline border (no shadow — per brand).
class VaayuCard extends StatelessWidget {
  const VaayuCard({super.key, required this.child, this.padding = const EdgeInsets.all(20)});
  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: AppRadius.card,
        border: Border.all(color: AppColors.grey100),
      ),
      child: child,
    );
  }
}

/// Wizard progress pills: done (burgundy), active (gold), upcoming (grey).
class StepperPills extends StatelessWidget {
  const StepperPills({super.key, required this.count, required this.current});
  final int count;
  final int current; // 0-indexed active step

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(count, (i) {
        final color =
            i < current ? AppColors.burgundy : (i == current ? AppColors.gold : AppColors.grey100);
        return Expanded(
          child: Container(
            height: 4,
            margin: EdgeInsets.only(right: i == count - 1 ? 0 : 4),
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
          ),
        );
      }),
    );
  }
}

/// Gold ring loading indicator with a status + substatus.
class VaayuLoading extends StatelessWidget {
  const VaayuLoading({super.key, required this.status, this.substatus});
  final String status;
  final String? substatus;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const SizedBox(
          width: 48,
          height: 48,
          child: CircularProgressIndicator(strokeWidth: 3, color: AppColors.gold),
        ),
        const SizedBox(height: 20),
        Text(status, style: AppTypography.bodyMedium.copyWith(color: AppColors.burgundy, fontWeight: FontWeight.w500)),
        if (substatus != null) ...[
          const SizedBox(height: 4),
          Text(substatus!, style: AppTypography.bodySmall.copyWith(color: AppColors.grey400)),
        ],
      ],
    );
  }
}

/// A green success banner.
class SuccessBanner extends StatelessWidget {
  const SuccessBanner(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.successBg,
        borderRadius: AppRadius.input,
        border: Border.all(color: AppColors.success.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          const Icon(Icons.check_circle_outline, size: 18, color: AppColors.success),
          const SizedBox(width: 8),
          Expanded(
            child: Text(text, style: AppTypography.bodySmall.copyWith(color: AppColors.success)),
          ),
        ],
      ),
    );
  }
}

/// An error banner (danger).
class ErrorBanner extends StatelessWidget {
  const ErrorBanner(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.danger.withValues(alpha: 0.08),
        borderRadius: AppRadius.input,
        border: Border.all(color: AppColors.danger.withValues(alpha: 0.4)),
      ),
      child: Text(text, style: AppTypography.bodySmall.copyWith(color: AppColors.danger)),
    );
  }
}
