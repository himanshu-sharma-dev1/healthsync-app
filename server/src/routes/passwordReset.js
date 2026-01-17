// Password Reset Routes
import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

// Store reset tokens (in production, use Redis or database)
const resetTokens = new Map();

/**
 * POST /api/auth/forgot-password
 * Send password reset email
 */
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists
            return res.json({
                success: true,
                message: 'If an account exists with this email, you will receive a reset link.'
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 3600000; // 1 hour

        // Store token
        resetTokens.set(resetToken, {
            userId: user._id,
            email: user.email,
            expiry: tokenExpiry
        });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        // Send email
        const subject = '🔐 HealthSync Password Reset';
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); padding: 30px; text-align: center; color: white; }
                    .content { padding: 30px; }
                    .btn { display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
                    .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
                    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏥 HealthSync</h1>
                        <p>Password Reset Request</p>
                    </div>
                    <div class="content">
                        <h2>Hello ${user.firstName || 'User'}!</h2>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        
                        <center>
                            <a href="${resetUrl}" class="btn">🔐 Reset My Password</a>
                        </center>
                        
                        <div class="warning">
                            <strong>⚠️ Important:</strong>
                            <ul>
                                <li>This link expires in 1 hour</li>
                                <li>If you didn't request this, ignore this email</li>
                                <li>Never share this link with anyone</li>
                            </ul>
                        </div>
                        
                        <p style="color: #64748b; font-size: 12px;">
                            If the button doesn't work, copy this link:<br>
                            ${resetUrl}
                        </p>
                    </div>
                    <div class="footer">
                        <p>© 2026 HealthSync. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const result = await sendEmail({ to: email, subject, html });

        if (result.success) {
            console.log(`✅ Password reset email sent to ${email}`);
            res.json({
                success: true,
                message: 'Password reset link sent to your email.'
            });
        } else {
            res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        // Verify token
        const tokenData = resetTokens.get(token);

        if (!tokenData) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        if (Date.now() > tokenData.expiry) {
            resetTokens.delete(token);
            return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
        }

        // Find user and update password
        const user = await User.findById(tokenData.userId);

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Update password (the pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        // Delete used token
        resetTokens.delete(token);

        console.log(`✅ Password reset successful for ${user.email}`);

        // Send confirmation email
        await sendEmail({
            to: user.email,
            subject: '✅ HealthSync Password Changed',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Password Changed Successfully</h2>
                    <p>Hi ${user.firstName},</p>
                    <p>Your HealthSync password was successfully changed.</p>
                    <p>If you didn't make this change, please contact support immediately.</p>
                    <p>- HealthSync Team</p>
                </div>
            `
        });

        res.json({
            success: true,
            message: 'Password reset successful. You can now log in.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

/**
 * GET /api/auth/verify-reset-token/:token
 * Verify reset token is valid
 */
router.get('/verify-reset-token/:token', (req, res) => {
    const { token } = req.params;
    const tokenData = resetTokens.get(token);

    if (!tokenData || Date.now() > tokenData.expiry) {
        return res.status(400).json({ valid: false, message: 'Invalid or expired token' });
    }

    res.json({ valid: true, email: tokenData.email });
});

export default router;
