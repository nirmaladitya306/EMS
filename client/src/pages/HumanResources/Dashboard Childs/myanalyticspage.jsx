import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetEmployeeAnalytics } from '../../../redux/Thunks/AnalyticsThunk'
import { Loading } from '../../../components/common/loading'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadialBarChart, RadialBar
} from 'recharts'

const PURPLE = '#9333ea'
const GREEN  = '#22c55e'
const RED    = '#ef4444'
const AMBER  = '#f59e0b'
const BLUE   = '#3b82f6'
const TEAL   = '#14b8a6'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ═══════════════════════════════════════════════════════
     DARK MODE OVERRIDES
  ═══════════════════════════════════════════════════════ */
  [data-theme='dark'] {
    --ma-section-bg: #18181b;
    --ma-border: #27272a;
    --ma-text-main: #fafafa;
    --ma-text-muted: #a1a1aa;
    --ma-text-faint: #71717a;
    
    --ma-kpi-bg: rgba(255,255,255,0.02);
    --ma-kpi-border: rgba(255,255,255,0.06);
    --ma-mini-bg: rgba(255,255,255,0.04);
    --ma-track-bg: rgba(255,255,255,0.08);

    /* Recharts Tooltip Overrides */
    --ma-tooltip-bg: #18181b;
    --ma-tooltip-border: #27272a;
  }

  /* Override Recharts Default Legend Text */
  [data-theme='dark'] .recharts-legend-item-text {
    color: var(--ma-text-muted) !important;
  }

  .ma-section {
    background: var(--ma-section-bg, #ffffff);
    border: 1px solid var(--ma-border, rgba(0,0,0,0.07));
    border-radius: 16px; padding: 18px 20px;
    display: flex; flex-direction: column; gap: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, border-color 0.2s;
  }
  .ma-section-title {
    font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--ma-text-muted, rgba(0,0,0,0.35));
    border-bottom: 1px solid var(--ma-border, rgba(0,0,0,0.06)); padding-bottom: 10px;
  }

  .ma-kpi {
    border-radius: 12px; border: 1px solid; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 3px;
    font-family: 'DM Sans', sans-serif;
  }
  .ma-kpi-value { font-family: 'DM Serif Display', serif; font-size: 1.5rem; line-height: 1; letter-spacing: -0.02em; color: var(--ma-text-main, #0f172a); }
  .ma-kpi-label { font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ma-text-faint, rgba(0,0,0,0.4)); }
  .ma-kpi-sub   { font-size: 11px; color: var(--ma-text-faint, rgba(0,0,0,0.3)); }

  .ma-att-mini {
    border-radius: 10px; border: 1px solid var(--ma-border, rgba(0,0,0,0.07));
    background: var(--ma-mini-bg, rgba(0,0,0,0.02));
    padding: 10px; text-align: center;
  }
  .ma-att-mini-val  { font-size: 1.2rem; font-weight: 700; }
  .ma-att-mini-label { font-size: 11px; color: var(--ma-text-faint, rgba(0,0,0,0.4)); margin-top: 2px; }

  .ma-gauge-label { font-size: 12px; color: var(--ma-text-faint, rgba(0,0,0,0.38)); font-family: 'DM Sans', sans-serif; }

  .ma-activity-label { font-size: 11px; font-weight: 600; color: var(--ma-text-muted, rgba(0,0,0,0.5)); text-transform: capitalize; }
  .ma-activity-count { font-size: 11px; color: var(--ma-text-faint, rgba(0,0,0,0.35)); }
  .ma-activity-track { width: 100%; background: var(--ma-track-bg, rgba(0,0,0,0.07)); border-radius: 100px; height: 5px; }
  .ma-activity-fill  { height: 5px; border-radius: 100px; background: #6366f1; transition: width 0.4s; }

  .ma-no-data { text-align: center; font-size: 13px; color: var(--ma-text-faint, rgba(0,0,0,0.3)); padding: 32px 0; font-family: 'DM Sans', sans-serif; }

  .ma-tooltip {
    background: var(--ma-tooltip-bg, #ffffff);
    border: 1px solid var(--ma-tooltip-border, rgba(0,0,0,0.08));
    border-radius: 10px; padding: 8px 12px;
    font-size: 12px; font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
  .ma-tooltip-label { color: var(--ma-text-muted, rgba(0,0,0,0.5)); margin-bottom: 4px; }
`

const Section = ({ title, children, className = '' }) => (
    <div className={`ma-section ${className}`}>
        <h2 className="ma-section-title">{title}</h2>
        {children}
    </div>
)

const KPI = ({ label, value, sub, borderColor = 'var(--ma-kpi-border)', bgColor = 'var(--ma-kpi-bg)' }) => (
    <div className="ma-kpi" style={{ borderColor, background: bgColor }}>
        <span className="ma-kpi-value">{value ?? '—'}</span>
        <span className="ma-kpi-label">{label}</span>
        {sub && <span className="ma-kpi-sub">{sub}</span>}
    </div>
)

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="ma-tooltip">
            <p className="ma-tooltip-label">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color, fontWeight: 500 }}>
                    {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

const DonutChart = ({ data, colors }) => (
    <ResponsiveContainer width="100%" height={190}>
        <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                dataKey="value" paddingAngle={3}>
                {data.map((entry, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
    </ResponsiveContainer>
)

const AttendanceGauge = ({ rate }) => {
    const color = rate >= 80 ? GREEN : rate >= 60 ? AMBER : RED
    const data  = [{ name: 'Attendance', value: rate, fill: color }]
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                    data={data} startAngle={210} endAngle={-30} barSize={14}>
                    <RadialBar background={{ fill: 'var(--ma-track-bg, rgba(0,0,0,0.07))' }} dataKey="value" cornerRadius={8} />
                </RadialBarChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, marginTop: -44, color, fontFamily: "'DM Serif Display', serif" }}>{rate}%</p>
            <p className="ma-gauge-label" style={{ marginTop: 8 }}>Attendance Rate</p>
        </div>
    )
}

export const MyAnalyticsPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.AnalyticsReducer)
    const d        = state.employeeData

    useEffect(() => { dispatch(HandleGetEmployeeAnalytics()) }, [dispatch])

    if (state.isLoading || !d) return <Loading />

    const leaveDonut = [
        { name: 'Approved', value: d.leaveStats?.approved || 0 },
        { name: 'Pending',  value: d.leaveStats?.pending  || 0 },
        { name: 'Rejected', value: d.leaveStats?.rejected || 0 },
    ].filter(x => x.value > 0)

    const reqDonut = [
        { name: 'Approved', value: d.requestStats?.approved || 0 },
        { name: 'Pending',  value: d.requestStats?.pending  || 0 },
        { name: 'Denied',   value: d.requestStats?.denied   || 0 },
    ].filter(x => x.value > 0)

    const docDonut = [
        { name: 'Valid',         value: d.documentStats?.valid         || 0 },
        { name: 'Expiring Soon', value: d.documentStats?.expiringSoon  || 0 },
        { name: 'Expired',       value: d.documentStats?.expired       || 0 },
    ].filter(x => x.value > 0)

    const attBreakdown = [
        { name: 'Present',       value: d.attendanceStats?.present      || 0, color: GREEN },
        { name: 'Absent',        value: d.attendanceStats?.absent       || 0, color: RED   },
        { name: 'Not Specified', value: d.attendanceStats?.notSpecified || 0, color: AMBER },
    ].filter(x => x.value > 0)

    const currency = d.latestSalary?.currency || 'INR'

    const overviewKPIs = [
        { label: 'Attendance', value: `${d.overview?.attendanceRate || 0}%`, borderColor: 'rgba(99,102,241,0.2)',  bgColor: 'rgba(99,102,241,0.05)' },
        { label: 'Leaves',     value: d.overview?.totalLeaves,                borderColor: 'rgba(245,158,11,0.2)', bgColor: 'rgba(245,158,11,0.05)' },
        { label: 'Salaries',   value: d.overview?.totalSalaries,              borderColor: 'rgba(22,163,74,0.2)',  bgColor: 'rgba(22,163,74,0.05)'  },
        { label: 'Requests',   value: d.overview?.totalRequests,              borderColor: 'rgba(59,130,246,0.2)', bgColor: 'rgba(59,130,246,0.05)' },
        { label: 'Notices',    value: d.overview?.totalNotices,               borderColor: 'rgba(249,115,22,0.2)', bgColor: 'rgba(249,115,22,0.05)' },
        { label: 'Documents',  value: d.overview?.totalDocs,                  borderColor: 'rgba(20,184,166,0.2)', bgColor: 'rgba(20,184,166,0.05)' },
    ]

    return (
        <>
            <style>{styles}</style>
            <PageShell>
                <PageHeader eyebrow="Overview" title="My Analytics" subtitle="A personal breakdown of your activity and records" />

                {/* Overview KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {overviewKPIs.map(k => <KPI key={k.label} {...k} />)}
                </div>

                {/* Attendance */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <Section title="Attendance Rate">
                        <AttendanceGauge rate={d.attendanceStats?.rate || 0} />
                        <div className="grid grid-cols-3 gap-2 text-center">
                            {attBreakdown.map(a => (
                                <div key={a.name} className="ma-att-mini">
                                    <p className="ma-att-mini-val" style={{ color: a.color }}>{a.value}</p>
                                    <p className="ma-att-mini-label">{a.name}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                    <Section title="Attendance — Last 6 Months" className="lg:col-span-2">
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={d.attPerMonth || []} barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--ma-border, rgba(0,0,0,0.05))" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--ma-text-muted, rgba(0,0,0,0.35))' }} axisLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--ma-text-muted, rgba(0,0,0,0.35))' }} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--ma-track-bg, rgba(0,0,0,0.02))' }} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="present" name="Present" fill={GREEN} radius={[4,4,0,0]} />
                                <Bar dataKey="absent"  name="Absent"  fill={RED}   radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>
                </div>

                {/* Salary */}
                <Section title="Salary History">
                    {!d.salaryTrend || d.salaryTrend.length === 0 ? (
                        <p className="ma-no-data">No salary records yet.</p>
                    ) : (
                        <>
                            {d.latestSalary && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <KPI label="Latest Net Pay" value={`${currency} ${d.latestSalary.netpay?.toLocaleString()}`}   borderColor="rgba(22,163,74,0.2)"  bgColor="rgba(22,163,74,0.05)" />
                                    <KPI label="Basic Pay"      value={`${currency} ${d.latestSalary.basicpay?.toLocaleString()}`} borderColor="rgba(59,130,246,0.2)" bgColor="rgba(59,130,246,0.05)" />
                                    <KPI label="Bonuses"        value={`${currency} ${d.latestSalary.bonuses?.toLocaleString()}`}  borderColor="rgba(245,158,11,0.2)" bgColor="rgba(245,158,11,0.05)" />
                                    <KPI label="Deductions"     value={`${currency} ${d.latestSalary.deductions?.toLocaleString()}`} borderColor="rgba(239,68,68,0.2)" bgColor="rgba(239,68,68,0.05)" />
                                </div>
                            )}
                            <ResponsiveContainer width="100%" height={220}>
                                <LineChart data={d.salaryTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ma-border, rgba(0,0,0,0.05))" vertical={false} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--ma-text-muted, rgba(0,0,0,0.35))' }} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--ma-text-muted, rgba(0,0,0,0.35))' }} tickFormatter={v => v.toLocaleString()} axisLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                    <Line type="monotone" dataKey="netpay"   name="Net Pay"   stroke={PURPLE} strokeWidth={2} dot={{ r: 3 }} />
                                    <Line type="monotone" dataKey="basicpay" name="Basic Pay" stroke={BLUE}   strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                                </LineChart>
                            </ResponsiveContainer>
                        </>
                    )}
                </Section>

                {/* Donuts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Section title="My Leaves">
                        {leaveDonut.length > 0 ? <DonutChart data={leaveDonut} colors={[GREEN, AMBER, RED]} /> : <p className="ma-no-data">No records</p>}
                    </Section>
                    <Section title="My Requests">
                        {reqDonut.length > 0 ? <DonutChart data={reqDonut} colors={[GREEN, AMBER, RED]} /> : <p className="ma-no-data">No records</p>}
                    </Section>
                    <Section title="My Documents">
                        {docDonut.length > 0 ? <DonutChart data={docDonut} colors={[GREEN, AMBER, RED]} /> : <p className="ma-no-data">No records</p>}
                    </Section>
                </div>

                {/* Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <Section title="Leave Applications History">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={d.leavesPerMonth || []} barSize={26}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--ma-border, rgba(0,0,0,0.05))" vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--ma-text-muted, rgba(0,0,0,0.35))' }} axisLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--ma-text-muted, rgba(0,0,0,0.35))' }} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="total" name="Leaves" fill={AMBER} radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Section>
                    <Section title="My Activity Breakdown">
                        {!d.topActions || d.topActions.length === 0 ? (
                            <p className="ma-no-data">No recent activity.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {d.topActions.map((a, i) => {
                                    const max = d.topActions[0]?.count || 1
                                    const pct = Math.round((a.count / max) * 100)
                                    return (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="ma-activity-label">{a.action.toLowerCase().replace(/_/g, ' ')}</span>
                                                <span className="ma-activity-count">{a.count}</span>
                                            </div>
                                            <div className="ma-activity-track">
                                                <div className="ma-activity-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </Section>
                </div>

            </PageShell>
        </>
    )
}