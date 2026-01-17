# HealthSync - Figma Setup Guide

## 🎯 Goal
Create a Figma design file that demonstrates your UI/UX thought process for the hackathon.

**Time Required:** ~30 minutes  
**Skill Level:** Beginner-friendly

---

## Step 1: Create Figma Account (2 min)

1. Go to **[figma.com](https://www.figma.com)**
2. Click **"Sign up"** (free account)
3. Use your email or Google account
4. Select **"Starter" plan** (free)

---

## Step 2: Create New Project (1 min)

1. Click **"New design file"** or press `Ctrl/Cmd + N`
2. Name it: **"HealthSync - Telehealth Platform"**
3. You'll see a blank canvas

---

## Step 3: Take Screenshots of Your App (5 min)

Open your running app and take full-page screenshots of these pages:

### Required Screenshots:

| # | Page | URL | Why Important |
|---|------|-----|---------------|
| 1 | Home Page | `localhost:5173/` | Shows landing experience |
| 2 | Login | `localhost:5173/login` | Authentication flow |
| 3 | Dashboard | `localhost:5173/dashboard` | Main user interface |
| 4 | Doctors List | `localhost:5173/doctors` | Core feature |
| 5 | Book Appointment | `localhost:5173/book/1` | Booking flow |
| 6 | Video Call | `localhost:5173/video/test` | Key feature |
| 7 | Prescription | `localhost:5173/doctor-prescription/test` | Output feature |

### How to Take Screenshots:

**macOS:**
- Full page: `Cmd + Shift + 3`
- Area select: `Cmd + Shift + 4`

**Windows:**
- Full page: `Win + Print Screen`
- Area select: `Win + Shift + S`

**Chrome DevTools Method (Best):**
1. Open page → Press `F12` (DevTools)
2. Press `Cmd/Ctrl + Shift + P`
3. Type "screenshot"
4. Select "Capture full size screenshot"

---

## Step 4: Import Screenshots to Figma (3 min)

1. In Figma, press **`Ctrl/Cmd + Shift + K`** (Place image)
2. Select all your screenshots
3. Click to place them on canvas
4. Arrange them in order (left to right):
   - Home → Login → Dashboard → Doctors → Booking → Video → Prescription

**Pro Tip:** Hold `Shift` while dragging to maintain alignment

---

## Step 5: Create Page Structure (2 min)

In the left panel, create pages:

1. Right-click "Page 1" → Rename to **"Cover"**
2. Click **"+"** to add pages:
   - **"Information Architecture"**
   - **"Design System"**
   - **"Desktop Screens"**
   - **"Mobile Screens"** (optional)
   - **"Prototype Flow"**

---

## Step 6: Create Cover Page (3 min)

On the "Cover" page:

1. Press **`R`** to draw a rectangle (1440 x 900 px)
2. Fill with gradient: `#0EA5E9` → `#0F172A`
3. Press **`T`** to add text:

```
HealthSync
AI-Powered Telehealth Platform

Team: [Your Team Name]
Date: January 2026

Veersa Hackathon 2026
```

4. Add a simple health icon (search Figma Community for "medical icon")

---

## Step 7: Add User Flow Diagram (5 min)

On the **"Information Architecture"** page:

### Option A: Draw Simple Flow
1. Press **`O`** to draw circles (start/end points)
2. Press **`R`** to draw rectangles (steps)
3. Press **`Shift + L`** to draw arrows (connections)
4. Label each shape

### Sample Patient Flow:
```
[Home] → [Login] → [Dashboard] → [Find Doctor] → [Book] → [Pay] → [Video Call] → [Prescription]
```

### Option B: Copy from IA Document
1. Take a screenshot of the Mermaid diagrams from our `INFORMATION_ARCHITECTURE.md`
2. Import into Figma
3. Add title: "Patient Journey"

---

## Step 8: Create Design System Page (5 min)

On the **"Design System"** page, create:

### Colors (Use Rectangle tool - R)
Create small squares showing your colors:

```
Primary: #0EA5E9 (Blue)
Success: #10B981 (Green)
Danger:  #EF4444 (Red)
Warning: #F59E0B (Yellow)
Dark BG: #0F172A
Light BG: #F8FAFC
```

### Typography
Add text samples:
```
Heading 1 - Inter 48px Bold
Heading 2 - Inter 36px Bold
Body - Inter 16px Regular
Caption - Inter 12px Regular
```

### Buttons
Draw sample buttons:
- Primary (blue filled)
- Secondary (gray)
- Outline (bordered)
- Danger (red)

---

## Step 9: Add Annotations (5 min)

On **"Desktop Screens"** page with your screenshots:

1. Select **Arrow tool** from toolbar
2. Draw arrows pointing to key features
3. Add text labels explaining each:

### Example Annotations for Home Page:
- Arrow to hero → "AI-Powered Telehealth Headline"
- Arrow to "Start Consultation" → "Primary CTA Button"
- Arrow to features → "Key Features Section"
- Arrow to doctors → "Doctor Preview Cards"

### Example Annotations for Video Call:
- Arrow to video frame → "Daily.co HD Video Integration"
- Arrow to chat icon → "In-Call Chat Feature"
- Arrow to transcript → "DeepGram Live Transcription"
- Arrow to controls → "Call Controls (Mute, Video, End)"

---

## Step 10: Create Prototype Connections (3 min)

Make your screens interactive:

1. Go to **"Prototype"** tab (top right)
2. Select a button (like "Login")
3. Drag the blue circle to the Login screen
4. This creates a clickable prototype!

Repeat for key navigation:
- Home "Get Started" → Login
- Login "Sign In" → Dashboard
- Dashboard "Find Doctor" → Doctors
- Doctors "Book" → Booking
- Booking "Pay" → Video Call

---

## Step 11: Share Your Figma (1 min)

1. Click **"Share"** button (top right)
2. Click **"Copy link"**
3. Set permissions: **"Anyone with the link can view"**
4. Copy the link

**Your link will look like:**
```
https://www.figma.com/file/XXXXX/HealthSync
```

---

## Step 12: Add to GitHub (1 min)

Add this to your `README.md`:

```markdown
## 📐 Design & Architecture

- **Figma Design File:** [View on Figma](YOUR_FIGMA_LINK_HERE)
- **Information Architecture:** [View Document](./docs/INFORMATION_ARCHITECTURE.md)
```

---

## ✅ Final Checklist

Before submitting, ensure your Figma has:

- [ ] Cover page with project name
- [ ] Site map / User flow diagram
- [ ] Design system (colors, typography)
- [ ] Screenshots of all major screens
- [ ] Annotations explaining features
- [ ] Prototype connections between screens
- [ ] Shareable link with view access

---

## 🎨 Quick Figma Shortcuts

| Action | Shortcut |
|--------|----------|
| Rectangle | `R` |
| Circle | `O` |
| Text | `T` |
| Line | `L` |
| Frame | `F` |
| Move | `V` |
| Hand (pan) | `H` or Hold Space |
| Zoom In | `Ctrl/Cmd + +` |
| Zoom Out | `Ctrl/Cmd + -` |
| Zoom to Fit | `Shift + 1` |
| Import Image | `Ctrl/Cmd + Shift + K` |
| Duplicate | `Ctrl/Cmd + D` |
| Group | `Ctrl/Cmd + G` |

---

## 📺 Helpful Video Tutorials

If you're new to Figma:
- [Figma in 5 Minutes](https://www.youtube.com/watch?v=FTFaQWZBqQ8)
- [Figma Basics Tutorial](https://www.youtube.com/watch?v=dXQ7IHkTiMM)

---

*Time to Complete: ~30 minutes*  
*Good luck with your hackathon! 🚀*
