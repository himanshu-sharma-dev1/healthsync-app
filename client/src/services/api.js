const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for API requests
const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// Auth API
export const authService = {
    login: (email, password) =>
        request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (userData) =>
        request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    getMe: () => request('/auth/me'),

    updateProfile: (data) =>
        request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

// Doctors API
export const doctorService = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/doctors${query ? `?${query}` : ''}`);
    },

    getById: (id) => request(`/doctors/${id}`),

    getSpecialties: () => request('/doctors/specialties'),

    getAvailability: (id, date) =>
        request(`/doctors/${id}/availability?date=${date}`),
};

// Appointments API
export const appointmentService = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/appointments${query ? `?${query}` : ''}`);
    },

    getById: (id) => request(`/appointments/${id}`),

    create: (data) =>
        request('/appointments', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id, data) =>
        request(`/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    cancel: (id) =>
        request(`/appointments/${id}`, {
            method: 'DELETE',
        }),
};

// Payments API
export const paymentService = {
    create: (data) =>
        request('/payments/create', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getStatus: (appointmentId) =>
        request(`/payments/${appointmentId}`),

    refund: (appointmentId) =>
        request('/payments/refund', {
            method: 'POST',
            body: JSON.stringify({ appointmentId }),
        }),
};

// Video API
export const videoService = {
    createRoom: (appointmentId) =>
        request('/video/create-room', {
            method: 'POST',
            body: JSON.stringify({ appointmentId }),
        }),

    getRoom: (appointmentId) =>
        request(`/video/room/${appointmentId}`),

    endCall: (appointmentId, duration) =>
        request('/video/end', {
            method: 'POST',
            body: JSON.stringify({ appointmentId, duration }),
        }),

    saveTranscription: (appointmentId, transcription) =>
        request('/video/transcribe', {
            method: 'POST',
            body: JSON.stringify({ appointmentId, transcription }),
        }),
};
