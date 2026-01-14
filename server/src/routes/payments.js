import express from 'express';
import { protect } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// @route   POST /api/payments/create
// @desc    Create payment for appointment
// @access  Private
router.post('/create', protect, async (req, res) => {
    try {
        const { appointmentId, amount, sourceId } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        // In production, integrate with Square API
        // For hackathon demo, simulate payment
        const paymentResult = {
            id: `pay_${Date.now()}`,
            status: 'COMPLETED',
            amount: amount,
            currency: 'INR',
            createdAt: new Date().toISOString()
        };

        // TODO: Replace with actual Square API call
        /*
        const squareClient = new Client({
          accessToken: process.env.SQUARE_ACCESS_TOKEN,
          environment: process.env.SQUARE_ENVIRONMENT
        });
    
        const response = await squareClient.paymentsApi.createPayment({
          sourceId,
          idempotencyKey: uuidv4(),
          amountMoney: {
            amount: amount * 100, // Convert to cents
            currency: 'INR'
          }
        });
        */

        // Update appointment payment status
        appointment.paymentStatus = 'paid';
        appointment.paymentId = paymentResult.id;
        appointment.status = 'confirmed';
        await appointment.save();

        res.json({
            success: true,
            payment: paymentResult,
            appointment
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment processing failed'
        });
    }
});

// @route   GET /api/payments/:appointmentId
// @desc    Get payment status for appointment
// @access  Private
router.get('/:appointmentId', protect, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId)
            .select('paymentStatus paymentId amount');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.json({
            success: true,
            paymentStatus: appointment.paymentStatus,
            paymentId: appointment.paymentId,
            amount: appointment.amount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching payment status'
        });
    }
});

// @route   POST /api/payments/refund
// @desc    Refund payment
// @access  Private
router.post('/refund', protect, async (req, res) => {
    try {
        const { appointmentId } = req.body;

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        if (appointment.paymentStatus !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'No payment to refund'
            });
        }

        // In production, process refund via Square
        appointment.paymentStatus = 'refunded';
        appointment.status = 'cancelled';
        await appointment.save();

        res.json({
            success: true,
            message: 'Refund processed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Refund processing failed'
        });
    }
});

export default router;
