import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetActivityLogs, HandleGetLogSummary, HandleClearOldLogs } from '../../../redux/Thunks/ActivityLogThunk'
import { Loading } from '../../../components/common/loading'

// ─── Action colour map — rgba tokens only, no Tailwind colour classes ─────────
const ACTION_CONFIG = {
    LOGIN:                    { bg: 'rgba(16,185,129,0.07)',  color: '#059669' },
    LOGOUT:                   { bg: 'rgba(0,0,0,0.04)',       color: 'rgba(0,0,0,0.4)' },
    SIGNUP:                   { bg: 'rgba(99,102,241,0.07)',  color: '#4f46e5' },
    PASSWORD_RESET:           { bg: 'rgba(139,92,246,0.08)', color: '#7c3aed' },
    EMPLOYEE_CREATED:         { bg: 'rgba(20,184,166,0.07)', color: '#0d9488' },
    EMPLOYEE_UPDATED:         { bg: 'rgba(99,102,241,0.07)', color: '#4f46e5' },
    EMPLOYEE_DELETED:         { bg: 'rgba(239,68,68,0.07)',  color: '#dc2626' },
    DEPARTMENT_CREATED:       { bg: 'rgba(20,184,166,0.07)', color: '#0d9488' },
    DEPARTMENT_UPDATED:       { bg: 'rgba(99,102,241,0.07)', color: '#4f46e5' },
    DEPARTMENT_DELETED:       { bg: 'rgba(239,68,68,0.07)',  color: '#dc2626' },
    LEAVE_CREATED:            { bg: 'rgba(245,158,11,0.08)', color: '#b45309' },
    LEAVE_APPROVED:           { bg: 'rgba(16,185,129,0.07)', color: '#059669' },
    LEAVE_REJECTED:           { bg: 'rgba(239,68,68,0.07)',  color: '#dc2626' },
    LEAVE_DELETED:            { bg: 'rgba(239,68,68,0.07)',  color: '#dc2626' },
    SALARY_CREATED:           { bg: 'rgba(99,102,241,0.08)', color: '#6366f1' },
    SALARY_UPDATED:           { bg: 'rgba(99,102,241,0.08)', color: '#6366f1' },
    ATTENDANCE_UPDATED:       { bg: 'rgba(99,102,241,0.07)', color: '#4f46e5' },
    NOTICE_CREATED:           { bg: 'rgba(249,115,22,0.07)', color: '#c2410c' },
    NOTICE_DELETED:           { bg: 'rgba(239,68,68,0.07)',  color: '#dc2626' },
    DOCUMENT_CREATED:         { bg: 'rgba(20,184,166,0.07)', color: '#0d9488' },
    DOCUMENT_UPDATED:         { bg: 'rgba(99,102,241,0.07)', color: '#4f46e5' },
    DOCUMENT_DELETED:         { bg: 'rgba(239,68,68,0.07)',  color: '#dc2626' },
    DOCUMENT_ALERT_RUN:       { bg: 'rgba(245,158,11,0.08)', color: '#b45309' },
    RECRUITMENT_CREATED:      { bg: 'rgba(139,92,246,0.08)', color: '#7c3aed' },
    APPLICANT_STATUS_UPDATED: { bg: 'rgba(139,92,246,0.08)', color: '#7c3aed' },
    ACCESS_DRIFT_DETECTED:    { bg: 'rgba(239,68,68,0.09)',  color: '#b91c1c' },
    ACCESS_DRIFT_RESOLVED:    { bg: 'rgba(16,185,129,0.09)', color: '#047857' },
}
const getConfig = (action) =>
    ACTION_CONFIG[action] || { bg: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.45)' }

const ALL_ACTIONS = Object.keys(ACTION_CONFIG)

