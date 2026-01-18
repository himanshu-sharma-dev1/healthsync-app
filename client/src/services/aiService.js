// AI Services for HealthSync
// Uses Groq API for fast, intelligent AI processing

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Emergency keywords that should trigger alerts
const EMERGENCY_KEYWORDS = [
    // Cardiac emergencies
    'chest pain', 'heart attack', 'cardiac arrest', 'heart stopped',
    // Breathing emergencies
    'can\'t breathe', 'cannot breathe', 'difficulty breathing', 'choking', 'suffocating',
    // Stroke symptoms
    'stroke', 'face drooping', 'arm weakness', 'speech difficulty',
    // Severe conditions
    'unconscious', 'not responding', 'passed out', 'fainted',
    'severe bleeding', 'heavy bleeding', 'won\'t stop bleeding',
    'seizure', 'convulsions', 'fits',
    // Poisoning/overdose
    'overdose', 'poisoned', 'swallowed poison',
    // Suicidal
    'want to die', 'suicidal', 'kill myself',
    // General emergency
    'emergency', 'call 112', 'call ambulance', 'dying'
];

/**
 * Check if transcription contains emergency keywords
 * @param {string} text - Transcription text to analyze
 * @returns {object} - { isEmergency: boolean, detectedKeywords: string[], severity: string }
 */
export const detectEmergency = (text) => {
    if (!text) return { isEmergency: false, detectedKeywords: [], severity: 'none' };

    const lowerText = text.toLowerCase();
    const detectedKeywords = EMERGENCY_KEYWORDS.filter(keyword =>
        lowerText.includes(keyword)
    );

    if (detectedKeywords.length === 0) {
        return { isEmergency: false, detectedKeywords: [], severity: 'none' };
    }

    // Determine severity based on matched keywords
    let severity = 'moderate';
    const criticalKeywords = ['heart attack', 'cardiac arrest', 'stroke', 'unconscious', 'not responding', 'can\'t breathe', 'dying'];
    if (detectedKeywords.some(kw => criticalKeywords.includes(kw))) {
        severity = 'critical';
    }

    return {
        isEmergency: true,
        detectedKeywords,
        severity,
        message: severity === 'critical'
            ? '🚨 CRITICAL EMERGENCY DETECTED - Consider calling 112 immediately!'
            : '⚠️ Emergency keywords detected - Evaluate patient condition'
    };
};

/**
 * Generate AI-powered consultation summary from transcription
 * @param {string} transcription - Full consultation transcription
 * @param {object} context - Additional context (patient info, doctor, symptoms)
 * @returns {Promise<object>} - Structured summary
 */
export const generateConsultationSummary = async (transcription, context = {}) => {
    if (!transcription || transcription.length < 50) {
        return {
            success: false,
            error: 'Transcription too short for meaningful summary',
            summary: null
        };
    }

    try {
        const response = await fetch(`${API_URL}/ai/consultation-summary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                transcription,
                patientName: context.patientName || 'Patient',
                doctorName: context.doctorName || 'Doctor',
                symptoms: context.symptoms || []
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate summary');
        }

        const data = await response.json();
        return {
            success: true,
            summary: data.summary
        };
    } catch (error) {
        console.error('AI Summary error:', error);

        // Fallback: Generate basic summary locally
        return {
            success: true,
            summary: generateLocalSummary(transcription, context),
            isLocalFallback: true
        };
    }
};

/**
 * Local fallback summary generation (when API is unavailable)
 */
const generateLocalSummary = (transcription, context) => {
    const words = transcription.split(' ');
    const wordCount = words.length;

    // Extract key medical terms
    const medicalTerms = [
        'headache', 'fever', 'cough', 'pain', 'fatigue', 'nausea',
        'dizziness', 'weakness', 'rash', 'swelling', 'infection',
        'blood pressure', 'diabetes', 'asthma', 'allergy'
    ];

    const foundSymptoms = medicalTerms.filter(term =>
        transcription.toLowerCase().includes(term)
    );

    return {
        chiefComplaint: context.symptoms?.[0] || 'Consultation completed',
        symptomsDiscussed: foundSymptoms.length > 0 ? foundSymptoms : ['General consultation'],
        keyPoints: [
            'Patient consultation completed successfully',
            `Discussion duration: ~${Math.round(wordCount / 150)} minutes of speech`,
            foundSymptoms.length > 0 ? `Symptoms discussed: ${foundSymptoms.join(', ')}` : 'Routine checkup'
        ],
        recommendations: [
            'Follow prescribed medications as directed',
            'Schedule follow-up if symptoms persist',
            'Contact doctor for any urgent concerns'
        ],
        followUpDays: 7,
        generatedAt: new Date().toISOString()
    };
};

/**
 * Analyze symptoms and suggest preliminary questions
 * @param {string[]} symptoms - Array of symptom strings
 * @returns {Promise<object>} - Suggested questions and specialty recommendations
 */
export const analyzeSymptoms = async (symptoms) => {
    if (!symptoms || symptoms.length === 0) {
        return { questions: [], specialties: [] };
    }

    try {
        const response = await fetch(`${API_URL}/ai/analyze-symptoms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ symptoms })
        });

        if (!response.ok) throw new Error('API error');

        return await response.json();
    } catch (error) {
        // Fallback questions based on common symptoms
        const questionMap = {
            'headache': ['How long have you had this headache?', 'Is it on one side or both?', 'Do you experience nausea?'],
            'chest pain': ['Describe the pain - sharp or dull?', 'Does it radiate to arm or jaw?', 'Any shortness of breath?'],
            'fever': ['What is your temperature?', 'When did the fever start?', 'Any other symptoms like cough?'],
            'cough': ['Is the cough dry or with phlegm?', 'How long have you had it?', 'Any blood in cough?'],
            'fatigue': ['How long have you been feeling tired?', 'Is it affecting daily activities?', 'Any changes in sleep?']
        };

        const questions = [];
        symptoms.forEach(symptom => {
            const lowerSymptom = symptom.toLowerCase();
            Object.keys(questionMap).forEach(key => {
                if (lowerSymptom.includes(key)) {
                    questions.push(...questionMap[key]);
                }
            });
        });

        return {
            questions: [...new Set(questions)].slice(0, 5),
            specialties: [],
            isLocalFallback: true
        };
    }
};

export default {
    detectEmergency,
    generateConsultationSummary,
    analyzeSymptoms,
    EMERGENCY_KEYWORDS
};
