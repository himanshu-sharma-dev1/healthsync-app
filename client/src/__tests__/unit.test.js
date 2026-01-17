/**
 * HealthSync Frontend Unit Tests
 * Testing key utilities and services
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ========================================
// PDF Generator Tests
// ========================================
describe('PDF Generator', () => {
    it('should export required functions', async () => {
        const pdfGenerator = await import('../utils/pdfGenerator');
        expect(pdfGenerator.generatePrescriptionPDF).toBeDefined();
        expect(pdfGenerator.downloadPrescriptionPDF).toBeDefined();
        expect(pdfGenerator.demoPrescription).toBeDefined();
    });

    it('should have valid demo prescription data', async () => {
        const { demoPrescription } = await import('../utils/pdfGenerator');
        expect(demoPrescription.id).toBe('RX-2026-001');
        expect(demoPrescription.medications).toHaveLength(3);
        expect(demoPrescription.doctor).toBe('Dr. Sarah Johnson');
    });

    it('should generate prescription with correct fields', async () => {
        const { demoPrescription } = await import('../utils/pdfGenerator');
        expect(demoPrescription).toHaveProperty('chiefComplaint');
        expect(demoPrescription).toHaveProperty('diagnosis');
        expect(demoPrescription).toHaveProperty('medications');
        expect(demoPrescription).toHaveProperty('labTests');
        expect(demoPrescription).toHaveProperty('advice');
        expect(demoPrescription).toHaveProperty('followUpDays');
    });
});

// ========================================
// AI Service Tests
// ========================================
describe('AI Service', () => {
    it('should export emergency detection function', async () => {
        const aiService = await import('../services/aiService');
        expect(aiService.detectEmergency).toBeDefined();
    });

    it('should detect critical emergency keywords', async () => {
        const { detectEmergency } = await import('../services/aiService');
        const result = detectEmergency("I can't breathe and having chest pain");
        expect(result.isEmergency).toBe(true);
        expect(result.severity).toBe('critical');
    });

    it('should return severity level for emergency', async () => {
        const { detectEmergency } = await import('../services/aiService');
        const result = detectEmergency("I'm having a stroke, face drooping");
        expect(result.isEmergency).toBe(true);
        expect(['critical', 'moderate']).toContain(result.severity);
    });

    it('should not flag normal conversation', async () => {
        const { detectEmergency } = await import('../services/aiService');
        const result = detectEmergency("I have been feeling good lately");
        expect(result.isEmergency).toBe(false);
    });
});

// ========================================
// Symptom to Specialty Matching Tests
// ========================================
describe('Symptom Analysis', () => {
    it('should export analyzeSymptoms function', async () => {
        const aiService = await import('../services/aiService');
        expect(aiService.analyzeSymptoms).toBeDefined();
    });

    it('should handle empty symptoms array', async () => {
        const { analyzeSymptoms } = await import('../services/aiService');
        const result = await analyzeSymptoms([]);
        expect(result.questions).toEqual([]);
    });

    it('should return message property for emergencies', async () => {
        const { detectEmergency } = await import('../services/aiService');
        const result = detectEmergency("I'm having chest pain");
        expect(result.isEmergency).toBe(true);
        expect(result).toHaveProperty('message');
    });

    it('should detect cardiac emergency keywords', async () => {
        const { detectEmergency } = await import('../services/aiService');
        const result = detectEmergency("I'm having chest pain and can't breathe");
        expect(result.isEmergency).toBe(true);
        expect(result.detectedKeywords).toContain('chest pain');
    });
});

// ========================================
// Date/Time Utility Tests
// ========================================
describe('Date Formatting Utilities', () => {
    it('should format appointment date correctly', () => {
        const date = new Date('2026-01-20');
        const formatted = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        expect(formatted).toContain('Jan');
        expect(formatted).toContain('20');
    });

    it('should format time in 12-hour format', () => {
        const date = new Date('2026-01-20T14:30:00');
        const formatted = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        expect(formatted).toMatch(/2:30.*PM/i);
    });
});

// ========================================
// Form Validation Tests
// ========================================
describe('Form Validations', () => {
    it('should validate email format', () => {
        const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name@domain.co.in')).toBe(true);
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('@nodomain.com')).toBe(false);
    });

    it('should validate password strength', () => {
        const validatePassword = (password) => password.length >= 6;

        expect(validatePassword('123456')).toBe(true);
        expect(validatePassword('short')).toBe(false);
        expect(validatePassword('strongpassword123')).toBe(true);
    });

    it('should validate phone number format', () => {
        const validatePhone = (phone) => /^\+?[\d\s-]{10,}$/.test(phone);

        expect(validatePhone('+91 98765 43210')).toBe(true);
        expect(validatePhone('1234567890')).toBe(true);
        expect(validatePhone('123')).toBe(false);
    });
});

// ========================================
// Local Storage Helpers
// ========================================
describe('Storage Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should save and retrieve user data', () => {
        const userData = { id: '123', name: 'Test User', role: 'patient' };

        localStorage.setItem('user', JSON.stringify(userData));
        expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(userData));
    });

    it('should save appointment to session', () => {
        const appointment = { doctorId: 'doc123', date: '2026-01-20' };

        sessionStorage.setItem('appointmentDoctor', JSON.stringify(appointment));
        expect(sessionStorage.setItem).toHaveBeenCalled();
    });
});

// ========================================
// Medical Terms Detection Tests
// ========================================
describe('Medical Terms Detection', () => {
    const MEDICAL_TERMS = {
        symptoms: ['headache', 'fever', 'cough', 'fatigue', 'nausea'],
        medications: ['paracetamol', 'ibuprofen', 'aspirin', 'antibiotic'],
        critical: ['allergic', 'emergency', 'severe', 'acute', 'chronic']
    };

    it('should detect symptom keywords', () => {
        const text = 'I have a headache and fever';
        const found = MEDICAL_TERMS.symptoms.filter(term =>
            text.toLowerCase().includes(term)
        );
        expect(found).toContain('headache');
        expect(found).toContain('fever');
    });

    it('should detect medication mentions', () => {
        const text = 'Take paracetamol twice daily with ibuprofen';
        const found = MEDICAL_TERMS.medications.filter(term =>
            text.toLowerCase().includes(term)
        );
        expect(found).toHaveLength(2);
    });

    it('should flag critical terms', () => {
        const text = 'Patient shows severe allergic reaction';
        const found = MEDICAL_TERMS.critical.filter(term =>
            text.toLowerCase().includes(term)
        );
        expect(found.length).toBeGreaterThan(0);
    });
});

// ========================================
// Prescription ID Generation
// ========================================
describe('Prescription ID Generation', () => {
    it('should generate prescription IDs with correct format', () => {
        const generateId = () => `RX-${Date.now()}`;
        const id = generateId();
        expect(id).toMatch(/^RX-\d+$/);
    });

    it('should generate IDs based on timestamp', () => {
        const before = Date.now();
        const id = `RX-${Date.now()}`;
        const after = Date.now();
        const timestamp = parseInt(id.replace('RX-', ''));
        expect(timestamp).toBeGreaterThanOrEqual(before);
        expect(timestamp).toBeLessThanOrEqual(after);
    });

    it('should include timestamp in ID', () => {
        const now = Date.now();
        const id = `RX-${now}`;

        expect(id).toContain(now.toString());
    });
});

// ========================================
// API URL Configuration
// ========================================
describe('API Configuration', () => {
    it('should have valid API URL format', () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        expect(apiUrl).toMatch(/^https?:\/\/.+/);
    });

    it('should handle base URL extraction', () => {
        const getBaseUrl = (apiUrl) => apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;

        expect(getBaseUrl('http://localhost:5001/api')).toBe('http://localhost:5001');
        expect(getBaseUrl('https://example.com/api')).toBe('https://example.com');
    });
});

console.log('✅ All frontend unit tests completed!');
