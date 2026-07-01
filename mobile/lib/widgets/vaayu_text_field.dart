import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

/// Editorial input: uppercase label, no box, just a bottom border that turns
/// gold on focus.
class VaayuTextField extends StatelessWidget {
  const VaayuTextField({
    super.key,
    required this.label,
    this.hint,
    this.helper,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.onChanged,
    this.textCapitalization = TextCapitalization.none,
    this.maxLines = 1,
  });

  final String label;
  final String? hint;
  final String? helper;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final bool obscureText;
  final ValueChanged<String>? onChanged;
  final TextCapitalization textCapitalization;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: AppTypography.labelMedium
              .copyWith(color: AppColors.burgundy, letterSpacing: 1, fontSize: 11),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: obscureText,
          onChanged: onChanged,
          textCapitalization: textCapitalization,
          maxLines: obscureText ? 1 : maxLines,
          cursorColor: AppColors.gold,
          style: AppTypography.bodyLarge.copyWith(color: AppColors.burgundy),
          decoration: InputDecoration(
            isDense: true,
            hintText: hint,
            hintStyle:
                AppTypography.bodyLarge.copyWith(color: AppColors.grey200, fontStyle: FontStyle.italic),
            contentPadding: const EdgeInsets.symmetric(vertical: 12),
            border: const UnderlineInputBorder(borderSide: BorderSide(color: AppColors.grey100)),
            enabledBorder:
                const UnderlineInputBorder(borderSide: BorderSide(color: AppColors.grey100)),
            focusedBorder:
                const UnderlineInputBorder(borderSide: BorderSide(color: AppColors.gold)),
          ),
        ),
        if (helper != null) ...[
          const SizedBox(height: 4),
          Text(helper!, style: AppTypography.labelMedium.copyWith(color: AppColors.grey400, fontSize: 11, height: 1.4)),
        ],
      ],
    );
  }
}
