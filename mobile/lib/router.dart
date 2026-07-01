import 'package:go_router/go_router.dart';

import 'screens/artist/artist_intro_screen.dart';
import 'screens/artist/artist_wizard_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/collector/collector_upload_screen.dart';
import 'screens/home_screen.dart';
import 'screens/settings/account_screen.dart';

final appRouter = GoRouter(
  routes: [
    GoRoute(path: '/', builder: (c, s) => const HomeScreen()),
    GoRoute(path: '/register', builder: (c, s) => const RegisterScreen()),
    GoRoute(path: '/artist', builder: (c, s) => const ArtistIntroScreen()),
    GoRoute(path: '/artist/wizard', builder: (c, s) => const ArtistWizardScreen()),
    GoRoute(path: '/collector', builder: (c, s) => const CollectorUploadScreen()),
    GoRoute(path: '/account', builder: (c, s) => const AccountScreen()),
  ],
);
