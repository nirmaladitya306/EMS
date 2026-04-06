import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllRequests, HandleUpdateRequestStatus, HandleDeleteRequest } from '../../../redux/Thunks/RequestThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const initials = (first, last) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()

const Avatar = ({ first, last }) => (
    <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: 11,
        fontFamily: "'DM Serif Display', serif",
    }}>
        {initials(first, last)}
    </div>
)

const STATUS = {
    Pending:  { bg: 'rgba(234,179,8,0.09)',  color: '#854d0e', border: 'rgba(234,179,8,0.3)'  },
    Approved: { bg: 'rgba(22,163,74,0.08)',  color: '#15803d', border: 'rgba(22,163,74,0.22)' },
    Denied:   { bg: 'rgba(220,38,38,0.07)', color: '#dc2626', border: 'rgba(220,38,38,0.2)'  },
}

const StatusPill = ({ status }) => {
    const s = STATUS[status] || { bg: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.45)', border: 'rgba(0,0,0,0.1)' }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

const ReviewModal = ({ request, onClose, onSubmit, HRID }) => {
    const [decision, setDecision] = useState('Approved')
    if (!request) return null
    const rows = [
        { label: 'Employee',   value: `${request.employee?.firstname} ${request.employee?.lastname}` },
        { label: 'Department', value: request.department?.name || '—' },
        { label: 'Title',      value: request.requesttitle },
        { label: 'Content',    value: request.requestconent },
    ]
    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal">
                <div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
                        Review Request
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', margin: 0 }}>
                        Approve or deny this employee request.
                    </p>
                </div>
                <div className="pg-divider" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {rows.map(({ label, value }, i) => (
                        <div key={label} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                            gap: 16, padding: '9px 0',
                            borderBottom: i < rows.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                        }}>
                            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', flexShrink: 0 }}>{label}</span>
                            <span style={{ fontSize: 13, color: '#0f172a', fontWeight: 500, textAlign: 'right' }}>{value}</span>
                        </div>
                    ))}
                </div>
                <div className="pg-divider" />
                <div className="pg-field">
                    <label className="pg-label">Decision</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['Approved', 'Denied'].map(opt => {
                            const s = STATUS[opt]
                            const active = decision === opt
                            return (
                                <button key={opt} onClick={() => setDecision(opt)} style={{
                                    flex: 1, padding: '9px 0', borderRadius: 10,
                                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                                    border: active ? `1px solid ${s.border}` : '1px solid rgba(0,0,0,0.1)',
                                    background: active ? s.bg : 'transparent',
                                    color: active ? s.color : 'rgba(0,0,0,0.45)',
                                }}>
                                    {opt === 'Approved' ? '✓ Approve' : '✕ Deny'}
                                </button>
                            )
                        })}
                    </div>
                </div>
                <div className="pg-modal-actions">
                    <button className="pg-btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="pg-btn-primary" onClick={() => onSubmit({ requestID: request._id, status: decision, HRID })}>
                        Confirm Decision
                    </button>
                </div>
            </div>
        </div>
    )
}

export const RequestsPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.RequestReducer)
    const HRState  = useSelector(s => s.HRReducer)
    const HRID     = HRState?.data?.HRid || HRState?.data?.data?._id || ''

    const [selected,     setSelected]     = useState(null)
    const [filterStatus, setFilterStatus] = useState('All')
    const [search,       setSearch]       = useState('')

    useEffect(() => { dispatch(HandleGetAllRequests()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllRequests()) }, [state.fetchData])

    const handleUpdate = (payload) => { dispatch(HandleUpdateRequestStatus(payload)); setSelected(null) }
    const handleDelete = (requestID) => {
        if (window.confirm('Delete this request?')) dispatch(HandleDeleteRequest({ requestID }))
    }

    const filtered = (state.data || []).filter(r => {
        const name = `${r.employee?.firstname ?? ''} ${r.employee?.lastname ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) && (filterStatus === 'All' || r.status === filterStatus)
    })

    const total    = state.data?.length || 0
    const pending  = state.data?.filter(r => r.status === 'Pending').length  || 0
    const approved = state.data?.filter(r => r.status === 'Approved').length || 0
    const denied   = state.data?.filter(r => r.status === 'Denied').length   || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>
            <PageHeader eyebrow="Operations" title="Employee Requests" subtitle="Review and action employee-generated requests" />

            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { label: 'Total',    value: total    },
                    { label: 'Pending',  value: pending  },
                    { label: 'Approved', value: approved },
                    { label: 'Denied',   value: denied   },
                ].map(s => (
                    <div key={s.label} className="pg-stat-card">
                        <span className="pg-stat-value">{s.value}</span>
                        <span className="pg-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="pg-filters">
                <input className="pg-search" type="text" placeholder="Search by employee name…"
                    value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 240 }} />
                {['All', 'Pending', 'Approved', 'Denied'].map(s => (
                    <button key={s} className={`pg-pill${filterStatus === s ? ' active' : ''}`}
                        onClick={() => setFilterStatus(s)}>{s}</button>
                ))}
            </div>

            <div className="pg-table-wrap">
                <div className="pg-table-head" style={{ gridTemplateColumns: '2fr 2fr 110px 110px' }}>
                    <span className="pg-th">Employee</span>
                    <span className="pg-th">Request</span>
                    <span className="pg-th">Status</span>
                    <span className="pg-th">Actions</span>
                </div>

                {filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">📬</span>
                        <p className="pg-empty-title">{search || filterStatus !== 'All' ? 'No records match your filters' : 'No requests yet'}</p>
                        <p className="pg-empty-sub">{search || filterStatus !== 'All' ? 'Try adjusting your search or filter.' : 'Employee requests will appear here.'}</p>
                    </div>
                )}

                {filtered.map(r => (
                    <div key={r._id} className="pg-table-row" style={{ gridTemplateColumns: '2fr 2fr 110px 110px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar first={r.employee?.firstname} last={r.employee?.lastname} />
                            <div>
                                <div className="pg-td-name">{r.employee?.firstname} {r.employee?.lastname}</div>
                                <div className="pg-td-sub">{r.department?.name || ''}</div>
                            </div>
                        </div>
                        <div>
                            <div className="pg-td-name">{r.requesttitle}</div>
                            <div className="pg-td-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{r.requestconent}</div>
                        </div>
                        <span><StatusPill status={r.status} /></span>
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="pg-action-btn indigo" disabled={r.status !== 'Pending'} onClick={() => setSelected(r)}>Review</button>
                            <button className="pg-action-btn red" onClick={() => handleDelete(r._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {selected && <ReviewModal request={selected} HRID={HRID} onClose={() => setSelected(null)} onSubmit={handleUpdate} />}
        </PageShell>
    )
}