import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../server/src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

async function checkUsers() {
    console.log('Connecting to MongoDB...');
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'email firstName lastName role');
        
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.email} (${u.firstName} ${u.lastName}) [${u.role}]`);
        });

        const targetEmail = 'patient@demo.com';
        const found = users.some(u => u.email === targetEmail);

        if (found) {
            console.log(`\n✅ User ${targetEmail} exists.`);
        } else {
            console.log(`\n❌ User ${targetEmail} DOES NOT exist.`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

checkUsers();
