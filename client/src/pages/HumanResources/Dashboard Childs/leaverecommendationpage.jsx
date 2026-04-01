import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetLeaveRecommendation, HandleGetOrgLeaveSummary } from '../../../redux/Thunks/LeaveRecommendationThunk'
import { Loading } from '../../../components/common/loading'

// ─── Score ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score, color }) => {
    const colorMap = {
        green:  { stroke: '#16a34a', bg: '#dcfce7', text: '#15803d' },
        blue:   { stroke: '#2563eb', bg: '#dbeafe', text: '#1d4ed8' },
        yellow: { stroke: '#d97706', bg: '#fef3c7', text: '#b45309' },
        red:    { stroke: '#dc2626', bg: '#fee2e2', text: '#b91c1c' },
    }
    const c   = colorMap[color] || colorMap.blue
    const r   = 44
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={r} fill={c.bg} stroke="#e5e7eb" strokeWidth="8" />
                <circle
                    cx="55" cy="55" r={r}
                    fill="none"
                    stroke={c.stroke}
                    strokeWidth="8"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                />
                <text x="55" y="51" textAnchor="middle" fontSize="22" fontWeight="700" fill={c.text}>{score}</text>
                <text x="55" y="67" textAnchor="middle" fontSize="11" fill={c.text}>/ 100</text>
            </svg>
        </div>
    )
}

// ─── Pill badge ───────────────────────────────────────────────────────────────
const Pill = ({ label, type }) => {
    const styles = {
        green:  'bg-green-100 text-green-800 border-green-300',
        blue:   'bg-blue-100 text-blue-800 border-blue-300',
        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        red:    'bg-red-100 text-red-800 border-red-300',
    }
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[type] || styles.blue}`}>
            {label}
        </span>
    )
}

// ─── Leave balance bar ────────────────────────────────────────────────────────
const BalanceBar = ({ used, total }) => {
    const pct = Math.min(100, Math.round((used / total) * 100))
    const barColor = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'
    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-xs text-gray-500">
                <span>{used} days used</span>
                <span>{total - used} remaining</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className={`${barColor} h-2.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs text-gray-400 text-right">{total} day annual quota</div>
        </div>
    )
}

// ─── Suggested window card ────────────────────────────────────────────────────
const WindowCard = ({ win }) => (
    <div className="border border-gray-200 rounded-xl p-3 flex flex-col gap-1 hover:border-indigo-200 hover:bg-indigo-50 transition-all cursor-default">
        <span className="text-sm font-semibold text-gray-800">{win.label}</span>
        <span className="text-xs text-gray-500">{win.workingDays} working day{win.workingDays !== 1 ? 's' : ''}</span>
        <div className="flex gap-1 flex-wrap mt-1">
            {win.hasHoliday   && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Includes holiday</span>}
            {win.isLongWeekend && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Long weekend</span>}
        </div>
    </div>
)

