# HealthSync - Veersa Hackathon 2026 Project

## 🏥 Project Overview
HealthSync is a comprehensive telehealth platform designed for the Veersa Hackathon 2026. It addresses the "Telehealth Solution" use case by providing instant video consultations, secure payments, real-time chat, and AI-powered transcription.

## 📋 Hackathon Compliance Status
- **Team Name:** HealthSync
- **Problem Statement:** Use Case 2 - Telehealth Solution
- **Deadline:** Jan 18, 2026

### ⚠️ Critical Action Items
1. **Design File:** Missing Figma/Adobe XD file (Required).
2. **Deployment:** Needs hosting (Client -> Vercel, Server -> DigitalOcean/Railway).
3. **Demo Video:** 5-minute presentation video needs recording.
4. **Git History:** ✅ Good (Verified ~10+ meaningful commits).

## 🛠 Tech Stack
- **Frontend:** React + Vite (Port 5173)
- **Backend:** Node.js + Express (Port 5000)
- **Database:** MongoDB Atlas
- **Video:** Daily.co WebRTC
- **Payments:** Square API
- **Transcription:** DeepGram
- **Real-time:** Socket.io

## 🚀 Common Commands

### Setup
```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Environment Variables
# Ensure .env exists in server/ and client/
```

### Development
```bash
# Run Backend (Terminal 1)
cd server
npm run dev

# Run Frontend (Terminal 2)
cd client
npm run dev
```

### Testing
```bash
# Backend Tests
cd server
npm test
```

## 📂 Key File Structure
- `client/src/services`: API integrations (Square, Daily, DeepGram)
- `server/src/controllers`: Business logic
- `docs/`: Compliance and documentation files

## 🧠 Memory Bank
- **Auth:** JWT-based.
- **Payment Flow:** Create payment intent -> Client enters card -> Verification.
- **Video:** Daily.co rooms created dynamically per appointment.
- **Transcription:** Real-time via DeepGram WebSocket.

---
*Created by Claude for HealthSync Context*
