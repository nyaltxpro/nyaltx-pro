# Email Design Standard - NYALTX

## 🎨 Standardized Email Template Design

All NYALTX email templates follow the same layout and design structure. Only the text content changes between templates.

---

## 📐 Layout Structure

```
┌────────────────────────────────────────┐
│  LOGO (120x120)                        │
│  NYALTX                                │
│  [Template-specific subtitle]          │
│  ────────────────────────────────      │
│                                        │
│  [Main Heading]                        │
│                                        │
│  [Greeting Text]                       │
│                                        │
│  [Main Content Text]                   │
│                                        │
│  ┌──────────────────────────────┐     │
│  │  Info Box (gray background)   │     │
│  │  [Content-specific info]      │     │
│  └──────────────────────────────┘     │
│                                        │
│  [Additional text/links]               │
│                                        │
│  ─────────────────────────────────    │
│                                        │
│  [Signature/Footer Section]            │
│                                        │
└────────────────────────────────────────┘
   Copyright © 2025 | Links
```

---

## 🎨 Design Specifications

### **Colors:**
- **Header Gradient:** `linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)`
- **Text Primary:** `#1e293b` (slate-800)
- **Text Secondary:** `#475569` (slate-600)
- **Text Muted:** `#64748b` (slate-500)
- **Background Main:** `#f5f5f5`
- **Background Card:** `#ffffff`
- **Background Section:** `#f8fafc` (slate-50)
- **Border:** `#e2e8f0` (slate-200)
- **Accent:** `#0ea5e9` (cyan-500)
- **Link Color:** `#0ea5e9`

### **Typography:**
- **Font Family:** System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, etc.)
- **Logo Text:** 32px, bold, letter-spacing 2px
- **H1:** 24px, bold
- **Body Text:** 14px, line-height 1.6
- **Small Text:** 12-13px
- **Footer:** 12px

### **Spacing:**
- **Container Max Width:** 600px
- **Outer Padding:** 20px
- **Section Padding:** 30-35px
- **Element Margins:** 16-24px

### **Border Radius:**
- **Card:** 10px
- **Info Boxes:** 8px
- **Inner Elements:** 6px

---

## 📋 Required Sections

### **1. Header Section** (Gradient Background)
- Logo image (120x120px)
- "NYALTX" text
- Template-specific subtitle

### **2. Upper Section** (White Background)
- Main heading
- Greeting text (personalized)
- Main content text
- Info boxes (gray background)
- Additional content/links
- Dividers where needed

### **3. Lower Section** (Light Gray Background)
- Signature/closing text
- Contact information
- Final call-to-action

### **4. Footer Section**
- Copyright notice
- Privacy Policy link
- Contact/Admin links

---

## 📧 Template Variations

### **Contact Form Admin:**
- **Subtitle:** "New Contact Form Submission"
- **Content:** Sender details, message preview
- **Info Box:** From, Email, Subject, Message
- **Footer:** Reply instructions, Admin Dashboard link

### **Contact Form Reply:**
- **Subtitle:** "Thank You for Reaching Out"
- **Content:** Acknowledgment, message summary
- **Info Box:** Message preview
- **Links:** Dashboard, Race to Liberty, News, FAQ
- **Footer:** Team signature, contact info

### **Newsletter Welcome:**
- **Subtitle:** "Your Gateway to the Crypto World"
- **Content:** Welcome message, benefits list
- **Info Box:** What to expect (benefits)
- **Links:** Explore Dashboard CTA
- **Social:** Twitter, Telegram, YouTube
- **Footer:** Unsubscribe option

### **Newsletter Admin Notification:**
- **Subtitle:** "Newsletter Subscription Alert"
- **Content:** New subscriber notification
- **Info Box:** Email, Name, IP, Timestamp
- **Footer:** Admin Dashboard link

---

## 💅 Style Constants (Shared)

```typescript
const main = {
  backgroundColor: '#f5f5f5',
  color: '#212121',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#f5f5f5',
  maxWidth: '600px',
};

const headerSection = {
  background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
  padding: '30px',
  textAlign: 'center' as const,
  borderRadius: '10px 10px 0 0',
};

const logoText = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
  letterSpacing: '2px',
};

const coverSection = { 
  backgroundColor: '#fff',
  borderRadius: '10px',
  overflow: 'hidden',
};

const upperSection = { 
  padding: '30px 35px',
};

const lowerSection = { 
  padding: '25px 35px',
  backgroundColor: '#f8fafc',
};

const infoBox = {
  backgroundColor: '#f8fafc',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  marginBottom: '24px',
};
```

---

## 🔧 Implementation Rules

1. **Always include logo** at top of header
2. **Consistent gradient** for header background
3. **Same padding/spacing** across all templates
4. **Info boxes** for structured data
5. **Signature section** in lower section
6. **Footer links** in every email
7. **Responsive** design principles
8. **Accessible** color contrast

---

## ✅ Checklist for New Templates

- [ ] Logo in header (120x120px)
- [ ] Gradient header background
- [ ] NYALTX text in header
- [ ] Template-specific subtitle
- [ ] Main heading (h1)
- [ ] Personalized greeting
- [ ] Clear main content
- [ ] Info box for structured data
- [ ] Dividers between sections
- [ ] Lower section with signature
- [ ] Footer with copyright
- [ ] Links styled with cyan color
- [ ] Consistent spacing (30-35px sections)
- [ ] Border radius (10px card, 8px boxes)

---

This ensures brand consistency and professional appearance across all NYALTX email communications! 🎉
