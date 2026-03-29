import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyDriftEvents } from '../../../redux/Thunks/AccessDriftThunk'
import { Loading } from '../../../components/common/loading'

// ─── Config ───────────────────────────────────────────────────────────────────
const SEVERITY_STYLES = {
    CRITICAL: { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-600',    border: 'border-red-300'   },
    HIGH:     { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', border: 'border-orange-300'},
    MEDIUM:   { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', border: 'border-yellow-300'},
    LOW:      { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400',   border: 'border-blue-300'  },
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

const DRIFT_TYPE_TIPS = {
    UNUSUAL_LOGIN_TIME:        'Your account was accessed at an unusual time. If this wasn't you, please reset your password.',
    HIGH_FREQUENCY_ACTIONS:    'An unusually high number of actions were recorded from your account. Please verify you weren't impersonated.',
    SENSITIVE_ENDPOINT_ACCESS: 'Your session attempted to access a restricted area. Contact HR if this was unexpected.',
    BULK_OPERATION:            'Multiple bulk operations were performed from your account in a short window.',
    OFF_HOURS_ACTIVITY:        'System activity was recorded from your account on a weekend. This may be routine — no action needed if expected.',
    REPEATED_FAILED_ACCESS:    'Multiple access-denied events were logged for your account.',
    UNUSUAL_ACTION_PATTERN:    'An unusual pattern of actions was detected from your account.',
}

const relativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const SeverityBadge = ({ severity }) => {
    const s = SEVERITY_STYLES[severity] || SEVERITY_STYLES.LOW
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
            <span className={`w-2 h-2 rounded-full ${s.dot}`} />
            {severity}
        </span>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export const MyAccessDriftPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.AccessDriftReducer)
    const drifts   = state?.myDrifts || []

    const [filterStatus,   setFilterStatus]   = useState('ALL')
    const [expandedDrift,  setExpandedDrift]  = useState(null)

    useEffect(() => { dispatch(HandleGetMyDriftEvents()) }, [])

    const filtered = drifts.filter(d => filterStatus === 'ALL' || d.status === filterStatus)

    const openCount     = drifts.filter(d => d.status === 'OPEN').length
    const resolvedCount = drifts.filter(d => d.status === 'RESOLVED').length
    const criticalCount = drifts.filter(d => d.status === 'OPEN' && d.severity === 'CRITICAL').length

    if (state.isLoading && !drifts.length) return <Loading />

    return (
        <div className="my-access-drift-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* ── Header ── */}
            <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">My Security Flags</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Access drift alerts flagged on your account by the security system
                    </p>
                </div>
                {criticalCount > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
                        <span className="text-xl">🚨</span>
                        <div>
                            <p className="text-sm font-bold text-red-700">{criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}</p>
                            <p className="text-xs text-red-500">Please review with your HR team</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Stats strip ── */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                    <p className="text-2xl font-bold">{drifts.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total Flags</p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                    <p className="text-2xl font-bold text-red-700">{openCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Open</p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">{resolvedCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Resolved by HR</p>
                </div>
            </div>

            {/* ── Info banner ── */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-800 flex gap-3 items-start">
                <span className="text-lg mt-0.5">ℹ️</span>
                <p>
                    These flags are automatically generated when our security system detects unusual patterns in your account activity.
                    Most flags are informational — your HR team reviews all open alerts. If you see a critical flag you didn't cause, please contact HR immediately.
                </p>
            </div>

            {/* ── Filter ── */}
            <div className="flex gap-2 items-center flex-wrap">
                {['ALL', 'OPEN', 'RESOLVED', 'DISMISSED'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${filterStatus === s ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                        {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {/* ── Events list ── */}
            <div className="flex flex-col gap-3 overflow-auto flex-1">
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-16 flex flex-col items-center gap-2">
                        <span className="text-5xl">🛡️</span>
                        <p className="font-medium text-gray-500">
                            {drifts.length === 0 ? 'No security flags on your account' : 'No flags match the current filter'}
                        </p>
                        <p className="text-sm">Your account activity looks clean.</p>
                    </div>
                ) : (
                    filtered.map(drift => {
                        const sev       = SEVERITY_STYLES[drift.severity] || SEVERITY_STYLES.LOW
                        const isExpanded = expandedDrift === drift._id
                        const isOpen    = drift.status === 'OPEN'

                        return (
                            <div
                                key={drift._id}
                                className={`bg-white border rounded-xl overflow-hidden transition-all ${isOpen ? sev.border : 'border-gray-200'}`}
                            >
                                {/* Card header */}
                                <div
                                    className="flex items-start gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50"
                                    onClick={() => setExpandedDrift(isExpanded ? null : drift._id)}
                                >
                                    <span className="text-2xl mt-0.5">{DRIFT_TYPE_ICONS[drift.driftType]}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <p className="font-semibold text-gray-800">{DRIFT_TYPE_LABELS[drift.driftType]}</p>
                                            <SeverityBadge severity={drift.severity} />
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                                drift.status === 'OPEN' ? 'bg-red-50 text-red-700 border-red-200'
                                                : drift.status === 'RESOLVED' ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                            }`}>{drift.status}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">{drift.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-gray-400">{relativeTime(drift.createdAt)}</p>
                                        <p className="text-xs text-gray-400 mt-1">{isExpanded ? '▲' : '▼'}</p>
                                    </div>
                                </div>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 flex flex-col gap-4">
                                        {/* Tip */}
                                        <div className={`rounded-xl p-3 text-sm border ${sev.bg} ${sev.text} ${sev.border}`}>
                                            💡 <strong>What this means: </strong>{DRIFT_TYPE_TIPS[drift.driftType]}
                                        </div>

                                        {/* Evidence */}
                                        {drift.evidence?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Evidence ({drift.evidence.length} entries)</p>
                                                <div className="flex flex-col gap-1.5">
                                                    {drift.evidence.map((ev, i) => (
                                                        <div key={i} className="text-xs bg-white border border-gray-200 rounded-lg p-2.5 text-gray-600 flex justify-between">
                                                            <span className="font-medium text-gray-800">{ev.action?.replace(/_/g, ' ')} {ev.endpoint && <span className="font-mono text-gray-400 ml-1">{ev.endpoint}</span>}</span>
                                                            <span className="text-gray-400 shrink-0 ml-2">{relativeTime(ev.timestamp)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Resolution info */}
                                        {drift.status !== 'OPEN' && (
                                            <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-600">
                                                <span className="font-medium">{drift.status === 'RESOLVED' ? '✅ Resolved' : '🗑️ Dismissed'}</span>
                                                {drift.resolvedByName && <span className="text-gray-500"> by {drift.resolvedByName}</span>}
                                                {drift.resolutionNote && <p className="mt-1 text-gray-400 italic">"{drift.resolutionNote}"</p>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                Showing last 50 security flags. Older records are archived automatically.
            </p>
        </div>
    )
}
