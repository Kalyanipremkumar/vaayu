import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../state/locale.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';

/// Screen 05 — Collector intro. The three-layer methodology on its own screen,
/// then Begin → the upload. Mirrors the artist intro so both flows read the same.
class CollectorIntroScreen extends ConsumerWidget {
  const CollectorIntroScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(stringsProvider);
    final layers = [
      ('01', s.layer1Title, s.layer1Body),
      ('02', s.layer2Title, s.layer2Body),
      ('03', s.layer3Title, s.layer3Body),
    ];

    return Scaffold(
      appBar: const VaayuAppBar(showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            EyebrowLabel(s.methodologyEyebrow),
            const SizedBox(height: 6),
            RichText(
              text: TextSpan(style: AppTypography.displayMedium, children: [
                TextSpan(text: s.methodologyTitlePre),
                TextSpan(
                    text: s.methodologyTitleEmph,
                    style: AppTypography.emphasis(AppTypography.displayMedium)),
                const TextSpan(text: '.'),
              ]),
            ),
            const SizedBox(height: 8),
            Text(s.methodologyLead, style: AppTypography.bodyMedium),
            const SizedBox(height: 24),
            for (final it in layers) ...[
              VaayuCard(
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration:
                        const BoxDecoration(color: AppColors.gold, borderRadius: AppRadius.avatar),
                    child: Text(it.$1,
                        style: AppTypography.headlineSmall.copyWith(color: AppColors.burgundy)),
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
            PrimaryButton(
                label: s.begin,
                icon: Icons.arrow_forward,
                onPressed: () => context.push('/collector')),
            const SizedBox(height: 16),
            Text(s.brandTagline,
                textAlign: TextAlign.center,
                style: AppTypography.headlineSmall
                    .copyWith(color: AppColors.gold, fontStyle: FontStyle.italic)),
          ],
        ),
      ),
    );
  }
}
