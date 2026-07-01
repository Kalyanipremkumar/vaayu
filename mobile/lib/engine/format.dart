import 'package:intl/intl.dart';

final NumberFormat _inr = NumberFormat.currency(
  locale: 'en_IN',
  symbol: '₹',
  decimalDigits: 0,
);

/// Format an INR amount the Indian way, e.g. 125000 -> "₹1,25,000".
String formatInr(num amount) => _inr.format(amount.round());

/// Format a compact range, e.g. "₹85,000 – ₹1,20,000".
String formatInrRange(num low, num high) => '${formatInr(low)} – ${formatInr(high)}';

double clampd(double v, double min, double max) => v < min ? min : (v > max ? max : v);
