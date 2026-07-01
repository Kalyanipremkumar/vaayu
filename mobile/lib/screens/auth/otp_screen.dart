import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../state/auth.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';

/// Screen 03 — OTP. Six auto-advancing cells.
class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key, required this.phone});
  final String phone;

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _controllers = List.generate(6, (_) => TextEditingController());
  final _nodes = List.generate(6, (_) => FocusNode());
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final n in _nodes) {
      n.dispose();
    }
    super.dispose();
  }

  String get _code => _controllers.map((c) => c.text).join();

  void _onChanged(int i, String v) {
    if (v.isNotEmpty && i < 5) _nodes[i + 1].requestFocus();
    if (v.isEmpty && i > 0) _nodes[i - 1].requestFocus();
    if (_code.length == 6) _verify();
  }

  Future<void> _verify() async {
    if (_code.length != 6) return setState(() => _error = 'Enter the 6-digit code.');
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authServiceProvider).verifyPhoneOtp(widget.phone, _code);
      if (!mounted) return;
      context.go('/');
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const VaayuAppBar(showBack: true),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const EyebrowLabel('Verify'),
              const SizedBox(height: 6),
              RichText(
                text: TextSpan(style: AppTypography.displaySmall, children: [
                  const TextSpan(text: 'Enter the '),
                  TextSpan(text: 'code', style: AppTypography.emphasis(AppTypography.displaySmall)),
                ]),
              ),
              const SizedBox(height: 8),
              Text('Sent to ${widget.phone}.', style: AppTypography.bodyMedium),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: List.generate(6, (i) => _cell(i)),
              ),
              const SizedBox(height: 28),
              if (_error != null) ...[ErrorBanner(_error!), const SizedBox(height: 16)],
              PrimaryButton(label: 'Verify', loading: _loading, onPressed: _verify),
              const SizedBox(height: 8),
              Center(child: TertiaryButton(label: 'Resend code', onPressed: () {})),
            ],
          ),
        ),
      ),
    );
  }

  Widget _cell(int i) {
    return SizedBox(
      width: 46,
      height: 54,
      child: TextField(
        controller: _controllers[i],
        focusNode: _nodes[i],
        autofocus: i == 0,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        cursorColor: AppColors.gold,
        style: AppTypography.headlineMedium.copyWith(color: AppColors.burgundy),
        inputFormatters: [FilteringTextInputFormatter.digitsOnly],
        decoration: InputDecoration(
          counterText: '',
          contentPadding: EdgeInsets.zero,
          filled: true,
          fillColor: AppColors.white,
          enabledBorder: OutlineInputBorder(
            borderRadius: AppRadius.input,
            borderSide: const BorderSide(color: AppColors.grey100),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: AppRadius.input,
            borderSide: const BorderSide(color: AppColors.gold, width: 1.5),
          ),
        ),
        onChanged: (v) => _onChanged(i, v),
      ),
    );
  }
}
