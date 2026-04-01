import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyDocuments } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        'Valid':         'bg-green-100  text-green-800  border-green-300',
        'Expiring Soon': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'Expired':       'bg-red-100    text-red-800    border-red-300',
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
    if (days < 0) return <span className="text-xs text-red-500 font-medium">{Math.abs(days)}d overdue</span>
    if (days <= 7)  return <span className="text-xs text-orange-500 font-medium">{days}d left</span>
    if (days <= 30) return <span className="text-xs text-yellow-600 font-medium">{days}d left</span>
    return <span className="text-xs text-gray-400">{days}d left</span>
}

// ─── Alert banner ─────────────────────────────────────────────────────────────
const AlertBanner = ({ documents }) => {
    const expired     = documents.filter(d => d.status === 'Expired')
    const expiringSoon = documents.filter(d => d.status === 'Expiring Soon')

    if (!expired.length && !expiringSoon.length) return null

    return (
        <div className="flex flex-col gap-2">
            {expired.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <span className="text-red-500 text-lg shrink-0">⚠</span>
                    <div>
                        <p className="text-sm font-semibold text-red-700">
                            {expired.length} document{expired.length > 1 ? 's' : ''} expired
                        </p>
                        <p className="text-xs text-red-500 mt-0.5">
                            {expired.map(d => d.documentname).join(', ')} — please contact HR immediately
                        </p>
                    </div>
                </div>
            )}
            {expiringSoon.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <span className="text-yellow-600 text-lg shrink-0">⏰</span>
                    <div>
                        <p className="text-sm font-semibold text-yellow-700">
                            {expiringSoon.length} document{expiringSoon.length > 1 ? 's' : ''} expiring soon
                        </p>
                        <p className="text-xs text-yellow-600 mt-0.5">
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
        <PageShell>

            {/* Header */}
            <div>
                <PageHeader eyebrow="Finance & Docs" title="My Documents" subtitle="Track the validity of your personal documents" />
                <p className="text-sm text-gray-500 mt-1">
                    Track the validity of your personal and professional documents
                </p>
            </div>

            {/* Alert banners — shown only when action is needed */}
            <AlertBanner documents={documents} />

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex flex-col gap-1">
                    <span className="text-2xl font-bold text-green-700">{valid}</span>
                    <span className="text-sm text-gray-500">Valid</span>
                </div>
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 flex flex-col gap-1">
                    <span className="text-2xl font-bold text-yellow-700">{expiringSoon}</span>
                    <span className="text-sm text-gray-500">Expiring Soon</span>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex flex-col gap-1">
                    <span className="text-2xl font-bold text-red-600">{expired}</span>
                    <span className="text-sm text-gray-500">Expired</span>
                </div>
            </div>

            {/* Documents list */}
            <div className="flex flex-col gap-2 overflow-auto flex-1">

                {/* Table header */}
                <div className="grid grid-cols-6 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Document</span>
                    <span>Type</span>
                    <span>Expiry Date</span>
                    <span>Remaining</span>
                    <span>Status</span>
                </div>

                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
                        <p className="text-sm">No documents on record.</p>
                        <p className="text-xs">HR will upload your documents here once they are added to the system.</p>
                    </div>
                ) : (
                    documents.map(doc => (
                        <div
                            key={doc._id}
                            className={`grid grid-cols-6 bg-white border rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all ${
                                doc.status === 'Expired'       ? 'border-red-200'    :
                                doc.status === 'Expiring Soon' ? 'border-yellow-200' : 'border-gray-200'
                            }`}
                        >
                            <div className="col-span-2">
                                <p className="font-medium text-gray-800">{doc.documentname}</p>
                                {doc.documentnumber && (
                                    <p className="text-xs text-gray-400">#{doc.documentnumber}</p>
                                )}
                                {doc.notes && (
                                    <p className="text-xs text-gray-400 truncate">{doc.notes}</p>
                                )}
                            </div>
                            <span className="text-gray-500 text-xs">{doc.documenttype}</span>
                            <div>
                                <p className="text-gray-700">{fmtDate(doc.expirydate)}</p>
                                {doc.issuedate && (
                                    <p className="text-xs text-gray-400">Issued: {fmtDate(doc.issuedate)}</p>
                                )}
                            </div>
                            <DaysRemaining expirydate={doc.expirydate} />
                            <StatusBadge status={doc.status} />
                        </div>
                    ))
                )}
            </div>

            {/* Info note */}
            <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                Document records are managed by HR. If you believe a document is missing or incorrect, please contact your HR team.
            </p>
        </PageShell>
    )
}