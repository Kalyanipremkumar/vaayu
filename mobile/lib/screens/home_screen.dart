import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../engine/enums.dart';
import '../state/app_mode.dart';
import '../state/auth.dart';
import '../state/locale.dart';
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
    context.push(artist ? '/artist' : '/collector');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(appModeProvider);
    final s = ref.watch(stringsProvider);
    final artist = mode == AppMode.artist;

    return Scaffold(
      appBar: VaayuAppBar(
        actions: [
          AppBarIconAction(
              icon: Icons.person_outline,
              onTap: () => context.push('/account'),
              tooltip: 'Account'),
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
                    artist ? s.eyebrowArtist : s.eyebrowCollector,
                    color: AppColors.goldLight,
                    align: TextAlign.center,
                  ),
                  const SizedBox(height: 14),
                  _Headline(
                    pre: artist ? s.headlineArtistPre : s.headlineCollectorPre,
                    emph: artist ? s.headlineArtistEmph : s.headlineCollectorEmph,
                    post: artist ? s.headlineArtistPost : s.headlineCollectorPost,
                  ),
                  const SizedBox(height: 14),
                  Text(
                    artist ? s.leadArtist : s.leadCollector,
                    textAlign: TextAlign.center,
                    style: AppTypography.bodyMedium.copyWith(color: AppColors.beige, height: 1.5),
                  ),
                  const SizedBox(height: 28),
                  PrimaryButton(
                    label: artist ? s.ctaArtist : s.ctaCollector,
                    icon: Icons.arrow_forward,
                    onPressed: () => _start(context, ref, artist),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    artist ? s.disclaimerArtist : s.disclaimerCollector,
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
                  EyebrowLabel(s.methodologyEyebrow, align: TextAlign.center),
                  const SizedBox(height: 8),
                  RichText(
                    textAlign: TextAlign.center,
                    text: TextSpan(
                      style: AppTypography.displaySmall,
                      children: [
                        TextSpan(text: s.methodologyTitlePre),
                        TextSpan(
                            text: s.methodologyTitleEmph,
                            style: AppTypography.emphasis(AppTypography.displaySmall)),
                        const TextSpan(text: '.'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  _LayerCard(n: '01', title: s.layer1Title, body: s.layer1Body),
                  const SizedBox(height: 10),
                  _LayerCard(n: '02', title: s.layer2Title, body: s.layer2Body),
                  const SizedBox(height: 10),
                  _LayerCard(n: '03', title: s.layer3Title, body: s.layer3Body),
                  const SizedBox(height: 32),
                  Text(s.brandTagline,
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
  const _Headline({required this.pre, required this.emph, required this.post});
  final String pre;
  final String emph;
  final String post;

  @override
  Widget build(BuildContext context) {
    final base = AppTypography.displayMedium.copyWith(color: AppColors.cream, height: 1.1);
    final emphStyle = base.copyWith(fontStyle: FontStyle.italic, color: AppColors.goldLight);
    return RichText(
      textAlign: TextAlign.center,
      text: TextSpan(style: base, children: [
        TextSpan(text: pre),
        TextSpan(text: emph, style: emphStyle),
        TextSpan(text: post),
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
