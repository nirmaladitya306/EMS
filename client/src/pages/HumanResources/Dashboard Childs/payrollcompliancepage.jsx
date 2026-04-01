import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleRunComplianceCheck, HandleRunSingleComplianceCheck } from '../../../redux/Thunks/PayrollComplianceThunk'
import { clearSingleCheck } from '../../../redux/Slices/PayrollComplianceSlice'
import { Loading } from '../../../components/common/loading'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, cur) => n != null
    ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: cur || 'INR', maximumFractionDigits: 0 }).format(n)
    : '—'

// ─── Status colour maps ────────────────────────────────────────────────────────
const ELIGIBILITY_STYLES = {
    Eligible:         { badge: 'bg-green-100 text-green-800 border-green-300',  dot: 'bg-green-500' },
    'Review Required':{ badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', dot: 'bg-yellow-500' },
    Ineligible:       { badge: 'bg-red-100 text-red-800 border-red-300',        dot: 'bg-red-500' },
}

const SEVERITY_STYLES = {
    critical: { pill: 'bg-red-100 text-red-700 border-red-300',     icon: '🔴' },
    warning:  { pill: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '🟡' },
    info:     { pill: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: '🔵' },
}

// ─── Score ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
    const colour = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
    const r = 26, cx = 32, cy = 32, stroke = 6
    const circumference = 2 * Math.PI * r
    const dash = (score / 100) * circumference

    return (
        <svg width={64} height={64} viewBox="0 0 64 64">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={colour} strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
                transform="rotate(-90 32 32)" />
            <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={colour}>{score}</text>
        </svg>
    )
}

// ─── Org Summary Cards ─────────────────────────────────────────────────────────
const OrgSummaryBar = ({ summary }) => {
    if (!summary) return null
    const cards = [
        { label: 'Total Employees',    value: summary.totalEmployees,     color: 'border-gray-200 bg-gray-50' },
        { label: 'Eligible',           value: summary.eligible,           color: 'border-green-200 bg-green-50 text-green-700' },
        { label: 'Review Required',    value: summary.reviewRequired,     color: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
        { label: 'Ineligible',         value: summary.ineligible,         color: 'border-red-200 bg-red-50 text-red-700' },
        { label: 'Avg Compliance',     value: `${summary.avgComplianceScore}%`, color: 'border-blue-200 bg-blue-50 text-blue-700' },
    ]
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cards.map(c => (
                <div key={c.label} className={`pg-stat-card ${c.color}`}>
                    <p className="text-xl font-bold">{c.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
                </div>
            ))}
        </div>
    )
}

