import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

/// Burgundy top bar with the Vaayu emblem + wordmark and optional actions.
class VaayuAppBar extends StatelessWidget implements PreferredSizeWidget {
  const VaayuAppBar({super.key, this.actions, this.onLogoTap, this.showBack = false});

  final List<Widget>? actions;
  final VoidCallback? onLogoTap;
  final bool showBack;

  @override
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.burgundy,
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top, left: 12, right: 16),
      child: SizedBox(
        height: 56,
        child: Row(
          children: [
            if (showBack)
              IconButton(
                icon: const Icon(Icons.arrow_back, color: AppColors.cream),
                onPressed: () => Navigator.of(context).maybePop(),
              )
            else
              const SizedBox(width: 8),
            GestureDetector(
              onTap: onLogoTap,
              behavior: HitTestBehavior.opaque,
              child: Row(
                children: [
                  Image.asset('assets/images/vaayu-mark.png', height: 26),
                  const SizedBox(width: 8),
                  Text('Vaayu',
                      style: AppTypography.headlineMedium.copyWith(color: AppColors.cream, fontSize: 22)),
                ],
              ),
            ),
            const Spacer(),
            ...?actions,
          ],
        ),
      ),
    );
  }
}

/// A cream-tinted icon action for the app bar.
class AppBarIconAction extends StatelessWidget {
  const AppBarIconAction({super.key, required this.icon, required this.onTap, this.tooltip});
  final IconData icon;
  final VoidCallback onTap;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(icon, color: AppColors.beige, size: 22),
      onPressed: onTap,
      tooltip: tooltip,
    );
  }
}
