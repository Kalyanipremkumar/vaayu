import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import type { UserRole } from '@vaayu/shared';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const ROLE_VALUES: UserRole[] = ['individual', 'artist', 'gallery', 'enterprise'];

/** First-run onboarding: pick a role, then a quick methodology tour. */
export function OnboardingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'role' | 'tour'>('role');
  const [role, setRole] = useState<UserRole>('individual');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = ROLE_VALUES.map((value) => ({
    value,
    label: t(`onboarding.${value}`),
    desc: t(`onboarding.${value}Desc`),
  }));
  const layers = [1, 2, 3].map((n) => ({
    n: String(n).padStart(2, '0'),
    t: t(`onboarding.l${n}t`),
    d: t(`onboarding.l${n}b`),
  }));

  async function finish() {
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role, onboarded: true })
        .eq('id', user.id);
      if (updateError) throw updateError;
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigate('/dashboard', { replace: true });
    } catch {
      setError(t('onboarding.saveError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <img src="/vaayu-mark.png" alt="Vaayu" className="mx-auto mb-4 h-12 w-auto" />

      {step === 'role' ? (
        <>
          <h1 className="text-center font-heading text-4xl text-ink">
            {t('onboarding.roleTitle')}
          </h1>
          <p className="mt-2 text-center font-body text-sm text-muted">
            {t('onboarding.roleLead')}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  role === r.value ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/60'
                }`}
              >
                <p className="font-heading text-lg text-ink">{r.label}</p>
                <p className="mt-0.5 font-body text-sm text-muted">{r.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <Button onClick={() => setStep('tour')}>{t('common.continue')}</Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-center font-heading text-4xl text-ink">
            {t('onboarding.tourTitle')}
          </h1>
          <p className="mt-2 text-center font-body text-sm text-muted">
            {t('onboarding.tourLead')}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {layers.map((l) => (
              <div key={l.n} className="flex gap-4 rounded-xl border border-border p-4">
                <span className="font-heading text-2xl text-gold">{l.n}</span>
                <div>
                  <p className="font-heading text-lg text-ink">{l.t}</p>
                  <p className="mt-0.5 font-body text-sm text-muted">{l.d}</p>
                </div>
              </div>
            ))}
          </div>
          {error ? (
            <p className="mt-4 text-center font-body text-sm text-red-700">{error}</p>
          ) : null}
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" onClick={() => setStep('role')}>
              {t('common.back')}
            </Button>
            <Button onClick={finish} loading={busy}>
              {t('onboarding.start')}
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
