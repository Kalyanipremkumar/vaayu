import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../engine/enums.dart';
import '../state/app_mode.dart';
import '../state/auth.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';
import '../widgets/buttons.dart';
import '../widgets/common.dart';
import '../widgets/mode_toggle.dart';
import '../widgets/vaayu_app_bar.dart';

/// Screen 01 — Home. Burgundy hero with the mode toggle, headline, and the one
/// orange CTA, then a short methodology teaser on cream.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  void _start(BuildContext context, WidgetRef ref, bool artist) {
    final loggedIn = ref.read(currentUserProvider) != null;
    if (!loggedIn) {
      context.push('/register');
      return;
    }
    if (artist) {
      context.push('/artist');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Collector valuation is coming next.')),
      );
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(appModeProvider);
    final artist = mode == AppMode.artist;

    return Scaffold(
      appBar: VaayuAppBar(
        actions: [
          AppBarIconAction(icon: Icons.person_outline, onTap: () {}, tooltip: 'Account'),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Hero (burgundy)
            Container(
              color: AppColors.burgundy,
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
              child: Column(
                children: [
                  ModeToggle(mode: mode, onChanged: (m) => ref.read(appModeProvider.notifier).set(m)),
                  const SizedBox(height: 28),
                  Image.asset('assets/images/vaayu-mark.png', height: 88),
                  const SizedBox(height: 24),
                  EyebrowLabel(
                    artist ? 'AI · PRICING FOR ARTISTS' : 'AI · ART VALUATION',
                    color: AppColors.goldLight,
                    align: TextAlign.center,
                  ),
                  const SizedBox(height: 14),
                  _Headline(artist: artist),
                  const SizedBox(height: 14),
                  Text(
                    artist
                        ? 'Stop guessing. Get a defensible ask price for every piece — with a floor, a ceiling, and what to charge at each channel.'
                        : 'Upload a photograph, add a little context, and get an AI valuation with a defensible, layer-by-layer pricing report.',
                    textAlign: TextAlign.center,
                    style: AppTypography.bodyMedium.copyWith(color: AppColors.beige, height: 1.5),
                  ),
                  const SizedBox(height: 28),
                  PrimaryButton(
                    label: artist ? 'Get my recommended price' : "Get started — it's free",
                    icon: Icons.arrow_forward,
                    onPressed: () => _start(context, ref, artist),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    artist
                        ? 'For guidance only — not a guarantee of sale.'
                        : 'Your first valuations are free. AI guidance, not a certified appraisal.',
                    textAlign: TextAlign.center,
                    style: AppTypography.eyebrow.copyWith(
                      color: AppColors.beige.withValues(alpha: 0.6),
                      letterSpacing: 0.2,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),

            // Methodology teaser (cream)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 36, 20, 40),
              child: Column(
                children: [
                  const EyebrowLabel('The methodology', align: TextAlign.center),
                  const SizedBox(height: 8),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: AppTypography.displaySmall,
                      children: [
                        const TextSpan(text: 'Three layers, '),
                        TextSpan(text: 'fully shown', style: AppTypography.emphasis(AppTypography.displaySmall)),
                        const TextSpan(text: '.'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  const _LayerCard(n: '01', title: 'Base value', body: 'A market benchmark from the tradition and medium.'),
                  const SizedBox(height: 10),
                  const _LayerCard(n: '02', title: 'Artist standing', body: 'Recognition tier, from emerging to renowned.'),
                  const SizedBox(height: 10),
                  const _LayerCard(n: '03', title: 'Work adjustment', body: 'Condition, size, materials, rarity, provenance.'),
                  const SizedBox(height: 32),
                  Text('Vaayu — the spirit of the work, valued.',
                      textAlign: TextAlign.center,
                      style: AppTypography.headlineSmall.copyWith(
                          color: AppColors.gold, fontStyle: FontStyle.italic)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Headline extends StatelessWidget {
  const _Headline({required this.artist});
  final bool artist;

  @override
  Widget build(BuildContext context) {
    final base = AppTypography.displayMedium.copyWith(color: AppColors.cream, height: 1.1);
    final emph = base.copyWith(fontStyle: FontStyle.italic, color: AppColors.goldLight);
    return RichText(
      textAlign: TextAlign.center,
      text: artist
          ? TextSpan(style: base, children: [
              const TextSpan(text: 'Price your art with '),
              TextSpan(text: 'confidence', style: emph),
              const TextSpan(text: '.'),
            ])
          : TextSpan(style: base, children: [
              const TextSpan(text: 'Know what your art is '),
              TextSpan(text: 'worth', style: emph),
              const TextSpan(text: '.'),
            ]),
    );
  }
}

class _LayerCard extends StatelessWidget {
  const _LayerCard({required this.n, required this.title, required this.body});
  final String n;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return VaayuCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(n, style: AppTypography.displaySmall.copyWith(color: AppColors.gold, fontSize: 34)),
          const SizedBox(height: 6),
          Text(title, style: AppTypography.headlineMedium),
          const SizedBox(height: 6),
          Text(body, style: AppTypography.bodySmall),
        ],
      ),
    );
  }
}
