import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllAttendances, HandleDeleteAttendance } from '../../../redux/Thunks/AttendanceThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --att-text-main: #fafafa;
    --att-text-muted: #a1a1aa;
    --att-border: #27272a;

    /* Override the 'Not Specified' status colors for dark mode */
    --att-ns-bg: rgba(255,255,255,0.08);
    --att-ns-text: rgba(255,255,255,0.6);
    --att-ns-border: rgba(255,255,255,0.12);
  }

  [data-theme='dark'] .pg-modal {
    background: #18181b !important;
    border: 1px solid #27272a !important;
  }
`

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

// ─── Status tokens ────────────────────────────────────────────────────────────
const STATUS = {
    Present:         { bg: 'rgba(22,163,74,0.08)',  color: '#15803d', border: 'rgba(22,163,74,0.22)'  },
    Absent:          { bg: 'rgba(220,38,38,0.07)',  color: '#dc2626', border: 'rgba(220,38,38,0.2)'   },
    'Not Specified': { bg: 'var(--att-ns-bg, rgba(0,0,0,0.04))', color: 'var(--att-ns-text, rgba(0,0,0,0.45))', border: 'var(--att-ns-border, rgba(0,0,0,0.1))' },
}

const StatusPill = ({ status }) => {
    const s = STATUS[status] || STATUS['Not Specified']
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

// ─── Log modal ────────────────────────────────────────────────────────────────
const LogModal = ({ record, onClose }) => {
    if (!record) return null

    const logs = [...(record.attendancelog || [])].reverse()
    const presentCount = logs.filter(l => l.logstatus === 'Present').length
    const absentCount  = logs.filter(l => l.logstatus === 'Absent').length
    const rate = logs.length ? Math.round((presentCount / logs.length) * 100) : 0

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal" style={{ maxWidth: 460, maxHeight: '85vh' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar
                        first={record.employee?.firstname}
                        last={record.employee?.lastname}
                        size={48}
                        fontSize={16}
                    />
                    <div>
                        <div style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '1.2rem', color: 'var(--att-text-main, #0f172a)',
                            letterSpacing: '-0.02em', lineHeight: 1.2,
                        }}>
                            {record.employee?.firstname} {record.employee?.lastname}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--att-text-muted, rgba(0,0,0,0.38))', marginTop: 3 }}>
                            Attendance Log · {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
                        </div>
                    </div>
                </div>

                <div className="pg-divider" />

                {/* Mini stats */}
                {logs.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        {[
                            { label: 'Present',  value: presentCount, color: '#15803d',         bg: 'rgba(22,163,74,0.07)',  border: 'rgba(22,163,74,0.2)'  },
                            { label: 'Absent',   value: absentCount,  color: '#dc2626',         bg: 'rgba(220,38,38,0.07)', border: 'rgba(220,38,38,0.2)' },
                            { label: 'Rate',     value: `${rate}%`,   color: '#4f46e5',         bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.2)' },
                        ].map(s => (
                            <div key={s.label} style={{
                                background: s.bg, border: `1px solid ${s.border}`,
                                borderRadius: 12, padding: '10px 12px',
                                display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'center',
                            }}>
                                <span style={{
                                    fontFamily: "'DM Serif Display', serif",
                                    fontSize: '1.3rem', color: s.color, lineHeight: 1,
                                }}>
                                    {s.value}
                                </span>
                                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: s.color, opacity: 0.7 }}>
                                    {s.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Log entries */}
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: 0,
                    overflowY: 'auto', flex: 1,
                    maxHeight: 320,
                }}>
                    {logs.length === 0 ? (
                        <div className="pg-empty" style={{ padding: '32px 0' }}>
                            <span className="pg-empty-icon" style={{ fontSize: '2rem' }}>📋</span>
                            <p className="pg-empty-title">No log entries yet</p>
                            <p className="pg-empty-sub">Daily entries will appear here once attendance is marked.</p>
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', gap: 16,
                                padding: '9px 0',
                                borderBottom: i < logs.length - 1 ? '1px solid var(--att-border, rgba(0,0,0,0.05))' : 'none',
                            }}>
                                <span style={{ fontSize: 13, color: 'var(--att-text-main, #0f172a)', fontWeight: 500 }}>
                                    {fmtDate(log.logdate)}
                                </span>
                                <StatusPill status={log.logstatus} />
                            </div>
                        ))
                    )}
                </div>

                {/* Actions */}
                <div className="pg-modal-actions" style={{ borderTop: '1px solid var(--att-border, rgba(0,0,0,0.06))' }}>
                    <button className="pg-btn-ghost" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const AttendancePage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.AttendanceReducer)

    const [logTarget,    setLogTarget]    = useState(null)
    const [search,       setSearch]       = useState('')
    const [filterStatus, setFilterStatus] = useState('All')

    useEffect(() => { dispatch(HandleGetAllAttendances()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllAttendances()) }, [state.fetchData])

    const handleDelete = (attendanceID) => {
        if (window.confirm('Delete this attendance record? This cannot be undone.'))
            dispatch(HandleDeleteAttendance({ attendanceID }))
    }

    const filtered = (state.data || []).filter(a => {
        const name = `${a.employee?.firstname ?? ''} ${a.employee?.lastname ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) &&
            (filterStatus === 'All' || a.status === filterStatus)
    })

    const total        = state.data?.length || 0
    const presentCount = state.data?.filter(a => a.status === 'Present').length      || 0
    const absentCount  = state.data?.filter(a => a.status === 'Absent').length       || 0
    const notSpecified = state.data?.filter(a => a.status === 'Not Specified').length || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>
            <style>{styles}</style>

            {/* ── Page header ── */}
            <PageHeader
                eyebrow="Operations"
                title="Attendance"
                subtitle="View and manage employee attendance records and daily logs"
            />

            {/* ── Stats strip ── */}
            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[
                    { label: 'Total Records',  value: total        },
                    { label: 'Present',        value: presentCount },
                    { label: 'Absent',         value: absentCount  },
                    { label: 'Not Specified',  value: notSpecified },
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
                {['All', 'Present', 'Absent', 'Not Specified'].map(s => (
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
                    style={{ gridTemplateColumns: '2fr 120px 80px 1.2fr 120px' }}
                >
                    <span className="pg-th">Employee</span>
                    <span className="pg-th">Status</span>
                    <span className="pg-th">Log Entries</span>
                    <span className="pg-th">Last Updated</span>
                    <span className="pg-th">Actions</span>
                </div>

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">📅</span>
                        <p className="pg-empty-title">
                            {search || filterStatus !== 'All'
                                ? 'No records match your filters'
                                : 'No attendance records yet'}
                        </p>
                        <p className="pg-empty-sub">
                            {search || filterStatus !== 'All'
                                ? 'Try adjusting your search or filter.'
                                : 'Attendance records will appear here once employees are tracked.'}
                        </p>
                    </div>
                )}

                {/* Rows */}
                {filtered.map(a => (
                    <div
                        key={a._id}
                        className="pg-table-row"
                        style={{ gridTemplateColumns: '2fr 120px 80px 1.2fr 120px' }}
                    >
                        {/* Employee */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar
                                first={a.employee?.firstname}
                                last={a.employee?.lastname}
                            />
                            <div>
                                <div className="pg-td-name">
                                    {a.employee?.firstname} {a.employee?.lastname}
                                </div>
                                <div className="pg-td-sub">
                                    {a.employee?.department?.name || a.employee?.department || ''}
                                </div>
                            </div>
                        </div>

                        {/* Current status */}
                        <span>
                            <StatusPill status={a.status} />
                        </span>

                        {/* Log count */}
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--att-text-main, #0f172a)' }}>
                            {a.attendancelog?.length || 0}
                            <span className="pg-td-sub" style={{ fontWeight: 400, marginLeft: 3 }}>
                                {a.attendancelog?.length === 1 ? 'day' : 'days'}
                            </span>
                        </span>

                        {/* Last updated */}
                        <span className="pg-td-muted">{fmtDate(a.updatedAt)}</span>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 6 }}>
                            <button
                                className="pg-action-btn indigo"
                                onClick={() => setLogTarget(a)}
                            >
                                View Log
                            </button>
                            <button
                                className="pg-action-btn red"
                                onClick={() => handleDelete(a._id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Log modal ── */}
            {logTarget && (
                <LogModal record={logTarget} onClose={() => setLogTarget(null)} />
            )}

        </PageShell>
    )
}