import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const AccessDriftSchema = new Schema({
    // The employee whose access drifted
    employeeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    employeeDepartment: {
        type: String,
        default: 'Unknown'
    },

    // What kind of drift was detected
    driftType: {
        type: String,
        required: true,
        enum: [
            'UNUSUAL_LOGIN_TIME',        // Login outside normal working hours (before 6am or after 11pm)
            'HIGH_FREQUENCY_ACTIONS',    // Too many actions in a short window (> 30 in 1 hour)
            'SENSITIVE_ENDPOINT_ACCESS', // Employee hitting HR-level or admin endpoints
            'BULK_OPERATION',            // Mass deletions or updates in a short period
            'OFF_HOURS_ACTIVITY',        // Activity on weekends or public holidays
            'REPEATED_FAILED_ACCESS',    // Multiple 401/403 responses in a session
            'UNUSUAL_ACTION_PATTERN',    // Actions far outside the norm for this employee's role
        ]
    },

    // Severity level
    severity: {
        type: String,
        required: true,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'MEDIUM'
    },

    // Human-readable description
    description: {
        type: String,
        required: true
    },

    // The specific trigger event (activity log entry that caused this)
    triggerLogID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ActivityLog'
    },

    // Evidence — snapshot of suspicious logs
    evidence: [
        {
            action: String,
            endpoint: String,
            timestamp: Date,
            description: String
        }
    ],

    // Resolution
    status: {
        type: String,
        enum: ['OPEN', 'RESOLVED', 'DISMISSED'],
        default: 'OPEN'
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    resolvedByName: {
        type: String
    },
    resolvedAt: {
        type: Date
    },
    resolutionNote: {
        type: String
    },

    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

AccessDriftSchema.index({ organizationID: 1, createdAt: -1 })
AccessDriftSchema.index({ employeeID: 1, createdAt: -1 })
AccessDriftSchema.index({ status: 1, severity: 1 })

export const AccessDrift = mongoose.model('AccessDrift', AccessDriftSchema)