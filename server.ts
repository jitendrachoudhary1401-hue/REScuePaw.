import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

dotenv.config();

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    // Try to use service account if provided, otherwise use default credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const serviceAccount = JSON.parse(
          Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString()
        );
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseConfig.projectId,
        });
      } catch (parseError) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_BASE64:", parseError);
        // Fallback to default initialization if parsing fails
        admin.initializeApp({
          projectId: firebaseConfig.projectId,
        });
      }
    } else {
      // Fallback for development if no service account is provided
      admin.initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  }
} catch (initError) {
  console.error("Firebase Admin initialization error:", initError);
}

// Use the specific database ID from config if available
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(firebaseConfig.firestoreDatabaseId)
  : getFirestore();

const auth = admin.auth();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.post("/api/auth/send-otp", async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store OTP in Firestore
      await db.collection("otps").add({
        email,
        otp,
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        _serverSecret: "ai-studio-secret-key",
      });

      // Send email via Resend
      if (resend) {
        await resend.emails.send({
          from: "Auth <onboarding@resend.dev>",
          to: email,
          subject: "Your OTP Code",
          html: `<p>Your OTP code is: <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
        });
      } else {
        console.log(`[DEV] OTP for ${email}: ${otp}`);
      }

      res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    try {
      // Find the latest valid OTP for this email
      const snapshot = await db
        .collection("otps")
        .where("email", "==", email)
        .where("otp", "==", otp)
        .get();

      const now = admin.firestore.Timestamp.now().toMillis();
      const validDocs = snapshot.docs.filter(doc => {
        const data = doc.data();
        return data._serverSecret === "ai-studio-secret-key" && data.expiresAt.toMillis() > now;
      });

      validDocs.sort((a, b) => b.data().expiresAt.toMillis() - a.data().expiresAt.toMillis());

      if (validDocs.length === 0) {
        return res.status(400).json({ error: "Invalid or expired OTP" });
      }

      // OTP is valid, delete it to prevent reuse
      const otpDoc = validDocs[0];
      await otpDoc.ref.delete();

      // Get or create user in Firebase Auth
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          userRecord = await auth.createUser({ email });
        } else {
          throw error;
        }
      }

      // Create a custom token for the user
      let customToken;
      try {
        customToken = await auth.createCustomToken(userRecord.uid);
      } catch (tokenError: any) {
        console.error("Error creating custom token:", tokenError);
        if (tokenError.code === "app/invalid-credential" || tokenError.message.includes("signBlob")) {
          return res.status(500).json({ 
            error: "Server configuration error: FIREBASE_SERVICE_ACCOUNT_BASE64 is missing or invalid. Custom tokens cannot be created without a service account." 
          });
        }
        throw tokenError;
      }

      res.json({ success: true, customToken });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
