import React, { useEffect, useState, useCallback, useRef } from 'react';

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
    referred_by:         reg.referred_by || '',
    charge_status:       reg.charge_status,
    scheduled_charge_date: reg.scheduled_charge_date
      ? reg.scheduled_charge_date.slice(0, 10)
      : '',
    charge_error:        reg.charge_error || '',
    active:              reg.active !== false,
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
          <div className="admin-edit-section-title">Enrollment</div>
          <div className="admin-edit-field">
            <label className="admin-edit-label">Active</label>
            <select className="admin-edit-input" value={form.active ? 'true' : 'false'} onChange={(e) => set('active', e.target.value === 'true')}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

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

          <div className="admin-edit-section-title">Referral</div>
          {field('Referred By', 'referred_by')}

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

// ── Referrals Tab ─────────────────────────────────────────────────────────────
function ReferralsTab({ password }) {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/referrals`, {
          headers: { Authorization: `Bearer ${password}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load referrals.');
        setReferrals(data.referrals || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [password]);

  if (loading) return <p className="admin-load-error">Loading referrals…</p>;
  if (error)   return <p className="admin-load-error">{error}</p>;
  if (referrals.length === 0) return <p className="admin-load-error">No referrals recorded yet.</p>;

  return (
    <div className="admin-referrals">
      <p className="admin-referrals-note">
        Each row is a player who referred others. Players with 1+ referral earn a discount on their entry fee.
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Referring Player</th>
              <th># Referrals</th>
              <th>Players Referred</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((row) => (
              <tr key={row.referred_by} className="admin-row">
                <td className="admin-td-name"><strong>{row.referred_by}</strong></td>
                <td>{row.referral_count}</td>
                <td>
                  <ul className="admin-referred-list">
                    {row.referred_players.map((p) => (
                      <li key={p.id}>
                        {p.first_name} {p.last_name}
                        <span className="admin-sub"> — {p.email}</span>
                        {p.active === false && <span className="admin-sub"> (inactive)</span>}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Host Housing Tab ─────────────────────────────────────────────────────────
const DATE_OPTION_LABELS = {
  pgl_only: 'PGL Only (Sep 8–11)',
  pgl_and_qschool: 'PGL & Q-School (Sep 8–11, Sep 16–18)',
};

function HostHousingTab({ password }) {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/host-housing`, {
        headers: { Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load host housing sign-ups.');
      setSignups(data.signups || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/host-housing/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed.');
      setSignups((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = signups.filter((s) => roleFilter === 'all' || s.role === roleFilter);
  const hostCount = signups.filter((s) => s.role === 'host').length;
  const playerCount = signups.filter((s) => s.role === 'player').length;

  if (loading) return <p className="admin-load-error">Loading host housing sign-ups…</p>;
  if (error)   return <p className="admin-load-error">{error}</p>;

  return (
    <div className="admin-referrals">
      <p className="admin-referrals-note">
        {hostCount} member{hostCount !== 1 ? 's' : ''} offering housing · {playerCount} player{playerCount !== 1 ? 's' : ''} requesting housing.
      </p>

      <div className="admin-filters">
        <select className="admin-status-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="host">Hosts (Club Members)</option>
          <option value="player">Players (Requests)</option>
        </select>
        <button className="admin-btn admin-btn-secondary" onClick={load}>Refresh</button>
      </div>

      {filtered.length === 0 ? (
        <p className="admin-load-error">No sign-ups yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Capacity</th>
                <th>Dates</th>
                <th>Notes</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="admin-row">
                  <td>{s.role === 'host' ? 'Host' : 'Player'}</td>
                  <td className="admin-td-name"><strong>{s.first_name} {s.last_name}</strong></td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.capacity ?? '—'}</td>
                  <td>{DATE_OPTION_LABELS[s.date_option] || s.date_option}</td>
                  <td>{s.notes || '—'}</td>
                  <td>{formatDate(s.submitted_at)}</td>
                  <td>
                    <button className="admin-btn admin-btn-delete" onClick={() => setDeleteTarget(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal admin-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Sign-Up</h3>
              <button className="admin-modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>Delete the sign-up from <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong>?</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="admin-btn admin-btn-delete" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Media Crew Tab ───────────────────────────────────────────────────────────
const GOLF_KNOWLEDGE_LABELS = {
  none: 'None',
  some: 'Some',
  golfer: 'Golfer',
  very_familiar: 'Very Familiar',
};
const TRANSPORTATION_LABELS = {
  yes: 'Yes',
  no: 'No',
  need_help: 'Needs Help',
};
const DATE_LABELS = { sep_8: 'Sep 8', sep_9: 'Sep 9', sep_10: 'Sep 10', sep_11: 'Sep 11' };
const ROLE_LABELS = {
  camera_operator: 'Camera Operator',
  photography: 'Photography',
  livestream_broadcast: 'Livestream/Broadcast',
  social_media_bts: 'Social Media/BTS',
  editing: 'Editing',
  production_assistant: 'Production Assistant',
};

function MediaCrewTab({ password }) {
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/media-crew`, {
        headers: { Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load media crew sign-ups.');
      setSignups(data.signups || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => { load(); }, [load]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/media-crew/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed.');
      setSignups((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="admin-load-error">Loading media crew sign-ups…</p>;
  if (error)   return <p className="admin-load-error">{error}</p>;

  return (
    <div className="admin-referrals">
      <p className="admin-referrals-note">
        {signups.length} media crew application{signups.length !== 1 ? 's' : ''}.
      </p>

      <div className="admin-filters">
        <button className="admin-btn admin-btn-secondary" onClick={load}>Refresh</button>
      </div>

      {signups.length === 0 ? (
        <p className="admin-load-error">No sign-ups yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>School</th>
                <th>Major</th>
                <th>Year</th>
                <th>Dates</th>
                <th>Roles</th>
                <th>Experience</th>
                <th>Equipment</th>
                <th>Golf Knowledge</th>
                <th>Portfolio</th>
                <th>Transportation</th>
                <th>Why Interested</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.id} className="admin-row">
                  <td className="admin-td-name"><strong>{s.name}</strong></td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>{s.school}</td>
                  <td>{s.major || '—'}</td>
                  <td>{s.year_in_school || '—'}</td>
                  <td>{(s.available_dates || []).map((d) => DATE_LABELS[d] || d).join(', ') || '—'}</td>
                  <td>{(s.roles_interested || []).map((r) => ROLE_LABELS[r] || r).join(', ') || '—'}</td>
                  <td>{s.experience || '—'}</td>
                  <td>{s.equipment || '—'}</td>
                  <td>{GOLF_KNOWLEDGE_LABELS[s.golf_knowledge] || s.golf_knowledge}</td>
                  <td>{s.portfolio_link ? <a href={s.portfolio_link} target="_blank" rel="noopener noreferrer">Link</a> : '—'}</td>
                  <td>{TRANSPORTATION_LABELS[s.has_transportation] || s.has_transportation}</td>
                  <td>{s.why_interested || '—'}</td>
                  <td>{formatDate(s.submitted_at)}</td>
                  <td>
                    <button className="admin-btn admin-btn-delete" onClick={() => setDeleteTarget(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteTarget && (
        <div className="admin-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="admin-modal admin-modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Delete Sign-Up</h3>
              <button className="admin-modal-close" onClick={() => setDeleteTarget(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p>Delete the media crew application from <strong>{deleteTarget.name}</strong>?</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className="admin-btn admin-btn-delete" onClick={handleDeleteConfirm} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Email Tab ─────────────────────────────────────────────────────────────────
function EmailsTab({ registrations, password }) {

  // ── Inbox state ──
  const [inbox, setInbox] = useState([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [inboxDetail, setInboxDetail] = useState(null);

  // ── Sent emails state ──
  const [emails, setEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [emailsError, setEmailsError] = useState('');
  const [detailEmail, setDetailEmail] = useState(null);

  // ── Compose state ──
  const bodyRef = useRef(null);
  const [selectedPlayers, setSelectedPlayers] = useState(new Set());
  const [customTo, setCustomTo] = useState('');
  const [ccTo, setCcTo] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [sendError, setSendError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmRecipients, setConfirmRecipients] = useState([]);
  const [confirmCc, setConfirmCc] = useState([]);
  const [confirmBodyHtml, setConfirmBodyHtml] = useState('');
  const [replyMessageId, setReplyMessageId] = useState(null);
  const [attachments, setAttachments] = useState([]); // [{ filename, content, size }]
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef(null);

  // ── Load inbox ──
  const loadInbox = useCallback(async () => {
    setInboxLoading(true);
    setInboxError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/inbox?limit=50`, {
        headers: { Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load inbox.');
      setInbox(data.emails || []);
    } catch (err) {
      setInboxError(err.message);
    } finally {
      setInboxLoading(false);
    }
  }, [password]);

  // ── Load sent emails ──
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

  useEffect(() => {
    loadInbox();
    loadEmails();
  }, [loadInbox, loadEmails]);

  // ── Inbox helpers ──
  const handleInboxClick = async (email) => {
    setInboxDetail({ ...email, _loading: true });
    try {
      const res = await fetch(`${API_URL}/api/admin/inbox/${email.id}`, {
        headers: { Authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load email.');
      setInboxDetail(data);
    } catch (err) {
      setInboxDetail({ _error: err.message });
    }
  };

  const startReply = (email) => {
    setInboxDetail(null);
    setSelectedPlayers(new Set());
    setCustomTo(email.from_address || '');
    setCcTo('');
    const reSubject = (email.subject || '').startsWith('Re:')
      ? email.subject
      : `Re: ${email.subject || ''}`.trim();
    setSubject(reSubject);
    setReplyMessageId(email.message_id || null);
    setSendResult(null);
    setSendError('');
    setAttachments([]);
    setAttachmentError('');
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.innerHTML = '';
        bodyRef.current.focus();
        bodyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  // ── Sent email detail ──
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

  // ── Compose helpers ──
  const togglePlayer = (email) => {
    setSelectedPlayers((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
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

  const getCc = () => {
    const parsed = ccTo
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
    return [...new Set(parsed)];
  };

  const formatText = (cmd) => {
    document.execCommand(cmd, false, null);
    bodyRef.current?.focus();
  };

  const handleBodyPaste = (e) => {
    // Strip formatting on paste — always insert plain text
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // ── Attachments ──
  const MAX_ATTACHMENTS = 5;
  const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-selecting the same file later
    if (files.length === 0) return;
    setAttachmentError('');

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      setAttachmentError(`Maximum ${MAX_ATTACHMENTS} attachments per email.`);
      return;
    }
    const currentTotal = attachments.reduce((sum, a) => sum + a.size, 0);
    const oversized = files.find((f) => f.size > MAX_ATTACHMENT_BYTES);
    if (oversized) {
      setAttachmentError(`${oversized.name} exceeds the 8MB attachment limit.`);
      return;
    }
    const newTotal = files.reduce((sum, f) => sum + f.size, currentTotal);
    if (newTotal > MAX_TOTAL_BYTES) {
      setAttachmentError('Total attachment size exceeds the 20MB limit.');
      return;
    }

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = String(reader.result).split(',')[1] || '';
              resolve({ filename: file.name, content: base64, size: file.size });
            };
            reader.onerror = () => reject(new Error(`Failed to read ${file.name}.`));
            reader.readAsDataURL(file);
          })
      )
    )
      .then((newAttachments) => setAttachments((prev) => [...prev, ...newAttachments]))
      .catch((err) => setAttachmentError(err.message));
  };

  const removeAttachment = (filename) => {
    setAttachments((prev) => prev.filter((a) => a.filename !== filename));
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSendClick = () => {
    const recipients = getRecipients();
    const hasBody = bodyRef.current?.textContent?.trim().length > 0;
    if (recipients.length === 0) { setSendError('Select at least one recipient.'); return; }
    if (!subject.trim()) { setSendError('Subject is required.'); return; }
    if (!hasBody) { setSendError('Message body is required.'); return; }
    setSendError('');
    const html = bodyRef.current?.innerHTML || '';
    setConfirmBodyHtml(html);
    setConfirmRecipients(recipients);
    setConfirmCc(getCc());
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({
          recipients: confirmRecipients,
          subject: subject.trim(),
          bodyHtml: confirmBodyHtml,
          ...(replyMessageId && { inReplyTo: replyMessageId }),
          ...(attachments.length > 0 && {
            attachments: attachments.map(({ filename, content }) => ({ filename, content })),
          }),
          ...(confirmCc.length > 0 && { cc: confirmCc }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed.');
      setSendResult(data);
      setSubject('');
      if (bodyRef.current) bodyRef.current.innerHTML = '';
      setSelectedPlayers(new Set());
      setCustomTo('');
      setCcTo('');
      setReplyMessageId(null);
      setAttachments([]);
      setAttachmentError('');
      loadEmails();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  const recipientCount = getRecipients().length;
  const ccCount = getCc().length;

  return (
    <div className="admin-email-tab">

      {/* ── Inbox ── */}
      <section className="admin-email-section">
        <div className="admin-email-section-header">
          <h3 className="admin-email-section-title">Inbox</h3>
          <button className="admin-btn admin-btn-secondary" onClick={loadInbox} disabled={inboxLoading}>
            {inboxLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {inboxError && <p className="admin-load-error" style={{ margin: '12px 24px 0' }}>{inboxError}</p>}
        <div className="admin-table-wrap" style={{ borderRadius: 0, border: 'none', maxHeight: '450px', overflowY: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>From</th><th>Subject</th><th>Received</th></tr>
            </thead>
            <tbody>
              {inboxLoading && <tr><td colSpan={3} className="admin-empty-row">Loading…</td></tr>}
              {!inboxLoading && inbox.length === 0 && (
                <tr><td colSpan={3} className="admin-empty-row">No messages received yet. Set up Resend inbound routing to receive emails here.</td></tr>
              )}
              {inbox.map((e) => (
                <tr
                  key={e.id}
                  className="admin-row admin-email-row"
                  onClick={() => handleInboxClick(e)}
                >
                  <td className="admin-email-to">
                    {e.from_name ? `${e.from_name} <${e.from_address}>` : e.from_address}
                  </td>
                  <td>{e.subject || <em style={{ color: 'var(--text-muted)' }}>(no subject)</em>}</td>
                  <td className="admin-email-date">
                    {e.received_at
                      ? new Date(e.received_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Sent Emails ── */}
      <section className="admin-email-section">
        <div className="admin-email-section-header">
          <h3 className="admin-email-section-title">Sent</h3>
          <button className="admin-btn admin-btn-secondary" onClick={loadEmails} disabled={emailsLoading}>
            {emailsLoading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
        {emailsError && <p className="admin-load-error" style={{ margin: '12px 24px 0' }}>{emailsError}</p>}
        <div className="admin-table-wrap" style={{ borderRadius: 0, border: 'none', maxHeight: '450px', overflowY: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>To</th><th>Subject</th><th>Sent</th><th>Status</th></tr>
            </thead>
            <tbody>
              {emailsLoading && <tr><td colSpan={4} className="admin-empty-row">Loading…</td></tr>}
              {!emailsLoading && emails.length === 0 && (
                <tr><td colSpan={4} className="admin-empty-row">No emails found.</td></tr>
              )}
              {emails.map((e) => (
                <tr key={e.id} className="admin-row admin-email-row" onClick={() => loadDetail(e.id)}>
                  <td className="admin-email-to">{Array.isArray(e.to) ? e.to.join(', ') : e.to}</td>
                  <td>{e.subject}</td>
                  <td className="admin-email-date">
                    {e.created_at
                      ? new Date(e.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
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
            {registrations.length === 0 && <p className="admin-compose-empty">No registered players.</p>}
            {registrations.map((r) => (
              <label key={r.id} className="admin-compose-player-row">
                <input type="checkbox" checked={selectedPlayers.has(r.email)} onChange={() => togglePlayer(r.email)} />
                <span className="admin-compose-player-name">{r.first_name} {r.last_name}</span>
                <span className="admin-compose-player-email">{r.email}</span>
                <span className={`admin-status-badge ${statusColor(r.charge_status)} admin-compose-badge`}>{r.charge_status}</span>
              </label>
            ))}
          </div>
          <input
            className="admin-edit-input admin-compose-custom-input"
            type="text"
            placeholder="Additional recipients (comma-separated)"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
          />
          <p className="admin-compose-count">{recipientCount} recipient{recipientCount !== 1 ? 's' : ''} selected</p>
        </div>

        {/* CC */}
        <div className="admin-compose-block">
          <label className="admin-compose-label">CC</label>
          <p className="admin-compose-hint">CC'd on every recipient's email — best used with a single recipient.</p>
          <input
            className="admin-edit-input"
            type="text"
            placeholder="CC recipients (comma-separated)"
            value={ccTo}
            onChange={(e) => setCcTo(e.target.value)}
          />
          {ccCount > 0 && (
            <p className="admin-compose-count">{ccCount} CC recipient{ccCount !== 1 ? 's' : ''}</p>
          )}
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

        {/* Body — rich text editor */}
        <div className="admin-compose-block">
          <label className="admin-compose-label">Message</label>
          <p className="admin-compose-hint">Sent using the PGL branded email template. Pasted text is always plain text.</p>
          <div className="admin-compose-toolbar">
            <button
              type="button"
              className="admin-compose-toolbar-btn"
              onMouseDown={(e) => { e.preventDefault(); formatText('bold'); }}
              title="Bold (Ctrl+B)"
            ><b>B</b></button>
            <button
              type="button"
              className="admin-compose-toolbar-btn"
              onMouseDown={(e) => { e.preventDefault(); formatText('italic'); }}
              title="Italic (Ctrl+I)"
            ><i>I</i></button>
            <button
              type="button"
              className="admin-compose-toolbar-btn"
              onMouseDown={(e) => { e.preventDefault(); formatText('underline'); }}
              title="Underline (Ctrl+U)"
            ><u>U</u></button>
          </div>
          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            className="admin-compose-richbody"
            data-placeholder="Write your message here…"
            onPaste={handleBodyPaste}
          />
        </div>

        {/* Attachments */}
        <div className="admin-compose-block">
          <label className="admin-compose-label">Attachments</label>
          <p className="admin-compose-hint">Up to 5 files, 8MB each, 20MB total.</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFilesSelected}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={attachments.length >= MAX_ATTACHMENTS}
          >
            Add file…
          </button>
          {attachmentError && <p className="admin-load-error" style={{ margin: '8px 0 0' }}>{attachmentError}</p>}
          {attachments.length > 0 && (
            <ul className="admin-compose-attachment-list">
              {attachments.map((a) => (
                <li key={a.filename} className="admin-compose-attachment-row">
                  <span className="admin-compose-attachment-name">{a.filename}</span>
                  <span className="admin-compose-attachment-size">{formatBytes(a.size)}</span>
                  <button
                    type="button"
                    className="admin-compose-attachment-remove"
                    onClick={() => removeAttachment(a.filename)}
                    title="Remove"
                  >✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {sendError && <p className="admin-load-error" style={{ margin: '0 24px 12px' }}>{sendError}</p>}
        {sendResult && (
          <div className="admin-compose-success">
            ✓ Sent to {sendResult.sent} recipient{sendResult.sent !== 1 ? 's' : ''}.
            {sendResult.failed > 0 && ` ${sendResult.failed} failed.`}
          </div>
        )}
        <div className="admin-compose-actions">
          <button className="admin-btn admin-btn-primary" onClick={handleSendClick} disabled={sending}>
            {sending ? 'Sending…' : 'Send Email →'}
          </button>
        </div>
      </section>

      {/* ── Inbox Detail Modal ── */}
      {inboxDetail && (
        <div className="admin-modal-overlay" onClick={() => setInboxDetail(null)}>
          <div className="admin-modal admin-email-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {inboxDetail._loading ? 'Loading…' : inboxDetail._error ? 'Error' : (inboxDetail.subject || '(no subject)')}
              </h3>
              <button className="admin-modal-close" onClick={() => setInboxDetail(null)}>✕</button>
            </div>
            {inboxDetail._loading && <div className="admin-modal-body"><p>Loading…</p></div>}
            {inboxDetail._error && <div className="admin-modal-error" style={{ margin: '16px' }}>{inboxDetail._error}</div>}
            {!inboxDetail._loading && !inboxDetail._error && (
              <>
                <div className="admin-email-meta">
                  <div><strong>From:</strong> {inboxDetail.from_name ? `${inboxDetail.from_name} <${inboxDetail.from_address}>` : inboxDetail.from_address}</div>
                  <div><strong>To:</strong> {inboxDetail.to_address}</div>
                  <div><strong>Received:</strong> {inboxDetail.received_at ? new Date(inboxDetail.received_at).toLocaleString() : '—'}</div>
                </div>
                {inboxDetail.attachments?.length > 0 && (
                  <ul className="admin-email-attachment-list">
                    {inboxDetail.attachments.map((a) => (
                      <li key={a.id} className="admin-email-attachment-row">
                        <a href={a.download_url} target="_blank" rel="noopener noreferrer" className="admin-email-attachment-name">
                          📎 {a.filename}
                        </a>
                        <span className="admin-email-attachment-size">{formatBytes(a.size)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {inboxDetail.html_body ? (
                  <iframe className="admin-email-frame" srcDoc={inboxDetail.html_body} sandbox="allow-same-origin" title="Email preview" />
                ) : (
                  <div className="admin-email-text">{inboxDetail.text_body || 'No content.'}</div>
                )}
              </>
            )}
            {!inboxDetail._loading && !inboxDetail._error && (
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-primary" onClick={() => startReply(inboxDetail)}>Reply →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sent Email Detail Modal ── */}
      {detailEmail && (
        <div className="admin-modal-overlay" onClick={() => setDetailEmail(null)}>
          <div className="admin-modal admin-email-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {detailEmail._loading ? 'Loading…' : detailEmail._error ? 'Error' : (detailEmail.subject || 'Email Detail')}
              </h3>
              <button className="admin-modal-close" onClick={() => setDetailEmail(null)}>✕</button>
            </div>
            {detailEmail._loading && <div className="admin-modal-body"><p>Loading email content…</p></div>}
            {detailEmail._error && <div className="admin-modal-error" style={{ margin: '16px' }}>{detailEmail._error}</div>}
            {!detailEmail._loading && !detailEmail._error && (
              <>
                <div className="admin-email-meta">
                  <div><strong>To:</strong> {Array.isArray(detailEmail.to) ? detailEmail.to.join(', ') : detailEmail.to}</div>
                  <div><strong>From:</strong> {detailEmail.from}</div>
                  <div><strong>Sent:</strong> {detailEmail.created_at ? new Date(detailEmail.created_at).toLocaleString() : '—'}</div>
                  <div><strong>Status:</strong> {detailEmail.last_event || '—'}</div>
                </div>
                {detailEmail.attachments?.length > 0 && (
                  <ul className="admin-email-attachment-list">
                    {detailEmail.attachments.map((a) => (
                      <li key={a.id} className="admin-email-attachment-row">
                        <a href={a.download_url} target="_blank" rel="noopener noreferrer" className="admin-email-attachment-name">
                          📎 {a.filename}
                        </a>
                        <span className="admin-email-attachment-size">{formatBytes(a.size)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {detailEmail.html ? (
                  <iframe className="admin-email-frame" srcDoc={detailEmail.html} sandbox="allow-same-origin" title="Email preview" />
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
              {confirmCc.length > 0 && (
                <>
                  <p style={{ marginTop: '12px' }}>CC:</p>
                  <div className="admin-confirm-list">
                    {confirmCc.map((addr) => (
                      <div key={addr} className="admin-confirm-addr">{addr}</div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleSendConfirm}>Send Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Charge Modal ────────────────────────────────────────────────────────────────
function ChargeModal({ reg, password, onCharged, onClose }) {
  const defaultAmount = reg.charge_amount_cents != null ? (reg.charge_amount_cents / 100).toFixed(2) : '519.00';
  const [amount, setAmount] = useState(defaultAmount);
  const [note, setNote] = useState('');
  const [charging, setCharging] = useState(false);
  const [error, setError] = useState('');

  const hasCard = !!(reg.square_customer_id && reg.square_card_id);

  const handleCharge = async () => {
    setError('');
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError('Enter a valid charge amount.');
      return;
    }
    setCharging(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/registrations/${reg.id}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ amountCents, note: note.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Charge failed.');
      onCharged(reg.id, {
        charge_status: 'charged',
        charge_amount_cents: amountCents,
        square_payment_id: data.paymentId,
        charged_at: new Date().toISOString(),
        charge_error: null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setCharging(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-small" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Charge {reg.first_name} {reg.last_name}</h3>
          <button className="admin-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          {!hasCard && (
            <p className="admin-delete-warning">No card on file for this player — the charge will fail.</p>
          )}
          <div className="admin-edit-field">
            <label className="admin-edit-label">Amount (USD)</label>
            <input
              className="admin-edit-input"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="admin-edit-field">
            <label className="admin-edit-label">Note (optional, shown on Square receipt)</label>
            <input
              className="admin-edit-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Referral discount applied"
            />
          </div>
          <p className="admin-sub">
            A confirmation email will be sent to <strong>{reg.email}</strong> once the charge succeeds.
          </p>
        </div>
        {error && <div className="admin-modal-error">{error}</div>}
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-secondary" onClick={onClose} disabled={charging}>
            Cancel
          </button>
          <button className="admin-btn admin-btn-primary" onClick={handleCharge} disabled={charging}>
            {charging ? 'Charging…' : 'Charge Card'}
          </button>
        </div>
      </div>
    </div>
  );
}

const ADMIN_SESSION_KEY = 'pgl_admin_password';

// ── Main Admin Component ───────────────────────────────────────────────────────
export default function Admin({ onBack }) {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [password, setPassword] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [chargeTarget, setChargeTarget] = useState(null);

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
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
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
    sessionStorage.setItem(ADMIN_SESSION_KEY, passwordInput);
    setPassword(passwordInput);
    setRegistrations(data.registrations || []);
    setAuthed(true);
  };

  // Re-authenticate with any password saved from a previous session on this tab.
  useEffect(() => {
    const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!saved) {
      setCheckingSession(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/registrations`, {
          headers: { Authorization: `Bearer ${saved}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPassword(saved);
          setRegistrations(data.registrations || []);
          setAuthed(true);
        } else {
          sessionStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch {
        // network error — leave logged out, user can retry
      } finally {
        setCheckingSession(false);
      }
    })();
  }, []);

  const handleSave = (updated) => {
    setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditTarget(null);
  };

  const handleCharged = useCallback((id, updates) => {
    setRegistrations((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    setChargeTarget(null);
  }, []);

  const handleToggleActive = useCallback(async (r) => {
    const newActive = r.active === false ? true : false;
    try {
      const res = await fetch(`${API_URL}/api/admin/registrations/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${password}` },
        body: JSON.stringify({ active: newActive }),
      });
      if (!res.ok) return;
      setRegistrations((prev) => prev.map((p) => (p.id === r.id ? { ...p, active: newActive } : p)));
    } catch {
      // noop — user can retry
    }
  }, [password]);

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
  if (checkingSession) {
    return <div className="admin-login-page" />;
  }
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
          className={`admin-tab${tab === 'referrals' ? ' admin-tab-active' : ''}`}
          onClick={() => setTab('referrals')}
        >
          Referrals
        </button>
        <button
          className={`admin-tab${tab === 'host-housing' ? ' admin-tab-active' : ''}`}
          onClick={() => setTab('host-housing')}
        >
          Host Housing
        </button>
        <button
          className={`admin-tab${tab === 'media-crew' ? ' admin-tab-active' : ''}`}
          onClick={() => setTab('media-crew')}
        >
          Media Crew
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
              <th>Active</th>
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
                <td colSpan={12} className="admin-empty-row">
                  {loading ? 'Loading…' : 'No registrations found.'}
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className={`admin-row admin-row-${r.charge_status}${r.active === false ? ' admin-row-inactive' : ''}`}>
                <td className="admin-td-id">{r.id}</td>
                <td className="admin-td-name">
                  <div>{r.first_name} {r.last_name}</div>
                  {r.nickname && <div className="admin-nickname">"{r.nickname}"</div>}
                  <div className="admin-sub">{r.playing_status} · {r.home_course}</div>
                  {r.referred_by && <div className="admin-sub admin-referred-by">Ref: {r.referred_by}</div>}
                </td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>
                  <span className={`admin-status-badge ${r.active === false ? 'admin-status-inactive' : 'admin-status-active'}`}>
                    {r.active === false ? 'inactive' : 'active'}
                  </span>
                </td>
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
                    className={`admin-btn ${r.active === false ? 'admin-btn-activate' : 'admin-btn-deactivate'}`}
                    onClick={() => handleToggleActive(r)}
                  >
                    {r.active === false ? 'Activate' : 'Deactivate'}
                  </button>
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={() => setChargeTarget(r)}
                  >
                    Charge
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

      {/* Charge Modal */}
      {chargeTarget && (
        <ChargeModal
          reg={chargeTarget}
          password={password}
          onCharged={handleCharged}
          onClose={() => setChargeTarget(null)}
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

      {tab === 'referrals' && (
        <ReferralsTab password={password} />
      )}

      {tab === 'host-housing' && (
        <HostHousingTab password={password} />
      )}

      {tab === 'media-crew' && (
        <MediaCrewTab password={password} />
      )}

      {tab === 'emails' && (
        <EmailsTab registrations={registrations} password={password} />
      )}
    </div>
  );
}
