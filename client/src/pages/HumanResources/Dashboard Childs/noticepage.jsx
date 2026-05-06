import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
    HandleGetAllNotices, 
    HandleCreateNotice, 
    HandleUpdateNotice, 
    HandleDeleteNotice 
} from '../../../redux/Thunks/NoticeThunk'
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
        <span className={isDept ? 'nt-pill-dept' : 'nt-pill-emp'} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            whiteSpace: 'nowrap', border: '1px solid'
        }}>
            {isDept ? 'Department' : 'Employee'}
        </span>
    )
}

// ─── Notice card ──────────────────────────────────────────────────────────────
const NoticeCard = ({ notice, onEdit, onDelete }) => (
    <div className="notice-card" style={{
        borderRadius: 14, padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'border-color 0.2s, background 0.2s',
        fontFamily: "'DM Sans', sans-serif",
    }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }} className="notice-title">
                    {String(notice.title || 'Untitled Notice')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <AudiencePill audience={notice.audience} />
                    <span style={{ fontSize: 11 }} className="notice-meta">
                        {notice.audience === 'Department-Specific'
                            ? `Dept: ${notice.department?.name || 'Organisation-wide'}`
                            : `To: ${notice.employee?.firstname || ''} ${notice.employee?.lastname || ''}`}
                    </span>
                    <span style={{ fontSize: 11 }} className="notice-meta">· {fmtDate(notice.createdAt)}</span>
                </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="pg-action-btn indigo" onClick={() => onEdit(notice)}>Edit</button>
                <button className="pg-action-btn red" onClick={() => onDelete(notice._id)}>Delete</button>
            </div>
        </div>
        <p style={{
            fontSize: 13, lineHeight: 1.65,
            borderTop: '1px solid', paddingTop: 10, margin: 0,
            whiteSpace: 'pre-line',
        }} className="notice-content">
            {String(notice.content || '')}
        </p>
        {notice.createdby && (
            <p style={{ fontSize: 11, textAlign: 'right', margin: 0 }} className="notice-meta">
                Issued by {String(notice.createdby?.firstname || '')} {String(notice.createdby?.lastname || '')}
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
                title:        initialData.title || '',
                content:      initialData.content || '',
                audience:     initialData.audience || 'Department-Specific',
                departmentID: initialData.department?._id || initialData.department || '',
                employeeID:   initialData.employee?._id   || initialData.employee   || '',
            })
        } else { setForm(empty) }
    }, [open, initialData, isEdit])

    if (!open) return null

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => {
        e.preventDefault()
        onSubmit(form)
    }

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal" style={{ maxWidth: 520 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.25rem', letterSpacing: '-0.02em', marginBottom: 4 }} className="notice-title">
                    {isEdit ? 'Edit Notice' : 'Issue New Notice'}
                </div>
                <div className="pg-divider" />
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {!isEdit && (
                        <div className="pg-field">
                            <label className="pg-label">Send To</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {['Department-Specific', 'Employee-Specific'].map(a => (
                                    <button key={a} type="button"
                                        onClick={() => setForm(f => ({ ...f, audience: a, departmentID: '', employeeID: '' }))}
                                        className={form.audience === a ? 'nt-tab-btn active' : 'nt-tab-btn'}>
                                        {a === 'Department-Specific' ? 'Department' : 'Employee'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {!isEdit && form.audience === 'Department-Specific' && (
                        <div className="pg-field">
                            <label className="pg-label">Department</label>
                            <select name="departmentID" value={form.departmentID} onChange={handle} required className="pg-input">
                                <option value="">Select department</option>
                                {departmentList.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                            </select>
                        </div>
                    )}
                    {!isEdit && form.audience === 'Employee-Specific' && (
                        <div className="pg-field">
                            <label className="pg-label">Employee</label>
                            <select name="employeeID" value={form.employeeID} onChange={handle} required className="pg-input">
                                <option value="">Select employee</option>
                                {employeeList.map(e => <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="pg-field">
                        <label className="pg-label">Notice Title</label>
                        <input name="title" value={form.title} onChange={handle} required placeholder="Title" className="pg-input" />
                    </div>
                    <div className="pg-field">
                        <label className="pg-label">Notice Content</label>
                        <textarea name="content" value={form.content} onChange={handle} required rows={5} placeholder="Content" className="pg-textarea" />
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

    const [activeTab,  setActiveTab] = useState('department')
    const [search,     setSearch]    = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    useEffect(() => {
        dispatch(HandleGetAllNotices())
        dispatch(HandleGetHREmployees({ apiroute: 'GETALL' }))
        dispatch(HandleGetHRDepartments({ apiroute: 'GETALL' }))
    }, [dispatch])

    useEffect(() => { if (noticeState.fetchData) dispatch(HandleGetAllNotices()) }, [noticeState.fetchData, dispatch])

    // HANDLERS DEFINED HERE
    const handleCreate = (form) => {
        const payload = { ...form, HRID };
        dispatch(HandleCreateNotice(payload));
        setDialogOpen(false);
    }

    const handleUpdate = (form) => {
        dispatch(HandleUpdateNotice({ 
            noticeID: form.noticeID, 
            UpdatedData: { title: form.title, content: form.content } 
        }));
        setEditTarget(null);
    }

    const handleDelete = (id) => {
        if (window.confirm('Delete this notice?')) {
            dispatch(HandleDeleteNotice({ noticeID: id }));
        }
    }

    const filterNotices = (list) => {
        if (!Array.isArray(list)) return []
        if (!search.trim()) return list
        const q = search.toLowerCase()
        return list.filter(n =>
            (n.title?.toLowerCase() || '').includes(q) ||
            (n.content?.toLowerCase() || '').includes(q)
        )
    }

    const deptNotices = filterNotices(noticeState.departmentNotices || [])
    const empNotices  = filterNotices(noticeState.employeeNotices   || [])
    const totalCount  = (noticeState.departmentNotices?.length || 0) + (noticeState.employeeNotices?.length || 0)

    if (noticeState.isLoading && totalCount === 0) return <Loading />

    return (
        <PageShell>
            <style>{`
                .notice-card { background: rgba(0,0,0,0.012); border: 1px solid rgba(0,0,0,0.07); }
                .notice-card:hover { border-color: rgba(99,102,241,0.2) !important; background: rgba(99,102,241,0.02) !important; }
                .notice-title { color: #0f172a; }
                .notice-content { color: rgba(0,0,0,0.6); border-top-color: rgba(0,0,0,0.06); }
                .notice-meta { color: rgba(0,0,0,0.38); }
                .nt-pill-dept { background: rgba(99,102,241,0.08); color: #4f46e5; border-color: rgba(99,102,241,0.22); }
                .nt-pill-emp { background: rgba(139,92,246,0.08); color: #7c3aed; border-color: rgba(139,92,246,0.22); }
                .nt-tab-btn { flex: 1; padding: 9px 0; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; background: transparent; border: 1px solid rgba(0,0,0,0.1); color: rgba(0,0,0,0.45); }
                .nt-tab-btn.active { border-color: rgba(99,102,241,0.4); background: rgba(99,102,241,0.08); color: #6366f1; }
                [data-theme="dark"] .notice-card { background: rgba(255,255,255,0.03) !important; border-color: rgba(255,255,255,0.08) !important; }
                [data-theme="dark"] .notice-title { color: #f1f5f9 !important; }
                [data-theme="dark"] .notice-content { color: rgba(255,255,255,0.55) !important; border-top-color: rgba(255,255,255,0.07) !important; }
                [data-theme="dark"] .notice-meta { color: rgba(255,255,255,0.45) !important; }
                [data-theme="dark"] .nt-pill-dept { background: rgba(99,102,241,0.15); color: #818cf8; border-color: rgba(99,102,241,0.3); }
                [data-theme="dark"] .nt-pill-emp { background: rgba(139,92,246,0.15); color: #a78bfa; border-color: rgba(139,92,246,0.3); }
                [data-theme="dark"] .nt-tab-btn { border-color: rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); }
                [data-theme="dark"] .nt-tab-btn.active { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.12); color: #818cf8; }
                [data-theme="dark"] .pg-modal { background: #18181b !important; border: 1px solid #27272a !important; }
            `}</style>

            <PageHeader eyebrow="Communications" title="Issue Notices" subtitle="Send notices to departments or individual employees">
                <button className="pg-btn-primary" onClick={() => setDialogOpen(true)}>+ Issue Notice</button>
            </PageHeader>

            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="pg-stat-card"><span className="pg-stat-value">{totalCount}</span><span className="pg-stat-label">Total Notices</span></div>
                <div className="pg-stat-card"><span className="pg-stat-value">{deptNotices.length}</span><span className="pg-stat-label">Department Notices</span></div>
                <div className="pg-stat-card"><span className="pg-stat-value">{empNotices.length}</span><span className="pg-stat-label">Employee Notices</span></div>
            </div>

            <div className="pg-filters">
                <input className="pg-search" type="text" placeholder="Search notices…"
                    value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 240 }} />
                <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                    <button onClick={() => setActiveTab('department')} className={`pg-pill${activeTab === 'department' ? ' active' : ''}`}>Department</button>
                    <button onClick={() => setActiveTab('employee')} className={`pg-pill${activeTab === 'employee' ? ' active' : ''}`}>Employee</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
                {activeTab === 'department' ? (
                    deptNotices.length === 0 
                        ? <div className="pg-empty"><p className="pg-empty-title">No department notices found.</p></div>
                        : deptNotices.map(n => <NoticeCard key={n._id} notice={n} onEdit={setEditTarget} onDelete={handleDelete} />)
                ) : (
                    empNotices.length === 0 
                        ? <div className="pg-empty"><p className="pg-empty-title">No employee notices found.</p></div>
                        : empNotices.map(n => <NoticeCard key={n._id} notice={n} onEdit={setEditTarget} onDelete={handleDelete} />)
                )}
            </div>

            {/* Modals with verified onSubmit handlers */}
            <NoticeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleCreate}
                employeeList={empState.data || []} departmentList={deptState.data || []} HRID={HRID} />
            <NoticeDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSubmit={handleUpdate}
                employeeList={empState.data || []} departmentList={deptState.data || []} HRID={HRID} initialData={editTarget} />
        </PageShell>
    )
}