import { useEffect, useState } from 'react';
import './App.css';

function formatWhen(value) {
  if (value == null) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString();
}

export default function App() {
  const [health, setHealth] = useState(null);
  const [usersState, setUsersState] = useState({
    loading: true,
    users: [],
    error: null,
    message: null
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setHealth(data);
      })
      .catch(() => {
        if (!cancelled) setHealth({ error: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/users')
      .then(async (r) => {
        const text = await r.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { message: `Non-JSON response (${r.status}): ${text.slice(0, 120)}` };
        }
        if (!r.ok) {
          if (!cancelled) {
            setUsersState({
              loading: false,
              users: [],
              error: true,
              message: data.message || data.error || `${r.status} ${r.statusText}`
            });
          }
          return;
        }
        if (!cancelled) {
          setUsersState({
            loading: false,
            users: Array.isArray(data.users) ? data.users : [],
            error: null,
            message: null
          });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setUsersState({
            loading: false,
            users: [],
            error: true,
            message: e instanceof Error ? e.message : 'Network error'
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app">
      <h1>shop-keep</h1>
      <p className="lede">React UI with a Hapi API.</p>
      <section className="panel">
        <h2>API check</h2>
        {!health && <p>Loading /api/health…</p>}
        {health?.error && (
          <p className="error">Could not reach the API. Is the server running on port 3000?</p>
        )}
        {health && !health.error && (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        )}
      </section>

      <section className="panel users-panel">
        <h2>Users (up to 5)</h2>
        {usersState.loading && <p>Loading users…</p>}
        {usersState.error && (
          <div className="error-block">
            <p className="error">Could not load users.</p>
            {usersState.message && (
              <pre className="error-detail">{usersState.message}</pre>
            )}
          </div>
        )}
        {!usersState.loading && !usersState.error && usersState.users.length === 0 && (
          <p className="muted">No users in the database yet.</p>
        )}
        {!usersState.loading && !usersState.error && usersState.users.length > 0 && (
          <div className="table-wrap">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {usersState.users.map((u) => (
                  <tr key={String(u.id)}>
                    <td>{String(u.id)}</td>
                    <td>{u.email}</td>
                    <td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                    <td>{u.role}</td>
                    <td>{u.is_active ? 'Yes' : 'No'}</td>
                    <td className="nowrap">{formatWhen(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
