import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetAllSalaries, HandleCreateSalary, HandleUpdateSalary, HandleDeleteSalary } from '../../../redux/Thunks/SalaryThunk'
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --sl-modal-bg: #18181b;
    --sl-border: #27272a;
    --sl-text-main: #fafafa;
    --sl-text-muted: #a1a1aa;
    --sl-text-faint: #71717a;
    --sl-preview-bg: rgba(99,102,241,0.1);
    --sl-preview-border: rgba(99,102,241,0.3);
    
    /* Semantic Colors Boost */
    --sl-green-text: #4ade80;
    --sl-green-bg: rgba(34, 197, 94, 0.15);
    --sl-red-text: #f87171;
    --sl-red-bg: rgba(239, 68, 68, 0.15);
    --sl-yellow-text: #fbbf24;
    --sl-yellow-bg: rgba(234, 179, 8, 0.15);
    --sl-indigo-text: #818cf8;
  }

  [data-theme='dark'] .pg-modal {
    background: var(--sl-modal-bg) !important;
    border: 1px solid var(--sl-border) !important;
    box-shadow: 0 24px 64px rgba(0,0,0,0.8) !important;
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (amount, currency) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0,
    }).format(amount ?? 0)

const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const initials = (first, last) =>
    `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()

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

// ─── Status pill ──────────────────────────────────────────────────────────────
const STATUS = {
    Pending: { bg: 'var(--sl-yellow-bg, rgba(234,179,8,0.09))',  color: 'var(--sl-yellow-text, #854d0e)', border: 'rgba(234,179,8,0.3)'  },
    Paid:    { bg: 'var(--sl-green-bg, rgba(22,163,74,0.08))',   color: 'var(--sl-green-text, #15803d)', border: 'rgba(22,163,74,0.22)' },
    Delayed: { bg: 'var(--sl-red-bg, rgba(220,38,38,0.07))',    color: 'var(--sl-red-text, #dc2626)',   border: 'rgba(220,38,38,0.2)'   },
}

const StatusPill = ({ status }) => {
    const s = STATUS[status] || { bg: 'rgba(0,0,0,0.04)', color: 'var(--sl-text-muted, rgba(0,0,0,0.45))', border: 'rgba(0,0,0,0.1)' }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

// ─── Salary dialog (add + edit) ───────────────────────────────────────────────
const SalaryDialog = ({ open, onClose, onSubmit, employeeList, initialData }) => {
    const isEdit = !!initialData
    const empty  = { employeeID: '', basicpay: '', bonusePT: '', deductionPT: '', duedate: '', currency: 'INR', status: 'Pending' }
    const [form,    setForm]    = useState(empty)
    const [preview, setPreview] = useState({ bonuses: 0, deductions: 0, netpay: 0 })

    useEffect(() => {
        if (!open) return
        if (isEdit) {
            const bonusePT    = initialData.basicpay ? ((initialData.bonuses    / initialData.basicpay) * 100).toFixed(1) : 0
            const deductionPT = initialData.basicpay ? ((initialData.deductions / initialData.basicpay) * 100).toFixed(1) : 0
            setForm({
                salaryID:    initialData._id,
                employeeID:  initialData.employee?._id || '',
                basicpay:    initialData.basicpay,
                bonusePT,
                deductionPT,
                duedate:     initialData.duedate ? initialData.duedate.split('T')[0] : '',
                currency:    initialData.currency,
                status:      initialData.status,
            })
        } else {
            setForm(empty)
        }
    }, [open, initialData])

    useEffect(() => {
        const b        = parseFloat(form.basicpay)    || 0
        const bonusPct = parseFloat(form.bonusePT)    || 0
        const dedPct   = parseFloat(form.deductionPT) || 0
        const bonuses    = (b * bonusPct) / 100
        const deductions = (b * dedPct)   / 100
        setPreview({ bonuses, deductions, netpay: (b + bonuses) - deductions })
    }, [form.basicpay, form.bonusePT, form.deductionPT])

    if (!open) return null

    const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const submit = (e) => { e.preventDefault(); onSubmit({ ...form, ...preview }) }

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal" style={{ maxWidth: 520 }}>
                <div>
                    <div style={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.25rem', color: 'var(--sl-text-main, #0f172a)',
                        letterSpacing: '-0.02em', marginBottom: 4,
                    }}>
                        {isEdit ? 'Edit Salary Record' : 'Add Salary Record'}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--sl-text-muted, rgba(0,0,0,0.38))', margin: 0 }}>
                        {isEdit ? 'Update pay details and payment status.' : 'Create a new salary record for an employee.'}
                    </p>
                </div>

                <div className="pg-divider" />

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {!isEdit && (
                        <div className="pg-field">
                            <label className="pg-label">Employee</label>
                            <select
                                name="employeeID"
                                value={form.employeeID}
                                onChange={handle}
                                required
                                className="pg-input"
                                style={{ cursor: 'pointer' }}
                            >
                                <option value="">Select employee…</option>
                                {employeeList.map(e => (
                                    <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="pg-grid-2">
                        <div className="pg-field">
                            <label className="pg-label">Basic Pay</label>
                            <input
                                name="basicpay"
                                type="number"
                                min="0"
                                value={form.basicpay}
                                onChange={handle}
                                required
                                placeholder="e.g. 50000"
                                className="pg-input"
                            />
                        </div>
                        <div className="pg-field">
                            <label className="pg-label">Currency</label>
                            <select
                                name="currency"
                                value={form.currency}
                                onChange={handle}
                                className="pg-input"
                                style={{ cursor: 'pointer' }}
                            >
                                {['INR', 'USD', 'EUR', 'GBP', 'AED'].map(c => (
                                    <option key={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pg-grid-2">
                        <div className="pg-field">
                            <label className="pg-label">Bonus %</label>
                            <input
                                name="bonusePT"
                                type="number"
                                min="0" max="100" step="0.1"
                                value={form.bonusePT}
                                onChange={handle}
                                required
                                placeholder="e.g. 10"
                                className="pg-input"
                            />
                        </div>
                        <div className="pg-field">
                            <label className="pg-label">Deduction %</label>
                            <input
                                name="deductionPT"
                                type="number"
                                min="0" max="100" step="0.1"
                                value={form.deductionPT}
                                onChange={handle}
                                required
                                placeholder="e.g. 5"
                                className="pg-input"
                            />
                        </div>
                    </div>

                    {parseFloat(form.basicpay) > 0 && (
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
                            background: 'var(--sl-preview-bg, rgba(99,102,241,0.04))',
                            border: '1px solid var(--sl-preview-border, rgba(99,102,241,0.12))',
                            borderRadius: 12, padding: '14px 16px',
                        }}>
                            {[
                                { label: 'Bonuses',    value: `+${fmt(preview.bonuses,    form.currency)}`, color: 'var(--sl-green-text, #15803d)' },
                                { label: 'Deductions', value: `-${fmt(preview.deductions, form.currency)}`, color: 'var(--sl-red-text, #dc2626)' },
                                { label: 'Net Pay',    value: fmt(preview.netpay,          form.currency),  color: 'var(--sl-indigo-text, #4f46e5)' },
                            ].map(item => (
                                <div key={item.label} style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 11, color: 'var(--sl-text-muted, rgba(0,0,0,0.38))', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                        {item.label}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={isEdit ? 'pg-grid-2' : ''}>
                        <div className="pg-field">
                            <label className="pg-label">Due Date</label>
                            <input
                                name="duedate"
                                type="date"
                                value={form.duedate}
                                onChange={handle}
                                required
                                className="pg-input"
                            />
                        </div>
                        {isEdit && (
                            <div className="pg-field">
                                <label className="pg-label">Status</label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handle}
                                    className="pg-input"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {['Pending', 'Paid', 'Delayed'].map(s => (
                                        <option key={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="pg-modal-actions">
                        <button type="button" className="pg-btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="pg-btn-primary">
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
    const dispatch       = useDispatch()
    const state          = useSelector(s => s.SalaryReducer || {})
    const employeeState = useSelector(s => s.HREmployeesReducer || {})

    const [dialogOpen,    setDialogOpen]    = useState(false)
    const [editTarget,    setEditTarget]    = useState(null)
    const [search,        setSearch]        = useState('')
    const [filterStatus,  setFilterStatus]  = useState('All')

    const employeeList = Array.isArray(employeeState?.data?.data)
        ? employeeState.data.data
        : employeeState?.data || []

    useEffect(() => { dispatch(HandleGetAllSalaries()) }, [])
    useEffect(() => { dispatch(HandleGetHREmployees({ apiroute: 'GETALL' })) }, [])
    useEffect(() => { if (state.fetchData) dispatch(HandleGetAllSalaries()) }, [state.fetchData])

    const handleCreate = (form) => {
        dispatch(HandleCreateSalary({
            employeeID:  form.employeeID,
            basicpay:    parseFloat(form.basicpay),
            bonusePT:    parseFloat(form.bonusePT),
            deductionPT: parseFloat(form.deductionPT),
            duedate:     form.duedate,
            currency:    form.currency,
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
        if (window.confirm('Delete this salary record? This cannot be undone.'))
            dispatch(HandleDeleteSalary({ salaryID }))
    }

    const filtered = (state.data || []).filter(s => {
        const name = `${s.employee?.firstname ?? ''} ${s.employee?.lastname ?? ''}`.toLowerCase()
        return name.includes(search.toLowerCase()) &&
            (filterStatus === 'All' || s.status === filterStatus)
    })

    const total       = state.data?.length || 0
    const pending     = state.data?.filter(s => s.status === 'Pending').length || 0
    const paid        = state.data?.filter(s => s.status === 'Paid').length    || 0
    const delayed     = state.data?.filter(s => s.status === 'Delayed').length || 0
    const totalNetPay = state.data?.reduce((sum, s) => sum + (s.netpay || 0), 0) || 0

    const totalCurrency = state.data?.[0]?.currency || 'INR'

    if (state.isLoading && !state.data?.length) return <Loading />

    return (
        <PageShell>
            <style>{styles}</style>
            <PageHeader
                eyebrow="Operations"
                title="Salary Management"
                subtitle="Manage salary records, bonuses, deductions and payment status"
            >
                <button className="pg-btn-primary" onClick={() => setDialogOpen(true)}>
                    + Add Record
                </button>
            </PageHeader>

            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                {[
                    { label: 'Total Records', value: total                        },
                    { label: 'Pending',       value: pending                      },
                    { label: 'Paid',          value: paid                         },
                    { label: 'Delayed',       value: delayed                      },
                    { label: 'Total Net Pay', value: fmt(totalNetPay, totalCurrency) },
                ].map(s => (
                    <div key={s.label} className="pg-stat-card">
                        <span className="pg-stat-value" style={{ fontSize: s.label === 'Total Net Pay' ? '1.1rem' : undefined, color: 'var(--sl-text-main)' }}>
                            {s.value}
                        </span>
                        <span className="pg-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="pg-filters">
                <input
                    className="pg-search"
                    type="text"
                    placeholder="Search by employee name…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ minWidth: 240 }}
                />
                {['All', 'Pending', 'Paid', 'Delayed'].map(s => (
                    <button
                        key={s}
                        className={`pg-pill${filterStatus === s ? ' active' : ''}`}
                        onClick={() => setFilterStatus(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="pg-table-wrap">
                <div
                    className="pg-table-head"
                    style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.1fr 100px 110px' }}
                >
                    <span className="pg-th">Employee</span>
                    <span className="pg-th">Basic Pay</span>
                    <span className="pg-th">Bonuses</span>
                    <span className="pg-th">Deductions</span>
                    <span className="pg-th">Net Pay</span>
                    <span className="pg-th">Status</span>
                    <span className="pg-th">Actions</span>
                </div>

                {filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">💰</span>
                        <p className="pg-empty-title">
                            {search || filterStatus !== 'All' ? 'No records match your filters' : 'No salary records yet'}
                        </p>
                        <p className="pg-empty-sub">
                            {search || filterStatus !== 'All' ? 'Try adjusting your search or filter.' : 'Add the first salary record using the button above.'}
                        </p>
                    </div>
                )}

                {filtered.map(s => (
                    <div
                        key={s._id}
                        className="pg-table-row"
                        style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1.1fr 100px 110px' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar first={s.employee?.firstname} last={s.employee?.lastname} />
                            <div>
                                <div className="pg-td-name" style={{ color: 'var(--sl-text-main)' }}>
                                    {s.employee?.firstname} {s.employee?.lastname}
                                </div>
                                <div className="pg-td-sub">Due: {fmtDate(s.duedate)}</div>
                            </div>
                        </div>

                        <span style={{ fontSize: 13, color: 'var(--sl-text-main, #0f172a)', fontWeight: 500 }}>
                            {fmt(s.basicpay, s.currency)}
                        </span>

                        <span style={{ fontSize: 12, color: 'var(--sl-green-text, #15803d)', fontWeight: 500 }}>
                            +{fmt(s.bonuses, s.currency)}
                        </span>

                        <span style={{ fontSize: 12, color: 'var(--sl-red-text, #dc2626)', fontWeight: 500 }}>
                            −{fmt(s.deductions, s.currency)}
                        </span>

                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sl-indigo-text, #4f46e5)' }}>
                            {fmt(s.netpay, s.currency)}
                        </span>

                        <span><StatusPill status={s.status} /></span>

                        <div style={{ display: 'flex', gap: 6 }}>
                            <button className="pg-action-btn indigo" onClick={() => setEditTarget(s)}>Edit</button>
                            <button className="pg-action-btn red" onClick={() => handleDelete(s._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <SalaryDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleCreate}
                employeeList={employeeList}
            />
            <SalaryDialog
                open={!!editTarget}
                onClose={() => setEditTarget(null)}
                onSubmit={handleUpdate}
                employeeList={employeeList}
                initialData={editTarget}
            />
        </PageShell>
    )
}