# HealthSync - Manual Test Cases Document

## Project Overview
**Application:** HealthSync - AI-Powered Telehealth Platform  
**Version:** 1.0.0  
**Test Date:** January 18, 2026  
**Tested By:** HealthSync Team  

---

## Table of Contents
1. [Authentication Module](#1-authentication-module)
2. [Doctor Discovery Module](#2-doctor-discovery-module)
3. [Appointment Booking Module](#3-appointment-booking-module)
4. [Video Consultation Module](#4-video-consultation-module)
5. [Payment Module](#5-payment-module)
6. [Prescription Module](#6-prescription-module)
7. [AI Features Module](#7-ai-features-module)
8. [User Profile Module](#8-user-profile-module)
9. [Accessibility & Responsiveness](#9-accessibility--responsiveness)

---

## 1. Authentication Module

### TC-AUTH-001: User Registration
| Field | Details |
|-------|---------|
| **Test ID** | TC-AUTH-001 |
| **Priority** | High |
| **Precondition** | User is not logged in |
| **Test Steps** | 1. Navigate to /register<br>2. Select role (Patient/Doctor)<br>3. Enter first name, last name<br>4. Enter valid email address<br>5. Enter password (min 6 chars)<br>6. Click Register button |
| **Expected Result** | User account created, redirected to dashboard, welcome message shown |
| **Status** | ✅ Pass |

### TC-AUTH-002: User Login with Email
| Field | Details |
|-------|---------|
| **Test ID** | TC-AUTH-002 |
| **Priority** | High |
| **Precondition** | User has existing account |
| **Test Steps** | 1. Navigate to /login<br>2. Enter registered email<br>3. Enter correct password<br>4. Click Sign In button |
| **Expected Result** | User logged in, redirected to dashboard based on role |
| **Status** | ✅ Pass |

### TC-AUTH-003: Google OAuth Login
| Field | Details |
|-------|---------|
| **Test ID** | TC-AUTH-003 |
| **Priority** | High |
| **Precondition** | User has Google account |
| **Test Steps** | 1. Navigate to /login<br>2. Click "Continue with Google" button<br>3. Select Google account<br>4. Authorize access |
| **Expected Result** | User logged in via Google, account created if new user |
| **Status** | ✅ Pass |

### TC-AUTH-004: Invalid Login Credentials
| Field | Details |
|-------|---------|
| **Test ID** | TC-AUTH-004 |
| **Priority** | High |
| **Precondition** | None |
| **Test Steps** | 1. Navigate to /login<br>2. Enter invalid email/password<br>3. Click Sign In |
| **Expected Result** | Error message displayed: "Invalid credentials" |
| **Status** | ✅ Pass |

### TC-AUTH-005: Password Reset Flow
| Field | Details |
|-------|---------|
| **Test ID** | TC-AUTH-005 |
| **Priority** | Medium |
| **Precondition** | User has existing account with valid email |
| **Test Steps** | 1. Click "Forgot Password"<br>2. Enter registered email<br>3. Submit request<br>4. Check email for reset link<br>5. Click link, enter new password<br>6. Login with new password |
| **Expected Result** | Reset email sent, password changed successfully |
| **Status** | ✅ Pass |

### TC-AUTH-006: Logout Functionality
| Field | Details |
|-------|---------|
| **Test ID** | TC-AUTH-006 |
| **Priority** | High |
| **Precondition** | User is logged in |
| **Test Steps** | 1. Click user avatar in navbar<br>2. Click "Logout" from dropdown |
| **Expected Result** | User logged out, redirected to home page, token cleared |
| **Status** | ✅ Pass |

---

## 2. Doctor Discovery Module

### TC-DOC-001: View Available Doctors
| Field | Details |
|-------|---------|
| **Test ID** | TC-DOC-001 |
| **Priority** | High |
| **Precondition** | User is logged in |
| **Test Steps** | 1. Navigate to /doctors<br>2. View doctor cards |
| **Expected Result** | List of doctors displayed with name, specialty, rating, fee |
| **Status** | ✅ Pass |

### TC-DOC-002: Filter Doctors by Specialty
| Field | Details |
|-------|---------|
| **Test ID** | TC-DOC-002 |
| **Priority** | High |
| **Precondition** | On doctors page |
| **Test Steps** | 1. Click specialty filter dropdown<br>2. Select "Cardiology"<br>3. View filtered results |
| **Expected Result** | Only cardiologists displayed |
| **Status** | ✅ Pass |

### TC-DOC-003: Search Doctors by Name
| Field | Details |
|-------|---------|
| **Test ID** | TC-DOC-003 |
| **Priority** | Medium |
| **Precondition** | On doctors page |
| **Test Steps** | 1. Type doctor name in search box<br>2. View search results |
| **Expected Result** | Matching doctors displayed |
| **Status** | ✅ Pass |

### TC-DOC-004: View Doctor Profile
| Field | Details |
|-------|---------|
| **Test ID** | TC-DOC-004 |
| **Priority** | Medium |
| **Precondition** | On doctors page |
| **Test Steps** | 1. Click on doctor card<br>2. View doctor details |
| **Expected Result** | Doctor profile shown with full details, availability, reviews |
| **Status** | ✅ Pass |

---

## 3. Appointment Booking Module

### TC-APT-001: Book Appointment - Date Selection
| Field | Details |
|-------|---------|
| **Test ID** | TC-APT-001 |
| **Priority** | High |
| **Precondition** | User logged in, on booking page |
| **Test Steps** | 1. Navigate to /book/:doctorId<br>2. Select a date from available dates<br>3. Verify date is highlighted |
| **Expected Result** | Date selected successfully, time slots for that date shown |
| **Status** | ✅ Pass |

### TC-APT-002: Book Appointment - Time Selection
| Field | Details |
|-------|---------|
| **Test ID** | TC-APT-002 |
| **Priority** | High |
| **Precondition** | Date already selected |
| **Test Steps** | 1. View available time slots<br>2. Select a time slot<br>3. Verify slot is highlighted |
| **Expected Result** | Time slot selected, booking summary updated |
| **Status** | ✅ Pass |

### TC-APT-003: Complete Appointment Booking
| Field | Details |
|-------|---------|
| **Test ID** | TC-APT-003 |
| **Priority** | Critical |
| **Precondition** | Date and time selected |
| **Test Steps** | 1. Review booking summary<br>2. Click "Proceed to Payment"<br>3. Complete payment<br>4. View confirmation |
| **Expected Result** | Appointment created, confirmation shown, added to dashboard |
| **Status** | ✅ Pass |

### TC-APT-004: Patient Intake Form
| Field | Details |
|-------|---------|
| **Test ID** | TC-APT-004 |
| **Priority** | High |
| **Precondition** | User on patient intake page |
| **Test Steps** | 1. Navigate to /patient-intake<br>2. Enter symptoms description<br>3. Select symptoms from chips<br>4. Select urgency level<br>5. Click continue |
| **Expected Result** | Form validated, AI suggests specialty, user can proceed |
| **Status** | ✅ Pass |

### TC-APT-005: View Upcoming Appointments
| Field | Details |
|-------|---------|
| **Test ID** | TC-APT-005 |
| **Priority** | High |
| **Precondition** | User has booked appointments |
| **Test Steps** | 1. Navigate to /appointments<br>2. View upcoming tab |
| **Expected Result** | List of upcoming appointments with date, time, doctor details |
| **Status** | ✅ Pass |

### TC-APT-006: Cancel Appointment
| Field | Details |
|-------|---------|
| **Test ID** | TC-APT-006 |
| **Priority** | Medium |
| **Precondition** | User has upcoming appointment |
| **Test Steps** | 1. Go to appointments page<br>2. Click Cancel on an appointment<br>3. Confirm cancellation |
| **Expected Result** | Appointment cancelled, removed from upcoming list |
| **Status** | ✅ Pass |

---

## 4. Video Consultation Module

### TC-VID-001: Join Video Call
| Field | Details |
|-------|---------|
| **Test ID** | TC-VID-001 |
| **Priority** | Critical |
| **Precondition** | User has confirmed appointment |
| **Test Steps** | 1. Click "Join Call" from appointment<br>2. Allow camera/microphone access<br>3. Click "Join" button |
| **Expected Result** | Video call interface loads, local video preview shown |
| **Status** | ✅ Pass |

### TC-VID-002: Mute/Unmute Audio
| Field | Details |
|-------|---------|
| **Test ID** | TC-VID-002 |
| **Priority** | High |
| **Precondition** | In active video call |
| **Test Steps** | 1. Click Mute button<br>2. Verify muted indicator<br>3. Click again to unmute |
| **Expected Result** | Audio toggled, UI reflects mute state |
| **Status** | ✅ Pass |

### TC-VID-003: Turn Video On/Off
| Field | Details |
|-------|---------|
| **Test ID** | TC-VID-003 |
| **Priority** | High |
| **Precondition** | In active video call |
| **Test Steps** | 1. Click Video Off button<br>2. Verify camera stops<br>3. Click again to enable |
| **Expected Result** | Video toggled, placeholder shown when off |
| **Status** | ✅ Pass |

### TC-VID-004: In-Call Chat
| Field | Details |
|-------|---------|
| **Test ID** | TC-VID-004 |
| **Priority** | High |
| **Precondition** | In active video call |
| **Test Steps** | 1. Click Chat button<br>2. Type message<br>3. Click Send<br>4. View message in chat panel |
| **Expected Result** | Message sent and displayed in chat sidebar |
| **Status** | ✅ Pass |

### TC-VID-005: Live Transcription
| Field | Details |
|-------|---------|
| **Test ID** | TC-VID-005 |
| **Priority** | High |
| **Precondition** | In active video call, DeepGram configured |
| **Test Steps** | 1. Click Transcript button<br>2. Speak into microphone<br>3. View real-time transcription |
| **Expected Result** | Speech converted to text, displayed in transcript panel |
| **Status** | ✅ Pass |

### TC-VID-006: Share Call Link
| Field | Details |
|-------|---------|
| **Test ID** | TC-VID-006 |
| **Priority** | Medium |
| **Precondition** | Patient initiated call |
| **Test Steps** | 1. Click "Share Link" button<br>2. View copied link notification<br>3. Share link with doctor |
| **Expected Result** | Shareable link copied to clipboard |
| **Status** | ✅ Pass |

### TC-VID-007: End Call
| Field | Details |
|-------|---------|
| **Test ID** | TC-VID-007 |
| **Priority** | High |
| **Precondition** | In active video call |
| **Test Steps** | 1. Click "End Call" button<br>2. Confirm end call |
| **Expected Result** | Call ended, redirected to consultation summary |
| **Status** | ✅ Pass |

### TC-VID-008: Emergency Detection (AI)
| Field | Details |
|-------|---------|
| **Test ID** | TC-VID-008 |
| **Priority** | Critical |
| **Precondition** | Live transcription enabled |
| **Test Steps** | 1. Say emergency keywords (e.g., "I can't breathe")<br>2. Observe AI detection |
| **Expected Result** | Emergency alert banner shown with 112 call button |
| **Status** | ✅ Pass |

---

## 5. Payment Module

### TC-PAY-001: Payment via Square
| Field | Details |
|-------|---------|
| **Test ID** | TC-PAY-001 |
| **Priority** | Critical |
| **Precondition** | User at payment page, Square configured |
| **Test Steps** | 1. Select Square payment option<br>2. Enter card details<br>3. Click Pay<br>4. View confirmation |
| **Expected Result** | Payment processed, success page shown |
| **Status** | ✅ Pass |

### TC-PAY-002: Payment via Stripe
| Field | Details |
|-------|---------|
| **Test ID** | TC-PAY-002 |
| **Priority** | Critical |
| **Precondition** | User at payment page, Stripe configured |
| **Test Steps** | 1. Select Stripe payment option<br>2. Enter card details<br>3. Complete checkout<br>4. View confirmation |
| **Expected Result** | Payment processed, success page shown |
| **Status** | ✅ Pass |

### TC-PAY-003: Payment Failure Handling
| Field | Details |
|-------|---------|
| **Test ID** | TC-PAY-003 |
| **Priority** | High |
| **Precondition** | At payment page |
| **Test Steps** | 1. Enter invalid card number<br>2. Attempt payment |
| **Expected Result** | Error message displayed, user can retry |
| **Status** | ✅ Pass |

---

## 6. Prescription Module

### TC-RX-001: Create Digital Prescription
| Field | Details |
|-------|---------|
| **Test ID** | TC-RX-001 |
| **Priority** | High |
| **Precondition** | Doctor in/after consultation |
| **Test Steps** | 1. Navigate to prescription page<br>2. Enter diagnosis<br>3. Add medications with dosage, frequency<br>4. Add lab tests, advice<br>5. Click Save |
| **Expected Result** | Prescription created and saved |
| **Status** | ✅ Pass |

### TC-RX-002: Download Prescription PDF
| Field | Details |
|-------|---------|
| **Test ID** | TC-RX-002 |
| **Priority** | High |
| **Precondition** | Prescription form filled |
| **Test Steps** | 1. Fill prescription details<br>2. Click "Download PDF" button |
| **Expected Result** | PDF downloaded with professional formatting |
| **Status** | ✅ Pass |

### TC-RX-003: View E-Prescription
| Field | Details |
|-------|---------|
| **Test ID** | TC-RX-003 |
| **Priority** | Medium |
| **Precondition** | Patient has prescription |
| **Test Steps** | 1. Navigate to /e-prescription/:id<br>2. View prescription details |
| **Expected Result** | Full prescription displayed with all details |
| **Status** | ✅ Pass |

---

## 7. AI Features Module

### TC-AI-001: Symptom-to-Specialty Matching
| Field | Details |
|-------|---------|
| **Test ID** | TC-AI-001 |
| **Priority** | High |
| **Precondition** | On patient intake form |
| **Test Steps** | 1. Enter "chest pain, difficulty breathing"<br>2. View AI suggestion |
| **Expected Result** | AI recommends Cardiologist with confidence score |
| **Status** | ✅ Pass |


### TC-AI-002: Translation in Transcription
| Field | Details |
|-------|---------|
| **Test ID** | TC-AI-003 |
| **Priority** | Medium |
| **Precondition** | In video call with transcription |
| **Test Steps** | 1. Enable transcription<br>2. Toggle "Translate" button<br>3. View translated text |
| **Expected Result** | Transcription translated to selected language |
| **Status** | ✅ Pass |

---

## 8. User Profile Module

### TC-PROF-001: View Profile
| Field | Details |
|-------|---------|
| **Test ID** | TC-PROF-001 |
| **Priority** | Medium |
| **Precondition** | User logged in |
| **Test Steps** | 1. Navigate to /profile<br>2. View profile information |
| **Expected Result** | Profile displayed with stats, medical info, settings |
| **Status** | ✅ Pass |

### TC-PROF-002: Edit Profile
| Field | Details |
|-------|---------|
| **Test ID** | TC-PROF-002 |
| **Priority** | Medium |
| **Precondition** | On profile page |
| **Test Steps** | 1. Click "Edit Profile"<br>2. Modify details<br>3. Save changes |
| **Expected Result** | Profile updated successfully |
| **Status** | ✅ Pass |

### TC-PROF-003: Update Medical Information
| Field | Details |
|-------|---------|
| **Test ID** | TC-PROF-003 |
| **Priority** | Medium |
| **Precondition** | On profile page |
| **Test Steps** | 1. Click "Edit Medical Info"<br>2. Enter allergies, conditions, blood type<br>3. Save |
| **Expected Result** | Medical info saved for future consultations |
| **Status** | ✅ Pass |

### TC-PROF-004: Change Password
| Field | Details |
|-------|---------|
| **Test ID** | TC-PROF-004 |
| **Priority** | High |
| **Precondition** | User logged in |
| **Test Steps** | 1. Click "Change Password"<br>2. Enter current password<br>3. Enter new password twice<br>4. Submit |
| **Expected Result** | Password changed, can login with new password |
| **Status** | ✅ Pass |

---

## 9. Accessibility & Responsiveness

### TC-ACC-001: Screen Reader Compatibility
| Field | Details |
|-------|---------|
| **Test ID** | TC-ACC-001 |
| **Priority** | Medium |
| **Test Steps** | 1. Enable accessibility widget<br>2. Navigate using keyboard<br>3. Test with screen reader |
| **Expected Result** | All elements accessible, proper ARIA labels |
| **Status** | ✅ Pass |

### TC-ACC-002: Light/Dark Mode Toggle
| Field | Details |
|-------|---------|
| **Test ID** | TC-ACC-002 |
| **Priority** | Medium |
| **Test Steps** | 1. Click theme toggle in navbar<br>2. Verify mode change<br>3. Navigate all pages |
| **Expected Result** | Theme persists, all pages render correctly |
| **Status** | ✅ Pass |

### TC-ACC-003: Mobile Responsiveness
| Field | Details |
|-------|---------|
| **Test ID** | TC-ACC-003 |
| **Priority** | High |
| **Test Steps** | 1. Open app on mobile device/emulator<br>2. Navigate all pages<br>3. Test hamburger menu |
| **Expected Result** | All pages responsive, touch-friendly |
| **Status** | ✅ Pass |

### TC-ACC-004: Multi-Language Support
| Field | Details |
|-------|---------|
| **Test ID** | TC-ACC-004 |
| **Priority** | Medium |
| **Test Steps** | 1. Click language selector<br>2. Select different language<br>3. Verify content translation |
| **Expected Result** | UI text translated, preference saved |
| **Status** | ✅ Pass |

---

## Test Summary

| Module | Total Tests | Passed | Failed | Blocked |
|--------|-------------|--------|--------|---------|
| Authentication | 6 | 6 | 0 | 0 |
| Doctor Discovery | 4 | 4 | 0 | 0 |
| Appointment Booking | 6 | 6 | 0 | 0 |
| Video Consultation | 8 | 8 | 0 | 0 |
| Payment | 3 | 3 | 0 | 0 |
| Prescription | 3 | 3 | 0 | 0 |
| AI Features | 3 | 3 | 0 | 0 |
| User Profile | 4 | 4 | 0 | 0 |
| Accessibility | 4 | 4 | 0 | 0 |
| **TOTAL** | **41** | **41** | **0** | **0** |

---

## Test Environment

- **Browser:** Chrome 120+, Safari 17+
- **OS:** Windows 11, macOS 14, Android 14
- **Screen Sizes:** Desktop (1920x1080), Mobile (375x667)
- **Network:** Broadband, 4G simulated

---

*Document Generated: January 18, 2026*  
*HealthSync QA Team*
