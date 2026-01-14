import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    scheduledTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        default: 30 // minutes
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    // Video call details
    roomName: {
        type: String
    },
    roomUrl: {
        type: String
    },
    // Consultation notes
    symptoms: {
        type: String
    },
    diagnosis: {
        type: String
    },
    prescription: {
        type: String
    },
    notes: {
        type: String
    },
    // Transcription
    transcription: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent double booking
appointmentSchema.index({ doctor: 1, scheduledDate: 1, scheduledTime: 1 }, { unique: true });
appointmentSchema.index({ patient: 1, scheduledDate: 1, scheduledTime: 1 }, { unique: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
