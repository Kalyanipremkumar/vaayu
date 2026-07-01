import 'package:flutter/material.dart';

/// Vaayu / Varnam Studio colour tokens (per the Flutter UI spec).
/// Never hardcode a hex in a widget — reference these.
class AppColors {
  // Primary brand
  static const burgundy = Color(0xFF3E1324);
  static const burgundyDark = Color(0xFF2A0D18);
  static const beige = Color(0xFFF0DEB4);
  static const orange = Color(0xFFF9923E);
  static const orangeHover = Color(0xFFE8852E);
  static const teal = Color(0xFF183A47); // accent only
  static const gold = Color(0xFFAB8838);
  static const goldLight = Color(0xFFD4B85C);

  // Surfaces
  static const cream = Color(0xFFFFFDF8);
  static const white = Color(0xFFFFFFFF);
  static const sand = Color(0xFFFEF0E0);

  // Greyscale
  static const grey50 = Color(0xFFF5F0E8);
  static const grey100 = Color(0xFFE8DFD0);
  static const grey200 = Color(0xFFC9BFAE);
  static const grey400 = Color(0xFF8A8576);
  static const grey600 = Color(0xFF5C5C5C);
  static const grey700 = Color(0xFF3D3D3D);
  static const ink = Color(0xFF1A0A05);

  // Semantic
  static const danger = Color(0xFFC44536);
  static const success = Color(0xFF2D7D5F);
  static const successBg = Color(0xFFE1F5EE);
  static const warningBg = Color(0xFFFAEEDA);
  static const warningText = Color(0xFF6B3F00);
}

/// Spacing scale (base unit 16).
class AppSpacing {
  static const double xxs = 4;
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;
  static const double screenPad = 20;
  static const double cardPad = 20;
  static const double sectionGap = 24;
}

/// Border radii.
class AppRadius {
  static const chip = BorderRadius.all(Radius.circular(4));
  static const input = BorderRadius.all(Radius.circular(8));
  static const card = BorderRadius.all(Radius.circular(12));
  static const bigCard = BorderRadius.all(Radius.circular(16));
  static const pill = BorderRadius.all(Radius.circular(28));
  static const avatar = BorderRadius.all(Radius.circular(999));
}

/// Motion — subtle, never bouncy.
class AppMotion {
  static const fast = Duration(milliseconds: 150);
  static const normal = Duration(milliseconds: 250);
  static const slow = Duration(milliseconds: 400);
  static const curve = Curves.easeInOutCubic;
  static const emphasized = Curves.easeOutQuint;
}
