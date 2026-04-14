import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authHeaders, clearToken, getToken } from '../auth/storage.js';
import '../App.css';

const LIST_URL = '/api/users?limit=200';

const ROLES = ['SHOP', 'ADMIN', 'FIELD'];

const emptyForm = {
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: 'SHOP',
  is_active: true
};

async function parseJsonResponse(r) {
  const text = await r.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 200) };
  }
}

export default function UserAdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const formVisible = editingId != null || createFormOpen;

  const redirectToLogin = useCallback(() => {
    clearToken();
    navigate('/login', { replace: true, state: { from: '/user' } });
  }, [navigate]);

  useEffect(() => {
    if (!getToken()) {
      redirectToLogin();
    }
  }, [redirectToLogin]);

  const loadUsers = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const r = await fetch(LIST_URL, { headers: authHeaders() });
      if (r.status === 401 || r.status === 403) {
        setUsers([]);
        setError(
          r.status === 403
            ? 'You need the ADMIN role to manage users.'
            : 'Session expired. Sign in again.'
        );
        redirectToLogin();
        return;
      }
      const data = await parseJsonResponse(r);
      if (!r.ok) {
        setError(data.message || data.error || `${r.status}`);
        setUsers([]);
        return;
      }
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [redirectToLogin]);

  useEffect(() => {
    if (getToken()) {
      loadUsers();
    }
  }, [loadUsers]);

  function closeForm() {
    setEditingId(null);
    setCreateFormOpen(false);
    setForm(emptyForm);
    setMessage(null);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setCreateFormOpen(true);
    setMessage(null);
  }

  function startEdit(u) {
    setCreateFormOpen(false);
    setEditingId(String(u.id ?? u.user_id));
    const r = u.role ? String(u.role).toUpperCase() : 'SHOP';
    const role = ROLES.includes(r) ? r : 'SHOP';
    setForm({
      email: u.email || '',
      password: '',
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      role,
      is_active: !!u.is_active
    });
    setMessage(null);
  }

  function logout() {
    clearToken();
    navigate('/login', { replace: true, state: { from: '/user' } });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      if (editingId) {
        const body = {
          email: form.email.trim(),
          first_name: form.first_name,
          last_name: form.last_name,
          role: form.role,
          is_active: form.is_active
        };
        if (form.password.trim()) body.password = form.password;
        const r = await fetch(`/api/users/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify(body)
        });
        if (r.status === 401 || r.status === 403) {
          redirectToLogin();
          return;
        }
        const data = await parseJsonResponse(r);
        if (!r.ok) {
          setError(data.message || data.error || `Update failed (${r.status})`);
          return;
        }
        setMessage('User updated.');
        closeForm();
        await loadUsers();
      } else {
        const r = await fetch('/api/users', {
          method: 'POST',
          headers: authHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
            first_name: form.first_name,
            last_name: form.last_name,
            role: form.role,
            is_active: form.is_active
          })
        });
        if (r.status === 401 || r.status === 403) {
          redirectToLogin();
          return;
        }
        const data = await parseJsonResponse(r);
        if (!r.ok) {
          setError(data.message || data.error || `Create failed (${r.status})`);
          return;
        }
        setMessage('User created.');
        closeForm();
        await loadUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(`Delete user ${id}?`)) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const r = await fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (r.status === 401 || r.status === 403) {
        redirectToLogin();
        return;
      }
      if (r.status === 204) {
        setMessage('User deleted.');
        if (editingId === String(id)) closeForm();
        await loadUsers();
        return;
      }
      const data = await parseJsonResponse(r);
      setError(data.message || data.error || `Delete failed (${r.status})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  if (!getToken()) {
    return null;
  }

  return (
    <main className="app admin-page">
      <header className="app-nav admin-top-nav">
        <Link to="/" className="nav-link">
          ← Home
        </Link>
        <button type="button" className="btn small linkish" onClick={logout}>
          Sign out
        </button>
      </header>
      <h1>User administration</h1>
      <p className="lede">Create, edit, and delete users (ADMIN only, up to 200 listed).</p>

      {error && (
        <div className="error-block admin-flash">
          <p className="error">{error}</p>
        </div>
      )}
      {message && (
        <p className="admin-flash success">{message}</p>
      )}

      <section className="panel admin-form-panel">
        {!formVisible && (
          <div className="create-form-collapsed">
            <button type="button" className="btn primary" onClick={openCreateForm} disabled={saving}>
              New user
            </button>
            <p className="muted create-form-hint">Add a user to the directory.</p>
          </div>
        )}
        {formVisible && (
          <>
            <div className="form-panel-heading">
              <h2>{editingId ? `Edit user #${editingId}` : 'New user'}</h2>
              <button type="button" className="btn small" onClick={() => closeForm()} disabled={saving}>
                Close
              </button>
            </div>
            <form className="admin-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  autoComplete="off"
                />
              </label>
              <label className="field">
                <span>{editingId ? 'New password (optional)' : 'Password'}</span>
                <input
                  type="password"
                  required={!editingId}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  autoComplete="new-password"
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>First name</span>
                  <input
                    value={form.first_name}
                    onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Last name</span>
                  <input
                    value={form.last_name}
                    onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                  />
                </label>
              </div>
              <label className="field">
                <span>Role</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field checkbox">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <span>Active</span>
              </label>
              <div className="form-actions">
                <button type="submit" className="btn primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create user'}
                </button>
              </div>
            </form>
          </>
        )}
      </section>

      <section className="panel">
        <h2>All users</h2>
        {loading && <p>Loading…</p>}
        {!loading && users.length === 0 && <p className="muted">No users yet.</p>}
        {!loading && users.length > 0 && (
          <div className="table-wrap">
            <table className="users-table admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, index) => {
                  const id = u.id ?? u.user_id;
                  const key = id != null ? String(id) : `row-${index}`;
                  return (
                    <tr key={key}>
                      <td>{id != null ? String(id) : '—'}</td>
                      <td>{u.email}</td>
                      <td>{[u.first_name, u.last_name].filter(Boolean).join(' ') || '—'}</td>
                      <td>{u.role}</td>
                      <td>{u.is_active ? 'Yes' : 'No'}</td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="btn small"
                          onClick={() => startEdit(u)}
                          disabled={saving}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn small danger"
                          onClick={() => handleDelete(id)}
                          disabled={saving || id == null}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
