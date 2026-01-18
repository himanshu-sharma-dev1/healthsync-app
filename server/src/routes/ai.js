import express from 'express';
import Groq from 'groq-sdk';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Lazy initialize Groq AI (to avoid crash if env not loaded yet)
let groq = null;
const getGroqClient = () => {
    if (!groq && process.env.GROQ_API_KEY) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groq;
};

// Available specialties in HealthSync
const AVAILABLE_SPECIALTIES = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Orthopedic',
    'Pediatrician',
    'Psychiatrist',
    'Neurologist',
    'Gynecologist',
    'ENT Specialist',
    'Ophthalmologist'
];

// ============================================
// AI FEATURE 1: Doctor Recommendation
// ============================================
router.post('/recommend-doctor', async (req, res) => {
    try {
        const { symptoms, reasonForVisit, patientAge, patientGender } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.json({
                success: true,
                recommendations: [{ specialty: 'General Physician', confidence: 85, reason: 'Best starting point' }],
                fallback: true
            });
        }

        const prompt = `You are a medical triage AI for HealthSync telehealth.
Analyze the patient's symptoms and recommend the best medical specialty.

Patient Info:
- Symptoms: ${symptoms?.join(', ') || 'Not specified'}
- Reason: ${reasonForVisit || 'General consultation'}
- Age: ${patientAge || 'Unknown'}
- Gender: ${patientGender || 'Unknown'}

Available Specialties: ${AVAILABLE_SPECIALTIES.join(', ')}

Respond with ONLY valid JSON:
{"recommendations":[{"specialty":"Name","confidence":85,"reason":"Brief reason"}],"urgency":"low|medium|high","advice":"One brief health tip"}`;

        console.log('🤖 Calling Groq AI for doctor recommendation...');

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 500,
            response_format: { type: 'json_object' }
        });

        const text = completion.choices[0]?.message?.content || '{}';
        const aiResponse = JSON.parse(text);

        console.log('✅ Groq AI recommendation:', aiResponse.recommendations?.[0]?.specialty);

        res.json({
            success: true,
            ...aiResponse,
            poweredBy: 'Groq AI (Llama 3.3 70B)'
        });

    } catch (error) {
        console.error('AI Error:', error.message);
        res.json({
            success: true,
            recommendations: [{ specialty: 'General Physician', confidence: 75, reason: 'Initial consultation recommended' }],
            urgency: 'low',
            advice: 'Please describe your symptoms to the doctor.',
            fallback: true
        });
    }
});

// ============================================
// AI FEATURE 2: Symptom Checker / Health Chat
// ============================================
router.post('/health-chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.json({ success: false, message: 'AI not configured' });
        }

        const systemPrompt = `You are HealthSync AI, a helpful medical assistant. 
You provide general health information and guidance, but always remind users to consult a doctor.
Be concise, empathetic, and helpful. Never diagnose - only provide information.
If symptoms sound serious (chest pain, difficulty breathing, etc.), urge immediate medical attention.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...conversationHistory.slice(-10), // Last 10 messages for context
            { role: 'user', content: message }
        ];

        const completion = await getGroqClient().chat.completions.create({
            messages,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 500
        });

        const reply = completion.choices[0]?.message?.content || 'I apologize, please try again.';

        res.json({
            success: true,
            reply,
            poweredBy: 'Groq AI'
        });

    } catch (error) {
        console.error('Health Chat Error:', error.message);
        res.status(500).json({ success: false, message: 'AI service temporarily unavailable' });
    }
});

// ============================================
// AI FEATURE: Symptom Analyzer (Structured)
// ============================================
router.post('/analyze-symptoms', async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || symptoms.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Please describe your symptoms'
            });
        }

        if (!process.env.GROQ_API_KEY) {
            return res.json({
                success: true,
                analysis: {
                    urgencyLevel: 3,
                    urgencyText: 'Consult a doctor for proper evaluation',
                    possibleConditions: ['Please consult a healthcare provider'],
                    recommendedSpecialist: 'General Physician',
                    immediateAdvice: 'Describe symptoms to your doctor',
                    disclaimer: 'This is not a medical diagnosis.'
                },
                fallback: true
            });
        }

        const prompt = `Analyze these patient symptoms and provide structured guidance:
Symptoms: "${symptoms}"

