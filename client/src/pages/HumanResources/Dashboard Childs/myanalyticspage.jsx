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
                <p key={i} style={{ color: p.color }}>
                    {p.name}: <strong>{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</strong>
                </p>
            ))}
        </div>
    )
}

// ─── Donut ────────────────────────────────────────────────────────────────────
const DonutChart = ({ data, colors }) => (
    <ResponsiveContainer width="100%" height={190}>
        <PieChart>
            <Pie 
                data={data} 
                cx="50%" 
                cy="50%" 
                innerRadius={50} 
                outerRadius={78}
                dataKey="value" 
                paddingAngle={3}
            >
                {data.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
                ))}
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
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                    data={data} startAngle={210} endAngle={-30} barSize={14}>
                    <RadialBar background={{ fill: '#f3f4f6' }} dataKey="value" cornerRadius={8} />
                </RadialBarChart>
            </ResponsiveContainer>
            <p className="text-3xl font-bold -mt-12" style={{ color }}>{rate}%</p>
            <p className="text-xs text-gray-400 mt-1">Attendance Rate</p>
        </div>
    )
}

export const MyAnalyticsPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.AnalyticsReducer)
    const d        = state.employeeData

    // Fixed dependency array to ensure proper cleanup and re-fetching [cite: 9]
    useEffect(() => { 
        dispatch(HandleGetEmployeeAnalytics()) 
    }, [dispatch])

    if (state.isLoading || !d) return <Loading />

    // ── Derived data ──────────────────────────────────────────────────────────
    const leaveDonut = [
        { name: 'Approved', value: d.leaveStats?.approved || 0 },
        { name: 'Pending',  value: d.leaveStats?.pending || 0 },
        { name: 'Rejected', value: d.leaveStats?.rejected || 0 },
    ].filter(x => x.value > 0)

    const reqDonut = [
        { name: 'Approved', value: d.requestStats?.approved || 0 },
        { name: 'Pending',  value: d.requestStats?.pending || 0 },
        { name: 'Denied',   value: d.requestStats?.denied || 0 },
    ].filter(x => x.value > 0)

    const docDonut = [
        { name: 'Valid',         value: d.documentStats?.valid || 0 },
        { name: 'Expiring Soon', value: d.documentStats?.expiringSoon || 0 },
        { name: 'Expired',       value: d.documentStats?.expired || 0 },
    ].filter(x => x.value > 0)

    const attBreakdown = [
        { name: 'Present',       value: d.attendanceStats?.present || 0,     fill: GREEN },
        { name: 'Absent',        value: d.attendanceStats?.absent || 0,      fill: RED   },
        { name: 'Not Specified', value: d.attendanceStats?.notSpecified || 0, fill: AMBER },
    ].filter(x => x.value > 0)

    const currency = d.latestSalary?.currency || 'INR'

    return (
        <PageShell>
            <PageHeader 
                eyebrow="Overview" 
                title="My Analytics" 
                subtitle="A personal breakdown of your activity and records" 
            />

            {/* ── Overview KPIs ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
                <KPI label="Attendance" value={`${d.overview?.attendanceRate || 0}%`} color="border-purple-200 bg-indigo-50" />
                <KPI label="Leaves"     value={d.overview?.totalLeaves} color="border-yellow-200 bg-yellow-50" />
                <KPI label="Salaries"   value={d.overview?.totalSalaries} color="border-green-200 bg-green-50" />
                <KPI label="Requests"   value={d.overview?.totalRequests} color="border-blue-200 bg-blue-50" />
                <KPI label="Notices"    value={d.overview?.totalNotices} color="border-orange-200 bg-orange-50" />
                <KPI label="Documents"  value={d.overview?.totalDocs} color="border-teal-200 bg-teal-50" />
            </div>

            {/* ── Row 1: Attendance ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
                <Section title="Attendance Rate">
                    <AttendanceGauge rate={d.attendanceStats?.rate || 0} />
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {attBreakdown.map(a => (
                            <div key={a.name} className="rounded-lg border border-gray-100 bg-gray-50 py-2">
                                <p className="text-lg font-bold" style={{ color: a.fill }}>{a.value}</p>
                                <p className="text-xs text-gray-500">{a.name}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section title="Attendance — Last 6 Months" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.attPerMonth || []} barSize={20}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f9fafb' }} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="present" name="Present" fill={GREEN} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="absent"  name="Absent"  fill={RED}   radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>
            </div>

            {/* ── Row 2: Salary ── */}
            <Section title="Salary History" className="mt-6">
                {!d.salaryTrend || d.salaryTrend.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-8">No salary records yet.</p>
                ) : (
                    <>
                        {d.latestSalary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                <KPI label="Latest Net Pay" value={`${currency} ${d.latestSalary.netpay?.toLocaleString()}`} color="border-green-200 bg-green-50" />
                                <KPI label="Basic Pay"      value={`${currency} ${d.latestSalary.basicpay?.toLocaleString()}`} color="border-blue-200 bg-blue-50" />
                                <KPI label="Bonuses"        value={`${currency} ${d.latestSalary.bonuses?.toLocaleString()}`} color="border-amber-200 bg-amber-50" />
                                <KPI label="Deductions"     value={`${currency} ${d.latestSalary.deductions?.toLocaleString()}`} color="border-red-200 bg-red-50" />
                            </div>
                        )}
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={d.salaryTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString()} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                <Line type="monotone" dataKey="netpay" name="Net Pay" stroke={PURPLE} strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="basicpay" name="Basic Pay" stroke={BLUE} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}
            </Section>

            {/* ── Row 3: Breakdown ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
                <Section title="My Leaves">
                    {leaveDonut.length > 0 ? <DonutChart data={leaveDonut} colors={[GREEN, AMBER, RED]} /> : <p className="text-center text-gray-400 text-xs py-10">No records</p>}
                </Section>
                <Section title="My Requests">
                    {reqDonut.length > 0 ? <DonutChart data={reqDonut} colors={[GREEN, AMBER, RED]} /> : <p className="text-center text-gray-400 text-xs py-10">No records</p>}
                </Section>
                <Section title="My Documents">
                    {docDonut.length > 0 ? <DonutChart data={docDonut} colors={[GREEN, AMBER, RED]} /> : <p className="text-center text-gray-400 text-xs py-10">No records</p>}
                </Section>
            </div>

            {/* ── Row 4: Activity ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                <Section title="Leave Applications History">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={d.leavesPerMonth || []} barSize={26}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar dataKey="total" name="Leaves" fill={AMBER} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Section>

                <Section title="My Activity Breakdown">
                    {!d.topActions || d.topActions.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No recent activity.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {d.topActions.map((a, i) => {
                                const max = d.topActions[0]?.count || 1
                                const pct = Math.round((a.count / max) * 100)
                                return (
                                    <div key={i} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between text-[11px] font-bold">
                                            <span className="capitalize text-gray-500">{a.action.toLowerCase().replace(/_/g, ' ')}</span>
                                            <span className="text-gray-400">{a.count}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                                        </div>
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