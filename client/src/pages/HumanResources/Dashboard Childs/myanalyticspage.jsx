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

// ─── Colours ──────────────────────────────────────────────────────────────────
const PURPLE  = '#9333ea'
const GREEN   = '#22c55e'
const RED     = '#ef4444'
const AMBER   = '#f59e0b'
const BLUE    = '#3b82f6'
const TEAL    = '#14b8a6'
const PIE_COLORS = [GREEN, AMBER, RED, TEAL, BLUE, PURPLE]

// ─── Section wrapper ──────────────────────────────────────────────────────────
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

// ─── Tooltip ──────────────────────────────────────────────────────────────────
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

// ─── Donut ────────────────────────────────────────────────────────────────────
const DonutChart = ({ data, colors }) => (
    <ResponsiveContainer width="100%" height={190}>
        <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                dataKey="value" paddingAngle={3}>
                {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => v.toLocaleString()} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
    </ResponsiveContainer>
)

// ─── Attendance gauge (radial bar) ────────────────────────────────────────────
const AttendanceGauge = ({ rate }) => {
    const color = rate >= 80 ? GREEN : rate >= 60 ? AMBER : RED
    const data  = [{ name: 'Attendance', value: rate, fill: color }]
    return (
        <div className="flex flex-col items-center gap-1">
            <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                    data={data} startAngle={210} endAngle={-30} barSize={14}>
                    <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={8} />
                </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-3xl font-bold -mt-12" style={{ color }}>{rate}%</p>
            <p className="text-xs text-gray-400 mt-1">Attendance Rate</p>
        </div>
    )
}

