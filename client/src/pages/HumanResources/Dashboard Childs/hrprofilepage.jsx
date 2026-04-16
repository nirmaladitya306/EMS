import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllHRProfiles, HandleDeleteHRProfile, HandleCreateHRProfile } from '../../../redux/Thunks/HRProfileThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --hr-text-main: #fafafa;
    --hr-text-muted: #a1a1aa;
    --hr-border: #27272a;
    --hr-modal-bg: #18181b;
    
    /* Brighter badge colors for dark mode contrast */
    --hr-pill-verified-bg: rgba(22,163,74,0.15);
    --hr-pill-verified-color: #4ade80;
    --hr-pill-unverified-bg: rgba(220,38,38,0.15);
    --hr-pill-unverified-color: #f87171;

    /* 'You' badge adjustments */
    --hr-you-text: #818cf8;
    --hr-you-bg: rgba(99,102,241,0.15);
    --hr-you-border: rgba(99,102,241,0.3);
  }

  [data-theme='dark'] .pg-modal {
    background: var(--hr-modal-bg) !important;
    border: 1px solid var(--hr-border) !important;
    box-shadow: 0 24px 64px rgba(0,0,0,0.8) !important;
  }
    
  .pg-form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }
  
  .pg-form-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--hr-text-main, #0f172a);
  }

  .pg-form-input, .pg-form-select {
    padding: 10px 12px;
    border-radius: 6px;
    border: 1px solid var(--hr-border, #e2e8f0);
    background: transparent;
    color: var(--hr-text-main, #0f172a);
    font-family: inherit;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  
  .pg-form-input:focus, .pg-form-select:focus {
    border-color: #6366f1;
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const initials = (first, last) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()

// ─── Verified / Unverified pill ───────────────────────────────────────────────
const VerifiedPill = ({ verified }) => (
    <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
        background: verified ? 'var(--hr-pill-verified-bg, rgba(22,163,74,0.08))' : 'var(--hr-pill-unverified-bg, rgba(220,38,38,0.07))',
        color:      verified ? 'var(--hr-pill-verified-color, #15803d)'           : 'var(--hr-pill-unverified-color, #dc2626)',
        border:     verified ? '1px solid rgba(22,163,74,0.2)'                    : '1px solid rgba(220,38,38,0.18)',
    }}>
        <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: verified ? 'var(--hr-pill-verified-color, #16a34a)' : 'var(--hr-pill-unverified-color, #ef4444)',
        }} />
        {verified ? 'Verified' : 'Unverified'}
    </span>
)

// ─── Avatar circle with gradient ──────────────────────────────────────────────
const Avatar = ({ first, last, size = 36, fontSize = 13 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize, letterSpacing: '0.03em',
        fontFamily: "'DM Serif Display', serif",
    }}>
        {initials(first, last)}
    </div>
)

// ─── Invite HR Modal ──────────────────────────────────────────────────────────
const InviteModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        role: 'HR'
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    }

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal" style={{ maxWidth: 450 }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--hr-text-main, #0f172a)' }}>Invite Team Member</h2>
                <p style={{ fontSize: '13px', color: 'var(--hr-text-muted, #64748b)', marginBottom: '24px' }}>
                    Send an invitation link to a new HR staff member or Administrator.
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="pg-form-group" style={{ flex: 1 }}>
                            <label className="pg-form-label">First Name</label>
                            <input required name="firstname" value={formData.firstname} onChange={handleChange} className="pg-form-input" placeholder="e.g. Jane" />
                        </div>
                        <div className="pg-form-group" style={{ flex: 1 }}>
                            <label className="pg-form-label">Last Name</label>
                            <input required name="lastname" value={formData.lastname} onChange={handleChange} className="pg-form-input" placeholder="e.g. Doe" />
                        </div>
                    </div>

                    <div className="pg-form-group">
                        <label className="pg-form-label">Email Address</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="pg-form-input" placeholder="jane.doe@company.com" />
                    </div>

                    <div className="pg-form-group">
                        <label className="pg-form-label">System Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="pg-form-select">
                            <option value="HR">Standard HR (Requires RBAC Assignment)</option>
                            <option value="HR-Admin">Super Admin (Full Access)</option>
                        </select>
                    </div>

                    <div className="pg-modal-actions" style={{ marginTop: '32px' }}>
                        <button type="button" className="pg-btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="pg-action-btn indigo" style={{ padding: '8px 16px' }}>Send Invitation</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
