import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetRoleDrifts,
    HandleRevokeDrift,
    HandleExtendDrift,
} from '../../../redux/Thunks/RBACThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  [data-theme='dark'] {
    --dr-bg: #18181b;
    --dr-border: #27272a;
    --dr-text-main: #fafafa;
    --dr-text-muted: #a1a1aa;
    --dr-text-faint: #71717a;
    --dr-row-hover: rgba(255, 255, 255, 0.03);
    --dr-base-bg: rgba(255, 255, 255, 0.08);
    --dr-base-text: #e4e4e7;
    --dr-add-bg: rgba(99, 102, 241, 0.15);
    --dr-add-text: #818cf8;
    --dr-add-border: rgba(99, 102, 241, 0.3);
    --dr-warn-bg: rgba(239, 68, 68, 0.15);
    --dr-warn-text: #f87171;
    --dr-warn-border: rgba(239, 68, 68, 0.3);
    --dr-modal-bg: #18181b;
    --dr-input-bg: #09090b;
    --dr-input-border: #27272a;
  }

  .dr-base-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
    background: var(--dr-base-bg, #f3f4f6); color: var(--dr-base-text, #4b5563);
    letter-spacing: 0.03em;
  }
  .dr-added-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600;
    background: var(--dr-add-bg, rgba(99,102,241,0.08));
    color: var(--dr-add-text, #4f46e5);
    border: 1px solid var(--dr-add-border, rgba(99,102,241,0.2));
  }
  .dr-expired-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600;
    background: var(--dr-warn-bg, rgba(239,68,68,0.08));
    color: var(--dr-warn-text, #dc2626);
    border: 1px solid var(--dr-warn-border, rgba(239,68,68,0.2));
  }

  .dr-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center; z-index: 50;
  }
  .dr-modal {
    background: var(--dr-modal-bg, #ffffff);
    border-radius: 16px; padding: 24px; width: 100%; max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    font-family: 'DM Sans', sans-serif;
  }
  .dr-modal-title  { font-size: 16px; font-weight: 700; color: var(--dr-text-main, #0f172a); margin: 0 0 4px; }
  .dr-modal-sub    { font-size: 13px; color: var(--dr-text-muted, #6b7280); margin: 0 0 18px; }
  .dr-modal-label  { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--dr-text-muted, #6b7280); margin-bottom: 6px; display: block; }
  .dr-modal-input  {
    width: 100%; padding: 9px 12px; border-radius: 10px; font-size: 13px; box-sizing: border-box;
    background: var(--dr-input-bg, #ffffff); border: 1px solid var(--dr-input-border, rgba(0,0,0,0.12));
    color: var(--dr-text-main, #0f172a); outline: none; font-family: 'DM Sans', sans-serif;
  }
  .dr-modal-input:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.07); }
  .dr-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--dr-input-border, rgba(0,0,0,0.07)); }
`

const initials = (first, last) => `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()

const Avatar = ({ first, last }) => (
    <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: 13,
        fontFamily: "'DM Serif Display', serif",
    }}>
        {initials(first, last)}
    </div>
)

const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'No Expiry'

// ─── Extend Modal ─────────────────────────────────────────────────────────────
const ExtendModal = ({ item, onClose, onSave }) => {
    const today = new Date().toISOString().split('T')[0]
    const [newExpiry, setNewExpiry] = useState(today)
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        await onSave({ driftID: item._id, newExpiry: new Date(newExpiry).toISOString() })
        setSaving(false)
    }

    return (
        <div className="dr-modal-overlay" onClick={onClose}>
            <div className="dr-modal" onClick={e => e.stopPropagation()}>
                <p className="dr-modal-title">Extend Temporary Access</p>
                <p className="dr-modal-sub">
                    Set a new expiry date for{' '}
                    <strong>{item.employee?.firstname} {item.employee?.lastname}</strong>'s
                    elevated privilege.
                </p>
                <form onSubmit={handleSubmit}>
                    <label className="dr-modal-label">New Expiry Date</label>
                    <input
                        type="date"
                        required
                        className="dr-modal-input"
                        value={newExpiry}
                        min={today}
                        onChange={e => setNewExpiry(e.target.value)}
                    />
                    <div className="dr-modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="pg-btn-ghost"
                            style={{ padding: '8px 16px', fontSize: 13 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="pg-btn-primary"
                            style={{ padding: '8px 18px', fontSize: 13 }}
                        >
                            {saving ? 'Saving…' : 'Extend Access'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AccessDriftPage = () => {
    const dispatch = useDispatch()

    // Reads from RBACReducer (PrivilegeDriftReducer is an alias in store.js)
    const state = useSelector(s => s.PrivilegeDriftReducer) || { drifts: [], isLoading: false }

    const [search,      setSearch]      = useState('')
    const [filter,      setFilter]      = useState('All')
    const [extendItem,  setExtendItem]  = useState(null)

    useEffect(() => {
        dispatch(HandleGetRoleDrifts())
    }, [dispatch])

    const handleRevoke = async (driftID) => {
        if (!window.confirm('Instantly revoke this temporary privilege?')) return
        await dispatch(HandleRevokeDrift({ driftID }))
        // Refresh to get the latest state from server
        dispatch(HandleGetRoleDrifts())
    }

    const handleExtend = async ({ driftID, newExpiry }) => {
        await dispatch(HandleExtendDrift({ driftID, newExpiry }))
        setExtendItem(null)
        dispatch(HandleGetRoleDrifts())
    }

    const drifts = state.drifts || []

    const filtered = drifts.filter(d => {
        const name = `${d.employee?.firstname ?? ''} ${d.employee?.lastname ?? ''}`.toLowerCase()
        const matchName = name.includes(search.toLowerCase())
        if (filter === 'Expired') return matchName && d.drift?.isExpired
        if (filter === 'Active')  return matchName && !d.drift?.isExpired
        return matchName
    })

    const totalExpired  = drifts.filter(d => d.drift?.isExpired).length
    const totalActive   = drifts.filter(d => !d.drift?.isExpired).length

    if (state.isLoading && drifts.length === 0) return <Loading />

    return (
        <PageShell>
            <style>{styles}</style>

            <PageHeader
                eyebrow="Security"
                title="Access Drift"
                subtitle="Track employees with temporary roles, expanded access, or expired privileges"
            />

            {/* Stats */}
            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="pg-stat-card">
                    <span className="pg-stat-value">{drifts.length}</span>
                    <span className="pg-stat-label">Total Active Drifts</span>
                </div>
                <div className="pg-stat-card">
                    <span
                        className="pg-stat-value"
                        style={{ color: totalExpired > 0 ? 'var(--dr-warn-text, #dc2626)' : 'inherit' }}
                    >
                        {totalExpired}
                    </span>
                    <span className="pg-stat-label">Expired Privileges</span>
                </div>
                <div className="pg-stat-card">
                    <span className="pg-stat-value">{totalActive}</span>
                    <span className="pg-stat-label">Temporary Roles</span>
                </div>
            </div>

            {/* Filters */}
            <div className="pg-filters">
                <input
                    className="pg-search"
                    type="text"
                    placeholder="Search by employee..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ minWidth: 260 }}
                />
                {['All', 'Active', 'Expired'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`pg-pill${filter === s ? ' active' : ''}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="pg-table-wrap">
                <div
                    className="pg-table-head"
                    style={{ gridTemplateColumns: '2fr 1.5fr 2fr 1fr 140px' }}
                >
                    <span className="pg-th">Employee</span>
                    <span className="pg-th">Base Role</span>
                    <span className="pg-th">Added Privilege (Drift)</span>
                    <span className="pg-th">Expiry</span>
                    <span className="pg-th">Actions</span>
                </div>

                {filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">🛡️</span>
                        <p className="pg-empty-title">
                            {drifts.length === 0
                                ? 'No privilege drifts recorded'
                                : 'No drifts match the current filter'}
                        </p>
                        <p className="pg-empty-sub">
                            Grant temporary access via the Access Control → Assign tab.
                        </p>
                    </div>
                )}

                {filtered.map(item => (
                    <div
                        key={item._id}
                        className="pg-table-row"
                        style={{ gridTemplateColumns: '2fr 1.5fr 2fr 1fr 140px' }}
                    >
                        {/* Employee */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar
                                first={item.employee?.firstname}
                                last={item.employee?.lastname}
                            />
                            <div>
                                <div className="pg-td-name">
                                    {item.employee?.firstname} {item.employee?.lastname}
                                </div>
                                <div className="pg-td-sub">
                                    {item.employee?.department?.name ?? item.employee?.email}
                                </div>
                            </div>
                        </div>

                        {/* Base Role */}
                        <div>
                            <span className="dr-base-pill">
                                🛡️ {item.baseRole?.name ?? 'Full Access'}
                            </span>
                        </div>

                        {/* Added Privilege */}
                        <div>
                            <div className={item.drift?.isExpired ? 'dr-expired-pill' : 'dr-added-pill'}>
                                + {item.drift?.role?.name ?? '—'}
                            </div>
                            <div
                                className="pg-td-sub"
                                style={{ marginTop: 6, fontSize: 11, fontStyle: 'italic' }}
                            >
                                Reason: {item.drift?.reason ?? '—'}
                            </div>
                        </div>

                        {/* Expiry */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: item.drift?.isExpired
                                    ? 'var(--dr-warn-text, #dc2626)'
                                    : 'var(--ems-text-primary, #0f172a)',
                            }}>
                                {fmtDate(item.drift?.expiresAt)}
                            </span>
                            {item.drift?.isExpired && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700,
                                    color: 'var(--dr-warn-text, #dc2626)',
                                    textTransform: 'uppercase', letterSpacing: '0.05em'
                                }}>
                                    Action Required
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button
                                className="pg-action-btn red"
                                onClick={() => handleRevoke(item._id)}
                            >
                                Revoke
                            </button>
                            <button
                                className="pg-action-btn indigo"
                                onClick={() => setExtendItem(item)}
                            >
                                Extend
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Extend Modal */}
            {extendItem && (
                <ExtendModal
                    item={extendItem}
                    onClose={() => setExtendItem(null)}
                    onSave={handleExtend}
                />
            )}
        </PageShell>
    )
}
