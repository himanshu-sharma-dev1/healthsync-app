import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Correct path: from client/tasks/ to server/.env is ../../server/.env
const envPath = path.join(__dirname, '../../server/.env');

console.log(`Reading .env from ${envPath}`);

let DAILY_API_KEY = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        if (line.trim().startsWith('DAILY_API_KEY=')) {
            DAILY_API_KEY = line.split('=')[1].trim();
            break;
        }
    }
} catch (e) {
    console.error('Failed to read .env file:', e.message);
    process.exit(1);
}

if (!DAILY_API_KEY || DAILY_API_KEY === 'your_daily_api_key_here') {
    console.error('❌ DAILY_API_KEY not found or default in server/.env');
    console.log('Value found:', DAILY_API_KEY);
    process.exit(1);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ with native fetch support.');
    process.exit(1);
}

console.log(`Checking Daily.co API with key ending in ...${DAILY_API_KEY.slice(-4)}`);

async function verifyVideo() {
    try {
        // Create a test room with a 5 minute expiration
        const roomName = `test-verify-${Date.now()}`;
        console.log(`Attempting to create room: ${roomName}`);

        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DAILY_API_KEY}`
            },
            body: JSON.stringify({
                name: roomName,
                privacy: 'private',
                properties: {
                    max_participants: 2,
                    exp: Math.round(Date.now() / 1000) + 300 // 5 minutes
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Daily.co API Verification Successful!');
        console.log('----------------------------------------');
        console.log('Room Name:', data.name);
        console.log('Room URL: ', data.url);
        console.log('Privacy:  ', data.privacy);
        console.log('----------------------------------------');

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
        process.exit(1);
    }
}

verifyVideo();
