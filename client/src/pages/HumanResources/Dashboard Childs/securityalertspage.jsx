import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetAllDriftEvents,
    HandleGetDriftSummary,
    HandleResolveDrift,
    HandleDismissDrift,
} from '../../../redux/Thunks/AccessDriftThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --sa-modal-bg: #18181b;
    --sa-drawer-bg: #09090b;
    --sa-border: #27272a;
    --sa-text-main: #fafafa;
    --sa-text-muted: #a1a1aa;
    --sa-text-faint: #71717a;
    --sa-subtle-bg: rgba(255,255,255,0.04);
    --sa-input-bg: #18181b;
    
    /* Severity Contrast Boosts */
    --sa-crit-text: #f87171;
    --sa-crit-bg: rgba(220,38,38,0.15);
    --sa-res-text: #4ade80;
    --sa-res-bg: rgba(22,163,74,0.15);
    --sa-high-text: #fb923c;
    --sa-med-text: #fbbf24;
    --sa-low-text: #818cf8;
  }

  [data-theme='dark'] .pg-modal {
    background: var(--sa-modal-bg) !important;
    border: 1px solid var(--sa-border) !important;
    box-shadow: 0 24px 64px rgba(0,0,0,0.8) !important;
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────
const relativeTime = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60)    return `${diff}s ago`
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const initials = (name) =>
    (name || '').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')

// ─── Drift type metadata ───────────────────────────────────────────────────────
const DRIFT_TYPES = {
    UNUSUAL_LOGIN_TIME:        { label: 'Unusual Login Time',        icon: '🕐' },
    HIGH_FREQUENCY_ACTIONS:    { label: 'High Frequency Actions',    icon: '⚡' },
    SENSITIVE_ENDPOINT_ACCESS: { label: 'Sensitive Endpoint Access', icon: '🔐' },
    BULK_OPERATION:            { label: 'Bulk Operation',            icon: '📦' },
    OFF_HOURS_ACTIVITY:        { label: 'Off-Hours Activity',        icon: '🌙' },
    REPEATED_FAILED_ACCESS:    { label: 'Repeated Failed Access',    icon: '🚫' },
    UNUSUAL_ACTION_PATTERN:    { label: 'Unusual Action Pattern',    icon: '⚠️' },
}

// ─── Design-system colour tokens ──────────────────────────────────────────────
const SEVERITY_TOKENS = {
    CRITICAL: { bg: 'var(--sa-crit-bg, rgba(220,38,38,0.08))',  color: 'var(--sa-crit-text, #dc2626)', border: 'rgba(220,38,38,0.25)',  rowBorder: 'var(--sa-crit-text, #dc2626)'  },
    HIGH:     { bg: 'rgba(234,88,12,0.08)',  color: 'var(--sa-high-text, #c2410c)', border: 'rgba(234,88,12,0.25)',  rowBorder: 'rgba(234,88,12,0.18)' },
    MEDIUM:   { bg: 'rgba(217,119,6,0.08)',  color: 'var(--sa-med-text, #b45309)', border: 'rgba(217,119,6,0.25)',  rowBorder: 'rgba(217,119,6,0.18)' },
    LOW:      { bg: 'rgba(99,102,241,0.07)', color: 'var(--sa-low-text, #4f46e5)', border: 'rgba(99,102,241,0.2)',  rowBorder: 'rgba(99,102,241,0.15)' },
}

const STATUS_TOKENS = {
    OPEN:      { bg: 'var(--sa-crit-bg, rgba(220,38,38,0.07))',  color: 'var(--sa-crit-text, #dc2626)', border: 'rgba(220,38,38,0.2)'  },
    RESOLVED:  { bg: 'var(--sa-res-bg, rgba(22,163,74,0.08))',  color: 'var(--sa-res-text, #15803d)', border: 'rgba(22,163,74,0.22)' },
    DISMISSED: { bg: 'var(--sa-subtle-bg, rgba(0,0,0,0.04))',      color: 'var(--sa-text-muted, rgba(0,0,0,0.4))', border: 'var(--sa-border, rgba(0,0,0,0.1))' },
}

const SeverityPill = ({ severity }) => {
    const t = SEVERITY_TOKENS[severity] || SEVERITY_TOKENS.LOW
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 700,
            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
            whiteSpace: 'nowrap', letterSpacing: '0.03em',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            {severity}
        </span>
    )
}

const StatusPill = ({ status }) => {
    const t = STATUS_TOKENS[status] || STATUS_TOKENS.DISMISSED
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 100, fontSize: 11, fontWeight: 600,
            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
            whiteSpace: 'nowrap',
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
            {status}
        </span>
    )
}

