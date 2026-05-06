import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetMyAttendance,
    HandleInitializeMyAttendance,
    HandleMarkAttendance,
    HandleGetEmployeeProfile
} from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --myatt-pres-bg: rgba(16,185,129,0.15);
    --myatt-pres-color: #4ade80;
    --myatt-pres-border: rgba(16,185,129,0.3);

    --myatt-abs-bg: rgba(239,68,68,0.15);
    --myatt-abs-color: #f87171;
    --myatt-abs-border: rgba(239,68,68,0.3);

    --myatt-ns-bg: rgba(255,255,255,0.08);
    --myatt-ns-color: #a1a1aa;
    --myatt-ns-border: rgba(255,255,255,0.15);

    --myatt-edit-text: #818cf8;
    --myatt-empty-border: rgba(99,102,241,0.4);
    --myatt-text-muted: #a1a1aa;
  }
`

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const STATUS_CONFIG = {
    'Present':       { bg: 'var(--myatt-pres-bg, rgba(16,185,129,0.07))',  border: 'var(--myatt-pres-border, rgba(16,185,129,0.25))', color: 'var(--myatt-pres-color, #059669)' },
    'Absent':        { bg: 'var(--myatt-abs-bg, rgba(239,68,68,0.07))',   border: 'var(--myatt-abs-border, rgba(239,68,68,0.25))',  color: 'var(--myatt-abs-color, #dc2626)' },
    'Not Specified': { bg: 'var(--myatt-ns-bg, rgba(107,114,128,0.08))', border: 'var(--myatt-ns-border, rgba(107,114,128,0.28))', color: 'var(--myatt-ns-color, #4b5563)' },
}

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status]
    if (!cfg) return <span style={{ fontSize: 12, color: 'var(--myatt-text-muted, rgba(0,0,0,0.4))' }}>{status}</span>
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100, border: `1px solid ${cfg.border}`,
            fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color,
            fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

export const MyAttendancePage = () => {
    const dispatch   = useDispatch()
    const state      = useSelector(s => s.EmployeeDashboardReducer)
    const profile    = state.profile
    const attendance = state.attendance
    const employeeID = profile?._id

    const [markStatus, setMarkStatus] = useState('Present')
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => { if (!profile) dispatch(HandleGetEmployeeProfile()) }, [dispatch, profile])
    useEffect(() => { dispatch(HandleGetMyAttendance()) }, [dispatch])
    useEffect(() => { if (state.fetchAttendance) dispatch(HandleGetMyAttendance()) }, [state.fetchAttendance, dispatch])

    const handleInitialize = () => {
        if (!employeeID) return
        dispatch(HandleInitializeMyAttendance({ employeeID }))
    }

    const handleMark = () => {
        if (!attendance?._id) return
        dispatch(HandleMarkAttendance({ attendanceID: attendance._id, status: markStatus, currentdate: today }))
    }

    const logs       = attendance?.attendancelog ? [...attendance.attendancelog].reverse() : []
    const todayLog   = attendance?.attendancelog?.find(l => l.logdate?.split('T')[0] === today)
    const presentCt  = attendance?.attendancelog?.filter(l => l.logstatus === 'Present').length || 0
    const absentCt   = attendance?.attendancelog?.filter(l => l.logstatus === 'Absent').length  || 0
    const totalDays  = attendance?.attendancelog?.length || 0
    const rate       = totalDays ? Math.round((presentCt / totalDays) * 100) : 0

    if (state.isLoading && !attendance && attendance !== null) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>
                <PageHeader eyebrow="Work" title="My Attendance" subtitle="Track your daily attendance and check-in history" />

                {!attendance ? (
                    <div className="pg-empty" style={{ border: '2px dashed var(--myatt-empty-border, rgba(99,102,241,0.2))', borderRadius: 16 }}>
                        <span className="pg-empty-icon">📅</span>
                        <p className="pg-empty-title">Attendance not initialized</p>
                        <p className="pg-empty-sub" style={{ marginBottom: 8 }}>Start tracking your work days by initializing your record.</p>
                        <button onClick={handleInitialize} className="pg-btn-primary">Initialize Attendance</button>
                    </div>
                ) : (
                    <>
                        <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            {[
                                { label: 'Total Days', value: totalDays },
                                { label: 'Present',    value: presentCt },
                                { label: 'Absent',     value: absentCt  },
                                { label: 'Rate (%)',   value: `${rate}%` },
                            ].map(c => (
                                <div key={c.label} className="pg-stat-card">
                                    <span className="pg-stat-value">{c.value}</span>
                                    <span className="pg-stat-label">{c.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Mark attendance card — uses pg-section so it inherits dark mode */}
                        <div className="pg-section" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <div className="pg-td-name" style={{ fontSize: 15 }}>Mark Attendance</div>
                                <div className="pg-td-sub">{fmtDate(today)}</div>
                                {todayLog && (
                                    <div style={{ fontSize: 12, color: 'var(--myatt-edit-text, #6366f1)', marginTop: 4, fontWeight: 500 }}>
                                        Marked as {todayLog.logstatus} (Editable)
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <select
                                    value={markStatus}
                                    onChange={e => setMarkStatus(e.target.value)}
                                    className="pg-select"
                                    style={{ width: 150 }}
                                >
                                    <option value="Present">Present</option>
                                    <option value="Absent">Absent</option>
                                    <option value="Not Specified">Not Specified</option>
                                </select>
                                <button onClick={handleMark} className="pg-btn-primary">
                                    {todayLog ? 'Update Status' : 'Check In'}
                                </button>
                            </div>
                        </div>

                        <div className="pg-table-wrap">
                            <div className="pg-table-head grid grid-cols-2">
                                <span className="pg-th">Log Date</span>
                                <span className="pg-th">Status</span>
                            </div>
                            {logs.length === 0 ? (
                                <div className="pg-empty">
                                    <span className="pg-empty-icon">📂</span>
                                    <p className="pg-empty-title">No log entries</p>
                                    <p className="pg-empty-sub">Your daily check-ins will appear here.</p>
                                </div>
                            ) : (
                                logs.map((l, i) => (
                                    <div key={i} className="pg-table-row grid grid-cols-2 items-center">
                                        <span className="pg-td-muted" style={{ fontWeight: 500 }}>{fmtDate(l.logdate)}</span>
                                        <StatusBadge status={l.logstatus} />
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </PageShell>
        </>
    )
}