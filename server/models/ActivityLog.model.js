import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const ActivityLogSchema = new Schema({
    // Who performed the action
    actorID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    actorName: {
        type: String,
        required: true
    },
    actorRole: {
        type: String,
        required: true,
        enum: ['HR-Admin', 'Employee']
    },

    // What they did
    action: {
        type: String,
        required: true,
        enum: [
            // Auth
            'LOGIN', 'LOGOUT', 'SIGNUP', 'PASSWORD_RESET',
            // Employee
            'EMPLOYEE_CREATED', 'EMPLOYEE_UPDATED', 'EMPLOYEE_DELETED',
            // Department
            'DEPARTMENT_CREATED', 'DEPARTMENT_UPDATED', 'DEPARTMENT_DELETED',
            // Leave
            'LEAVE_CREATED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_DELETED',
            // Salary
            'SALARY_CREATED', 'SALARY_UPDATED',
            // Attendance
            'ATTENDANCE_UPDATED',
            // Notice
            'NOTICE_CREATED', 'NOTICE_DELETED',
            // Document
            'DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED', 'DOCUMENT_ALERT_RUN',
            // Recruitment
            'RECRUITMENT_CREATED', 'APPLICANT_STATUS_UPDATED',
            // Access
            'ACCESS_DRIFT_DETECTED', 'ACCESS_DRIFT_RESOLVED',
            // General
            'OTHER'
        ]
    },

    // Human readable summary
    description: {
        type: String,
        required: true
    },

    // Which resource was affected
    targetID: {
        type: mongoose.Schema.Types.ObjectId
    },
    targetModel: {
        type: String   // e.g. 'Employee', 'Department', 'Leave'
    },

    // HTTP metadata
    method: {
        type: String   // GET, POST, PATCH, DELETE
    },
    endpoint: {
        type: String   // e.g. /api/v1/employee/delete-employee
    },
    statusCode: {
        type: Number
    },

    // Extra details (flexible)
    meta: {
        type: Schema.Types.Mixed,
        default: {}
    },

    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }
}, { timestamps: true })

// Index for fast queries by org + time
ActivityLogSchema.index({ organizationID: 1, createdAt: -1 })
ActivityLogSchema.index({ actorID: 1, createdAt: -1 })
ActivityLogSchema.index({ action: 1, createdAt: -1 })

export const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema)