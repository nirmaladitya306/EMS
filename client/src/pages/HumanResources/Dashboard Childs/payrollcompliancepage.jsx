import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleRunComplianceCheck } from '../../../redux/Thunks/PayrollComplianceThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, cur) =>
    n != null
        ? new Intl.NumberFormat('en-IN', {
              style: 'currency', currency: cur || 'INR', maximumFractionDigits: 0,
          }).format(n)
        : '—'

const initials = (name) =>
    (name || '')
        .split(' ')
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? '')
        .join('')

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 30, fontSize = 11 }) => (
    <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize,
        fontFamily: "'DM Serif Display', serif", letterSpacing: '0.03em',
    }}>
        {initials(name)}
    </div>
)

// ─── Eligibility pill ─────────────────────────────────────────────────────────
const ELIGIBILITY = {
    Eligible:          { bg: 'rgba(22,163,74,0.08)',  color: '#15803d', border: 'rgba(22,163,74,0.22)'  },
    'Review Required': { bg: 'rgba(234,179,8,0.09)',  color: '#854d0e', border: 'rgba(234,179,8,0.3)'   },
    Ineligible:        { bg: 'rgba(220,38,38,0.07)', color: '#dc2626', border: 'rgba(220,38,38,0.2)'   },
}

const EligibilityPill = ({ status }) => {
    const s = ELIGIBILITY[status] || { bg: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.45)', border: 'rgba(0,0,0,0.1)' }
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

// ─── Score ring (SVG donut) ───────────────────────────────────────────────────
const ScoreRing = ({ score }) => {
    const colour = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626'
    const r = 22, cx = 28, cy = 28, strokeW = 5
    const circ = 2 * Math.PI * r
    const dash  = (score / 100) * circ
    return (
        <svg width={56} height={56} viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={strokeW} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={colour} strokeWidth={strokeW}
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 28 28)" />
            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={colour}>
                {score}
            </text>
        </svg>
    )
}

// ─── Severity flag row ────────────────────────────────────────────────────────
const SEVERITY = {
    critical: { bg: 'rgba(220,38,38,0.07)',  color: '#dc2626', border: 'rgba(220,38,38,0.2)',  dot: '#dc2626' },
    warning:  { bg: 'rgba(234,179,8,0.08)',  color: '#854d0e', border: 'rgba(234,179,8,0.25)', dot: '#d97706' },
    info:     { bg: 'rgba(99,102,241,0.07)', color: '#4f46e5', border: 'rgba(99,102,241,0.2)', dot: '#6366f1' },
}

const FlagRow = ({ flag }) => {
    const s = SEVERITY[flag.severity] || SEVERITY.info
    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            padding: '9px 12px', borderRadius: 10,
            background: s.bg, border: `1px solid ${s.border}`,
        }}>
            <span style={{
                width: 7, height: 7, borderRadius: '50%', background: s.dot,
                flexShrink: 0, marginTop: 4,
            }} />
            <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
                    {flag.rule?.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: 12, color: s.color, opacity: 0.85 }}>{flag.message}</div>
            </div>
        </div>
    )
}

