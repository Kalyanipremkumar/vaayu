import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { sendPasswordReset } from '../lib/auth';

/** Request a password-reset email. */
export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.sendResetFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t('auth.forgotTitle')}
      subtitle={sent ? undefined : t('auth.forgotLead')}
      footer={
        <Link to="/login" className="text-ink underline underline-offset-4">
          {t('auth.backToSignIn')}
        </Link>
      }
    >
      {sent ? (
        <p className="rounded-md border border-border bg-gold/10 p-3 font-body text-sm text-ink">
          {t('auth.resetSent', { email })}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label={t('common.email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error ? <p className="font-body text-sm text-red-700">{error}</p> : null}
          <Button type="submit" loading={loading}>
            {t('auth.sendResetLink')}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
