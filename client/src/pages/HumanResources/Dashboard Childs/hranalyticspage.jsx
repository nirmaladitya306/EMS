import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetHRAnalytics } from '../../../redux/Thunks/AnalyticsThunk'
import { Loading } from '../../../components/common/loading'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ─── Colour palettes ──────────────────────────────────────────────────────────
const BLUE    = '#3b82f6'
const GREEN   = '#22c55e'
const RED     = '#ef4444'
const AMBER   = '#f59e0b'
const INDIGO  = '#6366f1'
const TEAL    = '#14b8a6'
const SLATE   = '#94a3b8'
const PIE_COLORS = [GREEN, AMBER, RED, INDIGO, TEAL, SLATE, BLUE]

// ─── Reusable section wrapper ─────────────────────────────────────────────────
const Section = ({ title, children, className = '' }) => (
    <div className={`bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 ${className}`}>
        <h2 className="text-base font-bold text-gray-700 border-b border-gray-100 pb-2">{title}</h2>
        {children}
    </div>
)

// ─── KPI card ─────────────────────────────────────────────────────────────────
const KPI = ({ label, value, sub, color = 'border-gray-200 bg-gray-50' }) => (
    <div className={`rounded-xl border p-4 flex flex-col gap-1 ${color}`}>
        <span className="text-2xl font-bold text-gray-800">{value ?? '—'}</span>
        <span className="text-sm font-medium text-gray-600">{label}</span>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
)

// ─── Custom tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
            <p className="font-semibold text-gray-700 mb-1">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong></p>
            ))}
        </div>
    )
}

// ─── Donut / Pie wrapper ──────────────────────────────────────────────────────
const DonutChart = ({ data, colors }) => (
    <ResponsiveContainer width="100%" height={200}>
        <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="value" paddingAngle={3}>
                {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => v.toLocaleString()} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
    </ResponsiveContainer>
)

