
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Info, X, Shield, CheckCircle2, Smartphone, Key } from 'lucide-react';
import { User } from '../types';
import { signInWithCustomToken, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socialProvider, setSocialProvider] = useState<'google' | 'apple' | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("Failed to parse response as JSON:", text);
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      if (response.ok && data.success) {
        setStep('otp');
        if (data.devOtp) {
          setOtp(data.devOtp);
          alert(`[DEV MODE] Auto-filled OTP: ${data.devOtp}\n\nTo send real emails, add a RESEND_API_KEY to your .env file.`);
        }
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error("Send OTP Error:", err);
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error("Failed to parse response as JSON:", text);
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      if (response.ok && data.success) {
        let appUser: User;
        const mockUid = `dev_${email.split('@')[0]}`;

        if (data.customToken) {
          const userCredential = await signInWithCustomToken(auth, data.customToken);
          const firebaseUser = userCredential.user;

          // Fetch or create user profile in Firestore
          const userRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            appUser = userDoc.data() as User;
          } else {
            // Create new profile if it doesn't exist
            appUser = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid, // Required by security rules
              name: email.split('@')[0],
              email: email,
              role: 'CITIZEN',
              createdAt: new Date().toISOString(), 
            };
            const { serverTimestamp } = await import('firebase/firestore');
            await setDoc(userRef, {
              ...appUser,
              createdAt: serverTimestamp()
            });
          }
        } else if (data.devToken) {
           // Dev Auth Flow
           appUser = {
             id: mockUid,
             uid: mockUid,
             name: email.split('@')[0],
             email: email,
             role: 'CITIZEN',
             createdAt: new Date().toISOString(),
           };
           
           try {
             const userRef = doc(db, "users", mockUid);
             const userDoc = await getDoc(userRef);
             if (userDoc.exists()) {
               appUser = userDoc.data() as User;
             } else {
               const { serverTimestamp } = await import('firebase/firestore');
               await setDoc(userRef, { ...appUser, createdAt: serverTimestamp() });
             }
           } catch (e) {
             console.warn("Firestore unavailable, using memory user", e);
           }
        } else {
           throw new Error("Invalid server response format");
        }

        onLogin(appUser);
        navigate('/');
      } else {
        setError(data.error || 'Invalid or expired OTP');
      }
    } catch (err) {
      console.error("Verify OTP Error:", err);
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider: 'google' | 'apple') => {
    if (provider === 'google') {
       handleGoogleLogin();
    } else {
       setSocialProvider(provider); // Open mock modal for Apple
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      let appUser: User;

      if (!userDoc.exists()) {
        // Create new user profile for Google User
        appUser = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email || '',
          role: 'CITIZEN', // Default role
          avatar: firebaseUser.photoURL || undefined
        };
        await setDoc(userRef, appUser);
      } else {
        appUser = userDoc.data() as User;
      }
      
      onLogin(appUser);
      navigate('/');
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError(`Google Login failed. Please add ${window.location.hostname} to authorized domains in your Firebase Console (Authentication > Settings > Authorized domains).`);
      } else {
        setError(err.message || 'Google Sign-In failed.');
      }
      setLoading(false);
    }
  };

  // Mock Social Login Confirm (For Apple)
  const confirmSocialLoginMock = (account: { name: string, email: string, avatar?: string }) => {
    setSocialProvider(null);
    setLoading(true);
    
    setTimeout(() => {
      const socialUser: User = {
        id: `social_${Date.now()}`,
        name: account.name,
        email: account.email,
        role: 'CITIZEN',
        avatar: account.avatar
      };
      onLogin(socialUser);
      navigate('/');
    }, 1500);
  };

  const handleDemoLogin = (acc: { role: string, email: string }) => {
    setLoading(true);
    
    // Simulate a brief delay to show loading state
    setTimeout(() => {
      const demoUser: User = {
        id: `demo_${acc.role.toLowerCase()}`,
        name: `Demo ${acc.role}`,
        email: acc.email,
        role: acc.role.toUpperCase() as any,
      };
      onLogin(demoUser);
      navigate('/');
    }, 1000);
  };

  const demoAccounts = [
    { role: 'Citizen', email: 'citizen@demo.com' },
    { role: 'Volunteer', email: 'volunteer@demo.com' },
    { role: 'NGO', email: 'ngo@demo.com' },
    { role: 'Vet', email: 'vet@demo.com' },
  ];

  const appleAccounts = [
    { name: 'Alex Johnson', email: 'alex.j@icloud.com' },
    { name: 'Hide My Email', email: 'dp2s.492@privaterelay.appleid.com' },
  ];

  const roleIcons: Record<string, { icon: string; color: string; bg: string }> = {
    Citizen: { icon: '🏠', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    Volunteer: { icon: '🦸', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    NGO: { icon: '🏥', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    Vet: { icon: '⚕️', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
  };

  return (
    <div className="flex flex-col h-full page-enter overflow-y-auto pr-1">
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Enter your details to access your dashboard.</p>
      </div>

      {/* Animated Step Indicator */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500 ${
          step === 'email' 
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110' 
            : 'bg-emerald-500 text-white'
        }`}>
          {step === 'otp' ? <CheckCircle2 className="w-4 h-4" /> : '1'}
        </div>
        <div className="w-12 h-1 rounded-full bg-gray-100 overflow-hidden">
          <div className={`h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 ease-out ${step === 'otp' ? 'w-full' : 'w-0'}`} />
        </div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-500 ${
          step === 'otp'
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200 scale-110'
            : 'bg-gray-100 text-gray-400'
        }`}>
          2
        </div>
      </div>

      <form onSubmit={step === 'email' ? handleSendOtp : handleVerifyOtp} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2 animate-slide-in-bottom">
            <Info className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-1.5">
           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
             {step === 'email' ? 'Email Address' : 'Enter 6-Digit OTP'}
           </label>
          
          <div className="relative group" key={step}>
            {step === 'email' ? (
              <div className="animate-slide-in-bottom">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors z-10" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 backdrop-blur-md border-2 border-gray-200/60 rounded-2xl py-3.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] outline-none transition-all duration-300 font-medium input-glow"
                  placeholder="e.g. hero@rescue.com"
                />
              </div>
            ) : (
              <div className="animate-slide-in-right">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors z-10" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white/50 backdrop-blur-md border-2 border-gray-200/60 rounded-2xl py-3.5 pl-10 pr-4 text-sm text-gray-900 focus:border-emerald-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] outline-none transition-all duration-300 font-medium tracking-[0.5em] text-center input-glow"
                  placeholder="000000"
                  autoFocus
                />
              </div>
            )}
          </div>
          
          {step === 'otp' && (
            <div className="flex justify-between items-center pt-1 px-1">
               <span className="text-[10px] text-gray-400 font-medium">Sent to {email}</span>
               <button 
                 type="button"
                 onClick={() => setStep('email')}
                 className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
               >
                 Change Email
               </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="glow-button w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-800 py-3.5 rounded-[2rem] shadow-lg shadow-emerald-200/60 flex items-center justify-center gap-2 mt-2 active:scale-95 transition-all disabled:bg-gray-200 disabled:shadow-none disabled:from-gray-200 disabled:to-gray-200 hover:shadow-emerald-300/60 hover:shadow-xl"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              {step === 'email' ? 'Send OTP' : 'Verify & Sign In'} <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Social Login Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or continue with</span>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent flex-1" />
      </div>

      {/* Social Buttons with shine effect */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          type="button"
          onClick={() => handleSocialClick('google')}
          className="shine-button flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all active:scale-95 shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span className="text-xs font-bold text-gray-600">Google</span>
        </button>

        <button 
          type="button"
          onClick={() => handleSocialClick('apple')}
          className="shine-button flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-2xl hover:bg-black hover:shadow-xl transition-all active:scale-95 shadow-lg shadow-gray-300/50"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.29-1.23 3.57-1.23.6 0 2.45.16 3.03.89-.06.03-2.42 1.23-2.24 4.66.17 3.48 3.55 4.34 3.55 4.34-.33 1.18-1.4 3.66-2.99 3.57zm-3.55-15.5c.34-1.89 2.08-3.33 4-3.33.2 2.37-2.18 4.15-4 3.33z" />
          </svg>
          <span className="text-xs font-bold">Apple</span>
        </button>
      </div>

      {/* Registration Prominent Link */}
      <div className="mt-2 pt-6 border-t border-gray-100/80">
        <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500 font-medium">Don't have an account?</p>
            <Link 
                to="/register" 
                className="w-full py-3.5 rounded-[2rem] border-2 border-emerald-100 text-emerald-700 font-800 flex items-center justify-center gap-2 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 transition-all active:scale-95"
            >
                Create Account <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </div>

      <div className="mt-8 pb-4">
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-[1.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
              <Info className="w-3 h-3 text-emerald-600" />
            </div>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Quick Demo Access</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            {demoAccounts.map((acc, i) => (
              <button
                key={acc.role}
                onClick={() => handleDemoLogin(acc)}
                className={`${roleIcons[acc.role]?.bg || 'bg-gray-50 border-gray-100'} border p-3 rounded-xl text-left hover:shadow-lg transition-all active:scale-95 group spotlight-card animate-slide-in-bottom`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{roleIcons[acc.role]?.icon}</span>
                  <span className={`text-[10px] font-extrabold uppercase tracking-tight ${roleIcons[acc.role]?.color || 'text-emerald-600'}`}>{acc.role}</span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium truncate group-hover:text-gray-700 transition-colors">{acc.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Social Account Selection Modal (Apple Mock) */}
      {socialProvider && socialProvider !== 'google' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-300" onClick={() => setSocialProvider(null)}>
          <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-800 text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.29-1.23 3.57-1.23.6 0 2.45.16 3.03.89-.06.03-2.42 1.23-2.24 4.66.17 3.48 3.55 4.34 3.55 4.34-.33 1.18-1.4 3.66-2.99 3.57zm-3.55-15.5c.34-1.89 2.08-3.33 4-3.33.2 2.37-2.18 4.15-4 3.33z" /></svg>
                  Sign in with Apple
                </h3>
                <button onClick={() => setSocialProvider(null)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
             </div>
             
             <div className="p-4 space-y-2">
               {appleAccounts.map((acc, idx) => (
                   <button 
                      key={idx}
                      onClick={() => confirmSocialLoginMock(acc)}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 text-left group"
                   >
                      <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                         <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.29-1.23 3.57-1.23.6 0 2.45.16 3.03.89-.06.03-2.42 1.23-2.24 4.66.17 3.48 3.55 4.34 3.55 4.34-.33 1.18-1.4 3.66-2.99 3.57zm-3.55-15.5c.34-1.89 2.08-3.33 4-3.33.2 2.37-2.18 4.15-4 3.33z" /></svg>
                      </div>
                      <div>
                         <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700">{acc.name}</p>
                         <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                            {acc.name === 'Hide My Email' && <Shield className="w-3 h-3 text-emerald-500" />}
                            {acc.email}
                         </p>
                      </div>
                      {idx === 0 && <CheckCircle2 className="w-5 h-5 text-emerald-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />}
                   </button>
                 ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
