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
        console.log('📹 Creating video room for appointment:', appointmentId);

        // Check if this is a valid MongoDB ObjectId (24 hex characters)
        const isValidObjectId = appointmentId && /^[a-fA-F0-9]{24}$/.test(appointmentId);

        // Handle demo/invalid appointments - create real Daily.co room for any non-ObjectId
        if (!isValidObjectId) {
            // Use appointmentId as room name so all participants join the same room
            const demoRoomName = `room-${appointmentId || 'demo'}`;
            console.log('📹 Demo mode - using room:', demoRoomName);

            try {
                console.log('📹 Calling Daily.co API with key:', process.env.DAILY_API_KEY?.substring(0, 10) + '...');
                const response = await fetch('https://api.daily.co/v1/rooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
                    },
                    body: JSON.stringify({
                        name: demoRoomName,
                        properties: {
                            enable_chat: true,
                            enable_screenshare: true,
                            max_participants: 10,
                            exp: Math.round(Date.now() / 1000) + 7200 // 2 hours
                        }
                    })
                });

                const roomData = await response.json();
                console.log('📹 Daily.co API response:', JSON.stringify(roomData));

                // If room already exists, Daily.co returns error - use existing room
                let roomUrl;
                if (roomData.error && roomData.info?.includes('already exists')) {
                    console.log('📹 Room already exists, using existing room');
                    roomUrl = `https://healthsyncnew.daily.co/${demoRoomName}`;
                } else {
                    roomUrl = roomData.url || `https://healthsyncnew.daily.co/${demoRoomName}`;
                }
                console.log('✅ Room ready:', roomUrl);

                return res.json({
                    success: true,
                    room: roomData,
                    roomUrl: roomUrl
                });
            } catch (err) {
                console.error('Demo room creation failed:', err);
                return res.json({
                    success: true,
                    demoMode: true,
                    roomUrl: `https://healthsyncnew.daily.co/${demoRoomName}`
                });
            }
        }

        // Real appointment flow - valid ObjectId
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            // If appointment not found, still create a demo room
            console.log('📹 Appointment not found, creating demo room');
            const demoRoomName = `room-${appointmentId}`;

            const response = await fetch('https://api.daily.co/v1/rooms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
                },
                body: JSON.stringify({
                    name: demoRoomName,
                    properties: {
                        enable_chat: true,
                        enable_screenshare: true,
                        max_participants: 2,
                        exp: Math.round(Date.now() / 1000) + 3600
                    }
                })
            });

            const roomData = await response.json();
            return res.json({
                success: true,
                room: roomData,
                roomUrl: roomData.url || `https://healthsyncnew.daily.co/${demoRoomName}`
            });
        }

        // Generate unique room name
        const roomName = appointment.roomName || `healthsync-${appointmentId}`;

        // Create room via Daily.co API
        console.log('📹 Calling Daily.co API to create room:', roomName);

        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DAILY_API_KEY}`
            },
            body: JSON.stringify({
                name: roomName,
                properties: {
                    enable_chat: true,
                    enable_screenshare: true,
                    max_participants: 2,
                    exp: Math.round(Date.now() / 1000) + 3600
                }
            })
        });

        const roomData = await response.json();

        if (roomData.error) {
            console.error('Daily.co API Error:', roomData);
            // If room already exists, construct URL
            if (roomData.info?.includes('already exists')) {
                roomData.url = `https://healthsyncnew.daily.co/${roomName}`;
            } else {
                throw new Error(roomData.info || 'Failed to create room');
            }
        }

        console.log('✅ Room created:', roomData.url);

        // Update appointment with room URL
        appointment.roomUrl = roomData.url;
        appointment.roomName = roomName;
        appointment.status = 'in-progress';
        await appointment.save();

        res.json({
            success: true,
            room: roomData,
            roomUrl: roomData.url
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create video room',
            error: error.message
        });
    }
});

// @route   GET /api/video/room/:appointmentId
// @desc    Get room details for appointment
// @access  Private
router.get('/room/:appointmentId', protect, async (req, res) => {
    try {
        const { appointmentId } = req.params;

        // Check if this is a valid MongoDB ObjectId
        const isValidObjectId = appointmentId && /^[a-fA-F0-9]{24}$/.test(appointmentId);

        // For demo/invalid IDs, return a demo room response
        if (!isValidObjectId) {
            console.log('📹 Demo appointment - returning demo room URL');
            return res.json({
                success: true,
                demoMode: true,
                roomName: `demo-${Date.now()}`,
                roomUrl: `https://healthsyncnew.daily.co/demo-${Date.now()}`,
                token: {
                    room_name: 'demo',
                    user_name: `${req.user.firstName} ${req.user.lastName}`,
                    is_owner: false
                },
                appointment: {
                    patient: { firstName: req.user.firstName, lastName: req.user.lastName },
                    doctor: { firstName: 'Demo', lastName: 'Doctor', specialty: 'General' }
                }
            });
        }

        const appointment = await Appointment.findById(appointmentId)
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
            roomUrl: appointment.roomUrl || `https://healthsyncnew.daily.co/${appointment.roomName}`,
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

// @route   GET /api/video/consultation-summary/:appointmentId
// @desc    Get consultation summary with real data
// @access  Private
router.get('/consultation-summary/:appointmentId', protect, async (req, res) => {
    try {
        const appointmentId = req.params.appointmentId;

        // Check if it's a valid MongoDB ObjectId
        const isValidObjectId = /^[a-f\d]{24}$/i.test(appointmentId);

        if (!isValidObjectId) {
            // Demo mode - return realistic placeholder data
            const demoSummary = {
                success: true,
                doctorName: 'Dr. Sarah Johnson',
                specialty: 'General Medicine',
                date: new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                duration: '15 minutes',
                diagnosis: 'General health consultation completed',
                recommendations: [
                    'Stay hydrated and get adequate rest',
                    'Follow up if symptoms persist',
                    'Continue any prescribed medications'
                ],
                prescriptions: [],
                nextSteps: 'Schedule a follow-up appointment in 2 weeks if needed',
                transcriptSummary: 'Live transcription was available during this call'
            };
            return res.json(demoSummary);
        }

        const appointment = await Appointment.findById(appointmentId)
            .populate('doctor', 'firstName lastName specialty')
            .populate('patient', 'firstName lastName');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // Calculate duration
        let durationText = 'Unknown';
        if (appointment.duration) {
            const mins = Math.floor(appointment.duration / 60);
            const secs = appointment.duration % 60;
            durationText = mins > 0 ? `${mins} minute${mins > 1 ? 's' : ''}` : `${secs} seconds`;
        }

        // Build real summary from appointment data
        const summary = {
            success: true,
            doctorName: appointment.doctor ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}` : 'Your Doctor',
            specialty: appointment.specialty || appointment.doctor?.specialty || 'General Practice',
            date: appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
            duration: durationText,
            diagnosis: appointment.diagnosis || 'Consultation completed - diagnosis to be provided',
            recommendations: appointment.recommendations || ['Follow up with your doctor if symptoms persist', 'Take prescribed medications as directed'],
            prescriptions: appointment.prescriptions || [],
            nextSteps: appointment.nextSteps || 'Schedule a follow-up appointment if needed',
            transcriptSummary: appointment.transcription ? 'Transcription available' : null
        };

        res.json(summary);
    } catch (error) {
        console.error('Consultation summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch consultation summary'
        });
    }
});

export default router;
