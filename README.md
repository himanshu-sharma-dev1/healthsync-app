# HealthSync 🏥

**Telehealth Solution for Access to Healthcare from Anywhere**

> Veersa Hackathon 2026 | Team HealthSync

---

## 🎯 Problem Statement

Post pandemic, quick access to quality, affordable and reliable healthcare from anywhere is the need of the hour. People are confined in remote locations and need a digitally enabled solution for instant healthcare access.

## 💡 Our Solution

HealthSync is a comprehensive telehealth platform that provides:

- 📹 **Instant Video Consultations** - Similar to in-person experience
- 💳 **Secure Payments** - Pay before consultation begins
- 💬 **Real-time Chat** - Communicate during sessions
- 🎙️ **Transcription** - Overcome dialect/accent challenges
- 🔒 **Privacy First** - Secure PHI data handling

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Video | Daily.co WebRTC |
| Payments | Square API |
| Transcription | DeepGram |
| Hosting | Vercel + Railway |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account

### Installation

```bash
# Clone the repository
git clone https://github.com/himanshu-sharma-dev1/healthsync-app.git

# Install frontend dependencies
cd client && npm install

# Install backend dependencies
cd ../server && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run development servers
npm run dev
```

## 📁 Project Structure

```
healthsync-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom hooks
│   │   └── services/       # API service functions
│   └── ...
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation
│   │   └── config/         # Database, API configs
│   └── tests/              # API tests
└── docs/                   # Documentation
    ├── requirements.md
    ├── test_cases.md
    └── DESIGN.md
```

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Figma Designs**: [Coming Soon]
- **API Documentation**: [Coming Soon]

## 👥 Team HealthSync

| Name | Role | GitHub |
|------|------|--------|
| Himanshu Sharma | Full-Stack Lead | [@himanshu-sharma-dev1](https://github.com/himanshu-sharma-dev1) |
| [Teammate 1] | [Role] | [GitHub] |
| [Teammate 2] | [Role] | [GitHub] |
| [Teammate 3] | [Role] | [GitHub] |

## 📝 License

This project is created for Veersa Hackathon 2026.

---

*Built with ❤️ for better healthcare access*
