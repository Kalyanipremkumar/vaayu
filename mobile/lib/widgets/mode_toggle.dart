import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../engine/enums.dart';
import '../state/locale.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

/// For Collectors / For Artists pill. Active segment is gold (orange stays
/// reserved for the one CTA per screen). Sits on a burgundy surface.
class ModeToggle extends ConsumerWidget {
  const ModeToggle({super.key, required this.mode, required this.onChanged});

  final AppMode mode;
  final ValueChanged<AppMode> onChanged;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(stringsProvider);
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.cream.withValues(alpha: 0.08),
        borderRadius: AppRadius.pill,
      ),
      child: Row(
        children: [
          _seg(context, s.forCollectors, mode == AppMode.collector, () => onChanged(AppMode.collector)),
          _seg(context, s.forArtists, mode == AppMode.artist, () => onChanged(AppMode.artist)),
        ],
      ),
    );
  }

  Widget _seg(BuildContext context, String label, bool active, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          alignment: Alignment.center,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? AppColors.gold : Colors.transparent,
            borderRadius: AppRadius.pill,
          ),
          child: Text(
            label,
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.w500,
              color: active ? AppColors.burgundy : AppColors.beige,
            ),
          ),
        ),
      ),
    );
  }
}
