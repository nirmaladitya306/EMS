import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllRequests, HandleUpdateRequestStatus, HandleDeleteRequest } from '../../../redux/Thunks/RequestThunk'
import { Loading } from '../../../components/common/loading'

const StatusBadge = ({ status }) => {
    const map = {
        Pending:  'bg-yellow-100 text-yellow-800 border-yellow-300',
        Approved: 'bg-green-100  text-green-800  border-green-300',
        Denied:   'bg-red-100    text-red-800    border-red-300',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>{status}</span>
}

const SummaryCard = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-xl font-bold">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

const ReviewDialog = ({ open, request, onClose, onSubmit, HRID }) => {
    const [status, setStatus] = useState('Approved')
    useEffect(() => { if (open) setStatus('Approved') }, [open])
    if (!open || !request) return null
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h2 className="text-xl font-bold mb-4">Review Request</h2>
                <div className="flex flex-col gap-2 text-sm text-gray-700 mb-5">
                    <p><span className="font-medium">Employee:</span> {request.employee?.firstname} {request.employee?.lastname}</p>
                    <p><span className="font-medium">Title:</span> {request.requesttitle}</p>
                    <p><span className="font-medium">Content:</span> {request.requestconent}</p>
                    <p><span className="font-medium">Department:</span> {request.department?.name || '—'}</p>
                </div>
                <div className="mb-5">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Decision</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                        <option value="Approved">Approve</option>
                        <option value="Denied">Deny</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                    <button onClick={() => onSubmit({ requestID: request._id, status, HRID })}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    )
}

export const RequestsPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.RequestReducer)
    const HRState  = useSelector(s => s.HRReducer)
    const HRID     = HRState?.data?.HRid || HRState?.data?.data?._id || ''

    const [selected,     setSelected]     = useState(null)
    const [filterStatus, setFilterStatus] = useState('All')
    const [search,       setSearch]       = useState('')

    useEffect(() => { dispatch(HandleGetAllRequests()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllRequests()) }, [state.fetchData])

    const handleUpdate = (payload) => { dispatch(HandleUpdateRequestStatus(payload)); setSelected(null) }
    const handleDelete = (requestID) => {
        if (window.confirm('Delete this request?')) dispatch(HandleDeleteRequest({ requestID }))
    }

    const filtered = (state.data || []).filter(r => {
        const name = `${r.employee?.firstname || ''} ${r.employee?.lastname || ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) && (filterStatus === 'All' || r.status === filterStatus)
    })

    const total    = state.data?.length || 0
    const pending  = state.data?.filter(r => r.status === 'Pending').length  || 0
    const approved = state.data?.filter(r => r.status === 'Approved').length || 0
    const denied   = state.data?.filter(r => r.status === 'Denied').length   || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <div className="requests-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            <div>
                <h1 className="text-3xl font-bold">Employee Requests</h1>
                <p className="text-sm text-gray-500 mt-1">Review and action employee-generated requests</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label="Total"    value={total}    color="border-gray-200  bg-gray-50"   />
                <SummaryCard label="Pending"  value={pending}  color="border-yellow-200 bg-yellow-50" />
                <SummaryCard label="Approved" value={approved} color="border-green-200  bg-green-50"  />
                <SummaryCard label="Denied"   value={denied}   color="border-red-200    bg-red-50"    />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <input type="text" placeholder="Search by employee name..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                {['All', 'Pending', 'Approved', 'Denied'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${filterStatus === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-6 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Employee</span>
                    <span className="col-span-2">Request</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {filtered.length === 0
                    ? <div className="text-center text-gray-400 py-16">No requests found.</div>
                    : filtered.map(r => (
                        <div key={r._id} className="grid grid-cols-6 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                            <div className="col-span-2">
                                <p className="font-medium">{r.employee?.firstname} {r.employee?.lastname}</p>
                                <p className="text-xs text-gray-400">{r.department?.name || ''}</p>
                            </div>
                            <div className="col-span-2 pe-4">
                                <p className="font-medium">{r.requesttitle}</p>
                                <p className="text-xs text-gray-400 truncate">{r.requestconent}</p>
                            </div>
                            <StatusBadge status={r.status} />
                            <div className="flex gap-2">
                                <button
                                    disabled={r.status !== 'Pending'}
                                    onClick={() => setSelected(r)}
                                    className="px-3 py-1 rounded-md text-xs border border-blue-400 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                    Review
                                </button>
                                <button onClick={() => handleDelete(r._id)}
                                    className="px-3 py-1 rounded-md text-xs border border-red-400 text-red-600 hover:bg-red-50">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>

            <ReviewDialog open={!!selected} request={selected} HRID={HRID}
                onClose={() => setSelected(null)} onSubmit={handleUpdate} />
        </div>
    )
}