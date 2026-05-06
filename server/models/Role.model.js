import mongoose from 'mongoose'

const { Schema } = mongoose

// ─── Complete permission list — sourced directly from all route CheckPermission calls ──
export const ALL_PERMISSIONS = [
    // Employee
    'employee.view', 'employee.create', 'employee.update', 'employee.delete',
    // Department
    'department.view', 'department.create', 'department.edit', 'department.delete',
    // Leave
    'leave.view', 'leave.approve',
    // Attendance
    'attendance.view', 'attendance.delete',
    // Salary
    'salary.view', 'salary.create', 'salary.update', 'salary.delete',
    // Payroll & Balance
    'payrollcompliance.view',
    // Notice
    'notice.view', 'notice.create', 'notice.update', 'notice.delete',
    // Requests
    'request.manage',
    // Documents
    'document.view', 'document.create', 'document.update', 'document.delete',
    // Leave Recommendation
    'leaverecommendation.view',
    // Recruitment
    'recruitment.manage', 'applicant.manage', 'interview.view',
    // Exit Clearance
    'exitclearance.view', 'exitclearance.create', 'exitclearance.update', 'exitclearance.delete',
    // Org Structure
    'orgstructure.view', 'orgstructure.manage',
    // RBAC
    'rbac.view', 'rbac.create', 'rbac.update', 'rbac.delete', 'rbac.assign',
    // Privilege Drift (Temporary Roles)
    'privilegedrift.view', 'privilegedrift.extend', 'privilegedrift.revoke',
    // Security Alerts (AccessDrift detection)
    'securityalerts.view', 'securityalerts.resolve',
    // Access Drift (HR role drift)
    'access_drift.view', 'access_drift.resolve',
    // Activity Log
    'activitylog.view', 'activitylog.clear',
    // Analytics
    'analytics.view',
    // Corporate Calendar
    'calendar.view', 'calendar.manage',
]

// ─── Grouped for the permission picker UI ─────────────────────────────────────
export const PERMISSION_GROUPS = {
    'Employee':             ['employee.view', 'employee.create', 'employee.update', 'employee.delete'],
    'Department':           ['department.view', 'department.create', 'department.edit', 'department.delete'],
    'Leave':                ['leave.view', 'leave.approve'],
    'Attendance':           ['attendance.view', 'attendance.delete'],
    'Salary':               ['salary.view', 'salary.create', 'salary.update', 'salary.delete'],
    'Payroll & Balance':    ['payrollcompliance.view'],
    'Notice':               ['notice.view', 'notice.create', 'notice.update', 'notice.delete'],
    'Requests':             ['request.manage'],
    'Documents':            ['document.view', 'document.create', 'document.update', 'document.delete'],
    'Leave Recommendation': ['leaverecommendation.view'],
    'Recruitment':          ['recruitment.manage', 'applicant.manage', 'interview.view'],
    'Exit Clearance':       ['exitclearance.view', 'exitclearance.create', 'exitclearance.update', 'exitclearance.delete'],
    'Org Structure':        ['orgstructure.view', 'orgstructure.manage'],
    'RBAC':                 ['rbac.view', 'rbac.create', 'rbac.update', 'rbac.delete', 'rbac.assign'],
    'Privilege Drift':      ['privilegedrift.view', 'privilegedrift.extend', 'privilegedrift.revoke'],
    'Security Alerts':      ['securityalerts.view', 'securityalerts.resolve'],
    'Access Drift':         ['access_drift.view', 'access_drift.resolve'],
    'Activity Log':         ['activitylog.view', 'activitylog.clear'],
    'Analytics':            ['analytics.view'],
    'Calendar':             ['calendar.view', 'calendar.manage'],
}

// ─── Role schema ──────────────────────────────────────────────────────────────
const RoleSchema = new Schema({
    name: {
        type:     String,
        required: true,
        trim:     true,
    },
    description: {
        type:    String,
        default: '',
        trim:    true,
    },
    permissions: {
        type:    [String],
        default: [],
        // No enum constraint — avoids crashes when new permissions are added later
    },
    isSystem: {
        type:    Boolean,
        default: false,
    },
    organizationID: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'Organization',
        required: true,
    },
}, { timestamps: true })

// Role names unique per organisation
RoleSchema.index({ name: 1, organizationID: 1 }, { unique: true })

export const Role = mongoose.model('Role', RoleSchema)