// ─── Org summary table row ────────────────────────────────────────────────────
const OrgRow = ({ emp, onSelect, selected }) => {
    const pct = Math.round((emp.daysUsed / emp.quota) * 100)
    return (
        <div
            onClick={() => onSelect(emp.employeeID)}
            className={`grid grid-cols-5 px-4 py-3 text-sm items-center rounded-lg cursor-pointer transition-all border ${
                selected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
        >
            <span className="font-medium">{emp.name}</span>
            <span className="text-gray-500">{emp.department}</span>
            <span>{emp.daysUsed} / {emp.quota}</span>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className={`text-xs font-medium ${emp.pending > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                {emp.pending > 0 ? `${emp.pending} pending` : 'No pending'}
            </span>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const LeaveRecommendationPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.LeaveRecommendationReducer)

    const [selectedEmpID, setSelectedEmpID] = useState(null)
    const [startdate,     setStartdate]     = useState('')
    const [enddate,       setEnddate]       = useState('')
    const [activeTab,     setActiveTab]     = useState('org')  // 'org' | 'detail'

    useEffect(() => {
        dispatch(HandleGetOrgLeaveSummary())
    }, [])

    const handleSelectEmployee = (empID) => {
        setSelectedEmpID(empID)
        setActiveTab('detail')
        dispatch(HandleGetLeaveRecommendation({ employeeID: empID, startdate, enddate, role: 'HR' }))
    }

    const handleRecheck = () => {
        if (!selectedEmpID) return
        dispatch(HandleGetLeaveRecommendation({ employeeID: selectedEmpID, startdate, enddate, role: 'HR' }))
    }

    const rec  = state.recommendation
    const reco = rec?.recommendation

    return (
        <PageShell>

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <PageHeader eyebrow="Operations" title="Leave Recommendation Engine" subtitle="Rule-based scoring using history, attendance, and workload" />
                    <p className="text-sm text-gray-500 mt-1">Rule-based scoring using leave history, attendance, team capacity and workload patterns</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('org')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${activeTab === 'org' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}`}>
                        Org Overview
                    </button>
                    <button onClick={() => setActiveTab('detail')} disabled={!selectedEmpID}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-40 ${activeTab === 'detail' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-600 hover:border-indigo-300'}`}>
                        Employee Detail
                    </button>
                </div>
            </div>

            {/* ── Org overview tab ── */}
            {activeTab === 'org' && (
                <div className="flex flex-col gap-3 overflow-auto flex-1">
                    <p className="text-sm text-gray-500">Click any employee to view their leave recommendation</p>
                    <div className="grid grid-cols-5 bg-gray-100 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600">
                        <span>Employee</span>
                        <span>Department</span>
                        <span>Days Used</span>
                        <span>Balance</span>
                        <span>Pending</span>
                    </div>
                    {state.isLoading && !state.orgSummary.length
                        ? <Loading />
                        : state.orgSummary.map(emp => (
                            <OrgRow
                                key={emp.employeeID}
                                emp={emp}
                                selected={selectedEmpID === emp.employeeID}
                                onSelect={handleSelectEmployee}
                            />
                        ))
                    }
                    {!state.isLoading && state.orgSummary.length === 0 && (
                        <div className="text-center text-gray-400 py-16">No employee data found.</div>
                    )}
                </div>
            )}

            {/* ── Employee detail tab ── */}
            {activeTab === 'detail' && (
                <div className="flex flex-col gap-5 overflow-auto flex-1">

                    {/* Date picker for checking a specific requested period */}
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Check specific leave period (optional)</label>
                            <div className="flex gap-2 items-center">
                                <input type="date" value={startdate} onChange={e => setStartdate(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                                <span className="text-gray-400 text-sm">to</span>
                                <input type="date" value={enddate} onChange={e => setEnddate(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
                                <button onClick={handleRecheck}
                                    className="px-4 py-2 text-white rounded-lg text-sm hover:opacity-90" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">
                                    Analyse
                                </button>
                            </div>
                        </div>
                        <button onClick={() => { setStartdate(''); setEnddate(''); handleRecheck() }}
                            className="text-sm text-gray-400 hover:text-gray-600 underline pb-2">
                            Clear dates
                        </button>
                    </div>

                    {state.isLoading && <Loading />}

                    {!state.isLoading && rec && (
                        <>
                            {/* Employee summary strip */}
                            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm shrink-0">
                                    {rec.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{rec.employee.name}</p>
                                    <p className="text-xs text-gray-500">{rec.employee.department}</p>
                                </div>
                            </div>

                            {/* Score + recommendation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
                                    <p className="text-sm font-semibold text-gray-600">Recommendation Score</p>
                                    <div className="flex items-center gap-6">
                                        <ScoreRing score={reco.score} color={reco.color} />
                                        <div className="flex flex-col gap-2">
                                            <Pill label={reco.recommendation} type={reco.color} />
                                            {reco.requestDays && (
                                                <p className="text-xs text-gray-500">For {reco.requestDays} working day(s) requested</p>
                                            )}
                                            <p className="text-xs text-gray-400 italic">{rec.insight}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                                    <p className="text-sm font-semibold text-gray-600">Leave Balance</p>
                                    <BalanceBar used={reco.daysUsed} total={reco.daysUsed + reco.daysLeft} />
                                </div>
                            </div>

                            {/* Reasons + Warnings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reco.reasons.length > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
                                        <p className="text-sm font-semibold text-green-800">Positive factors</p>
                                        {reco.reasons.map((r, i) => (
                                            <div key={i} className="flex gap-2 items-start text-sm text-green-700">
                                                <span className="mt-0.5 shrink-0">✓</span>
                                                <span>{r}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {reco.warnings.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col gap-2">
                                        <p className="text-sm font-semibold text-yellow-800">Caution flags</p>
                                        {reco.warnings.map((w, i) => (
                                            <div key={i} className="flex gap-2 items-start text-sm text-yellow-700">
                                                <span className="mt-0.5 shrink-0">⚠</span>
                                                <span>{w}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Suggested windows */}
                            {rec.suggestedWindows.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                                    <p className="text-sm font-semibold text-gray-600">Suggested Leave Windows</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {rec.suggestedWindows.map((win, i) => <WindowCard key={i} win={win} />)}
                                    </div>
                                </div>
                            )}

                            {/* Leave history */}
                            {rec.history.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                                    <p className="text-sm font-semibold text-gray-600">Leave History</p>
                                    <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 px-2">
                                            <span>Title</span><span>From</span><span>To</span><span>Status</span>
                                        </div>
                                        {rec.history.slice(0, 8).map((h, i) => (
                                            <div key={i} className="grid grid-cols-4 text-sm px-2 py-1.5 rounded-lg hover:bg-gray-50">
                                                <span className="text-gray-700 truncate">{h.title}</span>
                                                <span className="text-gray-500">{new Date(h.startdate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span>
                                                <span className="text-gray-500">{new Date(h.enddate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span>
                                                <span className={`text-xs font-medium ${
                                                    h.status === 'Approved'  ? 'text-green-600' :
                                                    h.status === 'Rejected'  ? 'text-red-600'   : 'text-yellow-600'
                                                }`}>{h.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {!state.isLoading && !rec && (
                        <div className="text-center text-gray-400 py-16">
                            Select an employee from the Org Overview tab to view their recommendation.
                        </div>
                    )}
                </div>
            )}
        </PageShell>
    )
}