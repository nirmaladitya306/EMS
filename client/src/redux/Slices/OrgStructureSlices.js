import { createSlice } from '@reduxjs/toolkit'
import {
    HandleGetOrgTree,
    HandleGetAllPositions,
    HandleCreatePosition,
    HandleUpdatePosition,
    HandleDeletePosition,
    HandleAssignEmployee,
    HandleRemoveEmployee,
    HandleGetReportingChain,
} from '../Thunks/OrgStructureThunk'

const replacePosition = (positions, updated) =>
    positions.map(p => p._id === updated._id ? updated : p)

const OrgStructureSlice = createSlice({
    name: 'OrgStructure',
    initialState: {
        positions:      [],       // flat list
        tree:           [],       // nested tree
        summary:        { totalPositions: 0, filledPositions: 0, totalEmployeesPlaced: 0 },
        reportingChain: null,
        isLoading:      false,
        fetchData:      true,
        error:          { status: false, message: null }
    },
    extraReducers: (builder) => {
        const pending  = (state) => { state.isLoading = true;  state.error = { status: false, message: null } }
        const rejected = (state, action) => { state.isLoading = false; state.error = { status: true, message: action.payload?.message } }

        // GET TREE
        builder
            .addCase(HandleGetOrgTree.pending,   pending)
            .addCase(HandleGetOrgTree.fulfilled, (state, action) => {
                state.isLoading = false
                state.tree      = action.payload.data.tree
                state.positions = action.payload.data.flat
                state.summary   = action.payload.data.summary
                state.fetchData = false
            })
            .addCase(HandleGetOrgTree.rejected,  rejected)

        // GET ALL (flat, lightweight)
        builder
            .addCase(HandleGetAllPositions.pending,   pending)
            .addCase(HandleGetAllPositions.fulfilled, (state, action) => {
                state.isLoading = false
                state.positions = action.payload.data
                state.fetchData = false
            })
            .addCase(HandleGetAllPositions.rejected,  rejected)

        // CREATE
        builder
            .addCase(HandleCreatePosition.pending,   pending)
            .addCase(HandleCreatePosition.fulfilled, (state, action) => {
                state.isLoading = false
                state.positions.push(action.payload.data)
                state.fetchData = true   // trigger tree refresh
            })
            .addCase(HandleCreatePosition.rejected,  rejected)

        // UPDATE
        builder
            .addCase(HandleUpdatePosition.pending,   pending)
            .addCase(HandleUpdatePosition.fulfilled, (state, action) => {
                state.isLoading = false
                state.positions = replacePosition(state.positions, action.payload.data)
                state.fetchData = true
            })
            .addCase(HandleUpdatePosition.rejected,  rejected)

        // DELETE
        builder
            .addCase(HandleDeletePosition.pending,   pending)
            .addCase(HandleDeletePosition.fulfilled, (state, action) => {
                state.isLoading = false
                state.positions = state.positions.filter(p => p._id !== action.payload.positionID)
                state.fetchData = true
            })
            .addCase(HandleDeletePosition.rejected,  rejected)

        // ASSIGN EMPLOYEE
        builder
            .addCase(HandleAssignEmployee.pending,   pending)
            .addCase(HandleAssignEmployee.fulfilled, (state, action) => {
                state.isLoading = false
                state.positions = replacePosition(state.positions, action.payload.data)
                state.fetchData = true
            })
            .addCase(HandleAssignEmployee.rejected,  rejected)

        // REMOVE EMPLOYEE
        builder
            .addCase(HandleRemoveEmployee.pending,   pending)
            .addCase(HandleRemoveEmployee.fulfilled, (state, action) => {
                state.isLoading = false
                state.positions = replacePosition(state.positions, action.payload.data)
                state.fetchData = true
            })
            .addCase(HandleRemoveEmployee.rejected,  rejected)

        // REPORTING CHAIN
        builder
            .addCase(HandleGetReportingChain.pending,   pending)
            .addCase(HandleGetReportingChain.fulfilled, (state, action) => {
                state.isLoading     = false
                state.reportingChain = action.payload.data
            })
            .addCase(HandleGetReportingChain.rejected,  rejected)
    }
})

export default OrgStructureSlice.reducer