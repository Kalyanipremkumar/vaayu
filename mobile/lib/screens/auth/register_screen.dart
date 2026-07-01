import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../state/auth.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';
import '../../widgets/vaayu_text_field.dart';
import 'otp_screen.dart';

/// Screen 02 — Create account (phone). Sends a one-time code.
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    super.dispose();
  }

  String _normalized() {
    var p = _phone.text.trim().replaceAll(RegExp(r'[\s-]'), '');
    if (!p.startsWith('+')) p = '+91$p';
    return p;
  }

  Future<void> _send() async {
    final digits = _phone.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 10) return setState(() => _error = 'Enter a valid mobile number.');
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final phone = _normalized();
      await ref.read(authServiceProvider).sendPhoneOtp(phone, fullName: _name.text.trim());
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => OtpScreen(phone: phone)));
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
              const EyebrowLabel('Welcome'),
              const SizedBox(height: 6),
              RichText(
                text: TextSpan(style: AppTypography.displaySmall, children: [
                  const TextSpan(text: 'Create your '),
                  TextSpan(text: 'account', style: AppTypography.emphasis(AppTypography.displaySmall)),
                ]),
              ),
              const SizedBox(height: 8),
              Text('Your first valuations are free.', style: AppTypography.bodyMedium),
              const SizedBox(height: 28),
              VaayuTextField(
                  label: 'Full name',
                  controller: _name,
                  hint: 'Kalyani PremKumar',
                  textCapitalization: TextCapitalization.words),
              const SizedBox(height: 20),
              VaayuTextField(
                  label: 'Mobile number',
                  controller: _phone,
                  hint: '+91 98765 43210',
                  keyboardType: TextInputType.phone,
                  helper: "We'll send a one-time code to this number."),
              const SizedBox(height: 24),
              if (_error != null) ...[ErrorBanner(_error!), const SizedBox(height: 16)],
              PrimaryButton(label: 'Send code', loading: _loading, onPressed: _send),
            ],
          ),
        ),
      ),
    );
  }
}
