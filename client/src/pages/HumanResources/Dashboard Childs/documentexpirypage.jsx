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

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles = {
        'Valid':          'bg-green-100 text-green-800 border border-green-300',
        'Expiring Soon':  'bg-yellow-100 text-yellow-800 border border-yellow-300',
        'Expired':        'bg-red-100 text-red-800 border border-red-300',
    }
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || ''}`}>
            {status}
        </span>
    )
}

// ─── Summary card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, count, color }) => (
    <div className={`rounded-xl p-4 flex flex-col gap-1 border ${color}`}>
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

// ─── Add / Edit dialog ────────────────────────────────────────────────────────
const DocumentDialog = ({ open, onClose, onSubmit, employeeList, initialData }) => {
    const isEdit = !!initialData
    const empty  = { employeeID: '', documentname: '', documenttype: 'ID Proof', documentnumber: '', issuedate: '', expirydate: '', notes: '' }
    const [form, setForm] = useState(empty)

    useEffect(() => {
        if (open) setForm(initialData
            ? {
                documentID:     initialData._id,
                employeeID:     initialData.employee?._id || '',
                documentname:   initialData.documentname,
                documenttype:   initialData.documenttype,
                documentnumber: initialData.documentnumber || '',
                issuedate:      initialData.issuedate ? initialData.issuedate.split('T')[0] : '',
                expirydate:     initialData.expirydate ? initialData.expirydate.split('T')[0] : '',
                notes:          initialData.notes || ''
            }
            : empty
        )
    }, [open, initialData])

    if (!open) return null

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit(form) }

    const fieldClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
    const labelClass = "block text-sm font-medium text-gray-700 mb-1"

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4">
                <h2 className="text-xl font-bold mb-5">{isEdit ? 'Edit Document' : 'Add New Document'}</h2>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    {!isEdit && (
                        <div>
                            <label className={labelClass}>Employee</label>
                            <select name="employeeID" value={form.employeeID} onChange={handle} required className={fieldClass}>
                                <option value="">Select employee</option>
                                {employeeList.map(emp => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.firstname} {emp.lastname}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Document Name</label>
                            <input name="documentname" value={form.documentname} onChange={handle} required placeholder="e.g. Passport" className={fieldClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Document Type</label>
                            <select name="documenttype" value={form.documenttype} onChange={handle} className={fieldClass}>
                                {['ID Proof', 'Passport', 'Work Visa', 'Certification', 'Contract', 'Other'].map(t => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Document Number <span className="text-gray-400">(optional)</span></label>
                        <input name="documentnumber" value={form.documentnumber} onChange={handle} placeholder="e.g. A1234567" className={fieldClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Issue Date <span className="text-gray-400">(optional)</span></label>
                            <input type="date" name="issuedate" value={form.issuedate} onChange={handle} className={fieldClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Expiry Date</label>
                            <input type="date" name="expirydate" value={form.expirydate} onChange={handle} required className={fieldClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Notes <span className="text-gray-400">(optional)</span></label>
                        <textarea name="notes" value={form.notes} onChange={handle} rows={2} className={fieldClass} placeholder="Any additional notes..." />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                        <button
  type="submit"
  className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
>
  {isEdit ? 'Save Changes' : 'Add Document'}
</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Alert result toast ───────────────────────────────────────────────────────
const AlertToast = ({ result, onClose }) => {
    if (!result) return null
    return (
        <div className="fixed bottom-6 right-6 bg-green-700 text-white px-5 py-3 rounded-xl shadow-lg flex gap-3 items-center z-50">
            <span className="text-sm">{result.message}</span>
            <button onClick={onClose} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const DocumentExpiryPage = () => {
    const dispatch   = useDispatch()
    const state      = useSelector(s => s.DocumentReducer)

    const [dialogOpen,    setDialogOpen]    = useState(false)
    const [editTarget,    setEditTarget]    = useState(null)
    const [filterStatus,  setFilterStatus]  = useState('All')
    const [searchTerm,    setSearchTerm]    = useState('')
    const [showToast,     setShowToast]     = useState(false)
    const [runningAlerts, setRunningAlerts] = useState(false)

    // Derive employee list from document data for the add-document dropdown
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

    const handleAdd = (form) => {
        dispatch(HandleCreateDocument(form))
        setDialogOpen(false)
    }

    const handleEdit = (form) => {
        dispatch(HandleUpdateDocument(form))
        setEditTarget(null)
    }

    const handleDelete = (docID) => {
        if (window.confirm('Are you sure you want to delete this document record?')) {
            dispatch(HandleDeleteDocument({ documentID: docID }))
        }
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
        <PageShell>

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <PageHeader eyebrow="Operations" title="Document Expiry Alerts" subtitle="Track document validity and trigger email alerts" />
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={handleRunAlerts}
                        disabled={runningAlerts}
                        className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-60 flex items-center gap-2"
                    >
                        {runningAlerts ? 'Running...' : '⚡ Run Alert Engine'}
                    </button>
                    <button
  onClick={() => setDialogOpen(true)}
  className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
>
  + Add Document
</button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCard label="Total Documents"  count={state.summary.total}        color="border-gray-200 bg-gray-50" />
                <SummaryCard label="Valid"             count={state.summary.valid}         color="border-green-200 bg-green-50" />
                <SummaryCard label="Expiring Soon"     count={state.summary.expiringSoon}  color="border-yellow-200 bg-yellow-50" />
                <SummaryCard label="Expired"           count={state.summary.expired}       color="border-red-200 bg-red-50" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <input
                    type="text"
                    placeholder="Search by employee or document..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                {['All', 'Valid', 'Expiring Soon', 'Expired'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                            filterStatus === s
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 text-gray-600 hover:border-indigo-300'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="flex flex-col gap-2 overflow-auto flex-1">
                {/* Table header */}
                <div className="grid grid-cols-6 bg-gray-100 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 sticky top-0">
                    <span>Employee</span>
                    <span>Document Name</span>
                    <span>Type</span>
                    <span>Expiry Date</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {/* Rows */}
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-16">No documents found.</div>
                ) : (
                    filtered.map(doc => {
                        const daysLeft = Math.ceil((new Date(doc.expirydate) - new Date()) / (1000 * 60 * 60 * 24))
                        return (
                            <div key={doc._id} className="grid grid-cols-6 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                                <span className="font-medium">
                                    {doc.employee?.firstname} {doc.employee?.lastname}
                                </span>
                                <span>{doc.documentname}</span>
                                <span className="text-gray-500">{doc.documenttype}</span>
                                <div className="flex flex-col">
                                    <span>{new Date(doc.expirydate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    <span className={`text-xs ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 7 ? 'text-orange-500' : 'text-gray-400'}`}>
                                        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                    </span>
                                </div>
                                <StatusBadge status={doc.status} />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditTarget(doc)}
                                        className="px-3 py-1 rounded-md text-xs border border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                                    >Edit</button>
                                    <button
                                        onClick={() => handleDelete(doc._id)}
                                        className="px-3 py-1 rounded-md text-xs border border-red-400 text-red-600 hover:bg-red-50"
                                    >Delete</button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Dialogs */}
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

            {/* Alert toast */}
            <AlertToast result={state.alertResult} onClose={() => setShowToast(false)} />
        </PageShell>
    )
}