# HealthSync - Automated Test Suite

## Overview

This document provides an overview of the automated testing infrastructure for the HealthSync Telehealth Platform.

---

## Test Results Summary

| Test Suite | Framework | Total Tests | Passed | Failed |
|------------|-----------|-------------|--------|--------|
| Frontend Unit Tests | Vitest | 26 | 26 | 0 |
| API Integration Tests | Jest + Supertest | 24 | 17 | 7* |
| Manual Test Cases | N/A | 41 | 41 | 0 |

*API test failures are expected for endpoints that require specific database state or external API keys.

---

## Running the Tests

### Frontend Unit Tests

```bash
cd client
npm run test        # Run once
npm run test:watch  # Watch mode
npm run test:coverage  # With coverage report
```

### Backend API Tests

```bash
cd server
npm test
```

---

## Test Structure

### Frontend Tests (`client/src/__tests__/`)

```
client/
├── src/
│   └── __tests__/
│       ├── setup.js       # Test configuration and mocks
│       └── unit.test.js   # Unit tests for utilities and services
├── vitest.config.js       # Vitest configuration
```

**Test Categories:**
1. **PDF Generator Tests** - Prescription PDF generation
2. **AI Service Tests** - Emergency detection, symptom analysis
3. **Form Validation Tests** - Email, password, phone validation
4. **Storage Operations** - LocalStorage, SessionStorage mocks
5. **Medical Terms Detection** - Symptom, medication, critical term detection
6. **Prescription ID Generation** - Unique ID format validation
7. **API Configuration** - URL parsing utilities

### Backend Tests (`server/__tests__/`)

```
server/
└── __tests__/
    └── api.test.js   # API endpoint integration tests
```

**API Test Categories:**
1. **Authentication API** - Register, login, logout, token verification
2. **Doctors API** - List, search, filter doctors
3. **Appointments API** - Create, read, cancel appointments
4. **Video Call API** - Room creation, join functionality
5. **Payment API** - Stripe and Square integration
6. **AI API** - Specialty recommendation, chat
7. **Transcription API** - Real-time transcription
8. **Password Reset API** - Request and reset flow

---

## Test Coverage

### Frontend Coverage

| Module | Coverage |
|--------|----------|
| PDF Generator | ✅ Core functions tested |
| AI Service | ✅ Emergency detection, symptom analysis |
| Form Validations | ✅ Email, password, phone |
| Utilities | ✅ Date formatting, ID generation |

### Backend Coverage

| Endpoint | Coverage |
|----------|----------|
| /auth/* | ✅ Full coverage |
| /doctors/* | ✅ List, filter, details |
| /appointments/* | ✅ CRUD operations |
| /video/* | ✅ Room management |
| /payments/* | ✅ Checkout, payment |
| /ai/* | ⚠️ Requires API keys |
| /transcription/* | ⚠️ Requires external service |

---

## Dependencies

### Frontend Testing

```json
{
  "devDependencies": {
    "vitest": "^4.0.17",
    "@testing-library/jest-dom": "^6.x",
    "jsdom": "^25.x"
  }
}
```

### Backend Testing

```json
{
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.x"
  }
}
```

---

## Sample Test Output

### Frontend (Vitest)

```
 ✓ src/__tests__/unit.test.js (26 tests) 87ms

 Test Files  1 passed (1)
      Tests  26 passed (26)
   Duration  725ms
```

### Backend (Jest)

```
 PASS  __tests__/api.test.js
  Authentication API
    ✓ should register a new user (66 ms)
    ✓ should login with valid credentials (132 ms)
    ✓ should reject invalid password (115 ms)
  Doctors API
    ✓ should return list of doctors (44 ms)
  Video Call API
    ✓ should create video room (874 ms)
  Payment API
    ✓ should create Stripe checkout session (788 ms)
```

---

## Continuous Integration

For CI/CD integration (GitHub Actions):

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: |
          cd client && npm ci
          cd ../server && npm ci
      - name: Run frontend tests
        run: cd client && npm test
      - name: Run backend tests
        run: cd server && npm test
```

---

## Manual Test Cases

See [`MANUAL_TEST_CASES.md`](./MANUAL_TEST_CASES.md) for the complete manual test suite covering:

- User Authentication (6 tests)
- Doctor Discovery (4 tests)
- Appointment Booking (6 tests)
- Video Consultation (8 tests)
- Payment Processing (3 tests)
- Prescription Management (3 tests)
- AI Features (3 tests)
- User Profile (4 tests)
- Accessibility (4 tests)

---

*Last Updated: January 18, 2026*
*HealthSync QA Team*
