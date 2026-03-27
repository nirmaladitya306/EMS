import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetMyAttendance,
    HandleInitializeMyAttendance,
    HandleMarkAttendance,
    HandleGetEmployeeProfile
} from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const StatusBadge = ({ status }) => {
    const map = {
        Present:        'bg-green-100  text-green-800  border-green-300',
        Absent:         'bg-red-100    text-red-800    border-red-300',
        'Not Specified':'bg-gray-100   text-gray-600   border-gray-300',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>{status}</span>
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
    }, [])
    useEffect(() => { dispatch(HandleGetMyAttendance()) }, [])
    useEffect(() => { if (state.fetchAttendance) dispatch(HandleGetMyAttendance()) }, [state.fetchAttendance])

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

    const todayLog   = attendance?.attendancelog?.find(l => l.logdate?.split('T')[0] === today)
    const logs       = [...(attendance?.attendancelog || [])].reverse()
    const presentCt  = attendance?.attendancelog?.filter(l => l.logstatus === 'Present').length  || 0
    const absentCt   = attendance?.attendancelog?.filter(l => l.logstatus === 'Absent').length   || 0
    const totalDays  = attendance?.attendancelog?.length || 0
    const rate       = totalDays ? Math.round((presentCt / totalDays) * 100) : 0

    if (state.isLoading && !attendance && attendance !== null) return <Loading />

    return (
        <div className="my-attendance-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            <div>
                <h1 className="text-3xl font-bold">My Attendance</h1>
                <p className="text-sm text-gray-500 mt-1">Track your daily attendance</p>
            </div>

            {/* No attendance record yet */}
            {!attendance ? (
                <div className="flex flex-col items-center justify-center gap-4 py-16 border-2 border-dashed border-gray-200 rounded-2xl">
                    <p className="text-gray-400 text-sm">Your attendance record hasn't been initialized yet.</p>
                    <button onClick={handleInitialize}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg">
                        Initialize Attendance
                    </button>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Total Days',        value: totalDays,    color: 'border-gray-200   bg-gray-50'   },
                            { label: 'Present',           value: presentCt,    color: 'border-green-200  bg-green-50'  },
                            { label: 'Absent',            value: absentCt,     color: 'border-red-200    bg-red-50'    },
                            { label: 'Attendance Rate',   value: `${rate}%`,   color: 'border-purple-200 bg-purple-50' },
                        ].map(c => (
                            <div key={c.label} className={`rounded-xl border p-4 flex flex-col gap-1 ${c.color}`}>
                                <span className="text-2xl font-bold">{c.value}</span>
                                <span className="text-sm text-gray-500">{c.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Mark today */}
                    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Mark Today's Attendance</p>
                            <p className="text-xs text-gray-400">{fmtDate(today)}</p>
                            {todayLog && (
                                <p className="text-xs text-purple-600 mt-1">
                                    Already marked as <strong>{todayLog.logstatus}</strong> — you can update it
                                </p>
                            )}
                        </div>
                        <select value={markStatus} onChange={e => setMarkStatus(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300">
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Not Specified">Not Specified</option>
                        </select>
                        <button onClick={handleMark}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg">
                            {todayLog ? 'Update' : 'Mark'}
                        </button>
                    </div>

                    {/* Log */}
                    <div className="flex flex-col gap-2 overflow-auto flex-1">
                        <div className="grid grid-cols-2 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                            <span>Date</span>
                            <span>Status</span>
                        </div>
                        {logs.length === 0
                            ? <div className="text-center text-gray-400 py-10">No log entries yet.</div>
                            : logs.map((l, i) => (
                                <div key={i} className="grid grid-cols-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm items-center hover:bg-gray-50">
                                    <span className="text-gray-600">{fmtDate(l.logdate)}</span>
                                    <StatusBadge status={l.logstatus} />
                                </div>
                            ))
                        }
                    </div>
                </>
            )}
        </div>
    )
}