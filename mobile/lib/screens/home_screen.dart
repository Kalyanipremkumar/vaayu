import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// Branded landing screen. A burgundy hero with the emblem, a Collector/Artist
/// toggle, the headline + lead, and the primary CTA — all native widgets.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _artist = false;

  @override
  Widget build(BuildContext context) {
    final eyebrow = _artist ? 'AI · PRICING FOR ARTISTS' : 'AI · ART VALUATION';
    final title = _artist ? 'Price your art with confidence.' : 'Know what your art is worth.';
    final lead = _artist
        ? 'Stop guessing. Get a defensible ask price for every piece — with a floor, a ceiling, and what to charge at each channel.'
        : 'Upload a photograph, add a little context, and get an AI valuation with a defensible, layer-by-layer pricing report.';
    final cta = _artist ? 'Get my recommended price' : "Get started — it's free";

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top brand row
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Row(
                    children: [
                      Image.asset('assets/images/vaayu-mark.png', height: 34),
                      const SizedBox(width: 10),
                      Text('Vaayu', style: AppTheme.heading(26)),
                    ],
                  ),
                ),

                // Hero card
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.burgundy,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
                  child: Column(
                    children: [
                      Image.asset('assets/images/vaayu-mark.png', height: 96),
                      const SizedBox(height: 24),
                      _ModeToggle(
                        artist: _artist,
                        onChanged: (v) => setState(() => _artist = v),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        eyebrow,
                        textAlign: TextAlign.center,
                        style: AppTheme.body(11, color: AppColors.gold, letterSpacing: 3)
                            .copyWith(fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        title,
                        textAlign: TextAlign.center,
                        style: AppTheme.heading(38, color: AppColors.cream, height: 1.05),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        lead,
                        textAlign: TextAlign.center,
                        style: AppTheme.body(15, color: AppColors.cream70),
                      ),
                      const SizedBox(height: 28),
                      FilledButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Sign-in & flows coming next.')),
                          );
                        },
                        child: Text(cta),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 40),

                // Methodology teaser
                Text('The methodology', textAlign: TextAlign.center, style: AppTheme.body(11, color: AppColors.gold, letterSpacing: 2).copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Text('Three layers, fully shown.', textAlign: TextAlign.center, style: AppTheme.heading(30)),
                const SizedBox(height: 20),
                const _LayerCard(n: '01', title: 'Base value', body: 'A market benchmark from the tradition and medium.'),
                const SizedBox(height: 10),
                const _LayerCard(n: '02', title: 'Artist multiplier', body: 'Recognition tier, from emerging to renowned.'),
                const SizedBox(height: 10),
                const _LayerCard(n: '03', title: 'Work adjustment', body: 'Condition, size, materials, rarity, provenance.'),

                const SizedBox(height: 36),
                Text('Vaayu — the spirit of the work, valued.',
                    textAlign: TextAlign.center,
                    style: AppTheme.heading(18, color: AppColors.gold, style: FontStyle.italic)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ModeToggle extends StatelessWidget {
  const _ModeToggle({required this.artist, required this.onChanged});
  final bool artist;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.cream.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _seg('For Collectors', !artist, () => onChanged(false)),
          _seg('For Artists', artist, () => onChanged(true)),
        ],
      ),
    );
  }

  Widget _seg(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
        decoration: BoxDecoration(
          color: active ? AppColors.orange : Colors.transparent,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          label,
          style: AppTheme.body(14, color: active ? AppColors.cream : AppColors.cream70),
        ),
      ),
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
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(n, style: AppTheme.heading(34, color: AppColors.gold)),
          const SizedBox(height: 6),
          Text(title, style: AppTheme.heading(22)),
          const SizedBox(height: 6),
          Text(body, style: AppTheme.body(14)),
        ],
      ),
    );
  }
}
