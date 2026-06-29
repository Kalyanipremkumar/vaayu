import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/Button';
import { TextField } from '../components/TextField';
import { signUpWithEmail } from '../lib/auth';

const MIN_PASSWORD_LENGTH = 8;

/** Create an account with email/password. (Google is disabled until configured.) */
export function SignupPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('auth.minPassword', { count: MIN_PASSWORD_LENGTH }));
      return;
    }
    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password, fullName);
      // If email confirmation is on, there is no active session yet.
      if (result.session) {
        navigate('/dashboard', { replace: true });
      } else {
        setNotice(t('auth.signupNotice'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.signupFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={t('auth.signupTitle')}
      subtitle={t('auth.signupSubtitle')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-ink underline underline-offset-4">
            {t('common.signIn')}
          </Link>
        </>
      }
    >
      {notice ? (
        <p className="mb-4 rounded-md border border-border bg-gold/10 p-3 font-body text-sm text-ink">
          {notice}
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label={t('common.fullName')}
          name="fullName"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <TextField
          label={t('common.email')}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label={t('common.password')}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="font-body text-sm text-red-700">{error}</p> : null}
        <Button type="submit" loading={loading}>
          {t('auth.createAccountBtn')}
        </Button>
      </form>
    </AuthLayout>
  );
}
