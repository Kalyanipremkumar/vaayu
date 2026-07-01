import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../engine/enums.dart';
import '../../state/app_mode.dart';
import '../../state/auth.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/mode_toggle.dart';
import '../../widgets/vaayu_app_bar.dart';

/// Screen 14 — Account & settings. Identity, default mode, sign out.
class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  Future<void> _signOut(BuildContext context, WidgetRef ref) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cream,
        title: Text('Sign out?', style: AppTypography.headlineMedium),
        content: Text('You can sign back in any time.', style: AppTypography.bodyMedium),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text('Cancel',
                  style: AppTypography.bodyMedium.copyWith(color: AppColors.grey600))),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: Text('Sign out',
                  style: AppTypography.bodyMedium.copyWith(color: AppColors.danger))),
        ],
      ),
    );
    if (ok != true) return;
    await ref.read(authServiceProvider).signOut();
    if (context.mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final mode = ref.watch(appModeProvider);
    final name = (user?.userMetadata?['full_name'] as String?)?.trim();
    final identity = user?.phone?.isNotEmpty == true
        ? '+${user!.phone}'
        : (user?.email ?? 'Not signed in');

    return Scaffold(
      appBar: const VaayuAppBar(showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Identity card
              VaayuCard(
                child: Row(children: [
                  Container(
                    width: 56,
                    height: 56,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                        color: AppColors.burgundy, borderRadius: AppRadius.avatar),
                    child: Text(
                      (name?.isNotEmpty == true ? name![0] : 'V').toUpperCase(),
                      style: AppTypography.headlineMedium.copyWith(color: AppColors.goldLight),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(name?.isNotEmpty == true ? name! : 'Welcome',
                          style: AppTypography.headlineSmall),
                      const SizedBox(height: 2),
                      Text(identity, style: AppTypography.bodySmall.copyWith(color: AppColors.grey600)),
                    ]),
                  ),
                ]),
              ),
              const SizedBox(height: 28),

              const EyebrowLabel('Default mode'),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(4),
                decoration:
                    const BoxDecoration(color: AppColors.burgundy, borderRadius: AppRadius.pill),
                child: ModeToggle(
                    mode: mode, onChanged: (m) => ref.read(appModeProvider.notifier).set(m)),
              ),
              const SizedBox(height: 8),
              Text(
                mode == AppMode.artist
                    ? 'You open into forward pricing for your own work.'
                    : 'You open into valuing works you collect.',
                style: AppTypography.bodySmall.copyWith(color: AppColors.grey400),
              ),
              const SizedBox(height: 28),

              if (user != null) ...[
                GestureDetector(
                  onTap: () => context.push('/orders'),
                  child: VaayuCard(
                    child: Row(children: [
                      const Icon(Icons.history, color: AppColors.gold),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text('Your history', style: AppTypography.headlineSmall),
                          Text('Past valuations & pricings',
                              style: AppTypography.bodySmall.copyWith(color: AppColors.grey600)),
                        ]),
                      ),
                      const Icon(Icons.chevron_right, color: AppColors.grey400),
                    ]),
                  ),
                ),
                const SizedBox(height: 28),
              ],

              const EyebrowLabel('About'),
              const SizedBox(height: 8),
              _row('Vaayu', 'the spirit of the work, valued'),
              const Divider(height: 1, color: AppColors.grey100),
              _row('Guidance', 'AI estimates — not a certified appraisal'),
              const SizedBox(height: 32),

              if (user != null)
                SecondaryButton(
                    label: 'Sign out',
                    icon: Icons.logout,
                    onPressed: () => _signOut(context, ref))
              else
                PrimaryButton(label: 'Sign in', onPressed: () => context.push('/register')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Row(children: [
          Text(label, style: AppTypography.labelLarge.copyWith(color: AppColors.burgundy)),
          const Spacer(),
          Flexible(
            child: Text(value,
                textAlign: TextAlign.right,
                style: AppTypography.bodySmall.copyWith(color: AppColors.grey600)),
          ),
        ]),
      );
}
