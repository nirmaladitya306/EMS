import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetHRAnalytics } from '../../../redux/Thunks/AnalyticsThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --an-tooltip-bg: #18181b;
    --an-tooltip-border: #27272a;
    --an-tooltip-text: #fafafa;
    --an-text-main: #fafafa;
    --an-text-secondary: #a1a1aa;
    --an-text-muted: #71717a;
    --an-axis-text: #a1a1aa;
    --an-grid-line: #27272a;
    --an-rank-bg: rgba(255,255,255,0.08);
    --an-rank-text: #a1a1aa;
    --an-track-bg: rgba(255,255,255,0.1);
  }

  /* Override Recharts Default Legend Text */
  [data-theme='dark'] .recharts-legend-item-text {
    color: var(--an-text-secondary) !important;
  }
`

// ─── Chart colour tokens (match the design system palette) ───────────────────
const C = {
    indigo:  '#6366f1',
    violet:  '#8b5cf6',
    green:   '#16a34a',
    amber:   '#d97706',
    red:     '#dc2626',
    sky:     '#0ea5e9',
    teal:    '#0d9488',
    slate:   '#64748b',
}

// ─── Section card — replaces the old bg-white border-gray-200 Section ────────
// Uses pg-section from PageShell: frosted neutral bg + subtle border + 16px radius
const Section = ({ title, children, style = {} }) => (
    <div className="pg-section" style={style}>
        <div className="pg-section-title">{title}</div>
        {children}
    </div>
)

// ─── KPI mini-card — replaces the coloured bg-blue-50 / bg-green-50 cards ────
// Uses pg-stat-card from PageShell: neutral frosted, DM Serif Display number
const KPI = ({ label, value, sub }) => (
    <div className="pg-stat-card">
        <span className="pg-stat-value" style={{ fontSize: '1.4rem' }}>{value ?? '—'}</span>
        <span className="pg-stat-label">{label}</span>
        {sub && (
            <span style={{ fontSize: 10, color: 'var(--an-text-muted, rgba(0,0,0,0.28))', marginTop: 1 }}>{sub}</span>
        )}
    </div>
)

// ─── Recharts custom tooltip — kept from original, colours updated ─────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'var(--an-tooltip-bg, #ffffff)',
            border: '1px solid var(--an-tooltip-border, rgba(0,0,0,0.08))',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            padding: '8px 12px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
        }}>
            {label && (
                <p style={{ fontWeight: 600, color: 'var(--an-tooltip-text, #0f172a)', marginBottom: 4 }}>{label}</p>
            )}
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color, margin: '2px 0' }}>
                    {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

// ─── Donut chart wrapper ──────────────────────────────────────────────────────
const DonutChart = ({ data, colors, height = 200 }) => (
    <ResponsiveContainer width="100%" height={height}>
        <PieChart>
            <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={82}
                dataKey="value"
                paddingAngle={3}
            >
                {data.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif" }} />
        </PieChart>
    </ResponsiveContainer>
)

// ─── Empty data placeholder inside a section ─────────────────────────────────
const NoData = ({ text = 'No data yet.' }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 0', fontSize: 13, color: 'var(--an-text-muted, rgba(0,0,0,0.3))',
        fontFamily: "'DM Sans', sans-serif",
    }}>
        {text}
    </div>
)

// ─── Shared axis / grid props ─────────────────────────────────────────────────
const axisStyle = { fontSize: 11, fontFamily: "'DM Sans', sans-serif", fill: 'var(--an-axis-text, rgba(0,0,0,0.4))' }
const gridProps = { strokeDasharray: '3 3', stroke: 'var(--an-grid-line, rgba(0,0,0,0.06))' }

// ─── Main page ────────────────────────────────────────────────────────────────
export const HRAnalyticsPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.AnalyticsReducer)
    const d        = state.hrData

    useEffect(() => { dispatch(HandleGetHRAnalytics()) }, [])

    if (state.isLoading || !d) return <Loading />

    if (state.error.status) {
        return (
            <PageShell>
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 12, textAlign: 'center',
                }}>
                    <span style={{ fontSize: '2.5rem' }}>⚠️</span>
                    <p style={{ fontSize: 14, color: '#dc2626', fontFamily: "'DM Sans', sans-serif" }}>
                        Failed to load analytics: {state.error.message}
                    </p>
                </div>
            </PageShell>
        )
    }

    // ── Derived chart data ────────────────────────────────────────────────────
    const leaveDonut = [
        { name: 'Approved', value: d.leaveStats.approved },
        { name: 'Pending',  value: d.leaveStats.pending  },
        { name: 'Rejected', value: d.leaveStats.rejected },
    ].filter(x => x.value > 0)

    const salaryDonut = [
        { name: 'Paid',    value: d.salaryStats.paid    },
        { name: 'Pending', value: d.salaryStats.pending },
        { name: 'Delayed', value: d.salaryStats.delayed },
    ].filter(x => x.value > 0)

    const docDonut = [
        { name: 'Valid',         value: d.documentStats.valid        },
        { name: 'Expiring Soon', value: d.documentStats.expiringSoon },
        { name: 'Expired',       value: d.documentStats.expired      },
    ].filter(x => x.value > 0)

    const exitDonut = [
        { name: 'Pending',     value: d.exitStats.pending    },
        { name: 'In Progress', value: d.exitStats.inProgress },
        { name: 'Cleared',     value: d.exitStats.cleared    },
        { name: 'Rejected',    value: d.exitStats.rejected   },
    ].filter(x => x.value > 0)

    const reqDonut = [
        { name: 'Approved', value: d.requestStats.approved },
        { name: 'Pending',  value: d.requestStats.pending  },
        { name: 'Denied',   value: d.requestStats.denied   },
    ].filter(x => x.value > 0)

    const appByStatus = Object.entries(d.recruitmentStats.applicantsByStatus || {})
        .map(([name, value]) => ({ name: name.replace(/-/g, ' '), value }))

    return (
        <PageShell>
            <style>{styles}</style>

            {/* ── Page header ── */}
            <PageHeader
                eyebrow="Intelligence"
                title="Analytics"
                subtitle="Organisation-wide metrics across all modules"
            />

            {/* ── Overview KPI strip ── */}
            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                <KPI label="Total Employees"  value={d.overview.totalEmployees}                                      />
                <KPI label="Departments"      value={d.overview.totalDepts}                                          />
                <KPI label="Attendance Rate"  value={`${d.overview.orgAttendanceRate}%`}                                 />
                <KPI label="Total Payroll"    value={d.overview.totalPayroll?.toLocaleString()}    sub="sum of all net pay"  />
                <KPI label="Avg Salary"       value={d.overview.avgSalary?.toLocaleString()}       sub="per employee"        />
            </div>

            {/* ── Row 1 — Headcount ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                <Section title="New Hires — Last 6 Months">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.hiresPerMonth} barSize={26}>
                            <CartesianGrid {...gridProps} />
                            <XAxis dataKey="month"  tick={axisStyle} />
                            <YAxis allowDecimals={false} tick={axisStyle} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="hires" name="New Hires" fill={C.indigo} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Headcount by Department">
                    {d.headcountByDept.length === 0 ? <NoData text="No department data yet." /> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={d.headcountByDept} layout="vertical" barSize={16}>
                                <CartesianGrid {...gridProps} horizontal={false} />
                                <XAxis type="number" allowDecimals={false} tick={axisStyle} />
                                <YAxis type="category" dataKey="department" tick={axisStyle} width={110} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="count" name="Employees" fill={C.violet} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Section>
            </div>

            {/* ── Row 2 — Leaves ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                <Section title="Leave Applications — Last 6 Months">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.leavesPerMonth} barSize={20}>
                            <CartesianGrid {...gridProps} />
                            <XAxis dataKey="month" tick={axisStyle} />
                            <YAxis allowDecimals={false} tick={axisStyle} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                            <Bar dataKey="approved" name="Approved" stackId="a" fill={C.green}                        />
                            <Bar dataKey="pending"  name="Pending"  stackId="a" fill={C.amber}                        />
                            <Bar dataKey="rejected" name="Rejected" stackId="a" fill={C.red}   radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Leave Status Breakdown">
                    {leaveDonut.length === 0
                        ? <NoData text="No leave data yet." />
                        : <DonutChart data={leaveDonut} colors={[C.green, C.amber, C.red]} />
                    }
                </Section>
            </div>

            {/* ── Row 3 — Payroll trend (full width) ── */}
            <Section title="Payroll Trend — Last 6 Months">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={d.payrollPerMonth}>
                        <CartesianGrid {...gridProps} />
                        <XAxis dataKey="month" tick={axisStyle} />
                        <YAxis tick={axisStyle} tickFormatter={v => v.toLocaleString()} />
                        <Tooltip content={<ChartTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif" }} />
                        <Line type="monotone" dataKey="total"      name="Net Pay"    stroke={C.indigo} strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="bonuses"    name="Bonuses"    stroke={C.green}  strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                        <Line type="monotone" dataKey="deductions" name="Deductions" stroke={C.red}    strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                    </LineChart>
                </ResponsiveContainer>
            </Section>

            {/* ── Row 4 — Salary · Docs · Requests ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>

                <Section title="Salary Payment Status">
                    {salaryDonut.length === 0
                        ? <NoData text="No salary data." />
                        : <DonutChart data={salaryDonut} colors={[C.green, C.amber, C.red]} />
                    }
                </Section>

                <Section title="Document Status">
                    {docDonut.length === 0
                        ? <NoData text="No documents yet." />
                        : <DonutChart data={docDonut} colors={[C.green, C.amber, C.red]} />
                    }
                </Section>

                <Section title="Request Outcomes">
                    {reqDonut.length === 0
                        ? <NoData text="No requests yet." />
                        : <DonutChart data={reqDonut} colors={[C.green, C.amber, C.red]} />
                    }
                </Section>
            </div>

            {/* ── Row 5 — Recruitment · Exit clearance ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                <Section title={`Recruitment Pipeline — ${d.recruitmentStats.openRoles} open role${d.recruitmentStats.openRoles !== 1 ? 's' : ''}`}>
                    {appByStatus.length === 0 ? <NoData text="No applicants yet." /> : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={appByStatus} barSize={28}>
                                <CartesianGrid {...gridProps} />
                                <XAxis dataKey="name" tick={{ ...axisStyle, fontSize: 10 }} />
                                <YAxis allowDecimals={false} tick={axisStyle} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="value" name="Applicants" fill={C.indigo} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Section>

                <Section title="Exit Clearance Status">
                    {/* Mini KPI grid inside the section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <KPI label="Total"       value={d.exitStats.total}      />
                        <KPI label="In Progress" value={d.exitStats.inProgress} />
                        <KPI label="Cleared"     value={d.exitStats.cleared}    />
                        <KPI label="Pending"     value={d.exitStats.pending}    />
                    </div>
                    {exitDonut.length > 0 && (
                        <DonutChart data={exitDonut} colors={[C.amber, C.sky, C.green, C.red]} height={180} />
                    )}
                </Section>
            </div>

            {/* ── Row 6 — Notices · Top actions ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                <Section title="Notices Issued — Last 6 Months">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={d.noticesPerMonth} barSize={26}>
                            <CartesianGrid {...gridProps} />
                            <XAxis dataKey="month" tick={axisStyle} />
                            <YAxis allowDecimals={false} tick={axisStyle} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="count" name="Notices" fill={C.amber} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="Top System Actions — Last 30 Days">
                    {d.topActions.length === 0
                        ? <NoData text="No activity in the last 30 days." />
                        : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {d.topActions.map((a, i) => {
                                    const max = d.topActions[0]?.count || 1
                                    const pct = Math.round((a.count / max) * 100)
                                    return (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {/* Rank badge */}
                                            <span style={{
                                                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                                                background: i === 0 ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--an-rank-bg, rgba(0,0,0,0.06))',
                                                color: i === 0 ? 'white' : 'var(--an-rank-text, rgba(0,0,0,0.4))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 9, fontWeight: 700,
                                                fontFamily: "'DM Serif Display', serif",
                                            }}>
                                                {i + 1}
                                            </span>
                                            {/* Action name */}
                                            <span style={{
                                                width: 150, flexShrink: 0,
                                                fontSize: 12, color: 'var(--an-text-secondary, rgba(0,0,0,0.55))',
                                                overflow: 'hidden', textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap', textTransform: 'capitalize',
                                                fontFamily: "'DM Sans', sans-serif",
                                            }}>
                                                {a.action.replace(/_/g, ' ').toLowerCase()}
                                            </span>
                                            {/* Bar track */}
                                            <div style={{
                                                flex: 1, height: 6, borderRadius: 100,
                                                background: 'var(--an-track-bg, rgba(0,0,0,0.06))',
                                            }}>
                                                <div style={{
                                                    width: `${pct}%`, height: '100%', borderRadius: 100,
                                                    background: i === 0
                                                        ? 'linear-gradient(90deg,#6366f1,#8b5cf6)'
                                                        : 'rgba(99,102,241,0.35)',
                                                    transition: 'width 0.4s ease',
                                                }} />
                                            </div>
                                            {/* Count */}
                                            <span style={{
                                                width: 28, textAlign: 'right', flexShrink: 0,
                                                fontSize: 12, fontWeight: 700, color: 'var(--an-text-main, #0f172a)',
                                                fontFamily: "'DM Serif Display', serif",
                                            }}>
                                                {a.count}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    }
                </Section>
            </div>

        </PageShell>
    )
}