import { createAsyncThunk } from "@reduxjs/toolkit"
import axios from "axios"

export const HandleGetPermissions = createAsyncThunk(
  "permissions/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/v1/permissions")
      return res.data
    } catch (err) {
      return rejectWithValue(err.response?.data)
    }
  }
)