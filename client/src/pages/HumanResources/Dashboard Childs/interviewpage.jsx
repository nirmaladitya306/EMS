import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllInterviews, HandleUpdateInterview, HandleDeleteInterview } from '../../../redux/Thunks/InterviewThunk'
import { Loading } from '../../../components/common/loading'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const StatusBadge = ({ status }) => {
    const map = {
        Pending:   'bg-yellow-100 text-yellow-800 border-yellow-300',
        Completed: 'bg-green-100  text-green-800  border-green-300',
        Canceled:  'bg-red-100    text-red-800    border-red-300',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>{status}</span>
}

const SummaryCard = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-xl font-bold">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

const UpdateDialog = ({ open, interview, onClose, onSubmit }) => {
    const [form, setForm] = useState({ status: 'Pending', feedback: '', interviewdate: '', responsedate: '' })

    useEffect(() => {
        if (open && interview) {
            setForm({
                status:        interview.status || 'Pending',
                feedback:      interview.feedback || '',
                interviewdate: interview.interviewdate ? interview.interviewdate.split('T')[0] : '',
                responsedate:  interview.responsedate  ? interview.responsedate.split('T')[0]  : '',
            })
        }
    }, [open, interview])

    if (!open || !interview) return null

    const fc = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
    const lc = "block text-xs font-medium text-gray-600 mb-1"
    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => {
        e.preventDefault()
        onSubmit({ interviewID: interview._id, UpdatedData: form })
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h2 className="text-xl font-bold mb-1">Update Interview</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Applicant: {interview.applicant?.firstname} {interview.applicant?.lastname}
                </p>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className={lc}>Status</label>
                        <select name="status" value={form.status} onChange={handle} className={fc}>
                            {['Pending', 'Completed', 'Canceled'].map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Interview Date</label>
                            <input name="interviewdate" type="date" value={form.interviewdate} onChange={handle} className={fc} />
                        </div>
                        <div>
                            <label className={lc}>Response Date</label>
                            <input name="responsedate" type="date" value={form.responsedate} onChange={handle} className={fc} />
                        </div>
                    </div>
                    <div>
                        <label className={lc}>Feedback</label>
                        <textarea name="feedback" value={form.feedback} onChange={handle} rows={3}
                            placeholder="Interview notes and feedback..." className={fc} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Save</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export const InterviewPage = () => {
    const dispatch   = useDispatch()
    const state      = useSelector(s => s.InterviewReducer)

    const [editTarget,   setEditTarget]   = useState(null)
    const [filterStatus, setFilterStatus] = useState('All')
    const [search,       setSearch]       = useState('')

    useEffect(() => { dispatch(HandleGetAllInterviews()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllInterviews()) }, [state.fetchData])

    const handleUpdate = (data) => { dispatch(HandleUpdateInterview(data)); setEditTarget(null) }
    const handleDelete = (interviewID) => {
        if (window.confirm('Delete this interview record?')) dispatch(HandleDeleteInterview({ interviewID }))
    }

    const filtered = (state.data || []).filter(i => {
        const name = `${i.applicant?.firstname || ''} ${i.applicant?.lastname || ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) && (filterStatus === 'All' || i.status === filterStatus)
    })

    const total     = state.data?.length || 0
    const pending   = state.data?.filter(i => i.status === 'Pending').length   || 0
    const completed = state.data?.filter(i => i.status === 'Completed').length || 0
    const canceled  = state.data?.filter(i => i.status === 'Canceled').length  || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <div className="interview-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            <div>
                <h1 className="text-3xl font-bold">Interview Insights</h1>
                <p className="text-sm text-gray-500 mt-1">Track and manage applicant interviews</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label="Total"     value={total}     color="border-gray-200   bg-gray-50"    />
                <SummaryCard label="Pending"   value={pending}   color="border-yellow-200 bg-yellow-50"  />
                <SummaryCard label="Completed" value={completed} color="border-green-200  bg-green-50"   />
                <SummaryCard label="Canceled"  value={canceled}  color="border-red-200    bg-red-50"     />
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <input type="text" placeholder="Search by applicant name..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300" />
                {['All', 'Pending', 'Completed', 'Canceled'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${filterStatus === s ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:border-blue-400'}`}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-6 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Applicant</span>
                    <span>Interviewer</span>
                    <span>Interview Date</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {filtered.length === 0
                    ? <div className="text-center text-gray-400 py-16">No interview records found.</div>
                    : filtered.map(i => (
                        <div key={i._id} className="grid grid-cols-6 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                            <div className="col-span-2">
                                <p className="font-medium">{i.applicant?.firstname} {i.applicant?.lastname}</p>
                                <p className="text-xs text-gray-400">{i.applicant?.email}</p>
                            </div>
                            <p className="text-gray-600">{i.interviewer?.firstname} {i.interviewer?.lastname}</p>
                            <p className="text-gray-600 text-xs">{fmtDate(i.interviewdate)}</p>
                            <StatusBadge status={i.status} />
                            <div className="flex gap-2">
                                <button onClick={() => setEditTarget(i)}
                                    className="px-3 py-1 rounded-md text-xs border border-blue-400 text-blue-600 hover:bg-blue-50">Edit</button>
                                <button onClick={() => handleDelete(i._id)}
                                    className="px-3 py-1 rounded-md text-xs border border-red-400 text-red-600 hover:bg-red-50">Delete</button>
                            </div>
                        </div>
                    ))
                }
            </div>

            <UpdateDialog open={!!editTarget} interview={editTarget}
                onClose={() => setEditTarget(null)} onSubmit={handleUpdate} />
        </div>
    )
}