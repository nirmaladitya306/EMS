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

const fmtDate = (d) => {
    return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

const STATUS_CONFIG = {
    'Present':       { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.25)', color: '#059669' },
    'Absent':        { bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.25)',  color: '#dc2626' },
    'Not Specified': { bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.28)', color: '#4b5563' }
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  .at-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 100px; border: 1px solid;
    font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .at-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .at-mark-card {
    background: white; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 20px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between;
  }
`

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status]
    if (!cfg) return <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)' }}>{status}</span>
    return (
        <span className="at-status-badge" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
            <span className="at-status-dot" style={{ background: cfg.color }} />
            {status}
        </span>
    )
}

export const MyAttendancePage = () => {
    const dispatch    = useDispatch()
    const state       = useSelector(s => s.EmployeeDashboardReducer)
    const profile     = state.profile
    const attendance  = state.attendance
    const employeeID  = profile?._id

    const [markStatus, setMarkStatus] = useState('Present')
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => { 
        if (!profile) dispatch(HandleGetEmployeeProfile()) 
    }, [dispatch, profile])

    useEffect(() => { 
        dispatch(HandleGetMyAttendance()) 
    }, [dispatch])

    useEffect(() => { 
        if (state.fetchAttendance) dispatch(HandleGetMyAttendance()) 
    }, [state.fetchAttendance, dispatch])

    const handleInitialize = () => {
        if (!employeeID) return
        dispatch(HandleInitializeMyAttendance({ employeeID }))
    }

    const handleMark = () => {
        if (!attendance?._id) return
        dispatch(HandleMarkAttendance({
            attendanceID: attendance._id,
            status:       markStatus,
            currentdate:  today
        }))
    }

    const logs = attendance?.attendancelog ? [...attendance.attendancelog].reverse() : []
    const todayLog = attendance?.attendancelog?.find(l => l.logdate?.split('T')[0] === today)
    
    const presentCt = attendance?.attendancelog?.filter(l => l.logstatus === 'Present').length || 0
    const absentCt = attendance?.attendancelog?.filter(l => l.logstatus === 'Absent').length || 0
    const totalDays = attendance?.attendancelog?.length || 0
    const rate = totalDays ? Math.round((presentCt / totalDays) * 100) : 0

    if (state.isLoading && !attendance && attendance !== null) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>
                <PageHeader 
                    eyebrow="Work" 
                    title="My Attendance" 
                    subtitle="Track your daily attendance and check-in history" 
                />

                {!attendance ? (
                    <div className="pg-empty border-dashed border-2 py-16">
                        <span className="pg-empty-icon">📅</span>
                        <p className="pg-empty-title">Attendance not initialized</p>
                        <p className="pg-empty-sub mb-4">Start tracking your work days by initializing your record.</p>
                        <button onClick={handleInitialize} className="pg-btn-primary">
                            Initialize Attendance
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-4 gap-3 mb-5">
                            {[
                                { label: 'Total Days', value: totalDays },
                                { label: 'Present',    value: presentCt },
                                { label: 'Absent',     value: absentCt },
                                { label: 'Rate (%)',   value: `${rate}%` },
                            ].map(c => (
                                <div key={c.label} className="pg-stat-card">
                                    <span className="pg-stat-value">{c.value}</span>
                                    <span className="pg-stat-label">{c.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="at-mark-card">
                            <div>
                                <p className="pg-td-name" style={{ fontSize: '15px' }}>Mark Attendance</p>
                                <p className="pg-td-sub">{fmtDate(today)}</p>
                                {todayLog && (
                                    <p className="text-xs text-indigo-600 mt-1 font-medium">
                                        Marked as {todayLog.logstatus} (Editable)
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <select 
                                    value={markStatus} 
                                    onChange={e => setMarkStatus(e.target.value)}
                                    className="pg-input" 
                                    style={{ width: '140px', padding: '6px 12px' }}
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
                                        <span className="pg-td-muted font-medium">{fmtDate(l.logdate)}</span>
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