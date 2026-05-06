import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyTimeline } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --mtl-bg: #18181b;
    --mtl-border: #27272a;
    --mtl-text-main: #fafafa;
    --mtl-text-muted: #a1a1aa;
    --mtl-text-faint: #71717a;
    --mtl-stem: rgba(255,255,255,0.1);
    
    --mtl-accent-bg: rgba(99,102,241,0.12);
    --mtl-accent-border: rgba(99,102,241,0.3);
    --mtl-accent-text: #818cf8;

    /* Semantic Overrides */
    --mtl-green-bg: rgba(16, 185, 129, 0.15);
    --mtl-green-border: rgba(16, 185, 129, 0.3);
    --mtl-green-text: #4ade80;

    --mtl-blue-bg: rgba(59, 130, 246, 0.15);
    --mtl-blue-border: rgba(59, 130, 246, 0.3);
    --mtl-blue-text: #60a5fa;

    --mtl-yellow-bg: rgba(245, 158, 11, 0.15);
    --mtl-yellow-border: rgba(245, 158, 11, 0.3);
    --mtl-yellow-text: #fbbf24;

    --mtl-red-bg: rgba(239, 68, 68, 0.15);
    --mtl-red-border: rgba(239, 68, 68, 0.3);
    --mtl-red-text: #f87171;
  }

  .mtl-event-hired { background: var(--mtl-green-bg, #f0fdf4); border-color: var(--mtl-green-border, #bbf7d0); color: var(--mtl-green-text, #166534); }
  .mtl-event-promo { background: var(--mtl-blue-bg, #eff6ff); border-color: var(--mtl-blue-border, #dbeafe); color: var(--mtl-blue-text, #1e40af); }
  .mtl-event-dept  { background: var(--mtl-yellow-bg, #fffbeb); border-color: var(--mtl-yellow-border, #fef3c7); color: var(--mtl-yellow-text, #92400e); }
  .mtl-event-warn  { background: var(--mtl-red-bg, #fef2f2); border-color: var(--mtl-red-border, #fecaca); color: var(--mtl-red-text, #991b1b); }
  .mtl-event-neutral { background: var(--mtl-bg, #f9fafb); border-color: var(--mtl-border, #e5e7eb); color: var(--mtl-text-main, #374151); }
`

// ─── Visual config mapping ────────────────────────────────────────────────────
const EVENT_STYLES = {
    HIRED:             { cls: 'mtl-event-hired', icon: '🎉' },
    PROMOTED:          { cls: 'mtl-event-promo', icon: '🚀' },
    DEPARTMENT_CHANGE: { cls: 'mtl-event-dept',  icon: '🏢' },
    SALARY_UPDATED:    { cls: 'mtl-event-hired', icon: '💰' },
    ROLE_CHANGED:      { cls: 'mtl-event-promo', icon: '🔄' },
    LEAVE_APPROVED:    { cls: 'mtl-event-hired', icon: '✅' },
    DOCUMENT_ADDED:    { cls: 'mtl-event-dept',  icon: '📄' },
    NOTICE_ISSUED:     { cls: 'mtl-event-warn',  icon: '📢' },
    PROFILE_UPDATED:   { cls: 'mtl-event-promo', icon: '✏️' },
    TERMINATED:        { cls: 'mtl-event-neutral', icon: '🔒' },
}

const getStyle = (type) => EVENT_STYLES[type] || { cls: 'mtl-event-promo', icon: '📌' }

const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

// ─── Single timeline event card ───────────────────────────────────────────────
const TimelineEvent = ({ event, isLast }) => {
    const s = getStyle(event.type)
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg border-2 shrink-0 ${s.cls}`}>
                    {s.icon}
                </div>
                {!isLast && <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: 'var(--mtl-stem, #e5e7eb)' }} />}
            </div>

            <div className={`mb-6 flex-1 rounded-xl border px-4 py-3 shadow-sm ${s.cls}`}>
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span className="text-sm font-bold" style={{ color: 'inherit' }}>
                        {event.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--mtl-text-faint, #9ca3af)' }}>
                        {formatDate(event.date || event.createdAt)}
                    </span>
                </div>
                {event.description && (
                    <p className="text-sm mt-1" style={{ color: 'var(--mtl-text-main, #4b5563)' }}>{event.description}</p>
                )}
                {event.details && Object.keys(event.details).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(event.details).map(([k, v]) => (
                            <span key={k} className="text-xs border rounded-md px-2 py-0.5" 
                                  style={{ background: 'var(--mtl-bg, rgba(255,255,255,0.7))', borderColor: 'var(--mtl-border, #e5e7eb)', color: 'var(--mtl-text-muted, #4b5563)' }}>
                                <span className="font-medium capitalize">{k.replace(/_/g, ' ')}: </span>{String(v)}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

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
        <PageShell>
            <style>{styles}</style>
            
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <PageHeader eyebrow="Overview" title="My Timeline" subtitle="A chronological record of your career journey" />
                </div>
                <div className="rounded-xl px-4 py-2 text-center border" 
                     style={{ background: 'var(--mtl-accent-bg, #f5f7ff)', borderColor: 'var(--mtl-accent-border, #e0e7ff)' }}>
                    <span className="text-2xl font-bold" style={{ color: 'var(--mtl-accent-text, #4338ca)' }}>{events.length}</span>
                    <p className="text-xs" style={{ color: 'var(--mtl-text-muted, #6b7280)' }}>Total Events</p>
                </div>
            </div>

            {timeline?.employee && (
                <div className="rounded-xl px-5 py-3 flex flex-wrap gap-4 items-center border"
                     style={{ background: 'var(--mtl-accent-bg, #f5f7ff)', borderColor: 'var(--mtl-accent-border, #e0e7ff)' }}>
                    <div>
                        <p className="font-semibold text-sm" style={{ color: 'var(--mtl-accent-text, #5b21b6)' }}>
                            {timeline.employee.firstname} {timeline.employee.lastname}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--mtl-text-muted, #6b7280)' }}>{timeline.employee.email}</p>
                    </div>
                    {timeline.employee.department?.name && (
                        <span className="text-xs border rounded-full px-3 py-1"
                              style={{ background: 'var(--mtl-bg, #ffffff)', borderColor: 'var(--mtl-accent-border, #e0e7ff)', color: 'var(--mtl-accent-text, #4338ca)' }}>
                            🏢 {timeline.employee.department.name}
                        </span>
                    )}
                </div>
            )}

            <div className="flex-1 overflow-auto">
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center gap-3" style={{ color: 'var(--mtl-text-faint, #9ca3af)' }}>
                        <span className="text-5xl">🗓️</span>
                        <p className="text-lg font-semibold" style={{ color: 'var(--mtl-text-muted, #6b7280)' }}>No timeline events yet</p>
                        <p className="text-sm max-w-xs">Your career milestones will appear here as they happen.</p>
                    </div>
                ) : (
                    <div className="pt-2">
                        {events.map((event, i) => (
                            <TimelineEvent key={event._id || i} event={event} isLast={i === events.length - 1} />
                        ))}
                    </div>
                )}
            </div>
        </PageShell>
    )
}