// ─── Detail drawer (slides from right) ───────────────────────────────────────
const DetailDrawer = ({ record, onClose }) => {
    if (!record) return null

    const summaryRows = [
        { label: 'Salary Records',   value: record.summary.totalSalaryRecords },
        { label: 'Latest Net Pay',   value: fmt(record.summary.latestNetPay, record.summary.latestCurrency) },
        { label: 'Latest Status',    value: record.summary.latestStatus  ?? '—' },
        { label: 'Attendance Rate',  value: record.summary.attendanceRate != null ? `${record.summary.attendanceRate}%` : '—' },
        { label: 'Pending Leaves',   value: record.summary.pendingLeaves },
        { label: 'Delayed Payments', value: record.summary.delayedCount  },
    ]

    const criticals = record.flags.filter(f => f.severity === 'critical').length
    const warnings  = record.flags.filter(f => f.severity === 'warning').length

    return (
        <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}
            onClick={onClose}
        >
            <div
                style={{
                    background: '#ffffff', width: '100%', maxWidth: 480,
                    height: '100%', overflowY: 'auto', boxShadow: '-24px 0 64px rgba(0,0,0,0.12)',
                    display: 'flex', flexDirection: 'column',
                    fontFamily: "'DM Sans', sans-serif",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Drawer header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={record.name} size={44} fontSize={15} />
                        <div>
                            <div style={{
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: '1.1rem', color: '#0f172a',
                                letterSpacing: '-0.02em', lineHeight: 1.2,
                            }}>
                                {record.name}
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', marginTop: 3 }}>
                                {record.email}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: 18, color: 'rgba(0,0,0,0.35)', lineHeight: 1,
                            padding: 4, marginTop: 2,
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Drawer body */}
                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 24, flex: 1 }}>

                    {/* Score + eligibility */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        background: 'rgba(0,0,0,0.012)', border: '1px solid rgba(0,0,0,0.07)',
                        borderRadius: 14, padding: '14px 18px',
                    }}>
                        <ScoreRing score={record.complianceScore} />
                        <div>
                            <EligibilityPill status={record.eligibilityStatus} />
                            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', marginTop: 6 }}>
                                Compliance score: <strong style={{ color: '#0f172a' }}>{record.complianceScore}</strong> / 100
                            </div>
                        </div>
                        {(criticals > 0 || warnings > 0) && (
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {criticals > 0 && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, padding: '3px 9px',
                                        borderRadius: 100, background: 'rgba(220,38,38,0.08)',
                                        color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)',
                                    }}>
                                        {criticals} critical
                                    </span>
                                )}
                                {warnings > 0 && (
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, padding: '3px 9px',
                                        borderRadius: 100, background: 'rgba(234,179,8,0.09)',
                                        color: '#854d0e', border: '1px solid rgba(234,179,8,0.3)',
                                    }}>
                                        {warnings} warning
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Payroll summary grid */}
                    <div>
                        <div style={{
                            fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
                            marginBottom: 10,
                        }}>
                            Payroll Summary
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                            {summaryRows.map(({ label, value }) => (
                                <div key={label} style={{
                                    background: 'rgba(0,0,0,0.012)', border: '1px solid rgba(0,0,0,0.07)',
                                    borderRadius: 10, padding: '10px 12px',
                                }}>
                                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: 4 }}>
                                        {label}
                                    </div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Flags */}
                    {record.flags.length > 0 && (
                        <div>
                            <div style={{
                                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                                textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
                                marginBottom: 10,
                            }}>
                                Compliance Flags ({record.flags.length})
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {record.flags.map((f, i) => <FlagRow key={i} flag={f} />)}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {record.recommendations?.length > 0 && (
                        <div>
                            <div style={{
                                fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                                textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
                                marginBottom: 10,
                            }}>
                                Recommendations
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {record.recommendations.map((rec, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10,
                                        padding: '9px 12px', borderRadius: 10,
                                        background: 'rgba(99,102,241,0.05)',
                                        border: '1px solid rgba(99,102,241,0.15)',
                                    }}>
                                        <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>💡</span>
                                        <span style={{ fontSize: 12, color: '#4f46e5', lineHeight: 1.5 }}>{rec}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Rules modal ──────────────────────────────────────────────────────────────
const RulesModal = ({ rules, onClose }) => (
    <div className="pg-modal-overlay">
        <div className="pg-modal">
            <div>
                <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '1.25rem', color: '#0f172a',
                    letterSpacing: '-0.02em', marginBottom: 4,
                }}>
                    Compliance Rules
                </div>
                <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.38)', margin: 0 }}>
                    Thresholds applied during the last compliance check.
                </p>
            </div>

            <div className="pg-divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {Object.entries(rules).map(([key, val], i, arr) => (
                    <div key={key} style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', gap: 16, padding: '9px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    }}>
                        <span style={{
                            fontSize: 12, color: 'rgba(0,0,0,0.55)',
                            textTransform: 'capitalize',
                        }}>
                            {key.replace(/_/g, ' ').toLowerCase()}
                        </span>
                        <span style={{
                            fontSize: 13, fontWeight: 700, color: '#4f46e5',
                            background: 'rgba(99,102,241,0.07)',
                            border: '1px solid rgba(99,102,241,0.18)',
                            borderRadius: 8, padding: '2px 10px',
                        }}>
                            {val}{typeof val === 'number' && key.includes('PCT') ? '%' : ''}
                        </span>
                    </div>
                ))}
            </div>

            <div className="pg-modal-actions">
                <button className="pg-btn-ghost" onClick={onClose}>Close</button>
            </div>
        </div>
    </div>
)

