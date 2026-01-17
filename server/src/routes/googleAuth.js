// Google OAuth Routes
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Initialize Google OAuth client
const getGoogleClient = () => {
    return new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

/**
 * GET /api/auth/google
 * Redirect to Google OAuth page
 */
router.get('/google', (req, res) => {
    const client = getGoogleClient();

    const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        prompt: 'consent'
    });

    res.redirect(authUrl);
});

/**
 * GET /api/auth/google/callback
 * Handle Google OAuth callback
 */
router.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_code`);
    }

    try {
        const client = getGoogleClient();

        // Exchange code for tokens
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Get user info from Google
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture, sub: googleId } = payload;

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user from Google account
            user = await User.create({
                email,
                firstName: given_name || 'User',
                lastName: family_name || '',
                password: `google_${googleId}_${Date.now()}`, // Random password for Google users
                role: 'patient',
                googleId,
                profileImage: picture,
                isGoogleUser: true
            });
            console.log('✅ New user created from Google:', email);
        } else if (!user.googleId) {
            // Link existing account with Google
            user.googleId = googleId;
            user.profileImage = user.profileImage || picture;
            user.isGoogleUser = true;
            await user.save();
            console.log('✅ Existing user linked with Google:', email);
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);

    } catch (error) {
        console.error('Google OAuth error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
});

/**
 * POST /api/auth/google/token
 * Verify Google ID token from frontend (for popup flow)
 */
router.post('/google/token', async (req, res) => {
    const { idToken, accessToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: 'ID token required' });
    }

    try {
        const client = getGoogleClient();

        // Verify the ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture, sub: googleId } = payload;

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                firstName: given_name || 'User',
                lastName: family_name || '',
                password: `google_${googleId}_${Date.now()}`,
                role: 'patient',
                googleId,
                profileImage: picture,
                isGoogleUser: true
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error('Google token verification error:', error);
        res.status(401).json({ message: 'Invalid Google token' });
    }
});

export default router;
