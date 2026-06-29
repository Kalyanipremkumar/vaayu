import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
import { env } from '../lib/env';
import { updatePassword } from '../lib/auth';
import { listValuations } from '../lib/valuations';

const MIN_PASSWORD_LENGTH = 8;

/** A bordered settings card with a heading. */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border p-6">
      <h2 className="font-heading text-xl text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Account settings — profile, password, usage, and data export. */
export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const [exportBusy, setExportBusy] = useState(false);

  useEffect(() => {
    if (profile?.fullName) setFullName(profile.fullName);
  }, [profile?.fullName]);

  const freeRemaining = Math.max(0, env.freeValuationLimit - (profile?.freeValuationsUsed ?? 0));

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setProfileMsg(null);
    setProfileBusy(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName.trim() || null })
        .eq('id', user.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      setProfileMsg(t('settings.saved'));
    } catch {
      setProfileMsg(t('settings.saveError'));
    } finally {
      setProfileBusy(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPwErr(t('auth.minPassword', { count: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (password !== confirm) {
      setPwErr(t('auth.passwordMismatch'));
      return;
    }
    setPwBusy(true);
    try {
      await updatePassword(password);
      setPassword('');
      setConfirm('');
      setPwMsg(t('settings.pwUpdated'));
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : t('auth.updatePasswordFailed'));
    } finally {
      setPwBusy(false);
    }
  }

  async function exportJson() {
    setExportBusy(true);
    try {
      const valuations = await listValuations();
      const payload = valuations.map((v) => ({
        id: v.id,
        createdAt: v.createdAt,
        tradition: v.tradition,
        medium: v.medium,
        condition: v.condition,
        dimensionsCm: { height: v.dimensionsHeightCm, width: v.dimensionsWidthCm },
        artist: v.artistKnown ? v.artistName : null,
        yearCreated: v.yearCreated,
        estimate: {
          low: v.result.estimatedLowInr,
          mid: v.result.estimatedMidInr,
          high: v.result.estimatedHighInr,
          confidence: v.result.confidenceScore,
        },
        reasoning: v.result.reasoning,
        fullReport: v.result.fullReport,
      }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vaayu-valuations.json';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link to="/dashboard" className="font-body text-sm text-muted hover:text-ink">
        ← {t('dashboard.title')}
      </Link>
      <h1 className="mt-6 font-heading text-3xl text-ink">{t('settings.title')}</h1>

      <div className="mt-8 flex flex-col gap-5">
        <Card title={t('settings.profile')}>
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <TextField
              label={t('common.email')}
              name="email"
              value={user?.email ?? ''}
              disabled
              readOnly
            />
            <TextField
              label={t('common.fullName')}
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={profileBusy}>
                {t('settings.save')}
              </Button>
              {profileMsg ? (
                <span className="font-body text-sm text-muted">{profileMsg}</span>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title={t('settings.usage')}>
          <p className="font-body text-sm text-muted">
            {t('settings.freeRemaining')}{' '}
            <span className="font-medium text-ink">
              {t('settings.freeRemainingValue', {
                remaining: freeRemaining,
                total: env.freeValuationLimit,
              })}
            </span>
          </p>
          <p className="mt-1 font-body text-xs text-muted">
            {t('settings.role', { role: profile?.role ?? 'individual' })}
          </p>
        </Card>

        <Card title={t('settings.changePassword')}>
          <form onSubmit={changePassword} className="flex flex-col gap-4">
            <TextField
              label={t('auth.newPassword')}
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label={t('auth.confirmPassword')}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {pwErr ? <p className="font-body text-sm text-red-700">{pwErr}</p> : null}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={pwBusy}>
                {t('auth.updatePassword')}
              </Button>
              {pwMsg ? <span className="font-body text-sm text-muted">{pwMsg}</span> : null}
            </div>
          </form>
        </Card>

        <Card title={t('settings.yourData')}>
          <p className="font-body text-sm text-muted">{t('settings.exportDesc')}</p>
          <div className="mt-4">
            <Button variant="outline" onClick={exportJson} loading={exportBusy}>
              {t('settings.exportBtn')}
            </Button>
          </div>
        </Card>
      </div>

      <p className="mt-10 font-body text-xs text-muted">
        {t('settings.leavePrompt')}{' '}
        <button
          className="underline underline-offset-4 hover:text-ink"
          onClick={async () => {
            const { signOut } = await import('../lib/auth');
            await signOut();
            navigate('/login', { replace: true });
          }}
        >
          {t('common.signOut')}
        </button>
      </p>
    </main>
  );
}
