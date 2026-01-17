import express from 'express';
import Stripe from 'stripe';

const router = express.Router();

// Create Stripe Checkout Session
router.post('/create-session', async (req, res) => {
    try {
        // Initialize Stripe inside request handler (after dotenv is loaded)
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const { appointmentId, amount, doctorName, patientEmail } = req.body;

        // Convert amount to paisa (smallest currency unit for INR)
        const amountInPaisa = Math.round(amount * 100);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: patientEmail,
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Video Consultation with ${doctorName}`,
                            description: 'HealthSync Telemedicine Consultation',
                        },
                        unit_amount: amountInPaisa,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.CLIENT_URL}/waiting-room/${appointmentId}?payment=success&provider=stripe`,
            cancel_url: `${process.env.CLIENT_URL}/payment/${appointmentId}?payment=cancelled`,
            metadata: {
                appointmentId: appointmentId,
                provider: 'stripe'
            }
        });

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Stripe session creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Stripe checkout session',
            error: error.message
        });
    }
});

// Get Stripe publishable key (for frontend)
router.get('/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

export default router;
