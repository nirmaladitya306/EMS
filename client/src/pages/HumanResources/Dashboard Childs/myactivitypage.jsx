import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyActivity } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Action styles ────────────────────────────────────────────────────────────
const ACTION_STYLES = {
    LOGIN:            { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
    LOGOUT:           { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
    LEAVE_CREATED:    { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500' },
    LEAVE_APPROVED:   { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
    LEAVE_REJECTED:   { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-500'    },
    EMPLOYEE_UPDATED: { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-400'   },
    ATTENDANCE_UPDATED:{ bg: 'bg-blue-100',  text: 'text-blue-800',   dot: 'bg-blue-400'   },
}
const getStyle = (action) =>
    ACTION_STYLES[action] || { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-400' }

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

// ─── Relative time ────────────────────────────────────────────────────────────
const relativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const MyActivityPage = () => {
    const dispatch     = useDispatch()
    const state        = useSelector(s => s.EmployeeDashboardReducer)
    const activitylogs = state.activitylogs || []

    const [filterAction, setFilterAction] = useState('')
    const [search,       setSearch]       = useState('')

    useEffect(() => { dispatch(HandleGetMyActivity()) }, [])
    useEffect(() => {
        if (state.fetchActivity) dispatch(HandleGetMyActivity())
    }, [state.fetchActivity])

    // Unique action types from logs for the filter dropdown
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
        <div className="my-activity-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">My Activity</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        A history of all actions you've performed in the system
                    </p>
                </div>
                <div className="bg-indigo-50 border border-purple-200 rounded-xl px-4 py-2 text-center">
                    <span className="text-2xl font-bold text-indigo-700">{activitylogs.length}</span>
                    <p className="text-xs text-gray-500">Total Actions</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    placeholder="Search activity..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <select
                    value={filterAction}
                    onChange={e => setFilterAction(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                >
                    <option value="">All actions</option>
                    {uniqueActions.map(a => (
                        <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                    ))}
                </select>
                {(filterAction || search) && (
                    <button
                        onClick={() => { setFilterAction(''); setSearch('') }}
                        className="text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Activity list */}
            <div className="flex flex-col gap-2 overflow-auto flex-1">

                {/* Table header */}
                <div className="grid grid-cols-12 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-3">Action</span>
                    <span className="col-span-7">Description</span>
                    <span className="col-span-2 text-right">Time</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-16">
                        {activitylogs.length === 0
                            ? 'No activity recorded yet. Your actions in the system will appear here.'
                            : 'No matching activity found.'
                        }
                    </div>
                ) : (
                    filtered.map(log => (
                        <div
                            key={log._id}
                            className="grid grid-cols-12 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-indigo-50 hover:border-purple-200 transition-all"
                        >
                            <span className="col-span-3">
                                <ActionBadge action={log.action} />
                            </span>
                            <span className="col-span-7 text-gray-500 text-xs truncate pr-4">
                                {log.description}
                            </span>
                            <span className="col-span-2 text-xs text-gray-400 text-right whitespace-nowrap">
                                {relativeTime(log.createdAt)}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                Showing last 100 actions. Older records are archived automatically.
            </p>
        </div>
    )
}