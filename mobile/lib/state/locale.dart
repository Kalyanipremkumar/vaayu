import 'dart:ui';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../i18n/strings.dart';

const _prefKey = 'vaayu_lang';

/// The active app language ('en' | 'hi'), persisted across launches.
class LocaleNotifier extends Notifier<Locale> {
  @override
  Locale build() {
    _load();
    return const Locale('en');
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_prefKey);
    if (code == 'hi' || code == 'en') state = Locale(code!);
  }

  Future<void> set(Locale locale) async {
    state = locale;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefKey, locale.languageCode);
  }

  void toggle() => set(state.languageCode == 'hi' ? const Locale('en') : const Locale('hi'));
}

final localeProvider = NotifierProvider<LocaleNotifier, Locale>(LocaleNotifier.new);

/// The active string set, derived from [localeProvider].
final stringsProvider = Provider<AppStrings>(
  (ref) => ref.watch(localeProvider).languageCode == 'hi' ? AppStrings.hi : AppStrings.en,
);
