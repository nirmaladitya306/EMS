import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetAllClearances,
    HandleGetClearanceSummary,
    HandleGetClearance,
    HandleCreateExitClearance,
    HandleToggleChecklistItem,
    HandleUpdateClearanceStatus,
    HandleUpdateClearanceDetails,
    HandleDeleteClearance,
} from '../../../redux/Thunks/ExitClearanceThunk'
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk'
import { Loading } from '../../../components/common/loading'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
    'Pending':     'bg-yellow-100 text-yellow-800 border-yellow-300',
    'In Progress': 'bg-blue-100   text-blue-800   border-blue-300',
    'Cleared':     'bg-green-100  text-green-800  border-green-300',
    'Rejected':    'bg-red-100    text-red-800    border-red-300',
}
const StatusBadge = ({ status }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[status] || ''}`}>
        {status}
    </span>
)

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ChecklistProgress = ({ checklist }) => {
    const total = checklist?.length || 0
    const done  = checklist?.filter(i => i.completed).length || 0
    const pct   = total ? Math.round((done / total) * 100) : 0
    const bar   = pct === 100 ? 'bg-green-500' : pct > 0 ? 'bg-blue-500' : 'bg-gray-300'
    return (
        <div className="flex items-center gap-2 min-w-[100px]">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div className={`${bar} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 whitespace-nowrap">{done}/{total}</span>
        </div>
    )
}

// ─── Summary cards ─────────────────────────────────────────────────────────────
const SummaryBar = ({ summary }) => {
    const cards = [
        { label: 'Total',       value: summary.total,      color: 'border-gray-200   bg-gray-50'    },
        { label: 'Pending',     value: summary.pending,    color: 'border-yellow-200 bg-yellow-50'  },
        { label: 'In Progress', value: summary.inProgress, color: 'border-blue-200   bg-blue-50'    },
        { label: 'Cleared',     value: summary.cleared,    color: 'border-green-200  bg-green-50'   },
        { label: 'Rejected',    value: summary.rejected,   color: 'border-red-200    bg-red-50'     },
    ]
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cards.map(c => (
                <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
                    <p className="text-2xl font-bold">{c.value ?? 0}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
                </div>
            ))}
        </div>
    )
}

