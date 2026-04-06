import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllNotices, HandleCreateNotice, HandleUpdateNotice, HandleDeleteNotice } from '../../../redux/Thunks/NoticeThunk'
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk'
import { HandleGetHRDepartments } from '../../../redux/Thunks/HRDepartmentPageThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── Audience pill ────────────────────────────────────────────────────────────
const AudiencePill = ({ audience }) => {
    const isDept = audience === 'Department-Specific'
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: isDept ? 'rgba(99,102,241,0.08)' : 'rgba(139,92,246,0.08)',
            color:      isDept ? '#4f46e5'               : '#7c3aed',
            border:     isDept ? '1px solid rgba(99,102,241,0.22)' : '1px solid rgba(139,92,246,0.22)',
            whiteSpace: 'nowrap',
        }}>
            {isDept ? 'Department' : 'Employee'}
        </span>
    )
}

// ─── Notice card ──────────────────────────────────────────────────────────────
const NoticeCard = ({ notice, onEdit, onDelete }) => (
    <div style={{
        background: 'rgba(0,0,0,0.012)', border: '1px solid rgba(0,0,0,0.07)',
        borderRadius: 14, padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'border-color 0.2s, background 0.2s',
        fontFamily: "'DM Sans', sans-serif",
    }}
        className="notice-card"
    >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }} className="notice-title">
                    {notice.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <AudiencePill audience={notice.audience} />
                    <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)' }} className="notice-meta">
                        {notice.audience === 'Department-Specific'
                            ? `Dept: ${notice.department?.name || '—'}`
                            : `To: ${notice.employee?.firstname} ${notice.employee?.lastname}`}
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)' }} className="notice-meta">· {fmtDate(notice.createdAt)}</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="pg-action-btn indigo" onClick={() => onEdit(notice)}>Edit</button>
                <button className="pg-action-btn red" onClick={() => onDelete(notice._id)}>Delete</button>
            </div>
        </div>
        <p style={{
            fontSize: 13, color: 'rgba(0,0,0,0.6)', lineHeight: 1.65,
            borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 10, margin: 0,
            whiteSpace: 'pre-line',
        }} className="notice-content">
            {notice.content}
        </p>
        {notice.createdby && (
            <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', textAlign: 'right', margin: 0 }} className="notice-meta">
                Issued by {notice.createdby?.firstname} {notice.createdby?.lastname}
            </p>
        )}
    </div>
)

