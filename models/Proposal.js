import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema({
    // ===== RELATIONSHIPS =====
    // Which project is this proposal for
    projectId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project',
        required: [true, 'Project ID is required']
    },

    // Which freelancer made this proposal 
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: [true, 'Freelancer ID is required']
    },

    // ===== PROPOSAL DETAILS =====
    message: {
        type: String,
        required: [true, 'Proposal message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    proposedBudget: {
        type: Number,
        required: [true, 'Proposed budget is required'],
        min: [1, 'Proposed budget must be at least $1'],
        max: [50000, 'Proposed budget cannot exceed $50,000']
    },
    deliveryDays: {
        type: Number,
        required: [true, 'Delivery timeframe is required'],
        min: [1, 'Delivery must be at least 1 day'],
        max: [365, 'Delivery cannot exceed 365 days']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'accepted', 'rejected'],
            message: 'Status must be: pending, accepted, or rejected'
        },
        default: 'pending'
    }
}, {
    timestamps: true
});

// ===== INDEXES =====
// Ensures freelancer can only propose once per project (business rule)
proposalSchema.index({ projectId: 1, freelancerId: 1 }, { unique: true });

// Performance indexes for common queries
proposalSchema.index({ projectId: 1, status: 1 }); // Get proposals for a project by status
proposalSchema.index({ freelancerId: 1, status: 1 }); // Get freelancer's proposals by status
proposalSchema.index({ status: 1, createdAt: -1 }); // Get proposals by status, newest first

// ===== METHODS =====
// Check if this proposal can be accepted
proposalSchema.methods.canBeAccepted = function() {
    return this.status === 'pending';
};

// Check if this proposal can be rejected
proposalSchema.methods.canBeRejected = function() {
    return this.status === 'pending';
};

// Calculate estimated delivery date
proposalSchema.methods.getEstimatedDelivery = function() {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + this.deliveryDays);
    return deliveryDate;
};

const Proposal = mongoose.models.Proposal || mongoose.model('Proposal', proposalSchema);

export default Proposal;