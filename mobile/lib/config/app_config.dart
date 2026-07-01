/// App configuration. The Supabase anon key is a publishable client key
/// (RLS-protected) — the same one shipped in the web bundle.
class AppConfig {
  static const String supabaseUrl = 'https://kvfnijojzmtvjjqxfnly.supabase.co';
  static const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Zm5pam9qem10dmpqcXhmbmx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MzY4NzksImV4cCI6MjA5ODExMjg3OX0.oQ8HvFAowXvFkyqiI9jxcRclJTwi1u8nAx5gAvzbssA';

  /// Free valuations before payment is required. The server is the source of
  /// truth (VAAYU_FREE_VALUATION_LIMIT); this drives on-screen messaging only.
  static const int freeValuationLimit = 1;

  /// Price of one paid valuation, in paise (₹99). Mirrors create-payment-order.
  static const int valuationPricePaise = 9900;
}