// ─── Main employee analytics page ────────────────────────────────────────────
export const MyAnalyticsPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.AnalyticsReducer)
    const d        = state.employeeData

    useEffect(() => { dispatch(HandleGetEmployeeAnalytics()) }, [])

    if (state.isLoading || !d) return <Loading />

    if (state.error.status) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500 text-sm">
                Failed to load analytics: {state.error.message}
            </div>
        )
    }

    // ── Derived data ──────────────────────────────────────────────────────────
    const leaveDonut = [
        { name: 'Approved', value: d.leaveStats.approved },
        { name: 'Pending',  value: d.leaveStats.pending  },
        { name: 'Rejected', value: d.leaveStats.rejected },
    ].filter(x => x.value > 0)

    const reqDonut = [
        { name: 'Approved', value: d.requestStats.approved },
        { name: 'Pending',  value: d.requestStats.pending  },
        { name: 'Denied',   value: d.requestStats.denied   },
    ].filter(x => x.value > 0)

    const docDonut = [
        { name: 'Valid',         value: d.documentStats.valid         },
        { name: 'Expiring Soon', value: d.documentStats.expiringSoon  },
        { name: 'Expired',       value: d.documentStats.expired       },
    ].filter(x => x.value > 0)

    const attBreakdown = [
        { name: 'Present',       value: d.attendanceStats.present,     fill: GREEN },
        { name: 'Absent',        value: d.attendanceStats.absent,      fill: RED   },
        { name: 'Not Specified', value: d.attendanceStats.notSpecified, fill: AMBER },
    ].filter(x => x.value > 0)

    const currency = d.latestSalary?.currency || ''

    return (
        <PageShell>

            {/* ── Header ── */}
            <div>
                <PageHeader eyebrow="Overview" title="My Analytics" subtitle="A personal breakdown of your activity and records" />
                <p className="text-sm text-gray-500 mt-1">A personal breakdown of your activity and records</p>
            </div>

            {/* ── Overview KPIs ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <KPI label="Attendance"    value={`${d.overview.attendanceRate}%`}  color="border-purple-200 bg-indigo-50" />
                <KPI label="Leaves"        value={d.overview.totalLeaves}           color="border-yellow-200 bg-yellow-50" />
                <KPI label="Salaries"      value={d.overview.totalSalaries}         color="border-green-200  bg-green-50"  />
                <KPI label="Requests"      value={d.overview.totalRequests}         color="border-blue-200   bg-blue-50"   />
                <KPI label="Notices"       value={d.overview.totalNotices}          color="border-orange-200 bg-orange-50" />
                <KPI label="Documents"     value={d.overview.totalDocs}             color="border-teal-200   bg-teal-50"   />
            </div>

            {/* ── Row 1: Attendance ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Gauge */}
                <Section title="Attendance Rate">
                    <AttendanceGauge rate={d.attendanceStats.rate} />
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {attBreakdown.map(a => (
                            <div key={a.name} className="rounded-lg border border-gray-100 bg-gray-50 py-2">
                                <p className="text-lg font-bold" style={{ color: a.fill }}>{a.value}</p>
                                <p className="text-xs text-gray-500">{a.name}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Attendance per month */}
                <Section title="Attendance — Last 6 Months" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.attPerMonth} barSize={20}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="present" name="Present" fill={GREEN} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="absent"  name="Absent"  fill={RED}   radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            {/* ── Row 2: Salary ── */}
            <Section title="Salary History">
                {d.salaryTrend.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No salary records yet.</p>
                ) : (
                    <>
                        {/* Latest salary strip */}
                        {d.latestSalary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                                <KPI label="Latest Net Pay"   value={`${currency} ${d.latestSalary.netpay?.toLocaleString()}`}   color="border-green-200  bg-green-50"  />
                                <KPI label="Basic Pay"        value={`${currency} ${d.latestSalary.basicpay?.toLocaleString()}`}  color="border-blue-200   bg-blue-50"   />
                                <KPI label="Bonuses"          value={`${currency} ${d.latestSalary.bonuses?.toLocaleString()}`}   color="border-amber-200  bg-amber-50"  />
                                <KPI label="Deductions"       value={`${currency} ${d.latestSalary.deductions?.toLocaleString()}`} color="border-red-200   bg-red-50"    />
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={d.salaryTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString()} />
                                <Tooltip content={<ChartTooltip />} formatter={(v) => v.toLocaleString()} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                <Line type="monotone" dataKey="netpay"     name="Net Pay"    stroke={PURPLE} strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="basicpay"   name="Basic Pay"  stroke={BLUE}   strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                                <Line type="monotone" dataKey="bonuses"    name="Bonuses"    stroke={GREEN}  strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                                <Line type="monotone" dataKey="deductions" name="Deductions" stroke={RED}    strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}
            </Section>

            {/* ── Row 3: Leaves, Requests, Documents ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* Leaves */}
                <Section title="My Leaves">
                    <div className="grid grid-cols-3 gap-2">
                        <KPI label="Approved" value={d.leaveStats.approved} color="border-green-200  bg-green-50"  />
                        <KPI label="Pending"  value={d.leaveStats.pending}  color="border-amber-200  bg-amber-50"  />
                        <KPI label="Rejected" value={d.leaveStats.rejected} color="border-red-200    bg-red-50"    />
                    </div>
                    {leaveDonut.length > 0 && <DonutChart data={leaveDonut} colors={[GREEN, AMBER, RED]} />}
                </Section>

                {/* Requests */}
                <Section title="My Requests">
                    <div className="grid grid-cols-3 gap-2">
                        <KPI label="Approved" value={d.requestStats.approved} color="border-green-200 bg-green-50" />
                        <KPI label="Pending"  value={d.requestStats.pending}  color="border-amber-200 bg-amber-50" />
                        <KPI label="Denied"   value={d.requestStats.denied}   color="border-red-200   bg-red-50"   />
                    </div>
                    {reqDonut.length > 0 && <DonutChart data={reqDonut} colors={[GREEN, AMBER, RED]} />}
                </Section>

                {/* Documents */}
                <Section title="My Documents">
                    <div className="grid grid-cols-3 gap-2">
                        <KPI label="Valid"    value={d.documentStats.valid}         color="border-green-200 bg-green-50" />
                        <KPI label="Expiring" value={d.documentStats.expiringSoon}  color="border-amber-200 bg-amber-50" />
                        <KPI label="Expired"  value={d.documentStats.expired}       color="border-red-200   bg-red-50"   />
                    </div>
                    {docDonut.length > 0 && <DonutChart data={docDonut} colors={[GREEN, AMBER, RED]} />}
                </Section>
            </div>

            {/* ── Row 4: Leave trend & Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Leaves per month */}
                <Section title="Leave Applications — Last 6 Months">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={d.leavesPerMonth} barSize={26}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="total" name="Leaves" fill={AMBER} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                {/* Top activity */}
                <Section title="My Activity — Last 30 Days">
                    {d.topActions.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No activity recorded in the last 30 days.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {d.topActions.map((a, i) => {
                                const max = d.topActions[0]?.count || 1
                                const pct = Math.round((a.count / max) * 100)
                                return (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500 w-36 truncate capitalize">{a.action.toLowerCase()}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                                            <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600 w-8 text-right">{a.count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Section>
            </div>

        </PageShell>
    )
}