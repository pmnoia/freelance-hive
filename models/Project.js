import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    // Project basic information
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: { // Fixed typo: was "descriptioN"
        type: String,
        required: [true, 'Project description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        enum: {
            values: [
                'Web Development',
                'Graphic Design', 
                'Content Writing',
                'Digital Marketing',
                'Other'
            ],
            message: 'Category must be one of: Web Development, Graphic Design, Content Writing, Digital Marketing, or Other'
        },
        required: [true, 'Project category is required']
    },
    // Skills required for this project (as specified in proposal)
    skillsRequired: {
        type: [String],
        default: [],
        validate: {
            validator: function(skills) {
                return skills.length > 0 && skills.length <= 10;
            },
            message: 'Project must have between 1 and 10 required skills'
        }
    },
    budget: {
        type: Number,
        required: [true, 'Project budget is required'],
        min: [5, 'Minimum budget is $5'],
        max: [50000, 'Maximum budget is $50,000']
    },
    deadline: {
        type: Date,
        required: [true, 'Project deadline is required'],
        validate: {
            validator: function(deadline) {
                return deadline > new Date(); // Deadline must be in the future
            },
            message: 'Deadline must be in the future'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['open', 'in-progress', 'completed'],
            message: 'Status must be: open, in-progress, or completed'
        },
        default: 'open' // New projects start as 'open'
    },

    // Relationships (as specified in proposal)
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Client ID is required'] // Every project needs a client
    },
    assignedFreelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null until project is assigned to a freelancer
    }
}, {
    timestamps: true
});

// ===== INDEXES =====
// Indexes for optimal query performance
projectSchema.index({ status: 1 }); // Fast filtering by status (open projects, etc.)
projectSchema.index({ category: 1 }); // Fast filtering by category  
projectSchema.index({ clientId: 1 }); // Fast lookup of client's projects
projectSchema.index({ assignedFreelancer: 1 }); // Fast lookup of freelancer's projects
projectSchema.index({ skillsRequired: 1 }); // Fast skill-based project searches
projectSchema.index({ deadline: 1 }); // Fast sorting by deadline
projectSchema.index({ createdAt: -1 }); // Fast sorting by newest projects first

// Compound indexes for common query patterns
projectSchema.index({ status: 1, category: 1 }); // Filter by status AND category
projectSchema.index({ status: 1, deadline: 1 }); // Open projects sorted by deadline

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);

export default Project;