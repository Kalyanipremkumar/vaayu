// Domain enums ported from @vaayu/shared. Each carries the string `key` used
// by the API/DB, a display `label`, and (where relevant) its factor/band.

enum ArtistTier {
  emerging('emerging', 0.7, 1.0),
  midCareer('mid-career', 1.0, 1.8),
  established('established', 1.8, 3.5),
  blueChip('blue-chip', 3.5, 10.0);

  const ArtistTier(this.key, this.min, this.max);
  final String key;
  final double min;
  final double max;
}

enum CareerStage {
  emerging('emerging', 'Emerging', ArtistTier.emerging,
      'Recent graduate or self-taught. 0–5 years of practice. Few exhibitions.'),
  midCareer('mid-career', 'Mid-career', ArtistTier.midCareer,
      '5–15 years of practice. Multiple gallery shows. Growing collector base.'),
  established('established', 'Established', ArtistTier.established,
      'Recognized within tradition. Institutional collectors. Possibly published.'),
  renowned('renowned', 'Renowned', ArtistTier.blueChip,
      'National / international recognition. Museum collections. Multiple publications.');

  const CareerStage(this.key, this.label, this.tier, this.description);
  final String key;
  final String label;
  final ArtistTier tier;
  final String description;
}

enum ArtComplexity {
  simple('simple', 'Simple', 0.9),
  moderate('moderate', 'Moderate', 1.0),
  complex('complex', 'Complex', 1.15),
  highlyComplex('highly_complex', 'Highly complex', 1.3);

  const ArtComplexity(this.key, this.label, this.factor);
  final String key;
  final String label;
  final double factor;
}

enum MarketPositioning {
  budget('budget', 'Budget / accessible', 0.85),
  standard('standard', 'Standard / market', 1.0),
  premium('premium', 'Premium / collector', 1.25);

  const MarketPositioning(this.key, this.label, this.factor);
  final String key;
  final String label;
  final double factor;
}

enum PricingPosture {
  sellQuickly('sell_quickly', 'Sell quickly', 0.9),
  balanced('balanced', 'Balanced', 1.0),
  hold('hold', 'Hold for the right buyer', 1.1);

  const PricingPosture(this.key, this.label, this.factor);
  final String key;
  final String label;
  final double factor;
}

enum SellingChannel {
  gallery('gallery', 'Gallery'),
  direct('direct', 'Direct (Instagram, WhatsApp)'),
  artFair('art_fair', 'Art fair'),
  varnam('varnam', 'Varnam marketplace'),
  commission('commission', 'Custom commission');

  const SellingChannel(this.key, this.label);
  final String key;
  final String label;
}

enum ArtworkCondition {
  excellent('excellent', 'Excellent'),
  good('good', 'Good'),
  fair('fair', 'Fair'),
  poor('poor', 'Poor');

  const ArtworkCondition(this.key, this.label);
  final String key;
  final String label;
}

enum EditionType {
  unique('unique', 'Unique (one of a kind)'),
  limited('limited', 'Limited edition'),
  open('open', 'Open edition');

  const EditionType(this.key, this.label);
  final String key;
  final String label;
}

enum ValuationPurpose {
  fairMarket('fair_market', 'Fair market value'),
  insurance('insurance', 'Insurance / replacement'),
  auction('auction', 'Auction estimate');

  const ValuationPurpose(this.key, this.label);
  final String key;
  final String label;
}

enum AppMode { collector, artist }
