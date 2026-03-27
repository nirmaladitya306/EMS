import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetMyLeaves, HandleApplyLeave,
    HandleUpdateMyLeave, HandleDeleteMyLeave,
    HandleGetEmployeeProfile
} from '../../../redux/Thunks/EmployeeDashboardThunk'
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

const LeaveDialog = ({ open, onClose, onSubmit, initialData }) => {
    const isEdit = !!initialData
    const empty = { title: '', reason: '', startdate: '', enddate: '' }
    const [form, setForm] = useState(empty)

    useEffect(() => {
        if (open) {
            setForm(isEdit ? {
                leaveID:   initialData._id,
                title:     initialData.title,
                reason:    initialData.reason,
                startdate: initialData.startdate?.split('T')[0] || '',
                enddate:   initialData.enddate?.split('T')[0]   || '',
            } : empty)
        }
    }, [open, initialData])

    if (!open) return null
    const fc = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
    const lc = "block text-xs font-medium text-gray-600 mb-1"
    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h2 className="text-xl font-bold mb-5">{isEdit ? 'Edit Leave Request' : 'Apply for Leave'}</h2>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className={lc}>Title</label>
                        <input name="title" value={form.title} onChange={handle} required placeholder="e.g. Annual Leave" className={fc} />
                    </div>
                    <div>
                        <label className={lc}>Reason</label>
                        <textarea name="reason" value={form.reason} onChange={handle} required rows={3} placeholder="Describe your reason..." className={fc} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Start Date</label>
                            <input name="startdate" type="date" value={form.startdate} onChange={handle} required className={fc} />
                        </div>
                        <div>
                            <label className={lc}>End Date</label>
                            <input name="enddate" type="date" value={form.enddate} onChange={handle} required className={fc} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700">
                            {isEdit ? 'Save Changes' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export const MyLeavesPage = () => {
    const dispatch   = useDispatch()
    const state      = useSelector(s => s.EmployeeDashboardReducer)
    const profile    = state.profile
    const employeeID = profile?._id

    const [applyOpen,  setApplyOpen]  = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    useEffect(() => {
        if (!profile) dispatch(HandleGetEmployeeProfile())
    }, [])
    useEffect(() => { dispatch(HandleGetMyLeaves()) }, [])
    useEffect(() => { if (state.fetchLeaves) dispatch(HandleGetMyLeaves()) }, [state.fetchLeaves])

    const handleApply = (form) => {
        dispatch(HandleApplyLeave({ ...form, employeeID }))
        setApplyOpen(false)
    }
    const handleUpdate = (form) => {
        dispatch(HandleUpdateMyLeave(form))
        setEditTarget(null)
    }
    const handleDelete = (leaveID) => {
        if (window.confirm('Delete this leave request?')) dispatch(HandleDeleteMyLeave({ leaveID }))
    }

    const leaves  = state.leaves || []
    const pending  = leaves.filter(l => l.status === 'Pending').length
    const approved = leaves.filter(l => l.status === 'Approved').length
    const rejected = leaves.filter(l => l.status === 'Rejected').length

    if (state.isLoading && !leaves.length) return <Loading />

    return (
        <div className="my-leaves-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">My Leaves</h1>
                    <p className="text-sm text-gray-500 mt-1">Apply for and manage your leave requests</p>
                </div>
                <button onClick={() => setApplyOpen(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg">
                    + Apply for Leave
                </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Pending',  value: pending,  color: 'border-yellow-200 bg-yellow-50' },
                    { label: 'Approved', value: approved, color: 'border-green-200  bg-green-50'  },
                    { label: 'Rejected', value: rejected, color: 'border-red-200    bg-red-50'    },
                ].map(c => (
                    <div key={c.label} className={`rounded-xl border p-4 flex flex-col gap-1 ${c.color}`}>
                        <span className="text-2xl font-bold">{c.value}</span>
                        <span className="text-sm text-gray-500">{c.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-6 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Title</span>
                    <span>From</span>
                    <span>To</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {leaves.length === 0
                    ? <div className="text-center text-gray-400 py-16">No leave requests yet.</div>
                    : leaves.map(l => (
                        <div key={l._id} className="grid grid-cols-6 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                            <div className="col-span-2">
                                <p className="font-medium">{l.title}</p>
                                <p className="text-xs text-gray-400 truncate">{l.reason}</p>
                            </div>
                            <span className="text-gray-600 text-xs">{fmtDate(l.startdate)}</span>
                            <span className="text-gray-600 text-xs">{fmtDate(l.enddate)}</span>
                            <StatusBadge status={l.status} />
                            <div className="flex gap-2">
                                <button
                                    disabled={l.status !== 'Pending'}
                                    onClick={() => setEditTarget(l)}
                                    className="px-3 py-1 rounded-md text-xs border border-blue-400 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                    Edit
                                </button>
                                <button
                                    disabled={l.status !== 'Pending'}
                                    onClick={() => handleDelete(l._id)}
                                    className="px-3 py-1 rounded-md text-xs border border-red-400 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>

            <LeaveDialog open={applyOpen}   onClose={() => setApplyOpen(false)}  onSubmit={handleApply} />
            <LeaveDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSubmit={handleUpdate} initialData={editTarget} />
        </div>
    )
}