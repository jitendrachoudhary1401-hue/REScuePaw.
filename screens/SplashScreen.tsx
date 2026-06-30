
import React, { useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Staggered entrance
    const t1 = setTimeout(() => setIsVisible(true), 100);
    
    // Counter animation
    const targetCount = 1247;
    const steps = 40;
    const increment = targetCount / steps;
    let current = 0;
    const counterInterval = setInterval(() => {
      current += increment;
      if (current >= targetCount) {
        setCount(targetCount);
        clearInterval(counterInterval);
      } else {
        setCount(Math.floor(current));
      }
    }, 50);

    // Fade out before unmount
    const fadeTimer = setTimeout(() => setIsFading(true), 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(fadeTimer);
      clearInterval(counterInterval);
    };
  }, []);

  // Paw print walking positions
  const pawPrints = [
    { left: '15%', top: '20%', delay: '0.3s', rotate: '-25deg', size: 16 },
    { left: '25%', top: '35%', delay: '0.6s', rotate: '15deg', size: 14 },
    { left: '70%', top: '15%', delay: '0.9s', rotate: '-10deg', size: 18 },
    { left: '80%', top: '65%', delay: '1.2s', rotate: '20deg', size: 12 },
    { left: '40%', top: '75%', delay: '1.5s', rotate: '-15deg', size: 16 },
    { left: '60%', top: '50%', delay: '1.8s', rotate: '5deg', size: 14 },
  ];

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center z-[100] overflow-hidden transition-opacity duration-600 ${isFading ? 'animate-fade-out' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #047857 0%, #059669 30%, #10b981 60%, #065f46 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 4s ease infinite',
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full blur-3xl animate-float-slow"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      />
      <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full blur-3xl animate-float"
        style={{ background: 'rgba(255,255,255,0.04)', animationDelay: '1s' }}
      />
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full blur-3xl animate-float-slow"
        style={{ background: 'rgba(52,211,153,0.08)', animationDelay: '2s' }}
      />

      {/* Floating paw prints */}
      {pawPrints.map((paw, i) => (
        <div
          key={i}
          className="paw-step"
          style={{
            left: paw.left,
            top: paw.top,
            animationDelay: paw.delay,
          }}
        >
          <PawPrint 
            className="text-white/10" 
            style={{ 
              width: paw.size, 
              height: paw.size,
              transform: `rotate(${paw.rotate})`,
            }} 
          />
        </div>
      ))}

      {/* Dot grid overlay */}
      <div className="absolute inset-0 particles-bg opacity-30" />

      {/* Main content */}
      <div className={`flex flex-col items-center gap-8 transition-all duration-1000 transform relative z-10
        ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90'}`}
      >
        {/* Logo with glow ring */}
        <div className="relative">
          <div className="absolute inset-0 rounded-[48px] blur-2xl scale-150 animate-glow-pulse"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
          <div className="relative p-8 bg-white rounded-[40px] shadow-2xl">
            <PawPrint className="w-20 h-20 text-emerald-600" style={{ filter: 'drop-shadow(0 4px 12px rgba(5, 150, 105, 0.3))' }} />
          </div>
          {/* Spinning ring */}
          <svg className="absolute -inset-4 animate-rotate-slow" viewBox="0 0 160 160" style={{ animationDuration: '12s' }}>
            <circle cx="80" cy="80" r="74" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="8 12" />
          </svg>
        </div>
        
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            REScue <span className="text-emerald-200">Paw</span>
          </h1>
          
          {/* Animated ring loader */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <svg className="w-6 h-6" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round"
                style={{
                  strokeDasharray: '264',
                  animation: 'ring-spin 1.5s ease-in-out infinite',
                  transformOrigin: '50% 50%',
                }}
              />
            </svg>
            <span className="text-white/60 text-sm font-bold uppercase tracking-widest">Loading</span>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div className={`absolute bottom-12 flex flex-col items-center gap-3 transition-all duration-1000 delay-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="text-white/80 text-2xl font-black tabular-nums">
          {count.toLocaleString()}
          <span className="text-emerald-300/80 text-lg ml-1">lives saved</span>
        </div>
        <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.25em]">
          Healing street souls since 2024
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
