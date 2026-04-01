import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllRecruitments, HandleCreateRecruitment, HandleDeleteRecruitment } from '../../../redux/Thunks/RecruitmentThunk'
import { Loading } from '../../../components/common/loading'

const SummaryCard = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-xl font-bold">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

const CreateDialog = ({ open, onClose, onSubmit }) => {
    const [form, setForm] = useState({ jobtitle: '', description: '' })
    if (!open) return null
    const fc = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
    const lc = "block text-xs font-medium text-gray-600 mb-1"
    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit(form); setForm({ jobtitle: '', description: '' }) }
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h2 className="text-xl font-bold mb-5">Create Job Posting</h2>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className={lc}>Job Title</label>
                        <input name="jobtitle" value={form.jobtitle} onChange={handle} required
                            placeholder="e.g. Senior Developer" className={fc} />
                    </div>
                    <div>
                        <label className={lc}>Description</label>
                        <textarea name="description" value={form.description} onChange={handle} required
                            rows={4} placeholder="Job responsibilities, requirements..." className={fc} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">Create</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const DetailDialog = ({ open, record, onClose }) => {
    if (!open || !record) return null
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h2 className="text-xl font-bold mb-1">{record.jobtitle}</h2>
                <p className="text-sm text-gray-500 mb-4">{record.description}</p>
                <p className="text-sm font-medium text-gray-700 mb-2">Applicants: {record.application?.length || 0}</p>
                <div className="flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Close</button>
                </div>
            </div>
        </div>
    )
}

export const RecruitmentPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.RecruitmentReducer)

    const [createOpen, setCreateOpen] = useState(false)
    const [detailRec,  setDetailRec]  = useState(null)
    const [search,     setSearch]     = useState('')

    useEffect(() => { dispatch(HandleGetAllRecruitments()) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllRecruitments()) }, [state.fetchData])

    const handleCreate = (form) => { dispatch(HandleCreateRecruitment(form)); setCreateOpen(false) }
    const handleDelete = (recruitmentID) => {
        if (window.confirm('Delete this job posting?')) dispatch(HandleDeleteRecruitment({ recruitmentID }))
    }

    const filtered = (state.data || []).filter(r =>
        r.jobtitle?.toLowerCase().includes(search.toLowerCase())
    )

    const total      = state.data?.length || 0
    const totalApps  = state.data?.reduce((sum, r) => sum + (r.application?.length || 0), 0) || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>

            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <PageHeader eyebrow="Recruitment" title="Recruitment" subtitle="Manage job postings and track applicants" />
                    <p className="text-sm text-gray-500 mt-1">Manage job postings and track applicants</p>
                </div>
                <button onClick={() => setCreateOpen(true)}
                    className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                    + New Job Posting
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <SummaryCard label="Active Postings" value={total}     color="border-blue-200   bg-blue-50"  />
                <SummaryCard label="Total Applicants" value={totalApps} color="border-purple-200 bg-purple-50" />
            </div>

            <input type="text" placeholder="Search by job title..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-5 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Job Title</span>
                    <span className="col-span-2">Description</span>
                    <span>Actions</span>
                </div>

                {filtered.length === 0
                    ? <div className="text-center text-gray-400 py-16">No job postings found.</div>
                    : filtered.map(r => (
                        <div key={r._id} className="grid grid-cols-5 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                            <div className="col-span-2">
                                <p className="font-medium">{r.jobtitle}</p>
                                <p className="text-xs text-gray-400">{r.application?.length || 0} applicants</p>
                            </div>
                            <p className="col-span-2 text-gray-600 text-xs truncate pe-4">{r.description}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setDetailRec(r)}
                                    className="px-3 py-1 rounded-md text-xs border border-indigo-200 text-indigo-600 hover:bg-indigo-50">View</button>
                                <button onClick={() => handleDelete(r._id)}
                                    className="px-3 py-1 rounded-md text-xs border border-red-400 text-red-600 hover:bg-red-50">Delete</button>
                            </div>
                        </div>
                    ))
                }
            </div>

            <CreateDialog open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
            <DetailDialog open={!!detailRec} record={detailRec} onClose={() => setDetailRec(null)} />
        </PageShell>
    )
}