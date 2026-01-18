import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/layout/Navbar';
import AccessibilityPanel from './components/AccessibilityPanel';
import OnboardingGuide from './components/OnboardingGuide';
import PerformanceMetrics from './components/PerformanceMetrics';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Appointments from './pages/Appointments';
import VideoCall from './pages/VideoCall';
import PatientIntake from './pages/PatientIntake';
import BookAppointment from './pages/BookAppointment';
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import WaitingRoom from './pages/WaitingRoom';
import ConsultationSummary from './pages/ConsultationSummary';
import EPrescription from './pages/EPrescription';
import DoctorPrescription from './pages/DoctorPrescription';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import Profile from './pages/Profile';
import './index.css';
import './theme.css';
import './animations.css';
import './components/ui.css';
import './responsive.css';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user needs onboarding (first-time visit)
  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    if (!onboardingComplete) {
      // Delay to let page load first
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  <Route path="/doctors" element={<Doctors />} />
                  <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />

                  {/* Patient Flow Routes */}
                  <Route path="/intake" element={<PatientIntake />} />
                  <Route path="/book/:doctorId" element={<BookAppointment />} />
                  <Route path="/payment/:appointmentId" element={<Payment />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/waiting-room/:appointmentId" element={<WaitingRoom />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/video/:appointmentId" element={<VideoCall />} />
                  <Route path="/video/room/:roomName" element={<VideoCall />} />
                  <Route path="/summary/:appointmentId" element={<ConsultationSummary />} />
                  <Route path="/prescription/:appointmentId" element={<EPrescription />} />
                  <Route path="/doctor-prescription/:appointmentId" element={<DoctorPrescription />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>

              {/* Global Components */}
              <AccessibilityPanel />
              <PerformanceMetrics />

              {/* First-time User Onboarding */}
              {showOnboarding && (
                <OnboardingGuide onComplete={() => setShowOnboarding(false)} />
              )}
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;


