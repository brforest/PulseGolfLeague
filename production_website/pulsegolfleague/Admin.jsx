import React, { useEffect, useState, useCallback } from 'react';

const PglLogo = '/images/pgl_logo.png';
const API_URL = import.meta.env.VITE_API_URL || '';

const CHARGE_STATUS_OPTIONS = ['pending', 'charged', 'failed', 'withdrawn'];
const PLAYING_STATUS_OPTIONS = ['Professional', 'Amateur'];

function statusColor(status) {
  switch (status) {
    case 'charged':    return 'admin-status-charged';
    case 'pending':    return 'admin-status-pending';
    case 'failed':     return 'admin-status-failed';
    case 'withdrawn':  return 'admin-status-withdrawn';
    default:           return '';
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMoney(cents) {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ reg, password, onSave, onClose }) {
  const [form, setForm] = useState({
    first_name:          reg.first_name,
    last_name:           reg.last_name,
    nickname:            reg.nickname || '',
    email:               reg.email,
    phone:               reg.phone,
    address:             reg.address,
    city:                reg.city,
    state:               reg.state,
    zip:                 reg.zip,
    country:             reg.country,
    nationality:         reg.nationality,
    playing_status:      reg.playing_status,
    ghin_number:         reg.ghin_number || '',
    home_town:           reg.home_town,
    home_course:         reg.home_course,
    college:             reg.college || '',
    instagram:           reg.instagram || '',
    twitter:             reg.twitter || '',
    tiktok:              reg.tiktok || '',
    charge_status:       reg.charge_status,
    scheduled_charge_date: reg.scheduled_charge_date
      ? reg.scheduled_charge_date.slice(0, 10)
      : '',
    charge_error:        reg.charge_error || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/registrations/${reg.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed.');
      onSave({ ...reg, ...form });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text', opts = null) => (
    <div className="admin-edit-field">
      <label className="admin-edit-label">{label}</label>
      {opts ? (
        <select className="admin-edit-input" value={form[key]} onChange={(e) => set(key, e.target.value)}>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          className="admin-edit-input"
          type={type}
          value={form[key]}
          onChange={(e) => set(key, e.target.value)}
        />
      )}
    </div>
  );

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Edit Registration #{reg.id}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          <div className="admin-edit-section-title">Personal</div>
          <div className="admin-edit-row">
            {field('First Name', 'first_name')}
            {field('Last Name', 'last_name')}
          </div>
          {field('Nickname', 'nickname')}
          <div className="admin-edit-row">
            {field('Home Town', 'home_town')}
            {field('Nationality', 'nationality')}
          </div>

          <div className="admin-edit-section-title">Contact</div>
          {field('Street Address', 'address')}
          <div className="admin-edit-row">
            {field('City', 'city')}
            {field('State', 'state')}
          </div>
          <div className="admin-edit-row">
            {field('ZIP', 'zip')}
            {field('Country', 'country')}
          </div>
          <div className="admin-edit-row">
            {field('Email', 'email', 'email')}
            {field('Phone', 'phone', 'tel')}
          </div>

          <div className="admin-edit-section-title">Golf</div>
          {field('Playing Status', 'playing_status', 'text', PLAYING_STATUS_OPTIONS)}
          <div className="admin-edit-row">
            {field('GHIN Number', 'ghin_number')}
            {field('Home Course', 'home_course')}
          </div>
          {field('College', 'college')}

          <div className="admin-edit-section-title">Social (optional)</div>
          <div className="admin-edit-row">
            {field('Instagram', 'instagram')}
            {field('Twitter / X', 'twitter')}
          </div>
          {field('TikTok', 'tiktok')}

          <div className="admin-edit-section-title">Payment</div>
          {field('Charge Status', 'charge_status', 'text', CHARGE_STATUS_OPTIONS)}
          {field('Scheduled Charge Date', 'scheduled_charge_date', 'date')}
          {field('Charge Error (if any)', 'charge_error')}
        </div>

        {error && <div className="admin-modal-error">{error}</div>}

        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Component ───────────────────────────────────────────────────────
export default function Admin({ onBack }) {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [password, setPassword] = useState('');

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRegistrations = useCallback(async (pw) => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/registrations`, {
        headers: { Authorization: `Bearer ${pw}` },
      });
      if (res.status === 401) {
        setAuthed(false);
        setAuthError('Incorrect password.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load.');
      setRegistrations(data.registrations || []);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch(`${API_URL}/api/admin/registrations`, {
      headers: { Authorization: `Bearer ${passwordInput}` },
    });
    if (res.status === 401) {
      setAuthError('Incorrect password.');
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || 'Login failed.');
      return;
    }
    setPassword(passwordInput);
    setRegistrations(data.registrations || []);
    setAuthed(true);
  };

  const handleSave = (updated) => {
    setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/registrations/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed.');
      setRegistrations((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Filter rows
  const filtered = registrations.filter((r) => {
    const q = filter.toLowerCase();
    const matchText = !q || [
      r.first_name, r.last_name, r.email, r.home_town, r.home_course, r.phone,
    ].some((v) => v?.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'all' || r.charge_status === statusFilter;
    return matchText && matchStatus;
  });

  // Counts
  const counts = registrations.reduce((acc, r) => {
    acc[r.charge_status] = (acc[r.charge_status] || 0) + 1;
    return acc;
  }, {});

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-box">
          <img src={PglLogo} alt="PGL" className="admin-login-logo" />
          <h2 className="admin-login-title">Admin Access</h2>
          <form className="admin-login-form" onSubmit={handleLogin}>
            <input
              type="password"
              className="admin-login-input"
              placeholder="Admin password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            {authError && <p className="admin-login-error">{authError}</p>}
            <button type="submit" className="admin-btn admin-btn-primary admin-login-submit">
              Sign In
            </button>
          </form>
          <button className="admin-back-link" onClick={onBack}>← Back to site</button>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <header className="admin-header">
        <button className="admin-back-link" onClick={onBack}>← Site</button>
        <div className="admin-header-center">
          <img src={PglLogo} alt="PGL" className="admin-header-logo" />
          <span className="admin-header-label">Admin Dashboard</span>
        </div>
        <button
          className="admin-btn admin-btn-secondary admin-refresh-btn"
          onClick={() => fetchRegistrations(password)}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      {/* Stats strip */}
      <div className="admin-stats">
        <div className="admin-stat">
          <span className="admin-stat-value">{registrations.length}</span>
          <span className="admin-stat-label">Total</span>
        </div>
        <div className="admin-stat admin-stat-pending">
          <span className="admin-stat-value">{counts.pending || 0}</span>
          <span className="admin-stat-label">Pending</span>
        </div>
        <div className="admin-stat admin-stat-charged">
          <span className="admin-stat-value">{counts.charged || 0}</span>
          <span className="admin-stat-label">Charged</span>
        </div>
        <div className="admin-stat admin-stat-failed">
          <span className="admin-stat-value">{counts.failed || 0}</span>
          <span className="admin-stat-label">Failed</span>
        </div>
        <div className="admin-stat admin-stat-withdrawn">
          <span className="admin-stat-value">{counts.withdrawn || 0}</span>
          <span className="admin-stat-label">Withdrawn</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="admin-filters">
        <input
          className="admin-search"
          type="text"
          placeholder="Search by name, email, town, course…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          className="admin-status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          {CHARGE_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loadError && <p className="admin-load-error">{loadError}</p>}

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Charge Date</th>
              <th>Charged At</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="admin-empty-row">
                  {loading ? 'Loading…' : 'No registrations found.'}
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className={`admin-row admin-row-${r.charge_status}`}>
                <td className="admin-td-id">{r.id}</td>
                <td className="admin-td-name">
                  <div>{r.first_name} {r.last_name}</div>
                  {r.nickname && <div className="admin-nickname">"{r.nickname}"</div>}
                  <div className="admin-sub">{r.playing_status} · {r.home_course}</div>
                </td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>
                  <span className={`admin-status-badge ${statusColor(r.charge_status)}`}>
                    {r.charge_status}
                  </span>
                  {r.charge_error && (
                    <div className="admin-charge-error" title={r.charge_error}>⚠ error</div>
                  )}
                </td>
                <td className="admin-td-sq">
                  <div className="admin-sq-id" title={r.square_customer_id}>
                    {r.square_customer_id ? `cust: ${r.square_customer_id.slice(0, 10)}…` : '—'}
                  </div>
                  <div className="admin-sq-id" title={r.square_payment_id}>
                    {r.square_payment_id ? `pmt: ${r.square_payment_id.slice(0, 10)}…` : '—'}
                  </div>
                </td>
                <td>{formatMoney(r.charge_amount_cents)}</td>
                <td>{r.scheduled_charge_date ? r.scheduled_charge_date.slice(0, 10) : '—'}</td>
                <td>{r.charged_at ? formatDate(r.charged_at) : '—'}</td>
                <td>{formatDate(r.registered_at)}</td>
                <td className="admin-td-actions">
                  <button
                    className="admin-btn admin-btn-edit"
                    onClick={() => setEditTarget(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="admin-btn admin-btn-delete"
                    onClick={() => { setDeleteTarget(r); setDeleteError(''); }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          reg={editTarget}
          password={password}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal admin-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Confirm Delete</h3>
              <button className="admin-modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>
                Permanently delete the registration for{' '}
                <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong>{' '}
                ({deleteTarget.email})?
              </p>
              <p className="admin-delete-warning">This cannot be undone.</p>
            </div>
            {deleteError && <div className="admin-modal-error">{deleteError}</div>}
            <div className="admin-modal-footer">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-delete"
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
