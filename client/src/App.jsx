import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import VideoCall from './pages/VideoCall';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/video/:appointmentId" element={<VideoCall />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
