import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyActivity } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Relative time ────────────────────────────────────────────────────────────
const relativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Action Styles ───────────────────────────────────────────────────────────
const ACTION_CONFIG = {
    'LOGIN':            { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.25)', color: '#059669' },
    'LOGOUT':           { bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.28)', color: '#4b5563' },
    'LEAVE_CREATED':    { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.28)', color: '#b45309' },
    'LEAVE_APPROVED':   { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.25)', color: '#059669' },
    'LEAVE_REJECTED':   { bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.25)',  color: '#dc2626' },
    'EMPLOYEE_UPDATED': { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)', color: '#2563eb' },
    'ATTENDANCE_UPDATED':{ bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)', color: '#2563eb' },
}

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  
  [data-theme='dark'] {
    --ma-card-bg: rgba(99,102,241,0.05); /* Very subtle indigo tint */
    --ma-card-border: rgba(99,102,241,0.2);
    --ma-card-text: #818cf8; /* Light Indigo */
    --ma-text-muted: #a1a1aa;
    --ma-text-faint: #71717a;
    --ma-border: #27272a;
    --ma-text-clear: #818cf8;
  }

  .ac-action-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 100px; border: 1px solid;
    font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
    text-transform: uppercase;
  }
  .ac-action-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  
  .ac-summary-card {
    background: var(--ma-card-bg, linear-gradient(135deg, #f5f7ff 0%, #eeefff 100%));
    border: 1px solid var(--ma-card-border, #e0e4ff); 
    border-radius: 12px; padding: 16px 20px;
    margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;
  }
  
  .ac-summary-title {
    font-size: 1.5rem; 
    font-weight: 700; 
    color: var(--ma-card-text, #4338ca); /* indigo-700 in light mode */
    margin-top: 4px;
  }
  
  .ac-summary-subtitle {
    color: var(--ma-text-muted, #64748b); 
    font-size: 13px;
  }
  
  .ac-clear-btn {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--ma-text-muted, #9ca3af); /* gray-400 */
    transition: color 0.2s;
  }
  .ac-clear-btn:hover {
    color: var(--ma-text-clear, #4f46e5); /* indigo-600 */
  }
`

const ActionBadge = ({ action }) => {
    const cfg = ACTION_CONFIG[action] || { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)', color: '#7c3aed' }
    return (
        <span className="ac-action-badge" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
            <span className="ac-action-dot" style={{ background: cfg.color }} />
            {action.replace(/_/g, ' ')}
        </span>
    )
}

export const MyActivityPage = () => {
    const dispatch     = useDispatch()
    const state        = useSelector(s => s.EmployeeDashboardReducer)
    const activitylogs = state.activitylogs || []

    const [filterAction, setFilterAction] = useState('')
    const [search,       setSearch]       = useState('')

    useEffect(() => { dispatch(HandleGetMyActivity()) }, [dispatch])
    useEffect(() => { if (state.fetchActivity) dispatch(HandleGetMyActivity()) }, [state.fetchActivity, dispatch])

    const uniqueActions = [...new Set(activitylogs.map(l => l.action))]

    const filtered = activitylogs.filter(log => {
        const matchAction = !filterAction || log.action === filterAction
        const matchSearch = !search || 
            log.description?.toLowerCase().includes(search.toLowerCase()) ||
            log.action?.toLowerCase().includes(search.toLowerCase())
        return matchAction && matchSearch
    })

    if (state.isLoading && !activitylogs.length) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>
                <PageHeader 
                    eyebrow="Security" 
                    title="My Activity" 
                    subtitle="A history of all actions you have performed in the system" 
                />

                {/* Search and Filters */}
                <div className="flex flex-wrap gap-3 mb-5 items-center">
                    <input
                        type="text"
                        placeholder="Search activity description..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pg-input"
                        style={{ width: '260px' }}
                    />
                    <select
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                        className="pg-input"
                        style={{ width: '180px', padding: '7px 12px' }}
                    >
                        <option value="">All Actions</option>
                        {uniqueActions.map(a => (
                            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                    {(filterAction || search) && (
                        <button
                            onClick={() => { setFilterAction(''); setSearch('') }}
                            className="ac-clear-btn"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Summary Card */}
                <div className="ac-summary-card">
                    <div>
                        <p className="pg-td-sub ac-summary-subtitle">System Audit Log</p>
                        <p className="ac-summary-title">
                            {activitylogs.length} Total Actions
                        </p>
                    </div>
                    <div className="text-right">
                        <p style={{ fontSize: '0.75rem', color: 'var(--ma-text-faint, #9ca3af)' }}>Last updated</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--ma-text-muted, #4b5563)' }}>{relativeTime(new Date())}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="pg-table-wrap">
                    <div className="pg-table-head grid grid-cols-12">
                        <span className="pg-th col-span-3">Action</span>
                        <span className="pg-th col-span-7">Description</span>
                        <span className="pg-th col-span-2 text-right">Time</span>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="pg-empty">
                            <span className="pg-empty-icon">🛡️</span>
                            <p className="pg-empty-title">No activity found</p>
                            <p className="pg-empty-sub">Your system interactions will be logged here for security.</p>
                        </div>
                    ) : (
                        filtered.map(log => (
                            <div key={log._id} className="pg-table-row grid grid-cols-12 items-center">
                                <span className="col-span-3">
                                    <ActionBadge action={log.action} />
                                </span>
                                <span className="col-span-7 pg-td-sub truncate pr-6" title={log.description}>
                                    {log.description}
                                </span>
                                <span className="col-span-2 text-right pg-td-muted whitespace-nowrap">
                                    {relativeTime(log.createdAt)}
                                </span>
                            </div>
                        ))
                    )}
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--ma-text-faint, #9ca3af)', borderTop: '1px solid var(--ma-border, #f3f4f6)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    Showing last 100 security events. Older records are archived automatically.
                </p>
            </PageShell>
        </>
    )
}