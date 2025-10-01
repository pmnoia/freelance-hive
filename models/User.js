import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User Schema - matches the proposal specification exactly
const userSchema = new mongoose.Schema({
    // Basic user information
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Ensures no duplicate emails
        lowercase: true, // Automatically converts to lowercase
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    }, 
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: {
            values: ['freelancer', 'client'],
            message: 'Role must be either freelancer or client'
        },
        required: [true, 'Role is required']
    },
    // Profile object as specified in the proposal
    profile: {
        bio: {
            type: String,
            default: '',
            maxlength: [500, 'Bio cannot exceed 500 characters']
        },
        skills: {
            type: [String], // Array of skills
            default: [],
            validate: {
                validator: function(skills) {
                    return skills.length <= 10; // Limit to 10 skills max
                },
                message: 'Cannot have more than 10 skills'
            }
        },
        hourlyRate: {
            type: Number,
            default: 0,
            min: [0, 'Hourly rate cannot be negative'],
            max: [1000, 'Hourly rate cannot exceed $1000/hour']
        }
    }
}, {
    timestamps: true // Auto-adds createdAt and updatedAt fields
});

// ===== INDEXES =====
// Indexes improve query performance - like adding bookmarks to a book
userSchema.index({ email: 1 }); // Makes email lookups super fast (for login)
userSchema.index({ role: 1 }); // Makes filtering by role fast (find all freelancers)
userSchema.index({ 'profile.skills': 1 }); // Makes skill-based searches fast

// ===== MIDDLEWARE =====
// This runs automatically BEFORE saving a user to the database
userSchema.pre('save', async function(next) {
    // Only hash the password if it's new or has been modified
    if (!this.isModified('password')) {
        return next(); // Skip hashing if password hasn't changed
    }

    try {
        // Hash the password with bcrypt (10 rounds = good security vs performance balance)
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// ===== METHODS =====
// Custom methods that can be called on user instances
userSchema.methods.checkPassword = async function (inputPassword) {
    // Compare the plain text password with the hashed one
    return await bcrypt.compare(inputPassword, this.password);
};

// Helper method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password; // Remove password from output
    return userObject;
};





// const userSchema = new mongoose.Schema({
;

// ===== MODEL CREATION =====
// Create the User model - mongoose will use existing model if already compiled 
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;