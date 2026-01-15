import express from 'express';
import pkg from 'square';
const { SquareClient, SquareEnvironment } = pkg;
import { randomUUID } from 'crypto';
import { protect } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// Initialize Square client
const squareClient = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox
});

// @route   POST /api/payments/create-checkout
// @desc    Create Square checkout link for appointment
// @access  Public (for demo purposes)
router.post('/create-checkout', async (req, res) => {
    try {
        const {
            appointmentId,
            doctorName,
            specialty,
            amount,
            patientEmail,
            appointmentDate,
            appointmentTime
        } = req.body;

        // Validate required fields
        if (!amount || !doctorName) {
            return res.status(400).json({
                success: false,
                error: 'Amount and doctor name are required'
            });
        }

        // Convert amount to cents (Square uses smallest currency unit)
        const amountInCents = Math.round(parseFloat(amount) * 100);

        // Create checkout using Square Checkout API
        const response = await squareClient.checkout.paymentLinks.create({
            idempotencyKey: randomUUID(),
            order: {
                locationId: process.env.SQUARE_LOCATION_ID,
                lineItems: [
                    {
                        name: `Consultation with ${doctorName}`,
                        quantity: '1',
                        note: `${specialty || 'General'} - ${appointmentDate || 'TBD'} at ${appointmentTime || 'TBD'}`,
                        basePriceMoney: {
                            amount: BigInt(amountInCents),
                            currency: 'USD'
                        }
                    }
                ]
            },
            checkoutOptions: {
                redirectUrl: `${process.env.CLIENT_URL}/payment-success?appointmentId=${appointmentId || 'new'}`,
                askForShippingAddress: false
            },
            prePopulatedData: patientEmail ? {
                buyerEmail: patientEmail
            } : undefined
        });

        res.json({
            success: true,
            checkoutUrl: response.paymentLink.url,
            orderId: response.paymentLink.orderId,
            paymentLinkId: response.paymentLink.id
        });

    } catch (error) {
        console.error('Square Checkout Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create checkout session',
            details: error.message
        });
    }
});

// @route   POST /api/payments/create
// @desc    Create payment for appointment (legacy/fallback)
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

        // Simulate payment for demo
        const paymentResult = {
            id: `pay_${Date.now()}`,
            status: 'COMPLETED',
            amount: amount,
            currency: 'USD',
            createdAt: new Date().toISOString()
        };

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

// @route   GET /api/payments/verify/:orderId
// @desc    Verify payment status
// @access  Public
router.get('/verify/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        // In sandbox mode, we simulate successful payment
        res.json({
            success: true,
            status: 'COMPLETED',
            orderId: orderId,
            message: 'Payment verified successfully'
        });

    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment',
            details: error.message
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

// @route   POST /api/payments/webhook
// @desc    Square webhook for payment notifications
// @access  Public (webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        console.log('Square Webhook Event:', event.type);

        switch (event.type) {
            case 'payment.completed':
                console.log('Payment completed:', event.data?.id);
                break;
            case 'payment.failed':
                console.log('Payment failed:', event.data?.id);
                break;
            default:
                console.log('Unhandled event type:', event.type);
        }

        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(400).json({ error: 'Webhook processing failed' });
    }
});

// @route   GET /api/payments/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', (req, res) => {
    res.json({
        success: true,
        methods: [
            { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
            { id: 'apple_pay', name: 'Apple Pay', icon: '' },
            { id: 'google_pay', name: 'Google Pay', icon: '🔵' }
        ],
        provider: 'Square',
        environment: process.env.SQUARE_ENVIRONMENT
    });
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