// ─── Notice dialog ────────────────────────────────────────────────────────────
const NoticeDialog = ({ open, onClose, onSubmit, employeeList, departmentList, HRID, initialData }) => {
    const isEdit = !!initialData
    const empty  = { title: '', content: '', audience: 'Department-Specific', departmentID: '', employeeID: '' }
    const [form, setForm] = useState(empty)

    useEffect(() => {
        if (!open) return
        if (isEdit) {
            setForm({
                noticeID:     initialData._id,
                title:        initialData.title,
                content:      initialData.content,
                audience:     initialData.audience,
                departmentID: initialData.department?._id || initialData.department || '',
                employeeID:   initialData.employee?._id   || initialData.employee   || '',
            })
        } else { setForm(empty) }
    }, [open, initialData])

    if (!open) return null

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => {
        e.preventDefault()
        if (isEdit) {
            onSubmit({ noticeID: form.noticeID, UpdatedData: { title: form.title, content: form.content } })
        } else {
            const { HRID: _ignored, ...payload } = { ...form, HRID }
            onSubmit(payload)
        }
    }

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal" style={{ maxWidth: 520 }}>
                <div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>
                        {isEdit ? 'Edit Notice' : 'Issue New Notice'}
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', margin: 0 }}>
                        {isEdit ? 'Update the notice title or content.' : 'Send a notice to a department or individual employee.'}
                    </p>
                </div>
                <div className="pg-divider" />

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {!isEdit && (
                        <div className="pg-field">
                            <label className="pg-label">Send To</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['Department-Specific', 'Employee-Specific'].map(a => {
                                    const active = form.audience === a
                                    return (
                                        <button key={a} type="button"
                                            onClick={() => setForm(f => ({ ...f, audience: a, departmentID: '', employeeID: '' }))}
                                            style={{
                                                flex: 1, padding: '9px 0', borderRadius: 10,
                                                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                                                border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(0,0,0,0.1)',
                                                background: active ? 'rgba(99,102,241,0.08)' : 'transparent',
                                                color: active ? '#6366f1' : 'rgba(0,0,0,0.45)',
                                            }}>
                                            {a === 'Department-Specific' ? 'Department' : 'Employee'}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {!isEdit && form.audience === 'Department-Specific' && (
                        <div className="pg-field">
                            <label className="pg-label">Department</label>
                            <select name="departmentID" value={form.departmentID} onChange={handle} required className="pg-input" style={{ cursor: 'pointer' }}>
                                <option value="">Select department</option>
                                {departmentList.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                        </div>
                    )}

                    {!isEdit && form.audience === 'Employee-Specific' && (
                        <div className="pg-field">
                            <label className="pg-label">Employee</label>
                            <select name="employeeID" value={form.employeeID} onChange={handle} required className="pg-input" style={{ cursor: 'pointer' }}>
                                <option value="">Select employee</option>
                                {employeeList.map(e => <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="pg-field">
                        <label className="pg-label">Notice Title</label>
                        <input name="title" value={form.title} onChange={handle} required placeholder="e.g. Office closed on Friday" className="pg-input" />
                    </div>

                    <div className="pg-field">
                        <label className="pg-label">Notice Content</label>
                        <textarea name="content" value={form.content} onChange={handle} required rows={5} placeholder="Write the notice content here…" className="pg-textarea" />
                    </div>

                    <div className="pg-modal-actions">
                        <button type="button" className="pg-btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="pg-btn-primary">{isEdit ? 'Save Changes' : 'Issue Notice'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const NoticePage = () => {
    const dispatch    = useDispatch()
    const noticeState = useSelector(s => s.NoticeReducer)
    const empState    = useSelector(s => s.HREmployeesPageReducer)
    const deptState   = useSelector(s => s.HRDepartmentPageReducer)
    const hrState     = useSelector(s => s.HRReducer)
    const HRID        = hrState?.data?.HRid || hrState?.data?.data?._id || ''

    const [activeTab,  setActiveTab]  = useState('department')
    const [search,     setSearch]     = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    useEffect(() => {
        dispatch(HandleGetAllNotices())
        dispatch(HandleGetHREmployees({ apiroute: 'GETALL' }))
        dispatch(HandleGetHRDepartments({ apiroute: 'GETALL' }))
    }, [])

    useEffect(() => { if (noticeState.fetchData) dispatch(HandleGetAllNotices()) }, [noticeState.fetchData])

    const employeeList   = empState.data  || []
    const departmentList = deptState.data || []

    const handleCreate = (form) => { dispatch(HandleCreateNotice(form)); setDialogOpen(false) }
    const handleUpdate = (payload) => { dispatch(HandleUpdateNotice(payload)); setEditTarget(null) }
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

    const deptNotices = filterNotices(noticeState.departmentNotices || [])
    const empNotices  = filterNotices(noticeState.employeeNotices   || [])
    const totalCount  = (noticeState.departmentNotices?.length || 0) + (noticeState.employeeNotices?.length || 0)

    if (noticeState.isLoading && totalCount === 0) return <Loading />

    return (
        <PageShell>

            <style>{`
                .notice-card:hover { border-color: rgba(99,102,241,0.2) !important; background: rgba(99,102,241,0.02) !important; }
                [data-theme="dark"] .notice-card { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.08) !important; }
                [data-theme="dark"] .notice-card:hover { border-color: rgba(99,102,241,0.3) !important; background: rgba(99,102,241,0.06) !important; }
                [data-theme="dark"] .notice-title { color: #f1f5f9 !important; }
                [data-theme="dark"] .notice-content { color: rgba(255,255,255,0.55) !important; border-top-color: rgba(255,255,255,0.07) !important; }
                [data-theme="dark"] .notice-meta { color: rgba(255,255,255,0.35) !important; }
            `}</style>

            <PageHeader eyebrow="Communications" title="Issue Notices" subtitle="Send notices to departments or individual employees">
                <button className="pg-btn-primary" onClick={() => setDialogOpen(true)}>+ Issue Notice</button>
            </PageHeader>

            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                    { label: 'Total Notices',      value: totalCount },
                    { label: 'Department Notices', value: noticeState.departmentNotices?.length || 0 },
                    { label: 'Employee Notices',   value: noticeState.employeeNotices?.length   || 0 },
                ].map(s => (
                    <div key={s.label} className="pg-stat-card">
                        <span className="pg-stat-value">{s.value}</span>
                        <span className="pg-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="pg-filters">
                <input className="pg-search" type="text" placeholder="Search notices…"
                    value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 240 }} />
                <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                    {[
                        { key: 'department', label: `Department (${deptNotices.length})` },
                        { key: 'employee',   label: `Employee (${empNotices.length})` },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`pg-pill${activeTab === tab.key ? ' active' : ''}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
                {activeTab === 'department' && (
                    deptNotices.length === 0
                        ? <div className="pg-empty"><span className="pg-empty-icon">📋</span><p className="pg-empty-title">No department notices found.</p></div>
                        : deptNotices.map(n => <NoticeCard key={n._id} notice={n} onEdit={setEditTarget} onDelete={handleDelete} />)
                )}
                {activeTab === 'employee' && (
                    empNotices.length === 0
                        ? <div className="pg-empty"><span className="pg-empty-icon">📋</span><p className="pg-empty-title">No employee notices found.</p></div>
                        : empNotices.map(n => <NoticeCard key={n._id} notice={n} onEdit={setEditTarget} onDelete={handleDelete} />)
                )}
            </div>

            <NoticeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleCreate}
                employeeList={employeeList} departmentList={departmentList} HRID={HRID} />
            <NoticeDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSubmit={handleUpdate}
                employeeList={employeeList} departmentList={departmentList} HRID={HRID} initialData={editTarget} />
        </PageShell>
    )
}