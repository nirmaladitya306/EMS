import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// Note: You will need to create these Thunks in your RBAC or Employee slice
import { HandleGetRoleDrifts, HandleRevokeDrift, HandleExtendDrift } from '../../../redux/Thunks/RBACThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ═══════════════════════════════════════════════════════
     DARK MODE & EXECUTIVE THEME OVERRIDES
  ═══════════════════════════════════════════════════════ */
  [data-theme='dark'] {
    --dr-bg: #18181b;
    --dr-border: #27272a;
    --dr-text-main: #fafafa;
    --dr-text-muted: #a1a1aa;
    --dr-text-faint: #71717a;
    --dr-row-hover: rgba(255, 255, 255, 0.03);
    
    --dr-base-bg: rgba(255, 255, 255, 0.08);
    --dr-base-text: #e4e4e7;
    
    --dr-add-bg: rgba(99, 102, 241, 0.15);
    --dr-add-text: #818cf8;
    --dr-add-border: rgba(99, 102, 241, 0.3);

    --dr-warn-bg: rgba(239, 68, 68, 0.15);
    --dr-warn-text: #f87171;
    --dr-warn-border: rgba(239, 68, 68, 0.3);
  }

  .dr-base-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600;
    background: var(--dr-base-bg, #f3f4f6); color: var(--dr-base-text, #4b5563);
    letter-spacing: 0.03em;
  }

  .dr-added-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600;
    background: var(--dr-add-bg, rgba(99, 102, 241, 0.08)); 
    color: var(--dr-add-text, #4f46e5); 
    border: 1px solid var(--dr-add-border, rgba(99, 102, 241, 0.2));
  }

  .dr-expired-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 600;
    background: var(--dr-warn-bg, rgba(239, 68, 68, 0.08)); 
    color: var(--dr-warn-text, #dc2626); 
    border: 1px solid var(--dr-warn-border, rgba(239, 68, 68, 0.2));
  }
`

const initials = (first, last) => `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()

