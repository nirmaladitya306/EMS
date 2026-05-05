import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    HandleGetAllRoles,
    HandleCreateRole,
    HandleUpdateRole,
    HandleDeleteRole,
    HandleGetHRAssignments,
    HandleAssignRole,
    HandleGetPermissionCatalogue,
    HandleCreateDrift,
    HandleGetRoleDrifts,
} from '../../../redux/Thunks/RBACThunk'
import { Loading } from '../../../components/common/loading'
import { PageShell, PageHeader } from '../../../components/common/Dashboard/PageShell.jsx'

// ─── Local Dark Mode Overrides ────────────────────────────────────────────────
const styles = `
  [data-theme='dark'] {
    --rbac-bg: #18181b;
    --rbac-border: #27272a;
    --rbac-text-main: #fafafa;
    --rbac-text-muted: #a1a1aa;
    --rbac-text-faint: #71717a;
    
    --rbac-input-bg: #09090b;
    --rbac-panel-bg: #18181b;
    --rbac-hover: rgba(255,255,255,0.04);
    
    --rbac-active-bg: rgba(99,102,241,0.15);
    --rbac-active-border: rgba(99,102,241,0.4);
    --rbac-active-text: #818cf8;
    
    --rbac-th-bg: rgba(255,255,255,0.05);
    --rbac-row-alt: rgba(255,255,255,0.02);
    --rbac-modal-bg: #18181b;
  }

  .rbac-text-main { color: var(--rbac-text-main, #1f2937); }
  .rbac-text-muted { color: var(--rbac-text-muted, #6b7280); }
  .rbac-text-faint { color: var(--rbac-text-faint, #9ca3af); }

  .rbac-panel { background: var(--rbac-panel-bg, #ffffff); border-color: var(--rbac-border, #e5e7eb); }
  
  .rbac-card { 
    background: var(--rbac-panel-bg, #ffffff); 
    border-color: var(--rbac-border, #e5e7eb); 
    transition: all 0.2s; 
  }
  .rbac-card:hover { border-color: var(--rbac-active-border, #a5b4fc); background: var(--rbac-hover, #eef2ff); }
  .rbac-card.active { border-color: var(--rbac-active-border, #818cf8); background: var(--rbac-active-bg, #eef2ff); }

  .rbac-input { 
    background: var(--rbac-input-bg, #ffffff); 
    border: 1px solid var(--rbac-border, #d1d5db); 
    color: var(--rbac-text-main, #1f2937); 
  }
  .rbac-input:focus { border-color: rgba(99,102,241,0.5); outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
  .rbac-input:disabled { opacity: 0.6; cursor: not-allowed; }

  .rbac-tab { border-bottom: 2px solid transparent; color: var(--rbac-text-muted, #6b7280); }
  .rbac-tab:hover { color: var(--rbac-text-main, #374151); }
  .rbac-tab.active { border-color: var(--rbac-active-text, #4f46e5); color: var(--rbac-active-text, #4f46e5); }

  /* Permissions styling */
  .rbac-perm-group { border: 1px solid var(--rbac-border, #e5e7eb); border-radius: 0.75rem; overflow: hidden; }
  .rbac-perm-header { color: var(--rbac-text-main, #111827); transition: background 0.2s; }
  .rbac-perm-header-all { background: var(--rbac-active-bg, #eef2ff); }
  .rbac-perm-header-some { background: var(--rbac-hover, #f5f3ff); }
  .rbac-perm-header-none { background: var(--rbac-th-bg, #f9fafb); }
  .rbac-perm-header:hover:not(:disabled) { background: var(--rbac-hover, #eef2ff); }
  
  .rbac-perm-item { color: var(--rbac-text-main, #111827); transition: background 0.2s; }
  .rbac-perm-item:hover:not(.disabled) { background: var(--rbac-hover, #f3f4f6); }
  .rbac-perm-item.selected { background: var(--rbac-active-bg, #e0e7ff); }

  .rbac-th { background: var(--rbac-th-bg, #f9fafb); color: var(--rbac-text-muted, #6b7280); border-bottom: 1px solid var(--rbac-border, #e5e7eb); }
  .rbac-row { background: var(--rbac-panel-bg, #ffffff); border-bottom: 1px solid var(--rbac-border, #f3f4f6); }
  .rbac-row-alt { background: var(--rbac-row-alt, #f9fafb); border-bottom: 1px solid var(--rbac-border, #f3f4f6); }
  
  .rbac-sys-badge { background: var(--rbac-active-bg, #dbeafe); color: var(--rbac-active-text, #1d4ed8); border: 1px solid var(--rbac-active-border, #bfdbfe); }
  .rbac-modal { background: var(--rbac-modal-bg, #ffffff); border: 1px solid var(--rbac-border, transparent); }
`

