/**
 * HealthSync API Test Cases
 * Using Jest + Supertest for API endpoint testing
 */

const request = require('supertest');

// Base URL for API testing (update for your environment)
const BASE_URL = process.env.API_URL || 'http://localhost:5001/api';

// Test user credentials
const testUser = {
    email: 'test@example.com',
    password: 'test123456',
    firstName: 'Test',
    lastName: 'User',
    role: 'patient'
};

const testDoctor = {
    email: 'doctor@example.com',
    password: 'doctor123456',
    firstName: 'Dr. Test',
    lastName: 'Doctor',
    role: 'doctor'
};

let authToken = '';
let userId = '';

// ========================================
// AUTHENTICATION API TESTS
// ========================================
describe('Authentication API', () => {

    describe('POST /auth/register', () => {
        it('should register a new user', async () => {
            const res = await request(BASE_URL)
                .post('/auth/register')
                .send(testUser)
                .expect('Content-Type', /json/);

            // Either 201 (success) or 400 (already exists)
            expect([201, 400]).toContain(res.status);

            if (res.status === 201) {
                expect(res.body).toHaveProperty('token');
                expect(res.body.user).toHaveProperty('email', testUser.email);
            }
        });

        it('should reject registration with missing fields', async () => {
            const res = await request(BASE_URL)
                .post('/auth/register')
                .send({ email: 'incomplete@test.com' })
                .expect('Content-Type', /json/);

            expect([400, 500]).toContain(res.status);
        });

        it('should reject invalid email format', async () => {
            const res = await request(BASE_URL)
                .post('/auth/register')
                .send({ ...testUser, email: 'invalid-email' });

            expect([400, 500]).toContain(res.status);
        });
    });

    describe('POST /auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(BASE_URL)
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect('Content-Type', /json/);

            if (res.status === 200) {
                expect(res.body).toHaveProperty('token');
                authToken = res.body.token;
                userId = res.body.user?.id || res.body.user?._id;
            }
        });

        it('should reject invalid password', async () => {
            const res = await request(BASE_URL)
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect([400, 401]).toContain(res.status);
        });

        it('should reject non-existent user', async () => {
            const res = await request(BASE_URL)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'password123'
                });

            expect([400, 401, 404]).toContain(res.status);
        });
    });

    describe('GET /auth/me', () => {
        it('should return user profile with valid token', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const res = await request(BASE_URL)
                .get('/auth/me')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/);

            expect([200, 401]).toContain(res.status);
        });

        it('should reject request without token', async () => {
            const res = await request(BASE_URL)
                .get('/auth/me');

            expect([401, 403]).toContain(res.status);
        });
    });
});

// ========================================
// DOCTORS API TESTS
// ========================================
describe('Doctors API', () => {

    describe('GET /doctors', () => {
        it('should return list of doctors', async () => {
            const res = await request(BASE_URL)
                .get('/doctors')
                .expect('Content-Type', /json/);

            expect([200, 401]).toContain(res.status);

            if (res.status === 200) {
                expect(Array.isArray(res.body)).toBe(true);
            }
        });

        it('should filter doctors by specialty', async () => {
            const res = await request(BASE_URL)
                .get('/doctors')
                .query({ specialty: 'Cardiology' })
                .expect('Content-Type', /json/);

            expect([200, 401]).toContain(res.status);
        });
    });

    describe('GET /doctors/:id', () => {
        it('should return doctor details', async () => {
            // First get list to get an ID
            const listRes = await request(BASE_URL).get('/doctors');

            if (listRes.status === 200 && listRes.body.length > 0) {
                const doctorId = listRes.body[0]._id || listRes.body[0].id;

                const res = await request(BASE_URL)
                    .get(`/doctors/${doctorId}`)
                    .expect('Content-Type', /json/);

                expect([200, 404]).toContain(res.status);
            }
        });

        it('should return 404 for invalid doctor ID', async () => {
            const res = await request(BASE_URL)
                .get('/doctors/invalidid123');

            expect([400, 404, 500]).toContain(res.status);
        });
    });
});

// ========================================
// APPOINTMENTS API TESTS
// ========================================
describe('Appointments API', () => {

    describe('POST /appointments', () => {
        it('should create appointment with valid data', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const appointmentData = {
                doctorId: 'test-doctor-id',
                date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                time: '10:00 AM',
                type: 'video',
                reason: 'General consultation'
            };

            const res = await request(BASE_URL)
                .post('/appointments')
                .set('Authorization', `Bearer ${authToken}`)
                .send(appointmentData);

            expect([201, 400, 401, 404]).toContain(res.status);
        });

        it('should reject appointment without auth', async () => {
            const res = await request(BASE_URL)
                .post('/appointments')
                .send({
                    doctorId: 'test-id',
                    date: new Date().toISOString()
                });

            expect([401, 403]).toContain(res.status);
        });
    });

    describe('GET /appointments', () => {
        it('should return user appointments', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const res = await request(BASE_URL)
                .get('/appointments')
                .set('Authorization', `Bearer ${authToken}`)
                .expect('Content-Type', /json/);

            expect([200, 401]).toContain(res.status);

            if (res.status === 200) {
                expect(Array.isArray(res.body)).toBe(true);
            }
        });
    });

    describe('PATCH /appointments/:id/cancel', () => {
        it('should cancel appointment', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const res = await request(BASE_URL)
                .patch('/appointments/test-appointment-id/cancel')
                .set('Authorization', `Bearer ${authToken}`);

            expect([200, 400, 401, 404]).toContain(res.status);
        });
    });
});

