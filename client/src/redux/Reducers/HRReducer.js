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
  data: null
};

const HRReducer = createSlice({
  name: "HRReducer",
  initialState,
  reducers: {
    HR_CLEAR_ERROR: (state) => {
      state.error = { status: false, message: "" };
    }
  },
  extraReducers: (builder) => {
    builder

      // 🔹 GET (CHECK LOGIN)
      .addCase(HandleGetHumanResources.pending, (state) => {
        state.loading = true;
      })
      .addCase(HandleGetHumanResources.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.success) {
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(HandleGetHumanResources.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })

      // 🔹 POST (LOGIN)
      .addCase(HandlePostHumanResources.pending, (state) => {
        state.loading = true;
        state.error = { status: false, message: "" };
      })
      .addCase(HandlePostHumanResources.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.success) {
          state.isAuthenticated = true;
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

export const { HR_CLEAR_ERROR } = HRReducer.actions;
export default HRReducer.reducer;