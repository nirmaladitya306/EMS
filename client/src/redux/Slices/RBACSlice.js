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
    HandleGetRoleDrifts,
    HandleRevokeDrift,
    HandleExtendDrift,
    HandleCreateDrift,
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
        myPermissions:     null,   // null = unrestricted (super-admin)
        myRoleName:        null,
        isUnrestricted:    true,
        permissionsLoaded: false,

        // Permission catalogue from backend
        catalogue: {
            all:    [],
            groups: {}
        },

        // All org roles
        roles: [],

        // HR users with their role assignments
        hrAssignments: [],

        // Privilege drift (temporary roles)
        drifts: [],

        isLoading: false,
        fetchData:  true,
        error: { status: false, message: null }
    },
    extraReducers: (builder) => {

        // ── My permissions ────────────────────────────────────────────────────
        builder
            .addCase(HandleGetMyPermissions.pending,   pending)
            .addCase(HandleGetMyPermissions.fulfilled, (state, action) => {
                state.isLoading        = false
                state.myPermissions    = action.payload.data.permissions
                state.myRoleName       = action.payload.data.roleName
                state.isUnrestricted   = action.payload.data.isUnrestricted
                state.permissionsLoaded = true
                state.error            = { status: false, message: null }
            })
            .addCase(HandleGetMyPermissions.rejected, (state, action) => {
                state.isLoading        = false
                state.permissionsLoaded = true
                state.error            = { status: true, message: action.payload?.message }
            })

        // ── Permission catalogue ───────────────────────────────────────────────
        builder
            .addCase(HandleGetPermissionCatalogue.pending,   pending)
            .addCase(HandleGetPermissionCatalogue.fulfilled, (state, action) => {
                state.isLoading = false
                state.catalogue = action.payload.data
                state.error     = { status: false, message: null }
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
                state.isLoading     = false
                state.hrAssignments = action.payload.data
                state.error         = { status: false, message: null }
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

        // ── Get role drifts ───────────────────────────────────────────────────
        builder
            .addCase(HandleGetRoleDrifts.pending,   pending)
            .addCase(HandleGetRoleDrifts.fulfilled, (state, action) => {
                state.isLoading = false
                state.drifts    = action.payload.data || []
                state.error     = { status: false, message: null }
            })
            .addCase(HandleGetRoleDrifts.rejected, rejected)

        // ── Create drift ──────────────────────────────────────────────────────
        builder
            .addCase(HandleCreateDrift.pending,   pending)
            .addCase(HandleCreateDrift.fulfilled, (state, action) => {
                state.isLoading = false
                // Re-fetch will happen via the page's useEffect after success
                state.error     = { status: false, message: null }
            })
            .addCase(HandleCreateDrift.rejected, rejected)

        // ── Revoke drift ──────────────────────────────────────────────────────
        builder
            .addCase(HandleRevokeDrift.pending,   pending)
            .addCase(HandleRevokeDrift.fulfilled, (state, action) => {
                state.isLoading = false
                const { driftID } = action.payload
                // Mark it as revoked in local state so UI updates instantly
                state.drifts = state.drifts.map(d =>
                    d._id === driftID
                        ? { ...d, drift: { ...d.drift, isExpired: true } }
                        : d
                )
                state.error = { status: false, message: null }
            })
            .addCase(HandleRevokeDrift.rejected, rejected)

        // ── Extend drift ──────────────────────────────────────────────────────
        builder
            .addCase(HandleExtendDrift.pending,   pending)
            .addCase(HandleExtendDrift.fulfilled, (state, action) => {
                state.isLoading = false
                const { driftID, newExpiry } = action.payload
                state.drifts = state.drifts.map(d =>
                    d._id === driftID
                        ? { ...d, drift: { ...d.drift, expiresAt: newExpiry, isExpired: false } }
                        : d
                )
                state.error = { status: false, message: null }
            })
            .addCase(HandleExtendDrift.rejected, rejected)
    }
})

export default RBACSlice.reducer

// ─── Selector helper ──────────────────────────────────────────────────────────
export const selectCan = (permission) => (state) => {
    const rbac = state.RBACReducer

    if (rbac.isUnrestricted || rbac.myPermissions === null) return true
    if (rbac.myPermissions.includes(permission)) return true

    // Check temporary drift permissions
    if (rbac.drifts?.length > 0) {
        const hasActiveDrift = rbac.drifts.some(drift => {
            if (drift.drift?.isExpired) return false
            return drift.drift?.role?.permissions?.includes(permission)
        })
        if (hasActiveDrift) return true
    }

    return false
}
