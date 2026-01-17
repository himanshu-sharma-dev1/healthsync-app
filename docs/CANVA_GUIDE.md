# HealthSync - Canva Design Guide

## 🎯 Goal
Create a professional design presentation in Canva for your hackathon submission.

**Time Required:** ~20-25 minutes  
**Skill Level:** Beginner (No design experience needed)

---

## Step 1: Open Canva (1 min)

1. Go to **[canva.com](https://www.canva.com)**
2. Sign in with Google (or create free account)
3. Click **"Create a design"** (top right)
4. Select **"Presentation (16:9)"**

---

## Step 2: Choose Template (1 min)

1. In the search bar, type **"Tech Presentation"** or **"App Showcase"**
2. Pick a clean, modern template (preferably dark/blue theme to match HealthSync)
3. Or start with a **blank presentation**

**Recommended search terms:**
- "Mobile app showcase"
- "Product presentation"
- "Tech startup pitch"

---

## Step 3: Create Slides Structure (2 min)

Create **8 slides** with these titles:

| Slide # | Title | Content |
|---------|-------|---------|
| 1 | Cover | HealthSync Logo + Title + Team Name |
| 2 | Problem & Solution | Why telehealth matters |
| 3 | Information Architecture | Site Map + User Flows |
| 4 | Design System | Colors + Typography |
| 5 | Home Page | Screenshot + Annotations |
| 6 | Dashboard & Doctors | Screenshots |
| 7 | Video Consultation | Key feature showcase |
| 8 | Prescription & Summary | Output screens |

---

## Step 4: Take App Screenshots (5 min)

### Open your app at `http://localhost:5174/`

**Method 1: Full Page Screenshot (Mac)**
```
Cmd + Shift + 4, then Space, click on browser window
```

**Method 2: Chrome DevTools (Better Quality)**
1. Press `F12` to open DevTools
2. Press `Cmd + Shift + P`
3. Type "screenshot"
4. Select **"Capture full size screenshot"**

### Screenshots needed:

| # | Page | URL | Screenshot Name |
|---|------|-----|-----------------|
| 1 | Home | `/` | home.png |
| 2 | Login | `/login` | login.png |
| 3 | Dashboard | `/dashboard` | dashboard.png |
| 4 | Doctors | `/doctors` | doctors.png |
| 5 | Book Appointment | `/book/1` | booking.png |
| 6 | Video Call | `/video/demo` | videocall.png |
| 7 | Prescription | `/doctor-prescription/demo` | prescription.png |

**Save all screenshots to a folder on your Desktop**

---

## Step 5: Create Cover Slide (2 min)

### On Slide 1:

1. **Add Logo:**
   - Click **"Uploads"** (left sidebar)
   - Upload your logo from `client/public/healthsync-logo.png`
   - Drag to center-top of slide

2. **Add Title Text:**
   - Click **"Text"** → **"Add a heading"**
   - Type: `HealthSync`
   - Font: **Montserrat Bold** or **Poppins Bold**, Size: 80

3. **Add Subtitle:**
   - Add another text box
   - Type: `AI-Powered Telehealth Platform`
   - Font size: 32

4. **Add Team Info:**
   - Bottom of slide: `Team: [Your Team Name] | Veersa Hackathon 2026`

5. **Add Background:**
   - Click on background
   - Use gradient: **#0F172A** (dark blue) to **#0EA5E9** (light blue)

---

## Step 6: Problem & Solution Slide (2 min)

### On Slide 2:

**Left side - Problem:**
```
❌ Limited access to healthcare in remote areas
❌ Long waiting times for appointments
❌ Lack of specialist availability
❌ Language barriers in medical consultations
```

**Right side - Solution:**
```
✅ Instant HD video consultations
✅ AI-powered emergency detection
✅ Real-time transcription & translation
✅ Digital prescriptions
✅ Dual payment options (Square + Stripe)
```

**How to add:**
1. Click **"Text"** → Add text boxes
2. Use **"Elements"** → Search "checkmark" for icons
3. Arrange in two columns

---

## Step 7: Information Architecture Slide (3 min)

### On Slide 3:

**Option A: Screenshot Method (Fastest)**
1. Open `docs/INFORMATION_ARCHITECTURE.md` in VS Code
2. Take screenshot of the Site Map section
3. Upload to Canva, add to slide
4. Title it: "Site Map & User Flow"

**Option B: Simple Diagram Method**
1. Click **"Elements"** → Search **"flowchart"**
2. Add shapes for each page
3. Connect with arrows
4. Label: Home → Login → Dashboard → Doctors → Book → Pay → Video Call → Prescription

**Use these shapes:**
- Rectangles for pages
- Arrows for navigation
- Different colors for Patient vs Doctor flows

---

## Step 8: Design System Slide (2 min)

### On Slide 4:

**Create Color Palette:**
1. Click **"Elements"** → Search **"circle"**
2. Create 6 circles in a row
3. Fill with colors:

| Color | Hex | Label |
|-------|-----|-------|
| Primary | #0EA5E9 | Blue |
| Success | #10B981 | Green |
| Danger | #EF4444 | Red |
| Warning | #F59E0B | Yellow |
| Dark BG | #0F172A | Navy |
| Light BG | #F8FAFC | White |

**Typography Section:**
- Add text: "Heading - Inter Bold 48px"
- Add text: "Body - Inter Regular 16px"

---

## Step 9: App Screenshots Slides (5 min)

### On Slides 5-8:

**For each screenshot slide:**

1. **Upload Screenshot:**
   - Click **"Uploads"**
   - Drag screenshot to slide
   - Resize to fit (hold Shift to maintain ratio)

2. **Add Device Frame (Optional but looks professional):**
   - Click **"Elements"** → Search **"laptop mockup"** or **"phone mockup"**
   - Place your screenshot inside the frame

3. **Add Annotations:**
   - Click **"Elements"** → Search **"arrow"**
   - Draw arrows pointing to key features
   - Add text labels explaining each feature

### Annotation Examples:

**Home Page:**
- Arrow to hero → "AI-Powered Headline"
- Arrow to CTA → "Start Consultation Button"
- Arrow to features → "Key Features Grid"

**Video Call Page:**
- Arrow to video → "HD Video (Daily.co)"
- Arrow to chat → "In-Call Chat"
- Arrow to transcript → "Live Transcription (DeepGram)"
- Arrow to controls → "Call Controls"

**Prescription Page:**
- Arrow to form → "Digital Prescription Form"
- Arrow to PDF button → "Download PDF"
- Arrow to preview → "Live Preview"

---

## Step 10: Add Professional Elements (2 min)

**Make it look polished:**

1. **Consistent Colors:**
   - Use your brand colors (#0EA5E9, #0F172A)
   - Keep text readable (white on dark, dark on light)

2. **Add Icons:**
   - Click **"Elements"** → Search icons like:
   - "video call", "doctor", "prescription", "payment"

3. **Add Slide Numbers:**
   - Bottom corner of each slide

4. **Use Spacing:**
   - Don't overcrowd slides
   - Leave margins around content

---

## Step 11: Review & Polish (2 min)

**Checklist before sharing:**

- [ ] All slides have consistent styling
- [ ] Screenshots are clear and readable
- [ ] Annotations point to key features
- [ ] No spelling mistakes
- [ ] Logo appears on cover slide
- [ ] Team name is included
- [ ] Colors match HealthSync branding

---

## Step 12: Share & Export (1 min)

### Get Shareable Link:

1. Click **"Share"** button (top right)
2. Click **"Anyone with the link"**
3. Set to **"Can view"**
4. Click **"Copy link"**

**Your link will look like:**
```
https://www.canva.com/design/XXXXX/view
```

### Export as PDF (Optional):

1. Click **"Share"** → **"Download"**
2. Select **PDF Standard**
3. Save to your `docs/` folder

---

## Step 13: Add to GitHub (1 min)

### Update README.md:

Add this section to your README:

```markdown
## 📐 Design & Architecture

### Design Documentation
- **Canva Design File:** [View Presentation](YOUR_CANVA_LINK_HERE)
- **Information Architecture:** [View Document](./docs/INFORMATION_ARCHITECTURE.md)

### Design System
- Primary Color: #0EA5E9 (Blue)
- Secondary Color: #10B981 (Green)
- Font: Inter
- Dark Mode + Light Mode supported
```

---

## ✅ Final Checklist

Your Canva presentation should have:

- [ ] Cover slide with logo + team name
- [ ] Problem/Solution slide
- [ ] Information Architecture (site map/flows)
- [ ] Design System (colors, typography)
- [ ] 3-4 slides with app screenshots
- [ ] Annotations explaining features
- [ ] Shareable link generated
- [ ] Link added to README.md

---

## 🎨 Canva Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add Text | T |
| Add Rectangle | R |
| Add Line | L |
| Duplicate | Cmd/Ctrl + D |
| Group | Cmd/Ctrl + G |
| Undo | Cmd/Ctrl + Z |
| Zoom In | Cmd/Ctrl + + |
| Zoom Out | Cmd/Ctrl + - |
| Present | Cmd/Ctrl + Alt + P |

---

## 📝 Quick Reference - What Judges Want to See

Based on Veersa guidelines:

1. ✅ **Information Architecture** - How pages connect
2. ✅ **Design thinking** - Thought put into UX
3. ✅ **Visual design** - Clean, professional look
4. ✅ **Feature showcase** - Key features highlighted
5. ✅ **Consistency** - Same colors/styles throughout

---

*Total Time: ~20-25 minutes*  
*Good luck with your presentation! 🚀*
