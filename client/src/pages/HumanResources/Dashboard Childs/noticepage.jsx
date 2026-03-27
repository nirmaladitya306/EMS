import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllNotices, HandleCreateNotice, HandleUpdateNotice, HandleDeleteNotice } from '../../../redux/Thunks/NoticeThunk'
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk'
import { HandleGetHRDepartments } from '../../../redux/Thunks/HRDepartmentPageThunk'
import { Loading } from '../../../components/common/loading'

// ─── Audience badge ───────────────────────────────────────────────────────────
const AudienceBadge = ({ audience }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
        audience === 'Department-Specific'
            ? 'bg-blue-100 text-blue-800 border-blue-300'
            : 'bg-purple-100 text-purple-800 border-purple-300'
    }`}>
        {audience === 'Department-Specific' ? 'Department' : 'Employee'}
    </span>
)

// ─── Format date ──────────────────────────────────────────────────────────────
const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

// ─── Compose / Edit dialog ────────────────────────────────────────────────────
const NoticeDialog = ({ open, onClose, onSubmit, employeeList, departmentList, HRID, initialData }) => {
    const isEdit = !!initialData
    const empty = { title: '', content: '', audience: 'Department-Specific', departmentID: '', employeeID: '' }
    const [form, setForm] = useState(empty)

    useEffect(() => {
        if (!open) return
        if (isEdit) {
            setForm({
                noticeID:   initialData._id,
                title:      initialData.title,
                content:    initialData.content,
                audience:   initialData.audience,
                departmentID: initialData.department?._id || initialData.department || '',
                employeeID:   initialData.employee?._id   || initialData.employee   || '',
            })
        } else {
            setForm(empty)
        }
    }, [open, initialData])

    if (!open) return null

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const submit = (e) => {
        e.preventDefault()
        if (isEdit) {
            const UpdatedData = { title: form.title, content: form.content }
            onSubmit({ noticeID: form.noticeID, UpdatedData })
        } else {
            onSubmit({ ...form, HRID })
        }
    }

    const fc = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
    const lc = "block text-xs font-medium text-gray-600 mb-1"

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4">
                <h2 className="text-xl font-bold mb-5">{isEdit ? 'Edit Notice' : 'Issue New Notice'}</h2>
                <form onSubmit={submit} className="flex flex-col gap-4">

                    {/* Audience selector — only on create */}
                    {!isEdit && (
                        <div>
                            <label className={lc}>Send To</label>
                            <div className="flex gap-2">
                                {['Department-Specific', 'Employee-Specific'].map(a => (
                                    <button
                                        key={a} type="button"
                                        onClick={() => setForm(f => ({ ...f, audience: a, departmentID: '', employeeID: '' }))}
                                        className={`flex-1 py-2 rounded-lg text-sm border transition-all ${
                                            form.audience === a
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'border-gray-300 text-gray-600 hover:border-blue-400'
                                        }`}
                                    >
                                        {a === 'Department-Specific' ? 'Department' : 'Employee'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Target dropdown */}
                    {!isEdit && form.audience === 'Department-Specific' && (
                        <div>
                            <label className={lc}>Department</label>
                            <select name="departmentID" value={form.departmentID} onChange={handle} required className={fc}>
                                <option value="">Select department</option>
                                {departmentList.map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!isEdit && form.audience === 'Employee-Specific' && (
                        <div>
                            <label className={lc}>Employee</label>
                            <select name="employeeID" value={form.employeeID} onChange={handle} required className={fc}>
                                <option value="">Select employee</option>
                                {employeeList.map(e => (
                                    <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className={lc}>Notice Title</label>
                        <input name="title" value={form.title} onChange={handle} required
                            placeholder="e.g. Office closed on Friday"
                            className={fc} />
                    </div>

                    <div>
                        <label className={lc}>Notice Content</label>
                        <textarea name="content" value={form.content} onChange={handle} required
                            rows={5} placeholder="Write the notice content here..."
                            className={fc} />
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit"
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                            {isEdit ? 'Save Changes' : 'Issue Notice'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Notice card ──────────────────────────────────────────────────────────────
const NoticeCard = ({ notice, onEdit, onDelete }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-gray-900 text-sm">{notice.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                    <AudienceBadge audience={notice.audience} />
                    <span className="text-xs text-gray-400">
                        {notice.audience === 'Department-Specific'
                            ? `Dept: ${notice.department?.name || '—'}`
                            : `To: ${notice.employee?.firstname} ${notice.employee?.lastname}`}
                    </span>
                    <span className="text-xs text-gray-400">• {fmtDate(notice.createdAt)}</span>
                </div>
            </div>
            <div className="flex gap-1 shrink-0">
                <button onClick={() => onEdit(notice)}
                    className="px-3 py-1 rounded-md text-xs border border-blue-300 text-blue-600 hover:bg-blue-50">
                    Edit
                </button>
                <button onClick={() => onDelete(notice._id)}
                    className="px-3 py-1 rounded-md text-xs border border-red-300 text-red-600 hover:bg-red-50">
                    Delete
                </button>
            </div>
        </div>
        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed border-t border-gray-100 pt-2">
            {notice.content}
        </p>
        {notice.createdby && (
            <p className="text-xs text-gray-400 text-right">
                Issued by {notice.createdby?.firstname} {notice.createdby?.lastname}
            </p>
        )}
    </div>
)

// ─── Main page ────────────────────────────────────────────────────────────────
export const NoticePage = () => {
    const dispatch = useDispatch()

    const noticeState = useSelector(s => s.NoticeReducer)
    const empState    = useSelector(s => s.HREmployeesPageReducer)
    const deptState   = useSelector(s => s.HRDepartmentPageReducer)
    const hrState     = useSelector(s => s.HRReducer)

    // Get HRID from the HR auth state (set on check-login / login)
    const HRID = hrState?.data?.HRid || hrState?.data?.data?._id || ''

    const [activeTab,   setActiveTab]   = useState('department')
    const [search,      setSearch]      = useState('')
    const [dialogOpen,  setDialogOpen]  = useState(false)
    const [editTarget,  setEditTarget]  = useState(null)

    useEffect(() => {
        dispatch(HandleGetAllNotices())
        dispatch(HandleGetHREmployees({ apiroute: 'GETALL' }))
        dispatch(HandleGetHRDepartments({ apiroute: 'GETALL' }))
    }, [])

    useEffect(() => {
        if (noticeState.fetchData) dispatch(HandleGetAllNotices())
    }, [noticeState.fetchData])

    const employeeList   = empState.data  || []
    const departmentList = deptState.data || []

    const handleCreate = (form) => {
        dispatch(HandleCreateNotice(form))
        setDialogOpen(false)
    }

    const handleUpdate = (payload) => {
        dispatch(HandleUpdateNotice(payload))
        setEditTarget(null)
    }

    const handleDelete = (noticeID) => {
        if (window.confirm('Delete this notice?')) dispatch(HandleDeleteNotice({ noticeID }))
    }

    const filterNotices = (list) => {
        if (!search.trim()) return list
        const q = search.toLowerCase()
        return list.filter(n =>
            n.title?.toLowerCase().includes(q) ||
            n.content?.toLowerCase().includes(q) ||
            n.department?.name?.toLowerCase().includes(q) ||
            `${n.employee?.firstname} ${n.employee?.lastname}`.toLowerCase().includes(q)
        )
    }

    const deptNotices = filterNotices(noticeState.departmentNotices)
    const empNotices  = filterNotices(noticeState.employeeNotices)
    const totalCount  = noticeState.departmentNotices.length + noticeState.employeeNotices.length

    if (noticeState.isLoading && totalCount === 0) return <Loading />

    return (
        <div className="notices-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Issue Notices</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Send notices to departments or individual employees
                    </p>
                </div>
                <button
                    onClick={() => setDialogOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                >
                    + Issue Notice
                </button>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-2xl font-bold">{totalCount}</p>
                    <p className="text-sm text-gray-500">Total Notices</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-2xl font-bold">{noticeState.departmentNotices.length}</p>
                    <p className="text-sm text-gray-500">Department Notices</p>
                </div>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <p className="text-2xl font-bold">{noticeState.employeeNotices.length}</p>
                    <p className="text-sm text-gray-500">Employee Notices</p>
                </div>
            </div>

            {/* Search + Tabs */}
            <div className="flex flex-wrap items-center gap-3">
                <input
                    type="text"
                    placeholder="Search notices..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <div className="flex gap-1 ml-auto">
                    {[
                        { key: 'department', label: `Department (${deptNotices.length})` },
                        { key: 'employee',   label: `Employee (${empNotices.length})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                activeTab === tab.key
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'border-gray-300 text-gray-600 hover:border-blue-400'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notice cards list */}
            <div className="flex flex-col gap-3 overflow-auto flex-1">
                {activeTab === 'department' && (
                    deptNotices.length === 0
                        ? <div className="text-center text-gray-400 py-16">No department notices found.</div>
                        : deptNotices.map(n => (
                            <NoticeCard key={n._id} notice={n} onEdit={setEditTarget} onDelete={handleDelete} />
                        ))
                )}
                {activeTab === 'employee' && (
                    empNotices.length === 0
                        ? <div className="text-center text-gray-400 py-16">No employee notices found.</div>
                        : empNotices.map(n => (
                            <NoticeCard key={n._id} notice={n} onEdit={setEditTarget} onDelete={handleDelete} />
                        ))
                )}
            </div>

            {/* Dialogs */}
            <NoticeDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleCreate}
                employeeList={employeeList}
                departmentList={departmentList}
                HRID={HRID}
            />
            <NoticeDialog
                open={!!editTarget}
                onClose={() => setEditTarget(null)}
                onSubmit={handleUpdate}
                employeeList={employeeList}
                departmentList={departmentList}
                HRID={HRID}
                initialData={editTarget}
            />
        </div>
    )
}

