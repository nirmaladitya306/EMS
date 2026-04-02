import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk.js'
import { HandleGetEmployeeTimelineByHR } from '../../../redux/Thunks/HREmployeesThunk.js'
import { Loading } from '../../../components/common/loading'

// ─── Event type → visual config ───────────────────────────────────────────────
const EVENT_CONFIG = {
    HIRED:             { color: '#059669', bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.2)',  icon: '🎉' },
    PROMOTED:          { color: '#6366f1', bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.2)',  icon: '🚀' },
    DEPARTMENT_CHANGE: { color: '#b45309', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)',  icon: '🏢' },
    SALARY_UPDATED:    { color: '#059669', bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.2)',  icon: '💰' },
    ROLE_CHANGED:      { color: '#7c3aed', bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.2)',  icon: '🔄' },
    LEAVE_APPROVED:    { color: '#0d9488', bg: 'rgba(20,184,166,0.07)', border: 'rgba(20,184,166,0.2)',  icon: '✅' },
    DOCUMENT_ADDED:    { color: '#c2410c', bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)',  icon: '📄' },
    NOTICE_ISSUED:     { color: '#dc2626', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.18)',  icon: '📢' },
    PROFILE_UPDATED:   { color: '#4f46e5', bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.2)',  icon: '✏️' },
    TERMINATED:        { color: '#374151', bg: 'rgba(0,0,0,0.04)',       border: 'rgba(0,0,0,0.12)',      icon: '🔒' },
}
const getConfig = (type) => EVENT_CONFIG[type] || { color: '#6366f1', bg: 'rgba(99,102,241,0.07)', border: 'rgba(99,102,241,0.2)', icon: '📌' }

