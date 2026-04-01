import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetActivityLogs, HandleGetLogSummary, HandleClearOldLogs } from '../../../redux/Thunks/ActivityLogThunk'
import { Loading } from '../../../components/common/loading'

// ─── Action colour map ────────────────────────────────────────────────────────
const ACTION_STYLES = {
    LOGIN:                   { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
    LOGOUT:                  { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
    SIGNUP:                  { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500'   },
    PASSWORD_RESET:          { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
    EMPLOYEE_CREATED:        { bg: 'bg-teal-100',   text: 'text-teal-800',   dot: 'bg-teal-500'   },
    EMPLOYEE_UPDATED:        { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400'   },
    EMPLOYEE_DELETED:        { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500'    },
    DEPARTMENT_CREATED:      { bg: 'bg-teal-100',   text: 'text-teal-800',   dot: 'bg-teal-500'   },
    DEPARTMENT_UPDATED:      { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400'   },
    DEPARTMENT_DELETED:      { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500'    },
    LEAVE_CREATED:           { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    LEAVE_APPROVED:          { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
    LEAVE_REJECTED:          { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500'    },
    LEAVE_DELETED:           { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-400'    },
    SALARY_CREATED:          { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' },
    SALARY_UPDATED:          { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-400' },
    ATTENDANCE_UPDATED:      { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400'   },
    NOTICE_CREATED:          { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' },
    NOTICE_DELETED:          { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-400'    },
    DOCUMENT_CREATED:        { bg: 'bg-teal-100',   text: 'text-teal-800',   dot: 'bg-teal-500'   },
    DOCUMENT_UPDATED:        { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400'   },
    DOCUMENT_DELETED:        { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-400'    },
    DOCUMENT_ALERT_RUN:      { bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-500'  },
    RECRUITMENT_CREATED:     { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
    APPLICANT_STATUS_UPDATED:{ bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-400' },
    ACCESS_DRIFT_DETECTED:   { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-600'    },
    ACCESS_DRIFT_RESOLVED:   { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-600'  },
}
const getStyle = (action) => ACTION_STYLES[action] || { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' }

// ─── Action badge ─────────────────────────────────────────────────────────────
const ActionBadge = ({ action }) => {
    const s = getStyle(action)
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
            {action.replace(/_/g, ' ')}
        </span>
    )
}

// ─── Role badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${role === 'HR-Admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
        {role === 'HR-Admin' ? 'HR' : 'Employee'}
    </span>
)

// ─── Summary stat card ────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm font-medium">{label}</span>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
)

// ─── Relative time formatter ──────────────────────────────────────────────────
const relativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60)   return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── All unique action types for filter dropdown ──────────────────────────────
const ALL_ACTIONS = Object.keys(ACTION_STYLES)

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
            page,
            limit: 50,
            action:    filterAction  || undefined,
            actorRole: filterRole    || undefined,
            from:      filterFrom    || undefined,
            to:        filterTo      || undefined,
        }))
    }

    useEffect(() => {
        dispatch(HandleGetLogSummary())
        fetchLogs(1)
    }, [])

    const handleApplyFilters = () => {
        setCurrentPage(1)
        fetchLogs(1)
    }

    const handleClearFilters = () => {
        setFilterAction('')
        setFilterRole('')
        setFilterFrom('')
        setFilterTo('')
        setCurrentPage(1)
        dispatch(HandleGetActivityLogs({ page: 1, limit: 50 }))
    }

    const handlePageChange = (p) => {
        setCurrentPage(p)
        fetchLogs(p)
    }

    const handleClearLogs = () => {
        dispatch(HandleClearOldLogs({ days: clearDays })).then(() => {
            setShowClearModal(false)
            fetchLogs(1)
            dispatch(HandleGetLogSummary())
        })
    }

    const logs = state?.logs || []
    const pagination = state?.pagination || { totalPages: 0, total: 0, limit: 50 }
    const summary = state?.summary || { total: 0, byRole: {}, byAction: [] }

    return (
        <PageShell>

            {/* ── Header ── */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <PageHeader eyebrow="Operations" title="Activity Log" subtitle="All system actions recorded in the last 30 days" />
                    <p className="text-sm text-gray-500 mt-1">All system actions recorded in the last 30 days</p>
                </div>
                <button
                    onClick={() => setShowClearModal(true)}
                    className="px-4 py-2 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-all"
                >
                    Clear Old Logs
                </button>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total Events"     value={summary.total}              color="border-gray-200 bg-gray-50"   sub="Last 30 days" />
                <StatCard label="HR Actions"       value={summary.byRole?.hr || 0}    color="border-blue-200 bg-blue-50"   sub="HR-Admin role" />
                <StatCard label="Employee Actions" value={summary.byRole?.employee || 0} color="border-teal-200 bg-teal-50" sub="Employee role" />
                <StatCard
                    label="Top Action"
                    value={summary.byAction?.[0]?._id?.replace(/_/g, ' ') || '—'}
                    color="border-purple-200 bg-purple-50"
                    sub={summary.byAction?.[0] ? `${summary.byAction[0].count} times` : ''}
                />
            </div>

            {/* ── Filters ── */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Action type</label>
                    <select
                        value={filterAction}
                        onChange={e => setFilterAction(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                    >
                        <option value="">All actions</option>
                        {ALL_ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Role</label>
                    <select
                        value={filterRole}
                        onChange={e => setFilterRole(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                    >
                        <option value="">All roles</option>
                        <option value="HR-Admin">HR Admin</option>
                        <option value="Employee">Employee</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">From</label>
                    <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">To</label>
                    <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                </div>
                <div className="flex gap-2 pb-0.5">
                    <button onClick={handleApplyFilters}
                        className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                        Apply
                    </button>
                    <button onClick={handleClearFilters}
                        className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100">
                        Clear
                    </button>
                </div>
            </div>

            {/* ── Log table ── */}
            <div className="flex flex-col gap-2 overflow-auto flex-1">
                {/* Header row */}
                <div className="grid grid-cols-12 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-1">Role</span>
                    <span className="col-span-2">Actor</span>
                    <span className="col-span-3">Action</span>
                    <span className="col-span-4">Description</span>
                    <span className="col-span-2 text-right">Time</span>
                </div>

                {state.isLoading && <Loading />}

                {!state.isLoading && logs.length === 0 && (
                    <div className="text-center text-gray-400 py-16">
                        No activity logs found. Logs are recorded automatically as actions are performed.
                    </div>
                )}

                {!state.isLoading && logs.map((log) => (
                    <div key={log._id}
                        className="grid grid-cols-12 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                        <span className="col-span-1">
                            <RoleBadge role={log.actorRole} />
                        </span>
                        <span className="col-span-2 font-medium text-gray-800 truncate pr-2">
                            {log.actorName}
                        </span>
                        <span className="col-span-3">
                            <ActionBadge action={log.action} />
                        </span>
                        <span className="col-span-4 text-gray-500 text-xs truncate pr-2">
                            {log.description}
                        </span>
                        <span className="col-span-2 text-xs text-gray-400 text-right whitespace-nowrap">
                            {relativeTime(log.createdAt)}
                        </span>
                    </div>
                ))}
            </div>

            {/* ── Pagination ── */}
            {pagination?.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * pagination?.limit) + 1}–{Math.min(currentPage * pagination?.limit, pagination?.total)} of {pagination.total} events
                    </span>
                    <div className="flex gap-1">
                        <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                            ← Prev
                        </button>
                        {Array.from({ length: Math.min(5, pagination?.totalPages) }, (_, i) => {
                            const p = Math.max(1, currentPage - 2) + i
                            if (p > pagination.totalPages) return null
                            return (
                                <button key={p} onClick={() => handlePageChange(p)}
                                    className={`px-3 py-1.5 text-sm border rounded-lg ${p === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                                    {p}
                                </button>
                            )
                        })}
                        <button disabled={currentPage === pagination?.totalPages} onClick={() => handlePageChange(currentPage + 1)}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Clear old logs modal ── */}
            {showClearModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h2 className="text-lg font-bold mb-2">Clear Old Logs</h2>
                        <p className="text-sm text-gray-500 mb-4">
                            This will permanently delete all logs older than the selected number of days.
                        </p>
                        <div className="flex flex-col gap-1 mb-4">
                            <label className="text-xs font-medium text-gray-600">Delete logs older than</label>
                            <select value={clearDays} onChange={e => setClearDays(Number(e.target.value))}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                                <option value={30}>30 days</option>
                                <option value={60}>60 days</option>
                                <option value={90}>90 days</option>
                                <option value={180}>180 days</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowClearModal(false)}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleClearLogs}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                                Delete Logs
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    )
}