const Avatar = ({ first, last }) => (
    <div style={{
        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 700, fontSize: 13,
        fontFamily: "'DM Serif Display', serif",
    }}>
        {initials(first, last)}
    </div>
)

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No Expiry'

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AccessDriftPage = () => {
    const dispatch = useDispatch()
    
    // Fallback empty state if the Redux slice isn't built yet
    const state = useSelector(s => s.PrivilegeDriftReducer) || { data: [], isLoading: false }
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('All')

    // Dummy data to test the UI until the backend is hooked up
    const dummyData = [
        {
            _id: '1',
            employee: { firstname: 'Dulce', lastname: 'Lehner', department: { name: 'Human Resources' }, email: 'dulce@novacore.com' },
            baseRole: 'HR Assistant',
            drift: { role: 'Payroll Admin', reason: 'Maternity Cover (Sarah)', expiresAt: '2026-05-15T00:00:00.000Z', isExpired: false }
        },
        {
            _id: '2',
            employee: { firstname: 'Wilson', lastname: 'Rolfson', department: { name: 'Finance' }, email: 'wilson@novacore.com' },
            baseRole: 'Accountant',
            drift: { role: 'Audit Viewer', reason: 'Q1 Financial Audit', expiresAt: '2026-04-10T00:00:00.000Z', isExpired: true }
        }
    ]

    const drifts = state.data?.length > 0 ? state.data : dummyData

    useEffect(() => {
        // dispatch(HandleGetRoleDrifts())
    }, [dispatch])

    const handleRevoke = (driftID) => {
        if (window.confirm('Instantly revoke this temporary privilege?')) {
            // dispatch(HandleRevokeDrift({ driftID }))
            console.log('Revoked:', driftID)
        }
    }

    const filtered = drifts.filter(d => {
        const matchName = `${d.employee?.firstname} ${d.employee?.lastname}`.toLowerCase().includes(search.toLowerCase())
        if (filter === 'Expired') return matchName && d.drift.isExpired
        if (filter === 'Active') return matchName && !d.drift.isExpired
        return matchName
    })

    const totalExpired = drifts.filter(d => d.drift.isExpired).length

    return (
        <PageShell>
            <style>{styles}</style>
            
            <PageHeader 
                eyebrow="Security" 
                title="Access Drift" 
                subtitle="Track employees with temporary roles, expanded access, or expired privileges" 
            />

            <div className="pg-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="pg-stat-card">
                    <span className="pg-stat-value">{drifts.length}</span>
                    <span className="pg-stat-label">Total Active Drifts</span>
                </div>
                <div className="pg-stat-card">
                    <span className="pg-stat-value" style={{ color: totalExpired > 0 ? 'var(--dr-warn-text, #dc2626)' : 'inherit' }}>
                        {totalExpired}
                    </span>
                    <span className="pg-stat-label">Expired Privileges</span>
                </div>
                <div className="pg-stat-card">
                    <span className="pg-stat-value">{drifts.filter(d => !d.drift.isExpired).length}</span>
                    <span className="pg-stat-label">Temporary Roles</span>
                </div>
            </div>

            <div className="pg-filters">
                <input 
                    className="pg-search" type="text" placeholder="Search by employee..." 
                    value={search} onChange={e => setSearch(e.target.value)} style={{ minWidth: 260 }} 
                />
                {['All', 'Active', 'Expired'].map(s => (
                    <button key={s} onClick={() => setFilter(s)} className={`pg-pill${filter === s ? ' active' : ''}`}>
                        {s}
                    </button>
                ))}
            </div>

            <div className="pg-table-wrap">
                <div className="pg-table-head" style={{ gridTemplateColumns: '2fr 1.5fr 2fr 1fr 140px' }}>
                    <span className="pg-th">Employee</span>
                    <span className="pg-th">Base Role</span>
                    <span className="pg-th">Added Privilege (Drift)</span>
                    <span className="pg-th">Expiry</span>
                    <span className="pg-th">Actions</span>
                </div>

                {filtered.length === 0 && (
                    <div className="pg-empty">
                        <span className="pg-empty-icon">🛡️</span>
                        <p className="pg-empty-title">No privilege drift detected</p>
                        <p className="pg-empty-sub">All employee access aligns with their base roles.</p>
                    </div>
                )}

                {filtered.map(item => (
                    <div key={item._id} className="pg-table-row" style={{ gridTemplateColumns: '2fr 1.5fr 2fr 1fr 140px' }}>
                        
                        {/* Employee */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Avatar first={item.employee.firstname} last={item.employee.lastname} />
                            <div>
                                <div className="pg-td-name" style={{ color: 'var(--dr-text-main, #0f172a)' }}>
                                    {item.employee.firstname} {item.employee.lastname}
                                </div>
                                <div className="pg-td-sub">{item.employee.department?.name}</div>
                            </div>
                        </div>

                        {/* Base Role */}
                        <div>
                            <span className="dr-base-pill">🛡️ {item.baseRole}</span>
                        </div>

                        {/* Added Privilege */}
                        <div>
                            <div className={item.drift.isExpired ? 'dr-expired-pill' : 'dr-added-pill'}>
                                + {item.drift.role}
                            </div>
                            <div className="pg-td-sub" style={{ marginTop: 6, fontSize: 11, fontStyle: 'italic' }}>
                                Reason: {item.drift.reason}
                            </div>
                        </div>

                        {/* Expiry */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: item.drift.isExpired ? 'var(--dr-warn-text, #dc2626)' : 'var(--dr-text-main, #0f172a)' }}>
                                {fmtDate(item.drift.expiresAt)}
                            </span>
                            {item.drift.isExpired && (
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--dr-warn-text, #dc2626)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Action Required
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button className="pg-action-btn red" onClick={() => handleRevoke(item._id)}>
                                Revoke
                            </button>
                            <button className="pg-action-btn indigo">
                                Extend
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </PageShell>
    )
}