import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllInterviews, HandleUpdateInterview, HandleDeleteInterview } from '../../../redux/Thunks/InterviewThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const initials = (first, last) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()

// ─── Avatar ───────────────────────────────────────────────────────────────────
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
    Pending:   { bg: 'rgba(234,179,8,0.09)',  color: '#854d0e', border: 'rgba(234,179,8,0.3)'   },
    Completed: { bg: 'rgba(22,163,74,0.08)',  color: '#15803d', border: 'rgba(22,163,74,0.22)'  },
    Canceled:  { bg: 'rgba(220,38,38,0.07)', color: '#dc2626', border: 'rgba(220,38,38,0.2)'   },
}

const StatusPill = ({ status }) => {
    const s = STATUS[status] || { bg: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.45)', border: 'rgba(0,0,0,0.1)' }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

// ─── Update modal ─────────────────────────────────────────────────────────────
const UpdateModal = ({ interview, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        status: 'Pending', feedback: '', interviewdate: '', responsedate: '',
    })

    useEffect(() => {
        if (interview) {
            setForm({
                status:        interview.status || 'Pending',
                feedback:      interview.feedback || '',
                interviewdate: interview.interviewdate ? interview.interviewdate.split('T')[0] : '',
                responsedate:  interview.responsedate  ? interview.responsedate.split('T')[0]  : '',
            })
        }
    }, [interview])

    if (!interview) return null

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => {
        e.preventDefault()
        onSubmit({ interviewID: interview._id, UpdatedData: form })
    }

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal">

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar
                        first={interview.applicant?.firstname}
                        last={interview.applicant?.lastname}
                        size={48}
                        fontSize={16}
                    />
                    <div>
                        <div style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '1.2rem', color: '#0f172a',
                            letterSpacing: '-0.02em', lineHeight: 1.2,
                        }}>
                            Update Interview
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', marginTop: 3 }}>
                            {interview.applicant?.firstname} {interview.applicant?.lastname}
                            {interview.applicant?.email && (
                                <span style={{ marginLeft: 6 }}>· {interview.applicant.email}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pg-divider" />

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Status */}
                    <div className="pg-field">
                        <label className="pg-label">Status</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {['Pending', 'Completed', 'Canceled'].map(opt => {
                                const s = STATUS[opt]
                                const active = form.status === opt
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, status: opt }))}
                                        style={{
                                            flex: 1, padding: '8px 0', borderRadius: 10,
                                            fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                            fontFamily: "'DM Sans', sans-serif",
                                            transition: 'all 0.15s',
                                            border: active ? `1px solid ${s.border}` : '1px solid rgba(0,0,0,0.1)',
                                            background: active ? s.bg : 'transparent',
                                            color: active ? s.color : 'rgba(0,0,0,0.45)',
                                        }}
                                    >
                                        {opt}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="pg-grid-2">
                        <div className="pg-field">
                            <label className="pg-label">Interview Date</label>
                            <input
                                name="interviewdate"
                                type="date"
                                value={form.interviewdate}
                                onChange={handle}
                                className="pg-input"
                            />
                        </div>
                        <div className="pg-field">
                            <label className="pg-label">Response Date</label>
                            <input
                                name="responsedate"
                                type="date"
                                value={form.responsedate}
                                onChange={handle}
                                className="pg-input"
                            />
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className="pg-field">
                        <label className="pg-label">Feedback</label>
                        <textarea
                            name="feedback"
                            value={form.feedback}
                            onChange={handle}
                            rows={4}
                            placeholder="Interview notes and feedback…"
                            className="pg-textarea"
                        />
                    </div>

                    <div className="pg-modal-actions">
                        <button type="button" className="pg-btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="pg-btn-primary">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const InterviewPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.InterviewReducer)

    const [editTarget,   setEditTarget]   = useState(null)
    const [filterStatus, setFilterStatus] = useState('All')
    const [search,       setSearch]       = useState('')

    useEffect(() => { dispatch(HandleGetAllInterviews()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllInterviews()) }, [state.fetchData])

    const handleUpdate = (data) => { dispatch(HandleUpdateInterview(data)); setEditTarget(null) }
    const handleDelete = (interviewID) => {
        if (window.confirm('Delete this interview record? This cannot be undone.'))
            dispatch(HandleDeleteInterview({ interviewID }))
    }

    const filtered = (state.data || []).filter(i => {
        const name = `${i.applicant?.firstname ?? ''} ${i.applicant?.lastname ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) &&
            (filterStatus === 'All' || i.status === filterStatus)
    })

    const total     = state.data?.length || 0
    const pending   = state.data?.filter(i => i.status === 'Pending').length   || 0
    const completed = state.data?.filter(i => i.status === 'Completed').length || 0
    const canceled  = state.data?.filter(i => i.status === 'Canceled').length  || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>

            {/* ── Page header ── */}
            <PageHeader
                eyebrow="Recruitment"
                title="Interview Insights"
                subtitle="Track and manage applicant interviews across all open positions"
            />

            {/* ── Stats strip ── */}
            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { label: 'Total',     value: total     },
                    { label: 'Pending',   value: pending   },
                    { label: 'Completed', value: completed },
                    { label: 'Canceled',  value: canceled  },
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
                    placeholder="Search by applicant name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ minWidth: 240 }}
                />
                {['All', 'Pending', 'Completed', 'Canceled'].map(s => (
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
                    style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 110px 110px' }}
                >
                    <span className="pg-th">Applicant</span>
                    <span className="pg-th">Interviewer</span>
                    <span className="pg-th">Interview Date</span>
                    <span className="pg-th">Status</span>
                    <span className="pg-th">Actions</span>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">🎙️</span>
                        <p className="pg-empty-title">
                            {search || filterStatus !== 'All'
                                ? 'No interviews match your filters'
                                : 'No interviews yet'}
                        </p>
                        <p className="pg-empty-sub">
                            {search || filterStatus !== 'All'
                                ? 'Try adjusting your search or filter.'
                                : 'Interview records will appear here once created.'}
                        </p>
                    </div>
                )}

                {/* Rows */}
                {filtered.map(i => (
                    <div
                        key={i._id}
                        className="pg-table-row"
                        style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 110px 110px' }}
                    >
                        {/* Applicant */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar
                                first={i.applicant?.firstname}
                                last={i.applicant?.lastname}
                            />
                            <div>
                                <div className="pg-td-name">
                                    {i.applicant?.firstname} {i.applicant?.lastname}
                                </div>
                                <div className="pg-td-sub">{i.applicant?.email || ''}</div>
                            </div>
                        </div>

                        {/* Interviewer */}
                        <div>
                            <div className="pg-td-name">
                                {i.interviewer?.firstname} {i.interviewer?.lastname}
                            </div>
                        </div>

                        {/* Interview date + response date */}
                        <div>
                            <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 500 }}>
                                {fmtDate(i.interviewdate)}
                            </div>
                            {i.responsedate && (
                                <div className="pg-td-sub">
                                    Response: {fmtDate(i.responsedate)}
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <span>
                            <StatusPill status={i.status} />
                        </span>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                className="pg-action-btn indigo"
                                onClick={() => setEditTarget(i)}
                            >
                                Edit
                            </button>
                            <button
                                className="pg-action-btn red"
                                onClick={() => handleDelete(i._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Update modal ── */}
            {editTarget && (
                <UpdateModal
                    interview={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSubmit={handleUpdate}
                />
            )}

        </PageShell>
    )
}