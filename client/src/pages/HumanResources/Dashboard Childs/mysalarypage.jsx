import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMySalaries } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  
  [data-theme='dark'] {
    --sl-card-bg: rgba(99,102,241,0.06);
    --sl-card-border: rgba(99,102,241,0.2);
    --sl-text-main: #fafafa;
    --sl-text-muted: #a1a1aa;
    --sl-total-text: #818cf8;
    
    /* Brighter currency colors */
    --sl-green: #4ade80;
    --sl-red: #f87171;
    
    /* Status overrides */
    --sl-pend-bg: rgba(245,158,11,0.15);
    --sl-pend-text: #fbbf24;
    --sl-paid-bg: rgba(16,185,129,0.15);
    --sl-paid-text: #4ade80;
    --sl-delay-bg: rgba(239,68,68,0.15);
    --sl-delay-text: #f87171;
  }

  .sl-status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 100px; border: 1px solid;
    font-size: 11px; font-weight: 600; letter-spacing: 0.02em;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .sl-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  
  .sl-total-card {
    background: var(--sl-card-bg, linear-gradient(135deg, #f5f7ff 0%, #eeefff 100%));
    border: 1px solid var(--sl-card-border, #e0e4ff); 
    border-radius: 12px; padding: 16px 20px;
    margin-bottom: 20px;
  }
  
  .sl-total-val {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--sl-total-text, #4338ca);
    margin-top: 4px;
  }
`

const fmtDate = (d) => d ? 
    new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const fmt = (amount, currency) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: currency || 'INR', maximumFractionDigits: 0 }).format(amount)

const STATUS_CONFIG = {
    Pending: { bg: 'var(--sl-pend-bg, rgba(245,158,11,0.08))',  border: 'rgba(245,158,11,0.28)', color: 'var(--sl-pend-text, #b45309)' },
    Paid:    { bg: 'var(--sl-paid-bg, rgba(16,185,129,0.07))',  border: 'rgba(16,185,129,0.25)', color: 'var(--sl-paid-text, #059669)' },
    Delayed: { bg: 'var(--sl-delay-bg, rgba(239,68,68,0.07))',   border: 'rgba(239,68,68,0.25)',  color: 'var(--sl-delay-text, #dc2626)' },
}

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status]
    if (!cfg) return <span style={{ fontSize: '12px', color: 'var(--sl-text-muted, rgba(0,0,0,0.4))' }}>{status}</span>
    return (
        <span className="sl-status-badge" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
            <span className="sl-status-dot" style={{ background: cfg.color }} />
            {status}
        </span>
    )
}

export const MySalaryPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.EmployeeDashboardReducer)
    const salaries = state.salaries || []

    useEffect(() => { dispatch(HandleGetMySalaries()) }, [dispatch])
    useEffect(() => { if (state.fetchSalaries) dispatch(HandleGetMySalaries()) }, [state.fetchSalaries, dispatch])

    const totalNet = salaries.reduce((sum, s) => sum + (s.netpay || 0), 0)
    const paid     = salaries.filter(s => s.status === 'Paid').length
    const pending  = salaries.filter(s => s.status === 'Pending').length
    const delayed  = salaries.filter(s => s.status === 'Delayed').length

    if (state.isLoading && !salaries.length) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>
                <PageHeader 
                    eyebrow="Finance & Docs" 
                    title="My Salary" 
                    subtitle="View your salary records and payment history" 
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-3 mb-5">
                    {[
                        { label: 'Total Records', value: salaries.length },
                        { label: 'Paid',          value: paid },
                        { label: 'Pending',       value: pending },
                        { label: 'Delayed',       value: delayed },
                    ].map(c => (
                        <div key={c.label} className="pg-stat-card">
                            <span className="pg-stat-value">{c.value}</span>
                            <span className="pg-stat-label">{c.label}</span>
                        </div>
                    ))}
                </div>

                {/* Summary Card */}
                {salaries.length > 0 && (
                    <div className="sl-total-card">
                        <p style={{ color: 'var(--sl-text-muted, #64748b)', fontSize: '13px', margin: 0 }}>Total Net Pay (all time)</p>
                        <p className="sl-total-val">
                            {fmt(totalNet, salaries[0]?.currency)}
                        </p>
                    </div>
                )}

                {/* Table */}
                <div className="pg-table-wrap">
                    <div className="pg-table-head grid grid-cols-6">
                        <span className="pg-th">Basic Pay</span>
                        <span className="pg-th">Bonuses</span>
                        <span className="pg-th">Deductions</span>
                        <span className="pg-th">Net Pay</span>
                        <span className="pg-th">Due Date</span>
                        <span className="pg-th">Status</span>
                    </div>

                    {salaries.length === 0 ? (
                        <div className="pg-empty">
                            <span className="pg-empty-icon">💰</span>
                            <p className="pg-empty-title">No salary records found</p>
                            <p className="pg-empty-sub">Your payment history will appear here once processed.</p>
                        </div>
                    ) : (
                        salaries.map(s => (
                            <div key={s._id} className="pg-table-row grid grid-cols-6 items-center">
                                <span className="pg-td-name" style={{ color: 'var(--sl-text-main)' }}>{fmt(s.basicpay, s.currency)}</span>
                                <span style={{ color: 'var(--sl-green, #16a34a)', fontWeight: 500 }}>+{fmt(s.bonuses, s.currency)}</span>
                                <span style={{ color: 'var(--sl-red, #dc2626)', fontWeight: 500 }}>-{fmt(s.deductions, s.currency)}</span>
                                <span className="font-bold" style={{ color: 'var(--sl-total-text, #4338ca)' }}>{fmt(s.netpay, s.currency)}</span>
                                <span className="pg-td-muted">{fmtDate(s.duedate)}</span>
                                <StatusBadge status={s.status} />
                            </div>
                        ))
                    )}
                </div>
            </PageShell>
        </>
    )
}