import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, FREE_VALUATION_LIMIT } from '@vaayu/shared';

/**
 * Home screen placeholder. Mirrors the web landing page and confirms the
 * @vaayu/shared workspace link resolves through Metro. Real screens come later.
 */
export function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>VAAYU</Text>
      <Text style={styles.title}>Know what your art is worth.</Text>
      <Text style={styles.body}>
        Upload a photo, add a little context, and receive an AI-powered valuation with a defensible,
        layer-by-layer pricing report.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>The three-layer methodology</Text>
      <Text style={styles.body}>1 — Base value from the tradition and medium.</Text>
      <Text style={styles.body}>2 — Artist multiplier by recognition tier.</Text>
      <Text style={styles.body}>3 — Work adjustment for condition, size, provenance.</Text>

      <Text style={styles.footnote}>Your first {FREE_VALUATION_LIMIT} valuations are free.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 48, backgroundColor: COLORS.cream, flexGrow: 1 },
  eyebrow: { color: COLORS.gold, letterSpacing: 4, fontSize: 12, marginBottom: 12 },
  title: { fontFamily: FONTS.heading, fontSize: 34, color: COLORS.ink, marginBottom: 16 },
  sectionTitle: { fontFamily: FONTS.heading, fontSize: 20, color: COLORS.ink, marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: COLORS.muted, marginBottom: 10 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 24 },
  footnote: { fontSize: 14, color: COLORS.muted, marginTop: 24 },
});
