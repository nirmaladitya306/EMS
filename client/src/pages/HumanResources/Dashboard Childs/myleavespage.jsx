import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetMyLeaves, HandleApplyLeave,
    HandleUpdateMyLeave, HandleDeleteMyLeave,
    HandleGetEmployeeProfile
} from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const STATUS_CONFIG = {
    Pending:  { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.28)', color: '#b45309' },
    Approved: { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.25)', color: '#059669' },
    Rejected: { bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.25)',  color: '#dc2626' },
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .lv-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 100px; border: 1px solid;
    font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .lv-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
`

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status]
    if (!cfg) return <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)' }}>{status}</span>
    return (
        <span className="lv-status-badge" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
            <span className="lv-status-dot" style={{ background: cfg.color }} />
            {status}
        </span>
    )
}

const LeaveDialog = ({ open, onClose, onSubmit, initialData }) => {
    const isEdit = !!initialData
    const empty  = { title: '', reason: '', startdate: '', enddate: '' }
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
    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal">
                <h2 className="pg-modal-title">{isEdit ? 'Edit Leave Request' : 'Apply for Leave'}</h2>
                <div className="pg-divider" />
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="pg-field">
                        <label className="pg-label">Title</label>
                        <input name="title" value={form.title} onChange={handle} required
                            placeholder="e.g. Annual Leave" className="pg-input" />
                    </div>
                    <div className="pg-field">
                        <label className="pg-label">Reason</label>
                        <textarea name="reason" value={form.reason} onChange={handle} required
                            rows={3} placeholder="Describe your reason…" className="pg-textarea" />
                    </div>
                    <div className="pg-grid-2">
                        <div className="pg-field">
                            <label className="pg-label">Start Date</label>
                            <input name="startdate" type="date" value={form.startdate} onChange={handle} required className="pg-input" />
                        </div>
                        <div className="pg-field">
                            <label className="pg-label">End Date</label>
                            <input name="enddate" type="date" value={form.enddate} onChange={handle} required className="pg-input" />
                        </div>
                    </div>
                    <div className="pg-modal-actions">
                        <button type="button" onClick={onClose} className="pg-btn-ghost">Cancel</button>
                        <button type="submit" className="pg-btn-primary">
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
    const leaves     = state.leaves || []

    const [applyOpen,  setApplyOpen]  = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    useEffect(() => { if (!profile) dispatch(HandleGetEmployeeProfile()) }, [])
    useEffect(() => { dispatch(HandleGetMyLeaves()) }, [])
    useEffect(() => { if (state.fetchLeaves) dispatch(HandleGetMyLeaves()) }, [state.fetchLeaves])

    const handleApply  = (form) => { dispatch(HandleApplyLeave({ ...form, employeeID })); setApplyOpen(false) }
    const handleUpdate = (form) => { dispatch(HandleUpdateMyLeave(form)); setEditTarget(null) }
    const handleDelete = (leaveID) => {
        if (window.confirm('Delete this leave request?')) dispatch(HandleDeleteMyLeave({ leaveID }))
    }

    const pending  = leaves.filter(l => l.status === 'Pending').length
    const approved = leaves.filter(l => l.status === 'Approved').length
    const rejected = leaves.filter(l => l.status === 'Rejected').length

    if (state.isLoading && !leaves.length) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>

                <PageHeader eyebrow="Work" title="My Leaves" subtitle="Apply for and manage your leave requests">
                    <button className="pg-btn-primary" onClick={() => setApplyOpen(true)}>
                        + Apply for Leave
                    </button>
                </PageHeader>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Pending',  value: pending  },
                        { label: 'Approved', value: approved },
                        { label: 'Rejected', value: rejected },
                    ].map(c => (
                        <div key={c.label} className="pg-stat-card">
                            <span className="pg-stat-value">{c.value}</span>
                            <span className="pg-stat-label">{c.label}</span>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="pg-table-wrap">
                    <div className="pg-table-head grid grid-cols-6">
                        <span className="pg-th col-span-2">Title</span>
                        <span className="pg-th">From</span>
                        <span className="pg-th">To</span>
                        <span className="pg-th">Status</span>
                        <span className="pg-th">Actions</span>
                    </div>

                    {leaves.length === 0 ? (
                        <div className="pg-empty">
                            <span className="pg-empty-icon">🌴</span>
                            <p className="pg-empty-title">No leave requests yet</p>
                            <p className="pg-empty-sub">Apply for leave and it will appear here.</p>
                        </div>
                    ) : leaves.map(l => (
                        <div key={l._id} className="pg-table-row grid grid-cols-6">
                            <div className="col-span-2">
                                <p className="pg-td-name">{l.title}</p>
                                <p className="pg-td-sub truncate">{l.reason}</p>
                            </div>
                            <span className="pg-td-muted">{fmtDate(l.startdate)}</span>
                            <span className="pg-td-muted">{fmtDate(l.enddate)}</span>
                            <StatusBadge status={l.status} />
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                    disabled={l.status !== 'Pending'}
                                    onClick={() => setEditTarget(l)}
                                    className="pg-action-btn indigo"
                                >
                                    Edit
                                </button>
                                <button
                                    disabled={l.status !== 'Pending'}
                                    onClick={() => handleDelete(l._id)}
                                    className="pg-action-btn red"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <LeaveDialog open={applyOpen}    onClose={() => setApplyOpen(false)}  onSubmit={handleApply} />
                <LeaveDialog open={!!editTarget} onClose={() => setEditTarget(null)}  onSubmit={handleUpdate} initialData={editTarget} />

            </PageShell>
        </>
    )
}