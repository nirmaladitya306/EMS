import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetMyRequests, HandleSubmitRequest,
    HandleUpdateMyRequest, HandleGetEmployeeProfile
} from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const StatusBadge = ({ status }) => {
    const map = {
        Pending:  'bg-yellow-100 text-yellow-800 border-yellow-300',
        Approved: 'bg-green-100  text-green-800  border-green-300',
        Denied:   'bg-red-100    text-red-800    border-red-300',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>{status}</span>
}

const RequestDialog = ({ open, onClose, onSubmit, initialData }) => {
    const isEdit = !!initialData
    const empty  = { requesttitle: '', requestconent: '' }
    const [form, setForm] = useState(empty)

    useEffect(() => {
        if (open) {
            setForm(isEdit ? {
                requestID:     initialData._id,
                requesttitle:  initialData.requesttitle,
                requestconent: initialData.requestconent,
            } : empty)
        }
    }, [open, initialData])

    if (!open) return null
    const fc = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
    const lc = "block text-xs font-medium text-gray-600 mb-1"
    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h2 className="text-xl font-bold mb-5">{isEdit ? 'Edit Request' : 'Submit Request'}</h2>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className={lc}>Title</label>
                        <input name="requesttitle" value={form.requesttitle} onChange={handle} required
                            placeholder="e.g. Equipment Request" className={fc} />
                    </div>
                    <div>
                        <label className={lc}>Details</label>
                        <textarea name="requestconent" value={form.requestconent} onChange={handle} required
                            rows={4} placeholder="Describe your request in detail..." className={fc} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit"
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                            {isEdit ? 'Save Changes' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export const MyRequestsPage = () => {
    const dispatch   = useDispatch()
    const state      = useSelector(s => s.EmployeeDashboardReducer)
    const profile    = state.profile
    const employeeID = profile?._id
    const requests   = state.requests || []

    const [createOpen, setCreateOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    useEffect(() => { if (!profile) dispatch(HandleGetEmployeeProfile()) }, [])
    useEffect(() => { dispatch(HandleGetMyRequests()) }, [])
    useEffect(() => { if (state.fetchRequests) dispatch(HandleGetMyRequests()) }, [state.fetchRequests])

    const handleSubmit = (form) => { dispatch(HandleSubmitRequest({ ...form, employeeID })); setCreateOpen(false) }
    const handleUpdate = (form) => { dispatch(HandleUpdateMyRequest(form)); setEditTarget(null) }

    const pending  = requests.filter(r => r.status === 'Pending').length
    const approved = requests.filter(r => r.status === 'Approved').length
    const denied   = requests.filter(r => r.status === 'Denied').length

    if (state.isLoading && !requests.length) return <Loading />

    return (
        <div className="my-requests-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">My Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">Submit and track your requests to HR</p>
                </div>
                <button onClick={() => setCreateOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
                    + New Request
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Pending',  value: pending,  color: 'border-yellow-200 bg-yellow-50' },
                    { label: 'Approved', value: approved, color: 'border-green-200  bg-green-50'  },
                    { label: 'Denied',   value: denied,   color: 'border-red-200    bg-red-50'    },
                ].map(c => (
                    <div key={c.label} className={`rounded-xl border p-4 flex flex-col gap-1 ${c.color}`}>
                        <span className="text-2xl font-bold">{c.value}</span>
                        <span className="text-sm text-gray-500">{c.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-5 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Request</span>
                    <span>Department</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {requests.length === 0
                    ? <div className="text-center text-gray-400 py-16">No requests submitted yet.</div>
                    : requests.map(r => (
                        <div key={r._id} className="grid grid-cols-5 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                            <div className="col-span-2">
                                <p className="font-medium">{r.requesttitle}</p>
                                <p className="text-xs text-gray-400 truncate">{r.requestconent}</p>
                            </div>
                            <span className="text-gray-500 text-xs">{r.department?.name || '—'}</span>
                            <StatusBadge status={r.status} />
                            <button disabled={r.status !== 'Pending'} onClick={() => setEditTarget(r)}
                                className="px-3 py-1 rounded-md text-xs border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed w-fit">
                                Edit
                            </button>
                        </div>
                    ))
                }
            </div>

            <RequestDialog open={createOpen}   onClose={() => setCreateOpen(false)} onSubmit={handleSubmit} />
            <RequestDialog open={!!editTarget} onClose={() => setEditTarget(null)}  onSubmit={handleUpdate} initialData={editTarget} />
        </div>
    )
}