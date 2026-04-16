import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HandleGetMyDriftEvents } from '../../../redux/Thunks/AccessDriftThunk'
import { Loading } from '../../../components/common/loading'

const DRIFT_TYPES = {
    UNUSUAL_LOGIN_TIME:        { label: 'Unusual Login Time',        icon: '🕐' },
    HIGH_FREQUENCY_ACTIONS:    { label: 'High Frequency Actions',    icon: '⚡' },
    SENSITIVE_ENDPOINT_ACCESS: { label: 'Sensitive Endpoint Access', icon: '🔐' },
    BULK_OPERATION:            { label: 'Bulk Operation',            icon: '📦' },
    OFF_HOURS_ACTIVITY:        { label: 'Off-Hours Activity',        icon: '🌙' },
    REPEATED_FAILED_ACCESS:    { label: 'Repeated Failed Access',    icon: '🚫' },
    UNUSUAL_ACTION_PATTERN:    { label: 'Unusual Action Pattern',    icon: '⚠️' },
}

const SEVERITY_TOKENS = {
    CRITICAL: { bg: 'rgba(220,38,38,0.08)',  color: 'var(--mad-crit-text, #dc2626)', border: 'rgba(220,38,38,0.25)'  },
    HIGH:     { bg: 'rgba(234,88,12,0.08)',  color: 'var(--mad-high-text, #c2410c)', border: 'rgba(234,88,12,0.25)'  },
    MEDIUM:   { bg: 'rgba(217,119,6,0.08)',  color: 'var(--mad-med-text, #b45309)',  border: 'rgba(217,119,6,0.25)'  },
    LOW:      { bg: 'rgba(99,102,241,0.07)', color: 'var(--mad-low-text, #4f46e5)',  border: 'rgba(99,102,241,0.2)'  },
}

const STATUS_TOKENS = {
    OPEN:      { bg: 'rgba(220,38,38,0.07)',  color: 'var(--mad-crit-text, #dc2626)', border: 'rgba(220,38,38,0.2)'  },
    RESOLVED:  { bg: 'rgba(22,163,74,0.08)',  color: 'var(--mad-res-text, #15803d)', border: 'rgba(22,163,74,0.22)' },
    DISMISSED: { bg: 'var(--mad-dismiss-bg, rgba(0,0,0,0.04))', color: 'var(--mad-dismiss-text, rgba(0,0,0,0.4))', border: 'var(--mad-dismiss-border, rgba(0,0,0,0.1))' },
}

const DRIFT_TIPS = {
    UNUSUAL_LOGIN_TIME:        'Your account was accessed at an unusual time. If this was not you, please reset your password.',
    HIGH_FREQUENCY_ACTIONS:    'An unusually high number of actions were recorded from your account. Please verify you were not impersonated.',
    SENSITIVE_ENDPOINT_ACCESS: 'Your session attempted to access a restricted area. Contact HR if this was unexpected.',
    BULK_OPERATION:            'Multiple bulk operations were performed from your account in a short window.',
    OFF_HOURS_ACTIVITY:        'System activity was recorded from your account on a weekend. This may be routine — no action needed if expected.',
    REPEATED_FAILED_ACCESS:    'Multiple access-denied events were logged for your account.',
    UNUSUAL_ACTION_PATTERN:    'An unusual pattern of actions was detected from your account.',
}

const relativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ═══════════════════════════════════════════════════════
     DARK MODE OVERRIDES
  ═══════════════════════════════════════════════════════ */
  [data-theme='dark'] {
    --mad-bg-subtle: rgba(255,255,255,0.04);
    --mad-bg-hover: rgba(255,255,255,0.06);
    
    --mad-crit-bg: rgba(220,38,38,0.15);
    --mad-crit-text: #f87171;
    --mad-crit-border: rgba(220,38,38,0.3);

    --mad-res-bg: rgba(22,163,74,0.15);
    --mad-res-text: #4ade80;
    --mad-res-border: rgba(22,163,74,0.3);
    
    --mad-high-text: #fb923c;
    --mad-med-text: #fbbf24;
    --mad-low-text: #818cf8;

    --mad-dismiss-bg: rgba(255,255,255,0.08);
    --mad-dismiss-text: rgba(255,255,255,0.6);
    --mad-dismiss-border: rgba(255,255,255,0.12);
  }

  .mad-stat-card {
    border-radius: 14px; border: 1px solid; padding: 16px; text-align: center;
    display: flex; flex-direction: column; gap: 4px;
    font-family: 'DM Sans', sans-serif;
  }
  .mad-stat-value { font-family: 'DM Serif Display', serif; font-size: 1.7rem; line-height: 1; letter-spacing: -0.02em; }
  .mad-stat-label { font-size: 11px; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ems-text-faint, rgba(0,0,0,0.38)); }

  .mad-info-banner {
    background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.18);
    border-radius: 14px; padding: 14px 16px;
    font-size: 13px; color: var(--ems-text-muted, rgba(0,0,0,0.6));
    display: flex; gap: 10px; align-items: flex-start; line-height: 1.6;
    font-family: 'DM Sans', sans-serif;
  }

  .mad-card {
    border: 1px solid var(--ems-border, rgba(0,0,0,0.07));
    border-radius: 14px; overflow: hidden;
    background: var(--ems-card-bg, #ffffff);
    transition: border-color 0.2s, background 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .mad-card-header {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 14px 16px; cursor: pointer;
    transition: background 0.12s;
  }
  .mad-card-header:hover { background: var(--mad-bg-hover, rgba(0,0,0,0.02)); }
  .mad-card-body { font-size: 13px; color: var(--ems-text-muted, rgba(0,0,0,0.65)); }
  .mad-card-desc { font-size: 12px; color: var(--ems-text-faint, rgba(0,0,0,0.45)); margin-top: 2px; }
  .mad-card-time { font-size: 11px; color: var(--ems-text-faint, rgba(0,0,0,0.35)); white-space: nowrap; }
  .mad-card-expanded {
    border-top: 1px solid var(--ems-border, rgba(0,0,0,0.06));
    padding: 14px 16px; background: var(--mad-bg-subtle, rgba(0,0,0,0.012));
    display: flex; flex-direction: column; gap: 12px;
  }
  .mad-evidence-item {
    font-size: 12px; background: var(--ems-bg-secondary, #fff);
    border: 1px solid var(--ems-border, rgba(0,0,0,0.07));
    border-radius: 10px; padding: 10px 12px;
    display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
    color: var(--ems-text-muted, rgba(0,0,0,0.6));
  }
  .mad-evidence-action { font-size: 12px; font-weight: 600; color: var(--ems-text-primary, #0f172a); }
  .mad-evidence-time   { font-size: 11px; color: var(--ems-text-faint, rgba(0,0,0,0.35)); flex-shrink: 0; }

  .mad-footer { font-size: 12px; color: var(--ems-text-faint, rgba(0,0,0,0.35)); border-top: 1px solid var(--ems-border, rgba(0,0,0,0.06)); padding-top: 12px; font-family: 'DM Sans', sans-serif; }
`

const SeverityBadge = ({ severity }) => {
    const t = SEVERITY_TOKENS[severity] || SEVERITY_TOKENS.LOW
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700,
            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
            whiteSpace: 'nowrap', letterSpacing: '0.03em',
            fontFamily: "'DM Sans', sans-serif",
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            {severity}
        </span>
    )
}

const StatusBadge = ({ status }) => {
    const t = STATUS_TOKENS[status] || STATUS_TOKENS.DISMISSED
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
            whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif",
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

export const MyAccessDriftPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.AccessDriftReducer)
    const drifts   = state?.myDrifts || []

    const [filterStatus,  setFilterStatus]  = useState('ALL')
    const [expandedDrift, setExpandedDrift] = useState(null)

    useEffect(() => { dispatch(HandleGetMyDriftEvents()) }, [])

    const filtered      = drifts.filter(d => filterStatus === 'ALL' || d.status === filterStatus)
    const openCount     = drifts.filter(d => d.status === 'OPEN').length
    const resolvedCount = drifts.filter(d => d.status === 'RESOLVED').length
    const criticalCount = drifts.filter(d => d.status === 'OPEN' && d.severity === 'CRITICAL').length

    if (state.isLoading && !drifts.length) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>

                {/* Header */}
                <PageHeader eyebrow="Security" title="My Security Flags" subtitle="Access drift alerts flagged on your account by the security system">
                    {criticalCount > 0 && (
                        <div style={{
                            background: 'var(--mad-crit-bg, rgba(220,38,38,0.07))', border: '1px solid var(--mad-crit-border, rgba(220,38,38,0.2))',
                            borderRadius: 12, padding: '10px 14px',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span style={{ fontSize: 18 }}>🚨</span>
                            <div>
                                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--mad-crit-text, #dc2626)', margin: 0 }}>
                                    {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}
                                </p>
                                <p style={{ fontSize: 11, color: 'var(--mad-crit-text, rgba(220,38,38,0.7))', opacity: 0.8, margin: 0 }}>
                                    Please review with your HR team
                                </p>
                            </div>
                        </div>
                    )}
                </PageHeader>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="mad-stat-card" style={{ borderColor: 'var(--ems-border, rgba(0,0,0,0.07))', background: 'var(--ems-bg-secondary, rgba(0,0,0,0.012))' }}>
                        <span className="mad-stat-value" style={{ color: 'var(--ems-text-primary, #0f172a)' }}>{drifts.length}</span>
                        <span className="mad-stat-label">Total Flags</span>
                    </div>
                    <div className="mad-stat-card" style={{ borderColor: 'var(--mad-crit-border, rgba(220,38,38,0.2))', background: 'var(--mad-crit-bg, rgba(220,38,38,0.05))' }}>
                        <span className="mad-stat-value" style={{ color: 'var(--mad-crit-text, #dc2626)' }}>{openCount}</span>
                        <span className="mad-stat-label">Open</span>
                    </div>
                    <div className="mad-stat-card" style={{ borderColor: 'var(--mad-res-border, rgba(22,163,74,0.2))', background: 'var(--mad-res-bg, rgba(22,163,74,0.05))' }}>
                        <span className="mad-stat-value" style={{ color: 'var(--mad-res-text, #16a34a)' }}>{resolvedCount}</span>
                        <span className="mad-stat-label">Resolved by HR</span>
                    </div>
                </div>

                {/* Info banner */}
                <div className="mad-info-banner">
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                    <p style={{ margin: 0 }}>
                        These flags are automatically generated when our security system detects unusual patterns in your account activity.
                        Most flags are informational — your HR team reviews all open alerts. If you see a critical flag you didn't cause, please contact HR immediately.
                    </p>
                </div>

                {/* Filter pills */}
                <div className="pg-filters">
                    {['ALL', 'OPEN', 'RESOLVED', 'DISMISSED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`pg-pill${filterStatus === s ? ' active' : ''}`}
                        >
                            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>

                {/* Events list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', flex: 1 }}>
                    {filtered.length === 0 ? (
                        <div className="pg-empty">
                            <span className="pg-empty-icon">🛡️</span>
                            <p className="pg-empty-title">
                                {drifts.length === 0 ? 'No security flags on your account' : 'No flags match the current filter'}
                            </p>
                            <p className="pg-empty-sub">Your account activity looks clean.</p>
                        </div>
                    ) : filtered.map(drift => {
                        const sev        = SEVERITY_TOKENS[drift.severity] || SEVERITY_TOKENS.LOW
                        const isExpanded = expandedDrift === drift._id
                        const isOpen     = drift.status === 'OPEN'
                        const meta       = DRIFT_TYPES[drift.driftType] || { label: drift.driftType, icon: '⚠️' }

                        return (
                            <div key={drift._id} className="mad-card" style={{ borderColor: isOpen ? sev.border : undefined }}>
                                <div className="mad-card-header" onClick={() => setExpandedDrift(isExpanded ? null : drift._id)}>
                                    <span style={{ fontSize: 22, marginTop: 2, flexShrink: 0 }}>{meta.icon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                            <span className="pg-td-name">{meta.label}</span>
                                            <SeverityBadge severity={drift.severity} />
                                            <StatusBadge status={drift.status} />
                                        </div>
                                        <p className="mad-card-desc">{drift.description}</p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p className="mad-card-time">{relativeTime(drift.createdAt)}</p>
                                        <p className="mad-card-time" style={{ marginTop: 4 }}>{isExpanded ? '▲' : '▼'}</p>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="mad-card-expanded">
                                        {/* Tip */}
                                        <div style={{
                                            borderRadius: 10, padding: '10px 14px', fontSize: 13,
                                            background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`,
                                            lineHeight: 1.6,
                                        }}>
                                            💡 <strong>What this means: </strong>{DRIFT_TIPS[drift.driftType]}
                                        </div>

                                        {/* Evidence */}
                                        {drift.evidence?.length > 0 && (
                                            <div>
                                                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ems-label-color, rgba(0,0,0,0.3))', marginBottom: 8 }}>
                                                    Evidence ({drift.evidence.length} entries)
                                                </p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    {drift.evidence.map((ev, i) => (
                                                        <div key={i} className="mad-evidence-item">
                                                            <div>
                                                                <span className="mad-evidence-action">{ev.action?.replace(/_/g, ' ')}</span>
                                                                {ev.endpoint && <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#6366f1', marginLeft: 8 }}>{ev.endpoint}</span>}
                                                            </div>
                                                            <span className="mad-evidence-time">{relativeTime(ev.timestamp)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Resolution */}
                                        {drift.status !== 'OPEN' && (
                                            <div style={{
                                                background: 'var(--mad-res-bg, rgba(22,163,74,0.06))', border: '1px solid var(--mad-res-border, rgba(22,163,74,0.18))',
                                                borderRadius: 10, padding: '10px 14px', fontSize: 13,
                                            }}>
                                                <span style={{ fontWeight: 600, color: 'var(--mad-res-text, #15803d)' }}>
                                                    {drift.status === 'RESOLVED' ? '✅ Resolved' : '🗑️ Dismissed'}
                                                </span>
                                                {drift.resolvedByName && <span style={{ color: 'var(--ems-text-muted, rgba(0,0,0,0.5))' }}> by {drift.resolvedByName}</span>}
                                                {drift.resolutionNote && <p style={{ marginTop: 4, fontStyle: 'italic', color: 'var(--ems-text-faint, rgba(0,0,0,0.38))' }}>"{drift.resolutionNote}"</p>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <p className="mad-footer">Showing last 50 security flags. Older records are archived automatically.</p>

            </PageShell>
        </>
    )
}