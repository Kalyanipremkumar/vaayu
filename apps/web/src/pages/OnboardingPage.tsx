import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { UserRole } from '@vaayu/shared';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  {
    value: 'individual',
    label: 'Individual',
    desc: 'Collector or enthusiast valuing personal pieces.',
  },
  {
    value: 'artist',
    label: 'Artist',
    desc: 'Pricing and understanding the value of your own work.',
  },
  { value: 'gallery', label: 'Gallery', desc: 'Valuing inventory and advising clients.' },
  {
    value: 'enterprise',
    label: 'Enterprise',
    desc: 'Auction house, insurer, or institution at scale.',
  },
];

const LAYERS = [
  { n: '01', t: 'Base value', d: 'A market benchmark from the tradition and medium.' },
  { n: '02', t: 'Artist multiplier', d: 'Recognition tier, from emerging to blue-chip.' },
  { n: '03', t: 'Work adjustment', d: 'Condition, size, materials, rarity, and provenance.' },
];

/** First-run onboarding: pick a role, then a quick methodology tour. */
export function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<'role' | 'tour'>('role');
  const [role, setRole] = useState<UserRole>('individual');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError('Could not save. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
      <p className="mb-2 text-center font-body text-sm uppercase tracking-[0.2em] text-gold">
        Vaayu
      </p>

      {step === 'role' ? (
        <>
          <h1 className="text-center font-heading text-4xl text-ink">
            What’s your relationship to art?
          </h1>
          <p className="mt-2 text-center font-body text-sm text-muted">
            We’ll tailor Vaayu to how you work.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {ROLES.map((r) => (
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
            <Button onClick={() => setStep('tour')}>Continue</Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-center font-heading text-4xl text-ink">How Vaayu values art</h1>
          <p className="mt-2 text-center font-body text-sm text-muted">
            Every estimate is transparent — built from three layers you can see.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {LAYERS.map((l) => (
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
              Back
            </Button>
            <Button onClick={finish} loading={busy}>
              Start valuing
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
