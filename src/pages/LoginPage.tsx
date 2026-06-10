import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { FieldLabel, Input } from '../components/ui/Input';
import { PinInput } from '../components/ui/PinInput';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { toAuthErrorMessage } from '../lib/hosting-security';

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && user && !user.must_set_pin) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && user?.must_set_pin) {
    return <Navigate to="/setup-pin" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Enter your 4-digit PIN.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const loggedInUser = await login(username.trim(), pin);
      navigate(loggedInUser.must_set_pin ? '/setup-pin' : '/');
    } catch (err) {
      setError(toAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ledger-50 px-4 py-6">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-lg border border-ledger-200 bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold tracking-tight">Hardasmal CMS</h1>
        <p className="mt-1 text-sm text-ledger-700">Sign in with your username and 4-digit PIN</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <FieldLabel htmlFor="login-username">Username</FieldLabel>
            <Input
              id="login-username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <PinInput
            id="login-pin"
            label="PIN"
            value={pin}
            onChange={setPin}
            autoComplete="current-password"
            error={error || undefined}
          />
          {error ? null : <p className="text-xs text-ledger-700">First time? Use the PIN your admin gave you, then choose your own.</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
