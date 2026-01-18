import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';

// Route imports
import authRoutes from './routes/auth.js';
import appointmentRoutes from './routes/appointments.js';
import doctorRoutes from './routes/doctors.js';
import paymentRoutes from './routes/payments.js';
import videoRoutes from './routes/video.js';
import transcriptionRoutes, { setupTranscriptionWebSocket } from './routes/transcription.js';
import aiRoutes from './routes/ai.js';
import stripeRoutes from './routes/stripe.js';
import googleAuthRoutes from './routes/googleAuth.js';
import passwordResetRoutes from './routes/passwordReset.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io for real-time chat
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// ============================================
// HIPAA COMPLIANT SECURITY MIDDLEWARE
// ============================================

// Trust proxy for DigitalOcean/Nginx reverse proxy (fixes rate limiter CORS issue)
app.set('trust proxy', 1);

// CORS - MUST come first to handle preflight OPTIONS requests
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Security headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Disable for dev, enable in production
  crossOriginEmbedderPolicy: false
}));

// Rate limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 login attempts per hour
  message: { success: false, message: 'Too many login attempts, please try again later' }
});
app.use('/api/auth/login', authLimiter);

// Audit logging middleware - Track PHI access (HIPAA requirement)
app.use((req, res, next) => {
  const sensitiveRoutes = ['/api/appointments', '/api/video', '/api/transcription'];
  if (sensitiveRoutes.some(route => req.path.startsWith(route))) {
    console.log(`[AUDIT] ${new Date().toISOString()} | ${req.method} ${req.path} | IP: ${req.ip} | User: ${req.user?.id || 'anonymous'}`);
  }
  next();
});

// Security headers for PHI protection
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

console.log('🔒 HIPAA Security: Enabled (Helmet, Rate Limiting, Audit Logging)');

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes); // Google OAuth routes
app.use('/api/auth', passwordResetRoutes); // Password reset routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/transcription', transcriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HealthSync API is running',
    features: {
      payments: 'Square',
      transcription: 'DeepGram',
      video: 'Daily.co',
      database: 'MongoDB Atlas',
      ai: process.env.GEMINI_API_KEY ? 'Google Gemini' : 'not configured'
    }
  });
});

// Socket.io chat handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('chat-message', ({ roomId, message, sender }) => {
    io.to(roomId).emit('new-message', { message, sender, timestamp: new Date() });
  });

  // Typing indicators
  socket.on('typing', ({ roomId, user }) => {
    socket.to(roomId).emit('user-typing', { user });
  });

  socket.on('stop-typing', ({ roomId }) => {
    socket.to(roomId).emit('user-stopped-typing');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
  console.log(`🏥 HealthSync server running on port ${PORT}`);
  console.log(`💳 Square Payments: ${process.env.SQUARE_ENVIRONMENT || 'not configured'}`);
  console.log(`🎙️ DeepGram: ${process.env.DEEPGRAM_API_KEY ? 'configured' : 'not configured'}`);

  // Setup transcription WebSocket
  setupTranscriptionWebSocket(io);
});

export { io };
