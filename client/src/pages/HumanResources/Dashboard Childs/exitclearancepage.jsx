import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetAllClearances,
    HandleGetClearanceSummary,
    HandleCreateExitClearance,
    HandleToggleChecklistItem,
    HandleUpdateClearanceStatus,
    HandleUpdateClearanceDetails,
    HandleDeleteClearance,
} from '../../../redux/Thunks/ExitClearanceThunk'
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --ex-drawer-bg: #09090b;
    --ex-modal-bg: #18181b;
    --ex-text-main: #fafafa;
    --ex-text-muted: #a1a1aa;
    --ex-text-faint: #71717a;
    --ex-border: #27272a;
    --ex-subtle-bg: rgba(255,255,255,0.04);
    --ex-prog-bg: rgba(255,255,255,0.1);
    --ex-shadow: -24px 0 64px rgba(0,0,0,0.6);
  }

  [data-theme='dark'] .pg-modal {
    background: var(--ex-modal-bg) !important;
    border: 1px solid var(--ex-border) !important;
    box-shadow: 0 24px 64px rgba(0,0,0,0.8) !important;
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const initials = (first, last) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()

// ─── Status tokens ────────────────────────────────────────────────────────────
const STATUS_TOKENS = {
    'Pending':     { bg: 'rgba(234,179,8,0.09)',  color: '#854d0e', border: 'rgba(234,179,8,0.3)'   },
    'In Progress': { bg: 'rgba(99,102,241,0.08)', color: '#4f46e5', border: 'rgba(99,102,241,0.22)' },
    'Cleared':     { bg: 'rgba(22,163,74,0.08)',  color: '#15803d', border: 'rgba(22,163,74,0.22)'  },
    'Rejected':    { bg: 'rgba(220,38,38,0.07)',  color: '#dc2626', border: 'rgba(220,38,38,0.2)'   },
}

// ─── Status pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
    const t = STATUS_TOKENS[status] || { bg: 'var(--ex-subtle-bg, rgba(0,0,0,0.04))', color: 'var(--ex-text-muted, rgba(0,0,0,0.45))', border: 'var(--ex-border, rgba(0,0,0,0.1))' }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ first, last, size = 30, fontSize = 11 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize,
        fontFamily: "'DM Serif Display', serif", letterSpacing: '0.03em',
    }}>
        {initials(first, last)}
    </div>
)

// ─── Checklist progress bar ───────────────────────────────────────────────────
const ChecklistBar = ({ checklist }) => {
    const total = checklist?.length || 0
    const done  = checklist?.filter(i => i.completed).length || 0
    const pct   = total ? Math.round((done / total) * 100) : 0
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 110 }}>
            <div style={{ flex: 1, height: 5, borderRadius: 100, background: 'var(--ex-prog-bg, rgba(0,0,0,0.07))' }}>
                <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 100,
                    background: pct === 100 ? '#16a34a' : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    transition: 'width 0.3s ease',
                }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--ex-text-muted, rgba(0,0,0,0.4))', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {done}/{total}
            </span>
        </div>
    )
}

// ─── Create modal ─────────────────────────────────────────────────────────────
const CreateModal = ({ onClose, onSubmit, employees }) => {
    const [form, setForm] = useState({
        employeeID: '', reason: '', resignationDate: '', lastWorkingDate: '', notes: '',
    })
    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal" style={{ maxWidth: 520 }}>
                <div>
                    <div style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.25rem', color: 'var(--ex-text-main, #0f172a)',
                        letterSpacing: '-0.02em', marginBottom: 4,
                    }}>
                        Initiate Exit Clearance
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ex-text-muted, rgba(0,0,0,0.38))', margin: 0 }}>
                        A default 8-item checklist will be created automatically.
                    </p>
                </div>

                <div className="pg-divider" />

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="pg-field">
                        <label className="pg-label">Employee *</label>
                        <select name="employeeID" value={form.employeeID} onChange={handle} required
                            className="pg-input" style={{ cursor: 'pointer' }}>
                            <option value="">Select employee…</option>
                            {(employees || []).map(e => (
                                <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>
                            ))}
                        </select>
                    </div>

                    <div className="pg-field">
                        <label className="pg-label">Reason *</label>
                        <textarea name="reason" value={form.reason} onChange={handle} required
                            rows={3} placeholder="Resignation, termination, contract end…"
                            className="pg-textarea" />
                    </div>

                    <div className="pg-grid-2">
                        <div className="pg-field">
                            <label className="pg-label">Resignation Date</label>
                            <input name="resignationDate" type="date" value={form.resignationDate}
                                onChange={handle} className="pg-input" />
                        </div>
                        <div className="pg-field">
                            <label className="pg-label">Last Working Date</label>
                            <input name="lastWorkingDate" type="date" value={form.lastWorkingDate}
                                onChange={handle} className="pg-input" />
                        </div>
                    </div>

                    <div className="pg-field">
                        <label className="pg-label">Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handle}
                            rows={2} placeholder="Any additional notes…" className="pg-textarea" />
                    </div>

                    <div className="pg-modal-actions">
                        <button type="button" className="pg-btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="pg-btn-primary">Initiate Clearance</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Detail drawer ────────────────────────────────────────────────────────────
