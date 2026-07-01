import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';

/// Screen 08 — Artist intro. What you'll get before the wizard.
class ArtistIntroScreen extends StatelessWidget {
  const ArtistIntroScreen({super.key});

  static const _items = [
    ('01', 'A defensible ask price', 'One clear number to quote — plus a floor and a ceiling so you know where you can flex.'),
    ('02', 'Channel-specific pricing', 'What to charge at a gallery, direct, at fairs, and on commission — so your take-home stays the same.'),
    ('03', 'A cost floor', 'Materials + your time, so you never sell at a loss.'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const VaayuAppBar(showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const EyebrowLabel('How this works'),
            const SizedBox(height: 6),
            RichText(
              text: TextSpan(style: AppTypography.displayMedium, children: [
                const TextSpan(text: 'Three things you\'ll '),
                TextSpan(text: 'get', style: AppTypography.emphasis(AppTypography.displayMedium)),
              ]),
            ),
            const SizedBox(height: 8),
            Text('More than a number — the full pricing toolkit.', style: AppTypography.bodyMedium),
            const SizedBox(height: 24),
            for (final it in _items) ...[
              VaayuCard(
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(color: AppColors.gold, borderRadius: AppRadius.avatar),
                    child: Text(it.$1, style: AppTypography.headlineSmall.copyWith(color: AppColors.burgundy)),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(it.$2, style: AppTypography.headlineSmall),
                      const SizedBox(height: 4),
                      Text(it.$3, style: AppTypography.bodySmall),
                    ]),
                  ),
                ]),
              ),
              const SizedBox(height: 12),
            ],
            const SizedBox(height: 12),
            PrimaryButton(label: 'Begin', icon: Icons.arrow_forward, onPressed: () => context.push('/artist/wizard')),
          ],
        ),
      ),
    );
  }
}
