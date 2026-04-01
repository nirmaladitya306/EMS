import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyNotices } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const NoticeDetail = ({ open, notice, onClose }) => {
    if (!open || !notice) return null
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4">
                <h2 className="text-xl font-bold mb-1">{notice.title}</h2>
                <p className="text-xs text-gray-400 mb-4">
                    Issued by {notice.createdby?.firstname} {notice.createdby?.lastname} · {fmtDate(notice.createdAt)}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                <div className="flex justify-end mt-5">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Close</button>
                </div>
            </div>
        </div>
    )
}

export const MyNoticesPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.EmployeeDashboardReducer)
    const notices  = state.notices || []

    const [detail, setDetail] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => { dispatch(HandleGetMyNotices()) }, [])
    useEffect(() => { if (state.fetchNotices) dispatch(HandleGetMyNotices()) }, [state.fetchNotices])

    const filtered = notices.filter(n =>
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase())
    )

    if (state.isLoading && !notices.length) return <Loading />

    return (
        <PageShell>

            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <PageHeader eyebrow="Communications" title="My Notices" subtitle="Notices issued to you or your department" />
                    <p className="text-sm text-gray-500 mt-1">Notices issued to you or your department</p>
                </div>
                <div className="bg-indigo-50 border border-purple-200 rounded-xl px-4 py-2 text-center">
                    <span className="text-2xl font-bold text-indigo-700">{notices.length}</span>
                    <p className="text-xs text-gray-500">Total Notices</p>
                </div>
            </div>

            <input type="text" placeholder="Search notices..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200" />

            <div className="flex flex-col gap-3 overflow-auto flex-1">
                {filtered.length === 0
                    ? <div className="text-center text-gray-400 py-16">No notices found.</div>
                    : filtered.map(n => (
                        <div key={n._id}
                            onClick={() => setDetail(n)}
                            className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:bg-indigo-50 hover:border-purple-200 cursor-pointer transition-all">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800">{n.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 truncate">{n.content}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs text-gray-400">{fmtDate(n.createdAt)}</p>
                                    <p className="text-xs text-indigo-600 mt-1">
                                        {n.createdby?.firstname} {n.createdby?.lastname}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>

            <NoticeDetail open={!!detail} notice={detail} onClose={() => setDetail(null)} />
        </PageShell>
    )
}