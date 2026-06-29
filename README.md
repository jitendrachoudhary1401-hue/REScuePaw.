<div align="center">

# 🐾 REScue Paw

### *Every Life Deserves a Second Chance*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com)

<br/>

An **AI-powered street animal rescue platform** that connects citizens, volunteers, NGOs, and veterinarians to report, rescue, treat, and rehome injured or abandoned animals — all in real time.

<br/>

[🚀 Quick Start](#-quick-start) · [✨ Features](#-features) · [🏗️ Architecture](#%EF%B8%8F-architecture) · [🛠️ Tech Stack](#%EF%B8%8F-tech-stack) · [🤝 Contributing](#-contributing)

---

</div>

## 🌟 The Problem We Solve

India has over **35 million** stray animals. When a citizen spots an injured animal, there's no fast, reliable way to coordinate a rescue. Calls go unanswered, NGOs are overwhelmed, and animals suffer.

**REScue Paw** changes that with a single, AI-driven pipeline:

```
📷 Citizen Reports ──► 🤖 AI Analysis ──► 🦸 Volunteer Dispatch ──► 🏥 Vet Treatment ──► 🏠 Adoption
```

> **Result:** Response time drops from **hours to minutes**. Every report is analyzed, triaged, and dispatched automatically.

---

## ✨ Features

### 🚨 Emergency Reporting with AI Triage

| Capability | Description |
|-----------|-------------|
| 📷 Photo Capture | Camera or file upload for incident evidence |
| 🧠 Gemini AI Analysis | Detects animal type, breed, injury severity, and image authenticity |
| 📍 Auto GPS Location | Pinpoints the exact location with manual override |
| 📡 Instant Broadcast | Notifies nearest volunteers and NGOs in real time |
| 🩹 First-Aid Advice | AI generates immediate care instructions while help arrives |

### 🖥️ Role-Based Experience

<table>
<tr>
<td align="center" width="25%">

**🙋 Citizen**

Report emergencies, track cases, donate food, adopt pets, shop for supplies

</td>
<td align="center" width="25%">

**🦸 Volunteer**

Accept cases, coordinate rescues, manage food bank pickups

</td>
<td align="center" width="25%">

**🏢 NGO**

Manage case pipeline, list animals for adoption, oversee operations

</td>
<td align="center" width="25%">

**🏥 Vet**

Update medical status, upload recovery photos, mark treatments complete

</td>
</tr>
</table>

### 📊 Live Case Board

- **Kanban workflow:** Incoming → In Progress → Rescued → Recovered
- Real-time timeline with author-attributed status updates
- Before/after recovery photo comparison
- Smart decline & re-queue when responders are at capacity

### 🐕 Pet Adoption Pipeline

- Browse rescued animals ready for adoption
- **AI-powered document verification:**
  - Government ID validation
  - Address proof check
  - Landlord NOC verification (for renters)
- Guided application: Eligibility → Housing → Documents → Review

### 🍲 Food Donation Network

- **AI food safety analysis** — detects food type, spoilage risk, and animal suitability
- Two delivery options: **Schedule Pickup** or **Drop off at NGO**
- NGOs & volunteers browse and claim available donations

### 🛒 Pet Shop with Payments

- Browse food & supplies with category filters
- **Razorpay integration** — Online payments + Cash on Delivery
- Full checkout → order confirmation → webhook-verified payments

### 💬 AI Medical Guide

- Floating chat assistant powered by Gemini AI
- Context-aware emergency first-aid responses
- Optional chat history with privacy toggle

### 🔐 Auth & Privacy

- **Firebase Auth** — Google Sign-In + OTP email login (via Resend)
- Private Mode, data consent controls, full data erasure
- Demo accounts included for instant testing

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENT  (React SPA)                    │
│                                                          │
│   Screens (16)  ·  Components (4)  ·  Contexts  ·  Services
│                                                          │
└──────────────────────────┬───────────────────────────────┘
                           │  HTTP + Firebase SDK
┌──────────────────────────┴───────────────────────────────┐
│                   SERVER  (Express + TSX)                 │
│                                                          │
│   Auth APIs         Shop APIs         Vite Dev Server    │
│   (Send/Verify OTP) (Checkout/COD/    (HMR Middleware)   │
│                      Webhook)                            │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────┐
│                     CLOUD SERVICES                        │
│                                                          │
│   Firebase Auth  ·  Cloud Firestore  ·  Firebase Hosting │
│   Gemini AI      ·  Razorpay         ·  Resend Email     │
│   Firebase Data Connect                                  │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

<table>
<tr><th align="left" width="120">Layer</th><th align="left">Technologies</th></tr>
<tr>
<td><strong>Frontend</strong></td>
<td>React 19 · TypeScript 5.8 · React Router 7 · Lucide Icons · Vite 7</td>
</tr>
<tr>
<td><strong>Backend</strong></td>
<td>Express 5 · Firebase Admin SDK · TSX Runtime · Crypto (HMAC verification)</td>
</tr>
<tr>
<td><strong>AI</strong></td>
<td>Google Gemini AI — image analysis, chat, food analysis, document verification</td>
</tr>
<tr>
<td><strong>Cloud</strong></td>
<td>Firebase Auth · Cloud Firestore · Firebase Hosting · Firebase Data Connect</td>
</tr>
<tr>
<td><strong>Payments</strong></td>
<td>Razorpay (orders + webhooks + COD)</td>
</tr>
<tr>
<td><strong>Email</strong></td>
<td>Resend (OTP delivery)</td>
</tr>
<tr>
<td><strong>i18n</strong></td>
<td>Custom React Context — English + Hindi (200+ translation keys)</td>
</tr>
</table>

---

## 📂 Project Structure

```
📦 REScue Paw
├── index.html                 # Entry point
├── index.tsx                  # React bootstrap
├── App.tsx                    # Routing, auth, global state
├── types.ts                   # All TypeScript interfaces & enums
├── server.ts                  # Express API (auth, shop, payments)
├── vite.config.ts             # Build config
├── firebase.json              # Firebase project config
├── firestore.rules            # Security rules
│
├── 📁 screens/                # 16 page components
│   ├── HomeScreen             #   Mission control dashboard
│   ├── ReportScreen           #   AI-powered emergency report
│   ├── DashboardScreen        #   Case board (NGO/Vol/Vet)
│   ├── StatusScreen           #   Case tracking timeline
│   ├── LoginScreen            #   OTP + demo login
│   ├── RegisterScreen         #   Role-based registration
│   ├── SplashScreen           #   Animated loading
│   ├── IntroStoryScreen       #   Onboarding experience
│   ├── ProfileScreen          #   Settings, privacy, about
│   ├── DonationScreen         #   Food donation + AI check
│   ├── FoodDonationsScreen    #   Browse & claim donations
│   ├── AdoptionScreen         #   Browse adoptable pets
│   ├── AdoptionFormScreen     #   Multi-step adopt application
│   ├── ShopScreen             #   Pet food & supplies
│   ├── CheckoutScreen         #   Razorpay checkout
│   └── OrderConfirmationScreen#   Order success
│
├── 📁 components/             # Shared UI
│   ├── ChatAssistant          #   Floating AI guide
│   ├── AuthSidePanel          #   Login storytelling panel
│   ├── ScrollyTyping          #   Scroll-triggered animation
│   └── Typewriter             #   Typing text effect
│
├── 📁 contexts/
│   └── LanguageContext        #   i18n provider (EN / HI)
│
├── 📁 services/
│   ├── firebase               #   Firebase client SDK init
│   └── gemini                 #   Gemini AI service layer
│
└── 📁 dataconnect/            # Firebase Data Connect schemas
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18 &nbsp;·&nbsp; **npm** ≥ 9 &nbsp;·&nbsp; **Firebase CLI** (latest)

### 1 — Clone & Install

```bash
git clone https://github.com/jitendrachoudhary1401-hue/REScuePaw.git
cd REScuePaw
npm install
```

### 2 — Configure Environment

```bash
cp .env.example .env
```

Fill in your keys (see [Environment Variables](#%EF%B8%8F-environment-variables) below).

### 3 — Run

```bash
npm run dev
```

Open **http://localhost:3000** 🎉

### 🧪 Demo Accounts

No Firebase setup needed — use these built-in test accounts:

| Role | Email | Password |
|------|-------|----------|
| 🙋 Citizen | `citizen@demo.com` | `123456` |
| 🦸 Volunteer | `volunteer@demo.com` | `123456` |
| 🏢 NGO | `ngo@demo.com` | `123456` |
| 🏥 Vet | `vet@demo.com` | `123456` |

---

## ⚙️ Environment Variables

```env
# ─── AI ──────────────────────────────────────────
API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key

# ─── Firebase (Client) ──────────────────────────
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# ─── Server (Optional) ──────────────────────────
RESEND_API_KEY=your_resend_key
FIREBASE_SERVICE_ACCOUNT_BASE64=base64_encoded_json

# ─── Payments (Optional) ────────────────────────
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

> **💡 Tip:** The app runs fine in DEV mode without Resend or Razorpay keys. OTPs are logged to the console, and payments use test mode.

---

## 🔐 Security

**Firestore Rules**
- ✅ All reads require authentication
- ✅ Users can only modify their own profiles
- ✅ Required fields enforced at the database level
- ✅ `uid` and `email` are immutable after creation
- ✅ Only admins can delete accounts
- ✅ OTP documents secured with server secrets

**Client-Side Privacy**
- 🔒 Private Mode — prevents local storage of new data
- 🗑️ Full data erasure with typed confirmation
- 📝 Granular consent for anonymized data usage

---

## 🌐 Internationalization

| Language | Coverage |
|----------|----------|
| 🇬🇧 English | Default — full coverage |
| 🇮🇳 हिन्दी (Hindi) | Complete — 200+ translated keys |

Switch languages anytime from **Profile → Settings**. Preference is persisted locally.

---

## 🗺️ Roadmap

| Status | Feature |
|--------|---------|
| 🔲 | 📱 React Native mobile app |
| 🔲 | 🗺️ Live map with real-time rescue markers |
| 🔲 | 🔔 Push notifications for nearby incidents |
| 🔲 | 📊 Analytics dashboard for NGOs |
| 🔲 | 🏥 Vet appointment scheduling |
| 🔲 | 💳 Recurring donation support |
| 🔲 | 🐾 Post-adoption follow-up system |
| 🔲 | 🌍 More languages — Tamil, Bengali, Marathi |
| 🔲 | 📸 AI-powered recovery progress tracking |
| 🔲 | 🤝 NGO verification & trust scores |

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** this repository
2. **Create** a feature branch — `git checkout -b feature/your-feature`
3. **Commit** your changes — `git commit -m 'Add your feature'`
4. **Push** — `git push origin feature/your-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

## 💬 Contact

**Jitendra Choudhary** — Creator & Maintainer

📧 [jitendrachoudhary1401@gmail.com](mailto:jitendrachoudhary1401@gmail.com) &nbsp;·&nbsp; 🐙 [@jitendrachoudhary1401-hue](https://github.com/jitendrachoudhary1401-hue)

---

<div align="center">

### 🐾 *"The greatness of a nation can be judged by the way its animals are treated."*
— Mahatma Gandhi

<br/>

**Made with ❤️ for every stray soul that deserves a second chance.**

<br/>

⭐ **Star this repo if you believe in the mission!** ⭐

</div>