Respond ONLY in valid JSON:
{
    "urgencyLevel": 1-5 (1=routine, 3=moderate, 5=emergency),
    "urgencyText": "brief description",
    "possibleConditions": ["condition1", "condition2", "condition3"],
    "recommendedSpecialist": "specialty name",
    "suggestedQuestions": ["question1", "question2"],
    "immediateAdvice": "what to do now",
    "disclaimer": "This is not a diagnosis. Please consult a doctor."
}`;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 600,
            response_format: { type: 'json_object' }
        });

        const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');

        res.json({
            success: true,
            analysis,
            poweredBy: 'Groq AI (Llama 3.3 70B)'
        });

    } catch (error) {
        console.error('Symptom Analysis Error:', error.message);
        res.json({
            success: true,
            analysis: {
                urgencyLevel: 3,
                urgencyText: 'Please consult a doctor',
                possibleConditions: ['Analysis unavailable'],
                recommendedSpecialist: 'General Physician',
                immediateAdvice: 'If severe, seek immediate medical attention.',
                disclaimer: 'This is not a medical diagnosis.'
            },
            fallback: true
        });
    }
});

// ============================================
// AI FEATURE 3: Prescription Explanation
// ============================================
router.post('/explain-prescription', async (req, res) => {
    try {
        const { medications, diagnosis } = req.body;

        if (!process.env.GROQ_API_KEY || !medications) {
            return res.json({ success: false, message: 'Medications required' });
        }

        const prompt = `Explain these medications in simple terms for a patient:
Diagnosis: ${diagnosis || 'General treatment'}
Medications: ${Array.isArray(medications) ? medications.join(', ') : medications}

Provide for each medication:
1. What it does (simple terms)
2. Common side effects
3. Important precautions

Keep explanations brief and patient-friendly. Respond in JSON:
{"explanations":[{"name":"Drug Name","purpose":"What it does","sideEffects":["effect1"],"precautions":["precaution1"]}]}`;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 800,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

        res.json({
            success: true,
            ...result,
            disclaimer: 'This is general information. Always follow your doctor\'s instructions.',
            poweredBy: 'Groq AI'
        });

    } catch (error) {
        console.error('Prescription Explain Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to explain prescriptions' });
    }
});

// ============================================
// AI FEATURE 4: Consultation Summary Generator
// ============================================
router.post('/generate-summary', protect, async (req, res) => {
    try {
        const { transcript, doctorNotes, diagnosis, medications } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.json({ success: false, message: 'AI not configured' });
        }

        const prompt = `Generate a professional medical consultation summary:

Transcript/Notes: ${transcript || doctorNotes || 'Not provided'}
Diagnosis: ${diagnosis || 'To be determined'}
Medications: ${medications?.join(', ') || 'None prescribed'}

Create a structured summary with:
1. Chief Complaint
2. Key Findings
3. Diagnosis
4. Treatment Plan
5. Follow-up Recommendations

Respond in JSON:
{"summary":{"chiefComplaint":"...","keyFindings":["..."],"diagnosis":"...","treatmentPlan":["..."],"followUp":"..."}}`;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{}');

        res.json({
            success: true,
            ...result,
            generatedAt: new Date().toISOString(),
            poweredBy: 'Groq AI'
        });

    } catch (error) {
        console.error('Summary Generation Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to generate summary' });
    }
});

// ============================================
// AI FEATURE 5: Pre-consultation Questions
// ============================================
router.post('/pre-consultation-questions', async (req, res) => {
    try {
        const { specialty, symptoms } = req.body;

        if (!process.env.GROQ_API_KEY) {
            return res.json({
                success: true,
                questions: ['How long have you had these symptoms?', 'Any allergies?', 'Current medications?'],
                fallback: true
            });
        }

        const prompt = `Generate 5 relevant questions a ${specialty || 'doctor'} should ask a patient with these symptoms: ${symptoms?.join(', ') || 'general consultation'}.

Questions should help gather important medical history.
Respond in JSON: {"questions":["Question 1?","Question 2?",...]}`;

        const completion = await getGroqClient().chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            max_tokens: 300,
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || '{"questions":[]}');

        res.json({
            success: true,
            ...result,
            poweredBy: 'Groq AI'
        });

    } catch (error) {
        console.error('Questions Error:', error.message);
        res.json({
            success: true,
            questions: ['How long have you had these symptoms?', 'Any allergies?', 'Current medications?'],
            fallback: true
        });
    }
});

// ============================================
// AI Status Check
// ============================================
router.get('/status', (req, res) => {
    res.json({
        success: true,
        aiConfigured: !!process.env.GROQ_API_KEY,
        provider: 'Groq',
        model: 'llama-3.3-70b-versatile',
        features: [
            'doctor-recommendation',
            'health-chat',
            'prescription-explanation',
            'consultation-summary',
            'pre-consultation-questions'
        ]
    });
});

export default router;
