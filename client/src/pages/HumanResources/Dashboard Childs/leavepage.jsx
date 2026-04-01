import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllLeaves, HandleHRUpdateLeave } from '../../../redux/Thunks/LeaveThunk'
import { Loading } from '../../../components/common/loading'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const StatusBadge = ({ status }) => {
    const map = {
        Pending:  'bg-yellow-100 text-yellow-800 border-yellow-300',
        Approved: 'bg-green-100  text-green-800  border-green-300',
        Rejected: 'bg-red-100    text-red-800    border-red-300',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>{status}</span>
}

const SummaryCard = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-xl font-bold">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

const ApproveDialog = ({ open, leave, onClose, onSubmit, HRID }) => {
    const [status, setStatus] = useState('Approved')
    if (!open || !leave) return null
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h2 className="text-xl font-bold mb-4">Review Leave Request</h2>
                <div className="flex flex-col gap-2 text-sm text-gray-700 mb-5">
                    <p><span className="font-medium">Employee:</span> {leave.employee?.firstname} {leave.employee?.lastname}</p>
                    <p><span className="font-medium">Title:</span> {leave.title}</p>
                    <p><span className="font-medium">Reason:</span> {leave.reason}</p>
                    <p><span className="font-medium">From:</span> {fmtDate(leave.startdate)} &rarr; {fmtDate(leave.enddate)}</p>
                </div>
                <div className="mb-5">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Decision</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
                        <option value="Approved">Approve</option>
                        <option value="Rejected">Reject</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={() => onSubmit({ leaveID: leave._id, status, HRID })}
                        className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

export const LeavePage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.LeaveReducer)
    const HRState  = useSelector(s => s.HRReducer)
    const HRID     = HRState?.data?.HRid || HRState?.data?.data?._id || ''

    const [selected,     setSelected]     = useState(null)
    const [filterStatus, setFilterStatus] = useState('All')
    const [search,       setSearch]       = useState('')

    useEffect(() => { dispatch(HandleGetAllLeaves()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllLeaves()) }, [state.fetchData])

    const handleApprove = (payload) => {
        dispatch(HandleHRUpdateLeave(payload))
        setSelected(null)
    }

    const filtered = (state.data || []).filter(l => {
        const name = `${l.employee?.firstname || ''} ${l.employee?.lastname || ''}`.toLowerCase()
        const matchSearch = name.includes(search.toLowerCase())
        const matchStatus = filterStatus === 'All' || l.status === filterStatus
        return matchSearch && matchStatus
    })

    const total    = state.data?.length || 0
    const pending  = state.data?.filter(l => l.status === 'Pending').length  || 0
    const approved = state.data?.filter(l => l.status === 'Approved').length || 0
    const rejected = state.data?.filter(l => l.status === 'Rejected').length || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>

            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <PageHeader eyebrow="Operations" title="Leave Management" subtitle="Review and approve employee leave requests" />
                    <p className="text-sm text-gray-500 mt-1">Review and approve employee leave requests</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label="Total"    value={total}    color="border-gray-200  bg-gray-50"   />
                <SummaryCard label="Pending"  value={pending}  color="border-yellow-200 bg-yellow-50" />
                <SummaryCard label="Approved" value={approved} color="border-green-200  bg-green-50"  />
                <SummaryCard label="Rejected" value={rejected} color="border-red-200    bg-red-50"    />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <input type="text" placeholder="Search by employee name..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                {['All', 'Pending', 'Approved', 'Rejected'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}`}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-7 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Employee</span>
                    <span className="col-span-2">Title</span>
                    <span>Duration</span>
                    <span>Status</span>
                    <span>Action</span>
                </div>

                {filtered.length === 0
                    ? <div className="text-center text-gray-400 py-16">No leave records found.</div>
                    : filtered.map(l => (
                        <div key={l._id} className="grid grid-cols-7 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                            <div className="col-span-2">
                                <p className="font-medium">{l.employee?.firstname} {l.employee?.lastname}</p>
                                <p className="text-xs text-gray-400">{l.employee?.department || ''}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="font-medium">{l.title}</p>
                                <p className="text-xs text-gray-400 truncate max-w-[180px]">{l.reason}</p>
                            </div>
                            <div>
                                <p className="text-xs">{fmtDate(l.startdate)}</p>
                                <p className="text-xs text-gray-400">{fmtDate(l.enddate)}</p>
                            </div>
                            <StatusBadge status={l.status} />
                            <button
                                disabled={l.status !== 'Pending'}
                                onClick={() => setSelected(l)}
                                className="px-3 py-1 rounded-md text-xs border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed w-fit">
                                Review
                            </button>
                        </div>
                    ))
                }
            </div>

            <ApproveDialog open={!!selected} leave={selected} HRID={HRID}
                onClose={() => setSelected(null)} onSubmit={handleApprove} />
        </PageShell>
    )
}