// ─── Main HR Analytics page ───────────────────────────────────────────────────
export const HRAnalyticsPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.AnalyticsReducer)
    const d        = state.hrData

    useEffect(() => { dispatch(HandleGetHRAnalytics()) }, [])

    if (state.isLoading || !d) return <Loading />

    if (state.error.status) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500 text-sm">
                Failed to load analytics: {state.error.message}
            </div>
        )
    }

    // ── Derived data for charts ───────────────────────────────────────────────
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
        { name: 'Valid',         value: d.documentStats.valid         },
        { name: 'Expiring Soon', value: d.documentStats.expiringSoon  },
        { name: 'Expired',       value: d.documentStats.expired       },
    ].filter(x => x.value > 0)

    const exitDonut = [
        { name: 'Pending',     value: d.exitStats.pending     },
        { name: 'In Progress', value: d.exitStats.inProgress  },
        { name: 'Cleared',     value: d.exitStats.cleared     },
        { name: 'Rejected',    value: d.exitStats.rejected    },
    ].filter(x => x.value > 0)

    const reqDonut = [
        { name: 'Approved', value: d.requestStats.approved },
        { name: 'Pending',  value: d.requestStats.pending  },
        { name: 'Denied',   value: d.requestStats.denied   },
    ].filter(x => x.value > 0)

    const appByStatus = Object.entries(d.recruitmentStats.applicantsByStatus || {})
        .map(([name, value]) => ({ name: name.replace(/-/g, ' '), value }))

    return (
        <div className="hr-analytics-page w-full mx-auto my-8 flex flex-col gap-6 pb-10 pe-5 overflow-auto">

            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-bold">Analytics</h1>
                <p className="text-sm text-gray-500 mt-1">Organisation-wide metrics across all modules</p>
            </div>

            {/* ── Overview KPIs ── */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <KPI label="Total Employees"    value={d.overview.totalEmployees}                        color="border-blue-200   bg-blue-50"   />
                <KPI label="Departments"        value={d.overview.totalDepts}                            color="border-indigo-200 bg-indigo-50" />
                <KPI label="Attendance Rate"    value={`${d.overview.orgAttendanceRate}%`}               color="border-teal-200   bg-teal-50"   />
                <KPI label="Total Payroll"      value={`${d.overview.totalPayroll?.toLocaleString()}`}   color="border-green-200  bg-green-50"  sub="sum of all net pay" />
                <KPI label="Avg Salary"         value={`${d.overview.avgSalary?.toLocaleString()}`}      color="border-amber-200  bg-amber-50"  sub="per employee" />
            </div>

            {/* ── Row 1: Headcount ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* New hires per month */}
                <Section title="New Hires — Last 6 Months">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.hiresPerMonth} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="hires" name="New Hires" fill={BLUE} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Headcount by department */}
                <Section title="Headcount by Department">
                    {d.headcountByDept.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No department data yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={d.headcountByDept} layout="vertical" barSize={18}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="department" tick={{ fontSize: 11 }} width={110} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="count" name="Employees" fill={INDIGO} radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Section>
            </div>

            {/* ── Row 2: Leaves & Payroll ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Leaves per month stacked */}
                <Section title="Leave Applications — Last 6 Months">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.leavesPerMonth} barSize={22}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="approved" name="Approved" stackId="a" fill={GREEN}  radius={[0, 0, 0, 0]} />
                            <Bar dataKey="pending"  name="Pending"  stackId="a" fill={AMBER}  />
                            <Bar dataKey="rejected" name="Rejected" stackId="a" fill={RED}    radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Leave status donut */}
                <Section title="Leave Status Breakdown">
                    {leaveDonut.length === 0
                        ? <p className="text-sm text-gray-400 text-center py-8">No leave data yet.</p>
                        : <DonutChart data={leaveDonut} colors={[GREEN, AMBER, RED]} />
                    }
                </Section>
            </div>

            {/* ── Row 3: Payroll trend ── */}
            <Section title="Payroll Trend — Last 6 Months">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={d.payrollPerMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString()} />
                        <Tooltip content={<ChartTooltip />} formatter={(v) => v.toLocaleString()} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                        <Line type="monotone" dataKey="total"      name="Net Pay"    stroke={BLUE}   strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="bonuses"    name="Bonuses"    stroke={GREEN}  strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                        <Line type="monotone" dataKey="deductions" name="Deductions" stroke={RED}    strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                    </LineChart>
                </ResponsiveContainer>
            </Section>

            {/* ── Row 4: Salary, Docs, Requests ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <Section title="Salary Payment Status">
                    {salaryDonut.length === 0
                        ? <p className="text-sm text-gray-400 text-center py-8">No salary data.</p>
                        : <DonutChart data={salaryDonut} colors={[GREEN, AMBER, RED]} />
                    }
                </Section>

                <Section title="Document Status">
                    {docDonut.length === 0
                        ? <p className="text-sm text-gray-400 text-center py-8">No documents yet.</p>
                        : <DonutChart data={docDonut} colors={[GREEN, AMBER, RED]} />
                    }
                </Section>

                <Section title="Request Outcomes">
                    {reqDonut.length === 0
                        ? <p className="text-sm text-gray-400 text-center py-8">No requests yet.</p>
                        : <DonutChart data={reqDonut} colors={[GREEN, AMBER, RED]} />
                    }
                </Section>
            </div>

            {/* ── Row 5: Recruitment & Exit Clearance ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Applicants by status */}
                <Section title={`Recruitment Pipeline (${d.recruitmentStats.openRoles} open roles)`}>
                    {appByStatus.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No applicants yet.</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={appByStatus} barSize={30}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="value" name="Applicants" fill={INDIGO} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Section>

                {/* Exit clearance */}
                <Section title="Exit Clearance Status">
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <KPI label="Total"       value={d.exitStats.total}      color="border-gray-200   bg-gray-50"   />
                        <KPI label="In Progress" value={d.exitStats.inProgress} color="border-blue-200   bg-blue-50"   />
                        <KPI label="Cleared"     value={d.exitStats.cleared}    color="border-green-200  bg-green-50"  />
                        <KPI label="Pending"     value={d.exitStats.pending}    color="border-amber-200  bg-amber-50"  />
                    </div>
                    {exitDonut.length > 0 && <DonutChart data={exitDonut} colors={[AMBER, BLUE, GREEN, RED]} />}
                </Section>
            </div>

            {/* ── Row 6: Notices & Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Notices per month */}
                <Section title="Notices Issued — Last 6 Months">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={d.noticesPerMonth} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="count" name="Notices" fill={AMBER} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Top activity actions */}
                <Section title="Top System Actions — Last 30 Days">
                    {d.topActions.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No activity in the last 30 days.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {d.topActions.map((a, i) => {
                                const max = d.topActions[0]?.count || 1
                                const pct = Math.round((a.count / max) * 100)
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-36 truncate capitalize">{a.action.toLowerCase()}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                                            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600 w-8 text-right">{a.count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Section>
            </div>

        </div>
    )
}