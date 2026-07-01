import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../engine/format.dart';
import '../../i18n/strings.dart';
import '../../services/history_service.dart';
import '../../state/auth.dart';
import '../../state/locale.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';
import '../artist/artist_result_screen.dart';
import '../collector/collector_result_screen.dart';

/// Screen 15 — Orders / history. Every past valuation & pricing, newest first.
class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen> {
  late Future<List<HistoryItem>> _future;

  @override
  void initState() {
    super.initState();
    _future = HistoryService(ref.read(supabaseProvider)).list();
  }

  Future<void> _refresh() async {
    final f = HistoryService(ref.read(supabaseProvider)).list();
    setState(() => _future = f);
    await f;
  }

  void _open(HistoryItem item) {
    if (item.isArtist && item.artist != null) {
      Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => ArtistResultScreen(result: item.artist!)));
    } else if (!item.isArtist && item.collector != null) {
      Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => CollectorResultScreen(result: item.collector!)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = ref.watch(stringsProvider);
    return Scaffold(
      appBar: const VaayuAppBar(showBack: true),
      body: SafeArea(
        child: FutureBuilder<List<HistoryItem>>(
          future: _future,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return Center(child: VaayuLoading(status: s.loadingHistory));
            }
            if (snap.hasError) {
              return _message('Could not load your history.', retry: true);
            }
            final items = snap.data ?? const [];
            if (items.isEmpty) return _empty(s);

            return RefreshIndicator(
              color: AppColors.gold,
              onRefresh: _refresh,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                children: [
                  EyebrowLabel(s.historyEyebrow),
                  const SizedBox(height: 6),
                  Text(s.valuationsAndPricings, style: AppTypography.displaySmall),
                  const SizedBox(height: 20),
                  for (final item in items) ...[
                    _card(item, s),
                    const SizedBox(height: 12),
                  ],
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _card(HistoryItem item, AppStrings s) {
    return GestureDetector(
      onTap: () => _open(item),
      child: VaayuCard(
        padding: const EdgeInsets.all(12),
        child: Row(children: [
          ClipRRect(
            borderRadius: AppRadius.input,
            child: SizedBox(
              width: 64,
              height: 64,
              child: item.imageUrl != null
                  ? Image.network(item.imageUrl!, fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _thumbFallback())
                  : _thumbFallback(),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                _tag(item.isArtist ? s.pricingTag : s.valuationTag, item.isArtist),
                const Spacer(),
                Text(DateFormat('d MMM y').format(item.createdAt),
                    style: AppTypography.bodySmall.copyWith(color: AppColors.grey400)),
              ]),
              const SizedBox(height: 6),
              Text(item.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.headlineSmall),
              const SizedBox(height: 2),
              Text(
                item.isArtist
                    ? '${s.askPrefix}${formatInr(item.amountInr)}'
                    : formatInr(item.amountInr),
                style: AppTypography.price.copyWith(fontSize: 18),
              ),
            ]),
          ),
          const Icon(Icons.chevron_right, color: AppColors.grey400),
        ]),
      ),
    );
  }

  Widget _thumbFallback() => Container(
        color: AppColors.sand,
        child: const Icon(Icons.image_outlined, color: AppColors.gold),
      );

  Widget _tag(String label, bool artist) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: (artist ? AppColors.gold : AppColors.burgundy).withValues(alpha: 0.08),
          borderRadius: AppRadius.chip,
        ),
        child: Text(label.toUpperCase(),
            style: AppTypography.eyebrow.copyWith(
                fontSize: 9,
                letterSpacing: 1,
                color: artist ? AppColors.gold : AppColors.burgundy)),
      );

  Widget _empty(AppStrings s) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.history, size: 48, color: AppColors.gold),
              const SizedBox(height: 16),
              Text(s.noValuations, style: AppTypography.headlineMedium),
              const SizedBox(height: 6),
              Text(s.noValuationsBody,
                  textAlign: TextAlign.center,
                  style: AppTypography.bodyMedium.copyWith(color: AppColors.grey600)),
              const SizedBox(height: 24),
              PrimaryButton(label: s.startValuation, onPressed: () => context.go('/')),
            ],
          ),
        ),
      );

  Widget _message(String text, {bool retry = false}) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(text, textAlign: TextAlign.center, style: AppTypography.bodyMedium),
            if (retry) ...[
              const SizedBox(height: 16),
              SecondaryButton(label: 'Retry', onPressed: _refresh),
            ],
          ]),
        ),
      );
}
