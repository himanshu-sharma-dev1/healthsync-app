import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translations for EN and HI
const translations = {
    en: {
        // Common
        appName: 'HealthSync',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        dashboard: 'Dashboard',
        doctors: 'Doctors',
        appointments: 'Appointments',
        settings: 'Settings',

        // Home
        heroTitle: 'Healthcare at Your Fingertips',
        heroSubtitle: 'Connect with top doctors instantly through secure video consultations',
        getStarted: 'Get Started',
        findDoctors: 'Find Doctors',

        // Dashboard
        welcomeBack: 'Welcome back',
        upcomingAppointments: 'Upcoming Appointments',
        pastConsultations: 'Past Consultations',
        prescriptions: 'Prescriptions',

        // Booking
        bookAppointment: 'Book Appointment',
        selectDate: 'Select Date',
        selectTime: 'Select Time',
        confirmBooking: 'Confirm Booking',

        // Video Call
        joinCall: 'Join Call',
        endCall: 'End Call',
        mute: 'Mute',
        unmute: 'Unmute',
        camera: 'Camera',

        // Waiting Room
        waitingRoom: 'Waiting Room',
        doctorWillJoin: 'Your doctor will join shortly',
        prepareForCall: 'Prepare for your consultation',
        estimatedWait: 'Estimated Wait',
        queuePosition: 'Queue Position',

        // Footer
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        contactUs: 'Contact Us',

        // Profile
        profileSettings: 'Profile Settings',
        manageAccount: 'Manage your account settings and preferences',
        personalInfo: 'Personal Information',
        accountActions: 'Account Actions',
        changePassword: 'Change Password',
        notificationPrefs: 'Notification Preferences',

        // Dashboard - New
        goodMorning: 'Good morning',
        goodAfternoon: 'Good afternoon',
        goodEvening: 'Good evening',
        goodNight: 'Good night',
        readyToHelp: 'Ready to help patients today',
        healthOverview: "Here's your health overview for today",
        todaysAppointments: "Today's Appointments",
        totalPatients: 'Total Patients',
        thisMonth: 'This Month',
        viewSchedule: 'View Schedule',
        viewSummary: 'View Summary',
        upcoming: 'Upcoming',
        completed: 'Completed',
        activeRx: 'Active Rx',
        medicalProfile: 'Medical Profile',
        editProfile: 'Edit Profile',
        bloodType: 'Blood Type',
        height: 'Height',
        weight: 'Weight',
        emergencyContact: 'Emergency Contact',
        allergies: 'Allergies',
        conditions: 'Conditions',
        quickActions: 'Quick Actions',
        newConsultation: 'New Consultation',
        findDoctor: 'Find Doctor',
        allAppointments: 'All Appointments',
        helpCenter: 'Help Center',

        // Home - New
        whyChooseUs: 'Why Choose HealthSync?',
        experienceFuture: 'Experience the future of healthcare with our comprehensive platform',
        instantVideo: 'Instant Video',
        connectWithDoctors: 'Connect with doctors in seconds through high-quality video calls',
        securePayments: 'Secure Payments',
        paymentDescription: 'Hassle-free payments with insurance integration support',
        aiTranscription: 'AI Transcription',
        transcriptionDescription: 'Real-time medical transcription for accurate records',
        howItWorks: 'How It Works',
        step1Title: 'Find a Doctor',
        step1Desc: 'Browse specialists by reviews and availability',
        step2Title: 'Book Slot',
        step2Desc: 'Choose a time that works for you',
        step3Title: 'Get Care',
        step3Desc: 'Connect via video and get treated',
        testimonials: 'What Patients Say',
        readyToStart: 'Ready to prioritize your health?',
        joinThousands: 'Join thousands of patients who trust HealthSync',
        createAccount: 'Create Account',
        browseDoctors: 'Browse Doctors',

        // Accessibility
        accessibility: 'Accessibility',
        fontSize: 'Font Size',
        highContrast: 'High Contrast',

        // Notifications
        notifications: 'Notifications',
        markAllRead: 'Mark all read',
        clearAll: 'Clear all',
        appointmentReminder: 'Appointment Reminder',
        preparationChecklist: 'Preparation Checklist',
        paymentConfirmed: 'Payment Confirmed',
        prescriptionReady: 'Prescription Ready',
        minAgo: 'min ago',
        hourAgo: 'hour ago',

        // Patient Intake
        symptoms: 'Symptoms',
        history: 'History',
        specialty: 'Specialty',
        whatBringsYou: 'What brings you in today?',
        reasonForVisit: 'Reason for Visit',
        selectSymptoms: 'Select your symptoms (if any)',
        howLong: 'How long have you had these symptoms?',
        selectDuration: 'Select duration',
        continueBtn: 'Continue',

        // Symptom names
        fever: 'Fever',
        headache: 'Headache',
        cough: 'Cough',
        fatigue: 'Fatigue',
        chestPain: 'Chest Pain',
        shortnessOfBreath: 'Shortness of Breath',
        skinRash: 'Skin Rash',
        jointPain: 'Joint Pain',
        anxiety: 'Anxiety',
        depression: 'Depression',
        stomachPain: 'Stomach Pain',
        nausea: 'Nausea',
        backPain: 'Back Pain',
        other: 'Other',

        // Appointments Page
        myAppointments: 'My Appointments',
        bookNewAppointment: 'Book New Appointment',
        all: 'All',
        scheduled: 'Scheduled',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        joinCallBtn: 'Join Call',
        viewDetails: 'View Details',

        // Payment Page
        orderSummary: 'Order Summary',
        completePayment: 'Complete Payment',
        payWithSquare: 'Pay with Square',
        secureCardPayment: 'Secure card payment via Square checkout',
        paySecurely: 'Pay Securely',
        creditDebitCards: 'Credit/Debit Cards',
        applePay: 'Apple Pay',
        googlePay: 'Google Pay',
        demoMode: 'Demo Mode',
        skipPayment: 'Skip to Consultation',
        skipPaymentDesc: 'Skip payment for testing (hackathon demo only)',
        consultationFee: 'Consultation Fee',
        platformFee: 'Platform Fee',
        total: 'Total',
        securePaymentBadge: 'Secure Payment',
        poweredBySquare: 'Powered by Square - PCI DSS Compliant',
        sandboxTestCards: 'Sandbox Test Cards',
        date: 'Date',
        time: 'Time',
        type: 'Type',
        videoConsultation: 'Video Consultation',

        // Common labels
        cardiologist: 'Cardiologist',
        generalPhysician: 'General Physician',
        dermatologist: 'Dermatologist',
        orthopedic: 'Orthopedic',
        pediatrician: 'Pediatrician',
        psychiatrist: 'Psychiatrist'
    },
    hi: {
        // Common
        appName: 'हेल्थसिंक',
        login: 'लॉगिन',
        register: 'रजिस्टर',
        logout: 'लॉगआउट',
        dashboard: 'डैशबोर्ड',
        doctors: 'डॉक्टर',
        appointments: 'अपॉइंटमेंट',
        settings: 'सेटिंग्स',

        // Home
        heroTitle: 'आपकी उंगलियों पर स्वास्थ्य सेवा',
        heroSubtitle: 'सुरक्षित वीडियो परामर्श के माध्यम से तुरंत शीर्ष डॉक्टरों से जुड़ें',
        getStarted: 'शुरू करें',
        findDoctors: 'डॉक्टर खोजें',

        // Dashboard
        welcomeBack: 'वापसी पर स्वागत है',
        upcomingAppointments: 'आगामी अपॉइंटमेंट',
        pastConsultations: 'पिछले परामर्श',
        prescriptions: 'प्रिस्क्रिप्शन',

        // Booking
        bookAppointment: 'अपॉइंटमेंट बुक करें',
        selectDate: 'तारीख चुनें',
        selectTime: 'समय चुनें',
        confirmBooking: 'बुकिंग की पुष्टि करें',

        // Video Call
        joinCall: 'कॉल में शामिल हों',
        endCall: 'कॉल समाप्त करें',
        mute: 'म्यूट',
        unmute: 'अनम्यूट',
        camera: 'कैमरा',

        // Waiting Room
        waitingRoom: 'प्रतीक्षा कक्ष',
        doctorWillJoin: 'आपके डॉक्टर जल्द ही शामिल होंगे',
        prepareForCall: 'अपने परामर्श के लिए तैयार रहें',
        estimatedWait: 'अनुमानित प्रतीक्षा',
        queuePosition: 'कतार में स्थान',

        // Footer
        privacyPolicy: 'गोपनीयता नीति',
        termsOfService: 'सेवा की शर्तें',
        contactUs: 'संपर्क करें',

        // Profile
        profileSettings: 'प्रोफ़ाइल सेटिंग्स',
        manageAccount: 'अपने खाते की सेटिंग्स और प्राथमिकताएं प्रबंधित करें',
        personalInfo: 'व्यक्तिगत जानकारी',
        accountActions: 'खाता क्रियाएं',
        changePassword: 'पासवर्ड बदलें',
        notificationPrefs: 'सूचना प्राथमिकताएं',

        // Dashboard - New
        goodMorning: 'सुप्रभात',
        goodAfternoon: 'नमस्कार',
        goodEvening: 'शुभ संध्या',
        goodNight: 'शुभ रात्रि',
        readyToHelp: 'मरीजों की मदद के लिए तैयार',
        healthOverview: 'आज का आपका स्वास्थ्य अवलोकन',
        todaysAppointments: 'आज की नियुक्तियां',
        totalPatients: 'कुल मरीज',
        thisMonth: 'इस महीने',
        viewSchedule: 'अनुसूची देखें',
        viewSummary: 'सारांश देखें',
        upcoming: 'आगामी',
        completed: 'पूर्ण',
        activeRx: 'सक्रिय नुस्खे',
        medicalProfile: 'चिकित्सा प्रोफ़ाइल',
        editProfile: 'प्रोफ़ाइल संपादित करें',
        bloodType: 'रक्त प्रकार',
        height: 'ऊंचाई',
        weight: 'वजन',
        emergencyContact: 'आपातकालीन संपर्क',
        allergies: 'एलर्जी',
        conditions: 'स्थितियां',
        quickActions: 'त्वरित कार्रवाई',
        newConsultation: 'नया परामर्श',
        findDoctor: 'डॉक्टर खोजें',
        allAppointments: 'सभी नियुक्तियां',
        helpCenter: 'सहायता केंद्र',

        // Home - New
        whyChooseUs: 'हेल्थसिंक क्यों चुनें?',
        experienceFuture: 'हमारे व्यापक मंच के साथ स्वास्थ्य सेवा के भविष्य का अनुभव करें',
        instantVideo: 'तत्काल वीडियो',
        connectWithDoctors: 'उच्च गुणवत्ता वाले वीडियो कॉल के माध्यम से सेकंडों में डॉक्टरों से जुड़ें',
        securePayments: 'सुरक्षित भुगतान',
        paymentDescription: 'बीमा एकीकरण समर्थन के साथ परेशानी मुक्त भुगतान',
        aiTranscription: 'एआई ट्रांसक्रिप्शन',
        transcriptionDescription: 'सटीक रिकॉर्ड के लिए वास्तविक समय चिकित्सा प्रतिलेखन',
        howItWorks: 'यह कैसे काम करता है',
        step1Title: 'डॉक्टर खोजें',
        step1Desc: 'समीक्षाओं और उपलब्धता के आधार पर विशेषज्ञों को ब्राउज़ करें',
        step2Title: 'स्लॉट बुक करें',
        step2Desc: 'वह समय चुनें जो आपके लिए काम करे',
        step3Title: 'देखभाल प्राप्त करें',
        step3Desc: 'वीडियो के माध्यम से जुड़ें और इलाज कराएं',
        testimonials: 'मरीज क्या कहते हैं',
        readyToStart: 'अपने स्वास्थ्य को प्राथमिकता देने के लिए तैयार हैं?',
        joinThousands: 'उन हजारों मरीजों में शामिल हों जो हेल्थसिंक पर भरोसा करते हैं',
        createAccount: 'खाता बनाएं',
        browseDoctors: 'डॉक्टर ब्राउज़ करें',

        // Accessibility
        accessibility: 'एक्सेसिबिलिटी',
        fontSize: 'फ़ॉन्ट आकार',
        highContrast: 'उच्च कंट्रास्ट',

        // Notifications
        notifications: 'सूचनाएं',
        markAllRead: 'सभी पढ़ा हुआ चिह्नित करें',
        clearAll: 'सभी साफ़ करें',
        appointmentReminder: 'अपॉइंटमेंट रिमाइंडर',
        preparationChecklist: 'तैयारी चेकलिस्ट',
        paymentConfirmed: 'भुगतान पुष्टि',
        prescriptionReady: 'प्रिस्क्रिप्शन तैयार',
        minAgo: 'मिनट पहले',
        hourAgo: 'घंटे पहले',

        // Patient Intake
        symptoms: 'लक्षण',
        history: 'इतिहास',
        specialty: 'विशेषता',
        whatBringsYou: 'आज आपको क्या लाया?',
        reasonForVisit: 'मिलने का कारण',
        selectSymptoms: 'अपने लक्षण चुनें (यदि कोई हो)',
        howLong: 'आपको ये लक्षण कितने समय से हैं?',
        selectDuration: 'अवधि चुनें',
        continueBtn: 'जारी रखें',

        // Symptom names
        fever: 'बुखार',
        headache: 'सिरदर्द',
        cough: 'खांसी',
        fatigue: 'थकान',
        chestPain: 'सीने में दर्द',
        shortnessOfBreath: 'सांस की तकलीफ',
        skinRash: 'त्वचा पर चकत्ते',
        jointPain: 'जोड़ों में दर्द',
        anxiety: 'चिंता',
        depression: 'अवसाद',
        stomachPain: 'पेट दर्द',
        nausea: 'मतली',
        backPain: 'पीठ दर्द',
        other: 'अन्य',

        // Appointments Page
        myAppointments: 'मेरी अपॉइंटमेंट',
        bookNewAppointment: 'नई अपॉइंटमेंट बुक करें',
        all: 'सभी',
        scheduled: 'अनुसूचित',
        confirmed: 'पुष्टि हुई',
        cancelled: 'रद्द',
        joinCallBtn: 'कॉल में शामिल हों',
        viewDetails: 'विवरण देखें',

        // Payment Page
        orderSummary: 'ऑर्डर सारांश',
        completePayment: 'भुगतान पूरा करें',
        payWithSquare: 'स्क्वायर से भुगतान करें',
        secureCardPayment: 'स्क्वायर चेकआउट के माध्यम से सुरक्षित कार्ड भुगतान',
        paySecurely: 'सुरक्षित भुगतान करें',
        creditDebitCards: 'क्रेडिट/डेबिट कार्ड',
        applePay: 'एप्पल पे',
        googlePay: 'गूगल पे',
        demoMode: 'डेमो मोड',
        skipPayment: 'परामर्श पर जाएं',
        skipPaymentDesc: 'परीक्षण के लिए भुगतान छोड़ें (हैकाथॉन डेमो केवल)',
        consultationFee: 'परामर्श शुल्क',
        platformFee: 'प्लेटफॉर्म शुल्क',
        total: 'कुल',
        securePaymentBadge: 'सुरक्षित भुगतान',
        poweredBySquare: 'स्क्वायर द्वारा संचालित - पीसीआई डीएसएस अनुपालक',
        sandboxTestCards: 'सैंडबॉक्स टेस्ट कार्ड',
        date: 'तारीख',
        time: 'समय',
        type: 'प्रकार',
        videoConsultation: 'वीडियो परामर्श',

        // Common labels
        cardiologist: 'हृदय रोग विशेषज्ञ',
        generalPhysician: 'सामान्य चिकित्सक',
        dermatologist: 'त्वचा विशेषज्ञ',
        orthopedic: 'हड्डी रोग विशेषज्ञ',
        pediatrician: 'बाल रोग विशेषज्ञ',
        psychiatrist: 'मनोचिकित्सक'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [dynamicTranslations, setDynamicTranslations] = useState({});
    const [isTranslating, setIsTranslating] = useState(false);

    // Load saved language preference
    useEffect(() => {
        const saved = localStorage.getItem('language');
        if (saved && (saved === 'en' || saved === 'hi')) {
            setLanguage(saved);
        }
    }, []);

    // Save language preference
    const changeLanguage = (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
    };

    // Get static translation function
    const t = (key) => {
        return translations[language][key] || key;
    };

    // Dynamic translation using Lingva API (for text not in static translations)
    const translateDynamic = async (text, targetLang = null) => {
        const target = targetLang || language;

        // If English, return as-is
        if (target === 'en' || !text) return text;

        // Check cache first
        const cacheKey = `${text}_${target}`;
        if (dynamicTranslations[cacheKey]) {
            return dynamicTranslations[cacheKey];
        }

        try {
            // Import translate function dynamically to avoid circular dependency
            const { translateText } = await import('../services/translateService');
            setIsTranslating(true);
            const translated = await translateText(text, 'en', target);

            // Cache the translation
            setDynamicTranslations(prev => ({
                ...prev,
                [cacheKey]: translated
            }));

            setIsTranslating(false);
            return translated;
        } catch (error) {
            console.error('Translation error:', error);
            setIsTranslating(false);
            return text; // Fallback to original
        }
    };

    return (
        <LanguageContext.Provider value={{
            language,
            changeLanguage,
            t,
            translateDynamic,
            isTranslating,
            translations
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
