import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetLeaveRecommendation, HandleGetOrgLeaveSummary } from '../../../redux/Thunks/LeaveRecommendationThunk'
import { Loading } from '../../../components/common/loading'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name) => 
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??'

// ─── Avatar Component ─────────────────────────────────────────────────────────
const Avatar = ({ name, size = 32, fontSize = 12 }) => (
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

// ─── Refined Score Ring ───────────────────────────────────────────────────────
const ScoreRing = ({ score, color }) => {
    const colorMap = {
        green:  { stroke: '#16a34a', bg: 'rgba(22,163,74,0.08)',  text: '#15803d' },
        blue:   { stroke: '#2563eb', bg: 'rgba(37,99,235,0.08)',  text: '#1d4ed8' },
        yellow: { stroke: '#d97706', bg: 'rgba(217,119,6,0.09)',  text: '#b45309' },
        red:    { stroke: '#dc2626', bg: 'rgba(220,38,38,0.07)',  text: '#b91c1c' },
    }
    const c = colorMap[color] || colorMap.blue
    const r = 44
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ

    return (
        <div className="flex flex-col items-center gap-2">
            <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={r} fill={c.bg} stroke="rgba(0,0,0,0.05)" strokeWidth="8" />
                <circle
                    cx="55" cy="55" r={r}
                    fill="none"
                    stroke={c.stroke}
                    strokeWidth="8"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
                <text x="55" y="52" textAnchor="middle" fontSize="22" fontWeight="700" fill={c.text} style={{ fontFamily: "'DM Serif Display', serif" }}>{score}</text>
                <text x="55" y="68" textAnchor="middle" fontSize="10" fontWeight="600" fill={c.text} style={{ opacity: 0.6 }}>/ 100</text>
            </svg>
        </div>
    )
}

// ─── Status Pill (Matching Interview Aesthetic) ──────────────────────────────
const StatusPill = ({ label, type }) => {
    const colorMap = {
        green:  { bg: 'rgba(22,163,74,0.08)',  color: '#15803d', border: 'rgba(22,163,74,0.22)'  },
        blue:   { bg: 'rgba(37,99,235,0.08)',  color: '#1d4ed8', border: 'rgba(37,99,235,0.22)'  },
        yellow: { bg: 'rgba(234,179,8,0.09)',  color: '#854d0e', border: 'rgba(234,179,8,0.3)'   },
        red:    { bg: 'rgba(220,38,38,0.07)',  color: '#dc2626', border: 'rgba(220,38,38,0.2)'   },
    }
    const s = colorMap[type] || { bg: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.45)', border: 'rgba(0,0,0,0.1)' }
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color }} />
            {label}
        </span>
    )
}

