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

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LEVEL_COLORS = {
    1: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', badge: 'bg-purple-200' },
    2: { bg: 'bg-sky-100',    border: 'border-sky-300',    text: 'text-sky-800',    badge: 'bg-sky-200'    },
    3: { bg: 'bg-teal-100',   border: 'border-teal-300',   text: 'text-teal-800',   badge: 'bg-teal-200'   },
    4: { bg: 'bg-green-100',  border: 'border-green-300',  text: 'text-green-800',  badge: 'bg-green-200'  },
    5: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', badge: 'bg-yellow-200' },
}
const getLevelColor = (level) => LEVEL_COLORS[Math.min(level, 5)] || LEVEL_COLORS[5]

// ─── Position dialog (create + edit) ─────────────────────────────────────────
const PositionDialog = ({ open, onClose, onSubmit, positions, departments, initial }) => {
    const isEdit = !!initial
    const empty  = { title: '', description: '', level: '1', departmentID: '', reportsToID: '' }
    const [form, setForm] = useState(empty)

    useEffect(() => {
        if (open) {
            setForm(isEdit ? {
                title:        initial.title || '',
                description:  initial.description || '',
                level:        String(initial.level || 1),
                departmentID: initial.department?._id || initial.department || '',
                reportsToID:  initial.reportsTo?._id  || initial.reportsTo  || '',
            } : empty)
        }
    }, [open, initial])

    if (!open) return null
    const fc = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
    const lc = "block text-xs font-medium text-gray-600 mb-1"
    const h  = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const s  = (e) => { e.preventDefault(); onSubmit(form) }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
                <h2 className="text-xl font-bold mb-5">{isEdit ? 'Edit Position' : 'Create Position'}</h2>
                <form onSubmit={s} className="flex flex-col gap-4">
                    <div>
                        <label className={lc}>Job Title *</label>
                        <input name="title" value={form.title} onChange={h} required
                            placeholder="e.g. Senior Software Engineer" className={fc} />
                    </div>
                    <div>
                        <label className={lc}>Description</label>
                        <textarea name="description" value={form.description} onChange={h}
                            rows={2} placeholder="Role responsibilities…" className={fc} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={lc}>Level * <span className="text-gray-400">(1 = top)</span></label>
                            <input name="level" type="number" min="1" max="10" value={form.level} onChange={h} required className={fc} />
                        </div>
                        <div>
                            <label className={lc}>Department</label>
                            <select name="departmentID" value={form.departmentID} onChange={h} className={fc}>
                                <option value="">— Any / Cross-dept —</option>
                                {(departments || []).map(d => (
                                    <option key={d._id} value={d._id}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={lc}>Reports To</label>
                        <select name="reportsToID" value={form.reportsToID} onChange={h} className={fc}>
                            <option value="">— Root (no parent) —</option>
                            {(positions || [])
                                .filter(p => !isEdit || p._id !== initial?._id)
                                .sort((a, b) => a.level - b.level)
                                .map(p => (
                                    <option key={p._id} value={p._id}>
                                        L{p.level} · {p.title}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700">
                            {isEdit ? 'Save Changes' : 'Create Position'}
                        </button>
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

    const fc = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
    const lc = "block text-xs font-medium text-gray-600 mb-1"

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4">
                <h2 className="text-xl font-bold mb-1">Assign Employee</h2>
                <p className="text-sm text-gray-500 mb-4">Position: <strong>{position.title}</strong> (Level {position.level})</p>
                <div className="flex flex-col gap-4">
                    <div>
                        <label className={lc}>Employee *</label>
                        <select value={employeeID} onChange={e => setEmployeeID(e.target.value)} className={fc}>
                            <option value="">Select employee…</option>
                            {available.map(e => (
                                <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>
                            ))}
                        </select>
                        {available.length === 0 && (
                            <p className="text-xs text-gray-400 mt-1">All employees are already in this position.</p>
                        )}
                    </div>
                    <div>
                        <label className={lc}>Direct Manager <span className="text-gray-400">(optional)</span></label>
                        <select value={managerID} onChange={e => setManagerID(e.target.value)} className={fc}>
                            <option value="">— No manager assigned —</option>
                            {allPositionEmployees.filter(e => e._id !== employeeID).map(e => (
                                <option key={e._id} value={e._id}>{e.firstname} {e.lastname}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">Cancel</button>
                        <button
                            disabled={!employeeID}
                            onClick={() => onSubmit({ positionID: position._id, employeeID, managerID: managerID || undefined })}
                            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            Assign
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Recursive org tree node ──────────────────────────────────────────────────
const TreeNode = ({ node, onEdit, onAssign, onRemoveEmployee, depth = 0 }) => {
    const [expanded, setExpanded] = useState(true)
    const c = getLevelColor(node.level)
    const hasChildren = node.children?.length > 0

    return (
        <div className={`flex flex-col ${depth > 0 ? 'ms-8 border-l-2 border-gray-200 ps-4' : ''}`}>
            <div className={`rounded-xl border-2 ${c.border} ${c.bg} p-3 mb-3 flex flex-col gap-2`}>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge} ${c.text}`}>
                            L{node.level}
                        </span>
                        <span className={`font-bold text-sm ${c.text}`}>{node.title}</span>
                        {node.department?.name && (
                            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                {node.department.name}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => onAssign(node)}
                            className="px-2 py-1 text-xs border border-purple-300 text-purple-700 hover:bg-purple-100 rounded-md">
                            + Assign
                        </button>
                        <button onClick={() => onEdit(node)}
                            className="px-2 py-1 text-xs border border-gray-300 text-gray-600 hover:bg-white rounded-md">
                            Edit
                        </button>
                        {hasChildren && (
                            <button onClick={() => setExpanded(e => !e)}
                                className="px-2 py-1 text-xs border border-gray-300 text-gray-500 hover:bg-white rounded-md">
                                {expanded ? '▲' : '▼'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Employees in this position */}
                {node.employees?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-white/60">
                        {node.employees.map(emp => (
                            <div key={emp._id} className="flex items-center gap-1.5 bg-white/80 border border-white rounded-lg px-2 py-1">
                                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                    {emp.firstname?.[0]?.toUpperCase()}
                                </div>
                                <span className="text-xs font-medium text-gray-700">{emp.firstname} {emp.lastname}</span>
                                <button
                                    onClick={() => onRemoveEmployee({ positionID: node._id, employeeID: emp._id })}
                                    className="text-gray-300 hover:text-red-500 text-sm leading-none ml-0.5">
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {node.employees?.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No employees assigned</p>
                )}
            </div>

            {/* Children */}
            {expanded && hasChildren && node.children.map(child => (
                <TreeNode
                    key={child._id}
                    node={child}
                    onEdit={onEdit}
                    onAssign={onAssign}
                    onRemoveEmployee={onRemoveEmployee}
                    depth={depth + 1}
                />
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

    const [view,         setView]         = useState('tree')     // 'tree' | 'list'
    const [createOpen,   setCreateOpen]   = useState(false)
    const [editTarget,   setEditTarget]   = useState(null)
    const [assignTarget, setAssignTarget] = useState(null)
    const [search,       setSearch]       = useState('')

    useEffect(() => {
        dispatch(HandleGetOrgTree())
        dispatch(HandleGetHREmployees({ apiroute: 'GETALL' }))
    }, [])

    useEffect(() => {
        if (state.fetchData) dispatch(HandleGetOrgTree())
    }, [state.fetchData])

    const handleCreate = (form) => {
        dispatch(HandleCreatePosition(form))
        setCreateOpen(false)
    }

    const handleEdit = (form) => {
        dispatch(HandleUpdatePosition({ positionID: editTarget._id, ...form }))
        setEditTarget(null)
    }

    const handleDelete = (positionID) => {
        if (window.confirm('Delete this position? Employees will be unassigned.')) {
            dispatch(HandleDeletePosition(positionID))
        }
    }

    const handleAssign = (payload) => {
        dispatch(HandleAssignEmployee(payload))
        setAssignTarget(null)
    }

    const handleRemoveEmployee = (payload) => {
        dispatch(HandleRemoveEmployee(payload))
    }

    // All employees from all positions (for manager selector)
    const allPositionEmployees = (empState.data || [])

    const departments = deptState?.data || []

    const filteredPositions = (state.positions || []).filter(p =>
        !search || p.title.toLowerCase().includes(search.toLowerCase())
    )

    if (state.isLoading && !state.positions.length) return <Loading />

    return (
        <div className="org-structure-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5">

            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Org Structure</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Define positions, reporting lines, and place employees in the hierarchy
                    </p>
                </div>
                <button onClick={() => setCreateOpen(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg">
                    + New Position
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total Positions',     value: state.summary.totalPositions,      color: 'border-gray-200   bg-gray-50'    },
                    { label: 'Filled Positions',    value: state.summary.filledPositions,     color: 'border-purple-200 bg-purple-50'  },
                    { label: 'Employees Placed',    value: state.summary.totalEmployeesPlaced, color: 'border-blue-200   bg-blue-50'    },
                ].map(c => (
                    <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
                        <p className="text-2xl font-bold">{c.value ?? 0}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* View tabs + search */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {['tree', 'list'].map(v => (
                        <button key={v} onClick={() => setView(v)}
                            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${view === v ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                            {v === 'tree' ? '🌳 Tree View' : '📋 List View'}
                        </button>
                    ))}
                </div>
                {view === 'list' && (
                    <input type="text" placeholder="Search positions…"
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-purple-300" />
                )}
            </div>

            {/* Error */}
            {state.error.status && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {state.error.message}
                </div>
            )}

            {/* ── Tree view ── */}
            {view === 'tree' && (
                <div className="flex-1 overflow-auto">
                    {state.tree.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                            <p className="text-4xl">🏢</p>
                            <p className="text-sm">No positions yet. Create one to start building your org chart.</p>
                        </div>
                    ) : (
                        state.tree.map(node => (
                            <TreeNode
                                key={node._id}
                                node={node}
                                onEdit={setEditTarget}
                                onAssign={setAssignTarget}
                                onRemoveEmployee={handleRemoveEmployee}
                            />
                        ))
                    )}
                </div>
            )}

            {/* ── List view ── */}
            {view === 'list' && (
                <div className="flex flex-col gap-2 overflow-auto flex-1">
                    <div className="grid grid-cols-6 bg-gray-100 rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0">
                        <span>Level</span>
                        <span className="col-span-2">Title</span>
                        <span>Department</span>
                        <span>Reports To</span>
                        <span>Actions</span>
                    </div>

                    {filteredPositions.length === 0 ? (
                        <div className="text-center text-gray-400 py-16">No positions found.</div>
                    ) : filteredPositions
                        .sort((a, b) => a.level - b.level || a.title.localeCompare(b.title))
                        .map(p => {
                            const c = getLevelColor(p.level)
                            return (
                                <div key={p._id} className="grid grid-cols-6 bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm items-center hover:bg-gray-50 transition-all">
                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${c.badge} ${c.text} w-fit`}>
                                        L{p.level}
                                    </span>
                                    <div className="col-span-2">
                                        <p className="font-medium text-gray-800">{p.title}</p>
                                        <p className="text-xs text-gray-400">
                                            {p.employees?.length || 0} employee{p.employees?.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <span className="text-gray-500 text-xs">{p.department?.name || '—'}</span>
                                    <span className="text-gray-500 text-xs truncate">{p.reportsTo?.title || '— Root —'}</span>
                                    <div className="flex gap-1.5">
                                        <button onClick={() => setAssignTarget(p)}
                                            className="px-2 py-1 text-xs border border-purple-300 text-purple-700 hover:bg-purple-50 rounded-md">
                                            Assign
                                        </button>
                                        <button onClick={() => setEditTarget(p)}
                                            className="px-2 py-1 text-xs border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(p._id)}
                                            className="px-2 py-1 text-xs border border-red-300 text-red-600 hover:bg-red-50 rounded-md">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            )}

            {/* Dialogs */}
            <PositionDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
                positions={state.positions}
                departments={departments}
            />
            <PositionDialog
                open={!!editTarget}
                onClose={() => setEditTarget(null)}
                onSubmit={handleEdit}
                positions={state.positions}
                departments={departments}
                initial={editTarget}
            />
            <AssignDialog
                open={!!assignTarget}
                onClose={() => setAssignTarget(null)}
                onSubmit={handleAssign}
                position={assignTarget}
                employees={empState.data || []}
                allPositionEmployees={allPositionEmployees}
            />
        </div>
    )
}