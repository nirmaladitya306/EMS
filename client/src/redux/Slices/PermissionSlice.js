import { createSlice } from "@reduxjs/toolkit"
import { HandleGetPermissions } from "../Thunks/PermissionThunk"

const initialState = {
  permissions: [],
  isLoading: false
}

const slice = createSlice({
  name: "permissions",
  initialState,
  extraReducers: (builder) => {
    builder
      .addCase(HandleGetPermissions.pending, (state) => {
        state.isLoading = true
      })
      .addCase(HandleGetPermissions.fulfilled, (state, action) => {
        state.isLoading = false
        state.permissions = action.payload.data
      })
      .addCase(HandleGetPermissions.rejected, (state) => {
        state.isLoading = false
      })
  }
})

export default slice.reducer