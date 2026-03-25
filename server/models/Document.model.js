import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const DocumentSchema = new Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Employee'
    },
    documentname: {
        type: String,
        required: true
    },
    documenttype: {
        type: String,
        required: true,
        enum: ['ID Proof', 'Passport', 'Work Visa', 'Certification', 'Contract', 'Other']
    },
    documentnumber: {
        type: String,
        default: ''
    },
    issuedate: {
        type: Date
    },
    expirydate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Valid', 'Expiring Soon', 'Expired'],
        default: 'Valid'
    },
    alertssent: {
        day90: { type: Boolean, default: false },
        day30: { type: Boolean, default: false },
        day7:  { type: Boolean, default: false }
    },
    notes: {
        type: String,
        default: ''
    },
    organizationID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    }
}, { timestamps: true })

export const Document = mongoose.model('Document', DocumentSchema)