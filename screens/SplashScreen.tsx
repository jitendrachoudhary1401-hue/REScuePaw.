
import React, { useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="fixed inset-0 bg-emerald-600 flex flex-col items-center justify-center z-[100] transition-opacity duration-1000 overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className={`flex flex-col items-center gap-6 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl scale-150 animate-pulse"></div>
          <div className="p-8 bg-white rounded-[40px] shadow-2xl relative">
            <PawPrint className="w-24 h-24 text-emerald-600" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter italic">
            REScue <span className="opacity-80">Paw</span>
          </h1>
          <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-white w-1/2 rounded-full animate-[loading_1.5s_infinite_ease-in-out]"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 text-white/70 text-xs font-bold uppercase tracking-[0.2em]">
        Healing street souls
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  );
};

export default SplashScreen;
