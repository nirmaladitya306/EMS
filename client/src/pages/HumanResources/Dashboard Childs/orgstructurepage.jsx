import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetOrgTree,
    HandleCreatePosition,
    HandleUpdatePosition,
    HandleDeletePosition,
    HandleAssignEmployee,
    HandleRemoveEmployee,
} from '../../../redux/Thunks/OrgStructureThunk'
import { HandleGetHREmployees } from '../../../redux/Thunks/HREmployeesThunk'
import { Loading } from '../../../components/common/loading'

// ─── Level palette — indigo/violet scale matching design system ───────────────
const LEVEL_PALETTE = {
    1: { bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.3)',  text: '#4f46e5', badge: 'rgba(99,102,241,0.12)'  },
    2: { bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.3)', text: '#7c3aed', badge: 'rgba(139,92,246,0.12)' },
    3: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.25)',text: '#059669', badge: 'rgba(16,185,129,0.12)' },
    4: { bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.25)',text: '#b45309', badge: 'rgba(245,158,11,0.12)' },
    5: { bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.22)', text: '#dc2626', badge: 'rgba(239,68,68,0.1)'   },
}
const getPalette = (level) => LEVEL_PALETTE[Math.min(level, 5)] || LEVEL_PALETTE[5]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* ── Tree ── */
  .org-tree-wrap { flex: 1; overflow-y: auto; overflow-x: auto; padding: 4px 2px; }
  .org-node-indent { margin-left: 28px; border-left: 1px solid rgba(0,0,0,0.08); padding-left: 16px; }

  .org-node-card {
    border-radius: 14px; padding: 12px 14px; margin-bottom: 10px;
    display: flex; flex-direction: column; gap: 10px;
    border: 1px solid; font-family: 'DM Sans', sans-serif;
    transition: box-shadow 0.2s;
  }
  .org-node-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.07); }

  .org-node-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .org-node-info   { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .org-level-badge {
    font-size: 10px; font-weight: 700; padding: 2px 8px;
    border-radius: 100px; letter-spacing: 0.06em;
    font-family: 'DM Sans', sans-serif;
  }
  .org-node-title { font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
  .org-dept-chip {
    font-size: 11px; background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.08);
    color: rgba(0,0,0,0.45); border-radius: 100px; padding: 2px 8px;
    font-family: 'DM Sans', sans-serif;
  }

  .org-node-actions { display: flex; gap: 5px; flex-shrink: 0; }
  .org-node-btn {
    padding: 4px 9px; font-size: 11px; font-weight: 500;
    border-radius: 7px; border: 1px solid rgba(0,0,0,0.1);
    background: rgba(255,255,255,0.8); color: rgba(0,0,0,0.55);
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
    font-family: 'DM Sans', sans-serif; white-space: nowrap;
  }
  .org-node-btn:hover { background: rgba(255,255,255,1); border-color: rgba(0,0,0,0.2); }
  .org-node-btn.assign { color: #6366f1; border-color: rgba(99,102,241,0.25); }
  .org-node-btn.assign:hover { background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.4); }

  .org-employees-strip {
    display: flex; flex-wrap: wrap; gap: 6px;
    padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.07);
  }
  .org-emp-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(255,255,255,0.9); border: 1px solid rgba(0,0,0,0.08);
    border-radius: 100px; padding: 3px 10px 3px 6px;
    font-family: 'DM Sans', sans-serif;
  }
  .org-emp-avatar {
    width: 20px; height: 20px; border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 10px; font-weight: 700; flex-shrink: 0;
  }
  .org-emp-name { font-size: 12px; font-weight: 500; color: #0f172a; }
  .org-emp-remove {
    background: none; border: none; cursor: pointer;
    color: rgba(0,0,0,0.25); font-size: 14px; line-height: 1;
    padding: 0; transition: color 0.15s;
  }
  .org-emp-remove:hover { color: #dc2626; }
  .org-no-emp { font-size: 11px; color: rgba(0,0,0,0.3); font-style: italic; font-family: 'DM Sans', sans-serif; }

  /* ── Modal ── */
  .org-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.35);
    display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px;
  }
  .org-modal {
    background: #fff; border-radius: 20px; padding: 28px 30px;
    width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 24px 64px rgba(0,0,0,0.12);
    display: flex; flex-direction: column; gap: 18px;
    font-family: 'DM Sans', sans-serif;
  }
  .org-modal-title { font-family: 'DM Serif Display', serif; font-size: 1.3rem; color: #0f172a; letter-spacing: -0.02em; margin: 0; }
  .org-modal-sub { font-size: 13px; color: rgba(0,0,0,0.4); margin: 0; }
  .org-divider { height: 1px; background: rgba(0,0,0,0.06); }
  .org-field { display: flex; flex-direction: column; gap: 5px; }
  .org-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(0,0,0,0.4); }
  .org-input, .org-textarea, .org-select-input {
    width: 100%; padding: 9px 13px; border: 1px solid rgba(0,0,0,0.12);
    background: #fff; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a;
    outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
  }
  .org-textarea { resize: vertical; min-height: 70px; }
  .org-input:focus, .org-textarea:focus, .org-select-input:focus {
    border-color: rgba(99,102,241,0.45); box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .org-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .org-modal-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; border-top: 1px solid rgba(0,0,0,0.06); }

  /* ── View toggle ── */
  .org-view-toggle { display: flex; border: 1px solid rgba(0,0,0,0.09); border-radius: 10px; overflow: hidden; }
  .org-view-btn {
    padding: 8px 16px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background 0.15s, color 0.15s;
    font-family: 'DM Sans', sans-serif; background: transparent; color: rgba(0,0,0,0.5);
  }
  .org-view-btn.active { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; }
  .org-view-btn:not(.active):hover { background: rgba(0,0,0,0.04); color: rgba(0,0,0,0.7); }
