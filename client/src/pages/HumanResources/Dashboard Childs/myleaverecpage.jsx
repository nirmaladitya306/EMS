import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetLeaveRecommendation } from '../../../redux/Thunks/LeaveRecommendationThunk'
import { HandleGetEmployeeProfile } from '../../../redux/Thunks/EmployeeDashboardThunk'
import { Loading } from '../../../components/common/loading'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .lrec-panel {
    background: var(--ems-bg-secondary, rgba(0,0,0,0.012));
    border: 1px solid var(--ems-border, rgba(0,0,0,0.07));
    border-radius: 14px; padding: 16px 18px;
    display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end;
    font-family: 'DM Sans', sans-serif;
  }
  .lrec-panel-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ems-label-color, rgba(0,0,0,0.35)); margin-bottom: 6px; }
  .lrec-date-input {
    border: 1px solid var(--ems-input-border, rgba(0,0,0,0.12));
    background: var(--ems-input-bg, #fff); border-radius: 10px;
    padding: 8px 12px; font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: var(--ems-text-primary, #0f172a);
    outline: none; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lrec-date-input:focus { border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.07); }
  .lrec-sep { font-size: 13px; color: var(--ems-text-faint, rgba(0,0,0,0.35)); }
  .lrec-clear-btn {
    background: none; border: none; cursor: pointer; font-size: 12px;
    color: var(--ems-text-faint, rgba(0,0,0,0.35)); font-family: 'DM Sans', sans-serif;
    text-decoration: underline; transition: color 0.15s;
  }
  .lrec-clear-btn:hover { color: var(--ems-text-muted, rgba(0,0,0,0.55)); }

  .lrec-card {
    background: var(--ems-surface, #ffffff);
    border: 1px solid var(--ems-surface-border, rgba(0,0,0,0.07));
    border-radius: 14px; padding: 18px 20px;
    display: flex; flex-direction: column; gap: 14px;
    font-family: 'DM Sans', sans-serif;
  }
  .lrec-label { font-size: 12px; font-weight: 600; color: var(--ems-text-muted, rgba(0,0,0,0.55)); }

  .lrec-bar-wrap { display: flex; flex-direction: column; gap: 5px; width: 100%; }
  .lrec-bar-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--ems-text-faint, rgba(0,0,0,0.4)); }
  .lrec-bar-track { width: 100%; background: rgba(0,0,0,0.07); border-radius: 100px; height: 8px; }
  .lrec-bar-fill  { height: 8px; border-radius: 100px; transition: width 0.4s; }
  .lrec-bar-quota { font-size: 11px; color: var(--ems-text-faint, rgba(0,0,0,0.35)); text-align: right; margin-top: 2px; }

  .lrec-positive { background: rgba(22,163,74,0.07); border: 1px solid rgba(22,163,74,0.2); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
  .lrec-positive-title { font-size: 12px; font-weight: 700; color: #15803d; }
  .lrec-positive-item  { display: flex; gap: 8px; font-size: 13px; color: #15803d; }
  .lrec-caution { background: rgba(245,158,11,0.07); border: 1px solid rgba(245,158,11,0.2); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; }
  .lrec-caution-title { font-size: 12px; font-weight: 700; color: #b45309; }
  .lrec-caution-item  { display: flex; gap: 8px; font-size: 13px; color: #b45309; }

  .lrec-window-card {
    border: 1px solid var(--ems-border, rgba(0,0,0,0.08));
    border-radius: 12px; padding: 12px 14px;
    display: flex; flex-direction: column; gap: 6px;
    transition: border-color 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .lrec-window-card:hover { border-color: rgba(99,102,241,0.3); background: rgba(99,102,241,0.04); }
  .lrec-window-name { font-size: 13px; font-weight: 600; color: var(--ems-text-primary, #0f172a); }
  .lrec-window-days { font-size: 12px; color: var(--ems-text-faint, rgba(0,0,0,0.4)); }
  .lrec-window-btn {
    background: none; border: none; cursor: pointer; text-align: left;
    font-size: 12px; color: #6366f1; font-weight: 500;
    text-decoration: underline; font-family: 'DM Sans', sans-serif; padding: 0; margin-top: 2px;
    transition: color 0.15s;
  }
  .lrec-window-btn:hover { color: #8b5cf6; }

  .lrec-history-head { display: grid; grid-template-columns: 1fr 1fr 1fr 80px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ems-label-color, rgba(0,0,0,0.35)); padding: 0 8px 8px; }
  .lrec-history-row  { display: grid; grid-template-columns: 1fr 1fr 1fr 80px; font-size: 13px; padding: 8px; border-radius: 8px; transition: background 0.12s; }
  .lrec-history-row:hover { background: var(--ems-bg-secondary, rgba(0,0,0,0.02)); }
  .lrec-history-title { color: var(--ems-text-muted, rgba(0,0,0,0.65)); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .lrec-history-date  { font-size: 12px; color: var(--ems-text-faint, rgba(0,0,0,0.4)); }

  .lrec-error { background: rgba(220,38,38,0.06); border: 1px solid rgba(220,38,38,0.2); border-radius: 12px; padding: 14px 16px; font-size: 13px; color: #dc2626; font-family: 'DM Sans', sans-serif; }
`

const ScoreRing = ({ score, color }) => {
    const colorMap = {
        green:  { stroke: '#16a34a', bg: 'rgba(22,163,74,0.12)',  text: '#15803d' },
        blue:   { stroke: '#2563eb', bg: 'rgba(37,99,235,0.1)',   text: '#1d4ed8' },
        yellow: { stroke: '#d97706', bg: 'rgba(217,119,6,0.1)',   text: '#b45309' },
        red:    { stroke: '#dc2626', bg: 'rgba(220,38,38,0.1)',   text: '#b91c1c' },
    }
    const c    = colorMap[color] || colorMap.blue
    const r    = 44
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ
    return (
        <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r={r} fill={c.bg} stroke="rgba(0,0,0,0.08)" strokeWidth="8" />
            <circle cx="55" cy="55" r={r}
                fill="none" stroke={c.stroke} strokeWidth="8"
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
                transform="rotate(-90 55 55)"
            />
            <text x="55" y="51" textAnchor="middle" fontSize="22" fontWeight="700" fill={c.text}>{score}</text>
            <text x="55" y="67" textAnchor="middle" fontSize="11" fill={c.text}>/ 100</text>
        </svg>
    )
}

const Pill = ({ label, type }) => {
    const map = {
        green:  { bg: 'rgba(22,163,74,0.1)',   color: '#15803d', border: 'rgba(22,163,74,0.25)'  },
        blue:   { bg: 'rgba(37,99,235,0.09)',  color: '#1d4ed8', border: 'rgba(37,99,235,0.2)'   },
        yellow: { bg: 'rgba(217,119,6,0.09)',  color: '#b45309', border: 'rgba(217,119,6,0.25)'  },
        red:    { bg: 'rgba(220,38,38,0.08)',  color: '#dc2626', border: 'rgba(220,38,38,0.22)'  },
    }
    const s = map[type] || map.blue
    return (
        <span style={{
            padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600,
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
            fontFamily: "'DM Sans', sans-serif",
        }}>
            {label}
        </span>
    )
}

const BalanceBar = ({ used, total }) => {
    const pct      = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
    const fillColor = pct >= 90 ? '#dc2626' : pct >= 70 ? '#d97706' : '#16a34a'
    return (
        <div className="lrec-bar-wrap">
            <div className="lrec-bar-meta">
                <span>{used} days used</span>
                <span>{total - used} remaining</span>
            </div>
            <div className="lrec-bar-track">
                <div className="lrec-bar-fill" style={{ width: `${pct}%`, background: fillColor }} />
            </div>
            <div className="lrec-bar-quota">{total} day annual quota</div>
        </div>
    )
}

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export const MyLeaveRecommendationPage = () => {
    const dispatch = useDispatch()
    const empState = useSelector(s => s.EmployeeDashboardReducer)
    const recState = useSelector(s => s.LeaveRecommendationReducer)

    const profile    = empState.profile
    const employeeID = profile?._id

    const [startdate, setStartdate] = useState('')
    const [enddate,   setEnddate]   = useState('')

    useEffect(() => { if (!profile) dispatch(HandleGetEmployeeProfile()) }, [])
    useEffect(() => {
        if (employeeID) dispatch(HandleGetLeaveRecommendation({ employeeID, startdate: '', enddate: '', role: 'Employee' }))
    }, [employeeID])

    const handleAnalyse = () => {
        if (!employeeID) return
        dispatch(HandleGetLeaveRecommendation({ employeeID, startdate, enddate, role: 'Employee' }))
    }
    const handleWindowApply = (start, end) => {
        setStartdate(start); setEnddate(end)
        dispatch(HandleGetLeaveRecommendation({ employeeID, startdate: start, enddate: end, role: 'Employee' }))
    }
    const handleClear = () => {
        setStartdate(''); setEnddate('')
        dispatch(HandleGetLeaveRecommendation({ employeeID, startdate: '', enddate: '', role: 'Employee' }))
    }

    const rec  = recState.recommendation
    const reco = rec?.recommendation

    if ((empState.isLoading && !profile) || (!rec && recState.isLoading)) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>

                <PageHeader eyebrow="Work" title="Leave Recommendation" subtitle="Personalised guidance on when to take leave based on your history, attendance, and team capacity" />

                {/* Date picker panel */}
                <div className="lrec-panel">
                    <div>
                        <p className="lrec-panel-label">Check a specific leave period (optional)</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                            <input type="date" value={startdate} onChange={e => setStartdate(e.target.value)} className="lrec-date-input" />
                            <span className="lrec-sep">to</span>
                            <input type="date" value={enddate} onChange={e => setEnddate(e.target.value)} className="lrec-date-input" />
                            <button className="pg-btn-primary" style={{ padding: '8px 18px' }} onClick={handleAnalyse}>Analyse</button>
                            {(startdate || enddate) && <button className="lrec-clear-btn" onClick={handleClear}>Clear</button>}
                        </div>
                    </div>
                </div>

                {recState.isLoading && <Loading />}

                {!recState.isLoading && recState.error?.status && (
                    <div className="lrec-error">{recState.error.message || 'Failed to load recommendation. Please try again.'}</div>
                )}

                {!recState.isLoading && rec && (
                    <>
                        {/* Score + balance */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="lrec-card">
                                <p className="lrec-label">Your Recommendation Score</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <ScoreRing score={reco.score} color={reco.color} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <Pill label={reco.recommendation} type={reco.color} />
                                        {reco.requestDays && (
                                            <p style={{ fontSize: 12, color: 'var(--ems-text-faint)', margin: 0 }}>
                                                For {reco.requestDays} working day{reco.requestDays !== 1 ? 's' : ''} requested
                                            </p>
                                        )}
                                        {rec.insight && <p style={{ fontSize: 12, color: 'var(--ems-text-faint)', fontStyle: 'italic', margin: 0 }}>{rec.insight}</p>}
                                    </div>
                                </div>
                            </div>
                            <div className="lrec-card">
                                <p className="lrec-label">Your Leave Balance</p>
                                <BalanceBar used={reco.daysUsed} total={reco.daysUsed + reco.daysLeft} />
                            </div>
                        </div>

                        {/* Factors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reco.reasons.length > 0 && (
                                <div className="lrec-positive">
                                    <p className="lrec-positive-title">Positive factors</p>
                                    {reco.reasons.map((r, i) => (
                                        <div key={i} className="lrec-positive-item">
                                            <span style={{ flexShrink: 0 }}>✓</span><span>{r}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {reco.warnings.length > 0 && (
                                <div className="lrec-caution">
                                    <p className="lrec-caution-title">Caution flags</p>
                                    {reco.warnings.map((w, i) => (
                                        <div key={i} className="lrec-caution-item">
                                            <span style={{ flexShrink: 0 }}>⚠</span><span>{w}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Suggested windows */}
                        {rec.suggestedWindows?.length > 0 && (
                            <div className="lrec-card">
                                <p className="lrec-label">Suggested Leave Windows</p>
                                <p style={{ fontSize: 12, color: 'var(--ems-text-faint)', margin: 0 }}>
                                    These windows avoid peak periods and ensure your team has coverage. Click any to analyse it.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {rec.suggestedWindows.map((win, i) => (
                                        <div key={i} className="lrec-window-card">
                                            <span className="lrec-window-name">{win.label}</span>
                                            <span className="lrec-window-days">{win.workingDays} working day{win.workingDays !== 1 ? 's' : ''}</span>
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {win.hasHoliday    && <span style={{ fontSize: 11, background: 'rgba(139,92,246,0.1)', color: '#7c3aed', padding: '2px 8px', borderRadius: 100 }}>Includes holiday</span>}
                                                {win.isLongWeekend && <span style={{ fontSize: 11, background: 'rgba(20,184,166,0.1)', color: '#0d9488', padding: '2px 8px', borderRadius: 100 }}>Long weekend</span>}
                                            </div>
                                            <button className="lrec-window-btn" onClick={() => handleWindowApply(win.startdate, win.enddate)}>
                                                Check this period →
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Leave history */}
                        {rec.history?.length > 0 && (
                            <div className="lrec-card">
                                <p className="lrec-label">Your Leave History</p>
                                <div>
                                    <div className="lrec-history-head">
                                        <span>Title</span><span>From</span><span>To</span><span>Status</span>
                                    </div>
                                    {rec.history.slice(0, 8).map((h, i) => (
                                        <div key={i} className="lrec-history-row">
                                            <span className="lrec-history-title">{h.title}</span>
                                            <span className="lrec-history-date">{fmtDate(h.startdate)}</span>
                                            <span className="lrec-history-date">{fmtDate(h.enddate)}</span>
                                            <span style={{
                                                fontSize: 12, fontWeight: 600,
                                                color: h.status === 'Approved' ? '#16a34a' : h.status === 'Rejected' ? '#dc2626' : '#b45309',
                                            }}>{h.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

            </PageShell>
        </>
    )
}
