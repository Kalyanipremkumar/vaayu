// Numeric constants + reference lists ported from @vaayu/shared.

class Tradition {
  const Tradition(this.key, this.label, this.group);
  final String key;
  final String label;
  final String group; // 'folk' | 'fine-art'
}

const List<Tradition> kTraditions = [
  Tradition('mithila', 'Mithila / Madhubani', 'folk'),
  Tradition('warli', 'Warli', 'folk'),
  Tradition('gond', 'Gond', 'folk'),
  Tradition('pattachitra', 'Pattachitra', 'folk'),
  Tradition('kalamkari', 'Kalamkari', 'folk'),
  Tradition('phad', 'Phad', 'folk'),
  Tradition('kalighat', 'Kalighat', 'folk'),
  Tradition('tanjore', 'Tanjore (Thanjavur)', 'folk'),
  Tradition('oil-painting', 'Oil Painting', 'fine-art'),
  Tradition('acrylic-painting', 'Acrylic Painting', 'fine-art'),
  Tradition('watercolour', 'Watercolour', 'fine-art'),
  Tradition('print', 'Print / Serigraph', 'fine-art'),
  Tradition('photography', 'Photography', 'fine-art'),
  Tradition('sculpture', 'Sculpture', 'fine-art'),
  Tradition('other', 'Other', 'fine-art'),
];

class Medium {
  const Medium(this.key, this.label);
  final String key;
  final String label;
}

const List<Medium> kMediums = [
  Medium('natural-pigment', 'Natural Pigment'),
  Medium('oil', 'Oil'),
  Medium('acrylic', 'Acrylic'),
  Medium('watercolour', 'Watercolour'),
  Medium('ink', 'Ink'),
  Medium('gouache', 'Gouache'),
  Medium('mixed-media', 'Mixed Media'),
  Medium('digital-print', 'Digital / Giclée Print'),
  Medium('photographic-print', 'Photographic Print'),
  Medium('bronze', 'Bronze'),
  Medium('stone', 'Stone'),
  Medium('wood', 'Wood'),
  Medium('other', 'Other'),
];

// Artist-mode numeric constants.
const int kVarnamCommissionPct = 10;
const double kArtFairPremium = 1.14;
const double kCommissionPremium = 1.3;
const int kDirectProcessingPct = 2;
const int kDefaultHourlyRateInr = 300;
const double kCmPerInch = 2.54;

// Gallery commission slider bounds (percent).
const int kGalleryCutMin = 20;
const int kGalleryCutMax = 60;
const int kGalleryCutDefault = 40;

// Floor / ceiling spread around the artist ask price.
const double kFloorFactor = 0.77;
const double kCeilingFactor = 1.27;

// Collector estimate spread around mid.
const double kEstimateLowFactor = 0.85;
const double kEstimateHighFactor = 1.2;

const String kArtistPricingDisclaimer =
    'This is AI-generated pricing guidance based on the details you provided and Vaayu’s '
    'methodology — not a guarantee of sale. Final prices depend on demand, channel, timing, '
    'and negotiation. Treat the floor as your absolute minimum.';

const String kValuationDisclaimer =
    'This valuation is generated from the details you provided and an AI model. It is indicative '
    'guidance only — not a certified appraisal, insurance valuation, or auction estimate.';
