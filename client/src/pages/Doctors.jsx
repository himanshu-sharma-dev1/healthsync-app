import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorService } from '../services/api';
import './Doctors.css';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [specialties, setSpecialties] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctors();
        fetchSpecialties();
    }, []);

    const fetchDoctors = async (params = {}) => {
        try {
            setLoading(true);
            const response = await doctorService.getAll(params);
            setDoctors(response.doctors || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            // Set demo data for hackathon
            setDoctors(demoData);
        } finally {
            setLoading(false);
        }
    };

    const fetchSpecialties = async () => {
        try {
            const response = await doctorService.getSpecialties();
            setSpecialties(response.specialties || []);
        } catch (error) {
            setSpecialties([
                'General Physician',
                'Cardiologist',
                'Dermatologist',
                'Orthopedic',
                'Pediatrician',
                'Psychiatrist'
            ]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors({
            search: searchTerm,
            specialty: selectedSpecialty
        });
    };

    const handleBook = (doctorId) => {
        navigate(`/book/${doctorId}`);
    };

    // Demo data for hackathon presentation
    const demoData = [
        {
            _id: '1',
            firstName: 'Sarah',
            lastName: 'Johnson',
            specialty: 'Cardiologist',
            experience: 12,
            consultationFee: 800,
            isVerified: true
        },
        {
            _id: '2',
            firstName: 'Rajesh',
            lastName: 'Kumar',
            specialty: 'General Physician',
            experience: 8,
            consultationFee: 500,
            isVerified: true
        },
        {
            _id: '3',
            firstName: 'Priya',
            lastName: 'Sharma',
            specialty: 'Dermatologist',
            experience: 6,
            consultationFee: 600,
            isVerified: true
        },
        {
            _id: '4',
            firstName: 'Michael',
            lastName: 'Chen',
            specialty: 'Orthopedic',
            experience: 15,
            consultationFee: 900,
            isVerified: true
        },
        {
            _id: '5',
            firstName: 'Aisha',
            lastName: 'Patel',
            specialty: 'Pediatrician',
            experience: 10,
            consultationFee: 550,
            isVerified: true
        },
        {
            _id: '6',
            firstName: 'David',
            lastName: 'Wilson',
            specialty: 'Psychiatrist',
            experience: 14,
            consultationFee: 1000,
            isVerified: true
        }
    ];

    const displayDoctors = doctors.length > 0 ? doctors : demoData;

    return (
        <div className="doctors-page">
            <div className="container">
                {/* Search Header */}
                <div className="doctors-header">
                    <h1>Find a Doctor</h1>
                    <p className="text-secondary">
                        Connect with experienced healthcare professionals for video consultations
                    </p>

                    <form className="search-form" onSubmit={handleSearch}>
                        <div className="search-inputs">
                            <input
                                type="text"
                                className="form-input search-input"
                                placeholder="Search by name or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <select
                                className="form-input specialty-select"
                                value={selectedSpecialty}
                                onChange={(e) => setSelectedSpecialty(e.target.value)}
                            >
                                <option value="">All Specialties</option>
                                {specialties.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>

                            <button type="submit" className="btn btn-primary">
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Doctors Grid */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Finding doctors...</p>
                    </div>
                ) : (
                    <div className="doctors-grid">
                        {displayDoctors.map((doctor) => (
                            <div key={doctor._id} className="doctor-card">
                                <div className="doctor-card-header">
                                    <div className="doctor-avatar">
                                        <span>
                                            {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                                        </span>
                                    </div>
                                    {doctor.isVerified && (
                                        <span className="verified-badge" title="Verified Doctor">✓</span>
                                    )}
                                </div>

                                <div className="doctor-card-body">
                                    <h3>Dr. {doctor.firstName} {doctor.lastName}</h3>
                                    <p className="specialty">{doctor.specialty}</p>

                                    <div className="doctor-stats">
                                        <div className="stat">
                                            <span className="stat-value">{doctor.experience}+</span>
                                            <span className="stat-label">Years Exp.</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">4.8</span>
                                            <span className="stat-label">Rating</span>
                                        </div>
                                    </div>

                                    <div className="doctor-fee">
                                        <span className="fee-label">Consultation Fee</span>
                                        <span className="fee-amount">₹{doctor.consultationFee}</span>
                                    </div>
                                </div>

                                <div className="doctor-card-footer">
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={() => handleBook(doctor._id)}
                                    >
                                        Book Consultation
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Doctors;
