import mongoose from 'mongoose'
import { Schema } from 'mongoose'

// Represents a job designation / title within the org.
// Employees are assigned to a Position; positions can report to other positions
// forming the org hierarchy.

const PositionSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    // Numeric seniority level: 1 = top (CEO/CTO), higher = deeper in tree
    level: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },
    // Which department this position belongs to (optional — some positions are cross-dept)
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    // The position this one reports to (null = top of tree)
    reportsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Position',
        default: null
    },
    // Employees currently holding this position
    employees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, { timestamps: true })

PositionSchema.index({ organizationID: 1, level: 1 })
PositionSchema.index({ organizationID: 1, title: 1 }, { unique: true })

export const Position = mongoose.model('Position', PositionSchema)