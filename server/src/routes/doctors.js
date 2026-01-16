import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { specialty, search } = req.query;

        let query = { role: 'doctor' };

        if (specialty) {
            query.specialty = { $regex: specialty, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { specialty: { $regex: search, $options: 'i' } }
            ];
        }

        const doctors = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error('Get doctors error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching doctors'
        });
    }
});

// @route   GET /api/doctors/specialties
// @desc    Get all unique specialties
// @access  Public
router.get('/specialties', async (req, res) => {
    try {
        const specialties = await User.distinct('specialty', {
            role: 'doctor',
            specialty: { $ne: null, $ne: '' }
        });

        res.json({
            success: true,
            specialties
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching specialties'
        });
    }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const doctor = await User.findOne({
            _id: req.params.id,
            role: 'doctor'
        }).select('-password');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        res.json({
            success: true,
            doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching doctor'
        });
    }
});

// @route   GET /api/doctors/:id/availability
// @desc    Get doctor availability
// @access  Public
router.get('/:id/availability', async (req, res) => {
    try {
        const { date } = req.query;

        const doctor = await User.findOne({
            _id: req.params.id,
            role: 'doctor'
        }).select('availability consultationFee');

        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }

        // Return time slots based on doctor's availability
        const timeSlots = generateTimeSlots(doctor.availability, date);

        res.json({
            success: true,
            availability: doctor.availability,
            consultationFee: doctor.consultationFee,
            timeSlots
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching availability'
        });
    }
});

// Helper to generate time slots
function generateTimeSlots(availability, date) {
    if (!date || !availability) return [];

    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    const dayAvailability = availability?.find(a =>
        a.day.toLowerCase() === dayOfWeek.toLowerCase()
    );

    if (dayAvailability && dayAvailability.slots) {
        return dayAvailability.slots;
    }

    return [];
}

export default router;
