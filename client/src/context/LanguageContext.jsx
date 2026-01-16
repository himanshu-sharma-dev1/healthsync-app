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

        // Accessibility
        accessibility: 'Accessibility',
        fontSize: 'Font Size',
        highContrast: 'High Contrast'
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

        // Accessibility
        accessibility: 'एक्सेसिबिलिटी',
        fontSize: 'फ़ॉन्ट आकार',
        highContrast: 'उच्च कंट्रास्ट'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

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

    // Get translation function
    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, translations }}>
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
