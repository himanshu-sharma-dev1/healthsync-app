import { Link } from 'react-router-dom';
import './Home.css';

// Import generated images
import heroIllustration from '../assets/images/hero_illustration_1768411058198.png';
import doctorFemale from '../assets/images/doctor_avatar_female_1768411074828.png';
import videoCallFeature from '../assets/images/video_call_feature_1768411109016.png';
import chatFeature from '../assets/images/chat_feature_1768411194744.png';
import paymentSecure from '../assets/images/payment_secure_1768411142589.png';
import appointmentCalendar from '../assets/images/appointment_calendar_1768411210779.png';

const Home = () => {
    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Healthcare Access
                            <span className="highlight"> From Anywhere</span>
                        </h1>
                        <p className="hero-subtitle">
                            Connect with top doctors instantly through secure video consultations.
                            Quality healthcare at your fingertips, anytime, anywhere.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/doctors" className="btn btn-primary btn-lg">
                                Find a Doctor
                            </Link>
                            <Link to="/register" className="btn btn-outline btn-lg">
                                Get Started
                            </Link>
                        </div>

                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Doctors</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">Consultations</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">4.9</span>
                                <span className="stat-label">Rating</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="hero-card">
                            <div className="card-header">
                                <img
                                    src={doctorFemale}
                                    alt="Dr. Sarah Johnson"
                                    className="doctor-avatar-img"
                                />
                                <div className="doctor-info">
                                    <h4>Dr. Sarah Johnson</h4>
                                    <p>Cardiologist</p>
                                </div>
                                <span className="badge badge-success">Online</span>
                            </div>
                            <div className="card-body">
                                <p>Ready for your consultation?</p>
                                <button className="btn btn-primary">Start Video Call</button>
                            </div>
                        </div>

                        {/* Hero illustration */}
                        <div className="hero-illustration">
                            <img src={heroIllustration} alt="Telehealth Consultation" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title text-center">Why Choose HealthSync?</h2>
                    <p className="section-subtitle text-center text-secondary">
                        Experience the future of healthcare with our comprehensive telehealth platform
                    </p>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon-img">
                                <img src={videoCallFeature} alt="Video Consultations" />
                            </div>
                            <h3>Video Consultations</h3>
                            <p>HD video calls with doctors, just like an in-person visit. No commute needed.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-img">
                                <img src={paymentSecure} alt="Secure Payments" />
                            </div>
                            <h3>Secure Payments</h3>
                            <p>Pay safely before your consultation with our encrypted payment gateway.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-img">
                                <img src={chatFeature} alt="Real-time Chat" />
                            </div>
                            <h3>Real-time Chat</h3>
                            <p>Share documents, images, and chat with your doctor during sessions.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🎙️</div>
                            <h3>Transcription</h3>
                            <p>AI-powered transcription overcomes dialect and accent barriers.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>Privacy First</h3>
                            <p>Your health data is encrypted and stored securely. HIPAA compliant.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-img">
                                <img src={appointmentCalendar} alt="Access Anywhere" />
                            </div>
                            <h3>Easy Scheduling</h3>
                            <p>Book appointments easily with our intuitive calendar system.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title text-center">How It Works</h2>

                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Find a Doctor</h3>
                            <p>Search by specialty, availability, or location</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Book & Pay</h3>
                            <p>Choose your time slot and pay securely</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Consult</h3>
                            <p>Join your video consultation at the scheduled time</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Get Started?</h2>
                        <p>Join thousands of patients who trust HealthSync for their healthcare needs.</p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="brand-icon">🏥</span>
                            <span>HealthSync</span>
                        </div>
                        <p className="footer-text">
                            © 2026 HealthSync. Built for Veersa Hackathon.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