// ─── Create dialog ─────────────────────────────────────────────────────────────
const CreateDialog = ({ open, onClose, onSubmit, employees }) => {
    const [form, setForm] = useState({
        employeeID: '', reason: '', resignationDate: '', lastWorkingDate: '', notes: ''
    })
    useEffect(() => { if (open) setForm({ employeeID: '', reason: '', resignationDate: '', lastWorkingDate: '', notes: '' }) }, [open])
    if (!open) return null

    const fc = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
    const lc = "block text-xs font-medium text-gray-600 mb-1"
    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-5">Initiate Exit Clearance</h2>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className={lc}>Employee *</label>
                        <select name="employeeID" value={form.employeeID} onChange={handle} required className={fc}>
                            <option value="">Select employee…</option>
                            {(employees || []).map(e => (
                                <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={lc}>Reason *</label>
                        <textarea name="reason" value={form.reason} onChange={handle} required
                            rows={3} placeholder="Resignation, termination, contract end…" className={fc} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Resignation Date</label>
                            <input name="resignationDate" type="date" value={form.resignationDate} onChange={handle} className={fc} />
                        </div>
                        <div>
                            <label className={lc}>Last Working Date</label>
                            <input name="lastWorkingDate" type="date" value={form.lastWorkingDate} onChange={handle} className={fc} />
                        </div>
                    </div>
                    <div>
                        <label className={lc}>Notes</label>
                        <textarea name="notes" value={form.notes} onChange={handle}
                            rows={2} placeholder="Any additional notes…" className={fc} />
                    </div>
                    <p className="text-xs text-gray-400">
                        A default 8-item checklist will be created automatically.
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700">
                            Initiate Clearance
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Detail drawer ─────────────────────────────────────────────────────────────
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
                reason:          clearance.reason || '',
                notes:           clearance.notes  || '',
            })
        }
    }, [clearance])

    if (!clearance) return null

    const isFinished = clearance.status === 'Cleared' || clearance.status === 'Rejected'
    const total      = clearance.checklist?.length || 0
    const done       = clearance.checklist?.filter(i => i.completed).length || 0

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
            <div className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">
                            {clearance.employee?.firstname} {clearance.employee?.lastname}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">{clearance.reason}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <StatusBadge status={clearance.status} />
                            <span className="text-xs text-gray-400">
                                Initiated {fmtDate(clearance.createdAt)}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none shrink-0">×</button>
                </div>

                {/* Key dates */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-3 gap-3 text-xs">
                    {[
                        { label: 'Resignation',    value: fmtDate(clearance.resignationDate) },
                        { label: 'Last Working',   value: fmtDate(clearance.lastWorkingDate) },
                        { label: 'Exit Date',      value: fmtDate(clearance.exitDate)        },
                    ].map(f => (
                        <div key={f.label}>
                            <p className="text-gray-400 uppercase tracking-wide">{f.label}</p>
                            <p className="font-semibold text-gray-700">{f.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 px-6">
                    {['checklist', 'status', 'details'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {t === 'checklist' ? `Checklist (${done}/${total})` : t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">

                    {/* ── Checklist tab ── */}
                    {tab === 'checklist' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-gray-700">Clearance Tasks</p>
                                <ChecklistProgress checklist={clearance.checklist} />
                            </div>
                            {clearance.checklist?.map(item => (
                                <div key={item._id}
                                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${item.completed
                                        ? 'border-green-200 bg-green-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                                    <button
                                        disabled={isFinished}
                                        onClick={() => onToggle({ clearanceID: clearance._id, itemID: item._id })}
                                        className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all
                                            ${item.completed
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-gray-300 hover:border-green-400'}
                                            ${isFinished ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                        {item.completed && <span className="text-xs leading-none">✓</span>}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                            {item.task}
                                        </p>
                                        {item.completed && (
                                            <p className="text-xs text-green-600 mt-0.5">
                                                Completed by {item.completedBy?.firstname} {item.completedBy?.lastname} · {fmtDate(item.completedAt)}
                                            </p>
                                        )}
                                        {item.notes && (
                                            <p className="text-xs text-gray-400 mt-0.5 italic">{item.notes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Status tab ── */}
                    {tab === 'status' && (
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-gray-600">
                                Current status: <StatusBadge status={clearance.status} />
                            </p>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Change Status</label>
                                <select
                                    value={statusForm.status}
                                    onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
                                    {['Pending', 'In Progress', 'Cleared', 'Rejected'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                                <textarea
                                    value={statusForm.notes}
                                    onChange={e => setStatusForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={3}
                                    placeholder="Add a note about this status change…"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                            </div>
                            <button
                                onClick={() => onStatusChange({ clearanceID: clearance._id, ...statusForm })}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
                                Update Status
                            </button>

                            <div className="border-t border-gray-100 pt-4 mt-2">
                                <p className="text-xs text-gray-400 mb-3">Danger zone</p>
                                <button
                                    onClick={() => { if (window.confirm('Delete this clearance? This cannot be undone.')) onDelete(clearance._id) }}
                                    className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm rounded-lg">
                                    Delete Clearance
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Details tab ── */}
                    {tab === 'details' && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
                                <textarea
                                    value={detailsForm.reason}
                                    onChange={e => setDetailsForm(f => ({ ...f, reason: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Resignation Date</label>
                                    <input type="date" value={detailsForm.resignationDate}
                                        onChange={e => setDetailsForm(f => ({ ...f, resignationDate: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Last Working Date</label>
                                    <input type="date" value={detailsForm.lastWorkingDate}
                                        onChange={e => setDetailsForm(f => ({ ...f, lastWorkingDate: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                                <textarea
                                    value={detailsForm.notes}
                                    onChange={e => setDetailsForm(f => ({ ...f, notes: e.target.value }))}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
                            </div>
                            <button
                                onClick={() => onDetailsUpdate({ clearanceID: clearance._id, ...detailsForm })}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
                                Save Details
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export const ExitClearancePage = () => {
    const dispatch     = useDispatch()
    const state        = useSelector(s => s.ExitClearanceReducer)
    const empState     = useSelector(s => s.HREmployeesPageReducer)

    const [createOpen,    setCreateOpen]    = useState(false)
    const [activeClearance, setActiveClearance] = useState(null)
    const [filterStatus,  setFilterStatus]  = useState('All')
    const [search,        setSearch]        = useState('')

    // Load on mount
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

    // Sync active clearance from list (keeps checklist fresh after toggle)
    useEffect(() => {
        if (activeClearance) {
            const updated = state.clearances.find(c => c._id === activeClearance._id)
            if (updated) setActiveClearance(updated)
        }
    }, [state.clearances])

    const handleCreate = (form) => {
        dispatch(HandleCreateExitClearance(form))
        setCreateOpen(false)
    }

    const handleToggle = (payload) => dispatch(HandleToggleChecklistItem(payload))

    const handleStatusChange = (payload) => {
        dispatch(HandleUpdateClearanceStatus(payload))
    }

    const handleDetailsUpdate = (payload) => {
        dispatch(HandleUpdateClearanceDetails(payload))
    }

    const handleDelete = (clearanceID) => {
        dispatch(HandleDeleteClearance(clearanceID))
        setActiveClearance(null)
    }

    const handleOpenDrawer = (clearance) => setActiveClearance(clearance)

    const filtered = (state.clearances || []).filter(c => {
        const name = `${c.employee?.firstname || ''} ${c.employee?.lastname || ''}`.toLowerCase()
        const matchSearch = !search || name.includes(search.toLowerCase())
        const matchStatus = filterStatus === 'All' || c.status === filterStatus
        return matchSearch && matchStatus
    })

    if (state.isLoading && !state.clearances.length) return <Loading />

    return (
        <div className="exit-clearance-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Exit Clearance</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage employee exit processes, checklists, and final clearance sign-off
                    </p>
                </div>
                <button onClick={() => setCreateOpen(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
                    + Initiate Exit Clearance
                </button>
            </div>

            {/* Summary */}
            <SummaryBar summary={state.summary} />

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <input type="text" placeholder="Search by employee name…"
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-red-300" />
                {['All', 'Pending', 'In Progress', 'Cleared', 'Rejected'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${filterStatus === s
                            ? 'bg-red-600 text-white border-red-600'
                            : 'border-gray-300 text-gray-600 hover:border-red-400'}`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-7 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Employee</span>
                    <span className="col-span-2">Reason</span>
                    <span>Last Working</span>
                    <span>Progress</span>
                    <span>Status</span>
                </div>

                {state.error.status && (
                    <div className="text-center text-red-500 py-8 text-sm">{state.error.message}</div>
                )}

                {!state.error.status && filtered.length === 0 && (
                    <div className="text-center text-gray-400 py-16">
                        {state.clearances.length === 0
                            ? 'No exit clearances yet. Initiate one to get started.'
                            : 'No clearances match your current filter.'}
                    </div>
                )}

                {filtered.map(c => (
                    <div key={c._id}
                        onClick={() => handleOpenDrawer(c)}
                        className="grid grid-cols-7 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-red-50 hover:border-red-200 cursor-pointer transition-all">
                        <div className="col-span-2">
                            <p className="font-medium text-gray-800">
                                {c.employee?.firstname} {c.employee?.lastname}
                            </p>
                            <p className="text-xs text-gray-400">
                                Initiated {fmtDate(c.createdAt)}
                            </p>
                        </div>
                        <p className="col-span-2 text-gray-500 text-xs truncate pe-4">{c.reason}</p>
                        <span className="text-gray-500 text-xs">{fmtDate(c.lastWorkingDate)}</span>
                        <ChecklistProgress checklist={c.checklist} />
                        <StatusBadge status={c.status} />
                    </div>
                ))}
            </div>

            {/* Dialogs */}
            <CreateDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
                employees={empState.data}
            />

            <DetailDrawer
                clearance={activeClearance}
                onClose={() => setActiveClearance(null)}
                onToggle={handleToggle}
                onStatusChange={handleStatusChange}
                onDetailsUpdate={handleDetailsUpdate}
                onDelete={handleDelete}
            />
        </div>
    )
}