const Avatar = ({ name, size = 30, fontSize = 11 }) => (
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

// ─── Resolution modal ─────────────────────────────────────────────────────────
const ResolutionModal = ({ drift, mode, onConfirm, onClose }) => {
    const [note, setNote] = useState('')
    const isResolve = mode === 'resolve'

    return (
        <div className="pg-modal-overlay">
            <div className="pg-modal">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Avatar name={drift.employeeName} size={48} fontSize={16} />
                    <div>
                        <div style={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: '1.2rem', color: 'var(--sa-text-main, #0f172a)',
                            letterSpacing: '-0.02em', lineHeight: 1.2,
                        }}>
                            {isResolve ? 'Resolve Security Alert' : 'Dismiss Security Alert'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--sa-text-muted, rgba(0,0,0,0.38))', marginTop: 3 }}>
                            {drift.employeeName} · {DRIFT_TYPES[drift.driftType]?.label}
                        </div>
                    </div>
                </div>

                <div className="pg-divider" />

                <div style={{
                    background: 'var(--sa-subtle-bg, rgba(0,0,0,0.012))', border: '1px solid var(--sa-border, rgba(0,0,0,0.07))',
                    borderRadius: 10, padding: '10px 14px',
                    fontSize: 13, color: 'var(--sa-text-muted, rgba(0,0,0,0.6))', lineHeight: 1.5,
                }}>
                    {drift.description}
                </div>

                <div className="pg-field">
                    <label className="pg-label">
                        {isResolve ? 'Resolution Note' : 'Dismissal Note'}
                        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 4, color: 'var(--sa-text-faint, rgba(0,0,0,0.3))' }}>
                            (optional)
                        </span>
                    </label>
                    <textarea
                        className="pg-textarea"
                        style={{ background: 'var(--sa-input-bg, #fff)', color: 'var(--sa-text-main)' }}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                        placeholder={
                            isResolve
                                ? 'e.g. Confirmed with employee — legitimate activity.'
                                : 'e.g. Known system glitch, ignoring.'
                        }
                    />
                </div>

                <div className="pg-modal-actions">
                    <button className="pg-btn-ghost" onClick={onClose}>Cancel</button>
                    <button
                        onClick={() => onConfirm(note)}
                        style={{
                            padding: '9px 18px', borderRadius: 10, border: 'none',
                            fontSize: 13, fontWeight: 500, cursor: 'pointer',
                            fontFamily: "'DM Sans', sans-serif",
                            background: isResolve ? 'var(--sa-res-bg, rgba(22,163,74,0.12))' : 'var(--sa-subtle-bg, rgba(0,0,0,0.07))',
                            color: isResolve ? 'var(--sa-res-text, #15803d)' : 'var(--sa-text-muted, rgba(0,0,0,0.5))',
                            border: isResolve ? '1px solid var(--sa-res-text, rgba(22,163,74,0.25))' : '1px solid var(--sa-border, rgba(0,0,0,0.12))',
                        }}
                    >
                        {isResolve ? '✓ Mark Resolved' : 'Dismiss'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Evidence drawer (slides from right) ─────────────────────────────────────
const EvidenceDrawer = ({ drift, onClose }) => {
    if (!drift) return null
    const sevToken = SEVERITY_TOKENS[drift.severity] || SEVERITY_TOKENS.LOW

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
            <div
                style={{
                    background: 'var(--sa-drawer-bg, #ffffff)', width: '100%', maxWidth: 500,
                    height: '100%', overflowY: 'auto',
                    boxShadow: 'var(--sa-shadow, -24px 0 64px rgba(0,0,0,0.12))',
                    display: 'flex', flexDirection: 'column',
                    fontFamily: "'DM Sans', sans-serif",
                }}
                onClick={e => e.stopPropagation()}
            >
                <div className="ems-drawer-header" style={{
                    padding: '20px 24px', borderBottom: '1px solid var(--sa-border, rgba(0,0,0,0.06))',
                    display: 'flex', alignItems: 'flex-start',
                    justifyContent: 'space-between', gap: 12, flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={drift.employeeName} size={44} fontSize={15} />
                        <div>
                            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.1rem', color: 'var(--sa-text-main, #0f172a)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                {drift.employeeName}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--sa-text-muted, rgba(0,0,0,0.38))', marginTop: 3 }}>
                                {drift.employeeDepartment}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--sa-text-faint, rgba(0,0,0,0.35))', lineHeight: 1, padding: 4, marginTop: 2 }}>✕</button>
                </div>

                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 22, flex: 1 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                        background: 'var(--sa-subtle-bg, rgba(0,0,0,0.012))',
                        border: '1px solid var(--sa-border, rgba(0,0,0,0.07))',
                        borderRadius: 14, padding: '14px 16px',
                    }}>
                        <span style={{ fontSize: 22 }}>{DRIFT_TYPES[drift.driftType]?.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--sa-text-main, #0f172a)', marginBottom: 6 }}>
                                {DRIFT_TYPES[drift.driftType]?.label}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <SeverityPill severity={drift.severity} />
                                <StatusPill   status={drift.status} />
                            </div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--sa-text-faint, rgba(0,0,0,0.35))', textAlign: 'right', flexShrink: 0 }}>
                            {relativeTime(drift.createdAt)}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sa-text-faint, rgba(0,0,0,0.35))', marginBottom: 8 }}>
                            Description
                        </div>
                        <p style={{
                            fontSize: 13, color: 'var(--sa-text-muted, rgba(0,0,0,0.65))', lineHeight: 1.65, margin: 0,
                            background: sevToken.bg, border: `1px solid ${sevToken.border}`, borderRadius: 10, padding: '12px 14px',
                        }}>
                            {drift.description}
                        </p>
                    </div>

                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sa-text-faint, rgba(0,0,0,0.35))', marginBottom: 10 }}>
                            Evidence Log
                        </div>
                        {!drift.evidence?.length ? (
                            <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'var(--sa-text-faint, rgba(0,0,0,0.3))' }}>
                                No detailed evidence captured for this event.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {drift.evidence.map((ev, i) => (
                                    <div key={i} style={{ background: 'var(--sa-subtle-bg, rgba(0,0,0,0.012))', border: '1px solid var(--sa-border, rgba(0,0,0,0.07))', borderRadius: 10, padding: '10px 14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--sa-text-main, #0f172a)' }}>{ev.action?.replace(/_/g, ' ')}</span>
                                            <span style={{ fontSize: 11, color: 'var(--sa-text-faint, rgba(0,0,0,0.35))' }}>{relativeTime(ev.timestamp)}</span>
                                        </div>
                                        {ev.endpoint && <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#6366f1', marginBottom: 2 }}>{ev.endpoint}</div>}
                                        {ev.description && <div style={{ fontSize: 12, color: 'var(--sa-text-muted, rgba(0,0,0,0.5))', lineHeight: 1.5 }}>{ev.description}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export const SecurityAlertsPage = () => {
    const dispatch = useDispatch()
    const state    = useSelector(s => s.AccessDriftReducer)

    const [filterStatus,   setFilterStatus]   = useState('ALL')
    const [filterSeverity, setFilterSeverity] = useState('ALL')
    const [filterType,     setFilterType]     = useState('ALL')
    const [currentPage,    setCurrentPage]    = useState(1)
    const [modalDrift,     setModalDrift]     = useState(null)
    const [modalMode,      setModalMode]      = useState(null)
    const [evidenceDrift,  setEvidenceDrift]  = useState(null)

    const fetchDrifts = (page = 1) => {
        dispatch(HandleGetAllDriftEvents({
            page, limit: 20,
            status:    filterStatus   === 'ALL' ? undefined : filterStatus,
            severity:  filterSeverity === 'ALL' ? undefined : filterSeverity,
            driftType: filterType     === 'ALL' ? undefined : filterType,
        }))
    }

    useEffect(() => {
        dispatch(HandleGetDriftSummary())
        fetchDrifts(1)
    }, [dispatch])

    const handleApply = () => { setCurrentPage(1); fetchDrifts(1) }
    const handleClear = () => {
        setFilterStatus('ALL'); setFilterSeverity('ALL'); setFilterType('ALL')
        setCurrentPage(1)
        dispatch(HandleGetAllDriftEvents({ page: 1, limit: 20 }))
    }

    const handleConfirmModal = (note) => {
        if (!modalDrift) return
        const thunk = modalMode === 'resolve' ? HandleResolveDrift : HandleDismissDrift
        dispatch(thunk({ driftID: modalDrift._id, resolutionNote: note })).then(() => {
            setModalDrift(null); setModalMode(null)
            dispatch(HandleGetDriftSummary())
            fetchDrifts(currentPage)
        })
    }

    const drifts     = state?.drifts     || []
    const pagination = state?.pagination || { totalPages: 0, total: 0, limit: 20 }
    const summary    = state?.summary    || { total: 0, open: 0, resolved: 0, dismissed: 0, critical: 0, high: 0 }

    return (
        <PageShell>
            <style>{styles}</style>

            <PageHeader
                eyebrow="Security"
                title="Security Alerts"
                subtitle="Monitor and investigate unusual or out-of-policy employee access patterns"
            />

            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                {[
                    { label: 'Total Events', value: summary.total     },
                    { label: 'Open',         value: summary.open      },
                    { label: 'Resolved',     value: summary.resolved  },
                    { label: 'Dismissed',    value: summary.dismissed },
                    { label: 'Critical',     value: summary.critical  },
                    { label: 'High',         value: summary.high      },
                ].map(s => (
                    <div key={s.label} className="pg-stat-card">
                        <span className="pg-stat-value" style={{ fontSize: '1.5rem' }}>{s.value}</span>
                        <span className="pg-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>

            <div className="pg-filter-panel">
                <div className="pg-filter-group">
                    <label className="pg-filter-label">Status</label>
                    <select className="pg-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="ALL">All statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="DISMISSED">Dismissed</option>
                    </select>
                </div>
                <div className="pg-filter-group">
                    <label className="pg-filter-label">Severity</label>
                    <select className="pg-select" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
                        <option value="ALL">All severities</option>
                        <option value="CRITICAL">Critical</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
                <div className="pg-filter-group">
                    <label className="pg-filter-label">Drift Type</label>
                    <select className="pg-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="ALL">All types</option>
                        {Object.entries(DRIFT_TYPES).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <button className="pg-btn-primary" onClick={handleApply} style={{ padding: '8px 18px' }}>Apply</button>
                    <button className="pg-btn-ghost" onClick={handleClear} style={{ padding: '8px 14px' }}>Clear</button>
                </div>
            </div>

            <div className="pg-table-wrap">
                <div className="pg-table-head" style={{ gridTemplateColumns: '130px 1.8fr 1.4fr 2.5fr 120px 160px' }}>
                    <span className="pg-th">Severity</span>
                    <span className="pg-th">Employee</span>
                    <span className="pg-th">Alert Type</span>
                    <span className="pg-th">Description</span>
                    <span className="pg-th">Status</span>
                    <span className="pg-th">Actions</span>
                </div>

                {state.isLoading && <div style={{ padding: '32px 0' }}><Loading /></div>}

                {!state.isLoading && drifts.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">🛡️</span>
                        <p className="pg-empty-title">No security alerts found</p>
                        <p className="pg-empty-sub">System anomalies will appear here. Try adjusting the filters above.</p>
                    </div>
                )}

                {!state.isLoading && drifts.map((drift) => {
                    const sevToken = SEVERITY_TOKENS[drift.severity] || SEVERITY_TOKENS.LOW
                    const isOpen   = drift.status === 'OPEN'

                    return (
                        <div key={drift._id} className="pg-table-row" style={{ gridTemplateColumns: '130px 1.8fr 1.4fr 2.5fr 120px 160px', borderLeft: isOpen ? `3px solid ${sevToken.rowBorder}` : '3px solid transparent' }}>
                            <span><SeverityPill severity={drift.severity} /></span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                <Avatar name={drift.employeeName} />
                                <div>
                                    <div className="pg-td-name">{drift.employeeName}</div>
                                    <div className="pg-td-sub">{drift.employeeDepartment}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 15, flexShrink: 0 }}>{DRIFT_TYPES[drift.driftType]?.icon}</span>
                                <span style={{ fontSize: 12, color: 'var(--sa-text-muted, rgba(0,0,0,0.6))', fontWeight: 500 }}>{DRIFT_TYPES[drift.driftType]?.label}</span>
                            </div>
                            <div>
                                <div className="pg-td-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260, fontSize: 12 }}>
                                    {drift.description}
                                </div>
                                <div className="pg-td-sub">{relativeTime(drift.createdAt)}</div>
                            </div>
                            <span><StatusPill status={drift.status} /></span>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                <button className="pg-action-btn indigo" onClick={() => setEvidenceDrift(drift)}>Details</button>
                                {isOpen && (
                                    <>
                                        <button className="pg-action-btn green" onClick={() => { setModalDrift(drift); setModalMode('resolve') }}>Resolve</button>
                                        <button className="pg-action-btn" onClick={() => { setModalDrift(drift); setModalMode('dismiss') }}>Dismiss</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {pagination?.totalPages > 1 && (
                <div className="pg-pagination">
                    <span className="pg-pagination-info">
                        Showing {((currentPage - 1) * pagination.limit) + 1}–{Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} events
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                        <button className="pg-page-btn" disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); fetchDrifts(currentPage - 1) }}>← Prev</button>
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const p = Math.max(1, currentPage - 2) + i
                            if (p > pagination.totalPages) return null
                            return (
                                <button key={p} className={`pg-page-btn${p === currentPage ? ' active' : ''}`} onClick={() => { setCurrentPage(p); fetchDrifts(p) }}>{p}</button>
                            )
                        })}
                        <button className="pg-page-btn" disabled={currentPage === pagination.totalPages} onClick={() => { setCurrentPage(p => p + 1); fetchDrifts(currentPage + 1) }}>Next →</button>
                    </div>
                </div>
            )}

            {modalDrift && <ResolutionModal drift={modalDrift} mode={modalMode} onConfirm={handleConfirmModal} onClose={() => { setModalDrift(null); setModalMode(null) }} />}
            {evidenceDrift && <EvidenceDrawer drift={evidenceDrift} onClose={() => setEvidenceDrift(null)} />}
        </PageShell>
    )
}