import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetAllDriftEvents,
    HandleGetDriftSummary,
    HandleResolveDrift,
    HandleDismissDrift
} from '../../../redux/Thunks/AccessDriftThunk'
import { Loading } from '../../../components/common/loading'

// ─── Config ───────────────────────────────────────────────────────────────────
const SEVERITY_STYLES = {
    CRITICAL: { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-600',    border: 'border-red-200'   },
    HIGH:     { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', border: 'border-orange-200'},
    MEDIUM:   { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', border: 'border-yellow-200'},
    LOW:      { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400',   border: 'border-blue-200'  },
}

const STATUS_STYLES = {
    OPEN:      { bg: 'bg-red-50',    text: 'text-red-700',   border: 'border-red-200'   },
    RESOLVED:  { bg: 'bg-green-50',  text: 'text-green-700', border: 'border-green-200' },
    DISMISSED: { bg: 'bg-gray-100',  text: 'text-gray-500',  border: 'border-gray-200'  },
}

const DRIFT_TYPE_LABELS = {
    UNUSUAL_LOGIN_TIME:        'Unusual Login Time',
    HIGH_FREQUENCY_ACTIONS:    'High Frequency Actions',
    SENSITIVE_ENDPOINT_ACCESS: 'Sensitive Endpoint Access',
    BULK_OPERATION:            'Bulk Operation',
    OFF_HOURS_ACTIVITY:        'Off-Hours Activity',
    REPEATED_FAILED_ACCESS:    'Repeated Failed Access',
    UNUSUAL_ACTION_PATTERN:    'Unusual Action Pattern',
}

const DRIFT_TYPE_ICONS = {
    UNUSUAL_LOGIN_TIME:        '🕐',
    HIGH_FREQUENCY_ACTIONS:    '⚡',
    SENSITIVE_ENDPOINT_ACCESS: '🔐',
    BULK_OPERATION:            '📦',
    OFF_HOURS_ACTIVITY:        '🌙',
    REPEATED_FAILED_ACCESS:    '🚫',
    UNUSUAL_ACTION_PATTERN:    '⚠️',
}

const relativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const SeverityBadge = ({ severity }) => {
    const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
            <span className={`w-2 h-2 rounded-full ${s.dot}`} />
            {severity}
        </span>
    )
}

const StatusBadge = ({ status }) => {
    const s = STATUS_STYLES[status] || STATUS_STYLES.OPEN
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
            {status}
        </span>
    )
}

const StatCard = ({ label, value, color, icon }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{value}</span>
            <span className="text-2xl">{icon}</span>
        </div>
        <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
)

// ─── Resolution Modal ─────────────────────────────────────────────────────────
const ResolutionModal = ({ drift, mode, onConfirm, onClose }) => {
    const [note, setNote] = useState('')
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                <h2 className="text-lg font-bold mb-1">
                    {mode === 'resolve' ? '✅ Resolve Drift Event' : '🗑️ Dismiss Drift Event'}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                    {mode === 'resolve'
                        ? 'Mark this drift as investigated and resolved.'
                        : 'Dismiss this as a false positive or non-issue.'}
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 text-sm">
                    <span className="font-semibold">{drift.employeeName}</span>
                    <span className="text-gray-500 ml-2">— {DRIFT_TYPE_LABELS[drift.driftType]}</span>
                </div>
                <div className="flex flex-col gap-1 mb-5">
                    <label className="text-xs font-medium text-gray-600">Resolution note (optional)</label>
                    <textarea
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                        placeholder={mode === 'resolve' ? 'e.g. Confirmed with employee, legitimate activity.' : 'e.g. Employee was on call, this was expected.'}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(note)}
                        className={`px-4 py-2 text-sm rounded-lg text-white ${mode === 'resolve' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}
                    >
                        {mode === 'resolve' ? 'Mark Resolved' : 'Dismiss'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Evidence panel ───────────────────────────────────────────────────────────
const EvidencePanel = ({ drift, onClose }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-lg font-bold">Evidence Details</h2>
                    <p className="text-sm text-gray-500">{drift.employeeName} — {DRIFT_TYPE_LABELS[drift.driftType]}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex gap-3 mb-4 flex-wrap">
                <SeverityBadge severity={drift.severity} />
                <StatusBadge status={drift.status} />
            </div>

            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 mb-4">{drift.description}</p>

            {drift.evidence?.length > 0 ? (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Evidence log ({drift.evidence.length} entries)</p>
                    {drift.evidence.map((ev, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-3 text-xs text-gray-600 bg-gray-50">
                            <div className="flex justify-between mb-1">
                                <span className="font-semibold text-gray-800">{ev.action?.replace(/_/g, ' ')}</span>
                                <span className="text-gray-400">{relativeTime(ev.timestamp)}</span>
                            </div>
                            {ev.endpoint && <div className="font-mono text-gray-500">{ev.endpoint}</div>}
                            <div>{ev.description}</div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-400 text-center py-4">No detailed evidence captured for this event.</p>
            )}

            {drift.status !== 'OPEN' && drift.resolvedByName && (
                <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                    <span className="font-medium">{drift.status === 'RESOLVED' ? 'Resolved' : 'Dismissed'}</span> by {drift.resolvedByName}
                    {drift.resolutionNote && <p className="mt-1 italic">"{drift.resolutionNote}"</p>}
                </div>
            )}
        </div>
    </div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AccessDriftPage = () => {
    const dispatch = useDispatch()
const state = useSelector(s => s.AccessDriftReducer)

    const [filterStatus,   setFilterStatus]   = useState('ALL')
    const [filterSeverity, setFilterSeverity] = useState('ALL')
    const [filterType,     setFilterType]     = useState('ALL')
    const [currentPage,    setCurrentPage]    = useState(1)
    const [modalDrift,     setModalDrift]     = useState(null)
    const [modalMode,      setModalMode]      = useState(null)  // 'resolve' | 'dismiss'
    const [evidenceDrift,  setEvidenceDrift]  = useState(null)

    const fetchDrifts = (page = 1) => {
        dispatch(HandleGetAllDriftEvents({
            page,
            limit: 20,
            status: filterStatus === 'ALL' ? undefined : filterStatus,
            severity: filterSeverity === 'ALL' ? undefined : filterSeverity,
            driftType: filterType === 'ALL' ? undefined : filterType,
        }))
    }

    useEffect(() => {
        dispatch(HandleGetDriftSummary())
        fetchDrifts(1)
    }, [dispatch])

    const handleApply = () => { setCurrentPage(1); fetchDrifts(1) }
    const handleClear = () => {
        setFilterStatus('ALL'); setFilterSeverity('ALL'); setFilterType('ALL')
        setCurrentPage(1)
        dispatch(HandleGetAllDriftEvents({ page: 1, limit: 20 }))
    }

    const handleConfirmModal = (note) => {
        if (!modalDrift) return
        const thunk = modalMode === 'resolve' ? HandleResolveDrift : HandleDismissDrift
        dispatch(thunk({ driftID: modalDrift._id, resolutionNote: note })).then(() => {
            setModalDrift(null); setModalMode(null)
            dispatch(HandleGetDriftSummary())
            fetchDrifts(currentPage)
        })
    }

    const drifts     = state?.drifts     || []
    const pagination = state?.pagination || { totalPages: 0, total: 0, limit: 20 }
    const summary    = state?.summary    || { total: 0, open: 0, resolved: 0, dismissed: 0, critical: 0, high: 0 }

    return (
        <div className="access-drift-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-bold">Access Drift Detection</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Monitor and investigate unusual or out-of-policy employee access patterns
                </p>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard label="Total Events"  value={summary.total}     color="border-gray-200 bg-gray-50"    icon="📋" />
                <StatCard label="Open"          value={summary.open}      color="border-red-200 bg-red-50"      icon="🔴" />
                <StatCard label="Resolved"      value={summary.resolved}  color="border-green-200 bg-green-50"  icon="✅" />
                <StatCard label="Dismissed"     value={summary.dismissed} color="border-gray-200 bg-gray-50"    icon="🗑️" />
                <StatCard label="Critical"      value={summary.critical}  color="border-red-300 bg-red-100"     icon="🚨" />
                <StatCard label="High"          value={summary.high}      color="border-orange-200 bg-orange-50" icon="⚠️" />
            </div>

            {/* ── Filters ── */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200">
                        <option value="ALL">All statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="DISMISSED">Dismissed</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Severity</label>
                    <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200">
                        <option value="ALL">All severities</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-500">Drift Type</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200">
                        <option value="ALL">All types</option>
                        {Object.entries(DRIFT_TYPE_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2 pb-0.5">
                    <button onClick={handleApply} className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">Apply</button>
                    <button onClick={handleClear} className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-100">Clear</button>
                </div>
            </div>

            {/* ── Events list ── */}
            <div className="flex flex-col gap-2 overflow-auto flex-1">
                {/* Table header */}
                <div className="grid grid-cols-12 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-1">Sev.</span>
                    <span className="col-span-2">Employee</span>
                    <span className="col-span-2">Type</span>
                    <span className="col-span-4">Description</span>
                    <span className="col-span-1">Status</span>
                    <span className="col-span-2 text-right">Actions</span>
                </div>

                {state.isLoading && <Loading />}

                {!state.isLoading && drifts.length === 0 && (
                    <div className="text-center text-gray-400 py-16 flex flex-col items-center gap-2">
                        <span className="text-4xl">🛡️</span>
                        <p className="font-medium">No drift events found</p>
                        <p className="text-sm">Access drift events are automatically detected and will appear here.</p>
                    </div>
                )}

                {!state.isLoading && drifts.map((drift) => {
                    const sev = SEVERITY_STYLES[drift.severity] || SEVERITY_STYLES.LOW
                    const isOpen = drift.status === 'OPEN'
                    return (
                        <div key={drift._id}
                            className={`grid grid-cols-12 bg-white border rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all ${isOpen ? sev.border : 'border-gray-200'}`}>
                            <span className="col-span-1">
                                <SeverityBadge severity={drift.severity} />
                            </span>
                            <span className="col-span-2">
                                <p className="font-medium text-gray-800 truncate">{drift.employeeName}</p>
                                <p className="text-xs text-gray-400 truncate">{drift.employeeDepartment}</p>
                            </span>
                            <span className="col-span-2 flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                <span>{DRIFT_TYPE_ICONS[drift.driftType]}</span>
                                <span className="truncate">{DRIFT_TYPE_LABELS[drift.driftType]}</span>
                            </span>
                            <span className="col-span-4 text-xs text-gray-500 truncate pr-2">
                                {drift.description}
                                <span className="ml-2 text-gray-400">{relativeTime(drift.createdAt)}</span>
                            </span>
                            <span className="col-span-1">
                                <StatusBadge status={drift.status} />
                            </span>
                            <span className="col-span-2 flex gap-1 justify-end flex-wrap">
                                <button
                                    onClick={() => setEvidenceDrift(drift)}
                                    className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600"
                                >
                                    Details
                                </button>
                                {isOpen && (
                                    <>
                                        <button
                                            onClick={() => { setModalDrift(drift); setModalMode('resolve') }}
                                            className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Resolve
                                        </button>
                                        <button
                                            onClick={() => { setModalDrift(drift); setModalMode('dismiss') }}
                                            className="px-2 py-1 text-xs border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-100"
                                        >
                                            Dismiss
                                        </button>
                                    </>
                                )}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* ── Pagination ── */}
            {pagination?.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * pagination.limit) + 1}–{Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} events
                    </span>
                    <div className="flex gap-1">
                        <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); fetchDrifts(currentPage - 1) }}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">← Prev</button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const p = Math.max(1, currentPage - 2) + i
                            if (p > pagination.totalPages) return null
                            return (
                                <button key={p} onClick={() => { setCurrentPage(p); fetchDrifts(p) }}
                                    className={`px-3 py-1.5 text-sm border rounded-lg ${p === currentPage ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                                    {p}
                                </button>
                            )
                        })}
                        <button disabled={currentPage === pagination.totalPages} onClick={() => { setCurrentPage(p => p + 1); fetchDrifts(currentPage + 1) }}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next →</button>
                    </div>
                </div>
            )}

            {/* ── Modals ── */}
            {modalDrift && (
                <ResolutionModal
                    drift={modalDrift}
                    mode={modalMode}
                    onConfirm={handleConfirmModal}
                    onClose={() => { setModalDrift(null); setModalMode(null) }}
                />
            )}
            {evidenceDrift && (
                <EvidencePanel
                    drift={evidenceDrift}
                    onClose={() => setEvidenceDrift(null)}
                />
            )}
        </div>
    )
}