const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── Picker bar ── */
  .tl-picker { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; flex-shrink: 0; }
  .tl-picker-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 180px; }
  .tl-picker-label {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: rgba(0,0,0,0.3);
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Employee info strip ── */
  .tl-emp-strip {
    background: rgba(99,102,241,0.04); border: 1px solid rgba(99,102,241,0.12);
    border-radius: 14px; padding: 14px 18px;
    display: flex; flex-wrap: wrap; gap: 14px; align-items: center; flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }
  .tl-emp-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 15px; font-weight: 700; flex-shrink: 0;
    font-family: 'DM Serif Display', serif;
  }
  .tl-emp-name { font-size: 14px; font-weight: 600; color: #0f172a; line-height: 1.2; }
  .tl-emp-email { font-size: 12px; color: rgba(0,0,0,0.4); font-weight: 300; }
  .tl-emp-chip {
    font-size: 11px; background: white; border: 1px solid rgba(99,102,241,0.15);
    color: rgba(99,102,241,0.8); border-radius: 100px; padding: 3px 10px;
    font-family: 'DM Sans', sans-serif;
  }
  .tl-event-count {
    margin-left: auto; text-align: right; flex-shrink: 0;
  }
  .tl-event-count-num {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem; color: #0f172a; line-height: 1; letter-spacing: -0.02em;
  }
  .tl-event-count-label {
    font-size: 10px; color: rgba(0,0,0,0.35); text-transform: uppercase; letter-spacing: 0.08em;
    font-weight: 600; font-family: 'DM Sans', sans-serif;
  }

  /* ── Timeline ── */
  .tl-scroll { flex: 1; overflow-y: auto; padding: 4px 2px; }
  .tl-event  { display: flex; gap: 14px; margin-bottom: 4px; font-family: 'DM Sans', sans-serif; }

  .tl-stem { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
  .tl-dot {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; border: 1px solid; flex-shrink: 0;
  }
  .tl-line { width: 1px; flex: 1; background: rgba(0,0,0,0.07); margin: 4px 0; min-height: 16px; }

  .tl-card {
    flex: 1; border-radius: 14px; border: 1px solid;
    padding: 12px 14px; margin-bottom: 14px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .tl-card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .tl-card-type { font-size: 12px; font-weight: 600; letter-spacing: 0.02em; }
  .tl-card-date { font-size: 11px; color: rgba(0,0,0,0.35); white-space: nowrap; }
  .tl-card-desc { font-size: 13px; color: rgba(0,0,0,0.55); line-height: 1.5; font-weight: 300; }
  .tl-card-details { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }
  .tl-detail-pill {
    font-size: 11px; background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.08);
    border-radius: 6px; padding: 2px 8px; color: rgba(0,0,0,0.55);
    font-family: 'DM Sans', sans-serif;
  }
  .tl-detail-key { font-weight: 500; color: rgba(0,0,0,0.7); text-transform: capitalize; }

  /* ── Empty / prompt states ── */
  .tl-prompt {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px; padding: 60px 20px;
    color: rgba(0,0,0,0.3); text-align: center; flex: 1;
  }
  .tl-prompt-icon  { font-size: 3rem; }
  .tl-prompt-title { font-size: 14px; font-weight: 500; color: rgba(0,0,0,0.45); font-family: 'DM Sans', sans-serif; }
  .tl-prompt-sub   { font-size: 12px; color: rgba(0,0,0,0.28); max-width: 260px; line-height: 1.6; font-family: 'DM Sans', sans-serif; }
`

// ─── Single timeline event ────────────────────────────────────────────────────
const TimelineEvent = ({ event, isLast }) => {
    const c = getConfig(event.type)
    return (
        <div className="tl-event">
            <div className="tl-stem">
                <div className="tl-dot" style={{ background: c.bg, borderColor: c.border }}>
                    {c.icon}
                </div>
                {!isLast && <div className="tl-line" />}
            </div>
            <div className="tl-card" style={{ background: c.bg, borderColor: c.border }}>
                <div className="tl-card-header">
                    <span className="tl-card-type" style={{ color: c.color }}>
                        {event.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="tl-card-date">{fmtDate(event.date || event.createdAt)}</span>
                </div>
                {event.description && (
                    <p className="tl-card-desc">{event.description}</p>
                )}
                {event.details && Object.keys(event.details).length > 0 && (
                    <div className="tl-card-details">
                        {Object.entries(event.details).map(([k, v]) => (
                            <span key={k} className="tl-detail-pill">
                                <span className="tl-detail-key">{k.replace(/_/g, ' ')}: </span>{String(v)}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const EmployeeTimelinePage = () => {
    const dispatch       = useDispatch()
    const employeesState = useSelector(s => s.HREmployeesPageReducer)
    const employees      = employeesState.data || []
    const timeline       = employeesState.employeeTimeline
    const timelineLoading = employeesState.timelineLoading

    const [selectedId,   setSelectedId]   = useState('')
    const [searchFilter, setSearchFilter] = useState('')

    useEffect(() => { dispatch(HandleGetHREmployees({ apiroute: 'GETALL' })) }, [])

    const handleEmployeeChange = (e) => {
        const id = e.target.value
        setSelectedId(id)
        if (id) dispatch(HandleGetEmployeeTimelineByHR(id))
    }

    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.firstname} ${emp.lastname}`.toLowerCase()
        return fullName.includes(searchFilter.toLowerCase()) || emp.email?.toLowerCase().includes(searchFilter.toLowerCase())
    })

    const selectedEmployee = employees.find(e => e._id === selectedId)
    const selectedName     = selectedEmployee ? `${selectedEmployee.firstname} ${selectedEmployee.lastname}` : null
    const events           = timeline?.events || []
    const initials         = selectedEmployee
        ? `${selectedEmployee.firstname?.[0] || ''}${selectedEmployee.lastname?.[0] || ''}`.toUpperCase()
        : ''

    return (
        <>
            <style>{styles}</style>
            <PageShell>
                <PageHeader
                    eyebrow="People"
                    title="Employee Timeline"
                    subtitle="View the full career journey of any employee"
                />

                {/* ── Employee picker ── */}
                <div className="tl-picker">
                    <div className="tl-picker-group">
                        <span className="tl-picker-label">Filter employees</span>
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={searchFilter}
                            onChange={e => setSearchFilter(e.target.value)}
                            className="pg-search"
                        />
                    </div>
                    <div className="tl-picker-group">
                        <span className="tl-picker-label">Select employee</span>
                        <select value={selectedId} onChange={handleEmployeeChange} className="pg-select">
                            <option value="">— Choose an employee —</option>
                            {filteredEmployees.map(emp => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.firstname} {emp.lastname} · {emp.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedId && (
                        <button className="pg-btn-ghost" onClick={() => { setSelectedId(''); setSearchFilter('') }}>
                            Clear
                        </button>
                    )}
                </div>

                {/* ── Selected employee strip ── */}
                {selectedEmployee && !timelineLoading && (
                    <div className="tl-emp-strip">
                        <div className="tl-emp-avatar">{initials}</div>
                        <div>
                            <p className="tl-emp-name">{selectedName}</p>
                            <p className="tl-emp-email">{selectedEmployee.email}</p>
                        </div>
                        {selectedEmployee.department?.name && (
                            <span className="tl-emp-chip">🏢 {selectedEmployee.department.name}</span>
                        )}
                        {selectedEmployee.role && (
                            <span className="tl-emp-chip">👤 {selectedEmployee.role}</span>
                        )}
                        <div className="tl-event-count">
                            <div className="tl-event-count-num">{events.length}</div>
                            <div className="tl-event-count-label">Events</div>
                        </div>
                    </div>
                )}

                {/* ── Timeline content ── */}
                <div className="tl-scroll">
                    {!selectedId && (
                        <div className="tl-prompt">
                            <span className="tl-prompt-icon">👤</span>
                            <p className="tl-prompt-title">Select an employee</p>
                            <p className="tl-prompt-sub">Choose an employee from the picker above to view their career timeline.</p>
                        </div>
                    )}

                    {selectedId && timelineLoading && <Loading />}

                    {selectedId && !timelineLoading && events.length === 0 && (
                        <div className="tl-prompt">
                            <span className="tl-prompt-icon">🗓️</span>
                            <p className="tl-prompt-title">No events recorded</p>
                            <p className="tl-prompt-sub">
                                {selectedName ? `${selectedName} has` : 'This employee has'} no timeline events yet.
                            </p>
                        </div>
                    )}

                    {selectedId && !timelineLoading && events.length > 0 && (
                        <div style={{ paddingTop: '4px' }}>
                            {events.map((event, i) => (
                                <TimelineEvent
                                    key={event._id || i}
                                    event={event}
                                    isLast={i === events.length - 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </PageShell>
        </>
    )
}
