import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const ChecklistItemSchema = new Schema({
    task: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HumanResources'
    },
    completedAt: {
        type: Date
    },
    notes: {
        type: String,
        default: ''
    }
}, { _id: true })

const ExitClearanceSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HumanResources',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Cleared', 'Rejected'],
        default: 'Pending'
    },
    reason: {
        type: String,
        required: true
    },
    resignationDate: {
        type: Date
    },
    lastWorkingDate: {
        type: Date
    },
    exitDate: {
        type: Date
    },
    checklist: {
        type: [ChecklistItemSchema],
        default: []
    },
    notes: {
        type: String,
        default: ''
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

// Index for fast lookup by org + employee
ExitClearanceSchema.index({ organizationID: 1, createdAt: -1 })
ExitClearanceSchema.index({ employee: 1 })

export const ExitClearance = mongoose.model('ExitClearance', ExitClearanceSchema)