import express from 'express';
import { protect } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// @route   POST /api/video/create-room
// @desc    Create video room for appointment
// @access  Private
router.post('/create-room', protect, async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Check payment status
        if (appointment.paymentStatus !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment required before starting consultation'
            });
        }

        // In production, create room via Daily.co API
        // For hackathon demo, return simulated room
        const roomData = {
            name: appointment.roomName,
            url: `https://healthsync.daily.co/${appointment.roomName}`,
            privacy: 'private',
            properties: {
                enable_chat: true,
                enable_screenshare: true,
                max_participants: 2
            }
        };

        // TODO: Replace with actual Daily.co API call
        /*
        const response = await fetch('https://api.daily.co/v1/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
          },
          body: JSON.stringify({
            name: appointment.roomName,
            privacy: 'private',
            properties: {
              enable_chat: true,
              enable_screenshare: true,
              max_participants: 2
            }
          })
        });
        
        const roomData = await response.json();
        */

        // Update appointment with room URL
        appointment.roomUrl = roomData.url;
        appointment.status = 'in-progress';
        await appointment.save();

        res.json({
            success: true,
            room: roomData
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create video room'
        });
    }
});

// @route   GET /api/video/room/:appointmentId
// @desc    Get room details for appointment
// @access  Private
router.get('/room/:appointmentId', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId)
            .populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName specialty');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Generate meeting token for the user
        const token = {
            room_name: appointment.roomName,
            user_name: `${req.user.firstName} ${req.user.lastName}`,
            is_owner: req.user.role === 'doctor'
        };

        res.json({
            success: true,
            roomName: appointment.roomName,
            roomUrl: appointment.roomUrl || `https://healthsync.daily.co/${appointment.roomName}`,
            token,
            appointment: {
                patient: appointment.patient,
                doctor: appointment.doctor,
                specialty: appointment.specialty,
                symptoms: appointment.symptoms
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching room details'
        });
    }
});

// @route   POST /api/video/end
// @desc    End video consultation
// @access  Private
router.post('/end', protect, async (req, res) => {
    try {
        const { appointmentId, duration } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        appointment.status = 'completed';
        if (duration) {
            appointment.duration = duration;
        }
        appointment.updatedAt = Date.now();
        await appointment.save();

        res.json({
            success: true,
            message: 'Consultation ended successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to end consultation'
        });
    }
});

// @route   POST /api/video/transcribe
// @desc    Save transcription for appointment
// @access  Private
router.post('/transcribe', protect, async (req, res) => {
    try {
        const { appointmentId, transcription } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // In production, integrate with DeepGram API for real-time transcription
        appointment.transcription = transcription;
        await appointment.save();

        res.json({
            success: true,
            message: 'Transcription saved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to save transcription'
        });
    }
});

export default router;
