import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetLeaveRecommendation } from '../../../redux/Thunks/LeaveRecommendationThunk'
import { HandleGetEmployeeProfile } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

// ─── Score ring ───────────────────────────────────────────────────────────────
const ScoreRing = ({ score, color }) => {
    const colorMap = {
        green:  { stroke: '#16a34a', bg: '#dcfce7', text: '#15803d' },
        blue:   { stroke: '#2563eb', bg: '#dbeafe', text: '#1d4ed8' },
        yellow: { stroke: '#d97706', bg: '#fef3c7', text: '#b45309' },
        red:    { stroke: '#dc2626', bg: '#fee2e2', text: '#b91c1c' },
    }
    const c    = colorMap[color] || colorMap.blue
    const r    = 44
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={r} fill={c.bg} stroke="#e5e7eb" strokeWidth="8" />
                <circle cx="55" cy="55" r={r}
                    fill="none" stroke={c.stroke} strokeWidth="8"
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

// ─── Recommendation pill ──────────────────────────────────────────────────────
const Pill = ({ label, type }) => {
    const styles = {
        green:  'bg-green-100  text-green-800  border-green-300',
        blue:   'bg-blue-100   text-blue-800   border-blue-300',
        yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        red:    'bg-red-100    text-red-800    border-red-300',
    }
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${styles[type] || styles.blue}`}>
            {label}
        </span>
    )
}

// ─── Leave balance bar ────────────────────────────────────────────────────────
const BalanceBar = ({ used, total }) => {
    const pct      = Math.min(100, Math.round((used / total) * 100))
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
const WindowCard = ({ win, onApply }) => (
    <div className="border border-gray-200 rounded-xl p-3 flex flex-col gap-2 hover:border-purple-300 hover:bg-purple-50 transition-all">
        <span className="text-sm font-semibold text-gray-800">{win.label}</span>
        <span className="text-xs text-gray-500">{win.workingDays} working day{win.workingDays !== 1 ? 's' : ''}</span>
        <div className="flex gap-1 flex-wrap">
            {win.hasHoliday    && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Includes holiday</span>}
            {win.isLongWeekend && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Long weekend</span>}
        </div>
        <button
            onClick={() => onApply(win.startdate, win.enddate)}
            className="mt-1 text-xs text-purple-600 hover:text-purple-800 font-medium underline text-left">
            Check this period →
        </button>
    </div>
)

// ─── Main page ────────────────────────────────────────────────────────────────
export const MyLeaveRecommendationPage = () => {
    const dispatch = useDispatch()
    const empState = useSelector(s => s.EmployeeDashboardReducer)
    const recState = useSelector(s => s.LeaveRecommendationReducer)

    const profile    = empState.profile
    const employeeID = profile?._id

    const [startdate, setStartdate] = useState('')
    const [enddate,   setEnddate]   = useState('')

    // Load profile if needed, then immediately fetch recommendation
    useEffect(() => {
        if (!profile) dispatch(HandleGetEmployeeProfile())
    }, [])

    useEffect(() => {
        if (employeeID) {
            dispatch(HandleGetLeaveRecommendation({ employeeID, startdate: '', enddate: '', role: 'Employee' }))
        }
    }, [employeeID])

    const handleAnalyse = () => {
        if (!employeeID) return
        dispatch(HandleGetLeaveRecommendation({ employeeID, startdate, enddate, role: 'Employee' }))
    }

    const handleWindowApply = (start, end) => {
        setStartdate(start)
        setEnddate(end)
        dispatch(HandleGetLeaveRecommendation({ employeeID, startdate: start, enddate: end, role: 'Employee' }))
    }

    const handleClear = () => {
        setStartdate('')
        setEnddate('')
        dispatch(HandleGetLeaveRecommendation({ employeeID, startdate: '', enddate: '', role: 'Employee' }))
    }

    const rec  = recState.recommendation
    const reco = rec?.recommendation

    if ((empState.isLoading && !profile) || (!rec && recState.isLoading)) return <Loading />

    return (
        <div className="my-leave-recommendation-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Leave Recommendation</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Personalised guidance on when to take leave based on your history, attendance, and team capacity
                </p>
            </div>

            {/* Date picker — check a specific period */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Check a specific leave period (optional)</label>
                    <div className="flex flex-wrap gap-2 items-center">
                        <input type="date" value={startdate} onChange={e => setStartdate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                        <span className="text-gray-400 text-sm">to</span>
                        <input type="date" value={enddate} onChange={e => setEnddate(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
                        <button onClick={handleAnalyse}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium">
                            Analyse
                        </button>
                        {(startdate || enddate) && (
                            <button onClick={handleClear}
                                className="text-sm text-gray-400 hover:text-gray-600 underline">
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {recState.isLoading && <Loading />}

            {!recState.isLoading && recState.error.status && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    {recState.error.message || 'Failed to load recommendation. Please try again.'}
                </div>
            )}

            {!recState.isLoading && rec && (
                <>
                    {/* Score + recommendation label */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
                            <p className="text-sm font-semibold text-gray-600">Your Recommendation Score</p>
                            <div className="flex items-center gap-6">
                                <ScoreRing score={reco.score} color={reco.color} />
                                <div className="flex flex-col gap-2">
                                    <Pill label={reco.recommendation} type={reco.color} />
                                    {reco.requestDays && (
                                        <p className="text-xs text-gray-500">
                                            For {reco.requestDays} working day{reco.requestDays !== 1 ? 's' : ''} requested
                                        </p>
                                    )}
                                    {rec.insight && (
                                        <p className="text-xs text-gray-400 italic">{rec.insight}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                            <p className="text-sm font-semibold text-gray-600">Your Leave Balance</p>
                            <BalanceBar
                                used={reco.daysUsed}
                                total={reco.daysUsed + reco.daysLeft}
                            />
                        </div>
                    </div>

                    {/* Positive factors + Caution flags */}
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

                    {/* Suggested leave windows */}
                    {rec.suggestedWindows?.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                            <p className="text-sm font-semibold text-gray-600">Suggested Leave Windows</p>
                            <p className="text-xs text-gray-400">
                                These windows avoid peak periods and ensure your team has coverage. Click any to analyse it.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {rec.suggestedWindows.map((win, i) => (
                                    <WindowCard key={i} win={win} onApply={handleWindowApply} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Leave history */}
                    {rec.history?.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                            <p className="text-sm font-semibold text-gray-600">Your Leave History</p>
                            <div className="flex flex-col gap-1">
                                <div className="grid grid-cols-4 text-xs font-semibold text-gray-500 px-2 pb-1">
                                    <span>Title</span>
                                    <span>From</span>
                                    <span>To</span>
                                    <span>Status</span>
                                </div>
                                {rec.history.slice(0, 8).map((h, i) => (
                                    <div key={i} className="grid grid-cols-4 text-sm px-2 py-1.5 rounded-lg hover:bg-gray-50">
                                        <span className="text-gray-700 truncate">{h.title}</span>
                                        <span className="text-gray-500 text-xs">
                                            {new Date(h.startdate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className="text-gray-500 text-xs">
                                            {new Date(h.enddate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className={`text-xs font-medium ${
                                            h.status === 'Approved' ? 'text-green-600' :
                                            h.status === 'Rejected' ? 'text-red-600'   : 'text-yellow-600'
                                        }`}>{h.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}