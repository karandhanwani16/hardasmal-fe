import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { PinInput } from '../components/ui/PinInput';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export function SetupPinPage() {
  const { user, setupPin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [pinConfirmation, setPinConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.must_set_pin) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4 || pinConfirmation.length !== 4) {
      setError('PIN must be exactly 4 digits.');
      return;
    }

    if (pin !== pinConfirmation) {
      setError('PINs do not match. Enter the same PIN twice.');
      return;
    }

    setLoading(true);
    try {
      await setupPin(pin, pinConfirmation);
      navigate('/', { replace: true });
    } catch {
      setError('Could not save your PIN. Try again.');
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
        <h1 className="text-xl font-semibold tracking-tight">Choose your PIN</h1>
        <p className="mt-2 text-sm leading-relaxed text-ledger-700">
          Welcome{user?.name ? `, ${user.name}` : ''}. Pick a new 4-digit PIN only you will remember.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <PinInput id="setup-pin" label="New PIN" value={pin} onChange={setPin} autoComplete="new-password" />
          <PinInput
            id="setup-pin-confirm"
            label="Confirm PIN"
            value={pinConfirmation}
            onChange={setPinConfirmation}
            autoComplete="new-password"
            error={error || undefined}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Save PIN & continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
