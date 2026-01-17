import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    firstName: {
        type: String,
        required: [true, 'Please provide first name'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Please provide last name'],
        trim: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor'],
        default: 'patient'
    },
    phone: {
        type: String,
        trim: true
    },
    // Doctor specific fields
    specialty: {
        type: String,
        trim: true
    },
    qualifications: {
        type: String
    },
    experience: {
        type: Number
    },
    consultationFee: {
        type: Number,
        default: 500
    },
    availability: [{
        day: String,
        startTime: String,
        endTime: String
    }],
    // Patient specific fields
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    medicalHistory: {
        type: String
    },
    // Medical Profile Fields
    bloodType: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
        default: ''
    },
    height: {
        type: String,
        default: ''
    },
    weight: {
        type: String,
        default: ''
    },
    emergencyContact: {
        type: String,
        default: ''
    },
    allergies: [{
        type: String
    }],
    conditions: [{
        type: String
    }],
    address: {
        type: String,
        default: ''
    },
    profileImage: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // HIPAA Compliance Fields
    hipaaConsentGiven: {
        type: Boolean,
        default: false
    },
    hipaaConsentDate: {
        type: Date
    },
    lastLogin: {
        type: Date
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLocked: {
        type: Boolean,
        default: false
    },
    lockUntil: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
