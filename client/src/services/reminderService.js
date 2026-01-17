// Reminder Service - Simulated Email/SMS Notifications
// In production, this would use Twilio, SendGrid, or similar

const REMINDER_STORAGE_KEY = 'healthsync_reminders';

// Simulate sending an email
export const sendEmailReminder = async (to, subject, body) => {
    console.log(`📧 Sending email to ${to}:`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${body}`);

    // Store in localStorage to show in UI
    const reminders = JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY) || '[]');
    reminders.push({
        id: `email-${Date.now()}`,
        type: 'email',
        to,
        subject,
        body,
        sentAt: new Date().toISOString(),
        status: 'sent'
    });
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));

    return { success: true, messageId: `msg-${Date.now()}` };
};

// Simulate sending an SMS
export const sendSMSReminder = async (phone, message) => {
    console.log(`📱 Sending SMS to ${phone}:`);
    console.log(`   Message: ${message}`);

    const reminders = JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY) || '[]');
    reminders.push({
        id: `sms-${Date.now()}`,
        type: 'sms',
        to: phone,
        message,
        sentAt: new Date().toISOString(),
        status: 'sent'
    });
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));

    return { success: true, messageId: `sms-${Date.now()}` };
};

// Schedule appointment reminder
export const scheduleAppointmentReminder = async (appointment, patientEmail, patientPhone) => {
    const { doctor, date, time, id } = appointment;

    // Email reminder
    const emailSubject = `Appointment Reminder: ${doctor} on ${date}`;
    const emailBody = `
        Dear Patient,
        
        This is a reminder for your upcoming appointment:
        
        🩺 Doctor: ${doctor}
        📅 Date: ${date}
        ⏰ Time: ${time}
        📍 Type: Video Consultation
        
        Please join 5 minutes before your scheduled time.
        
        Join Link: ${window.location.origin}/waiting-room/${id}
        
        Best regards,
        HealthSync Team
    `;

    await sendEmailReminder(patientEmail || 'patient@email.com', emailSubject, emailBody);

    // SMS reminder
    const smsMessage = `HealthSync Reminder: Your video consultation with ${doctor} is scheduled for ${date} at ${time}. Join: ${window.location.origin}/waiting-room/${id}`;

    await sendSMSReminder(patientPhone || '+91XXXXXXXXXX', smsMessage);

    return { emailSent: true, smsSent: true };
};

// Send booking confirmation
export const sendBookingConfirmation = async (appointment, patientEmail) => {
    const { doctor, date, time, id } = appointment;

    const subject = `Appointment Confirmed with ${doctor}`;
    const body = `
        Your appointment has been successfully booked!
        
        🩺 Doctor: ${doctor}
        📅 Date: ${date}
        ⏰ Time: ${time}
        🆔 Appointment ID: ${id}
        
        You will receive a reminder 1 hour before your appointment.
        
        To prepare for your consultation:
        • Have your previous medical records ready
        • Prepare a list of symptoms to discuss
        • Ensure stable internet connection
        
        Best regards,
        HealthSync Team
    `;

    await sendEmailReminder(patientEmail || 'patient@email.com', subject, body);

    return { success: true };
};

// Get all sent reminders (for dashboard display)
export const getSentReminders = () => {
    return JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY) || '[]');
};

// Clear reminder history
export const clearReminderHistory = () => {
    localStorage.removeItem(REMINDER_STORAGE_KEY);
};

export default {
    sendEmailReminder,
    sendSMSReminder,
    scheduleAppointmentReminder,
    sendBookingConfirmation,
    getSentReminders,
    clearReminderHistory
};
