import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetMyRequests, HandleSubmitRequest,
    HandleUpdateMyRequest, HandleGetEmployeeProfile
} from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --mrq-bg: #18181b;
    --mrq-border: #27272a;
    --mrq-hover: rgba(255,255,255,0.04);
    --mrq-text-main: #fafafa;
    --mrq-text-muted: #a1a1aa;
    --mrq-text-faint: #71717a;
    --mrq-modal-overlay: rgba(0,0,0,0.6);
    --mrq-th-bg: rgba(255,255,255,0.05);

    --mrq-pending-bg: rgba(234,179,8,0.15);
    --mrq-pending-text: #fbbf24;
    --mrq-pending-border: rgba(234,179,8,0.3);

    --mrq-approved-bg: rgba(22,163,74,0.15);
    --mrq-approved-text: #4ade80;
    --mrq-approved-border: rgba(22,163,74,0.3);

    --mrq-denied-bg: rgba(220,38,38,0.15);
    --mrq-denied-text: #f87171;
    --mrq-denied-border: rgba(220,38,38,0.3);
  }

  .mrq-status-pending { background: var(--mrq-pending-bg, #fef9c3); color: var(--mrq-pending-text, #854d0e); border-color: var(--mrq-pending-border, #fde047); }
  .mrq-status-approved { background: var(--mrq-approved-bg, #dcfce7); color: var(--mrq-approved-text, #166534); border-color: var(--mrq-approved-border, #86efac); }
  .mrq-status-denied { background: var(--mrq-denied-bg, #fee2e2); color: var(--mrq-denied-text, #991b1b); border-color: var(--mrq-denied-border, #fca5a5); }

  .mrq-card-pending { background: var(--mrq-pending-bg, #fefce8); border-color: var(--mrq-pending-border, #fef08a); }
  .mrq-card-approved { background: var(--mrq-approved-bg, #f0fdf4); border-color: var(--mrq-approved-border, #bbf7d0); }
  .mrq-card-denied { background: var(--mrq-denied-bg, #fef2f2); border-color: var(--mrq-denied-border, #fecaca); }

  .mrq-text-pending { color: var(--mrq-pending-text, #854d0e); }
  .mrq-text-approved { color: var(--mrq-approved-text, #15803d); }
  .mrq-text-denied { color: var(--mrq-denied-text, #dc2626); }
`

const StatusBadge = ({ status }) => {
    const map = {
        Pending:  'mrq-status-pending',
        Approved: 'mrq-status-approved',
        Denied:   'mrq-status-denied',
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
    const fc = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-transparent text-inherit"
    const lc = "block text-xs font-medium mb-1"
    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ backgroundColor: 'var(--mrq-modal-overlay, rgba(0,0,0,0.4))' }}>
            <div className="rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 border" style={{ backgroundColor: 'var(--mrq-bg, #ffffff)', borderColor: 'var(--mrq-border, transparent)', color: 'var(--mrq-text-main, #000)' }}>
                <h2 className="text-xl font-bold mb-5" style={{ color: 'var(--mrq-text-main)' }}>{isEdit ? 'Edit Request' : 'Submit Request'}</h2>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className={lc} style={{ color: 'var(--mrq-text-muted)' }}>Title</label>
                        <input name="requesttitle" value={form.requesttitle} onChange={handle} required
                            placeholder="e.g. Equipment Request" className={fc} style={{ borderColor: 'var(--mrq-border)' }} />
                    </div>
                    <div>
                        <label className={lc} style={{ color: 'var(--mrq-text-muted)' }}>Details</label>
                        <textarea name="requestconent" value={form.requestconent} onChange={handle} required
                            rows={4} placeholder="Describe your request in detail..." className={fc} style={{ borderColor: 'var(--mrq-border)' }} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 rounded-lg border text-sm transition-colors" style={{ backgroundColor: 'transparent', borderColor: 'var(--mrq-border)', color: 'var(--mrq-text-muted)' }}>Cancel</button>
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
        <PageShell>
            <style>{styles}</style>

            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <PageHeader eyebrow="Work" title="My Requests" subtitle="Submit and track your requests to HR" />
                </div>
                <button onClick={() => setCreateOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm">
                    + New Request
                </button>
            </div>

            {/* Summary counters */}
            <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-xl border p-4 flex flex-col gap-1 mrq-card-pending`}>
                    <span className="text-2xl font-bold mrq-text-pending">{pending}</span>
                    <span className="text-sm" style={{ color: 'var(--mrq-text-muted, #6b7280)' }}>Pending</span>
                </div>
                <div className={`rounded-xl border p-4 flex flex-col gap-1 mrq-card-approved`}>
                    <span className="text-2xl font-bold mrq-text-approved">{approved}</span>
                    <span className="text-sm" style={{ color: 'var(--mrq-text-muted, #6b7280)' }}>Approved</span>
                </div>
                <div className={`rounded-xl border p-4 flex flex-col gap-1 mrq-card-denied`}>
                    <span className="text-2xl font-bold mrq-text-denied">{denied}</span>
                    <span className="text-sm" style={{ color: 'var(--mrq-text-muted, #6b7280)' }}>Denied</span>
                </div>
            </div>

            <div className="flex flex-col gap-2 overflow-auto flex-1">
                {/* Table Header */}
                <div className="grid grid-cols-5 rounded-lg px-4 py-2 text-xs font-semibold sticky top-0" style={{ backgroundColor: 'var(--mrq-th-bg, #f3f4f6)', color: 'var(--mrq-text-muted, #6b7280)' }}>
                    <span className="col-span-2">Request</span>
                    <span>Department</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {requests.length === 0
                    ? <div className="text-center py-16" style={{ color: 'var(--mrq-text-faint, #9ca3af)' }}>No requests submitted yet.</div>
                    : requests.map(r => (
                        <div key={r._id} className="grid grid-cols-5 border rounded-lg px-4 py-3 text-sm items-center transition-all" 
                             style={{ backgroundColor: 'var(--mrq-bg, #ffffff)', borderColor: 'var(--mrq-border, #e5e7eb)', color: 'var(--mrq-text-main)' }}>
                            <div className="col-span-2">
                                <p className="font-medium">{r.requesttitle}</p>
                                <p className="text-xs truncate" style={{ color: 'var(--mrq-text-faint, #9ca3af)' }}>{r.requestconent}</p>
                            </div>
                            <span style={{ color: 'var(--mrq-text-muted, #6b7280)', fontSize: '0.75rem' }}>{r.department?.name || '—'}</span>
                            <StatusBadge status={r.status} />
                            <button disabled={r.status !== 'Pending'} onClick={() => setEditTarget(r)}
                                className="px-3 py-1 rounded-md text-xs border transition-colors disabled:opacity-40 disabled:cursor-not-allowed w-fit"
                                style={{ borderColor: 'var(--mrq-border)', color: 'var(--mrq-text-muted)' }}>
                                Edit
                            </button>
                        </div>
                    ))
                }
            </div>

            <RequestDialog open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleSubmit} />
            <RequestDialog open={!!editTarget} onClose={() => setEditTarget(null)} onSubmit={handleUpdate} initialData={editTarget} />
        </PageShell>
    )
}