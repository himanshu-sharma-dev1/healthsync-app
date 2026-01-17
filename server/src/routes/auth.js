import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, role, phone, specialty } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const userData = {
            email,
            password,
            firstName,
            lastName,
            role: role || 'patient',
            phone
        };

        // Add doctor-specific fields
        if (role === 'doctor' && specialty) {
            userData.specialty = specialty;
        }

        const user = await User.create(userData);

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                specialty: user.specialty
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const allowedFields = [
            'firstName', 'lastName', 'phone', 'dateOfBirth',
            'gender', 'medicalHistory', 'specialty', 'qualifications',
            'experience', 'consultationFee', 'availability', 'profileImage',
            // Medical profile fields
            'bloodType', 'height', 'weight', 'emergencyContact',
            'allergies', 'conditions', 'address'
        ];

        // Fields that have enum validation - only include if non-empty
        const enumFields = ['gender', 'bloodType'];

        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                // Skip empty enum fields to avoid validation errors
                if (enumFields.includes(field) && req.body[field] === '') {
                    return;
                }
                updateData[field] = req.body[field];
            }
        });

        console.log('[Profile Update] User:', req.user._id, 'Fields:', Object.keys(updateData));

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('[Profile Update Error]', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error updating profile'
        });
    }
});

export default router;
