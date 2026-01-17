import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Home.css';

// Import generated images
import heroIllustration from '../assets/images/hero_illustration_1768411058198.png';
import doctorFemale from '../assets/images/doctor_avatar_female_1768411074828.png';
import doctorMale from '../assets/images/doctor_avatar_male_1768411093398.png';
import videoCallFeature from '../assets/images/video_call_feature_1768411109016.png';
import chatFeature from '../assets/images/chat_feature_1768411194744.png';
import paymentSecure from '../assets/images/payment_secure_1768411142589.png';
import appointmentCalendar from '../assets/images/appointment_calendar_1768411210779.png';
import healthsyncLogo from '../assets/images/healthsync_logo_1768411126010.png';

const Home = () => {
    const { t } = useLanguage();

    return (
        <div className="home">
            {/* Hero Section - Enhanced */}
            <section className="hero hero-enhanced">
                <div className="hero-bg-gradient"></div>
                <div className="container">
                    <div className="hero-content">
                        <span className="hero-badge">🏥 #1 Telehealth Platform</span>
                        <h1 className="hero-title">
                            {t('heroTitle')}
                        </h1>
                        <p className="hero-subtitle">
                            {t('heroSubtitle')}
                        </p>
                        <div className="hero-buttons">
                            <Link to="/doctors" className="btn btn-primary btn-lg btn-glow">
                                🩺 {t('findDoctors')}
                            </Link>
                            <Link to="/register" className="btn btn-outline btn-lg">
                                ✨ {t('getStarted')}
                            </Link>
                        </div>

                        {/* Trust Indicators */}
                        <div className="trust-indicators">
                            <span>🔒 HIPAA Compliant</span>
                            <span>⚡ Instant Booking</span>
                            <span>💳 Secure Payments</span>
                        </div>
                    </div>

                    <div className="hero-visual">
                        {/* Doctor Preview Card */}
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
                                <Link to="/doctors" className="btn btn-primary btn-sm">📹 Start Video Call</Link>
                            </div>
                        </div>

                        {/* Stats Row - Below Card */}
                        <div className="hero-stats-row">
                            <div className="stat-item">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">{t('doctors')}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">50K+</span>
                                <span className="stat-label">{t('consultations')}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">4.9⭐</span>
                                <span className="stat-label">{t('rating')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Enhanced Grid */}
            <section className="features features-enhanced">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">✨ Our Features</span>
                        <h2 className="section-title">{t('whyChooseUs')}</h2>
                        <p className="section-subtitle">
                            {t('experienceFuture')}
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card feature-highlight">
                            <div className="feature-icon-img">
                                <img src={videoCallFeature} alt="Video Consultations" />
                            </div>
                            <h3>📹 {t('instantVideo')}</h3>
                            <p>{t('connectWithDoctors')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-img">
                                <img src={paymentSecure} alt="Secure Payments" />
                            </div>
                            <h3>💳 {t('securePayments')}</h3>
                            <p>{t('paymentDescription')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-img">
                                <img src={chatFeature} alt="Real-time Chat" />
                            </div>
                            <h3>💬 Real-time Chat</h3>
                            <p>Share documents, images, and chat with your doctor during sessions.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🎙️</div>
                            <h3>🎙️ {t('aiTranscription')}</h3>
                            <p>{t('transcriptionDescription')}</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>🔒 Privacy First</h3>
                            <p>Your health data is encrypted and stored securely. HIPAA compliant.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon-img">
                                <img src={appointmentCalendar} alt="Easy Scheduling" />
                            </div>
                            <h3>📅 Easy Scheduling</h3>
                            <p>Book appointments easily with our intuitive calendar system.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - Enhanced */}
            <section className="how-it-works how-it-works-enhanced">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">🚀 Simple Process</span>
                        <h2 className="section-title">{t('howItWorks')}</h2>
                    </div>

                    <div className="steps-enhanced">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <div className="step-icon">📋</div>
                            <h3>{t('step1Title')}</h3>
                            <p>{t('step1Desc')}</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <div className="step-icon">🩺</div>
                            <h3>{t('step2Title')}</h3>
                            <p>{t('step2Desc')}</p>
                        </div>
                        <div className="step-arrow">→</div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <div className="step-icon">📹</div>
                            <h3>{t('step3Title')}</h3>
                            <p>{t('step3Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section - 6 Reviews */}
            <section className="testimonials">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">⭐ Patient Reviews</span>
                        <h2 className="section-title">{t('testimonials')}</h2>
                        <p className="section-subtitle">{t('joinThousands')}</p>
                    </div>

                    <div className="testimonials-grid">
                        {/* Review 1 */}
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "HealthSync made it so easy to consult with a cardiologist from home. The video quality was excellent!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">RK</div>
                                <div>
                                    <strong>Rahul Kumar</strong>
                                    <span>Patient • Delhi</span>
                                </div>
                            </div>
                        </div>

                        {/* Review 2 - Featured */}
                        <div className="testimonial-card featured">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "The AI transcription feature is amazing! It helped me remember everything the doctor said."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">PS</div>
                                <div>
                                    <strong>Priya Sharma</strong>
                                    <span>Patient • Mumbai</span>
                                </div>
                            </div>
                        </div>

                        {/* Review 3 */}
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "As a doctor, HealthSync has streamlined my practice. The scheduling system is seamless!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">RP</div>
                                <div>
                                    <strong>Dr. Rajesh Patel</strong>
                                    <span>Cardiologist • Bangalore</span>
                                </div>
                            </div>
                        </div>

                        {/* Review 4 */}
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "Got my prescription within 15 minutes! The live chat during consultation was super helpful."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">AS</div>
                                <div>
                                    <strong>Anita Singh</strong>
                                    <span>Patient • Chennai</span>
                                </div>
                            </div>
                        </div>

                        {/* Review 5 */}
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "The payment was secure and instant. No hassle with insurance claims - just simple and direct!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">VK</div>
                                <div>
                                    <strong>Vijay Krishnan</strong>
                                    <span>Patient • Hyderabad</span>
                                </div>
                            </div>
                        </div>

                        {/* Review 6 */}
                        <div className="testimonial-card">
                            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                            <p className="testimonial-text">
                                "I love the privacy features. My health data feels safe and encrypted. Truly HIPAA compliant!"
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">MG</div>
                                <div>
                                    <strong>Meera Gupta</strong>
                                    <span>Patient • Kolkata</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Enhanced */}
            <section className="cta cta-enhanced">
                <div className="container">
                    <div className="cta-content">
                        <div className="cta-icon">🚀</div>
                        <h2>{t('readyToStart')}</h2>
                        <p>{t('joinThousands')}</p>
                        <div className="cta-buttons">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                ✨ {t('createAccount')}
                            </Link>
                            <Link to="/doctors" className="btn btn-secondary btn-lg">
                                🩺 {t('browseDoctors')}
                            </Link>
                        </div>
                        <p className="cta-note">No credit card required • Free consultation available</p>
                    </div>
                </div>
            </section>

            {/* Footer - Enhanced */}
            <footer className="footer footer-enhanced">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <img src={healthsyncLogo} alt="HealthSync" className="footer-logo" />
                            <span>HealthSync</span>
                        </div>
                        <div className="footer-links">
                            <Link to="/doctors">Find Doctors</Link>
                            <Link to="/register">Sign Up</Link>
                            <Link to="/login">Login</Link>
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
