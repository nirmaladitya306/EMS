import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllAttendances, HandleDeleteAttendance } from '../../../redux/Thunks/AttendanceThunk'
import { Loading } from '../../../components/common/loading'

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const StatusBadge = ({ status }) => {
    const map = {
        Present: 'bg-green-100 text-green-800 border-green-300',
        Absent: 'bg-red-100 text-red-800 border-red-300',
        'Not Specified': 'bg-gray-100 text-gray-600 border-gray-300',
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>
            {status}
        </span>
    )
}

const SummaryCard = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-xl font-bold">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

const LogDialog = ({ open, record, onClose }) => {
    if (!open || !record) return null

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 max-h-[80vh] flex flex-col">
                <h2 className="text-xl font-bold mb-1">Attendance Log</h2>
                <p className="text-sm text-gray-500 mb-4">
                    {record.employee?.firstname} {record.employee?.lastname}
                </p>

                <div className="overflow-auto flex-1 flex flex-col gap-2">
                    {(record.attendancelog || []).length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">No log entries.</p>
                    ) : (
                        [...record.attendancelog].reverse().map((log, i) => (
                            <div key={i} className="flex justify-between items-center border rounded-lg px-3 py-2 text-sm">
                                <span className="text-gray-600">{fmtDate(log.logdate)}</span>
                                <StatusBadge status={log.logstatus} />
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-end mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export const AttendancePage = () => {
    const dispatch = useDispatch()
    const state = useSelector(s => s.AttendanceReducer)

    const [logTarget, setLogTarget] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        dispatch(HandleGetAllAttendances())
    }, [dispatch])

    useEffect(() => {
        if (state.fetchData) dispatch(HandleGetAllAttendances())
    }, [state.fetchData, dispatch])

    const handleDelete = (attendanceID) => {
        if (window.confirm('Delete this attendance record?')) {
            dispatch(HandleDeleteAttendance({ attendanceID }))
        }
    }

    const filtered = (state.data || []).filter(a => {
        const name = `${a.employee?.firstname || ''} ${a.employee?.lastname || ''}`.toLowerCase()
        return name.includes(search.toLowerCase())
    })

    const total = state.data?.length || 0
    const presentCount = state.data?.filter(a => a.status === 'Present').length || 0
    const absentCount = state.data?.filter(a => a.status === 'Absent').length || 0
    const notSpecified = state.data?.filter(a => a.status === 'Not Specified').length || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>

            {/* ✅ FIXED HEADER (no extra div) */}
            <PageHeader
                eyebrow="Operations"
                title="Attendance"
                subtitle="View employee attendance records and daily logs"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label="Total Records" value={total} color="border-gray-200 bg-gray-50" />
                <SummaryCard label="Present" value={presentCount} color="border-green-200 bg-green-50" />
                <SummaryCard label="Absent" value={absentCount} color="border-red-200 bg-red-50" />
                <SummaryCard label="Not Specified" value={notSpecified} color="border-yellow-200 bg-yellow-50" />
            </div>

            <input
                type="text"
                placeholder="Search by employee name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-6 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Employee</span>
                    <span>Status</span>
                    <span>Logs</span>
                    <span>Updated</span>
                    <span>Actions</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-16">No attendance records found.</div>
                ) : (
                    filtered.map(a => (
                        <div key={a._id} className="grid grid-cols-6 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50">
                            <div className="col-span-2 font-medium">
                                {a.employee?.firstname} {a.employee?.lastname}
                            </div>

                            <StatusBadge status={a.status} />
                            <span>{a.attendancelog?.length || 0}</span>
                            <span className="text-xs">{fmtDate(a.updatedAt)}</span>

                            <div className="flex gap-2">
                                <button onClick={() => setLogTarget(a)} className="px-3 py-1 text-xs border border-indigo-200 text-indigo-600 rounded-md">
                                    View
                                </button>
                                <button onClick={() => handleDelete(a._id)} className="px-3 py-1 text-xs border border-red-400 text-red-600 rounded-md">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <LogDialog open={!!logTarget} record={logTarget} onClose={() => setLogTarget(null)} />

        </PageShell>
    )
}