// ─── Main page ────────────────────────────────────────────────────────────────
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

            {/* ── Page header ── */}
            <PageHeader
                eyebrow="Intelligence"
                title="Payroll Compliance"
                subtitle="Validate employee payroll eligibility against organisation rules"
            >
                <div style={{ display: 'flex', gap: 8 }}>
                    {orgSummary?.rulesApplied && (
                        <button className="pg-btn-ghost" onClick={() => setShowRules(true)}>
                            📋 View Rules
                        </button>
                    )}
                    <button className="pg-btn-primary" onClick={handleRun}>
                        {hasRun ? '↺ Re-run Check' : '▶ Run Check'}
                    </button>
                </div>
            </PageHeader>

            {/* ── Error ── */}
            {error?.status && (
                <div style={{
                    background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
                    borderRadius: 12, padding: '12px 16px', fontSize: 13, color: '#dc2626',
                }}>
                    {error.message}
                </div>
            )}

            {/* ── Pre-run prompt ── */}
            {!data && !isLoading && (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 20, textAlign: 'center', padding: '40px 20px',
                }}>
                    {/* Icon tile */}
                    <div style={{
                        width: 72, height: 72, borderRadius: 18,
                        background: 'rgba(99,102,241,0.07)',
                        border: '1px solid rgba(99,102,241,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32,
                    }}>
                        🛡️
                    </div>

                    <div>
                        <div style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '1.4rem', color: '#0f172a',
                            letterSpacing: '-0.02em', marginBottom: 8,
                        }}>
                            Ready to check payroll compliance
                        </div>
                        <p style={{
                            fontSize: 13, color: 'rgba(0,0,0,0.38)',
                            lineHeight: 1.7, maxWidth: 400, margin: '0 auto',
                        }}>
                            Run the compliance engine to analyse all employees against your
                            organisation's payroll rules — attendance thresholds, salary caps,
                            overdue payments, and more.
                        </p>
                    </div>

                    <button className="pg-btn-primary" onClick={handleRun} style={{ padding: '10px 28px' }}>
                        ▶ Run Compliance Check
                    </button>
                </div>
            )}

            {/* ── Results ── */}
            {data && (
                <>
                    {/* Stats strip */}
                    <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                        {[
                            { label: 'Total Employees',  value: orgSummary?.totalEmployees ?? data.length },
                            { label: 'Eligible',         value: orgSummary?.eligible         ?? '—' },
                            { label: 'Review Required',  value: orgSummary?.reviewRequired   ?? '—' },
                            { label: 'Ineligible',       value: orgSummary?.ineligible       ?? '—' },
                            { label: 'Avg Compliance',   value: orgSummary?.avgComplianceScore != null ? `${orgSummary.avgComplianceScore}%` : '—' },
                        ].map(s => (
                            <div key={s.label} className="pg-stat-card">
                                <span className="pg-stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</span>
                                <span className="pg-stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Last checked */}
                    {orgSummary?.checkedAt && (
                        <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.3)', marginTop: -8 }}>
                            Last checked: {new Date(orgSummary.checkedAt).toLocaleString('en-IN')}
                        </p>
                    )}

                    {/* Filters */}
                    <div className="pg-filters">
                        <input
                            className="pg-search"
                            type="text"
                            placeholder="Search by employee name…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ minWidth: 240 }}
                        />
                        {['All', 'Eligible', 'Review Required', 'Ineligible'].map(s => (
                            <button
                                key={s}
                                className={`pg-pill${filterStatus === s ? ' active' : ''}`}
                                onClick={() => setFilterStatus(s)}
                            >
                                {s}
                            </button>
                        ))}
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(0,0,0,0.3)' }}>
                            {filtered.length} employee{filtered.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Table */}
                    <div className="pg-table-wrap">

                        {/* Header */}
                        <div
                            className="pg-table-head"
                            style={{ gridTemplateColumns: '2fr 60px 140px 1fr 140px 80px' }}
                        >
                            <span className="pg-th">Employee</span>
                            <span className="pg-th">Score</span>
                            <span className="pg-th">Eligibility</span>
                            <span className="pg-th">Latest Pay</span>
                            <span className="pg-th">Flags</span>
                            <span className="pg-th">Details</span>
                        </div>

                        {/* Empty */}
                        {filtered.length === 0 && (
                            <div className="pg-empty">
                                <span className="pg-empty-icon">🔍</span>
                                <p className="pg-empty-title">No records match your filters</p>
                                <p className="pg-empty-sub">Try adjusting your search or status filter.</p>
                            </div>
                        )}

                        {/* Rows */}
                        {filtered.map(r => {
                            const criticals = r.flags.filter(f => f.severity === 'critical').length
                            const warnings  = r.flags.filter(f => f.severity === 'warning').length

                            return (
                                <div
                                    key={r.employeeID}
                                    className="pg-table-row"
                                    style={{ gridTemplateColumns: '2fr 60px 140px 1fr 140px 80px' }}
                                >
                                    {/* Employee */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Avatar name={r.name} />
                                        <div>
                                            <div className="pg-td-name">{r.name}</div>
                                            <div className="pg-td-sub">{r.email}</div>
                                        </div>
                                    </div>

                                    {/* Score ring */}
                                    <span>
                                        <ScoreRing score={r.complianceScore} />
                                    </span>

                                    {/* Eligibility */}
                                    <span>
                                        <EligibilityPill status={r.eligibilityStatus} />
                                    </span>

                                    {/* Latest pay */}
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                            {fmt(r.summary.latestNetPay, r.summary.latestCurrency)}
                                        </div>
                                        <div className="pg-td-sub">{r.summary.latestStatus ?? '—'}</div>
                                    </div>

                                    {/* Flag summary */}
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                        {r.flags.length === 0 ? (
                                            <span style={{
                                                fontSize: 11, fontWeight: 600, padding: '3px 9px',
                                                borderRadius: 100,
                                                background: 'rgba(22,163,74,0.08)',
                                                color: '#15803d',
                                                border: '1px solid rgba(22,163,74,0.22)',
                                            }}>
                                                ✓ Clean
                                            </span>
                                        ) : (
                                            <>
                                                {criticals > 0 && (
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 600, padding: '3px 9px',
                                                        borderRadius: 100,
                                                        background: 'rgba(220,38,38,0.08)',
                                                        color: '#dc2626',
                                                        border: '1px solid rgba(220,38,38,0.2)',
                                                    }}>
                                                        {criticals} critical
                                                    </span>
                                                )}
                                                {warnings > 0 && (
                                                    <span style={{
                                                        fontSize: 11, fontWeight: 600, padding: '3px 9px',
                                                        borderRadius: 100,
                                                        background: 'rgba(234,179,8,0.09)',
                                                        color: '#854d0e',
                                                        border: '1px solid rgba(234,179,8,0.3)',
                                                    }}>
                                                        {warnings} warning
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* View */}
                                    <span>
                                        <button
                                            className="pg-action-btn indigo"
                                            onClick={() => setSelectedRecord(r)}
                                        >
                                            View
                                        </button>
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {/* ── Detail drawer ── */}
            {selectedRecord && (
                <DetailDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
            )}

            {/* ── Rules modal ── */}
            {showRules && orgSummary?.rulesApplied && (
                <RulesModal rules={orgSummary.rulesApplied} onClose={() => setShowRules(false)} />
            )}

        </PageShell>
    )
}