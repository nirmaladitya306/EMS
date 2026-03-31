import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllSalaries, HandleCreateSalary, HandleUpdateSalary, HandleDeleteSalary } from '../../../redux/Thunks/SalaryThunk'
import { Loading } from '../../../components/common/loading'
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (amount, currency) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(amount)

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        Pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        Delayed: 'bg-red-100    text-red-800    border-red-300',
        Paid:    'bg-green-100  text-green-800  border-green-300',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || ''}`}>{status}</span>
}

// ─── Summary card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, color }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-xl font-bold">{value}</span>
        <span className="text-sm text-gray-500">{label}</span>
    </div>
)

// ─── Add / Edit dialog ────────────────────────────────────────────────────────
const SalaryDialog = ({ open, onClose, onSubmit, employeeList, initialData }) => {
    const isEdit = !!initialData
    const empty = { employeeID: '', basicpay: '', bonusePT: '', deductionPT: '', duedate: '', currency: 'INR', status: 'Pending' }
    const [form, setForm] = useState(empty)
    const [preview, setPreview] = useState({ bonuses: 0, deductions: 0, netpay: 0 })

    useEffect(() => {
        if (open) {
            if (isEdit) {
                // reverse-calculate percentages from stored values
                const bonusePT    = initialData.basicpay ? ((initialData.bonuses    / initialData.basicpay) * 100).toFixed(1) : 0
                const deductionPT = initialData.basicpay ? ((initialData.deductions / initialData.basicpay) * 100).toFixed(1) : 0
                setForm({
                    salaryID:     initialData._id,
                    employeeID:   initialData.employee?._id || '',
                    basicpay:     initialData.basicpay,
                    bonusePT,
                    deductionPT,
                    duedate:      initialData.duedate ? initialData.duedate.split('T')[0] : '',
                    currency:     initialData.currency,
                    status:       initialData.status,
                })
            } else {
                setForm(empty)
            }
        }
    }, [open, initialData])

    useEffect(() => {
        const b = parseFloat(form.basicpay)    || 0
        const bonusPct   = parseFloat(form.bonusePT)    || 0
        const dedPct     = parseFloat(form.deductionPT) || 0
        const bonuses    = (b * bonusPct)  / 100
        const deductions = (b * dedPct)    / 100
        setPreview({ bonuses, deductions, netpay: (b + bonuses) - deductions })
    }, [form.basicpay, form.bonusePT, form.deductionPT])

    if (!open) return null

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit({ ...form, ...preview }) }

    const fc = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
    const lc = "block text-xs font-medium text-gray-600 mb-1"

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-5">{isEdit ? 'Edit Salary Record' : 'Add Salary Record'}</h2>
                <form onSubmit={submit} className="flex flex-col gap-4">

                    {!isEdit && (
                        <div>
                            <label className={lc}>Employee</label>
                            <select name="employeeID" value={form.employeeID} onChange={handle} required className={fc}>
                                <option value="">Select employee</option>
                                {employeeList.map(e => (
                                    <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Basic Pay</label>
                            <input name="basicpay" type="number" min="0" value={form.basicpay} onChange={handle} required placeholder="e.g. 50000" className={fc} />
                        </div>
                        <div>
                            <label className={lc}>Currency</label>
                            <select name="currency" value={form.currency} onChange={handle} className={fc}>
                                {['INR','USD','EUR','GBP','AED'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Bonus %</label>
                            <input name="bonusePT" type="number" min="0" max="100" step="0.1" value={form.bonusePT} onChange={handle} required placeholder="e.g. 10" className={fc} />
                        </div>
                        <div>
                            <label className={lc}>Deduction %</label>
                            <input name="deductionPT" type="number" min="0" max="100" step="0.1" value={form.deductionPT} onChange={handle} required placeholder="e.g. 5" className={fc} />
                        </div>
                    </div>

                    {/* Live preview */}
                    {form.basicpay > 0 && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-xs text-gray-500">Bonuses</p>
                                <p className="text-sm font-semibold text-green-700">+{fmt(preview.bonuses, form.currency)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Deductions</p>
                                <p className="text-sm font-semibold text-red-600">-{fmt(preview.deductions, form.currency)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Net Pay</p>
                                <p className="text-sm font-bold text-blue-700">{fmt(preview.netpay, form.currency)}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Due Date</label>
                            <input name="duedate" type="date" value={form.duedate} onChange={handle} required className={fc} />
                        </div>
                        {isEdit && (
                            <div>
                                <label className={lc}>Status</label>
                                <select name="status" value={form.status} onChange={handle} className={fc}>
                                    {['Pending','Paid','Delayed'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                            {isEdit ? 'Save Changes' : 'Add Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const SalaryPage = () => {
    const dispatch = useDispatch()
    const state = useSelector(s => s.SalaryReducer || {})
    const employeeState = useSelector(s => s.HREmployeesReducer || {})


    
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [search,     setSearch]     = useState('')
    const [filterStatus, setFilterStatus] = useState('All')

    const employeeList = Array.isArray(employeeState?.data?.data)
        ? employeeState.data.data
        : employeeState?.data || []
    useEffect(() => { dispatch(HandleGetAllSalaries()) }, [])
    useEffect(() => {
        dispatch(HandleGetHREmployees({ apiroute: "GETALL" }))
    }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllSalaries()) }, [state.fetchData])

    const handleCreate = (form) => {
        dispatch(HandleCreateSalary({
            employeeID:   form.employeeID,
            basicpay:     parseFloat(form.basicpay),
            bonusePT:     parseFloat(form.bonusePT),
            deductionPT:  parseFloat(form.deductionPT),
            duedate:      form.duedate,
            currency:     form.currency,
        }))
        setDialogOpen(false)
    }

    const handleUpdate = (form) => {
        dispatch(HandleUpdateSalary({
            salaryID:    form.salaryID,
            basicpay:    parseFloat(form.basicpay),
            bonusePT:    parseFloat(form.bonusePT),
            deductionPT: parseFloat(form.deductionPT),
            duedate:     form.duedate,
            currency:    form.currency,
            status:      form.status,
        }))
        setEditTarget(null)
    }

    const handleDelete = (salaryID) => {
        if (window.confirm('Delete this salary record?')) dispatch(HandleDeleteSalary({ salaryID }))
    }

    const filtered = (state.data || []).filter(s => {
        const name = `${s.employee?.firstname || ''} ${s.employee?.lastname || ''}`.toLowerCase()
        const matchSearch = name.includes(search.toLowerCase())
        const matchStatus = filterStatus === 'All' || s.status === filterStatus
        return matchSearch && matchStatus
    })

    // Summary stats
    const total     = state.data?.length || 0
    const pending   = state.data?.filter(s => s.status === 'Pending').length || 0
    const paid      = state.data?.filter(s => s.status === 'Paid').length    || 0
    const delayed   = state.data?.filter(s => s.status === 'Delayed').length || 0
    const totalNetPay = state.data?.reduce((sum, s) => sum + (s.netpay || 0), 0) || 0

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <div className="salary-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Salary Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage salary records, bonuses, deductions and payment status</p>
                </div>
                <button onClick={() => setDialogOpen(true)}
                    className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                    + Add Salary Record
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <SummaryCard label="Total Records" value={total}   color="border-gray-200 bg-gray-50" />
                <SummaryCard label="Pending"        value={pending} color="border-yellow-200 bg-yellow-50" />
                <SummaryCard label="Paid"           value={paid}    color="border-green-200 bg-green-50" />
                <SummaryCard label="Delayed"        value={delayed} color="border-red-200 bg-red-50" />
                <SummaryCard label="Total Net Pay"  value={`₹${(totalNetPay/1000).toFixed(0)}K`} color="border-blue-200 bg-blue-50" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <input type="text" placeholder="Search by employee name..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                {['All', 'Pending', 'Paid', 'Delayed'].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}`}>
                        {s}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="flex flex-col gap-2 overflow-auto flex-1">
                <div className="grid grid-cols-8 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                    <span className="col-span-2">Employee</span>
                    <span>Basic Pay</span>
                    <span>Bonuses</span>
                    <span>Deductions</span>
                    <span>Net Pay</span>
                    <span>Status</span>
                    <span>Actions</span>
                </div>

                {filtered.length === 0 ? (
                    <div className="text-center text-gray-400 py-16">No salary records found.</div>
                ) : filtered.map(s => (
                    <div key={s._id} className="grid grid-cols-8 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                        <div className="col-span-2">
                            <p className="font-medium">{s.employee?.firstname} {s.employee?.lastname}</p>
                            <p className="text-xs text-gray-400">Due: {fmtDate(s.duedate)}</p>
                        </div>
                        <span>{fmt(s.basicpay, s.currency)}</span>
                        <span className="text-green-600">+{fmt(s.bonuses, s.currency)}</span>
                        <span className="text-red-500">-{fmt(s.deductions, s.currency)}</span>
                        <span className="font-semibold text-blue-700">{fmt(s.netpay, s.currency)}</span>
                        <StatusBadge status={s.status} />
                        <div className="flex gap-2">
                            <button onClick={() => setEditTarget(s)}
                                className="px-3 py-1 rounded-md text-xs border border-indigo-200 text-indigo-600 hover:bg-indigo-50">Edit</button>
                            <button onClick={() => handleDelete(s._id)}
                                className="px-3 py-1 rounded-md text-xs border border-red-400 text-red-600 hover:bg-red-50">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dialogs */}
            <SalaryDialog open={dialogOpen}  onClose={() => setDialogOpen(false)} onSubmit={handleCreate} employeeList={employeeList} />
            <SalaryDialog open={!!editTarget} onClose={() => setEditTarget(null)}  onSubmit={handleUpdate} employeeList={employeeList} initialData={editTarget} />
        </div>
    )
}
