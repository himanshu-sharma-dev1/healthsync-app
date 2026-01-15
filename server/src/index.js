import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/transcription', transcriptionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'HealthSync API is running',
    features: {
      payments: 'Square',
      transcription: 'DeepGram',
      video: 'Daily.co',
      database: 'MongoDB Atlas'
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
  setupTranscriptionWebSocket(httpServer);
});

export { io };
