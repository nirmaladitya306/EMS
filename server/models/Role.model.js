import mongoose from 'mongoose'
import { Schema } from 'mongoose'

// ─── Master permission list ───────────────────────────────────────────────────
// Format: resource.action
// Any new backend resource must add its permissions here.
export const ALL_PERMISSIONS = [
    // Employees
    'employee.view',
    'employee.create',
    'employee.update',
    'employee.delete',
    'employee.timeline',

    // Departments
    'department.view',
    'department.create',
    'department.update',
    'department.delete',

    // Salary
    'salary.view',
    'salary.create',
    'salary.update',
    'salary.delete',

    // Leaves
    'leave.view',
    'leave.approve',
    'leave.delete',

    // Attendance
    'attendance.view',
    'attendance.delete',

    // Notices
    'notice.view',
    'notice.create',
    'notice.update',
    'notice.delete',

    // Documents
    'document.view',
    'document.create',
    'document.update',
    'document.delete',

    // Recruitment
    'recruitment.view',
    'recruitment.create',
    'recruitment.update',
    'recruitment.delete',

    // Requests
    'request.view',
    'request.update',
    'request.delete',

    // Exit Clearance
    'exitclearance.view',
    'exitclearance.create',
    'exitclearance.update',
    'exitclearance.delete',

    // Activity Log
    'activitylog.view',
    'activitylog.clear',

    // Security Alerts (Old Access Drift)
    'securityalerts.view',
    'securityalerts.resolve',

    // Privilege Drift (Temporary Roles)
    'privilegedrift.view',
    'privilegedrift.extend',
    'privilegedrift.revoke',

    // Payroll Compliance
    'payrollcompliance.view',

    // Analytics
    'analytics.view',

    // HR Profiles
    'hr.view',
    'hr.update',
    'hr.delete',

    // Leave Recommendation
    'leaverecommendation.view',

    // RBAC (only super-admins should have this)
    'rbac.view',
    'rbac.create',
    'rbac.update',
    'rbac.delete',
    'rbac.assign',
]

// ─── Permission groups for UI display ────────────────────────────────────────
// ─── Permission groups for UI display ────────────────────────────────────────
export const PERMISSION_GROUPS = {
    'Employees':          ALL_PERMISSIONS.filter(p => p.startsWith('employee')),
    'Departments':        ALL_PERMISSIONS.filter(p => p.startsWith('department')),
    'Salary':             ALL_PERMISSIONS.filter(p => p.startsWith('salary')),
    'Leaves':             ALL_PERMISSIONS.filter(p => p.startsWith('leave')),
    'Attendance':         ALL_PERMISSIONS.filter(p => p.startsWith('attendance')),
    'Notices':            ALL_PERMISSIONS.filter(p => p.startsWith('notice')),
    'Documents':          ALL_PERMISSIONS.filter(p => p.startsWith('document')),
    'Recruitment':        ALL_PERMISSIONS.filter(p => p.startsWith('recruitment')),
    'Requests':           ALL_PERMISSIONS.filter(p => p.startsWith('request')),
    'Exit Clearance':     ALL_PERMISSIONS.filter(p => p.startsWith('exitclearance')),
    'Activity Log':       ALL_PERMISSIONS.filter(p => p.startsWith('activitylog')),
    
    // 👇 THESE ARE THE TWO NEW GROUPS
    'Security Alerts':    ALL_PERMISSIONS.filter(p => p.startsWith('securityalerts')),
    'Privilege Drift':    ALL_PERMISSIONS.filter(p => p.startsWith('privilegedrift')),
    
    'Payroll Compliance': ALL_PERMISSIONS.filter(p => p.startsWith('payrollcompliance')),
    'Analytics':          ALL_PERMISSIONS.filter(p => p.startsWith('analytics')),
    'HR Profiles':        ALL_PERMISSIONS.filter(p => p.startsWith('hr')),
    'Leave Recommendation': ALL_PERMISSIONS.filter(p => p.startsWith('leaverecommendation')),
    'RBAC Management':    ALL_PERMISSIONS.filter(p => p.startsWith('rbac')),
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    permissions: [{
        type: String,
        enum: ALL_PERMISSIONS
    }],
    // System roles (HR_ADMIN) cannot be deleted
    isSystem: {
        type: Boolean,
        default: false
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

// Unique role name per org
RoleSchema.index({ name: 1, organizationID: 1 }, { unique: true })

export const Role = mongoose.model('Role', RoleSchema)