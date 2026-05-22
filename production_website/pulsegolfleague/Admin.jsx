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

// ── Email Tab ─────────────────────────────────────────────────────────────────
function EmailsTab({ registrations, password }) {
  // Sent emails list
  const [emails, setEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState('');
  const [detailEmail, setDetailEmail] = useState(null);

  // Compose
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [customTo, setCustomTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [sendError, setSendError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmRecipients, setConfirmRecipients] = useState([]);

  const loadEmails = useCallback(async () => {
    setEmailsLoading(true);
    setEmailsError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/emails?limit=50`, {
        headers: { Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load emails.');
      setEmails(data.data || []);
    } catch (err) {
      setEmailsError(err.message);
    } finally {
      setEmailsLoading(false);
    }
  }, [password]);

  useEffect(() => { loadEmails(); }, [loadEmails]);

  const loadDetail = async (emailId) => {
    setDetailEmail({ id: emailId, _loading: true });
    try {
      const res = await fetch(`${API_URL}/api/admin/emails/${emailId}`, {
        headers: { Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load email.');
      setDetailEmail(data);
    } catch (err) {
      setDetailEmail({ _error: err.message });
    }
  };

  const togglePlayer = (email) => {
    setSelectedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const quickSelect = (filterType) => {
    const addrs = registrations
      .filter((r) => {
        if (filterType === 'all') return true;
        if (filterType === 'active') return r.charge_status === 'pending' || r.charge_status === 'charged';
        return r.charge_status === filterType;
      })
      .map((r) => r.email);
    setSelectedPlayers(new Set(addrs));
  };

  const getRecipients = () => {
    const custom = customTo
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
    return [...new Set([...selectedPlayers, ...custom])];
  };

  const handleSendClick = () => {
    const recipients = getRecipients();
    if (recipients.length === 0) { setSendError('Select at least one recipient.'); return; }
    if (!subject.trim()) { setSendError('Subject is required.'); return; }
    if (!body.trim()) { setSendError('Message body is required.'); return; }
    setSendError('');
    setConfirmRecipients(recipients);
    setShowConfirm(true);
  };

  const handleSendConfirm = async () => {
    setShowConfirm(false);
    setSending(true);
    setSendResult(null);
    setSendError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ recipients: confirmRecipients, subject: subject.trim(), body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed.');
      setSendResult(data);
      setSubject('');
      setBody('');
      setSelectedPlayers(new Set());
      setCustomTo('');
      loadEmails();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  const recipientCount = getRecipients().length;

  return (
    <div className="admin-email-tab">

      {/* ── Sent Emails ── */}
      <section className="admin-email-section">
        <div className="admin-email-section-header">
          <h3 className="admin-email-section-title">Sent Emails</h3>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={loadEmails}
            disabled={emailsLoading}
          >
            {emailsLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {emailsError && <p className="admin-load-error" style={{ margin: '12px 24px 0' }}>{emailsError}</p>}
        <div className="admin-table-wrap" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>To</th>
                <th>Subject</th>
                <th>Sent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {emailsLoading && (
                <tr><td colSpan={4} className="admin-empty-row">Loading…</td></tr>
              )}
              {!emailsLoading && emails.length === 0 && (
                <tr><td colSpan={4} className="admin-empty-row">No emails found.</td></tr>
              )}
              {emails.map((e) => (
                <tr
                  key={e.id}
                  className="admin-row admin-email-row"
                  onClick={() => loadDetail(e.id)}
                >
                  <td className="admin-email-to">{Array.isArray(e.to) ? e.to.join(', ') : e.to}</td>
                  <td>{e.subject}</td>
                  <td className="admin-email-date">
                    {e.created_at
                      ? new Date(e.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: 'numeric', minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td>
                    <span className={`admin-email-event admin-email-event-${e.last_event}`}>
                      {e.last_event || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Compose ── */}
      <section className="admin-email-section">
        <div className="admin-email-section-header">
          <h3 className="admin-email-section-title">Compose</h3>
        </div>

        {/* Recipients */}
        <div className="admin-compose-block">
          <div className="admin-compose-label">Recipients</div>
          <div className="admin-compose-quickbtns">
            <button className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => quickSelect('all')}>All</button>
            <button className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => quickSelect('active')}>Active (Pending + Charged)</button>
            <button className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => quickSelect('pending')}>Pending</button>
            <button className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => quickSelect('charged')}>Charged</button>
            <button className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => setSelectedPlayers(new Set())}>Clear</button>
          </div>
          <div className="admin-compose-player-list">
            {registrations.length === 0 && (
              <p className="admin-compose-empty">No registered players.</p>
            )}
            {registrations.map((r) => (
              <label key={r.id} className="admin-compose-player-row">
                <input
                  type="checkbox"
                  checked={selectedPlayers.has(r.email)}
                  onChange={() => togglePlayer(r.email)}
                />
                <span className="admin-compose-player-name">{r.first_name} {r.last_name}</span>
                <span className="admin-compose-player-email">{r.email}</span>
                <span className={`admin-status-badge ${statusColor(r.charge_status)} admin-compose-badge`}>
                  {r.charge_status}
                </span>
              </label>
            ))}
          </div>
          <input
            className="admin-edit-input admin-compose-custom-input"
            type="text"
            placeholder="Custom recipients (comma-separated): extra@example.com, other@example.com"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
          />
          <p className="admin-compose-count">
            {recipientCount} recipient{recipientCount !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Subject */}
        <div className="admin-compose-block">
          <label className="admin-compose-label">Subject</label>
          <input
            className="admin-edit-input"
            type="text"
            placeholder="Tournament update — Yolo Fliers Matchplay Championship"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Body */}
        <div className="admin-compose-block">
          <label className="admin-compose-label">Message</label>
          <p className="admin-compose-hint">Separate paragraphs with a blank line. Sent in the PGL branded email template.</p>
          <textarea
            className="admin-compose-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder={'Write your message here.\n\nStart a new paragraph by adding a blank line between sections.'}
          />
        </div>

        {sendError && <p className="admin-load-error" style={{ margin: '0 24px 12px' }}>{sendError}</p>}
        {sendResult && (
          <div className="admin-compose-success">
            ✓ Sent to {sendResult.sent} recipient{sendResult.sent !== 1 ? 's' : ''}.
            {sendResult.failed > 0 && ` ${sendResult.failed} failed.`}
          </div>
        )}

        <div className="admin-compose-actions">
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSendClick}
            disabled={sending}
          >
            {sending ? 'Sending…' : 'Send Email →'}
          </button>
        </div>
      </section>

      {/* ── Email Detail Modal ── */}
      {detailEmail && (
        <div className="admin-modal-overlay" onClick={() => setDetailEmail(null)}>
          <div className="admin-modal admin-email-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {detailEmail._loading ? 'Loading…' : detailEmail._error ? 'Error' : (detailEmail.subject || 'Email Detail')}
              </h3>
              <button className="admin-modal-close" onClick={() => setDetailEmail(null)}>✕</button>
            </div>
            {detailEmail._loading && (
              <div className="admin-modal-body"><p>Loading email content…</p></div>
            )}
            {detailEmail._error && (
              <div className="admin-modal-error" style={{ margin: '16px' }}>{detailEmail._error}</div>
            )}
            {!detailEmail._loading && !detailEmail._error && (
              <>
                <div className="admin-email-meta">
                  <div><strong>To:</strong> {Array.isArray(detailEmail.to) ? detailEmail.to.join(', ') : detailEmail.to}</div>
                  <div><strong>From:</strong> {detailEmail.from}</div>
                  <div><strong>Sent:</strong> {detailEmail.created_at ? new Date(detailEmail.created_at).toLocaleString() : '—'}</div>
                  <div><strong>Status:</strong> {detailEmail.last_event || '—'}</div>
                </div>
                {detailEmail.html ? (
                  <iframe
                    className="admin-email-frame"
                    srcDoc={detailEmail.html}
                    sandbox="allow-same-origin"
                    title="Email preview"
                  />
                ) : (
                  <div className="admin-email-text">{detailEmail.text || 'No content.'}</div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Send Confirmation Modal ── */}
      {showConfirm && (
        <div className="admin-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="admin-modal admin-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Confirm Send</h3>
              <button className="admin-modal-close" onClick={() => setShowConfirm(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>
                Send <strong>"{subject}"</strong> to{' '}
                <strong>{confirmRecipients.length} recipient{confirmRecipients.length !== 1 ? 's' : ''}</strong>?
              </p>
              <div className="admin-confirm-list">
                {confirmRecipients.slice(0, 8).map((addr) => (
                  <div key={addr} className="admin-confirm-addr">{addr}</div>
                ))}
                {confirmRecipients.length > 8 && (
                  <div className="admin-confirm-addr admin-confirm-more">
                    …and {confirmRecipients.length - 8} more
                  </div>
                )}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-primary" onClick={handleSendConfirm}>
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [tab, setTab] = useState('registrations');

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
        {tab === 'registrations' ? (
          <button
            className="admin-btn admin-btn-secondary admin-refresh-btn"
            onClick={() => fetchRegistrations(password)}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        ) : (
          <div className="admin-header-spacer" />
        )}
      </header>

      {/* Tab nav */}
      <div className="admin-tabs">
        <button
          className={`admin-tab${tab === 'registrations' ? ' admin-tab-active' : ''}`}
          onClick={() => setTab('registrations')}
        >
          Registrations
        </button>
        <button
          className={`admin-tab${tab === 'emails' ? ' admin-tab-active' : ''}`}
          onClick={() => setTab('emails')}
        >
          Email
        </button>
      </div>

      {tab === 'registrations' && (
      <>

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

      </> /* end registrations tab */
      )}

      {tab === 'emails' && (
        <EmailsTab registrations={registrations} password={password} />
      )}
    </div>
  );
}
