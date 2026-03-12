import { useState } from 'react';
import { login } from '../api/client';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      const data = await login(username.trim(), password);
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="font-display font-bold text-2xl tracking-wide text-white">
            LIMINAL GAINS
          </div>
          <div className="font-mono text-xs text-muted mt-1">liminalgains.fit</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-muted uppercase tracking-wider font-display mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-3 text-white font-body outline-none focus:border-accent/50 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs text-muted uppercase tracking-wider font-display mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-surface-700 border border-surface-500 rounded-lg px-3 py-3 text-white font-body outline-none focus:border-accent/50 min-h-[44px]"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 font-body">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-surface-900 font-display font-medium py-3.5 rounded-lg active:bg-accent-dim transition-colors min-h-[48px] text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-muted/50 font-body text-center mt-8">
          Invite only. Contact admin for access.
        </p>
      </div>
    </div>
  );
}
