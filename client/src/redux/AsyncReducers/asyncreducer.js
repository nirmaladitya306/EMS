export const AsyncReducer = (builder, thunk) => {
    builder
        .addCase(thunk.pending, (state) => {
            state.isLoading = true;
            state.error.content = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error.status = false;
            state.data = action.payload;
            if (action.payload.resetpassword) {
                state.isAuthenticated = false;
                state.isResetPasswords = action.payload.success
            }
            else {
                state.isAuthenticated = action.payload.success;
            }
        })
        .addCase(thunk.rejected, (state, action) => {
            if (action.payload.gologin) {
                state.isLoading = false;
                state.error.status = false;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
            else {
                state.isLoading = false;
                state.error.status = true;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
        });
};

export const HRAsyncReducer = (builder, thunk) => {
    builder
        .addCase(thunk.pending, (state) => {
            state.isLoading = true;
            state.error.content = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
            if (action.payload.type == "signup") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                state.isVerifiedEmailAvailable = true
                state.error.status = false;
                state.data = action.payload;
            }
            if ((action.payload.type == "checkHR") || (action.payload.type == "HRLogin") || (action.payload.type == "HRforgotpassword")) {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.type == "HRverifyemail") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isAuthourized = true
                state.isVerifiedEmailAvailable = false
                state.isVerified = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.type == "HRcodeavailable") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                if (action.payload.alreadyverified) {
                    state.isVerified = true
                }
                else {
                    state.isVerified = false
                }
                state.isVerifiedEmailAvailable = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.resetpassword) {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = false;
                state.isResetPassword = true
                state.error.status = false;
                state.data = action.payload;
            }
            if (action.payload.type == "HRResendVerifyEmail") {
                state.isSignUp = true
                state.isLoading = false;
                state.isAuthenticated = true
                state.isVerifiedEmailAvailable = true
                state.error.status = false;
                state.data = action.payload;
            }
        })
        .addCase(thunk.rejected, (state, action) => {
            if (action.payload.type == "signup") {
                state.isSignUp = false
                state.isLoading = false;
                state.error.status = true;
                state.error.message = action.payload.message
                state.error.content = action.payload
            } else if (action.payload.type == "HRcodeavailable") {
                state.isLoading = false;
                state.isVerified = false
                state.isVerifiedEmailAvailable = false
                state.error.status = false;
                state.error.content = action.payload
            } else if (action.payload.gologin) {
                state.isSignUp = false
                state.isLoading = false;
                state.isAuthenticated = false
                state.error.status = false;
                state.error.message = action.payload.message
                state.error.content = action.payload
            } else {
                state.isLoading = false;
                state.error.status = true;
                state.error.message = action.payload.message
                state.error.content = action.payload
            }
        });
}


// ─── FIX 1: Dashboard reducer — store the full data object as-is ──────────────
// The API returns { employees, departments, leaves, requestes, balance, notices }
// Previously `?.departments` was stripping all fields except departments, causing zeros.
export const HRDashboardAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error.status = false;
        state.data = action.payload.data || {};   // store the full flat object
        state.success = action.payload.success
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.error.content = action.payload;
    })
}

export const HREmployeesPageAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        if (action.payload.type === "AllEmployees") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.data = action.payload.data;
            state.success = action.payload.success
            state.fetchData = false
        }
        else if (action.payload.type === "EmployeeCreate" || action.payload.type === "EmployeeDelete") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.data = action.payload.data;
            state.success = action.payload.success;
            state.fetchData = true
        }
        else if (action.payload.type === "GetEmployee") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null
            state.error.content = null;
            state.employeeData = action.payload.data
        }
    })
    builder.addCase(thunk.rejected, (state, action) => {
        console.log(action)
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.success = action.payload.success;
        state.error.content = action.payload;
    })
}

// ─── FIX 2: Department reducer — check type BEFORE checking data ──────────────
// CreateDepartment, DepartmentDEUpdate etc. return both `data` AND `type`.
// The old code hit `if (payload?.data)` first, treating mutations as GET ALL,
// setting fetchData = false and never refetching. Now type is checked first.
export const HRDepartmentPageAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    });

    builder.addCase(thunk.fulfilled, (state, action) => {
        const payload = action.payload;

        // 1. Mutations — checked FIRST because they also have a `data` field
        if (
            payload?.type === "CreateDepartment" ||
            payload?.type === "DepartmentDelete" ||
            payload?.type === "DepartmentEMUpdate" ||
            payload?.type === "DepartmentDEUpdate" ||
            payload?.type === "RemoveEmployeeDE"
        ) {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null;
            state.error.content = null;
            state.success.status = payload.success;
            state.success.message = payload.message;
            state.success.content = payload;
            state.fetchData = true;   // triggers refetch
        }

        // 2. Single department fetch
        else if (payload?.type === "GetDepartment") {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null;
            state.error.content = null;
            state.departmentData = payload.data;
        }

        // 3. GET ALL — array of departments
        else if (payload?.data) {
            state.isLoading = false;
            state.error.status = false;
            state.error.message = null;
            state.error.content = null;
            const rawData = payload.data;
            state.data = Array.isArray(rawData)
                ? rawData
                : rawData?.departments || [];
            state.fetchData = false;
            state.success.status = false;
            state.success.message = null;
            state.success.content = null;
        }

        // 4. Fallback
        else {
            state.isLoading = false;
        }
    });

    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload?.message || "Something went wrong";
        state.error.content = action.payload;
        state.success = {
            status: false,
            message: null,
            content: null
        };
    });
};


export const EmployeesIDsAsyncReducer = (builder, thunk) => {
    builder.addCase(thunk.pending, (state) => {
        state.isLoading = true;
        state.error.content = null;
    })
    builder.addCase(thunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error.message = null;
        state.error.content = null
        state.error.status = false;
        state.data = action.payload.data || [];
    })
    builder.addCase(thunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error.status = true;
        state.error.message = action.payload.message
        state.error.content = action.payload
    })
}
