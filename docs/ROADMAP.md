# Vaayu — Product Roadmap

## Shipped today

- pnpm monorepo (web + mobile skeleton + shared packages), strict TS, CI.
- Auth: email/password + Google OAuth, session context, route guard.
- Supabase: schema + RLS + signup trigger + private storage bucket (live).
- Pricing engine: server-side Edge Function calling Claude vision with the strict
  three-layer methodology; pure, unit-tested guardrail math in `@vaayu/shared`.
- Valuation wizard: upload → context → review → AI processing → report.
- Branded PDF report (generated, not browser-print).
- Free-quota gating (3 free, then paywall stub); deep-petrol-teal + gold brand.

## Gaps in the current app

- **Core flow:** no dashboard list / view of past valuations; PDF only at result time;
  single image only; minimal context form; no re-valuation.
- **Monetization:** payments stubbed — no Razorpay/Stripe checkout, webhooks, or subscriptions.
- **Accuracy / trust:** no real comparable-sales grounding; no artist database/lookup;
  confidence not calibrated; no multi-image; no human expert review.
- **Onboarding / retention:** no onboarding (role + tour); no email notifications; no settings.
- **Mobile:** skeleton only.
- **Ops / quality:** thin tests; no analytics/admin; basic rate limiting; no i18n (Hindi);
  accessibility not audited.

---

## Phase A — Complete the core product (Now)

1. **Dashboard** — valuations list with filters (tradition / date / confidence), open a past
   report, re-download its PDF.
2. **Richer context form** — multiple images (front / verso / detail / signature), materials,
   edition/series, signature flag, provenance-document upload.
3. **Valuation purpose selector** — Fair Market / Insurance / Auction (changes the output).
4. **Settings** — profile, change password, free-valuations remaining, export valuations (JSON),
   delete account.
5. **Onboarding** — role selection (individual / artist / gallery / enterprise) + 30-sec
   methodology tour.
6. **State polish** — loading / empty / error states everywhere; image-quality hints on upload.

## Phase B — Monetize (Next)

7. **Razorpay (INR) + Stripe (USD)** checkout with region detection.
8. **Paywall** after 3 free; single-valuation purchase; receipts.
9. **Webhooks** (signature-verified, idempotent) → mark `was_paid`, store payment id.
10. **Subscriptions** — starter / pro / enterprise tiers with monthly valuation quotas.
11. **Transactional email (Resend)** — welcome, valuation-complete, receipt, reset polish.

## Phase C — Accuracy & trust (Next → Later)

12. **Comparable-sales grounding** — feed Layer 1 from web search / market data; cite sources.
13. **Artist database & lookup** — recognition tier, awards, GI, auction records → better Layer 2.
14. **Multi-image vision** — front + verso + detail for a more accurate read.
15. **Confidence calibration** + "what would sharpen this estimate" suggestions.
16. **Human-in-the-loop expert review** (premium) — an expert verifies/adjusts the AI estimate.
17. **Re-valuation over time** — track an artwork's value history as the market moves.
18. **Versioned tradition benchmarks** — maintained, auditable per-tradition base data.

## Phase D — Mobile & reach (Later)

19. **Mobile parity (Expo)** — camera capture, full flow, report; EAS Android/iOS builds.
20. **i18n** — Hindi + regional languages.
21. **Shareable public report links** (revocable) + share cards.
22. **Offline draft capture.**

## Phase E — B2B, licensing & scale (Vision)

23. **Org accounts & roles** — galleries, auction houses, insurers (multi-seat).
24. **Bulk & portfolio valuation** — value many works / a whole collection; insurance schedules.
25. **Partner API + white-label / licensing** — the original "independently sellable & licensable" goal.
26. **Certificates** — signed PDF certificates with a public verification page (optional registry).
27. **Market insights** — trend analytics by tradition/artist for artists, galleries, insurers.
28. **Admin console** — audit logs, abuse/fraud controls, rate-limit hardening.

## Cross-cutting (always-on)

- **Testing** — pricing math ✓; add auth, payment-webhook, and end-to-end flow tests.
- **Observability** — structured logs, metrics, alerts, error tracking (e.g. Sentry).
- **Security & privacy** — DPDP Act (India) / GDPR, data retention & consent, secret hygiene.
- **Performance & SEO** — code-split ✓, image pipeline, marketing-page SEO.
- **Accessibility** — WCAG audit.
