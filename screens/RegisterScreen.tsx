
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ShieldCheck, ArrowRight, Loader2, Building, HeartHandshake, Smartphone, AlertCircle, Key } from 'lucide-react';
import { User, UserRole } from '../types';
import { signInWithCustomToken } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface RegisterScreenProps {
  onRegister: (user: User) => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [org, setOrg] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleVerifyAndRegister = async (e: React.FormEvent) => {
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

      if (response.ok && data.success && data.customToken) {
        const userCredential = await signInWithCustomToken(auth, data.customToken);
        const firebaseUser = userCredential.user;

        // Prepare User Data object
        const newUser: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid, // Required by security rules
          name,
          email,
          phone,
          role,
          organization: (role === 'NGO' || role === 'VET') ? org : undefined,
          createdAt: new Date().toISOString(), // Required by security rules
        };

        // Save User Profile to Firestore
        const { serverTimestamp } = await import('firebase/firestore');
        await setDoc(doc(db, "users", firebaseUser.uid), {
          ...newUser,
          createdAt: serverTimestamp()
        });

        onRegister(newUser);
        navigate('/');
      } else {
        setError(data.error || 'Invalid or expired OTP');
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'CITIZEN', icon: UserIcon, label: 'Reporter' },
    { id: 'VOLUNTEER', icon: HeartHandshake, label: 'Volunteer' },
    { id: 'NGO', icon: Building, label: 'NGO' },
    { id: 'VET', icon: ShieldCheck, label: 'Vet' }
  ];

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500 overflow-y-auto pr-1">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Join the Mission</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Create an account to start helping.</p>
      </div>

      <div className="mb-6">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block tracking-widest">Select your role</label>
        <div className="grid grid-cols-4 gap-2">
          {roles.map((r) => {
            const Icon = r.icon;
            const isSelected = role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as UserRole)}
                className={`py-3 px-1 rounded-2xl border transition-all flex flex-col items-center gap-1 active:scale-95 ${
                  isSelected 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-100 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-300'}`} />
                <span className="text-[9px] font-800 uppercase tracking-tighter">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={step === 'info' ? handleSendOtp : handleVerifyAndRegister} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {step === 'info' ? (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-10 pr-4 text-sm text-gray-900 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium"
                  placeholder="e.g. Alex Johnson"
                />
              </div>
            </div>

            {(role === 'NGO' || role === 'VET') && (
              <div className="space-y-1 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Organization / Clinic</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    required={true}
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-10 pr-4 text-sm text-gray-900 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium"
                    placeholder="e.g. Hope For Paws"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-10 pr-4 text-sm text-gray-900 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium"
                  placeholder="e.g. hero@rescue.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Mobile Number</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-10 pr-4 text-sm text-gray-900 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium"
                  placeholder="e.g. 98765 43210"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1 tracking-widest">Enter 6-Digit OTP sent to {email}</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-10 pr-4 text-sm text-gray-900 focus:ring-4 focus:ring-emerald-50 outline-none transition-all font-medium tracking-[0.5em] text-center"
                placeholder="000000"
              />
            </div>
            <div className="flex justify-end pt-1 px-1">
               <button 
                 type="button"
                 onClick={() => setStep('info')}
                 className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
               >
                 Edit Details
               </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-800 py-3.5 rounded-[2rem] shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 mt-2 active:scale-95 transition-transform disabled:bg-gray-200 disabled:shadow-none hover:bg-emerald-700"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              {step === 'info' ? 'Send OTP' : 'Verify & Register'} <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Login Prominent Link */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500 font-medium">Already have an account?</p>
            <Link 
                to="/login" 
                className="w-full py-3.5 rounded-[2rem] border-2 border-emerald-100 text-emerald-700 font-800 flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all active:scale-95"
            >
                Log In <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
