<![CDATA[<div align="center">

# 🐾 REScue Paw

### *Every Life Deserves a Second Chance*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Powered-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Razorpay](https://img.shields.io/badge/Razorpay-Integrated-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com)

<br/>

> **REScue Paw** is an AI-powered street animal rescue platform that connects citizens, volunteers, NGOs, and veterinarians to report, rescue, treat, and rehome injured or abandoned animals — all in real time.

<br/>

[🚀 Getting Started](#-getting-started) · [✨ Features](#-features) · [🏗️ Architecture](#️-architecture) · [📸 Screenshots](#-screenshots) · [🤝 Contributing](#-contributing)

---

</div>

<br/>

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📂 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🔐 Security](#-security)
- [🌐 Internationalization](#-internationalization)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [💬 Contact](#-contact)

---

## 🌟 Overview

India has over **35 million** stray animals, yet there is no unified digital platform to coordinate their rescue. **REScue Paw** bridges this critical gap by providing an end-to-end ecosystem:

```
Citizen Reports ──► AI Analysis ──► Volunteer Dispatch ──► Vet Treatment ──► Adoption
```

The platform uses **Google Gemini AI** for real-time image analysis of animal injuries, automated severity assessment, breed detection, and document verification — reducing response time from hours to **minutes**.

### 🎯 Key Objectives

| Goal | How REScue Paw Achieves It |
|------|---------------------------|
| ⚡ **Rapid Response** | AI-powered triage + automatic dispatch to nearest volunteers |
| 🧠 **Smart Analysis** | Gemini AI identifies animal type, breed, injuries & severity from a single photo |
| 🔄 **Full Lifecycle** | Report → Rescue → Treat → Adopt — tracked end-to-end |
| 🍲 **Food Network** | Citizens donate food; volunteers & NGOs claim and distribute it |
| 🏠 **Adoption Pipeline** | Rescued animals are listed for adoption with AI-verified document checks |
| 🛒 **Pet Shop** | Buy food & supplies for animals with integrated Razorpay payments |
| 🌍 **Bilingual** | Full English + Hindi support across the entire platform |

---

## ✨ Features

### 🚨 Emergency Reporting System
- 📷 **Photo-based reporting** with camera capture or file upload
- 🤖 **AI Image Analysis** powered by Google Gemini:
  - Authenticity detection (real vs AI-generated images)
  - Animal presence verification
  - Species & breed identification (Dog, Cat, Cow, Other)
  - Injury classification & severity scoring (Critical/High/Medium/Low)
  - First-aid advice generation
- 📍 **GPS auto-location** with manual override
- 📡 **Real-time broadcasting** to nearby responders

### 🖥️ Role-Based Dashboard
Four distinct user roles with tailored experiences:

| Role | Capabilities |
|------|-------------|
| 🙋 **Citizen** | Report emergencies, track case status, donate food, adopt pets, shop |
| 🦸 **Volunteer** | Accept/decline cases, mark rescued, coordinate food bank pickups |
| 🏢 **NGO** | Manage incoming cases, coordinate rescues, list animals for adoption |
| 🏥 **Vet** | Update medical status, upload recovery photos, complete treatments |

### 📊 Live Case Tracking
- Kanban-style case board: **Incoming → In Progress → Rescued → Recovered**
- Real-time status timeline with author-attributed updates
- Before/after recovery photo comparison
- Decline & re-queue system for capacity management

### 🐕 Pet Adoption
- Browse rescued animals available for adoption
- **AI-powered document verification** for adoption applications:
  - Government ID validation
  - Address proof verification
  - Landlord NOC check (for renters)
- Multi-step application flow: Eligibility → Housing → Documents → Review

### 🍲 Food Donation & Bank
- AI food analysis for safety:
  - Food type & suitability detection (safe for dogs/cats/cows)
  - Spoilage/expiry detection
  - Quantity estimation
- Two delivery options: **Schedule Pickup** or **Drop-off at NGO**
- NGOs and volunteers can browse and claim available donations

### 🛒 Pet Shop
- Browse pet food and supplies
- Category filtering (Food / Stuffs / All)
- **Razorpay payment integration** (Online + Cash on Delivery)
- Full checkout flow with order confirmation
- Webhook-based payment verification

### 💬 AI Medical Guide (Chat Assistant)
- Emergency first-aid chatbot powered by Gemini AI
- Context-aware responses for animal medical emergencies
- Privacy-respecting with optional chat history saving

### 👤 User Profile & Privacy
- Avatar upload & profile management
- **Privacy controls**:
  - Private Mode (no local storage of new data)
  - Chat history toggle
  - Data usage consent management
  - Complete data erasure with confirmation
- Account deletion with safety confirmation

### 🔐 Authentication
- **Firebase Authentication** with Google Sign-In
- **OTP-based email authentication** via Resend
- Demo accounts for testing (Citizen, Volunteer, NGO, Vet)
- Beautiful split-screen auth layout with storytelling side panel

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| **React 19** | UI Framework with latest features |
| **TypeScript 5.8** | Type-safe development |
| **React Router 7** | Client-side routing (HashRouter) |
| **Lucide React** | Beautiful icon library |
| **Vite 7** | Lightning-fast build tool & dev server |

### Backend

| Technology | Purpose |
|-----------|---------|
| **Express 5** | REST API server |
| **Firebase Admin SDK** | Server-side auth & Firestore operations |
| **Google Gemini AI** | Image analysis, chat, food analysis, doc verification |
| **Razorpay** | Payment processing |
| **Resend** | OTP email delivery |
| **TSX** | TypeScript execution for server |

### Cloud & Services

| Technology | Purpose |
|-----------|---------|
| **Firebase Auth** | User authentication (Google + Custom OTP) |
| **Cloud Firestore** | User profiles, orders, OTPs |
| **Firebase Hosting** | Web app deployment |
| **Firebase Data Connect** | Data layer integration |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React SPA)                      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Screens │  │Components│  │ Contexts │  │   Services   │   │
│  │ 16 pages │  │  4 comps │  │ Language │  │ Firebase SDK │   │
│  │          │  │          │  │  i18n    │  │  Gemini AI   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP / Firebase SDK
┌────────────────────────┴────────────────────────────────────────┐
│                       SERVER (Express + TSX)                     │
│                                                                 │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │  Auth APIs   │  │  Shop APIs  │  │    Vite Middleware    │   │
│  │  Send OTP    │  │  Checkout   │  │   (Dev HMR Server)   │   │
│  │  Verify OTP  │  │  Webhook    │  │                      │   │
│  │              │  │  COD Flow   │  │                      │   │
│  └──────────────┘  └─────────────┘  └──────────────────────┘   │
│                                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────────┐
│                     CLOUD SERVICES                              │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Firebase │  │  Cloud   │  │  Gemini  │  │   Razorpay   │   │
│  │   Auth   │  │Firestore │  │    AI    │  │   Payments   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                 │
│  ┌──────────┐  ┌──────────────────────────────────────────┐    │
│  │  Resend  │  │         Firebase Hosting                 │    │
│  │  Emails  │  │                                          │    │
│  └──────────┘  └──────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
REScue Paw/
│
├── 📄 index.html              # Entry point HTML
├── 📄 index.tsx               # React app bootstrap
├── 📄 App.tsx                 # Main app with routing, auth, state management
├── 📄 types.ts                # TypeScript interfaces & enums
├── 📄 server.ts               # Express backend (OTP auth, shop APIs, Razorpay)
├── 📄 vite.config.ts          # Vite build configuration
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 firebase.json           # Firebase project config
├── 📄 firestore.rules         # Firestore security rules
│
├── 📁 screens/                # Page-level React components
│   ├── HomeScreen.tsx         # Mission control dashboard
│   ├── ReportScreen.tsx       # AI-powered emergency reporting
│   ├── DashboardScreen.tsx    # Case management board (NGO/Volunteer/Vet)
│   ├── StatusScreen.tsx       # Case tracking timeline
│   ├── LoginScreen.tsx        # Email/OTP + demo login
│   ├── RegisterScreen.tsx     # User registration with role selection
│   ├── SplashScreen.tsx       # Animated app loading screen
│   ├── IntroStoryScreen.tsx   # Onboarding story experience
│   ├── ProfileScreen.tsx      # User profile, settings, privacy, about
│   ├── DonationScreen.tsx     # Food donation with AI analysis
│   ├── FoodDonationsScreen.tsx# Food bank browsing & claiming
│   ├── AdoptionScreen.tsx     # Browse adoptable pets
│   ├── AdoptionFormScreen.tsx # Multi-step adoption application
│   ├── ShopScreen.tsx         # Pet food & supplies store
│   ├── CheckoutScreen.tsx     # Razorpay checkout flow
│   └── OrderConfirmationScreen.tsx # Order success page
│
├── 📁 components/             # Reusable UI components
│   ├── ChatAssistant.tsx      # AI medical guide floating widget
│   ├── AuthSidePanel.tsx      # Login page storytelling panel
│   ├── ScrollyTyping.tsx      # Scroll-triggered typing animation
│   └── Typewriter.tsx         # Typewriter text effect
│
├── 📁 contexts/               # React Context providers
│   └── LanguageContext.tsx    # i18n with English + Hindi translations
│
├── 📁 services/               # External service integrations
│   ├── firebase.ts            # Firebase client SDK initialization
│   └── gemini.ts              # Google Gemini AI service layer
│
├── 📁 src/                    # Generated SDK code
│   ├── dataconnect-generated/ # Firebase Data Connect client SDK
│   └── dataconnect-admin-generated/ # Data Connect admin SDK
│
└── 📁 dataconnect/            # Firebase Data Connect schemas
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| **Node.js** | ≥ 18.x |
| **npm** | ≥ 9.x |
| **Firebase CLI** | Latest |
| **Google Cloud Account** | For Gemini AI API key |

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/jitendrachoudhary1401-hue/REScuePaw.git
cd REScuePaw
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials (see [Environment Variables](#️-environment-variables) below).

**4. Start the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:3000` 🎉

### Demo Accounts

For quick testing without Firebase setup, the app includes built-in demo accounts:

| Role | Email | Password |
|------|-------|----------|
| 🙋 Citizen | `citizen@demo.com` | `123456` |
| 🦸 Volunteer | `volunteer@demo.com` | `123456` |
| 🏢 NGO | `ngo@demo.com` | `123456` |
| 🏥 Vet | `vet@demo.com` | `123456` |

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# ─── AI Services ───────────────────────────────────
API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key

# ─── Firebase Client Config ───────────────────────
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# ─── Server-Side (Optional) ──────────────────────
RESEND_API_KEY=your_resend_api_key
FIREBASE_SERVICE_ACCOUNT_BASE64=base64_encoded_service_account_json

# ─── Payments (Optional) ─────────────────────────
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

> **Note**: The app works in **DEV mode** without Resend or Razorpay keys — OTPs are logged to console and payments use test mode.

---

## 🔐 Security

### Firestore Security Rules

The project includes comprehensive Firestore security rules:

- ✅ **Authentication-gated access** — All reads require auth
- ✅ **Owner-only writes** — Users can only modify their own profiles
- ✅ **Field validation** — Required fields are enforced at the database level
- ✅ **Immutable fields** — `uid` and `email` cannot be changed after creation
- ✅ **Admin-only deletes** — Only admins can delete user accounts
- ✅ **Server-only OTP access** — OTP documents secured with server secrets

### Client-Side Privacy

- 🔒 **Private Mode** — Prevents local storage of sensitive data
- 🗑️ **Full data erasure** — Users can permanently delete all local data
- 📝 **Consent management** — Opt-in/opt-out for anonymized data usage

---

## 🌐 Internationalization

REScue Paw supports **bilingual operation** with full English and Hindi translations:

- 🇬🇧 **English** — Default language
- 🇮🇳 **हिन्दी (Hindi)** — Complete translation of all UI strings

Language preference is persisted in local storage and can be changed from **Profile → Settings**.

The translation system supports **200+ keys** covering:
- Navigation & menus
- Emergency reporting flows
- Dashboard & case management
- Adoption process
- Donation system
- Profile & privacy settings
- Chat assistant
- Error messages & confirmations

---

## 🗺️ Roadmap

- [ ] 📱 React Native mobile app
- [ ] 🗺️ Real-time map with live rescue markers
- [ ] 🔔 Push notifications for nearby incidents
- [ ] 📊 Analytics dashboard for NGOs
- [ ] 🏥 Vet appointment scheduling
- [ ] 💳 Recurring donation support
- [ ] 🐾 Post-adoption follow-up system
- [ ] 🌍 Multi-language expansion (Tamil, Bengali, Marathi)
- [ ] 📸 AI-powered recovery progress tracking
- [ ] 🤝 NGO verification & trust score system

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 💬 Contact

**Jitendra Choudhary** — Project Creator & Maintainer

- 📧 Email: [jitendrachoudhary1401@gmail.com](mailto:jitendrachoudhary1401@gmail.com)
- 🐙 GitHub: [@jitendrachoudhary1401-hue](https://github.com/jitendrachoudhary1401-hue)

---

<div align="center">

### 🐾 *"The greatness of a nation can be judged by the way its animals are treated."*
— Mahatma Gandhi

<br/>

**Made with ❤️ for every stray soul that deserves a second chance.**

<br/>

⭐ **Star this repo if you believe in the mission!** ⭐

</div>
]]>