// ─── Relative time ────────────────────────────────────────────────────────────
const relativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── Action badge ── */
  .al-action-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 100px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .al-action-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* ── Role badge ── */
  .al-role-badge {
    display: inline-flex; align-items: center;
    padding: 3px 9px; border-radius: 6px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.03em;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .al-role-hr  { background: rgba(99,102,241,0.09);  color: #4f46e5; }
  .al-role-emp { background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.45); }

  /* ── Filter panel labels ── */
  .al-filter-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(0,0,0,0.3);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Danger ghost button (Clear Old Logs) ── */
  .al-btn-danger-ghost {
    padding: 9px 18px; background: rgba(239,68,68,0.06); color: #dc2626;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    border: 1px solid rgba(220,38,38,0.2); border-radius: 10px; cursor: pointer;
    transition: background 0.15s, border-color 0.15s; white-space: nowrap;
  }
  .al-btn-danger-ghost:hover { background: rgba(239,68,68,0.11); border-color: rgba(220,38,38,0.35); }

  /* ── Pagination ── */
  .al-pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.06);
    flex-shrink: 0; flex-wrap: wrap; gap: 10px;
  }
  .al-pagination-info { font-size: 12px; color: rgba(0,0,0,0.38); font-family: 'DM Sans', sans-serif; }
  .al-pagination-btns { display: flex; gap: 4px; }

  /* ── Clear logs modal ── */
  .al-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;
  }
  .al-modal {
    background: #ffffff; border-radius: 20px; padding: 28px 30px;
    width: 100%; max-width: 400px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.12);
    display: flex; flex-direction: column; gap: 18px;
    font-family: 'DM Sans', sans-serif;
  }
  .al-modal-title { font-family: 'DM Serif Display', serif; font-size: 1.2rem; color: #0f172a; letter-spacing: -0.02em; margin: 0; }
  .al-modal-body  { font-size: 13px; color: rgba(0,0,0,0.45); line-height: 1.6; margin: 0; }
  .al-modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; border-top: 1px solid rgba(0,0,0,0.06); }

  /* ── Empty state ── */
  .al-empty {
    display: flex; align-items: center; justify-content: center;
    padding: 48px 20px; font-size: 13px; color: rgba(0,0,0,0.3);
    font-family: 'DM Sans', sans-serif; text-align: center; flex: 1;
  }
