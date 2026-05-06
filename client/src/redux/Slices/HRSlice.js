import { createSlice } from "@reduxjs/toolkit";
import {
  HandleGetHumanResources,
  HandlePostHumanResources
} from "../Thunks/HRThunk";

const initialState = {
  isAuthenticated: false,
  loading: false,
  error: {
    status: false,
    message: ""
  },
  data: null // We need to actually fill this!
};

const HRSlice = createSlice({
  name: "HRReducer",
  initialState,
  reducers: {
    HR_CLEAR_ERROR: (state) => {
      state.error = { status: false, message: "" };
    }
  },
  extraReducers: (builder) => {
    builder

      // 🔹 CHECK LOGIN
      .addCase(HandleGetHumanResources.pending, (state) => {
        state.loading = true;
      })
      .addCase(HandleGetHumanResources.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.success) {
          state.isAuthenticated = true;
          // ✅ SAVE THE USER DATA HERE!
          state.data = action.payload.data || null; 
        } else {
          state.isAuthenticated = false;
          state.data = null; // Clear data if not authenticated
        }
      })
      .addCase(HandleGetHumanResources.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.data = null; // Clear data on error/logout
      })

      // 🔹 LOGIN
      .addCase(HandlePostHumanResources.pending, (state) => {
        state.loading = true;
        state.error = { status: false, message: "" };
      })
      .addCase(HandlePostHumanResources.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.success) {
          state.isAuthenticated = true;
          // ✅ SAVE THE USER DATA HERE TOO (if your login route sends it back)
          if (action.payload.data) {
             state.data = action.payload.data;
          }
        } else {
          state.error = {
            status: true,
            message: action.payload.message
          };
        }
      })
      .addCase(HandlePostHumanResources.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          status: true,
          message: action.payload?.message || "Something went wrong"
        };
      });
  }
});

export const { HR_CLEAR_ERROR } = HRSlice.actions;
export default HRSlice.reducer;