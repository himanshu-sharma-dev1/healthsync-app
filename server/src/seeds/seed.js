import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

// User Schema (inline for seeding)
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['patient', 'doctor'], required: true },
    // Doctor specific fields
    specialty: { type: String },
    experience: { type: Number },
    consultationFee: { type: Number },
    availability: [{
        day: { type: String },
        slots: [{ type: String }]
    }],
    isVerified: { type: Boolean, default: true },
    bio: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Demo Doctors Data
const demoUserss = [
    // Demo Patients
    {
        firstName: 'Demo',
        lastName: 'Patient',
        email: 'patient@demo.com',
        password: 'password123',
        phone: '+91 98765 43210',
        role: 'patient'
    },
    // Demo Doctors
    {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@healthsync.com',
        password: 'password123',
        phone: '+91 98765 00001',
        role: 'doctor',
        specialty: 'Cardiologist',
        experience: 12,
        consultationFee: 800,
        bio: 'Experienced cardiologist specializing in preventive cardiology and heart disease management.',
        availability: [
            { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Friday', slots: ['09:00', '10:00', '11:00'] }
        ],
        isVerified: true
    },
    {
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@healthsync.com',
        password: 'password123',
        phone: '+91 98765 00002',
        role: 'doctor',
        specialty: 'General Physician',
        experience: 8,
        consultationFee: 500,
        bio: 'General physician with expertise in family medicine and preventive healthcare.',
        availability: [
            { day: 'Monday', slots: ['10:00', '11:00', '12:00', '16:00', '17:00'] },
            { day: 'Tuesday', slots: ['10:00', '11:00', '12:00', '16:00', '17:00'] },
            { day: 'Thursday', slots: ['10:00', '11:00', '12:00', '16:00', '17:00'] }
        ],
        isVerified: true
    },
    {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@healthsync.com',
        password: 'password123',
        phone: '+91 98765 00003',
        role: 'doctor',
        specialty: 'Dermatologist',
        experience: 6,
        consultationFee: 600,
        bio: 'Dermatologist specializing in skin conditions, cosmetic dermatology, and hair disorders.',
        availability: [
            { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '14:00'] },
            { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '14:00'] },
            { day: 'Saturday', slots: ['09:00', '10:00', '11:00'] }
        ],
        isVerified: true
    },
    {
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@healthsync.com',
        password: 'password123',
        phone: '+91 98765 00004',
        role: 'doctor',
        specialty: 'Orthopedic',
        experience: 15,
        consultationFee: 900,
        bio: 'Orthopedic surgeon with expertise in joint replacement and sports medicine.',
        availability: [
            { day: 'Monday', slots: ['14:00', '15:00', '16:00', '17:00'] },
            { day: 'Wednesday', slots: ['14:00', '15:00', '16:00', '17:00'] },
            { day: 'Friday', slots: ['14:00', '15:00', '16:00', '17:00'] }
        ],
        isVerified: true
    },
    {
        firstName: 'Aisha',
        lastName: 'Patel',
        email: 'aisha.patel@healthsync.com',
        password: 'password123',
        phone: '+91 98765 00005',
        role: 'doctor',
        specialty: 'Pediatrician',
        experience: 10,
        consultationFee: 550,
        bio: 'Pediatrician dedicated to child healthcare, vaccinations, and developmental assessments.',
        availability: [
            { day: 'Monday', slots: ['09:00', '10:00', '11:00', '12:00'] },
            { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '12:00'] },
            { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '12:00'] },
            { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '12:00'] },
            { day: 'Friday', slots: ['09:00', '10:00', '11:00', '12:00'] }
        ],
        isVerified: true
    },
    {
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@healthsync.com',
        password: 'password123',
        phone: '+91 98765 00006',
        role: 'doctor',
        specialty: 'Psychiatrist',
        experience: 14,
        consultationFee: 1000,
        bio: 'Psychiatrist specializing in anxiety, depression, and stress management.',
        availability: [
            { day: 'Tuesday', slots: ['14:00', '15:00', '16:00', '17:00', '18:00'] },
            { day: 'Thursday', slots: ['14:00', '15:00', '16:00', '17:00', '18:00'] },
            { day: 'Saturday', slots: ['10:00', '11:00', '12:00'] }
        ],
        isVerified: true
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/healthsync';
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Clear existing users
        console.log('🗑️ Clearing existing users...');
        await User.deleteMany({});

        // Hash passwords and insert users
        console.log('👤 Creating demo users and doctors...');
        for (const userData of demoUserss) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.password, salt);

            await User.create({
                ...userData,
                password: hashedPassword
            });
            console.log(`   ✅ Created: ${userData.email} (${userData.role})`);
        }

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Demo Credentials:');
        console.log('   Patient: patient@demo.com / password123');
        console.log('   Doctor: sarah.johnson@healthsync.com / password123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

seedDatabase();