`

// ─── Position dialog ───────────────────────────────────────────────────────────
const PositionDialog = ({ open, onClose, onSubmit, positions, departments, initial }) => {
    const isEdit = !!initial
    const empty  = { title: '', description: '', level: '1', departmentID: '', reportsToID: '' }
    const [form, setForm] = useState(empty)

    useEffect(() => {
        if (open) setForm(isEdit ? {
            title:        initial.title || '',
            description:  initial.description || '',
            level:        String(initial.level || 1),
            departmentID: initial.department?._id || initial.department || '',
            reportsToID:  initial.reportsTo?._id  || initial.reportsTo  || '',
        } : empty)
    }, [open, initial])

    if (!open) return null
    const h = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const s = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="org-modal-overlay">
            <div className="org-modal">
                <h2 className="org-modal-title">{isEdit ? 'Edit Position' : 'Create Position'}</h2>
                <div className="org-divider" />
                <form onSubmit={s} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="org-field">
                        <label className="org-label">Job Title *</label>
                        <input name="title" value={form.title} onChange={h} required
                            placeholder="e.g. Senior Software Engineer" className="org-input" />
                    </div>
                    <div className="org-field">
                        <label className="org-label">Description</label>
                        <textarea name="description" value={form.description} onChange={h}
                            rows={2} placeholder="Role responsibilities…" className="org-textarea" />
                    </div>
                    <div className="org-grid-2">
                        <div className="org-field">
                            <label className="org-label">Level * <span style={{ color: 'rgba(0,0,0,0.3)', fontWeight: 400, textTransform: 'none' }}>(1 = top)</span></label>
                            <input name="level" type="number" min="1" max="10" value={form.level} onChange={h} required className="org-input" />
                        </div>
                        <div className="org-field">
                            <label className="org-label">Department</label>
                            <select name="departmentID" value={form.departmentID} onChange={h} className="org-select-input">
                                <option value="">— Any / Cross-dept —</option>
                                {(departments || []).map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="org-field">
                        <label className="org-label">Reports To</label>
                        <select name="reportsToID" value={form.reportsToID} onChange={h} className="org-select-input">
                            <option value="">— Root (no parent) —</option>
                            {(positions || [])
                                .filter(p => !isEdit || p._id !== initial?._id)
                                .sort((a, b) => a.level - b.level)
                                .map(p => (
                                    <option key={p._id} value={p._id}>L{p.level} · {p.title}</option>
                                ))}
                        </select>
                    </div>
                    <div className="org-modal-actions">
                        <button type="button" onClick={onClose} className="pg-btn-ghost">Cancel</button>
                        <button type="submit" className="pg-btn-primary">{isEdit ? 'Save Changes' : 'Create Position'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── Assign employee dialog ────────────────────────────────────────────────────
const AssignDialog = ({ open, onClose, onSubmit, position, employees, allPositionEmployees }) => {
    const [employeeID, setEmployeeID] = useState('')
    const [managerID,  setManagerID]  = useState('')
    useEffect(() => { if (open) { setEmployeeID(''); setManagerID('') } }, [open])
    if (!open || !position) return null

    const alreadyAssigned = new Set((position.employees || []).map(e => e._id || e))
    const available = (employees || []).filter(e => !alreadyAssigned.has(e._id))

    return (
        <div className="org-modal-overlay">
            <div className="org-modal">
                <div>
                    <h2 className="org-modal-title">Assign Employee</h2>
                    <p className="org-modal-sub" style={{ marginTop: '4px' }}>
                        To <strong>{position.title}</strong> — Level {position.level}
                    </p>
                </div>
                <div className="org-divider" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="org-field">
                        <label className="org-label">Employee *</label>
                        <select value={employeeID} onChange={e => setEmployeeID(e.target.value)} className="org-select-input">
                            <option value="">Select employee…</option>
                            {available.map(e => (
                                <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>
                            ))}
                        </select>
                        {available.length === 0 && (
                            <p style={{ fontSize: '11px', color: 'rgba(0,0,0,0.35)', marginTop: '4px' }}>All employees are already in this position.</p>
                        )}
                    </div>
                    <div className="org-field">
                        <label className="org-label">Direct Manager <span style={{ color: 'rgba(0,0,0,0.3)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                        <select value={managerID} onChange={e => setManagerID(e.target.value)} className="org-select-input">
                            <option value="">— No manager assigned —</option>
                            {allPositionEmployees.filter(e => e._id !== employeeID).map(e => (
                                <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>
                            ))}
                        </select>
                    </div>
                    <div className="org-modal-actions">
                        <button onClick={onClose} className="pg-btn-ghost">Cancel</button>
                        <button
                            disabled={!employeeID}
                            onClick={() => onSubmit({ positionID: position._id, employeeID, managerID: managerID || undefined })}
                            className="pg-btn-primary">
                            Assign
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Recursive tree node ───────────────────────────────────────────────────────
const TreeNode = ({ node, onEdit, onAssign, onRemoveEmployee, depth = 0 }) => {
    const [expanded, setExpanded] = useState(true)
    const p = getPalette(node.level)
    const hasChildren = node.children?.length > 0

    return (
        <div className={depth > 0 ? 'org-node-indent' : ''}>
            <div
                className="org-node-card"
                style={{ background: p.bg, borderColor: p.border }}
            >
                <div className="org-node-header">
                    <div className="org-node-info">
                        <span className="org-level-badge" style={{ background: p.badge, color: p.text }}>
                            L{node.level}
                        </span>
                        <span className="org-node-title" style={{ color: p.text }}>{node.title}</span>
                        {node.department?.name && (
                            <span className="org-dept-chip">{node.department.name}</span>
                        )}
                    </div>
                    <div className="org-node-actions">
                        <button className="org-node-btn assign" onClick={() => onAssign(node)}>+ Assign</button>
                        <button className="org-node-btn" onClick={() => onEdit(node)}>Edit</button>
                        {hasChildren && (
                            <button className="org-node-btn" onClick={() => setExpanded(e => !e)}>
                                {expanded ? '▲' : '▼'}
                            </button>
                        )}
                    </div>
                </div>

                {node.employees?.length > 0 ? (
                    <div className="org-employees-strip">
                        {node.employees.map(emp => (
                            <div key={emp._id} className="org-emp-pill">
                                <div className="org-emp-avatar">{emp.firstname?.[0]?.toUpperCase()}</div>
                                <span className="org-emp-name">{emp.firstname} {emp.lastname}</span>
                                <button className="org-emp-remove"
                                    onClick={() => onRemoveEmployee({ positionID: node._id, employeeID: emp._id })}>
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="org-no-emp">No employees assigned</p>
                )}
            </div>

            {expanded && hasChildren && node.children.map(child => (
                <TreeNode key={child._id} node={child} onEdit={onEdit}
                    onAssign={onAssign} onRemoveEmployee={onRemoveEmployee} depth={depth + 1} />
            ))}
        </div>
    )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export const OrgStructurePage = () => {
    const dispatch  = useDispatch()
    const state     = useSelector(s => s.OrgStructureReducer)
    const empState  = useSelector(s => s.HREmployeesPageReducer)
    const deptState = useSelector(s => s.HRDepartmentPageReducer)

    const [view,         setView]         = useState('tree')
    const [createOpen,   setCreateOpen]   = useState(false)
    const [editTarget,   setEditTarget]   = useState(null)
    const [assignTarget, setAssignTarget] = useState(null)
    const [search,       setSearch]       = useState('')

    useEffect(() => {
        dispatch(HandleGetOrgTree())
        dispatch(HandleGetHREmployees({ apiroute: 'GETALL' }))
    }, [])

    useEffect(() => { if (state.fetchData) dispatch(HandleGetOrgTree()) }, [state.fetchData])

    const handleCreate         = (form) => { dispatch(HandleCreatePosition(form)); setCreateOpen(false) }
    const handleEdit           = (form) => { dispatch(HandleUpdatePosition({ positionID: editTarget._id, ...form })); setEditTarget(null) }
    const handleDelete         = (id)   => { if (window.confirm('Delete this position? Employees will be unassigned.')) dispatch(HandleDeletePosition(id)) }
    const handleAssign         = (pl)   => { dispatch(HandleAssignEmployee(pl)); setAssignTarget(null) }
    const handleRemoveEmployee = (pl)   => dispatch(HandleRemoveEmployee(pl))

    const departments        = deptState?.data || []
    const allPositionEmployees = empState.data || []
    const filteredPositions  = (state.positions || []).filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))

    if (state.isLoading && !state.positions.length) return <Loading />

    return (
        <>
            <style>{styles}</style>
            <PageShell>
                <PageHeader eyebrow="People" title="Org Structure"
                    subtitle="Define positions, reporting lines, and place employees in the hierarchy">
                    <button className="pg-btn-primary" onClick={() => setCreateOpen(true)}>+ New Position</button>
                </PageHeader>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total Positions',   value: state.summary.totalPositions       },
                        { label: 'Filled Positions',  value: state.summary.filledPositions      },
                        { label: 'Employees Placed',  value: state.summary.totalEmployeesPlaced },
                    ].map(c => (
                        <div key={c.label} className="pg-stat-card">
                            <span className="pg-stat-value">{c.value ?? 0}</span>
                            <span className="pg-stat-label">{c.label}</span>
                        </div>
                    ))}
                </div>

                {/* View toggle + search */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                    <div className="org-view-toggle">
                        <button className={`org-view-btn ${view === 'tree' ? 'active' : ''}`} onClick={() => setView('tree')}>
                            🌳 Tree View
                        </button>
                        <button className={`org-view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
                            📋 List View
                        </button>
                    </div>
                    {view === 'list' && (
                        <input type="text" placeholder="Search positions…" value={search}
                            onChange={e => setSearch(e.target.value)} className="pg-search"
                            style={{ minWidth: '200px' }} />
                    )}
                </div>

                {/* Error */}
                {state.error?.status && (
                    <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: '#dc2626' }}>
                        {state.error.message}
                    </div>
                )}

                {/* Tree view */}
                {view === 'tree' && (
                    <div className="org-tree-wrap">
                        {state.tree.length === 0 ? (
                            <div className="pg-empty">
                                <span className="pg-empty-icon">🏢</span>
                                <p className="pg-empty-title">No positions yet</p>
                                <p className="pg-empty-sub">Create your first position to start building your org chart.</p>
                            </div>
                        ) : state.tree.map(node => (
                            <TreeNode key={node._id} node={node} onEdit={setEditTarget}
                                onAssign={setAssignTarget} onRemoveEmployee={handleRemoveEmployee} />
                        ))}
                    </div>
                )}

                {/* List view */}
                {view === 'list' && (
                    <div className="pg-table-wrap">
                        <div className="pg-table-head grid grid-cols-6">
                            {['Level', 'Title', '', 'Department', 'Reports To', 'Actions'].map((h, i) => (
                                <span key={i} className="pg-th">{h}</span>
                            ))}
                        </div>
                        {filteredPositions.length === 0 ? (
                            <div className="pg-empty">
                                <span className="pg-empty-title">No positions found.</span>
                            </div>
                        ) : filteredPositions
                            .sort((a, b) => a.level - b.level || a.title.localeCompare(b.title))
                            .map(p => {
                                const pal = getPalette(p.level)
                                return (
                                    <div key={p._id} className="pg-table-row grid grid-cols-6">
                                        <span className="org-level-badge" style={{ background: pal.badge, color: pal.text, width: 'fit-content' }}>
                                            L{p.level}
                                        </span>
                                        <div className="col-span-2">
                                            <p className="pg-td-name">{p.title}</p>
                                            <p className="pg-td-sub">{p.employees?.length || 0} employee{p.employees?.length !== 1 ? 's' : ''}</p>
                                        </div>
                                        <span className="pg-td-muted">{p.department?.name || '—'}</span>
                                        <span className="pg-td-muted truncate">{p.reportsTo?.title || '— Root —'}</span>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            <button className="pg-action-btn indigo" onClick={() => setAssignTarget(p)}>Assign</button>
                                            <button className="pg-action-btn" onClick={() => setEditTarget(p)}>Edit</button>
                                            <button className="pg-action-btn red" onClick={() => handleDelete(p._id)}>Delete</button>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                )}

                {/* Dialogs */}
                <PositionDialog open={createOpen} onClose={() => setCreateOpen(false)}
                    onSubmit={handleCreate} positions={state.positions} departments={departments} />
                <PositionDialog open={!!editTarget} onClose={() => setEditTarget(null)}
                    onSubmit={handleEdit} positions={state.positions} departments={departments} initial={editTarget} />
                <AssignDialog open={!!assignTarget} onClose={() => setAssignTarget(null)}
                    onSubmit={handleAssign} position={assignTarget}
                    employees={empState.data || []} allPositionEmployees={allPositionEmployees} />
            </PageShell>
        </>
    )
}
