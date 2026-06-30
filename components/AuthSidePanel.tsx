
import React from 'react';
import { PawPrint, Heart, Activity, ShieldCheck } from 'lucide-react';
import Typewriter from './Typewriter';

const AuthSidePanel: React.FC = () => {
  return (
    <div className="w-full h-full relative flex flex-col justify-between p-12 text-white">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2000&auto=format&fit=crop" 
          alt="Dogs playing" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-black/60" />
        <div className="absolute inset-0 z-0 particles-bg opacity-40 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
             <PawPrint className="w-8 h-8 text-emerald-400" />
           </div>
           <span className="text-2xl font-black tracking-tight italic">REScue <span className="text-emerald-400">Paw</span></span>
        </div>
        
        <div className="space-y-6 max-w-lg mt-20">
           <h2 className="text-5xl font-black leading-tight tracking-tight animate-soft-pulse">
             <span className="block text-emerald-400">Saving Lives</span>
             <Typewriter 
               text="One Click at a Time." 
               speed={80} 
               delay={500}
               className="block"
             />
           </h2>
           <p className="text-lg text-emerald-100/80 font-medium leading-relaxed">
             Join a community of local heroes dedicated to providing immediate aid to street animals through AI technology and rapid coordination. Our platform is sustained through a transparent model: veterinary clinics pay a small subscription fee for our triage software, and a 5% transaction fee on user donations helps keep our servers running, ensuring 95% goes directly to the animals.
           </p>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mt-auto">
         <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
            <Activity className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">AI Triage</p>
              <p className="text-sm font-bold">Instant Analysis</p>
            </div>
         </div>
         <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Verified</p>
              <p className="text-sm font-bold">Trusted Network</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AuthSidePanel;