// ─── Flag pill ─────────────────────────────────────────────────────────────────
const FlagPill = ({ flag }) => {
    const s = SEVERITY_STYLES[flag.severity] || SEVERITY_STYLES.info
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${s.pill}`}>
            {s.icon} {flag.message}
        </span>
    )
}

// ─── Employee Detail Drawer ────────────────────────────────────────────────────
const DetailDrawer = ({ record, onClose }) => {
    if (!record) return null
    const style = ELIGIBILITY_STYLES[record.eligibilityStatus] || ELIGIBILITY_STYLES.Eligible
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={onClose}>
            <div className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl"
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <div>
                        <h2 className="text-lg font-bold">{record.name}</h2>
                        <p className="text-xs text-gray-400">{record.email}</p>
                    </div>
                    <button onClick={onClose}
                        className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
                </div>

                <div className="p-5 flex flex-col gap-5">
                    {/* Score + eligibility */}
                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border">
                        <ScoreRing score={record.complianceScore} />
                        <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style.badge}`}>
                                {record.eligibilityStatus}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">Compliance Score: {record.complianceScore}/100</p>
                        </div>
                    </div>

                    {/* Summary stats */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">Payroll Summary</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {[
                                ['Salary Records',      record.summary.totalSalaryRecords],
                                ['Latest Net Pay',      fmt(record.summary.latestNetPay, record.summary.latestCurrency)],
                                ['Latest Status',       record.summary.latestStatus  ?? '—'],
                                ['Attendance Rate',     record.summary.attendanceRate != null ? `${record.summary.attendanceRate}%` : '—'],
                                ['Pending Leaves',      record.summary.pendingLeaves],
                                ['Delayed Payments',    record.summary.delayedCount],
                            ].map(([k, v]) => (
                                <div key={k} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                    <p className="text-xs text-gray-400">{k}</p>
                                    <p className="font-semibold">{v}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flags */}
                    {record.flags.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Compliance Flags ({record.flags.length})</h3>
                            <div className="flex flex-col gap-2">
                                {record.flags.map((f, i) => {
                                    const s = SEVERITY_STYLES[f.severity] || SEVERITY_STYLES.info
                                    return (
                                        <div key={i} className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${s.pill}`}>
                                            <span className="mt-0.5">{s.icon}</span>
                                            <div>
                                                <p className="text-xs font-semibold">{f.rule.replace(/_/g, ' ')}</p>
                                                <p className="text-xs">{f.message}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {record.recommendations.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">Recommendations</h3>
                            <ul className="flex flex-col gap-1.5">
                                {record.recommendations.map((r, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                                        <span className="text-blue-500 mt-0.5">💡</span>
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Rules Reference Panel ─────────────────────────────────────────────────────
const RulesPanel = ({ rules, onClose }) => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Compliance Rules</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
                {Object.entries(rules).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-blue-700">{val}{typeof val === 'number' && key.includes('PCT') ? '%' : ''}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const PayrollCompliancePage = () => {
    const dispatch = useDispatch()
    const { data, orgSummary, isLoading, error } = useSelector(s => s.PayrollComplianceReducer || {})

    const [search,         setSearch]         = useState('')
    const [filterStatus,   setFilterStatus]   = useState('All')
    const [selectedRecord, setSelectedRecord] = useState(null)
    const [showRules,      setShowRules]       = useState(false)
    const [hasRun,         setHasRun]         = useState(false)

    const handleRun = () => {
        dispatch(HandleRunComplianceCheck())
        setHasRun(true)
    }

    const filtered = (data || []).filter(r => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase())
        const matchStatus = filterStatus === 'All' || r.eligibilityStatus === filterStatus
        return matchSearch && matchStatus
    })

    if (isLoading) return <Loading />

    return (
        <PageShell>

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="flex justify-between items-start flex-wrap gap-3">
                <div>
                    <PageHeader eyebrow="Finance" title="Payroll Compliance" subtitle="Validate employee payroll eligibility against compliance rules" />
                    <p className="text-sm text-gray-500 mt-1">
                        Validate employee payroll eligibility against organisation compliance rules
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowRules(true)}
                        className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
                        📋 View Rules
                    </button>
                    <button
  onClick={handleRun}
  className="px-6 py-2.5 text-white text-sm font-medium rounded-lg hover:opacity-90"
  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
>
  ▶ Run Compliance Check
</button>
                </div>
            </div>

            {/* ── Error ────────────────────────────────────────────────── */}
            {error?.status && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    ⚠️ {error.message}
                </div>
            )}

            {/* ── Prompt before first run ───────────────────────────────── */}
            {!hasRun && !data && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-20 h-20 bg-blue-50 border border-blue-200 rounded-full flex items-center justify-center text-4xl">
                        🛡️
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700">Ready to Check Payroll Compliance</h2>
                        <p className="text-gray-400 text-sm mt-1 max-w-md">
                            Click "Run Compliance Check" to analyse all employees against your
                            organisation's payroll rules — attendance thresholds, salary caps,
                            overdue payments, and more.
                        </p>
                    </div>
                    <button
  onClick={handleRun}
  className="px-4 py-2 text-white text-sm font-medium rounded-lg hover:opacity-90"
  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
>
  {hasRun ? '🔄 Re-run Check' : '▶ Run Compliance Check'}
</button>
                </div>
            )}

            {/* ── Results ──────────────────────────────────────────────── */}
            {data && (
                <>
                    {/* Org summary */}
                    <OrgSummaryBar summary={orgSummary} />

                    {/* Last checked */}
                    {orgSummary?.checkedAt && (
                        <p className="text-xs text-gray-400">
                            Last checked: {new Date(orgSummary.checkedAt).toLocaleString('en-IN')}
                        </p>
                    )}

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <input type="text" placeholder="Search by name..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="pg-search" />
                        {['All', 'Eligible', 'Review Required', 'Ineligible'].map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${filterStatus === s ? 'pg-pill active' : 'pg-pill'}`}>
                                {s}
                            </button>
                        ))}
                        <span className="text-xs text-gray-400 ml-auto">{filtered.length} employee(s)</span>
                    </div>

                    {/* Table header */}
                    <div className="flex flex-col gap-2 overflow-auto flex-1">
                        <div className="pg-table-head">
                            <span className="col-span-3">Employee</span>
                            <span className="col-span-2 text-center">Score</span>
                            <span className="col-span-2">Status</span>
                            <span className="col-span-2">Latest Pay</span>
                            <span className="col-span-2">Flags</span>
                            <span className="col-span-1">Details</span>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center text-gray-400 py-16">No records match your filter.</div>
                        ) : filtered.map(r => {
                            const style = ELIGIBILITY_STYLES[r.eligibilityStatus] || ELIGIBILITY_STYLES.Eligible
                            const criticals = r.flags.filter(f => f.severity === 'critical').length
                            const warnings  = r.flags.filter(f => f.severity === 'warning').length

                            return (
                                <div key={r.employeeID}
                                    className="pg-table-row">
                                    {/* Name */}
                                    <div className="col-span-3">
                                        <p className="font-medium">{r.name}</p>
                                        <p className="text-xs text-gray-400">{r.email}</p>
                                    </div>

                                    {/* Score ring */}
                                    <div className="col-span-2 flex justify-center">
                                        <ScoreRing score={r.complianceScore} />
                                    </div>

                                    {/* Eligibility badge */}
                                    <div className="col-span-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${style.badge}`}>
                                            {r.eligibilityStatus}
                                        </span>
                                    </div>

                                    {/* Latest net pay */}
                                    <div className="col-span-2 text-xs">
                                        <p className="font-semibold">{fmt(r.summary.latestNetPay, r.summary.latestCurrency)}</p>
                                        <p className="text-gray-400">{r.summary.latestStatus ?? '—'}</p>
                                    </div>

                                    {/* Flag summary */}
                                    <div className="col-span-2 flex gap-1 flex-wrap">
                                        {criticals > 0 && (
                                            <span className="px-1.5 py-0.5 rounded-full text-xs bg-red-100 text-red-700 border border-red-200">
                                                🔴 {criticals}
                                            </span>
                                        )}
                                        {warnings > 0 && (
                                            <span className="px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                                                🟡 {warnings}
                                            </span>
                                        )}
                                        {r.flags.length === 0 && (
                                            <span className="px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
                                                ✅ Clean
                                            </span>
                                        )}
                                    </div>

                                    {/* View button */}
                                    <div className="col-span-1">
                                        <button onClick={() => setSelectedRecord(r)}
                                            className="pg-action-btn indigo">
                                            View
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {/* ── Drawers / Modals ────────────────────────────────────── */}
            <DetailDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
            {showRules && orgSummary?.rulesApplied && (
                <RulesPanel rules={orgSummary.rulesApplied} onClose={() => setShowRules(false)} />
            )}
        </PageShell>
    )
}
