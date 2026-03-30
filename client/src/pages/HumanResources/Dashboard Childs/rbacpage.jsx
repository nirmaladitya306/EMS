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
} from '../../../redux/Thunks/RBACThunk'
import { Loading } from '../../../components/common/loading'


// ─── Helpers ──────────────────────────────────────────────────────────────────
const label = (p) => p.split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' › ')

// ─── Small shared components ──────────────────────────────────────────────────
const SystemBadge = () => (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">System</span>
)

const PermCount = ({ role }) => (
    <span className="text-xs text-gray-400">{role.permissions.length} permissions</span>
)

const ErrorBanner = ({ message, onDismiss }) =>
    message ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex justify-between items-center">
            <span>{message}</span>
            <button onClick={onDismiss} className="text-red-400 hover:text-red-600 text-lg leading-none ml-4">×</button>
        </div>
    ) : null

// ─── Permission picker (grouped checkboxes) ───────────────────────────────────
const PermissionPicker = ({ groups = {}, selected = [], onChange, disabled }) => {

    const groupNames = Object.keys(groups)

    const toggleAll = (perms) => {
        const allIn = perms.every(p => selected.includes(p))

        if (allIn) {
            onChange(selected.filter(s => !perms.includes(s)))
        } else {
            onChange([...new Set([...selected, ...perms])])
        }
    }

    const toggle = (perm) => {
        if (selected.includes(perm)) {
            onChange(selected.filter(p => p !== perm))
        } else {
            onChange([...selected, perm])
        }
    }

    return (
        <div style={{ color: "black" }} className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1">

            {groupNames.length === 0 && (
                <div style={{ color: "gray" }}>
                    No permissions available
                </div>
            )}

            {groupNames.map(groupName => {

                const perms = groups[groupName] || []

                const allIn = perms.length > 0 && perms.every(p => selected.includes(p))
                const someIn = perms.some(p => selected.includes(p))

                return (
                    <div key={groupName} style={{ background: "#fff" }} className="border rounded-xl overflow-hidden">

                        {/* Group Header */}
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => toggleAll(perms)}
                            style={{ color: "black" }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold
                                ${allIn ? 'bg-indigo-50'
                                    : someIn ? 'bg-indigo-50/50'
                                    : 'bg-gray-50'}
                                ${disabled ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:bg-indigo-50 cursor-pointer'}`}
                        >
                            <span>{groupName}</span>

                            <span>
                                {perms.filter(p => selected.includes(p)).length}/{perms.length}
                            </span>
                        </button>

                        {/* Permissions */}
                        <div className="flex flex-col gap-2 p-2">

                            {perms.map((perm) => (
                                <label
                                    key={perm}
                                    style={{
                                        backgroundColor: "white",
                                        color: "black",
                                        minHeight: "36px",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                    className={`gap-3 px-3 py-2 text-sm rounded-md
                                        ${selected.includes(perm)
                                            ? 'bg-indigo-100'
                                            : 'hover:bg-gray-100'}
                                        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <input
                                        type="checkbox"
                                        disabled={disabled}
                                        checked={selected.includes(perm)}
                                        onChange={() => toggle(perm)}
                                        className="accent-indigo-600 w-4 h-4"
                                    />

                                    <span
                                        style={{
                                            color: "black",
                                            fontSize: "14px",
                                            fontWeight: 500
                                        }}
                                    >
                                        {perm.split('.').join(' → ')}
                                    </span>
                                </label>
                            ))}

                        </div>
                    </div>
                )
            })}
        </div>
    )
}
// ─── Role Form (create / edit) ────────────────────────────────────────────────
const RoleForm = ({ initial, groups, onSave, onCancel, saving, error }) => {
    const [name,        setName]        = useState(initial?.name        || '')
    const [description, setDescription] = useState(initial?.description || '')
    const [permissions, setPermissions] = useState(initial?.permissions || [])

    const isEdit    = !!initial?._id
    const isSystem  = initial?.isSystem

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!name.trim()) return
        onSave({ name: name.trim(), description, permissions })
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Role Name *</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        disabled={isSystem}
                        required
                        placeholder="e.g. Recruiter, Finance HR"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Description</label>
                    <input
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="What does this role do?"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                    Permissions — {permissions.length} selected
                </label>
                {Object.keys(groups).length > 0 ? (
                    <PermissionPicker
                    groups={groups}
                    selected={permissions}
                    onChange={setPermissions}
                    disabled={isSystem}
    />
                ) : (
                <div className="text-sm text-red-400">
                        No permissions loaded (check backend / API)
                </div>
            )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={onCancel}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                </button>
                {!isSystem && (
                    <button type="submit" disabled={saving || !name.trim()}
                        className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg">
                        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Role'}
                    </button>
                )}
            </div>
        </form>
    )
}

// ─── Role card ────────────────────────────────────────────────────────────────
const RoleCard = ({ role, isSelected, onSelect, onEdit, onDelete }) => (
    <div
        onClick={() => onSelect(role)}
        className={`border rounded-xl p-4 cursor-pointer transition-all ${isSelected
            ? 'border-indigo-400 bg-indigo-50 shadow-sm'
            : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'}`}
    >
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-800 text-sm truncate">{role.name}</p>
                    {role.isSystem && <SystemBadge />}
                </div>
                {role.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{role.description}</p>
                )}
            </div>
            <PermCount role={role} />
        </div>
        <div className="flex gap-2 mt-3 justify-end">
            <button onClick={e => { e.stopPropagation(); onEdit(role) }}
                className="px-3 py-1 text-xs border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50">
                Edit
            </button>
            {!role.isSystem && (
                <button onClick={e => { e.stopPropagation(); onDelete(role) }}
                    className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                    Delete
                </button>
            )}
        </div>
    </div>
)

// ─── HR Assignment table ──────────────────────────────────────────────────────
const AssignmentTable = ({ hrList, roles, onAssign, assigning }) => {
    const [search, setSearch] = useState('')

    const filtered = hrList.filter(hr => {
        const name = `${hr.firstname} ${hr.lastname} ${hr.email}`.toLowerCase()
        return name.includes(search.toLowerCase())
    })

    return (
        <div className="flex flex-col gap-3">
            <input
                type="text"
                placeholder="Search HR users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
            />

            <div className="flex flex-col gap-0 border border-gray-200 rounded-xl overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    <span className="col-span-4">HR User</span>
                    <span className="col-span-3">Email</span>
                    <span className="col-span-3">Assigned Role</span>
                    <span className="col-span-2 text-right">Change</span>
                </div>

                {filtered.length === 0 && (
                    <div className="text-center text-gray-400 py-8 text-sm">No HR users found.</div>
                )}

                {filtered.map((hr, i) => (
                    <div key={hr._id}
                        className={`grid grid-cols-12 px-4 py-3 text-sm items-center ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>

                        {/* Name */}
                        <div className="col-span-4">
                            <p className="font-medium text-gray-800">
                                {hr.firstname} {hr.lastname}
                            </p>
                            {!hr.rbacRole && (
                                <span className="text-xs text-blue-600 font-medium">Unrestricted</span>
                            )}
                        </div>

                        {/* Email */}
                        <p className="col-span-3 text-gray-500 text-xs truncate pr-2">{hr.email}</p>

                        {/* Current role badge */}
                        <div className="col-span-3">
                            {hr.rbacRole ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                    {hr.rbacRole.isSystem && '⭐ '}
                                    {hr.rbacRole.name}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-400 italic">No role (full access)</span>
                            )}
                        </div>

                        {/* Role selector */}
                        <div className="col-span-2 flex justify-end">
                            <select
                                disabled={assigning === hr._id}
                                value={hr.rbacRole?._id || ''}
                                onChange={e => onAssign(hr._id, e.target.value || null)}
                                className="border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white max-w-[130px]"
                            >
                                <option value="">— Full Access —</option>
                                {roles.map(r => (
                                    <option key={r._id} value={r._id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ─── Main RBAC page ───────────────────────────────────────────────────────────
export const RBACPage = () => {
    const dispatch = useDispatch()
    const state = useSelector(s => s.RBACReducer) || {
    roles: [],
    catalogue: {},
    hrAssignments: [],
    error: {}
}

    const [tab,           setTab]           = useState('roles')    // 'roles' | 'assign'
    const [formMode,      setFormMode]      = useState(null)       // null | 'create' | role object
    const [selectedRole,  setSelectedRole]  = useState(null)
    const [saving,        setSaving]        = useState(false)
    const [assigning,     setAssigning]     = useState(null)       // hr._id being changed
    const [formError,     setFormError]     = useState(null)
    const [globalError,   setGlobalError]   = useState(null)
    const [confirmDelete, setConfirmDelete] = useState(null)

    // Load everything on mount
    useEffect(() => {
    dispatch(HandleGetAllRoles())
    dispatch(HandleGetHRAssignments())
    dispatch(HandleGetPermissionCatalogue())
}, [dispatch])

    useEffect(() => {
        if (state.error?.status) setGlobalError(state.error.message)
    }, [state.error])

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSaveRole = async (data) => {
        setSaving(true)
        setFormError(null)
        try {
            let action
            if (formMode === 'create') {
                action = await dispatch(HandleCreateRole(data))
            } else {
                action = await dispatch(HandleUpdateRole({ roleID: formMode._id, ...data }))
            }
            if (action.payload?.success === false) {
                setFormError(action.payload.message)
            } else {
                setFormMode(null)
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteRole = async (role) => {
        const action = await dispatch(HandleDeleteRole(role._id))
        if (action.payload?.success === false) {
            setGlobalError(action.payload.message)
        }
        setConfirmDelete(null)
        if (selectedRole?._id === role._id) setSelectedRole(null)
    }

    const handleAssign = async (hrID, roleID) => {
        setAssigning(hrID)
        await dispatch(HandleAssignRole({ hrID, roleID }))
        setAssigning(null)
    }

    // ── Loading state ─────────────────────────────────────────────────────────
    if (state.isLoading && state.roles.length === 0) return <Loading />

    const groups = state.catalogue?.groups || {}
    const allPermissions = state.catalogue?.all || []
    const roles  = state.roles || []

    return (
        <div className="rbac-page w-full mx-auto my-8 flex flex-col gap-6 h-[94%] pe-5 overflow-auto pb-10">

            {/* ── Header ── */}
            <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-bold">Role-Based Access Control</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Define roles, assign permissions, and control what each HR user can access
                    </p>
                </div>
                {tab === 'roles' && !formMode && (
                    <button
                        onClick={() => { setFormMode('create'); setFormError(null) }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
                    >
                        + New Role
                    </button>
                )}
            </div>

            {/* ── Global error ── */}
            <ErrorBanner message={globalError} onDismiss={() => setGlobalError(null)} />

            {/* ── Tabs ── */}
            <div className="flex gap-1 border-b border-gray-200">
                {[
                    { key: 'roles',  label: `Roles (${roles.length})` },
                    { key: 'assign', label: `Assign to HR Users (${state.hrAssignments.length})` },
                ].map(t => (
                    <button key={t.key} onClick={() => { setTab(t.key); setFormMode(null) }}
                        className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors
                            ${tab === t.key
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Roles tab ── */}
            {tab === 'roles' && (
                <>
                    {/* Form panel */}
                    {formMode && (
                        <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold mb-4 text-gray-800">
                                {formMode === 'create' ? 'Create New Role' : `Edit: ${formMode.name}`}
                            </h2>
                            <RoleForm
                                initial={formMode === 'create' ? null : formMode}
                                groups={groups}
                                onSave={handleSaveRole}
                                onCancel={() => setFormMode(null)}
                                saving={saving}
                                error={formError}
                            />
                        </div>
                    )}

                    {/* Roles grid + detail panel */}
                    {!formMode && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                            {/* Role cards */}
                            <div className="lg:col-span-1 flex flex-col gap-3">
                                {roles.length === 0 ? (
                                    <div className="text-center text-gray-400 py-16 border-2 border-dashed border-gray-200 rounded-xl text-sm">
                                        No roles yet. Create one to get started.
                                    </div>
                                ) : roles.map(role => (
                                    <RoleCard
                                        key={role._id}
                                        role={role}
                                        isSelected={selectedRole?._id === role._id}
                                        onSelect={setSelectedRole}
                                        onEdit={r => { setFormMode(r); setFormError(null) }}
                                        onDelete={setConfirmDelete}
                                    />
                                ))}
                            </div>

                            {/* Permission detail */}
                            <div className="lg:col-span-2">
                                {!selectedRole ? (
                                    <div className="flex flex-col items-center justify-center h-full py-24 text-gray-400 gap-2 border-2 border-dashed border-gray-200 rounded-xl">
                                        <span className="text-4xl">🔐</span>
                                        <p className="font-medium">Select a role to view its permissions</p>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
                                        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-bold text-gray-800">{selectedRole.name}</h3>
                                                    {selectedRole.isSystem && <SystemBadge />}
                                                </div>
                                                {selectedRole.description && (
                                                    <p className="text-sm text-gray-500 mt-0.5">{selectedRole.description}</p>
                                                )}
                                            </div>
                                            <span className="ml-auto text-sm font-semibold text-indigo-600">
                                                {selectedRole.permissions.length} / {state.catalogue.all?.length || 0} permissions
                                            </span>
                                        </div>

                                        {/* Permission list grouped */}
                                        <div className="flex flex-col gap-3 overflow-auto max-h-[500px] pr-1">
                                            {Object.entries(groups).map(([groupName, rawPerms]) => {

    const perms = Array.isArray(rawPerms)
        ? rawPerms
        : Object.values(rawPerms || {})

    const granted = perms.filter(p => selectedRole.permissions.includes(p))
                                                if (granted.length === 0) return null
                                                return (
                                                    <div key={groupName}>
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{groupName}</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {granted.map(p => (
                                                                <span key={p}
                                                                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                                    {typeof p === "string" ? label(p) : ""}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {selectedRole.permissions.length === 0 && (
                                                <p className="text-sm text-gray-400 italic">This role has no permissions assigned yet.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Assign tab ── */}
            {tab === 'assign' && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <div className="mb-4">
                        <h2 className="text-base font-bold text-gray-800">Assign Roles to HR Users</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            HR users without a role have unrestricted access to all modules.
                        </p>
                    </div>
                    <AssignmentTable
                        hrList={state.hrAssignments}
                        roles={roles}
                        onAssign={handleAssign}
                        assigning={assigning}
                    />
                </div>
            )}

            {/* ── Delete confirm modal ── */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h2 className="text-lg font-bold mb-2">Delete Role</h2>
                        <p className="text-sm text-gray-500 mb-1">
                            Are you sure you want to delete <strong>{confirmDelete.name}</strong>?
                        </p>
                        <p className="text-xs text-amber-600 mb-5">
                            All HR users assigned this role will lose it and revert to full access.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={() => handleDeleteRole(confirmDelete)}
                                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}