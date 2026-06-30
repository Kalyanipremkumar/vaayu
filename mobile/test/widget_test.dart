// Basic smoke test for the Vaayu theme/widgets. Full screen tests come later.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:vaayu/theme/app_theme.dart';

void main() {
  testWidgets('app theme builds a MaterialApp', (WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light,
        home: const Scaffold(body: Center(child: Text('Vaayu'))),
      ),
    );
    expect(find.text('Vaayu'), findsOneWidget);
  });
}