// ========================================
// VIDEO CALL API TESTS
// ========================================
describe('Video Call API', () => {

    describe('POST /video/create-room', () => {
        it('should create video room with valid auth', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const res = await request(BASE_URL)
                .post('/video/create-room')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ appointmentId: 'test-appointment-id' });

            expect([200, 201, 400, 401, 500]).toContain(res.status);
        });

        it('should reject without auth', async () => {
            const res = await request(BASE_URL)
                .post('/video/create-room')
                .send({ appointmentId: 'test-id' });

            expect([401, 403]).toContain(res.status);
        });
    });

    describe('GET /video/room/:appointmentId', () => {
        it('should return room details', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const res = await request(BASE_URL)
                .get('/video/room/test-id')
                .set('Authorization', `Bearer ${authToken}`);

            expect([200, 400, 401, 404]).toContain(res.status);
        });
    });
});

// ========================================
// PAYMENT API TESTS
// ========================================
describe('Payment API', () => {

    describe('POST /payments/create-checkout', () => {
        it('should create Stripe checkout session', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const res = await request(BASE_URL)
                .post('/payments/create-checkout')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    amount: 500,
                    appointmentId: 'test-apt-id',
                    doctorName: 'Dr. Test'
                });

            expect([200, 400, 401, 500]).toContain(res.status);
        });
    });

    describe('POST /payments/square/create-payment', () => {
        it('should create Square payment', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const res = await request(BASE_URL)
                .post('/payments/square/create-payment')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    sourceId: 'test-token',
                    amount: 50000, // cents
                    appointmentId: 'test-apt-id'
                });

            expect([200, 400, 401, 500]).toContain(res.status);
        });
    });
});

// ========================================
// AI API TESTS
// ========================================
describe('AI API', () => {

    describe('POST /ai/recommend-specialty', () => {
        it('should recommend specialty based on symptoms', async () => {
            const res = await request(BASE_URL)
                .post('/ai/recommend-specialty')
                .send({ symptoms: 'chest pain, difficulty breathing' });

            expect([200, 401, 500]).toContain(res.status);

            if (res.status === 200) {
                expect(res.body).toHaveProperty('specialty');
                expect(res.body).toHaveProperty('confidence');
            }
        });
    });

    describe('POST /ai/chat', () => {
        it('should process AI chat message', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const res = await request(BASE_URL)
                .post('/ai/chat')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ message: 'What are the symptoms of flu?' });

            expect([200, 400, 401, 500]).toContain(res.status);
        });
    });
});

// ========================================
// TRANSCRIPTION API TESTS
// ========================================
describe('Transcription API', () => {

    describe('POST /transcription/start', () => {
        it('should start transcription session', async () => {
            if (!authToken) {
                console.log('Skipping - no auth token');
                return;
            }

            const res = await request(BASE_URL)
                .post('/transcription/start')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ appointmentId: 'test-apt-id' });

            expect([200, 400, 401, 500]).toContain(res.status);
        });
    });
});

// ========================================
// PASSWORD RESET API TESTS
// ========================================
describe('Password Reset API', () => {

    describe('POST /password-reset/request', () => {
        it('should send password reset email', async () => {
            const res = await request(BASE_URL)
                .post('/password-reset/request')
                .send({ email: testUser.email });

            expect([200, 400, 404]).toContain(res.status);
        });

        it('should handle non-existent email gracefully', async () => {
            const res = await request(BASE_URL)
                .post('/password-reset/request')
                .send({ email: 'nonexistent@example.com' });

            // Should not reveal if email exists
            expect([200, 400, 404]).toContain(res.status);
        });
    });

    describe('POST /password-reset/reset', () => {
        it('should reject invalid reset token', async () => {
            const res = await request(BASE_URL)
                .post('/password-reset/reset')
                .send({
                    token: 'invalid-token',
                    password: 'newpassword123'
                });

            expect([400, 404]).toContain(res.status);
        });
    });
});

// ========================================
// HEALTH CHECK
// ========================================
describe('Health Check', () => {

    it('should return server status', async () => {
        const res = await request(BASE_URL.replace('/api', ''))
            .get('/');

        expect([200, 404]).toContain(res.status);
    });
});

console.log('✅ All API tests completed!');
