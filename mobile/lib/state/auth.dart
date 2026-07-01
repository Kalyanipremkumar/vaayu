import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// The shared Supabase client.
final supabaseProvider = Provider<SupabaseClient>((ref) => Supabase.instance.client);

/// Streams auth changes so the UI reacts to sign-in/out.
final authStateProvider = StreamProvider<AuthState>(
  (ref) => Supabase.instance.client.auth.onAuthStateChange,
);

/// The current signed-in user (null when signed out).
final currentUserProvider = Provider<User?>((ref) {
  ref.watch(authStateProvider);
  return Supabase.instance.client.auth.currentUser;
});

class AuthService {
  AuthService(this._c);
  final SupabaseClient _c;

  Future<void> signIn(String email, String password) =>
      _c.auth.signInWithPassword(email: email, password: password);

  Future<AuthResponse> signUp(String email, String password, String fullName) =>
      _c.auth.signUp(email: email, password: password, data: {'full_name': fullName});

  Future<void> sendPasswordReset(String email) => _c.auth.resetPasswordForEmail(email);

  Future<void> signOut() => _c.auth.signOut();
}

final authServiceProvider = Provider<AuthService>((ref) => AuthService(ref.watch(supabaseProvider)));
