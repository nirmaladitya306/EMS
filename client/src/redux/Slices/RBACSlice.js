import { createSlice } from '@reduxjs/toolkit'
import {
    HandleGetMyPermissions,
    HandleGetPermissionCatalogue,
    HandleGetAllRoles,
    HandleCreateRole,
    HandleUpdateRole,
    HandleDeleteRole,
    HandleGetHRAssignments,
    HandleAssignRole,
} from '../Thunks/RBACThunk'

const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
const rejected = (state, action) => {
    state.isLoading = false
    state.error = { status: true, message: action.payload?.message || 'Something went wrong' }
}

const RBACSlice = createSlice({
    name: 'RBAC',
    initialState: {
        // Current HR user's permissions (loaded on login)
        myPermissions:    null,   // null = unrestricted (super-admin)
        myRoleName:       null,
        isUnrestricted:   true,   // true until proven otherwise
        permissionsLoaded: false,

        // Permission catalogue from backend
        catalogue: {
            all:    [],
            groups: {}
        },

        // All org roles
        roles:     [],

        // HR users with their role assignments
        hrAssignments: [],

        isLoading: false,
        fetchData: true,
        error: { status: false, message: null }
    },
    extraReducers: (builder) => {

        // ── My permissions ────────────────────────────────────────────────────
        builder
            .addCase(HandleGetMyPermissions.pending,   pending)
            .addCase(HandleGetMyPermissions.fulfilled, (state, action) => {
                state.isLoading        = false
                state.myPermissions    = action.payload.data.permissions   // null = unrestricted
                state.myRoleName       = action.payload.data.roleName
                state.isUnrestricted   = action.payload.data.isUnrestricted
                state.permissionsLoaded = true
                state.error            = { status: false, message: null }
            })
            .addCase(HandleGetMyPermissions.rejected, (state, action) => {
                state.isLoading        = false
                state.permissionsLoaded = true   // mark loaded even on error so app doesn't hang
                state.error            = { status: true, message: action.payload?.message }
            })

        // ── Permission catalogue ───────────────────────────────────────────────
        builder
            .addCase(HandleGetPermissionCatalogue.pending,   pending)
            .addCase(HandleGetPermissionCatalogue.fulfilled, (state, action) => {
                state.isLoading  = false
                state.catalogue  = action.payload.data
                state.error      = { status: false, message: null }
            })
            .addCase(HandleGetPermissionCatalogue.rejected, rejected)

        // ── All roles ─────────────────────────────────────────────────────────
        builder
            .addCase(HandleGetAllRoles.pending,   pending)
            .addCase(HandleGetAllRoles.fulfilled, (state, action) => {
                state.isLoading = false
                state.roles     = action.payload.data
                state.fetchData = false
                state.error     = { status: false, message: null }
            })
            .addCase(HandleGetAllRoles.rejected, rejected)

        // ── Create role ───────────────────────────────────────────────────────
        builder
            .addCase(HandleCreateRole.pending,   pending)
            .addCase(HandleCreateRole.fulfilled, (state, action) => {
                state.isLoading = false
                state.roles.push(action.payload.data)
                state.error     = { status: false, message: null }
            })
            .addCase(HandleCreateRole.rejected, rejected)

        // ── Update role ───────────────────────────────────────────────────────
        builder
            .addCase(HandleUpdateRole.pending,   pending)
            .addCase(HandleUpdateRole.fulfilled, (state, action) => {
                state.isLoading = false
                const updated   = action.payload.data
                state.roles     = state.roles.map(r => r._id === updated._id ? updated : r)
                // Also update in hrAssignments if anyone had this role
                state.hrAssignments = state.hrAssignments.map(hr =>
                    hr.rbacRole?._id === updated._id
                        ? { ...hr, rbacRole: updated }
                        : hr
                )
                state.error = { status: false, message: null }
            })
            .addCase(HandleUpdateRole.rejected, rejected)

        // ── Delete role ───────────────────────────────────────────────────────
        builder
            .addCase(HandleDeleteRole.pending,   pending)
            .addCase(HandleDeleteRole.fulfilled, (state, action) => {
                state.isLoading     = false
                const { roleID }    = action.payload
                state.roles         = state.roles.filter(r => r._id !== roleID)
                // Unassign from HR list in UI too
                state.hrAssignments = state.hrAssignments.map(hr =>
                    hr.rbacRole?._id === roleID ? { ...hr, rbacRole: null } : hr
                )
                state.error = { status: false, message: null }
            })
            .addCase(HandleDeleteRole.rejected, rejected)

        // ── HR assignments ────────────────────────────────────────────────────
        builder
            .addCase(HandleGetHRAssignments.pending,   pending)
            .addCase(HandleGetHRAssignments.fulfilled, (state, action) => {
                state.isLoading    = false
                state.hrAssignments = action.payload.data
                state.error        = { status: false, message: null }
            })
            .addCase(HandleGetHRAssignments.rejected, rejected)

        // ── Assign role ───────────────────────────────────────────────────────
        builder
            .addCase(HandleAssignRole.pending,   pending)
            .addCase(HandleAssignRole.fulfilled, (state, action) => {
                state.isLoading     = false
                const updated       = action.payload.data
                state.hrAssignments = state.hrAssignments.map(hr =>
                    hr._id === updated._id ? { ...hr, rbacRole: updated.rbacRole } : hr
                )
                state.error = { status: false, message: null }
            })
            .addCase(HandleAssignRole.rejected, rejected)
    }
})

export default RBACSlice.reducer

// ─── Selector helper ──────────────────────────────────────────────────────────
// Usage in any component: const can = useSelector(selectCan('employee.create'))
export const selectCan = (permission) => (state) => {
    const rbac = state.RBACReducer
    if (rbac.isUnrestricted || rbac.myPermissions === null) return true
    return rbac.myPermissions.includes(permission)
}