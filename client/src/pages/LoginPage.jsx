import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getToken, setToken, setUserProfile } from '../auth/storage.js';
import '../App.css';

async function parseJsonResponse(r) {
  const text = await r.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 200) };
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const rawFrom = location.state?.from;
  const from =
    typeof rawFrom === 'string' && rawFrom.startsWith('/') && !rawFrom.startsWith('//')
      ? rawFrom
      : '/';

  useEffect(() => {
    if (getToken()) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await parseJsonResponse(r);
      if (!r.ok) {
        setError(data.message || data.error || `Login failed (${r.status})`);
        return;
      }
      if (!data.token) {
        setError('No token returned');
        return;
      }
      setToken(data.token);
      setUserProfile(data.user ?? null);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app home">
      <header className="app-nav">
        <Link to="/" className="nav-link">
          ← Home
        </Link>
      </header>
      <h1 className="home-title">Sign in</h1>
      <p className="lede">Sign in to use the app.</p>

      {error && (
        <div className="error-block admin-flash">
          <p className="error">{error}</p>
        </div>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </main>
  );
}
