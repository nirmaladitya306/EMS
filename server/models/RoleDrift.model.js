// models/RoleDrift.model.js
import mongoose from 'mongoose'
import { Schema } from 'mongoose'

const RoleDriftSchema = new Schema({
    organizationID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization', 
        required: true 
    },
    // The HR User who is getting the temporary privilege
    hrUserID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'HumanResources', 
        required: true 
    },
    // The permanent role they usually have (can be null if they had full access)
    baseRole: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role' 
    },
    // The temporary role they are being granted
    driftRole: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Role', 
        required: true 
    },
    reason: { 
        type: String, 
        required: true 
    },
    expiresAt: { 
        type: Date, 
        required: true 
    },
    isRevoked: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true })

// Virtual field to dynamically check if the drift has expired
RoleDriftSchema.virtual('isExpired').get(function() {
    if (this.isRevoked) return true;
    return new Date() > this.expiresAt;
});

// Ensure virtuals are included in API responses
RoleDriftSchema.set('toJSON', { virtuals: true });
RoleDriftSchema.set('toObject', { virtuals: true });

RoleDriftSchema.index({ organizationID: 1, isRevoked: 1 });

export const RoleDrift = mongoose.model('RoleDrift', RoleDriftSchema);