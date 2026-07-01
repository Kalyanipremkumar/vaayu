import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';

/// Type scale per the Flutter UI spec. Cormorant Garamond for editorial weight,
/// Jost for utility, Noto Sans Devanagari for Hindi. (Fonts via google_fonts.)
class AppTypography {
  static TextStyle _cormorant(
    double size, {
    FontWeight weight = FontWeight.w500,
    Color color = AppColors.burgundy,
    double height = 1.15,
    FontStyle style = FontStyle.normal,
  }) =>
      GoogleFonts.cormorantGaramond(
          fontSize: size, fontWeight: weight, color: color, height: height, fontStyle: style);

  static TextStyle _jost(
    double size, {
    FontWeight weight = FontWeight.w400,
    Color color = AppColors.ink,
    double height = 1.5,
    double? letterSpacing,
  }) =>
      GoogleFonts.jost(
          fontSize: size,
          fontWeight: weight,
          color: color,
          height: height,
          letterSpacing: letterSpacing);

  // Display (Cormorant)
  static TextStyle get displayLarge => _cormorant(44);
  static TextStyle get displayMedium => _cormorant(36);
  static TextStyle get displaySmall => _cormorant(28, height: 1.2);
  static TextStyle get headlineMedium => _cormorant(20, height: 1.2);
  static TextStyle get headlineSmall => _cormorant(18, height: 1.25);

  // Body (Jost)
  static TextStyle get bodyLarge => _jost(16);
  static TextStyle get bodyMedium => _jost(14);
  static TextStyle get bodySmall => _jost(13, color: AppColors.grey600);
  static TextStyle get labelLarge => _jost(14, weight: FontWeight.w500);
  static TextStyle get labelMedium => _jost(12, weight: FontWeight.w500);
  static TextStyle get eyebrow =>
      _jost(10, weight: FontWeight.w500, color: AppColors.gold, height: 1.4, letterSpacing: 1.5);

  // Prices (Cormorant)
  static TextStyle get price => _cormorant(28, color: AppColors.gold);
  static TextStyle get priceHero => _cormorant(52, color: AppColors.goldLight, height: 1.0);

  /// Italic + gold emphasis for inline heading spans.
  static TextStyle emphasis(TextStyle base) =>
      base.copyWith(fontStyle: FontStyle.italic, color: AppColors.gold);

  static TextStyle devanagari(double size,
          {FontWeight weight = FontWeight.w400, Color color = AppColors.ink, double height = 1.5}) =>
      GoogleFonts.notoSansDevanagari(
          fontSize: size, fontWeight: weight, color: color, height: height);
}
