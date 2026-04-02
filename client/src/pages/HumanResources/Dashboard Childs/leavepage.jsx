import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllLeaves, HandleHRUpdateLeave } from '../../../redux/Thunks/LeaveThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const initials = (first, last) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()

// ─── Employee avatar ──────────────────────────────────────────────────────────
const Avatar = ({ first, last, size = 30, fontSize = 11 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize,
        fontFamily: "'DM Serif Display', serif", letterSpacing: '0.03em',
    }}>
        {initials(first, last)}
    </div>
)

// ─── Status pill ──────────────────────────────────────────────────────────────
const STATUS = {
    Pending:  { bg: 'rgba(234,179,8,0.09)',  color: '#854d0e', border: 'rgba(234,179,8,0.3)'   },
    Approved: { bg: 'rgba(22,163,74,0.08)',  color: '#15803d', border: 'rgba(22,163,74,0.22)'  },
    Rejected: { bg: 'rgba(220,38,38,0.07)', color: '#dc2626', border: 'rgba(220,38,38,0.2)'   },
}

const StatusPill = ({ status }) => {
    const s = STATUS[status] || { bg: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.5)', border: 'rgba(0,0,0,0.1)' }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

// ─── Review modal ─────────────────────────────────────────────────────────────
const ReviewModal = ({ leave, onClose, onSubmit, HRID }) => {
    const [decision, setDecision] = useState('Approved')
    if (!leave) return null

    const rows = [
        { label: 'Employee',  value: `${leave.employee?.firstname} ${leave.employee?.lastname}` },
        { label: 'Title',     value: leave.title },
        { label: 'Reason',    value: leave.reason },
        { label: 'From',      value: fmtDate(leave.startdate) },
        { label: 'To',        value: fmtDate(leave.enddate) },
    ]

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal">

                {/* Header */}
                <div>
                    <div style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.25rem', color: '#0f172a',
                        letterSpacing: '-0.02em', marginBottom: 4,
                    }}>
                        Review Leave Request
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', margin: 0 }}>
                        Approve or reject this request. The employee will be notified.
                    </p>
                </div>

                <div className="pg-divider" />

                {/* Leave details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {rows.map(({ label, value }, i) => (
                        <div key={label} style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'flex-start', gap: 16, padding: '9px 0',
                            borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        }}>
                            <span style={{
                                fontSize: 11, fontWeight: 600, letterSpacing: '0.09em',
                                textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', flexShrink: 0,
                            }}>
                                {label}
                            </span>
                            <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, textAlign: 'right' }}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="pg-divider" />

                {/* Decision selector */}
                <div className="pg-field">
                    <label className="pg-label">Decision</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['Approved', 'Rejected'].map(opt => (
                            <button
                                key={opt}
                                onClick={() => setDecision(opt)}
                                style={{
                                    flex: 1, padding: '9px 0', borderRadius: 10,
                                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'all 0.15s',
                                    border: decision === opt
                                        ? (opt === 'Approved' ? '1px solid rgba(22,163,74,0.35)' : '1px solid rgba(220,38,38,0.3)')
                                        : '1px solid rgba(0,0,0,0.1)',
                                    background: decision === opt
                                        ? (opt === 'Approved' ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.07)')
                                        : 'transparent',
                                    color: decision === opt
                                        ? (opt === 'Approved' ? '#15803d' : '#dc2626')
                                        : 'rgba(0,0,0,0.45)',
                                }}
                            >
                                {opt === 'Approved' ? '✓ Approve' : '✕ Reject'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="pg-modal-actions">
                    <button className="pg-btn-ghost" onClick={onClose}>Cancel</button>
                    <button
                        className="pg-btn-primary"
                        onClick={() => onSubmit({ leaveID: leave._id, status: decision, HRID })}
                    >
                        Confirm Decision
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const LeavePage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.LeaveReducer)
    const HRState  = useSelector(s => s.HRReducer)
    const HRID     = HRState?.data?.HRid || HRState?.data?.data?._id || ''

    const [selected,     setSelected]     = useState(null)
    const [filterStatus, setFilterStatus] = useState('All')
    const [search,       setSearch]       = useState('')

    useEffect(() => { dispatch(HandleGetAllLeaves()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllLeaves()) }, [state.fetchData])

    const handleSubmit = (payload) => {
        dispatch(HandleHRUpdateLeave(payload))
        setSelected(null)
    }

    const filtered = (state.data || []).filter(l => {
        const name = `${l.employee?.firstname ?? ''} ${l.employee?.lastname ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) &&
            (filterStatus === 'All' || l.status === filterStatus)
    })

    const total    = state.data?.length || 0
    const pending  = state.data?.filter(l => l.status === 'Pending').length  || 0
    const approved = state.data?.filter(l => l.status === 'Approved').length || 0
    const rejected = state.data?.filter(l => l.status === 'Rejected').length || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>

            {/* ── Page header ── */}
            <PageHeader
                eyebrow="Operations"
                title="Leave Management"
                subtitle="Review and approve employee leave requests"
            />

            {/* ── Stats strip ── */}
            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { label: 'Total',    value: total    },
                    { label: 'Pending',  value: pending  },
                    { label: 'Approved', value: approved },
                    { label: 'Rejected', value: rejected },
                ].map(s => (
                    <div key={s.label} className="pg-stat-card">
                        <span className="pg-stat-value">{s.value}</span>
                        <span className="pg-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="pg-filters">
                <input
                    className="pg-search"
                    type="text"
                    placeholder="Search by employee name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ minWidth: 240 }}
                />
                {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
                    <button
                        key={s}
                        className={`pg-pill${filterStatus === s ? ' active' : ''}`}
                        onClick={() => setFilterStatus(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="pg-table-wrap">

                {/* Header */}
                <div
                    className="pg-table-head"
                    style={{ gridTemplateColumns: '2fr 2fr 1.2fr 100px 90px' }}
                >
                    <span className="pg-th">Employee</span>
                    <span className="pg-th">Request</span>
                    <span className="pg-th">Duration</span>
                    <span className="pg-th">Status</span>
                    <span className="pg-th">Action</span>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">🌴</span>
                        <p className="pg-empty-title">
                            {search || filterStatus !== 'All'
                                ? 'No records match your filters'
                                : 'No leave requests yet'}
                        </p>
                        <p className="pg-empty-sub">
                            {search || filterStatus !== 'All'
                                ? 'Try adjusting your search or filter.'
                                : 'Leave requests submitted by employees will appear here.'}
                        </p>
                    </div>
                )}

                {/* Rows */}
                {filtered.map(l => (
                    <div
                        key={l._id}
                        className="pg-table-row"
                        style={{ gridTemplateColumns: '2fr 2fr 1.2fr 100px 90px' }}
                    >
                        {/* Employee */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar
                                first={l.employee?.firstname}
                                last={l.employee?.lastname}
                            />
                            <div>
                                <div className="pg-td-name">
                                    {l.employee?.firstname} {l.employee?.lastname}
                                </div>
                                <div className="pg-td-sub">
                                    {l.employee?.department?.name || l.employee?.department || ''}
                                </div>
                            </div>
                        </div>

                        {/* Request title + reason */}
                        <div>
                            <div className="pg-td-name">{l.title}</div>
                            <div className="pg-td-sub" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {l.reason}
                            </div>
                        </div>

                        {/* Duration */}
                        <div>
                            <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 500 }}>
                                {fmtDate(l.startdate)}
                            </div>
                            <div className="pg-td-sub">→ {fmtDate(l.enddate)}</div>
                        </div>

                        {/* Status */}
                        <span>
                            <StatusPill status={l.status} />
                        </span>

                        {/* Review button */}
                        <span>
                            <button
                                className="pg-action-btn indigo"
                                disabled={l.status !== 'Pending'}
                                onClick={() => setSelected(l)}
                            >
                                Review
                            </button>
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Review modal ── */}
            {selected && (
                <ReviewModal
                    leave={selected}
                    HRID={HRID}
                    onClose={() => setSelected(null)}
                    onSubmit={handleSubmit}
                />
            )}

        </PageShell>
    )
}