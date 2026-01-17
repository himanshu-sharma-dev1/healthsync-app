import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const userSchema = new mongoose.Schema({
    email: String,
    role: String
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const user = await User.findOne({ email: 'patient@demo.com' });

        if (user) {
            console.log('✅ User found:', user.email, 'Role:', user.role);
        } else {
            console.log('❌ User patient@demo.com NOT FOUND');
            console.log('Running seed...');
            // We could trigger seed here, but better to just report it
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
