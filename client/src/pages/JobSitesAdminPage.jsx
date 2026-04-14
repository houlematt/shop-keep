import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const LIST_URL = '/api/job-sites?limit=500';

const emptyForm = {
  name: '',
  code: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  latitude: '',
  longitude: '',
  customer_name: '',
  phone: '',
  notes: '',
  status: '',
  is_active: ''
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

export default function JobSitesAdminPage() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const formVisible = editingId != null || createFormOpen;

  const loadSites = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const r = await fetch(LIST_URL);
      const data = await parseJsonResponse(r);
      if (!r.ok) {
        setError(data.message || data.error || `${r.status}`);
        setSites([]);
        return;
      }
      setSites(Array.isArray(data.jobSites) ? data.jobSites : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSites();
  }, [loadSites]);

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

  function startEdit(s) {
    setCreateFormOpen(false);
    setEditingId(String(s.id ?? s.job_site_id));
    setForm({
      name: s.name || '',
      code: s.code || '',
      address_line1: s.address_line1 || '',
      address_line2: s.address_line2 || '',
      city: s.city || '',
      state: s.state || '',
      postal_code: s.postal_code || '',
      country: s.country || '',
      latitude: s.latitude != null ? String(s.latitude) : '',
      longitude: s.longitude != null ? String(s.longitude) : '',
      customer_name: s.customer_name || '',
      phone: s.phone || '',
      notes: s.notes || '',
      status: s.status != null ? String(s.status) : '',
      is_active: s.is_active == null ? '' : s.is_active ? '1' : '0'
    });
    setMessage(null);
  }

  function trimOrNull(v) {
    if (v == null) return null;
    const t = String(v).trim();
    return t === '' ? null : t;
  }

  function payloadFromForm() {
    let is_active;
    if (form.is_active === '') is_active = null;
    else if (form.is_active === '1') is_active = true;
    else is_active = false;

    return {
      name: form.name.trim(),
      code: trimOrNull(form.code),
      address_line1: trimOrNull(form.address_line1),
      address_line2: trimOrNull(form.address_line2),
      city: trimOrNull(form.city),
      state: trimOrNull(form.state),
      postal_code: trimOrNull(form.postal_code),
      country: trimOrNull(form.country),
      latitude: form.latitude === '' || form.latitude == null ? null : form.latitude,
      longitude: form.longitude === '' || form.longitude == null ? null : form.longitude,
      customer_name: trimOrNull(form.customer_name),
      phone: trimOrNull(form.phone),
      notes: trimOrNull(form.notes),
      status: trimOrNull(form.status),
      is_active
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const body = payloadFromForm();
      if (editingId) {
        const r = await fetch(`/api/job-sites/${encodeURIComponent(editingId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await parseJsonResponse(r);
        if (!r.ok) {
          setError(data.message || data.error || `Update failed (${r.status})`);
          return;
        }
        setMessage('Job site updated.');
        closeForm();
        await loadSites();
      } else {
        const r = await fetch('/api/job-sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await parseJsonResponse(r);
        if (!r.ok) {
          setError(data.message || data.error || `Create failed (${r.status})`);
          return;
        }
        setMessage('Job site created.');
        closeForm();
        await loadSites();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(`Delete job site ${id}?`)) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const r = await fetch(`/api/job-sites/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (r.status === 204) {
        setMessage('Job site deleted.');
        if (editingId === String(id)) closeForm();
        await loadSites();
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

  return (
    <main className="app admin-page">
      <header className="app-nav admin-top-nav">
        <Link to="/" className="nav-link">
          ← Home
        </Link>
      </header>
      <h1>Job sites</h1>
      <p className="lede">Create and manage job sites. No sign-in required.</p>

      {error && (
        <div className="error-block admin-flash">
          <p className="error">{error}</p>
        </div>
      )}
      {message && <p className="admin-flash success">{message}</p>}

      <section className="panel admin-form-panel">
        {!formVisible && (
          <div className="create-form-collapsed">
            <button type="button" className="btn primary" onClick={openCreateForm} disabled={saving}>
              New job site
            </button>
            <p className="muted create-form-hint">Add a site to the list.</p>
          </div>
        )}
        {formVisible && (
          <>
            <div className="form-panel-heading">
              <h2>{editingId ? `Edit #${editingId}` : 'New job site'}</h2>
              <button type="button" className="btn small" onClick={() => closeForm()} disabled={saving}>
                Close
              </button>
            </div>
            <form className="admin-form job-site-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Name *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>Code</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                  placeholder="Optional reference"
                />
              </label>
              <label className="field">
                <span>Address line 1</span>
                <input
                  value={form.address_line1}
                  onChange={(e) => setForm((f) => ({ ...f, address_line1: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>Address line 2</span>
                <input
                  value={form.address_line2}
                  onChange={(e) => setForm((f) => ({ ...f, address_line2: e.target.value }))}
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>City</span>
                  <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </label>
                <label className="field">
                  <span>State / region</span>
                  <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
                </label>
              </div>
              <div className="field-row">
                <label className="field">
                  <span>Postal code</span>
                  <input
                    value={form.postal_code}
                    onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Country (ISO-2)</span>
                  <input
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    maxLength={2}
                  />
                </label>
              </div>
              <div className="field-row">
                <label className="field">
                  <span>Latitude</span>
                  <input
                    value={form.latitude}
                    onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                    placeholder="Optional"
                  />
                </label>
                <label className="field">
                  <span>Longitude</span>
                  <input
                    value={form.longitude}
                    onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                    placeholder="Optional"
                  />
                </label>
              </div>
              <label className="field">
                <span>Customer name</span>
                <input
                  value={form.customer_name}
                  onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>Phone</span>
                <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </label>
              <label className="field">
                <span>Notes</span>
                <textarea
                  className="textarea-field"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </label>
              <label className="field">
                <span>Status</span>
                <input
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  placeholder="Optional"
                />
              </label>
              <label className="field">
                <span>Active</span>
                <select
                  value={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value }))}
                >
                  <option value="">Not set</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </label>
              <div className="form-actions">
                <button type="submit" className="btn primary" disabled={saving}>
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create job site'}
                </button>
              </div>
            </form>
          </>
        )}
      </section>

      <section className="panel">
        <h2>All job sites</h2>
        {loading && <p>Loading…</p>}
        {!loading && sites.length === 0 && <p className="muted">No job sites yet.</p>}
        {!loading && sites.length > 0 && (
          <div className="table-wrap">
            <table className="users-table admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Active</th>
                  <th className="actions-col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s, index) => {
                  const id = s.id ?? s.job_site_id;
                  const key = id != null ? String(id) : `row-${index}`;
                  const loc = [s.city, s.state].filter(Boolean).join(', ') || '—';
                  return (
                    <tr key={key}>
                      <td>{id != null ? String(id) : '—'}</td>
                      <td>{s.name}</td>
                      <td>{s.code || '—'}</td>
                      <td>{loc}</td>
                      <td>{s.status ?? '—'}</td>
                      <td>{s.is_active == null ? '—' : s.is_active ? 'Yes' : 'No'}</td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="btn small"
                          onClick={() => startEdit(s)}
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
