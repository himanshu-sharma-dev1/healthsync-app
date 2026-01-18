import express from 'express';
import Appointment from '../models/Appointment.js';
import { protect, authorize } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import { sendBookingConfirmation } from '../services/emailService.js';

const router = express.Router();

// @route   GET /api/appointments
// @desc    Get user appointments
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { status } = req.query;

        let query = {};

        // Filter by user role
        if (req.user.role === 'patient') {
            query.patient = req.user._id;
        } else if (req.user.role === 'doctor') {
            query.doctor = req.user._id;
        }

        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'firstName lastName email phone')
            .populate('doctor', 'firstName lastName email specialty consultationFee')
            .sort({ scheduledDate: -1 });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching appointments'
        });
    }
});

// @route   POST /api/appointments
// @desc    Create appointment
// @access  Private (Patient)
router.post('/', protect, authorize('patient'), async (req, res) => {
    try {
        const { doctorId, specialty, scheduledDate, scheduledTime, symptoms, amount } = req.body;

        // Check for conflicting appointments
        const conflictDoctor = await Appointment.findOne({
            doctor: doctorId,
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            status: { $nin: ['cancelled'] }
        });

        if (conflictDoctor) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        const conflictPatient = await Appointment.findOne({
            patient: req.user._id,
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            status: { $nin: ['cancelled'] }
        });

        if (conflictPatient) {
            return res.status(400).json({
                success: false,
                message: 'You already have an appointment at this time'
            });
        }

        // Create unique room for video call
        const roomName = `healthsync-${uuidv4().slice(0, 8)}`;

        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor: doctorId,
            specialty,
            scheduledDate: new Date(scheduledDate),
            scheduledTime,
            symptoms,
            amount,
            roomName
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient', 'firstName lastName email')
            .populate('doctor', 'firstName lastName email specialty');

        // Send booking confirmation email
        try {
            if (populatedAppointment.patient?.email) {
                await sendBookingConfirmation({
                    doctor: `Dr. ${populatedAppointment.doctor.firstName} ${populatedAppointment.doctor.lastName}`,
                    date: new Date(scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                    time: scheduledTime,
                    id: appointment._id,
                    specialty: populatedAppointment.doctor.specialty || specialty
                }, populatedAppointment.patient.email);
                console.log('📧 Booking confirmation email sent');
            }
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            // Don't fail the appointment creation if email fails
        }

        res.status(201).json({
            success: true,
            appointment: populatedAppointment
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating appointment'
        });
    }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'firstName lastName email phone')
            .populate('doctor', 'firstName lastName email specialty consultationFee');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check ownership
        const isOwner =
            appointment.patient._id.toString() === req.user._id.toString() ||
            appointment.doctor._id.toString() === req.user._id.toString();

        if (!isOwner) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this appointment'
            });
        }

        res.json({
            success: true,
            appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching appointment'
        });
    }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        const { status, diagnosis, prescription, notes, transcription } = req.body;

        if (status) appointment.status = status;
        if (diagnosis) appointment.diagnosis = diagnosis;
        if (prescription) appointment.prescription = prescription;
        if (notes) appointment.notes = notes;
        if (transcription) appointment.transcription = transcription;

        appointment.updatedAt = Date.now();

        await appointment.save();

        res.json({
            success: true,
            appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating appointment'
        });
    }
});

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.json({
            success: true,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error cancelling appointment'
        });
    }
});

export default router;
