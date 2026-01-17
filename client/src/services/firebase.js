// Firebase Configuration for Google Auth
// For hackathon demo - using demo mode (no Firebase setup needed)

// Demo mode flag - set to true to skip Firebase entirely
const USE_DEMO_MODE = true;

let auth = null;
let googleProvider = null;

// Skip Firebase initialization for demo/hackathon
if (!USE_DEMO_MODE) {
    // Only import and initialize if not in demo mode
    console.log('Firebase would initialize here if configured');
} else {
    console.log('🔐 HealthSync: Using Demo Mode for Google Login');
}

// Google Sign In
export const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
        // Demo mode - simulate Google login
        console.log('🔐 Demo Mode: Simulating Google login...');

        const demoUser = {
            uid: 'google-demo-' + Date.now(),
            displayName: 'Demo User',
            email: 'demo@gmail.com',
            photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0ea5e9&color=fff',
            providerData: [{ providerId: 'google.com' }]
        };

        // Store in localStorage for persistence
        localStorage.setItem('googleUser', JSON.stringify(demoUser));

        return { user: demoUser, isDemo: true };
    }

    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        console.log('✅ Google login successful:', user.displayName);

        return {
            user: {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                providerData: user.providerData
            },
            isDemo: false
        };
    } catch (error) {
        console.error('Google login error:', error);
        throw error;
    }
};

// Sign Out
export const signOutGoogle = async () => {
    if (auth) {
        await signOut(auth);
    }
    localStorage.removeItem('googleUser');
    console.log('👋 Signed out from Google');
};

// Get current Google user from localStorage (for demo)
export const getCurrentGoogleUser = () => {
    const stored = localStorage.getItem('googleUser');
    return stored ? JSON.parse(stored) : null;
};

export { auth };
