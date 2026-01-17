import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('--- Environment Variable Check ---');
console.log('Daily API Key present:', !!process.env.DAILY_API_KEY);
console.log('Square Token present:', !!process.env.SQUARE_ACCESS_TOKEN);
console.log('DeepGram Key present:', !!process.env.DEEPGRAM_API_KEY);
console.log('PORT:', process.env.PORT);
console.log('----------------------------------');
