import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../engine/enums.dart';
import '../../state/app_mode.dart';
import '../../state/auth.dart';
import '../../state/locale.dart';
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
    final s = ref.read(stringsProvider);
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.cream,
        title: Text(s.signOutConfirm, style: AppTypography.headlineMedium),
        content: Text(s.signBackIn, style: AppTypography.bodyMedium),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: Text(s.cancel,
                  style: AppTypography.bodyMedium.copyWith(color: AppColors.grey600))),
          TextButton(
              onPressed: () => Navigator.pop(ctx, true),
              child: Text(s.signOut,
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
    final s = ref.watch(stringsProvider);
    final locale = ref.watch(localeProvider);
    final name = (user?.userMetadata?['full_name'] as String?)?.trim();
    final identity = user?.phone?.isNotEmpty == true
        ? '+${user!.phone}'
        : (user?.email ?? '—');

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
                      Text(name?.isNotEmpty == true ? name! : s.welcome,
                          style: AppTypography.headlineSmall),
                      const SizedBox(height: 2),
                      Text(identity, style: AppTypography.bodySmall.copyWith(color: AppColors.grey600)),
                    ]),
                  ),
                ]),
              ),
              const SizedBox(height: 28),

              EyebrowLabel(s.defaultMode),
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
                mode == AppMode.artist ? s.defaultModeArtist : s.defaultModeCollector,
                style: AppTypography.bodySmall.copyWith(color: AppColors.grey400),
              ),
              const SizedBox(height: 28),

              // Language / भाषा
              const EyebrowLabel('Language · भाषा'),
              const SizedBox(height: 10),
              Row(children: [
                _langPill(context, ref, 'English', locale.languageCode == 'en', const Locale('en')),
                const SizedBox(width: 8),
                _langPill(context, ref, 'हिंदी', locale.languageCode == 'hi', const Locale('hi')),
              ]),
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
                          Text(s.yourHistory, style: AppTypography.headlineSmall),
                          Text(s.historySubtitle,
                              style: AppTypography.bodySmall.copyWith(color: AppColors.grey600)),
                        ]),
                      ),
                      const Icon(Icons.chevron_right, color: AppColors.grey400),
                    ]),
                  ),
                ),
                const SizedBox(height: 28),
              ],

              EyebrowLabel(s.about),
              const SizedBox(height: 8),
              _row(s.guidance, s.guidanceValue),
              const SizedBox(height: 32),

              if (user != null)
                SecondaryButton(
                    label: s.signOut,
                    icon: Icons.logout,
                    onPressed: () => _signOut(context, ref))
              else
                PrimaryButton(label: s.signIn, onPressed: () => context.push('/register')),
            ],
          ),
        ),
      ),
    );
  }

  Widget _langPill(
          BuildContext context, WidgetRef ref, String label, bool selected, Locale locale) =>
      Expanded(
        child: GestureDetector(
          onTap: () => ref.read(localeProvider.notifier).set(locale),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(vertical: 14),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: selected ? AppColors.gold : AppColors.white,
              borderRadius: AppRadius.input,
              border: Border.all(color: selected ? AppColors.gold : AppColors.grey100),
            ),
            child: Text(label,
                style: AppTypography.labelLarge
                    .copyWith(color: selected ? AppColors.white : AppColors.grey700)),
          ),
        ),
      );

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