const DetailModal = ({ hr, onClose }) => {
    if (!hr) return null

    const rows = [
        { label: 'Email',        value: hr.email },
        { label: 'Contact',      value: hr.contactnumber || '—' },
        { label: 'Department',   value: hr.department?.name || '—' },
        { label: 'Role',         value: hr.role },
        { label: 'Last Login',   value: fmtDate(hr.lastlogin) },
        { label: 'Member Since', value: fmtDate(hr.createdAt) },
    ]

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal">

                {/* ── Profile header inside modal ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar first={hr.firstname} last={hr.lastname} size={52} fontSize={18} />
                    <div>
                        <div style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '1.25rem', color: 'var(--hr-text-main, #0f172a)',
                            letterSpacing: '-0.02em', lineHeight: 1.2,
                        }}>
                            {hr.firstname} {hr.lastname}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--hr-text-muted, rgba(0,0,0,0.38))', marginTop: 3 }}>
                            {hr.role}
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <VerifiedPill verified={hr.isverified} />
                    </div>
                </div>

                {/* ── Divider ── */}
                <div className="pg-divider" />

                {/* ── Info grid ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {rows.map(({ label, value }, i) => (
                        <div
                            key={label}
                            style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'flex-start', gap: 16,
                                padding: '10px 0',
                                borderBottom: i < rows.length - 1 ? '1px solid var(--hr-border, rgba(0,0,0,0.05))' : 'none',
                            }}
                        >
                            <span style={{
                                fontSize: 11, fontWeight: 600, letterSpacing: '0.09em',
                                textTransform: 'uppercase', color: 'var(--hr-text-muted, rgba(0,0,0,0.35))',
                                flexShrink: 0,
                            }}>
                                {label}
                            </span>
                            <span style={{
                                fontSize: 13, color: 'var(--hr-text-main, #0f172a)', fontWeight: 500,
                                textAlign: 'right', wordBreak: 'break-all',
                            }}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Actions ── */}
                <div className="pg-modal-actions">
                    <button className="pg-btn-ghost" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const HRProfilePage = () => {
    const dispatch  = useDispatch()
    const state     = useSelector(s => s.HRProfileReducer)
    
    // Connect to actual user state to determine if they are Super Admin
    const hrState = useSelector((state) => state.HRReducer || {});
    const currentHR = hrState.data;
    const currentID = currentHR?._id || currentHR?.HRid || '';
    const isSuperAdmin = currentHR?.role === 'HR-Admin';

    const [detail, setDetail] = useState(null)
    const [search, setSearch] = useState('')
    const [showInvite, setShowInvite] = useState(false)

    useEffect(() => { dispatch(HandleGetAllHRProfiles()) }, [dispatch])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllHRProfiles()) }, [state.fetchData, dispatch])

    const handleDelete = (HRID) => {
        if (HRID === currentID) return alert('You cannot delete your own profile.')
        if (window.confirm('Delete this HR profile? This cannot be undone.'))
            dispatch(HandleDeleteHRProfile({ HRID }))
    }

    const handleCreateHR = (formData) => {
        dispatch(HandleCreateHRProfile(formData));
        setShowInvite(false);
    }

    const filtered = (state.data || []).filter(h =>
        `${h.firstname} ${h.lastname} ${h.email}`.toLowerCase().includes(search.toLowerCase())
    )

    const total    = state.data?.length || 0
    const verified = state.data?.filter(h => h.isverified).length || 0
    const admins   = state.data?.filter(h => h.role === 'HR-Admin').length || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>
            <style>{styles}</style>

            {/* ── Page header ── */}
            <PageHeader
                eyebrow="People"
                title="HR Profiles"
                subtitle="View and manage all HR administrators in your organisation"
            />

            {/* ── Stats strip ── */}
            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                    { label: 'Total Members', value: total    },
                    { label: 'Verified',      value: verified },
                    { label: 'Admins',        value: admins   },
                ].map(s => (
                    <div key={s.label} className="pg-stat-card">
                        <span className="pg-stat-value">{s.value}</span>
                        <span className="pg-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Search bar & Invite Button ── */}
            <div className="pg-filters" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        className="pg-search"
                        type="text"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ minWidth: 260 }}
                    />
                    {search && (
                        <button
                            className="pg-btn-ghost"
                            style={{ padding: '8px 14px', fontSize: 12 }}
                            onClick={() => setSearch('')}
                        >
                            Clear
                        </button>
                    )}
                </div>
                
                {/* Only Super Admins can invite new HRs */}
                {isSuperAdmin && (
                    <button 
                        className="pg-action-btn indigo" 
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                        onClick={() => setShowInvite(true)}
                    >
                        + Invite HR
                    </button>
                )}
            </div>

            {/* ── Table ── */}
            <div className="pg-table-wrap">

                {/* Header */}
                <div
                    className="pg-table-head"
                    style={{ gridTemplateColumns: '2fr 2fr 120px 120px' }}
                >
                    <span className="pg-th">Name</span>
                    <span className="pg-th">Email</span>
                    <span className="pg-th">Status</span>
                    <span className="pg-th">Actions</span>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">👤</span>
                        <p className="pg-empty-title">
                            {search ? 'No results match your search' : 'No HR profiles yet'}
                        </p>
                        <p className="pg-empty-sub">
                            {search ? 'Try a different name or email.' : 'HR members will appear here once added.'}
                        </p>
                    </div>
                )}

                {/* Rows */}
                {filtered.map(h => (
                    <div
                        key={h._id}
                        className="pg-table-row"
                        style={{ gridTemplateColumns: '2fr 2fr 120px 120px' }}
                    >
                        {/* Name + avatar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar first={h.firstname} last={h.lastname} size={30} fontSize={11} />
                            <div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    fontWeight: 500, fontSize: 13, color: 'var(--hr-text-main, #0f172a)',
                                }}>
                                    {h.firstname} {h.lastname}
                                    {h._id === currentID && (
                                        <span style={{
                                            fontSize: 10, fontWeight: 600, color: 'var(--hr-you-text, #6366f1)',
                                            background: 'var(--hr-you-bg, rgba(99,102,241,0.09))',
                                            border: '1px solid var(--hr-you-border, rgba(99,102,241,0.18))',
                                            borderRadius: 100, padding: '1px 7px',
                                        }}>
                                            You
                                        </span>
                                    )}
                                </div>
                                <div className="pg-td-sub">{h.role}</div>
                            </div>
                        </div>

                        {/* Email */}
                        <span className="pg-td-muted">{h.email}</span>

                        {/* Verified badge */}
                        <span><VerifiedPill verified={h.isverified} /></span>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                className="pg-action-btn indigo"
                                onClick={() => setDetail(h)}
                            >
                                View
                            </button>
                            
                            {/* Only Super Admins can see the Delete button */}
                            {isSuperAdmin && (
                                <button
                                    className="pg-action-btn red"
                                    disabled={h._id === currentID}
                                    onClick={() => handleDelete(h._id)}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Detail modal ── */}
            {detail && <DetailModal hr={detail} onClose={() => setDetail(null)} />}

            {/* ── Invite modal ── */}
            {showInvite && <InviteModal onClose={() => setShowInvite(false)} onSubmit={handleCreateHR} />}

        </PageShell>
    )
}