import { useTranslation } from 'react-i18next';
import {
  ARTIST_PRICING_DISCLAIMER,
  formatInr,
  SELLING_CHANNELS,
  type ArtistPricingResult,
  type SellingChannel,
} from '@vaayu/shared';

function channelLabel(channel: SellingChannel): string {
  return SELLING_CHANNELS.find((c) => c.key === channel)?.label ?? channel;
}

/**
 * Artist pricing recommendation: the ask (with floor/ceiling + per-sq-ft), the
 * channel-by-channel quoted/net table, and the three-layer reasoning behind it.
 */
export function ArtistResult({ result }: { result: ArtistPricingResult }) {
  const { t } = useTranslation();
  const { valuation } = result;
  const { reasoning } = valuation;

  return (
    <article className="flex flex-col gap-8">
      {/* Ask price hero */}
      <section className="rounded-2xl bg-ink px-6 py-10 text-center">
        <p className="font-body text-xs uppercase tracking-[0.25em] text-gold">
          {t('artist.recommendedAsk')}
        </p>
        <p className="mt-4 font-heading text-5xl text-cream md:text-6xl">
          {formatInr(result.askInr)}
        </p>
        <div className="mx-auto mt-8 flex max-w-md items-stretch justify-between gap-3 border-y border-cream/15 py-5">
          <div className="flex-1 text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-cream/50">
              {t('artist.floor')}
            </p>
            <p className="mt-1 font-heading text-lg text-cream/80">{formatInr(result.floorInr)}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-cream/50">
              {t('artist.sweetSpot')}
            </p>
            <p className="mt-1 font-heading text-xl text-gold">{formatInr(result.askInr)}</p>
          </div>
          <div className="flex-1 text-center">
            <p className="font-body text-[10px] uppercase tracking-[0.15em] text-cream/50">
              {t('artist.ceiling')}
            </p>
            <p className="mt-1 font-heading text-lg text-cream/80">
              {formatInr(result.ceilingInr)}
            </p>
          </div>
        </div>
        {result.perSqFtInr > 0 ? (
          <p className="mt-5 font-body text-xs text-cream/60">
            {t('artist.perSqFt', { rate: formatInr(result.perSqFtInr) })}
          </p>
        ) : null}
      </section>

      {/* Below-cost warning */}
      {result.belowCost ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 font-body text-sm text-red-800">
          {t('artist.belowCostWarning', { cost: formatInr(result.costFloorInr) })}
        </p>
      ) : null}

      {/* Cost floor + add-ons */}
      {result.costFloorInr > 0 || result.addOns.framingInr > 0 || result.addOns.shippingInr > 0 ? (
        <section className="rounded-xl border border-border p-5">
          {result.costFloorInr > 0 ? (
            <>
              <h3 className="font-heading text-lg text-ink">{t('artist.costFloorTitle')}</h3>
              <p className="mt-1 font-body text-xs text-muted">{t('artist.costFloorLead')}</p>
              <dl className="mt-3">
                <CostRow label={t('artist.materials')} value={result.costBreakdown.materialsInr} />
                <CostRow label={t('artist.labour')} value={result.costBreakdown.labourInr} />
                <CostRow label={t('artist.costFloorTotal')} value={result.costFloorInr} strong />
              </dl>
            </>
          ) : null}
          {result.addOns.framingInr > 0 || result.addOns.shippingInr > 0 ? (
            <div className={result.costFloorInr > 0 ? 'mt-5 border-t border-border pt-5' : ''}>
              <h3 className="font-heading text-lg text-ink">{t('artist.addOnsTitle')}</h3>
              <p className="mt-1 font-body text-xs text-muted">{t('artist.addOnsLead')}</p>
              <dl className="mt-3">
                {result.addOns.framingInr > 0 ? (
                  <CostRow label={t('artist.framing')} value={result.addOns.framingInr} />
                ) : null}
                {result.addOns.shippingInr > 0 ? (
                  <CostRow label={t('artist.shipping')} value={result.addOns.shippingInr} />
                ) : null}
              </dl>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Channel pricing */}
      {result.channels.length > 0 ? (
        <section>
          <h2 className="font-heading text-2xl text-ink">{t('artist.channelTitle')}</h2>
          <p className="mt-1 font-body text-sm text-muted">{t('artist.channelLead')}</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gold/[0.06] text-left">
                  <th className="px-4 py-2.5 font-body text-xs uppercase tracking-wider text-muted">
                    {t('artist.channel')}
                  </th>
                  <th className="px-4 py-2.5 text-right font-body text-xs uppercase tracking-wider text-muted">
                    {t('artist.quote')}
                  </th>
                  <th className="px-4 py-2.5 text-right font-body text-xs uppercase tracking-wider text-muted">
                    {t('artist.youNet')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.channels.map((c) => (
                  <tr key={c.channel} className="border-t border-border">
                    <td className="px-4 py-3 font-body text-sm text-ink">
                      {channelLabel(c.channel)}
                    </td>
                    <td className="px-4 py-3 text-right font-heading text-base text-gold">
                      {formatInr(c.quotedInr)}
                    </td>
                    <td className="px-4 py-3 text-right font-body text-sm text-muted">
                      {formatInr(c.netInr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Reasoning */}
      <section>
        <h2 className="font-heading text-2xl text-ink">{t('artist.howWeGotThere')}</h2>
        <div className="mt-2">
          <ReasoningRow
            label={t('report.layer1')}
            value={formatInr(reasoning.baseValue.amount)}
            rationale={reasoning.baseValue.rationale}
          />
          <ReasoningRow
            label={t('report.layer2')}
            value={`× ${reasoning.artistMultiplier.multiplier}${
              reasoning.artistMultiplier.tier ? ` · ${reasoning.artistMultiplier.tier}` : ''
            }`}
            rationale={reasoning.artistMultiplier.rationale}
          />
          <ReasoningRow
            label={t('report.layer3')}
            value={`× ${reasoning.workAdjustment.multiplier}`}
            rationale={reasoning.workAdjustment.rationale}
          />
          <ReasoningRow
            label={t('artist.complexityLayer')}
            value={t(`artist.complexityValue.${result.complexity}`)}
          />
          <ReasoningRow
            label={t('artist.positioningLayer')}
            value={t(`artist.positioningValue.${result.positioning}`)}
          />
          <ReasoningRow
            label={t('artist.postureLayer')}
            value={t(`artist.postureValue.${result.posture}`)}
          />
        </div>
      </section>

      <p className="border-t border-border pt-4 font-body text-xs leading-relaxed text-muted">
        {ARTIST_PRICING_DISCLAIMER}
      </p>
    </article>
  );
}

function CostRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className={`font-body text-sm ${strong ? 'font-medium text-ink' : 'text-muted'}`}>
        {label}
      </dt>
      <dd className={`font-body text-sm ${strong ? 'font-medium text-ink' : 'text-ink'}`}>
        {formatInr(value)}
      </dd>
    </div>
  );
}

function ReasoningRow({
  label,
  value,
  rationale,
}: {
  label: string;
  value: string;
  rationale?: string;
}) {
  return (
    <div className="border-t border-border py-5 first:border-t-0">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-body text-sm uppercase tracking-wider text-gold">{label}</p>
        <p className="font-heading text-lg text-ink">{value}</p>
      </div>
      {rationale ? (
        <p className="mt-2 font-body text-sm leading-relaxed text-muted">{rationale}</p>
      ) : null}
    </div>
  );
}
