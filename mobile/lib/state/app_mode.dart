import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../engine/enums.dart';

/// Collector / Artist mode, persisted across launches (mirrors the web toggle).
class AppModeNotifier extends Notifier<AppMode> {
  static const _key = 'vaayu_mode';

  @override
  AppMode build() {
    _load();
    return AppMode.collector;
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getString(_key) == 'artist') state = AppMode.artist;
  }

  Future<void> set(AppMode mode) async {
    state = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, mode == AppMode.artist ? 'artist' : 'collector');
  }
}

final appModeProvider = NotifierProvider<AppModeNotifier, AppMode>(AppModeNotifier.new);
