import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// App theme. Cream canvas, burgundy ink, no content shadows (borders instead).
/// Most components are custom widgets; this sets sensible global defaults.
class AppTheme {
  static ThemeData get light {
    final base = ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.cream,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.burgundy,
        brightness: Brightness.light,
      ).copyWith(
        primary: AppColors.burgundy,
        secondary: AppColors.gold,
        surface: AppColors.cream,
        onPrimary: AppColors.cream,
        onSurface: AppColors.ink,
        error: AppColors.danger,
      ),
      splashFactory: InkRipple.splashFactory,
    );

    return base.copyWith(
      textTheme: GoogleFonts.jostTextTheme(base.textTheme)
          .apply(bodyColor: AppColors.ink, displayColor: AppColors.burgundy),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.burgundy,
        foregroundColor: AppColors.cream,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
      dividerTheme: const DividerThemeData(color: AppColors.grey100, thickness: 1, space: 1),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.burgundy,
        contentTextStyle: GoogleFonts.jost(color: AppColors.cream, fontSize: 14),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
