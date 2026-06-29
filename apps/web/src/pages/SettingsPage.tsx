import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FREE_VALUATION_LIMIT } from '@vaayu/shared';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';
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

  const freeRemaining = Math.max(0, FREE_VALUATION_LIMIT - (profile?.freeValuationsUsed ?? 0));

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
      setProfileMsg('Saved.');
    } catch {
      setProfileMsg('Could not save. Please try again.');
    } finally {
      setProfileBusy(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPwErr(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setPwErr('Passwords do not match.');
      return;
    }
    setPwBusy(true);
    try {
      await updatePassword(password);
      setPassword('');
      setConfirm('');
      setPwMsg('Password updated.');
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : 'Could not update the password.');
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
        ← Your valuations
      </Link>
      <h1 className="mt-6 font-heading text-3xl text-ink">Settings</h1>

      <div className="mt-8 flex flex-col gap-5">
        <Card title="Profile">
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <TextField label="Email" name="email" value={user?.email ?? ''} disabled readOnly />
            <TextField
              label="Full name"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={profileBusy}>
                Save
              </Button>
              {profileMsg ? (
                <span className="font-body text-sm text-muted">{profileMsg}</span>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="Usage">
          <p className="font-body text-sm text-muted">
            Free valuations remaining:{' '}
            <span className="font-medium text-ink">
              {freeRemaining} of {FREE_VALUATION_LIMIT}
            </span>
          </p>
          <p className="mt-1 font-body text-xs text-muted">Role: {profile?.role ?? 'individual'}</p>
        </Card>

        <Card title="Change password">
          <form onSubmit={changePassword} className="flex flex-col gap-4">
            <TextField
              label="New password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {pwErr ? <p className="font-body text-sm text-red-700">{pwErr}</p> : null}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={pwBusy}>
                Update password
              </Button>
              {pwMsg ? <span className="font-body text-sm text-muted">{pwMsg}</span> : null}
            </div>
          </form>
        </Card>

        <Card title="Your data">
          <p className="font-body text-sm text-muted">Download all your valuations as JSON.</p>
          <div className="mt-4">
            <Button variant="outline" onClick={exportJson} loading={exportBusy}>
              Export valuations (JSON)
            </Button>
          </div>
        </Card>
      </div>

      <p className="mt-10 font-body text-xs text-muted">
        Need to leave?{' '}
        <button
          className="underline underline-offset-4 hover:text-ink"
          onClick={async () => {
            const { signOut } = await import('../lib/auth');
            await signOut();
            navigate('/login', { replace: true });
          }}
        >
          Sign out
        </button>
      </p>
    </main>
  );
}
