import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetDocuments,
    HandleGetDocumentSummary,
    HandleCreateDocument,
    HandleUpdateDocument,
    HandleDeleteDocument,
    HandleRunAlertEngine
} from '../../../redux/Thunks/DocumentThunk'
import { Loading } from '../../../components/common/loading'

// ─── Status → rgba design tokens ─────────────────────────────────────────────
const STATUS_CONFIG = {
    'Valid':         { bg: 'rgba(16,185,129,0.07)',  border: 'rgba(16,185,129,0.25)', color: '#059669' },
    'Expiring Soon': { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.28)', color: '#b45309' },
    'Expired':       { bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.25)',  color: '#dc2626' },
}

const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── Status badge ── */
  .doc-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 100px; border: 1px solid;
    font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .doc-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* ── Days remaining ── */
  .doc-days-overdue { font-size: 11px; font-weight: 600; color: var(--doc-overdue, #dc2626); margin-top: 2px; }
  .doc-days-urgent  { font-size: 11px; font-weight: 600; color: var(--doc-urgent, #b45309); margin-top: 2px; }
  .doc-days-ok      { font-size: 11px; color: var(--doc-ok, rgba(0,0,0,0.3)); margin-top: 2px; }

  /* ── Alert engine button (amber accent, ghost style) ── */
  .doc-btn-alert {
    padding: 9px 18px; background: rgba(245,158,11,0.08); color: var(--doc-urgent, #b45309);
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    border: 1px solid rgba(245,158,11,0.25); border-radius: 10px; cursor: pointer;
    transition: background 0.15s; white-space: nowrap;
    display: flex; align-items: center; gap: 6px;
  }
  .doc-btn-alert:hover    { background: rgba(245,158,11,0.14); border-color: rgba(245,158,11,0.4); }
  .doc-btn-alert:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Toast notification ── */
  .doc-toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 60;
    background: var(--doc-modal-bg, #ffffff); border: 1px solid var(--doc-toast-border, rgba(16,185,129,0.3));
    border-radius: 14px; padding: 14px 18px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    display: flex; align-items: center; gap: 12px;
    font-family: 'DM Sans', sans-serif; min-width: 260px;
    animation: toastIn 0.3s ease;
  }
  .doc-toast-icon {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; flex-shrink: 0;
  }
  .doc-toast-msg  { font-size: 13px; color: var(--doc-text-main, #0f172a); font-weight: 500; flex: 1; }
  .doc-toast-close {
    background: none; border: none; cursor: pointer;
    color: var(--doc-text-muted, rgba(0,0,0,0.3)); font-size: 16px; line-height: 1; padding: 0;
    transition: color 0.15s;
  }
  .doc-toast-close:hover { color: var(--doc-text-main, rgba(0,0,0,0.6)); }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Modal wider variant ── */
  .doc-modal {
    background: var(--doc-modal-bg, #ffffff); 
    border: 1px solid var(--doc-border, transparent);
    border-radius: 20px; padding: 28px 30px;
    width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0,0,0,0.12);
    display: flex; flex-direction: column; gap: 18px;
    font-family: 'DM Sans', sans-serif;
  }

  /* ═══════════════════════════════════════════════════════
     DARK MODE OVERRIDES
  ═══════════════════════════════════════════════════════ */
  [data-theme='dark'] {
    --doc-modal-bg: #18181b;
    --doc-border: #27272a;
    --doc-toast-border: rgba(16,185,129,0.4);
    --doc-text-main: #fafafa;
    --doc-text-muted: #a1a1aa;
    
    /* Brighter warning colors to pop on dark backgrounds */
    --doc-urgent: #fbbf24; 
    --doc-overdue: #f87171;
    --doc-ok: #a1a1aa;
  }
  [data-theme='dark'] .doc-modal { box-shadow: 0 24px 64px rgba(0,0,0,0.8); }
  [data-theme='dark'] .doc-toast { box-shadow: 0 8px 32px rgba(0,0,0,0.6); }
  [data-theme='dark'] .pg-modal-title { color: #fafafa; }
`

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status]
    if (!cfg) return <span style={{ fontSize: '12px', color: 'var(--doc-text-muted, rgba(0,0,0,0.4))' }}>{status}</span>
    return (
        <span
            className="doc-status-badge"
            style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
        >
            <span className="doc-status-dot" style={{ background: cfg.color }} />
            {status}
        </span>
    )
}

// ─── Days remaining cell ──────────────────────────────────────────────────────
const DaysRemaining = ({ expirydate }) => {
    const days = Math.ceil((new Date(expirydate) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0)   return <span className="doc-days-overdue">{Math.abs(days)}d overdue</span>
    if (days <= 7)  return <span className="doc-days-urgent">{days}d left</span>
    if (days <= 30) return <span className="doc-days-urgent" style={{ opacity: 0.8 }}>{days}d left</span>
    return <span className="doc-days-ok">{days}d left</span>
}

// ─── Alert toast ──────────────────────────────────────────────────────────────
const AlertToast = ({ result, onClose }) => {
    if (!result) return null
    return (
        <div className="doc-toast">
            <div className="doc-toast-icon">✅</div>
            <span className="doc-toast-msg">{result.message}</span>
            <button className="doc-toast-close" onClick={onClose}>×</button>
        </div>
    )
}

// ─── Add / Edit document dialog ───────────────────────────────────────────────
const DocumentDialog = ({ open, onClose, onSubmit, employeeList, initialData }) => {
    const isEdit = !!initialData
    const empty  = { employeeID: '', documentname: '', documenttype: 'ID Proof', documentnumber: '', issuedate: '', expirydate: '', notes: '' }
    const [form, setForm] = useState(empty)

    useEffect(() => {
        if (open) setForm(initialData ? {
            documentID:     initialData._id,
            employeeID:     initialData.employee?._id || '',
            documentname:   initialData.documentname,
            documenttype:   initialData.documenttype,
            documentnumber: initialData.documentnumber || '',
            issuedate:      initialData.issuedate ? initialData.issuedate.split('T')[0] : '',
            expirydate:     initialData.expirydate ? initialData.expirydate.split('T')[0] : '',
            notes:          initialData.notes || '',
        } : empty)
    }, [open, initialData])

    if (!open) return null

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="pg-modal-overlay">
            <div className="doc-modal">
                <div>
                    <h2 className="pg-modal-title">{isEdit ? 'Edit Document' : 'Add New Document'}</h2>
                </div>

                <div className="pg-divider" />

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Employee selector — create only */}
                    {!isEdit && (
                        <div className="pg-field">
                            <label className="pg-label">Employee</label>
                            <select name="employeeID" value={form.employeeID} onChange={handle} required className="pg-input" style={{ cursor: 'pointer' }}>
                                <option value="">Select employee</option>
                                {employeeList.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.firstname} {emp.lastname}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Doc name + type */}
                    <div className="pg-grid-2">
                        <div className="pg-field">
                            <label className="pg-label">Document Name</label>
                            <input name="documentname" value={form.documentname} onChange={handle} required
                                placeholder="e.g. Passport" className="pg-input" />
                        </div>
                        <div className="pg-field">
                            <label className="pg-label">Document Type</label>
                            <select name="documenttype" value={form.documenttype} onChange={handle} className="pg-input" style={{ cursor: 'pointer' }}>
                                {['ID Proof', 'Passport', 'Work Visa', 'Certification', 'Contract', 'Other'].map(t => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Doc number */}
                    <div className="pg-field">
                        <label className="pg-label">
                            Document Number
                            <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--doc-text-muted, rgba(0,0,0,0.28))', marginLeft: '6px' }}>(optional)</span>
                        </label>
                        <input name="documentnumber" value={form.documentnumber} onChange={handle}
                            placeholder="e.g. A1234567" className="pg-input" />
                    </div>

                    {/* Issue + expiry dates */}
                    <div className="pg-grid-2">
                        <div className="pg-field">
                            <label className="pg-label">
                                Issue Date
                                <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--doc-text-muted, rgba(0,0,0,0.28))', marginLeft: '6px' }}>(optional)</span>
                            </label>
                            <input type="date" name="issuedate" value={form.issuedate} onChange={handle} className="pg-input" />
                        </div>
                        <div className="pg-field">
                            <label className="pg-label">Expiry Date</label>
                            <input type="date" name="expirydate" value={form.expirydate} onChange={handle} required className="pg-input" />
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="pg-field">
                        <label className="pg-label">
                            Notes
                            <span style={{ fontWeight: 400, textTransform: 'none', color: 'var(--doc-text-muted, rgba(0,0,0,0.28))', marginLeft: '6px' }}>(optional)</span>
                        </label>
                        <textarea name="notes" value={form.notes} onChange={handle} rows={2}
                            placeholder="Any additional notes…" className="pg-textarea" />
                    </div>

                    <div className="pg-modal-actions">
                        <button type="button" onClick={onClose} className="pg-btn-ghost">Cancel</button>
                        <button type="submit" className="pg-btn-primary">
                            {isEdit ? 'Save Changes' : 'Add Document'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const DocumentExpiryPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.DocumentReducer)

    const [dialogOpen,    setDialogOpen]    = useState(false)
    const [editTarget,    setEditTarget]    = useState(null)
    const [filterStatus,  setFilterStatus]  = useState('All')
    const [searchTerm,    setSearchTerm]    = useState('')
    const [showToast,     setShowToast]     = useState(false)
    const [runningAlerts, setRunningAlerts] = useState(false)

    // Derive employee list from existing documents for the dropdown
    const employeeList = []
    const seen = new Set()
    ;(state.data || []).forEach(doc => {
        if (doc.employee && !seen.has(doc.employee._id)) {
            seen.add(doc.employee._id)
            employeeList.push(doc.employee)
        }
    })

    useEffect(() => {
        dispatch(HandleGetDocuments())
        dispatch(HandleGetDocumentSummary())
    }, [])

    useEffect(() => {
        if (state.fetchData) {
            dispatch(HandleGetDocuments())
            dispatch(HandleGetDocumentSummary())
        }
    }, [state.fetchData])

    useEffect(() => {
        if (state.alertResult) setShowToast(true)
    }, [state.alertResult])

    const handleAdd    = (form) => { dispatch(HandleCreateDocument(form)); setDialogOpen(false) }
    const handleEdit   = (form) => { dispatch(HandleUpdateDocument(form)); setEditTarget(null) }
    const handleDelete = (docID) => {
        if (window.confirm('Delete this document record?')) dispatch(HandleDeleteDocument({ documentID: docID }))
    }
    const handleRunAlerts = async () => {
        setRunningAlerts(true)
        await dispatch(HandleRunAlertEngine())
        setRunningAlerts(false)
    }

    const filtered = (state.data || []).filter(doc => {
        const matchStatus = filterStatus === 'All' || doc.status === filterStatus
        const name = `${doc.employee?.firstname || ''} ${doc.employee?.lastname || ''}`.toLowerCase()
        const matchSearch = name.includes(searchTerm.toLowerCase()) ||
            doc.documentname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.documenttype.toLowerCase().includes(searchTerm.toLowerCase())
        return matchStatus && matchSearch
    })

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>

                {/* ── Header ── */}
                <PageHeader
                    eyebrow="Operations"
                    title="Document Expiry"
                    subtitle="Track document validity and trigger email alerts"
                >
                    <button
                        className="doc-btn-alert"
                        onClick={handleRunAlerts}
                        disabled={runningAlerts}
                    >
                        ⚡ {runningAlerts ? 'Running…' : 'Run Alert Engine'}
                    </button>
                    <button className="pg-btn-primary" onClick={() => setDialogOpen(true)}>
                        + Add Document
                    </button>
                </PageHeader>

                {/* ── Stats ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total',         value: state.summary?.total        ?? 0 },
                        { label: 'Valid',          value: state.summary?.valid        ?? 0 },
                        { label: 'Expiring Soon',  value: state.summary?.expiringSoon ?? 0 },
                        { label: 'Expired',        value: state.summary?.expired      ?? 0 },
                    ].map(c => (
                        <div key={c.label} className="pg-stat-card">
                            <span className="pg-stat-value">{c.value}</span>
                            <span className="pg-stat-label">{c.label}</span>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <div className="pg-filters">
                    <input
                        type="text"
                        placeholder="Search by employee or document…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pg-search"
                    />
                    {['All', 'Valid', 'Expiring Soon', 'Expired'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`pg-pill${filterStatus === s ? ' active' : ''}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* ── Table ── */}
                <div className="pg-table-wrap">
                    <div className="pg-table-head grid grid-cols-6">
                        {['Employee', 'Document', 'Type', 'Expiry', 'Status', 'Actions'].map(h => (
                            <span key={h} className="pg-th">{h}</span>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="pg-empty">
                            <span className="pg-empty-icon">📄</span>
                            <p className="pg-empty-title">No documents found</p>
                            <p className="pg-empty-sub">Try adjusting your search or filter, or add a new document record.</p>
                        </div>
                    ) : filtered.map(doc => (
                        <div key={doc._id} className="pg-table-row grid grid-cols-6">
                            {/* Employee */}
                            <div>
                                <p className="pg-td-name">{doc.employee?.firstname} {doc.employee?.lastname}</p>
                            </div>

                            {/* Document name */}
                            <div>
                                <p className="pg-td-name">{doc.documentname}</p>
                                {doc.documentnumber && (
                                    <p className="pg-td-sub">#{doc.documentnumber}</p>
                                )}
                            </div>

                            {/* Type */}
                            <span className="pg-td-muted">{doc.documenttype}</span>

                            {/* Expiry date + countdown */}
                            <div>
                                <p style={{ fontSize: '13px', color: 'var(--doc-text-main, #0f172a)', fontWeight: 500 }}>{fmtDate(doc.expirydate)}</p>
                                <DaysRemaining expirydate={doc.expirydate} />
                            </div>

                            {/* Status */}
                            <StatusBadge status={doc.status} />

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="pg-action-btn indigo" onClick={() => setEditTarget(doc)}>Edit</button>
                                <button className="pg-action-btn red"    onClick={() => handleDelete(doc._id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Dialogs ── */}
                <DocumentDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSubmit={handleAdd}
                    employeeList={employeeList}
                />
                <DocumentDialog
                    open={!!editTarget}
                    onClose={() => setEditTarget(null)}
                    onSubmit={handleEdit}
                    employeeList={employeeList}
                    initialData={editTarget}
                />

                {/* ── Toast ── */}
                {showToast && (
                    <AlertToast result={state.alertResult} onClose={() => setShowToast(false)} />
                )}

            </PageShell>
        </>
    )
}