`

// ─── Action badge ─────────────────────────────────────────────────────────────
const ActionBadge = ({ action }) => {
    const c = getConfig(action)
    return (
        <span className="al-action-badge" style={{ background: c.bg, color: c.color }}>
            <span className="al-action-dot" style={{ background: c.color }} />
            {action.replace(/_/g, ' ')}
        </span>
    )
}

// ─── Role badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
    <span className={`al-role-badge ${role === 'HR-Admin' ? 'al-role-hr' : 'al-role-emp'}`}>
        {role === 'HR-Admin' ? 'HR' : 'Employee'}
    </span>
)

// ─── Main page ────────────────────────────────────────────────────────────────
export const ActivityLogPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.ActivityLogReducer)

    const [filterAction,   setFilterAction]   = useState('')
    const [filterRole,     setFilterRole]     = useState('')
    const [filterFrom,     setFilterFrom]     = useState('')
    const [filterTo,       setFilterTo]       = useState('')
    const [clearDays,      setClearDays]      = useState(90)
    const [showClearModal, setShowClearModal] = useState(false)
    const [currentPage,    setCurrentPage]    = useState(1)

    const fetchLogs = (page = 1) => {
        dispatch(HandleGetActivityLogs({
            page, limit: 50,
            action:    filterAction || undefined,
            actorRole: filterRole   || undefined,
            from:      filterFrom   || undefined,
            to:        filterTo     || undefined,
        }))
    }

    useEffect(() => {
        dispatch(HandleGetLogSummary())
        fetchLogs(1)
    }, [])

    const handleApplyFilters = () => { setCurrentPage(1); fetchLogs(1) }

    const handleClearFilters = () => {
        setFilterAction(''); setFilterRole(''); setFilterFrom(''); setFilterTo('')
        setCurrentPage(1)
        dispatch(HandleGetActivityLogs({ page: 1, limit: 50 }))
    }

    const handlePageChange = (p) => { setCurrentPage(p); fetchLogs(p) }

    const handleClearLogs = () => {
        dispatch(HandleClearOldLogs({ days: clearDays })).then(() => {
            setShowClearModal(false)
            fetchLogs(1)
            dispatch(HandleGetLogSummary())
        })
    }

    const logs       = state?.logs       || []
    const pagination = state?.pagination || { totalPages: 0, total: 0, limit: 50 }
    const summary    = state?.summary    || { total: 0, byRole: {}, byAction: [] }

    const topAction = summary.byAction?.[0]

    return (
        <>
            <style>{styles}</style>
            <PageShell>

                {/* ── Header ── */}
                <PageHeader
                    eyebrow="Operations"
                    title="Activity Log"
                    subtitle="All system actions recorded in the last 30 days"
                >
                    <button className="al-btn-danger-ghost" onClick={() => setShowClearModal(true)}>
                        Clear Old Logs
                    </button>
                </PageHeader>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Events',      value: summary.total,                    sub: 'Last 30 days'  },
                        { label: 'HR Actions',        value: summary.byRole?.hr        || 0,   sub: 'HR-Admin role' },
                        { label: 'Employee Actions',  value: summary.byRole?.employee  || 0,   sub: 'Employee role' },
                        { label: 'Top Action',        value: topAction?._id?.replace(/_/g, ' ') || '—',
                                                      sub: topAction ? `${topAction.count} times` : '' },
                    ].map(c => (
                        <div key={c.label} className="pg-stat-card">
                            <span className="pg-stat-value">{c.value}</span>
                            <span className="pg-stat-label">{c.label}</span>
                            {c.sub && (
                                <span style={{ fontSize: '11px', color: 'rgba(0,0,0,0.28)', fontWeight: 300 }}>
                                    {c.sub}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Filter panel ── */}
                <div className="pg-filter-panel">
                    <div className="pg-filter-group">
                        <label className="al-filter-label">Action type</label>
                        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="pg-select">
                            <option value="">All actions</option>
                            {ALL_ACTIONS.map(a => (
                                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pg-filter-group">
                        <label className="al-filter-label">Role</label>
                        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="pg-select">
                            <option value="">All roles</option>
                            <option value="HR-Admin">HR Admin</option>
                            <option value="Employee">Employee</option>
                        </select>
                    </div>
                    <div className="pg-filter-group">
                        <label className="al-filter-label">From</label>
                        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="pg-date" />
                    </div>
                    <div className="pg-filter-group">
                        <label className="al-filter-label">To</label>
                        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="pg-date" />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <button className="pg-btn-primary" onClick={handleApplyFilters}>Apply</button>
                        <button className="pg-btn-ghost"  onClick={handleClearFilters}>Clear</button>
                    </div>
                </div>

                {/* ── Log table ── */}
                <div className="pg-table-wrap">
                    <div className="pg-table-head grid grid-cols-12">
                        <span className="pg-th col-span-1">Role</span>
                        <span className="pg-th col-span-2">Actor</span>
                        <span className="pg-th col-span-3">Action</span>
                        <span className="pg-th col-span-4">Description</span>
                        <span className="pg-th col-span-2" style={{ textAlign: 'right' }}>Time</span>
                    </div>

                    {state.isLoading && <Loading />}

                    {!state.isLoading && logs.length === 0 && (
                        <div className="al-empty">
                            No activity logs found. Logs are recorded automatically as actions are performed.
                        </div>
                    )}

                    {!state.isLoading && logs.map(log => (
                        <div key={log._id} className="pg-table-row grid grid-cols-12">
                            <span className="col-span-1">
                                <RoleBadge role={log.actorRole} />
                            </span>
                            <span className="col-span-2 pg-td-name truncate pr-2">
                                {log.actorName}
                            </span>
                            <span className="col-span-3">
                                <ActionBadge action={log.action} />
                            </span>
                            <span className="col-span-4 pg-td-muted truncate pr-2">
                                {log.description}
                            </span>
                            <span className="col-span-2 pg-td-muted" style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                {relativeTime(log.createdAt)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Pagination ── */}
                {pagination?.totalPages > 1 && (
                    <div className="al-pagination">
                        <span className="al-pagination-info">
                            Showing {((currentPage - 1) * pagination.limit) + 1}–{Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} events
                        </span>
                        <div className="al-pagination-btns">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className="pg-page-btn"
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                const p = Math.max(1, currentPage - 2) + i
                                if (p > pagination.totalPages) return null
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`pg-page-btn${p === currentPage ? ' active' : ''}`}
                                    >
                                        {p}
                                    </button>
                                )
                            })}
                            <button
                                disabled={currentPage === pagination.totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className="pg-page-btn"
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Clear old logs modal ── */}
                {showClearModal && (
                    <div className="al-modal-overlay">
                        <div className="al-modal">
                            <div>
                                <h2 className="al-modal-title">Clear Old Logs</h2>
                            </div>
                            <div className="pg-divider" />
                            <p className="al-modal-body">
                                This will permanently delete all logs older than the selected number of days. This action cannot be undone.
                            </p>
                            <div className="pg-field">
                                <label className="pg-label">Delete logs older than</label>
                                <select
                                    value={clearDays}
                                    onChange={e => setClearDays(Number(e.target.value))}
                                    className="pg-input"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <option value={30}>30 days</option>
                                    <option value={60}>60 days</option>
                                    <option value={90}>90 days</option>
                                    <option value={180}>180 days</option>
                                </select>
                            </div>
                            <div className="al-modal-actions">
                                <button className="pg-btn-ghost" onClick={() => setShowClearModal(false)}>
                                    Cancel
                                </button>
                                <button className="pg-btn-danger" onClick={handleClearLogs}>
                                    Delete Logs
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </PageShell>
        </>
    )
}
