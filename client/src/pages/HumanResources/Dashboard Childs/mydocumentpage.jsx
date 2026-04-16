import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyDocuments } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --mdoc-bg: #18181b;
    --mdoc-border: #27272a;
    --mdoc-hover: rgba(255,255,255,0.04);
    --mdoc-th-bg: rgba(255,255,255,0.05);
    
    --mdoc-text-main: #fafafa;
    --mdoc-text-muted: #a1a1aa;
    --mdoc-text-faint: #71717a;

    --mdoc-red-bg: rgba(220,38,38,0.15);
    --mdoc-red-border: rgba(220,38,38,0.3);
    --mdoc-red-text: #f87171;

    --mdoc-yellow-bg: rgba(245,158,11,0.15);
    --mdoc-yellow-border: rgba(245,158,11,0.3);
    --mdoc-yellow-text: #fbbf24;

    --mdoc-green-bg: rgba(22,163,74,0.15);
    --mdoc-green-border: rgba(22,163,74,0.3);
    --mdoc-green-text: #4ade80;
    
    --mdoc-orange-text: #fb923c;
  }

  .mdoc-text-main { color: var(--mdoc-text-main, #1f2937); }
  .mdoc-text-muted { color: var(--mdoc-text-muted, #6b7280); }
  .mdoc-text-faint { color: var(--mdoc-text-faint, #9ca3af); }

  .mdoc-status-valid { background: var(--mdoc-green-bg, #dcfce7); color: var(--mdoc-green-text, #166534); border-color: var(--mdoc-green-border, #86efac); }
  .mdoc-status-expiring { background: var(--mdoc-yellow-bg, #fef9c3); color: var(--mdoc-yellow-text, #854d0e); border-color: var(--mdoc-yellow-border, #fde047); }
  .mdoc-status-expired { background: var(--mdoc-red-bg, #fee2e2); color: var(--mdoc-red-text, #991b1b); border-color: var(--mdoc-red-border, #fca5a5); }

  .mdoc-text-expired { color: var(--mdoc-red-text, #ef4444); }
  .mdoc-text-urgent { color: var(--mdoc-orange-text, #f97316); }
  .mdoc-text-expiring { color: var(--mdoc-yellow-text, #ca8a04); }

  .mdoc-alert-red { background: var(--mdoc-red-bg, #fef2f2); border-color: var(--mdoc-red-border, #fecaca); }
  .mdoc-alert-yellow { background: var(--mdoc-yellow-bg, #fefce8); border-color: var(--mdoc-yellow-border, #fef08a); }
  
  .mdoc-alert-red-text { color: var(--mdoc-red-text, #b91c1c); }
  .mdoc-alert-yellow-text { color: var(--mdoc-yellow-text, #a16207); }

  .mdoc-summary-valid { background: var(--mdoc-green-bg, #f0fdf4); border-color: var(--mdoc-green-border, #bbf7d0); }
  .mdoc-summary-expiring { background: var(--mdoc-yellow-bg, #fefce8); border-color: var(--mdoc-yellow-border, #fef08a); }
  .mdoc-summary-expired { background: var(--mdoc-red-bg, #fef2f2); border-color: var(--mdoc-red-border, #fecaca); }

  .mdoc-summary-valid-text { color: var(--mdoc-green-text, #15803d); }
  .mdoc-summary-expiring-text { color: var(--mdoc-yellow-text, #a16207); }
  .mdoc-summary-expired-text { color: var(--mdoc-red-text, #dc2626); }

  .mdoc-th { background: var(--mdoc-th-bg, #f3f4f6); color: var(--mdoc-text-muted, #6b7280); }
  
  .mdoc-row { background: var(--mdoc-bg, #ffffff); border: 1px solid; }
  .mdoc-row:hover { background: var(--mdoc-hover, #f9fafb); }
  
  .mdoc-row-valid { border-color: var(--mdoc-border, #e5e7eb); }
  .mdoc-row-expiring { border-color: var(--mdoc-yellow-border, #fef08a); }
  .mdoc-row-expired { border-color: var(--mdoc-red-border, #fecaca); }
  
  .mdoc-footer { border-top: 1px solid var(--mdoc-border, #f3f4f6); }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        'Valid':         'mdoc-status-valid',
        'Expiring Soon': 'mdoc-status-expiring',
        'Expired':       'mdoc-status-expired',
    }
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>
            {status}
        </span>
    )
}

// ─── Days remaining pill ──────────────────────────────────────────────────────
const DaysRemaining = ({ expirydate }) => {
    const days = Math.ceil((new Date(expirydate) - new Date()) / (1000 * 60 * 60 * 24))
    if (days < 0) return <span className="text-xs font-medium mdoc-text-expired">{Math.abs(days)}d overdue</span>
    if (days <= 7)  return <span className="text-xs font-medium mdoc-text-urgent">{days}d left</span>
    if (days <= 30) return <span className="text-xs font-medium mdoc-text-expiring">{days}d left</span>
    return <span className="text-xs mdoc-text-muted">{days}d left</span>
}

// ─── Alert banner ─────────────────────────────────────────────────────────────
const AlertBanner = ({ documents }) => {
    const expired     = documents.filter(d => d.status === 'Expired')
    const expiringSoon = documents.filter(d => d.status === 'Expiring Soon')

    if (!expired.length && !expiringSoon.length) return null

    return (
        <div className="flex flex-col gap-2">
            {expired.length > 0 && (
                <div className="mdoc-alert-red rounded-xl px-4 py-3 flex items-start gap-3 border">
                    <span className="mdoc-alert-red-text text-lg shrink-0">⚠</span>
                    <div>
                        <p className="text-sm font-semibold mdoc-alert-red-text">
                            {expired.length} document{expired.length > 1 ? 's' : ''} expired
                        </p>
                        <p className="text-xs mdoc-alert-red-text mt-0.5 opacity-80">
                            {expired.map(d => d.documentname).join(', ')} — please contact HR immediately
                        </p>
                    </div>
                </div>
            )}
            {expiringSoon.length > 0 && (
                <div className="mdoc-alert-yellow rounded-xl px-4 py-3 flex items-start gap-3 border">
                    <span className="mdoc-alert-yellow-text text-lg shrink-0">⏰</span>
                    <div>
                        <p className="text-sm font-semibold mdoc-alert-yellow-text">
                            {expiringSoon.length} document{expiringSoon.length > 1 ? 's' : ''} expiring soon
                        </p>
                        <p className="text-xs mdoc-alert-yellow-text mt-0.5 opacity-80">
                            {expiringSoon.map(d => d.documentname).join(', ')} — begin renewal process
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const MyDocumentsPage = () => {
    const dispatch  = useDispatch()
    const state     = useSelector(s => s.EmployeeDashboardReducer)
    const documents = state.documents || []

    useEffect(() => { dispatch(HandleGetMyDocuments()) }, [])
    useEffect(() => {
        if (state.fetchDocuments) dispatch(HandleGetMyDocuments())
    }, [state.fetchDocuments])

    const valid        = documents.filter(d => d.status === 'Valid').length
    const expiringSoon = documents.filter(d => d.status === 'Expiring Soon').length
    const expired      = documents.filter(d => d.status === 'Expired').length

    if (state.isLoading && !documents.length) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>

                {/* Header */}
                <div>
                    <PageHeader eyebrow="Finance & Docs" title="My Documents" subtitle="Track the validity of your personal documents" />
                </div>

                {/* Alert banners — shown only when action is needed */}
                <AlertBanner documents={documents} />

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="mdoc-summary-valid rounded-xl border p-4 flex flex-col gap-1">
                        <span className="text-2xl font-bold mdoc-summary-valid-text">{valid}</span>
                        <span className="text-sm mdoc-text-muted">Valid</span>
                    </div>
                    <div className="mdoc-summary-expiring rounded-xl border p-4 flex flex-col gap-1">
                        <span className="text-2xl font-bold mdoc-summary-expiring-text">{expiringSoon}</span>
                        <span className="text-sm mdoc-text-muted">Expiring Soon</span>
                    </div>
                    <div className="mdoc-summary-expired rounded-xl border p-4 flex flex-col gap-1">
                        <span className="text-2xl font-bold mdoc-summary-expired-text">{expired}</span>
                        <span className="text-sm mdoc-text-muted">Expired</span>
                    </div>
                </div>

                {/* Documents list */}
                <div className="flex flex-col gap-2 overflow-auto flex-1">

                    {/* Table header */}
                    <div className="grid grid-cols-6 mdoc-th rounded-lg px-4 py-2 text-xs font-semibold sticky top-0">
                        <span className="col-span-2">Document</span>
                        <span>Type</span>
                        <span>Expiry Date</span>
                        <span>Remaining</span>
                        <span>Status</span>
                    </div>

                    {documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 mdoc-text-faint">
                            <p className="text-sm">No documents on record.</p>
                            <p className="text-xs">HR will upload your documents here once they are added to the system.</p>
                        </div>
                    ) : (
                        documents.map(doc => (
                            <div
                                key={doc._id}
                                className={`grid grid-cols-6 mdoc-row rounded-lg px-4 py-3 text-sm items-center transition-all ${
                                    doc.status === 'Expired'       ? 'mdoc-row-expired'    :
                                    doc.status === 'Expiring Soon' ? 'mdoc-row-expiring' : 'mdoc-row-valid'
                                }`}
                            >
                                <div className="col-span-2">
                                    <p className="font-medium mdoc-text-main">{doc.documentname}</p>
                                    {doc.documentnumber && (
                                        <p className="text-xs mdoc-text-faint">#{doc.documentnumber}</p>
                                    )}
                                    {doc.notes && (
                                        <p className="text-xs mdoc-text-faint truncate">{doc.notes}</p>
                                    )}
                                </div>
                                <span className="mdoc-text-muted text-xs">{doc.documenttype}</span>
                                <div>
                                    <p className="mdoc-text-main">{fmtDate(doc.expirydate)}</p>
                                    {doc.issuedate && (
                                        <p className="text-xs mdoc-text-faint">Issued: {fmtDate(doc.issuedate)}</p>
                                    )}
                                </div>
                                <DaysRemaining expirydate={doc.expirydate} />
                                <div>
                                    <StatusBadge status={doc.status} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Info note */}
                <p className="text-xs mdoc-text-faint mdoc-footer pt-3 mt-2">
                    Document records are managed by HR. If you believe a document is missing or incorrect, please contact your HR team.
                </p>
            </PageShell>
        </>
    )
}