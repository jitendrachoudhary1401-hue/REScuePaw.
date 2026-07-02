
import React, { useEffect, useState } from 'react';
import { PawPrint } from 'lucide-react';

const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [taglineRevealed, setTaglineRevealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setIsVisible(true), 100);
    const t2 = setTimeout(() => setTaglineRevealed(true), 800);

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
      clearTimeout(t2);
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

  // Particle rain (small emerald dots drifting upward)
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 3,
    opacity: Math.random() * 0.5 + 0.15,
  }));

  const tagline = "Healing Street Souls";
  const letters = tagline.split('');

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center z-[100] overflow-hidden transition-opacity duration-600 ${isFading ? 'animate-fade-out' : ''}`}>
      {/* Animated morphing blob background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #047857 0%, #059669 30%, #10b981 60%, #065f46 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 4s ease infinite',
      }} />

      {/* Morphing blobs */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] animate-morphing-blob"
        style={{ background: 'rgba(255,255,255,0.06)', filter: 'blur(60px)' }}
      />
      <div className="absolute bottom-[-20%] right-[-15%] w-[70%] h-[70%] animate-morphing-blob"
        style={{ background: 'rgba(52,211,153,0.08)', filter: 'blur(80px)', animationDelay: '4s', animationDirection: 'reverse' }}
      />
      <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] animate-morphing-blob"
        style={{ background: 'rgba(110,231,183,0.06)', filter: 'blur(50px)', animationDelay: '8s' }}
      />

      {/* Particle rain */}
      {particles.map(p => (
        <div
          key={p.id}
          className="intro-particle"
          style={{
            left: p.left,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(255, 255, 255, ${p.opacity})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 4}px rgba(255, 255, 255, ${p.opacity * 0.4})`,
          }}
        />
      ))}

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
        {/* Logo with 3D flip entrance and glow ring */}
        <div className="relative">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-[48px] blur-2xl scale-150 animate-glow-pulse"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
          {/* Pulse ring */}
          <div className="absolute inset-[-8px] rounded-[52px] animate-pulse-ring"
            style={{ border: '2px solid rgba(255,255,255,0.2)' }}
          />
          
          <div className={`relative p-8 bg-white rounded-[40px] shadow-2xl ${isVisible ? 'animate-flip-in' : 'opacity-0'}`}
            style={{ animationDelay: '0.2s' }}
          >
            <PawPrint className="w-20 h-20 text-emerald-600" style={{ filter: 'drop-shadow(0 4px 12px rgba(5, 150, 105, 0.3))' }} />
          </div>
          
          {/* Spinning ring */}
          <svg className="absolute -inset-4 animate-rotate-slow" viewBox="0 0 160 160" style={{ animationDuration: '12s' }}>
            <circle cx="80" cy="80" r="74" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="8 16" />
          </svg>
          {/* Second spinning ring (opposite direction) */}
          <svg className="absolute -inset-8 animate-rotate-slow" viewBox="0 0 192 192" style={{ animationDuration: '18s', animationDirection: 'reverse' }}>
            <circle cx="96" cy="96" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 20" />
          </svg>
        </div>
        
        {/* Title */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            REScue <span className="text-emerald-200">Paw</span>
          </h1>
          
          {/* Letter-by-letter tagline reveal */}
          <div className="h-6 flex items-center justify-center gap-[1px] mt-2">
            {letters.map((letter, i) => (
              <span
                key={i}
                className="inline-block text-white/50 text-sm font-bold uppercase tracking-[0.2em]"
                style={{
                  opacity: taglineRevealed ? 1 : 0,
                  transform: taglineRevealed ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.8)',
                  filter: taglineRevealed ? 'blur(0)' : 'blur(4px)',
                  transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s`,
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
          </div>
          
          {/* Shimmer loading bar */}
          <div className="w-48 h-1 mx-auto mt-6 shimmer-bar rounded-full" />

          {/* Animated ring loader */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <svg className="w-5 h-5" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round"
                style={{
                  strokeDasharray: '264',
                  animation: 'ring-spin 1.5s ease-in-out infinite',
                  transformOrigin: '50% 50%',
                }}
              />
            </svg>
            <span className="text-white/50 text-xs font-bold uppercase tracking-[0.3em]">Initializing</span>
          </div>
        </div>
      </div>

      {/* Bottom stats with heartbeat counter */}
      <div className={`absolute bottom-12 flex flex-col items-center gap-3 transition-all duration-1000 delay-500
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      >
        <div className="text-white/80 text-2xl font-black tabular-nums">
          <span className="animate-heartbeat inline-block">{count.toLocaleString()}</span>
          <span className="text-emerald-300/80 text-lg ml-1">lives saved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-white/40 text-[10px] font-bold uppercase tracking-[0.25em]">
            Saving street souls since 2024
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
