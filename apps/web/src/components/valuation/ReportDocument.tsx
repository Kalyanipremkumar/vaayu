import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { formatInr, VALUATION_DISCLAIMER, type ValuationResult } from '@vaayu/shared';

/** Brand palette mirrored from the design tokens. */
const C = {
  ink: '#0E3A38',
  cream: '#FFFDF8',
  gold: '#C8A84B',
  muted: '#5C5C5C',
  border: '#D8CFC0',
  warnBg: '#FAF3E2',
} as const;

export interface ReportDocumentProps {
  title: string;
  traditionLabel: string;
  mediumLabel: string;
  dimensions: string;
  condition: string;
  artist: string;
  year: string;
  purposeLabel: string;
  result: ValuationResult;
  imageDataUrl: string | null;
  reportId: string;
  dateStr: string;
}

const s = StyleSheet.create({
  page: {
    backgroundColor: C.cream,
    color: C.ink,
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingBottom: 48,
  },
  header: {
    backgroundColor: C.ink,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  wordmark: { color: C.gold, fontSize: 14, fontFamily: 'Helvetica-Bold', letterSpacing: 4 },
  headerRight: { textAlign: 'right' },
  headerKicker: { color: C.cream, fontSize: 7, letterSpacing: 1.5, opacity: 0.8 },
  headerId: { color: C.gold, fontSize: 8, marginTop: 2, fontFamily: 'Courier' },

  body: { paddingHorizontal: 32, paddingTop: 24 },
  title: { fontFamily: 'Times-Roman', fontSize: 24, marginBottom: 2 },
  subtitle: { color: C.muted, fontSize: 9, marginBottom: 20 },

  hero: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  image: {
    width: 120,
    height: 120,
    objectFit: 'cover',
    borderRadius: 6,
    border: `1 solid ${C.border}`,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 6,
    border: `1 solid ${C.border}`,
    backgroundColor: '#F3ECDE',
  },
  infoRow: { flexDirection: 'row', marginBottom: 4 },
  infoLabel: { color: C.muted, width: 80, fontSize: 9 },
  infoValue: { color: C.ink, fontSize: 9, fontFamily: 'Helvetica-Bold' },

  priceBand: {
    backgroundColor: C.ink,
    borderRadius: 8,
    flexDirection: 'row',
    paddingVertical: 16,
    marginBottom: 8,
  },
  priceCol: { flex: 1, textAlign: 'center' },
  priceLabel: { color: C.cream, fontSize: 7, letterSpacing: 1.5, opacity: 0.7, marginBottom: 4 },
  priceAmt: { color: C.cream, fontFamily: 'Times-Roman', fontSize: 14, opacity: 0.85 },
  priceAmtMid: { color: C.gold, fontFamily: 'Times-Roman', fontSize: 22 },
  confidence: { textAlign: 'center', color: C.muted, fontSize: 8, marginBottom: 24 },

  sectionTitle: {
    fontFamily: 'Times-Roman',
    fontSize: 13,
    borderBottom: `1 solid ${C.gold}`,
    paddingBottom: 4,
    marginBottom: 12,
  },
  layer: { borderBottom: `0.5 solid ${C.border}`, paddingVertical: 8 },
  layerHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  layerName: { fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
  layerVal: { color: C.gold, fontFamily: 'Helvetica-Bold', fontSize: 9.5 },
  layerDesc: { color: C.muted, fontSize: 8.5, lineHeight: 1.5 },

  reportText: { color: C.muted, fontSize: 8.5, lineHeight: 1.55, marginTop: 8 },

  methodology: {
    backgroundColor: '#F3ECDE',
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
    color: C.muted,
    fontSize: 8,
    lineHeight: 1.5,
  },
  disclaimer: {
    backgroundColor: C.warnBg,
    borderLeft: `3 solid ${C.gold}`,
    padding: 10,
    marginTop: 12,
    color: '#6B5524',
    fontSize: 7.5,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    textAlign: 'center',
    borderTop: `1 solid ${C.border}`,
    paddingTop: 10,
  },
  tagline: { fontFamily: 'Times-Italic', color: C.gold, fontSize: 10, marginBottom: 3 },
  contact: { color: C.muted, fontSize: 7 },
});

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

/** The branded, paginated Vaayu valuation report as a real PDF document. */
export function ReportDocument(props: ReportDocumentProps) {
  const { result } = props;
  const r = result.reasoning;
  return (
    <Document
      title={`Vaayu Valuation — ${props.title}`}
      author="Vaayu"
      subject="AI artwork valuation report"
    >
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          <Text style={s.wordmark}>VAAYU</Text>
          <View style={s.headerRight}>
            <Text style={s.headerKicker}>AI VALUATION REPORT</Text>
            <Text style={s.headerId}>{props.reportId}</Text>
          </View>
        </View>

        <View style={s.body}>
          <Text style={s.title}>{props.title}</Text>
          <Text style={s.subtitle}>
            {props.purposeLabel} · Generated {props.dateStr}
          </Text>

          <View style={s.hero}>
            {props.imageDataUrl ? (
              <Image style={s.image} src={props.imageDataUrl} />
            ) : (
              <View style={s.imagePlaceholder} />
            )}
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Info label="Tradition" value={props.traditionLabel} />
              <Info label="Medium" value={props.mediumLabel} />
              <Info label="Dimensions" value={props.dimensions} />
              <Info label="Condition" value={props.condition} />
              <Info label="Artist" value={props.artist} />
              <Info label="Year" value={props.year} />
            </View>
          </View>

          <View style={s.priceBand}>
            <View style={s.priceCol}>
              <Text style={s.priceLabel}>LOW ESTIMATE</Text>
              <Text style={s.priceAmt}>{formatInr(result.estimatedLowInr)}</Text>
            </View>
            <View style={s.priceCol}>
              <Text style={s.priceLabel}>MID VALUE</Text>
              <Text style={s.priceAmtMid}>{formatInr(result.estimatedMidInr)}</Text>
            </View>
            <View style={s.priceCol}>
              <Text style={s.priceLabel}>HIGH ESTIMATE</Text>
              <Text style={s.priceAmt}>{formatInr(result.estimatedHighInr)}</Text>
            </View>
          </View>
          <Text style={s.confidence}>
            Confidence score: {Math.round(result.confidenceScore)} / 100 · Three-layer methodology
          </Text>

          <Text style={s.sectionTitle}>Valuation breakdown</Text>

          <View style={s.layer}>
            <View style={s.layerHead}>
              <Text style={s.layerName}>Layer 1 — Base value</Text>
              <Text style={s.layerVal}>{formatInr(r.baseValue.amount)}</Text>
            </View>
            <Text style={s.layerDesc}>{r.baseValue.rationale}</Text>
          </View>
          <View style={s.layer}>
            <View style={s.layerHead}>
              <Text style={s.layerName}>
                Layer 2 — Artist multiplier
                {r.artistMultiplier.tier ? ` (${r.artistMultiplier.tier})` : ''}
              </Text>
              <Text style={s.layerVal}>× {r.artistMultiplier.multiplier}</Text>
            </View>
            <Text style={s.layerDesc}>{r.artistMultiplier.rationale}</Text>
          </View>
          <View style={s.layer}>
            <View style={s.layerHead}>
              <Text style={s.layerName}>Layer 3 — Work adjustment</Text>
              <Text style={s.layerVal}>× {r.workAdjustment.multiplier}</Text>
            </View>
            <Text style={s.layerDesc}>{r.workAdjustment.rationale}</Text>
          </View>

          {r.comparables?.length ? (
            <>
              <Text style={[s.sectionTitle, { marginTop: 20 }]}>Comparables</Text>
              {r.comparables.map((c, i) => (
                <Text key={i} style={s.layerDesc}>
                  • {c}
                </Text>
              ))}
            </>
          ) : null}

          {result.fullReport ? (
            <>
              <Text style={[s.sectionTitle, { marginTop: 20 }]}>Full report</Text>
              <Text style={s.reportText}>{result.fullReport}</Text>
            </>
          ) : null}

          <View style={s.methodology}>
            <Text>
              Methodology: Vaayu&apos;s three-layer model establishes a base value from the
              tradition and medium benchmark, applies an artist-recognition multiplier, and adjusts
              for work-level factors — condition, dimensions, theme rarity, materials, and
              provenance. Multipliers are clamped to conservative, defensible bands.
            </Text>
          </View>

          <View style={s.disclaimer}>
            <Text>Important: {VALUATION_DISCLAIMER}</Text>
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.tagline}>Where every work finds its worth.</Text>
          <Text style={s.contact}>Vaayu · AI Art Valuation · Report powered by Claude</Text>
        </View>
      </Page>
    </Document>
  );
}
