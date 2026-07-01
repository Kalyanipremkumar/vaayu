import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../state/auth.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_typography.dart';
import '../../widgets/buttons.dart';
import '../../widgets/common.dart';
import '../../widgets/vaayu_app_bar.dart';
import '../../widgets/vaayu_text_field.dart';
import 'otp_screen.dart';

/// Screen 02 — Auth. Email + password is the primary path (works with no SMS
/// provider); phone OTP is offered as an option for once Supabase phone auth is
/// configured.
class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  bool _usePhone = false;
  bool _isSignUp = true; // email mode: create account vs sign in

  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _phone = TextEditingController();

  bool _loading = false;
  String? _error;
  String? _info;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _phone.dispose();
    super.dispose();
  }

  void _reset() => setState(() {
        _error = null;
        _info = null;
      });

  // ── Email / password ───────────────────────────────────────────────────────
  Future<void> _submitEmail() async {
    final email = _email.text.trim();
    final pw = _password.text;
    if (!email.contains('@') || email.length < 5) {
      return setState(() => _error = 'Enter a valid email address.');
    }
    if (pw.length < 6) {
      return setState(() => _error = 'Password must be at least 6 characters.');
    }
    setState(() {
      _loading = true;
      _error = null;
      _info = null;
    });
    try {
      final auth = ref.read(authServiceProvider);
      if (_isSignUp) {
        final res = await auth.signUp(email, pw, _name.text.trim());
        if (res.session == null) {
          // Email confirmation is on — no session yet.
          setState(() {
            _isSignUp = false;
            _info = 'Account created. Check your email to confirm, then sign in.';
          });
          return;
        }
      } else {
        await auth.signIn(email, pw);
      }
      if (!mounted) return;
      context.go('/');
    } catch (e) {
      if (mounted) setState(() => _error = _clean(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _forgotPassword() async {
    final email = _email.text.trim();
    if (!email.contains('@')) {
      return setState(() => _error = 'Enter your email above first.');
    }
    setState(() {
      _loading = true;
      _error = null;
      _info = null;
    });
    try {
      await ref.read(authServiceProvider).sendPasswordReset(email);
      if (mounted) setState(() => _info = 'Password reset link sent to $email.');
    } catch (e) {
      if (mounted) setState(() => _error = _clean(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ── Phone OTP ───────────────────────────────────────────────────────────────
  String _normalizedPhone() {
    var p = _phone.text.trim().replaceAll(RegExp(r'[\s-]'), '');
    if (!p.startsWith('+')) p = '+91$p';
    return p;
  }

  Future<void> _sendOtp() async {
    final digits = _phone.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length < 10) return setState(() => _error = 'Enter a valid mobile number.');
    setState(() {
      _loading = true;
      _error = null;
      _info = null;
    });
    try {
      final phone = _normalizedPhone();
      await ref.read(authServiceProvider).sendPhoneOtp(phone, fullName: _name.text.trim());
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(builder: (_) => OtpScreen(phone: phone)));
    } catch (e) {
      if (mounted) setState(() => _error = _clean(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _clean(Object e) {
    final msg = e.toString().replaceFirst('Exception: ', '');
    if (msg.contains('unsupported_phone_provider') || msg.contains('phone provider')) {
      return 'Phone sign-in isn’t enabled yet. Please use email instead.';
    }
    return msg;
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
              EyebrowLabel(_usePhone
                  ? 'Welcome'
                  : (_isSignUp ? 'Welcome' : 'Welcome back')),
              const SizedBox(height: 6),
              RichText(
                text: TextSpan(style: AppTypography.displaySmall, children: [
                  TextSpan(text: _isSignUp && !_usePhone ? 'Create your ' : 'Sign '),
                  TextSpan(
                      text: _isSignUp && !_usePhone ? 'account' : 'in',
                      style: AppTypography.emphasis(AppTypography.displaySmall)),
                ]),
              ),
              const SizedBox(height: 8),
              Text('Your first valuation is free.', style: AppTypography.bodyMedium),
              const SizedBox(height: 28),

              if (_usePhone) ..._phoneForm() else ..._emailForm(),

              if (_info != null) ...[const SizedBox(height: 16), SuccessBanner(_info!)],
              if (_error != null) ...[const SizedBox(height: 16), ErrorBanner(_error!)],

              const SizedBox(height: 24),
              PrimaryButton(
                label: _usePhone
                    ? 'Send code'
                    : (_isSignUp ? 'Create account' : 'Sign in'),
                loading: _loading,
                onPressed: _usePhone ? _sendOtp : _submitEmail,
              ),

              const SizedBox(height: 20),
              _switcher(),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _emailForm() => [
        if (_isSignUp) ...[
          VaayuTextField(
              label: 'Full name',
              controller: _name,
              hint: 'Kalyani PremKumar',
              textCapitalization: TextCapitalization.words),
          const SizedBox(height: 20),
        ],
        VaayuTextField(
            label: 'Email',
            controller: _email,
            hint: 'you@example.com',
            keyboardType: TextInputType.emailAddress,
            onChanged: (_) => _reset()),
        const SizedBox(height: 20),
        VaayuTextField(
            label: 'Password',
            controller: _password,
            hint: 'At least 6 characters',
            obscureText: true,
            onChanged: (_) => _reset()),
        if (!_isSignUp) ...[
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: TertiaryButton(label: 'Forgot password?', onPressed: _forgotPassword),
          ),
        ],
      ];

  List<Widget> _phoneForm() => [
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
      ];

  Widget _switcher() => Column(children: [
        if (!_usePhone)
          Center(
            child: TextButton(
              onPressed: () => setState(() {
                _isSignUp = !_isSignUp;
                _reset();
              }),
              child: RichText(
                text: TextSpan(style: AppTypography.bodySmall.copyWith(color: AppColors.grey600), children: [
                  TextSpan(text: _isSignUp ? 'Already have an account?  ' : 'New to Vaayu?  '),
                  TextSpan(
                      text: _isSignUp ? 'Sign in' : 'Create account',
                      style: AppTypography.bodySmall
                          .copyWith(color: AppColors.gold, fontWeight: FontWeight.w600)),
                ]),
              ),
            ),
          ),
        const SizedBox(height: 4),
        Center(
          child: TextButton.icon(
            onPressed: () => setState(() {
              _usePhone = !_usePhone;
              _reset();
            }),
            icon: Icon(_usePhone ? Icons.mail_outline : Icons.smartphone,
                size: 16, color: AppColors.grey600),
            label: Text(_usePhone ? 'Use email instead' : 'Use phone number instead',
                style: AppTypography.bodySmall.copyWith(color: AppColors.grey600)),
          ),
        ),
      ]);
}
