import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyTimeline } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Icon map per event type ──────────────────────────────────────────────────
const EVENT_STYLES = {
    HIRED:              { bg: 'bg-green-100',  border: 'border-green-400',  dot: 'bg-green-500',  text: 'text-green-800',  icon: '🎉' },
    PROMOTED:           { bg: 'bg-blue-100',   border: 'border-blue-400',   dot: 'bg-blue-500',   text: 'text-blue-800',   icon: '🚀' },
    DEPARTMENT_CHANGE:  { bg: 'bg-yellow-100', border: 'border-yellow-400', dot: 'bg-yellow-500', text: 'text-yellow-800', icon: '🏢' },
    SALARY_UPDATED:     { bg: 'bg-emerald-100',border: 'border-emerald-400',dot: 'bg-emerald-500',text: 'text-emerald-800',icon: '💰' },
    ROLE_CHANGED:       { bg: 'bg-purple-100', border: 'border-indigo-300', dot: 'bg-indigo-500', text: 'text-purple-800', icon: '🔄' },
    LEAVE_APPROVED:     { bg: 'bg-teal-100',   border: 'border-teal-400',   dot: 'bg-teal-500',   text: 'text-teal-800',   icon: '✅' },
    DOCUMENT_ADDED:     { bg: 'bg-orange-100', border: 'border-orange-400', dot: 'bg-orange-500', text: 'text-orange-800', icon: '📄' },
    NOTICE_ISSUED:      { bg: 'bg-red-100',    border: 'border-red-400',    dot: 'bg-red-500',    text: 'text-red-800',    icon: '📢' },
    PROFILE_UPDATED:    { bg: 'bg-indigo-100', border: 'border-indigo-400', dot: 'bg-indigo-500', text: 'text-indigo-800', icon: '✏️' },
    TERMINATED:         { bg: 'bg-gray-100',   border: 'border-gray-400',   dot: 'bg-gray-500',   text: 'text-gray-800',   icon: '🔒' },
}

const getStyle = (type) =>
    EVENT_STYLES[type] || { bg: 'bg-purple-100', border: 'border-indigo-300', dot: 'bg-indigo-500', text: 'text-purple-800', icon: '📌' }

// ─── Format date ──────────────────────────────────────────────────────────────
const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

// ─── Single timeline event card ───────────────────────────────────────────────
const TimelineEvent = ({ event, isLast }) => {
    const s = getStyle(event.type)
    return (
        <div className="flex gap-4">
            {/* Stem + dot */}
            <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 ${s.border} ${s.bg} shrink-0`}>
                    {s.icon}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
            </div>

            {/* Card */}
            <div className={`mb-6 flex-1 rounded-xl border ${s.border} ${s.bg} px-4 py-3 shadow-sm`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${s.text}`}>
                        {event.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(event.date || event.createdAt)}
                    </span>
                </div>
                {event.description && (
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                )}
                {event.details && Object.keys(event.details).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(event.details).map(([k, v]) => (
                            <span key={k} className="text-xs bg-white/70 border border-gray-200 rounded-md px-2 py-0.5 text-gray-600">
                                <span className="font-medium capitalize">{k.replace(/_/g, ' ')}: </span>{String(v)}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyTimeline = () => (
    <div className="flex flex-col items-center justify-center py-24 text-center text-gray-400 gap-3">
        <span className="text-5xl">🗓️</span>
        <p className="text-lg font-semibold text-gray-500">No timeline events yet</p>
        <p className="text-sm max-w-xs">
            Your career milestones — promotions, department changes, salary updates — will appear here as they happen.
        </p>
    </div>
)

// ─── Main page ────────────────────────────────────────────────────────────────
export const MyTimelinePage = () => {
    const dispatch  = useDispatch()
    const state     = useSelector(s => s.EmployeeDashboardReducer)
    const timeline  = state.timeline

    useEffect(() => { dispatch(HandleGetMyTimeline()) }, [])
    useEffect(() => {
        if (state.fetchTimeline) dispatch(HandleGetMyTimeline())
    }, [state.fetchTimeline])

    if (state.isLoading && !timeline) return <Loading />

    const events = timeline?.events || []

    return (
        <div className="my-timeline-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">My Timeline</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        A chronological record of your career journey
                    </p>
                </div>
                <div className="bg-indigo-50 border border-purple-200 rounded-xl px-4 py-2 text-center">
                    <span className="text-2xl font-bold text-indigo-700">{events.length}</span>
                    <p className="text-xs text-gray-500">Total Events</p>
                </div>
            </div>

            {/* Profile summary strip */}
            {timeline?.employee && (
                <div className="bg-indigo-50 border border-purple-200 rounded-xl px-5 py-3 flex flex-wrap gap-4 items-center">
                    <div>
                        <p className="font-semibold text-purple-800 text-sm">
                            {timeline.employee.firstname} {timeline.employee.lastname}
                        </p>
                        <p className="text-xs text-gray-500">{timeline.employee.email}</p>
                    </div>
                    {timeline.employee.department?.name && (
                        <span className="text-xs bg-white border border-purple-200 text-indigo-700 rounded-full px-3 py-1">
                            🏢 {timeline.employee.department.name}
                        </span>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div className="flex-1 overflow-auto">
                {events.length === 0
                    ? <EmptyTimeline />
                    : (
                        <div className="pt-2">
                            {events.map((event, i) => (
                                <TimelineEvent
                                    key={event._id || i}
                                    event={event}
                                    isLast={i === events.length - 1}
                                />
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    )
}