const DetailDrawer = ({ clearance, onClose, onToggle, onStatusChange, onDetailsUpdate, onDelete }) => {
    const [statusForm,  setStatusForm]  = useState({ status: '', notes: '' })
    const [detailsForm, setDetailsForm] = useState({ resignationDate: '', lastWorkingDate: '', reason: '', notes: '' })
    const [tab, setTab] = useState('checklist')

    useEffect(() => {
        if (clearance) {
            setStatusForm({ status: clearance.status, notes: clearance.notes || '' })
            setDetailsForm({
                resignationDate: clearance.resignationDate ? clearance.resignationDate.split('T')[0] : '',
                lastWorkingDate: clearance.lastWorkingDate ? clearance.lastWorkingDate.split('T')[0] : '',
                reason: clearance.reason || '',
                notes:  clearance.notes  || '',
            })
        }
    }, [clearance])

    if (!clearance) return null

    const isFinished = clearance.status === 'Cleared' || clearance.status === 'Rejected'
    const total = clearance.checklist?.length || 0
    const done  = clearance.checklist?.filter(i => i.completed).length || 0
    const pct   = total ? Math.round((done / total) * 100) : 0

    const TABS = [
        { key: 'checklist', label: `Checklist (${done}/${total})` },
        { key: 'status',    label: 'Status'  },
        { key: 'details',   label: 'Details' },
    ]

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--ex-drawer-bg, #fff)', width: '100%', maxWidth: 520,
                    height: '100%', display: 'flex', flexDirection: 'column',
                    boxShadow: 'var(--ex-shadow, -24px 0 64px rgba(0,0,0,0.12))',
                    fontFamily: "'DM Sans', sans-serif",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--ex-border, rgba(0,0,0,0.06))', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar first={clearance.employee?.firstname} last={clearance.employee?.lastname} size={44} fontSize={15} />
                            <div>
                                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: 'var(--ex-text-main, #0f172a)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                    {clearance.employee?.firstname} {clearance.employee?.lastname}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--ex-text-muted, rgba(0,0,0,0.38))', marginTop: 3 }}>
                                    Initiated {fmtDate(clearance.createdAt)}
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ex-text-muted, rgba(0,0,0,0.35))', lineHeight: 1, padding: 4 }}>✕</button>
                    </div>

                    {/* Status + reason */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                        <StatusPill status={clearance.status} />
                        <span style={{ fontSize: 12, color: 'var(--ex-text-muted, rgba(0,0,0,0.4))', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {clearance.reason}
                        </span>
                    </div>

                    {/* Key dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14, background: 'var(--ex-subtle-bg, rgba(0,0,0,0.012))', border: '1px solid var(--ex-border, rgba(0,0,0,0.07))', borderRadius: 10, padding: '10px 14px' }}>
                        {[
                            { label: 'Resignation',  value: fmtDate(clearance.resignationDate) },
                            { label: 'Last Working', value: fmtDate(clearance.lastWorkingDate) },
                            { label: 'Exit Date',    value: fmtDate(clearance.exitDate)        },
                        ].map(f => (
                            <div key={f.label}>
                                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ex-text-muted, rgba(0,0,0,0.35))', marginBottom: 3 }}>{f.label}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ex-text-main, #0f172a)' }}>{f.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--ex-border, rgba(0,0,0,0.07))', padding: '0 24px', flexShrink: 0 }}>
                    {TABS.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            padding: '10px 16px', fontSize: 13, fontWeight: 500,
                            color: tab === t.key ? '#6366f1' : 'var(--ex-text-muted, rgba(0,0,0,0.4))',
                            borderBottom: `2px solid ${tab === t.key ? '#6366f1' : 'transparent'}`,
                            background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid',
                            borderBottomColor: tab === t.key ? '#6366f1' : 'transparent',
                            cursor: 'pointer', whiteSpace: 'nowrap',
                            fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s',
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* ── Checklist ── */}
                    {tab === 'checklist' && (
                        <>
                            {/* Progress summary */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ex-subtle-bg, rgba(0,0,0,0.012))', border: '1px solid var(--ex-border, rgba(0,0,0,0.07))', borderRadius: 10, padding: '10px 14px' }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ex-text-muted, rgba(0,0,0,0.55))' }}>Clearance Tasks</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 110, height: 5, borderRadius: 100, background: 'var(--ex-prog-bg, rgba(0,0,0,0.07))' }}>
                                        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 100, background: pct === 100 ? '#16a34a' : 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.3s ease' }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: 'var(--ex-text-muted, rgba(0,0,0,0.4))', fontWeight: 500 }}>{done}/{total}</span>
                                </div>
                            </div>

                            {clearance.checklist?.map(item => (
                                <div key={item._id} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: 12,
                                    padding: '12px 14px', borderRadius: 12,
                                    background: item.completed ? 'rgba(22,163,74,0.05)' : 'var(--ex-subtle-bg, rgba(0,0,0,0.012))',
                                    border: `1px solid ${item.completed ? 'rgba(22,163,74,0.2)' : 'var(--ex-border, rgba(0,0,0,0.07))'}`,
                                    transition: 'all 0.15s',
                                }}>
                                    <button
                                        disabled={isFinished}
                                        onClick={() => onToggle({ clearanceID: clearance._id, itemID: item._id })}
                                        style={{
                                            width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                                            cursor: isFinished ? 'not-allowed' : 'pointer',
                                            border: item.completed ? 'none' : '1.5px solid var(--ex-border, rgba(0,0,0,0.2))',
                                            background: item.completed ? '#16a34a' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            opacity: isFinished && !item.completed ? 0.45 : 1,
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        {item.completed && <span style={{ color: 'white', fontSize: 11, lineHeight: 1, fontWeight: 700 }}>✓</span>}
                                    </button>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: item.completed ? 'var(--ex-text-faint, rgba(0,0,0,0.35))' : 'var(--ex-text-main, #0f172a)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                                            {item.task}
                                        </div>
                                        {item.completed && item.completedBy && (
                                            <div style={{ fontSize: 11, color: '#15803d', marginTop: 3 }}>
                                                Completed by {item.completedBy?.firstname} {item.completedBy?.lastname} · {fmtDate(item.completedAt)}
                                            </div>
                                        )}
                                        {item.notes && (
                                            <div style={{ fontSize: 11, color: 'var(--ex-text-muted, rgba(0,0,0,0.38))', marginTop: 2, fontStyle: 'italic' }}>{item.notes}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {/* ── Status ── */}
                    {tab === 'status' && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--ex-subtle-bg, rgba(0,0,0,0.012))', border: '1px solid var(--ex-border, rgba(0,0,0,0.07))' }}>
                                <span style={{ fontSize: 12, color: 'var(--ex-text-muted, rgba(0,0,0,0.4))' }}>Current status</span>
                                <StatusPill status={clearance.status} />
                            </div>

                            <div className="pg-field">
                                <label className="pg-label">Change Status</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {['Pending', 'In Progress', 'Cleared', 'Rejected'].map(opt => {
                                        const t = STATUS_TOKENS[opt]
                                        const active = statusForm.status === opt
                                        return (
                                            <button key={opt} type="button"
                                                onClick={() => setStatusForm(f => ({ ...f, status: opt }))}
                                                style={{
                                                    padding: '8px 0', borderRadius: 10, fontSize: 12, fontWeight: 500,
                                                    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
                                                    border: active ? `1px solid ${t.border}` : '1px solid var(--ex-border, rgba(0,0,0,0.1))',
                                                    background: active ? t.bg : 'transparent',
                                                    color: active ? t.color : 'var(--ex-text-muted, rgba(0,0,0,0.45))',
                                                }}>
                                                {opt}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="pg-field">
                                <label className="pg-label">Notes</label>
                                <textarea className="pg-textarea" value={statusForm.notes}
                                    onChange={e => setStatusForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={3} placeholder="Add a note about this status change…" />
                            </div>

                            <button className="pg-btn-primary" style={{ alignSelf: 'flex-start' }}
                                onClick={() => onStatusChange({ clearanceID: clearance._id, ...statusForm })}>
                                Update Status
                            </button>

                            <div style={{ borderTop: '1px solid var(--ex-border, rgba(0,0,0,0.06))', paddingTop: 16, marginTop: 8 }}>
                                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ex-text-muted, rgba(0,0,0,0.3))', marginBottom: 10 }}>
                                    Danger Zone
                                </div>
                                <button className="pg-btn-danger"
                                    onClick={() => { if (window.confirm('Delete this clearance? This cannot be undone.')) onDelete(clearance._id) }}>
                                    Delete Clearance
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Details ── */}
                    {tab === 'details' && (
                        <>
                            <div className="pg-field">
                                <label className="pg-label">Reason</label>
                                <textarea className="pg-textarea" value={detailsForm.reason}
                                    onChange={e => setDetailsForm(f => ({ ...f, reason: e.target.value }))} rows={3} />
                            </div>

                            <div className="pg-grid-2">
                                <div className="pg-field">
                                    <label className="pg-label">Resignation Date</label>
                                    <input type="date" className="pg-input" value={detailsForm.resignationDate}
                                        onChange={e => setDetailsForm(f => ({ ...f, resignationDate: e.target.value }))} />
                                </div>
                                <div className="pg-field">
                                    <label className="pg-label">Last Working Date</label>
                                    <input type="date" className="pg-input" value={detailsForm.lastWorkingDate}
                                        onChange={e => setDetailsForm(f => ({ ...f, lastWorkingDate: e.target.value }))} />
                                </div>
                            </div>

                            <div className="pg-field">
                                <label className="pg-label">Notes</label>
                                <textarea className="pg-textarea" value={detailsForm.notes}
                                    onChange={e => setDetailsForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
                            </div>

                            <button className="pg-btn-primary" style={{ alignSelf: 'flex-start' }}
                                onClick={() => onDetailsUpdate({ clearanceID: clearance._id, ...detailsForm })}>
                                Save Details
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const ExitClearancePage = () => {
    const dispatch  = useDispatch()
    const state     = useSelector(s => s.ExitClearanceReducer)
    const empState  = useSelector(s => s.HREmployeesPageReducer)

    const [createOpen,      setCreateOpen]      = useState(false)
    const [activeClearance, setActiveClearance] = useState(null)
    const [filterStatus,    setFilterStatus]    = useState('All')
    const [search,          setSearch]          = useState('')

    useEffect(() => {
        dispatch(HandleGetAllClearances())
        dispatch(HandleGetClearanceSummary())
        dispatch(HandleGetHREmployees({ apiroute: 'GETALL' }))
    }, [])

    useEffect(() => {
        if (state.fetchData) {
            dispatch(HandleGetAllClearances())
            dispatch(HandleGetClearanceSummary())
        }
    }, [state.fetchData])

    useEffect(() => {
        if (activeClearance) {
            const updated = state.clearances.find(c => c._id === activeClearance._id)
            if (updated) setActiveClearance(updated)
        }
    }, [state.clearances])

    const handleCreate        = (form)    => { dispatch(HandleCreateExitClearance(form)); setCreateOpen(false) }
    const handleToggle        = (payload) => dispatch(HandleToggleChecklistItem(payload))
    const handleStatusChange  = (payload) => dispatch(HandleUpdateClearanceStatus(payload))
    const handleDetailsUpdate = (payload) => dispatch(HandleUpdateClearanceDetails(payload))
    const handleDelete        = (id)      => { dispatch(HandleDeleteClearance(id)); setActiveClearance(null) }

    const filtered = (state.clearances || []).filter(c => {
        const name = `${c.employee?.firstname ?? ''} ${c.employee?.lastname ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) &&
            (filterStatus === 'All' || c.status === filterStatus)
    })

    const summary = state.summary || { total: 0, pending: 0, inProgress: 0, cleared: 0, rejected: 0 }

    if (state.isLoading && !state.clearances.length) return <Loading />

    return (
        <PageShell>
            <style>{styles}</style>

            {/* ── Header ── */}
            <PageHeader
                eyebrow="Offboarding"
                title="Exit Clearance"
                subtitle="Manage employee exit processes, checklists and final sign-off"
            >
                <button className="pg-btn-primary" onClick={() => setCreateOpen(true)}>
                    + Initiate Clearance
                </button>
            </PageHeader>

            {/* ── Stats ── */}
            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {[
                    { label: 'Total',       value: summary.total      },
                    { label: 'Pending',     value: summary.pending    },
                    { label: 'In Progress', value: summary.inProgress },
                    { label: 'Cleared',     value: summary.cleared    },
                    { label: 'Rejected',    value: summary.rejected   },
                ].map(s => (
                    <div key={s.label} className="pg-stat-card">
                        <span className="pg-stat-value">{s.value ?? 0}</span>
                        <span className="pg-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* ── Filters ── */}
            <div className="pg-filters">
                <input
                    className="pg-search"
                    type="text"
                    placeholder="Search by employee name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ minWidth: 240 }}
                />
                {['All', 'Pending', 'In Progress', 'Cleared', 'Rejected'].map(s => (
                    <button
                        key={s}
                        className={`pg-pill${filterStatus === s ? ' active' : ''}`}
                        onClick={() => setFilterStatus(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* ── Table ── */}
            <div className="pg-table-wrap">
                <div className="pg-table-head" style={{ gridTemplateColumns: '2fr 2fr 1fr 140px 110px' }}>
                    <span className="pg-th">Employee</span>
                    <span className="pg-th">Reason</span>
                    <span className="pg-th">Last Working</span>
                    <span className="pg-th">Progress</span>
                    <span className="pg-th">Status</span>
                </div>

                {state.error?.status && (
                    <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: '#dc2626' }}>
                        {state.error.message}
                    </div>
                )}

                {!state.error?.status && filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">📋</span>
                        <p className="pg-empty-title">
                            {search || filterStatus !== 'All' ? 'No clearances match your filters' : 'No exit clearances yet'}
                        </p>
                        <p className="pg-empty-sub">
                            {search || filterStatus !== 'All' ? 'Try adjusting your search or filter.' : 'Initiate a clearance to get started.'}
                        </p>
                    </div>
                )}

                {filtered.map(c => (
                    <div
                        key={c._id}
                        className="pg-table-row"
                        style={{ gridTemplateColumns: '2fr 2fr 1fr 140px 110px', cursor: 'pointer' }}
                        onClick={() => setActiveClearance(c)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar first={c.employee?.firstname} last={c.employee?.lastname} />
                            <div>
                                <div className="pg-td-name">{c.employee?.firstname} {c.employee?.lastname}</div>
                                <div className="pg-td-sub">Initiated {fmtDate(c.createdAt)}</div>
                            </div>
                        </div>

                        <div className="pg-td-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                            {c.reason}
                        </div>

                        <span className="pg-td-muted">{fmtDate(c.lastWorkingDate)}</span>

                        <span><ChecklistBar checklist={c.checklist} /></span>

                        <span><StatusPill status={c.status} /></span>
                    </div>
                ))}
            </div>

            {/* ── Modals / Drawer ── */}
            {createOpen && (
                <CreateModal
                    onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate}
                    employees={empState.data}
                />
            )}

            {activeClearance && (
                <DetailDrawer
                    clearance={activeClearance}
                    onClose={() => setActiveClearance(null)}
                    onToggle={handleToggle}
                    onStatusChange={handleStatusChange}
                    onDetailsUpdate={handleDetailsUpdate}
                    onDelete={handleDelete}
                />
            )}

        </PageShell>
    )
}