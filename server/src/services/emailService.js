// Email Service using Nodemailer with Gmail SMTP
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Initialize SendGrid if API key exists
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create Nodemailer transporter with Gmail SMTP
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // Use TLS
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send email using SendGrid or Gmail SMTP (auto-selects based on env)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    const provider = process.env.EMAIL_PROVIDER || 'gmail';

    // Try SendGrid first if configured
    if (provider === 'sendgrid' && process.env.SENDGRID_API_KEY) {
        try {
            const msg = {
                to,
                from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_USER,
                subject,
                text: text || '',
                html: html || ''
            };

            const result = await sgMail.send(msg);
            console.log('✅ Email sent via SendGrid:', result[0]?.statusCode);
            return { success: true, provider: 'sendgrid' };
        } catch (error) {
            console.error('❌ SendGrid error:', error.message);
            console.log('⚠️ Falling back to Gmail SMTP...');
        }
    }

    // Fallback to Gmail SMTP
    const transporter = createTransporter();

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'HealthSync'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to,
        subject,
        text: text || '',
        html: html || ''
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent via Gmail SMTP:', info.messageId);
        return { success: true, messageId: info.messageId, provider: 'gmail' };
    } catch (error) {
        console.error('❌ Gmail SMTP error:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send appointment booking confirmation
 */
export const sendBookingConfirmation = async (appointment, patientEmail) => {
    const { doctor, date, time, id, specialty } = appointment;

    const subject = `✅ Appointment Confirmed with ${doctor}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); padding: 30px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 24px; }
                .content { padding: 30px; }
                .appointment-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .detail { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
                .detail:last-child { border-bottom: none; }
                .label { color: #64748b; }
                .value { font-weight: 600; color: #1e293b; }
                .btn { display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏥 HealthSync</h1>
                    <p>Your Appointment is Confirmed!</p>
                </div>
                <div class="content">
                    <h2>Hello!</h2>
                    <p>Your video consultation has been successfully booked. Here are the details:</p>
                    
                    <div class="appointment-card">
                        <div class="detail">
                            <span class="label">🩺 Doctor</span>
                            <span class="value">${doctor}</span>
                        </div>
                        <div class="detail">
                            <span class="label">🏥 Specialty</span>
                            <span class="value">${specialty || 'General Physician'}</span>
                        </div>
                        <div class="detail">
                            <span class="label">📅 Date</span>
                            <span class="value">${date}</span>
                        </div>
                        <div class="detail">
                            <span class="label">⏰ Time</span>
                            <span class="value">${time}</span>
                        </div>
                        <div class="detail">
                            <span class="label">🆔 Appointment ID</span>
                            <span class="value">${id}</span>
                        </div>
                    </div>
                    
                    <p><strong>Important:</strong> Please join 5 minutes before your scheduled time.</p>
                    
                    <center>
                        <a href="${process.env.CLIENT_URL}/waiting-room/${id}" class="btn">
                            📹 Join Consultation
                        </a>
                    </center>
                    
                    <h3>Prepare for your consultation:</h3>
                    <ul>
                        <li>Have your previous medical records ready</li>
                        <li>Prepare a list of symptoms to discuss</li>
                        <li>Ensure stable internet connection</li>
                        <li>Find a quiet, private space</li>
                    </ul>
                </div>
                <div class="footer">
                    <p>You will receive a reminder 1 hour before your appointment.</p>
                    <p>© 2026 HealthSync. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: patientEmail,
        subject,
        html
    });
};

/**
 * Send appointment reminder (1 hour before)
 */
export const sendAppointmentReminder = async (appointment, patientEmail) => {
    const { doctor, date, time, id } = appointment;

    const subject = `⏰ Reminder: Your appointment with ${doctor} is in 1 hour`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #fff3cd; border: 2px solid #ffc107; border-radius: 12px; padding: 30px; }
                .btn { display: inline-block; background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>⏰ Appointment Reminder</h1>
                <p>Your appointment with <strong>${doctor}</strong> is starting in <strong>1 hour</strong>!</p>
                <p>📅 ${date} at ${time}</p>
                <center>
                    <a href="${process.env.CLIENT_URL}/waiting-room/${id}" class="btn">
                        📹 Join Now
                    </a>
                </center>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to: patientEmail, subject, html });
};

/**
 * Send prescription to patient
 */
export const sendPrescriptionEmail = async (prescription, patientEmail) => {
    const { doctor, patient, diagnosis, medications, advice, followUpDays } = prescription;

    const subject = `📋 Your Prescription from ${doctor}`;

    const medicationsList = medications?.map(med =>
        `<li><strong>${med.name}</strong> ${med.dosage} - ${med.frequency} for ${med.duration}</li>`
    ).join('') || '<li>No medications prescribed</li>';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; }
                .header { background: #10b981; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
                .section { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
                ul { padding-left: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📋 Your Prescription</h1>
                    <p>From ${doctor}</p>
                </div>
                
                <div class="section">
                    <h3>🩺 Diagnosis</h3>
                    <p>${diagnosis || 'Consultation completed'}</p>
                </div>
                
                <div class="section">
                    <h3>💊 Medications</h3>
                    <ul>${medicationsList}</ul>
                </div>
                
                ${advice ? `
                <div class="section">
                    <h3>📝 Instructions</h3>
                    <p>${advice}</p>
                </div>
                ` : ''}
                
                ${followUpDays ? `
                <div class="section">
                    <h3>📅 Follow-up</h3>
                    <p>Schedule a follow-up in <strong>${followUpDays} days</strong></p>
                </div>
                ` : ''}
                
                <p><em>This is a computer-generated prescription. Please follow your doctor's advice.</em></p>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to: patientEmail, subject, html });
};

export default {
    sendEmail,
    sendBookingConfirmation,
    sendAppointmentReminder,
    sendPrescriptionEmail
};