// ─── Org summary table row ────────────────────────────────────────────────────
const OrgRow = ({ emp, onSelect, selected }) => {
    const pct = Math.round((emp.daysUsed / emp.quota) * 100)
    return (
        <div
            onClick={() => onSelect(emp.employeeID)}
            className="pg-table-row"
            style={{ 
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr 100px',
                background: selected ? 'rgba(99, 102, 241, 0.04)' : '',
                borderColor: selected ? '#6366f1' : ''
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={emp.name} />
                <span className="pg-td-name">{emp.name}</span>
            </div>
            <span className="pg-td-sub" style={{ fontSize: 13 }}>{emp.department}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#0f172a' }}>{emp.daysUsed} / {emp.quota}</span>
            <div className="w-full bg-gray-100 rounded-full h-1.5" style={{ maxWidth: 100 }}>
                <div
                    className={`h-1.5 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                    style={{ width: `${pct}%`, transition: 'width 0.3s ease' }}
                />
            </div>
            <StatusPill 
                label={emp.pending > 0 ? `${emp.pending} Pending` : 'Clean'} 
                type={emp.pending > 0 ? 'yellow' : 'blue'} 
            />
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
    const [activeTab,     setActiveTab]     = useState('org')

    useEffect(() => { dispatch(HandleGetOrgLeaveSummary()) }, [])

    const handleSelectEmployee = (empID) => {
        setSelectedEmpID(empID)
        setActiveTab('detail')
        dispatch(HandleGetLeaveRecommendation({ employeeID: empID, startdate, enddate, role: 'HR' }))
    }

    const rec  = state.recommendation
    const reco = rec?.recommendation

    return (
        <PageShell>
            <PageHeader 
                eyebrow="Operations" 
                title="Leave Intelligence" 
                subtitle="Rule-based scoring using history, attendance, and team capacity" 
            />

            {/* ── Tabs Navigation ── */}
            <div className="pg-filters" style={{ marginBottom: 20 }}>
                <button 
                    className={`pg-pill ${activeTab === 'org' ? 'active' : ''}`}
                    onClick={() => setActiveTab('org')}
                >
                    Organization Overview
                </button>
                <button 
                    className={`pg-pill ${activeTab === 'detail' ? 'active' : ''}`}
                    disabled={!selectedEmpID}
                    onClick={() => setActiveTab('detail')}
                >
                    Employee Insights
                </button>
            </div>

            {/* ── Org Overview Tab ── */}
            {activeTab === 'org' && (
                <div className="pg-table-wrap">
                    <div className="pg-table-head" style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 100px' }}>
                        <span className="pg-th">Employee</span>
                        <span className="pg-th">Department</span>
                        <span className="pg-th">Usage</span>
                        <span className="pg-th">Balance</span>
                        <span className="pg-th">Status</span>
                    </div>
                    {state.isLoading && !state.orgSummary.length ? <Loading /> : (
                        state.orgSummary.map(emp => (
                            <OrgRow key={emp.employeeID} emp={emp} selected={selectedEmpID === emp.employeeID} onSelect={handleSelectEmployee} />
                        ))
                    )}
                </div>
            )}

            {/* ── Employee Detail Tab ── */}
            {activeTab === 'detail' && (
                <div className="flex flex-col gap-6">
                    {/* Date Analysis Bar */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <label className="text-[10px] uppercase font-bold text-gray-400 mb-1">Analysis Period</label>
                                <div className="flex items-center gap-2">
                                    <input type="date" value={startdate} onChange={e => setStartdate(e.target.value)} className="pg-input" style={{ width: 140, padding: '6px 10px' }} />
                                    <span className="text-gray-300">→</span>
                                    <input type="date" value={enddate} onChange={e => setEnddate(e.target.value)} className="pg-input" style={{ width: 140, padding: '6px 10px' }} />
                                </div>
                            </div>
                            <button 
                                onClick={() => dispatch(HandleGetLeaveRecommendation({ employeeID: selectedEmpID, startdate, enddate, role: 'HR' }))}
                                className="pg-btn-primary"
                                style={{ marginTop: 15 }}
                            >
                                Re-Analyse
                            </button>
                        </div>
                    </div>

                    {!state.isLoading && rec && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Score Card */}
                            <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
                                <h3 className="font-bold text-gray-400 uppercase text-[11px] mb-6 self-start">Recommendation Score</h3>
                                <ScoreRing score={reco.score} color={reco.color} />
                                <div className="mt-4">
                                    <StatusPill label={reco.recommendation} type={reco.color} />
                                    <p className="text-xs text-gray-500 mt-3 leading-relaxed italic">"{rec.insight}"</p>
                                </div>
                            </div>

                            {/* Details Panel */}
                            <div className="lg:col-span-2 space-y-4">
                                {/* Bio Card */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                                    <Avatar name={rec.employee.name} size={48} fontSize={18} />
                                    <div>
                                        <h2 className="font-serif text-xl text-slate-900">{rec.employee.name}</h2>
                                        <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider">{rec.employee.department}</p>
                                    </div>
                                </div>

                                {/* Factors Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                                        <h4 className="text-emerald-800 font-bold text-xs uppercase mb-3">Positive Factors</h4>
                                        {reco.reasons.map((r, i) => (
                                            <div key={i} className="flex gap-2 text-sm text-emerald-700 mb-2">
                                                <span className="font-bold">✓</span> {r}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5">
                                        <h4 className="text-amber-800 font-bold text-xs uppercase mb-3">Caution Flags</h4>
                                        {reco.warnings.map((w, i) => (
                                            <div key={i} className="flex gap-2 text-sm text-amber-700 mb-2">
                                                <span className="font-bold">⚠</span> {w}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </PageShell>
    )
}