const label = (p) => p.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' › ')

const SystemBadge = () => (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold rbac-sys-badge">System</span>
)

const PermCount = ({ role }) => (
    <span className="text-xs rbac-text-faint">{role.permissions.length} permissions</span>
)

const ErrorBanner = ({ message, onDismiss }) =>
    message ? (
        <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', color: '#ef4444' }} className="text-sm rounded-xl px-4 py-3 flex justify-between items-center">
            <span>{message}</span>
            <button onClick={onDismiss} className="hover:opacity-70 text-lg leading-none ml-4">×</button>
        </div>
    ) : null

// ─── Initiate Drift Modal ─────────────────────────────────────────────────────
const InitiateDriftModal = ({ hrUser, roles, onClose, onSave }) => {
    const [roleID, setRoleID] = useState('')
    const [reason, setReason] = useState('')
    const [expiresAt, setExpiresAt] = useState('')
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        await onSave({ hrUserID: hrUser._id, driftRoleID: roleID, reason, expiresAt })
        setSaving(false)
    }

    // Don't let them select their existing base role or system roles
    const selectableRoles = roles.filter(r => r._id !== hrUser.rbacRole?._id && !r.isSystem)

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 rbac-modal">
                <h2 className="text-xl font-bold mb-1 rbac-text-main">Grant Temporary Access</h2>
                <p className="text-sm mb-5 rbac-text-muted">
                    Elevate <strong className="rbac-text-main">{hrUser.firstname} {hrUser.lastname}</strong>'s privileges for a limited time.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold rbac-text-muted mb-1 uppercase">Temporary Role</label>
                        <select 
                            required value={roleID} onChange={e => setRoleID(e.target.value)}
                            className="w-full rounded-lg px-3 py-2 text-sm rbac-input"
                        >
                            <option value="">— Select a role —</option>
                            {selectableRoles.map(r => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold rbac-text-muted mb-1 uppercase">Reason for Access</label>
                        <input 
                            required type="text" value={reason} onChange={e => setReason(e.target.value)}
                            placeholder="e.g. Covering for Sarah's maternity leave"
                            className="w-full rounded-lg px-3 py-2 text-sm rbac-input"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold rbac-text-muted mb-1 uppercase">Expiry Date</label>
                        <input 
                            required type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full rounded-lg px-3 py-2 text-sm rbac-input"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t" style={{ borderColor: 'var(--rbac-border)' }}>
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:opacity-70 rbac-text-main" style={{ borderColor: 'var(--rbac-border)' }}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving || !roleID || !expiresAt} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg font-medium shadow-sm">
                            {saving ? 'Processing...' : 'Grant Access'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const PermissionPicker = ({ groups = {}, selected = [], onChange, disabled }) => {
    const groupNames = Object.keys(groups)
    const toggleAll = (perms) => {
        const allIn = perms.every(p => selected.includes(p))
        if (allIn) onChange(selected.filter(s => !perms.includes(s)))
        else onChange([...new Set([...selected, ...perms])])
    }
    const toggle = (perm) => {
        if (selected.includes(perm)) onChange(selected.filter(p => p !== perm))
        else onChange([...selected, perm])
    }
    return (
        <div className="flex flex-col gap-4">
            {groupNames.length === 0 && <div className="rbac-text-muted">No permissions available</div>}
            {groupNames.map(groupName => {
                const perms = groups[groupName] || []
                const allIn = perms.length > 0 && perms.every(p => selected.includes(p))
                const someIn = perms.some(p => selected.includes(p))
                return (
                    <div key={groupName} className="rbac-perm-group">
                        <button type="button" disabled={disabled} onClick={() => toggleAll(perms)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rbac-perm-header ${allIn ? 'rbac-perm-header-all' : someIn ? 'rbac-perm-header-some' : 'rbac-perm-header-none'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <span>{groupName}</span>
                            <span className="text-xs opacity-70 font-medium">
                                {perms.filter(p => selected.includes(p)).length}/{perms.length}
                            </span>
                        </button>
                        <div className="flex flex-col gap-1 p-2 rbac-panel">
                            {perms.map((perm) => (
                                <label key={perm} className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md rbac-perm-item ${selected.includes(perm) ? 'selected' : ''} ${disabled ? 'disabled opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    <input type="checkbox" disabled={disabled} checked={selected.includes(perm)} onChange={() => toggle(perm)} className="accent-indigo-600 w-4 h-4" />
                                    <span className="font-medium" style={{ fontSize: "13px" }}>{perm.split('.').join(' → ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

const RoleForm = ({ initial, groups, onSave, onCancel, saving, error }) => {
    const [name,        setName]        = useState(initial?.name        || '')
    const [description, setDescription] = useState(initial?.description || '')
    const [permissions, setPermissions] = useState(initial?.permissions || [])

    const isEdit   = !!initial?._id
    const isSystem = initial?.isSystem

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!name.trim()) return
        onSave({ name: name.trim(), description, permissions })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold rbac-text-muted mb-1 uppercase tracking-wide">Role Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} disabled={isSystem} required placeholder="e.g. Recruiter, Finance HR" className="w-full rounded-lg px-3 py-2 text-sm rbac-input" />
                </div>
                <div>
                    <label className="block text-xs font-semibold rbac-text-muted mb-1 uppercase tracking-wide">Description</label>
                    <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What does this role do?" className="w-full rounded-lg px-3 py-2 text-sm rbac-input" />
                </div>
            </div>

            <div className="flex-1 overflow-auto pb-16">
                <label className="block text-xs font-semibold rbac-text-muted mb-2 mt-2 uppercase tracking-wide">
                    Permissions — {permissions.length} selected
                </label>
                {Object.keys(groups).length > 0 ? (
                    <PermissionPicker groups={groups} selected={permissions} onChange={setPermissions} disabled={isSystem} />
                ) : (
                    <div className="text-sm text-red-400">No permissions loaded (check backend / API)</div>
                )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="absolute bottom-0 left-0 right-0 flex gap-3 justify-end pt-3 pb-1 rbac-panel border-t mt-4" style={{ borderTop: '1px solid var(--rbac-border)' }}>
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border rounded-lg hover:opacity-70 rbac-text-main" style={{ borderColor: 'var(--rbac-border)' }}>Cancel</button>
                {!isSystem && (
                    <button type="submit" disabled={saving || !name.trim()} className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg shadow-sm">
                        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Role'}
                    </button>
                )}
            </div>
        </form>
    )
}

const RoleCard = ({ role, isSelected, onSelect, onEdit, onDelete }) => (
    <div onClick={() => onSelect(role)} className={`border rounded-xl p-4 cursor-pointer rbac-card ${isSelected ? 'active shadow-sm' : ''}`}>
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold rbac-text-main text-sm truncate">{role.name}</p>
                    {role.isSystem && <SystemBadge />}
                </div>
                {role.description && <p className="text-xs rbac-text-muted mt-0.5 line-clamp-1">{role.description}</p>}
            </div>
            <PermCount role={role} />
        </div>
        <div className="flex gap-2 mt-3 justify-end">
            <button onClick={e => { e.stopPropagation(); onEdit(role) }} className="px-3 py-1 text-xs border rounded-lg hover:opacity-70 transition-opacity rbac-text-main" style={{ borderColor: 'var(--rbac-border)' }}>Edit</button>
            {!role.isSystem && (
                <button onClick={e => { e.stopPropagation(); onDelete(role) }} className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50/20 transition-colors">Delete</button>
            )}
        </div>
    </div>
)

const AssignmentTable = ({ hrList, roles, onAssign, assigning, onInitDrift }) => {
    const [search, setSearch] = useState('')

    const filtered = hrList.filter(hr => {
        const name = `${hr.firstname} ${hr.lastname} ${hr.email}`.toLowerCase()
        return name.includes(search.toLowerCase())
    })

    return (
        <div className="flex flex-col gap-3">
            <input type="text" placeholder="Search HR users…" value={search} onChange={e => setSearch(e.target.value)} className="rounded-lg px-3 py-2 text-sm w-64 rbac-input" />
            <div className="flex flex-col gap-0 border rounded-xl overflow-hidden" style={{ borderColor: 'var(--rbac-border)' }}>
                <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide rbac-th">
                    <span className="col-span-4">HR User</span>
                    <span className="col-span-3">Email</span>
                    <span className="col-span-3">Assigned Role</span>
                    <span className="col-span-2 text-right">Change</span>
                </div>
                {filtered.length === 0 && <div className="text-center py-8 text-sm rbac-text-muted">No HR users found.</div>}
                {filtered.map((hr, i) => (
                    <div key={hr._id} className={`grid grid-cols-12 px-4 py-3 text-sm items-center ${i % 2 === 0 ? 'rbac-row' : 'rbac-row-alt'}`}>
                        <div className="col-span-4">
                            <p className="font-medium rbac-text-main">{hr.firstname} {hr.lastname}</p>
                            {!hr.rbacRole && <span className="text-xs font-medium" style={{ color: 'var(--rbac-active-text)' }}>Unrestricted</span>}
                        </div>
                        <p className="col-span-3 text-xs truncate pr-2 rbac-text-muted">{hr.email}</p>
                        <div className="col-span-3">
                            {hr.rbacRole ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold rbac-sys-badge">
                                    {hr.rbacRole.isSystem && '⭐ '}{hr.rbacRole.name}
                                </span>
                            ) : (
                                <span className="text-xs italic rbac-text-faint">No role (full access)</span>
                            )}
                        </div>
                        <div className="col-span-2 flex justify-end gap-2 items-center">
                            <select
                                disabled={assigning === hr._id} value={hr.rbacRole?._id || ''}
                                onChange={e => onAssign(hr._id, e.target.value || null)}
                                className="rounded-lg px-2 py-1 text-xs max-w-[130px] rbac-input"
                            >
                                <option value="">— Full Access —</option>
                                {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                            </select>
                            
                            {/* THE NEW DRIFT BUTTON */}
                            <button 
                                onClick={() => onInitDrift(hr)}
                                title="Grant Temporary Access (Drift)"
                                className="rounded-lg px-2 py-1 text-xs border hover:opacity-70 transition-opacity"
                                style={{ borderColor: 'var(--rbac-active-border)', background: 'var(--rbac-active-bg)', color: 'var(--rbac-active-text)' }}
                            >
                                ⏳
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const RBACPage = () => {
    const dispatch = useDispatch()
    const state = useSelector(s => s.RBACReducer) || { roles: [], catalogue: {}, hrAssignments: [], error: {} }

    const [tab,           setTab]           = useState('roles')
    const [formMode,      setFormMode]      = useState(null)
    const [selectedRole,  setSelectedRole]  = useState(null)
    const [saving,        setSaving]        = useState(false)
    const [assigning,     setAssigning]     = useState(null)
    const [formError,     setFormError]     = useState(null)
    const [globalError,   setGlobalError]   = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [driftModalUser,setDriftModalUser]= useState(null) // New State for Drift Modal

    useEffect(() => {
        dispatch(HandleGetAllRoles())
        dispatch(HandleGetHRAssignments())
        dispatch(HandleGetPermissionCatalogue())
    }, [dispatch])

    useEffect(() => {
        if (state.error?.status) setGlobalError(state.error.message)
    }, [state.error])

    const handleSaveRole = async (data) => {
        setSaving(true); setFormError(null)
        try {
            let action = formMode === 'create' ? await dispatch(HandleCreateRole(data)) : await dispatch(HandleUpdateRole({ roleID: formMode._id, ...data }))
            if (action.payload?.success === false) setFormError(action.payload.message)
            else setFormMode(null)
        } finally { setSaving(false) }
    }

    const handleDeleteRole = async (role) => {
        const action = await dispatch(HandleDeleteRole(role._id))
        if (action.payload?.success === false) setGlobalError(action.payload.message)
        setConfirmDelete(null)
        if (selectedRole?._id === role._id) setSelectedRole(null)
    }

    const handleAssign = async (hrID, roleID) => {
        setAssigning(hrID)
        await dispatch(HandleAssignRole({ hrID, roleID }))
        setAssigning(null)
    }

    const handleCreateDrift = async (driftData) => {
        const res = await dispatch(HandleCreateDrift(driftData))
        if (res.payload?.success) {
            setDriftModalUser(null)
            dispatch(HandleGetRoleDrifts())
        } else {
            setGlobalError(res.payload?.message || 'Failed to grant temporary access')
        }
    }

    if (state.isLoading && state.roles.length === 0) return <Loading />

    const groups = state.catalogue?.groups || {}
    const roles  = state.roles || []

    return (
        <PageShell>
            <style>{styles}</style>
            
            <PageHeader eyebrow="Security" title="Role-Based Access Control" subtitle="Define roles, assign permissions, and control what each HR user can access">
                {tab === 'roles' && !formMode && (
                    <button onClick={() => { setFormMode('create'); setFormError(null) }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm">
                        + New Role
                    </button>
                )}
            </PageHeader>

            <ErrorBanner message={globalError} onDismiss={() => setGlobalError(null)} />

            <div className="flex gap-1 border-b mb-5" style={{ borderColor: 'var(--rbac-border)' }}>
                {[
                    { key: 'roles',  label: `Roles (${roles.length})` },
                    { key: 'assign', label: `Assign to HR Users (${state.hrAssignments.length})` },
                ].map(t => (
                    <button key={t.key} onClick={() => { setTab(t.key); setFormMode(null) }} className={`px-5 py-3 text-sm font-medium transition-colors rbac-tab ${tab === t.key ? 'active' : ''}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'roles' && (
                <>
                    {formMode && (
                        <div className="border rounded-2xl shadow-sm flex flex-col overflow-hidden rbac-panel" style={{ height: 'calc(100vh - 220px)' }}>
                            <div className="px-6 pt-5 pb-3 border-b shrink-0" style={{ borderColor: 'var(--rbac-border)' }}>
                                <h2 className="text-lg font-bold rbac-text-main">{formMode === 'create' ? 'Create New Role' : `Edit: ${formMode.name}`}</h2>
                            </div>
                            <div className="flex-1 px-6 py-4 overflow-hidden relative">
                                <RoleForm initial={formMode === 'create' ? null : formMode} groups={groups} onSave={handleSaveRole} onCancel={() => setFormMode(null)} saving={saving} error={formError} />
                            </div>
                        </div>
                    )}
                    {!formMode && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            <div className="lg:col-span-1 flex flex-col gap-3">
                                {roles.length === 0 ? <div className="text-center py-16 border-2 border-dashed rounded-xl text-sm rbac-text-muted" style={{ borderColor: 'var(--rbac-border)' }}>No roles yet. Create one to get started.</div> : roles.map(role => (
                                    <RoleCard key={role._id} role={role} isSelected={selectedRole?._id === role._id} onSelect={setSelectedRole} onEdit={r => { setFormMode(r); setFormError(null) }} onDelete={setConfirmDelete} />
                                ))}
                            </div>
                            <div className="lg:col-span-2">
                                {!selectedRole ? (
                                    <div className="flex flex-col items-center justify-center h-full py-24 gap-2 border-2 border-dashed rounded-xl rbac-text-faint" style={{ borderColor: 'var(--rbac-border)' }}>
                                        <span className="text-4xl">🔐</span><p className="font-medium">Select a role to view its permissions</p>
                                    </div>
                                ) : (
                                    <div className="border rounded-2xl p-5 flex flex-col gap-4 rbac-panel shadow-sm">
                                        <div className="flex items-center gap-3 border-b pb-3" style={{ borderColor: 'var(--rbac-border)' }}>
                                            <div>
                                                <div className="flex items-center gap-2"><h3 className="text-lg font-bold rbac-text-main">{selectedRole.name}</h3>{selectedRole.isSystem && <SystemBadge />}</div>
                                                {selectedRole.description && <p className="text-sm mt-0.5 rbac-text-muted">{selectedRole.description}</p>}
                                            </div>
                                            <span className="ml-auto text-sm font-semibold" style={{ color: 'var(--rbac-active-text)' }}>{selectedRole.permissions.length} / {state.catalogue.all?.length || 0} permissions</span>
                                        </div>
                                        <div className="flex flex-col gap-4 overflow-auto max-h-[500px] pr-1">
                                            {Object.entries(groups).map(([groupName, rawPerms]) => {
                                                const perms = Array.isArray(rawPerms) ? rawPerms : Object.values(rawPerms || {})
                                                const granted = perms.filter(p => selectedRole.permissions.includes(p))
                                                if (granted.length === 0) return null
                                                return (
                                                    <div key={groupName}>
                                                        <p className="text-xs font-semibold uppercase tracking-wide mb-2 rbac-text-faint">{groupName}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {granted.map(p => <span key={p} className="px-3 py-1.5 rounded-md text-xs font-medium rbac-sys-badge">{typeof p === "string" ? label(p) : ""}</span>)}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {selectedRole.permissions.length === 0 && <p className="text-sm italic rbac-text-faint">This role has no permissions assigned yet.</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {tab === 'assign' && (
                <div className="border rounded-2xl p-5 rbac-panel shadow-sm">
                    <div className="mb-4">
                        <h2 className="text-base font-bold rbac-text-main">Assign Roles to HR Users</h2>
                        <p className="text-sm mt-0.5 rbac-text-muted">HR users without a role have unrestricted access to all modules.</p>
                    </div>
                    <AssignmentTable hrList={state.hrAssignments} roles={roles} onAssign={handleAssign} assigning={assigning} onInitDrift={setDriftModalUser} />
                </div>
            )}

            {/* Delete Modal */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 rbac-modal">
                        <h2 className="text-lg font-bold mb-2 rbac-text-main">Delete Role</h2>
                        <p className="text-sm mb-1 rbac-text-muted">Are you sure you want to delete <strong className="rbac-text-main">{confirmDelete.name}</strong>?</p>
                        <p className="text-xs mb-5" style={{ color: '#ea580c' }}>All HR users assigned this role will lose it and revert to full access.</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm border rounded-lg hover:opacity-70 rbac-text-main" style={{ borderColor: 'var(--rbac-border)' }}>Cancel</button>
                            <button onClick={() => handleDeleteRole(confirmDelete)} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-sm">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Initiate Drift Modal */}
            {driftModalUser && (
                <InitiateDriftModal 
                    hrUser={driftModalUser} 
                    roles={roles} 
                    onClose={() => setDriftModalUser(null)} 
                    onSave={handleCreateDrift} 
                />
            )}
        </PageShell>
    )
}