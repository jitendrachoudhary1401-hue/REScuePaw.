
import React, { useState, useEffect } from 'react';
import { PawPrint, Heart, Activity, ShieldCheck, Star, Users, Zap } from 'lucide-react';
import Typewriter from './Typewriter';

const heroImages = [
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2000&auto=format&fit=crop',
];

const testimonials = [
  {
    text: "I found an injured puppy and within 15 minutes, a volunteer was at the spot. REScue Paw literally saved a life!",
    author: "Priya S.",
    role: "Citizen Reporter",
  },
  {
    text: "As a vet, the AI triage gives me a head start before the animal even arrives. Game changer for emergency care.",
    author: "Dr. Rahul M.",
    role: "Veterinarian",
  },
  {
    text: "We've coordinated over 200 rescues through the platform. The community here is incredible.",
    author: "Hope Rescue NGO",
    role: "NGO Partner",
  },
];

const AuthSidePanel: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(true);

  // Cross-fade image slideshow
  useEffect(() => {
    const imageTimer = setInterval(() => {
      setImageLoaded(false);
      setTimeout(() => {
        setCurrentImage(prev => (prev + 1) % heroImages.length);
        setImageLoaded(true);
      }, 600);
    }, 5000);
    return () => clearInterval(imageTimer);
  }, []);

  // Cycling testimonials
  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(testimonialTimer);
  }, []);

  // Floating emoji particles
  const emojiParticles = [
    { emoji: '🐕', left: '10%', delay: 0, duration: 18 },
    { emoji: '🐈', left: '30%', delay: 4, duration: 22 },
    { emoji: '❤️', left: '55%', delay: 8, duration: 16 },
    { emoji: '🐾', left: '75%', delay: 2, duration: 20 },
    { emoji: '💚', left: '90%', delay: 6, duration: 17 },
    { emoji: '🐕', left: '45%', delay: 10, duration: 21 },
    { emoji: '🐈', left: '65%', delay: 12, duration: 19 },
  ];

  const stats = [
    { value: '1,247', label: 'Lives Saved', icon: Heart },
    { value: '450+', label: 'Heroes', icon: Users },
    { value: '<2min', label: 'Response', icon: Zap },
  ];

  return (
    <div className="w-full h-full relative flex flex-col justify-between p-12 text-white overflow-hidden">
      {/* Cross-fade background images */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImages[currentImage]}
          alt="Animal rescue"
          className="w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-emerald-800/70 to-black/80" />
        <div className="absolute inset-0 z-0 particles-bg opacity-40 pointer-events-none" />
      </div>

      {/* Gradient spotlight orb (orbital path) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        <div 
          className="absolute top-1/2 left-1/2 w-[200px] h-[200px] rounded-full blur-[80px] animate-orbit"
          style={{ 
            background: 'rgba(52, 211, 153, 0.15)',
            animationDuration: '25s',
            transformOrigin: '0 0',
          }}
        />
      </div>

      {/* Floating emoji particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
        {emojiParticles.map((p, i) => (
          <div
            key={i}
            className="intro-particle text-2xl"
            style={{
              left: p.left,
              bottom: '-40px',
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              fontSize: '20px',
              background: 'none',
              width: 'auto',
              height: 'auto',
              borderRadius: 0,
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 neon-glow">
             <PawPrint className="w-8 h-8 text-emerald-400" />
           </div>
           <span className="text-2xl font-black tracking-tight italic">REScue <span className="text-emerald-400">Paw</span></span>
        </div>
        
        <div className="space-y-6 max-w-lg mt-16">
           <h2 className="text-5xl font-black leading-tight tracking-tight">
             <span className="block text-emerald-400 animate-slide-in-left" style={{ animationDelay: '0.2s' }}>Saving Lives</span>
             <Typewriter 
               text="One Click at a Time." 
               speed={80} 
               delay={500}
               className="block"
             />
           </h2>
           <p className="text-lg text-emerald-100/70 font-medium leading-relaxed animate-slide-in-bottom" style={{ animationDelay: '1s' }}>
             Join a community of local heroes dedicated to providing immediate aid to street animals through AI technology and rapid coordination.
           </p>
        </div>
      </div>

      {/* Cycling testimonials */}
      <div className="relative z-10 mt-8">
        <div className="p-5 bg-white/[0.07] backdrop-blur-lg rounded-2xl border border-white/10 min-h-[120px]">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-1">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div key={currentTestimonial} className="animate-slide-in-bottom">
              <p className="text-sm text-white/80 italic leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-300">
                  {testimonials[currentTestimonial].author[0]}
                </div>
                <div>
                  <span className="text-xs font-bold text-white/90">{testimonials[currentTestimonial].author}</span>
                  <span className="text-xs text-white/40 ml-2">{testimonials[currentTestimonial].role}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Dot indicators */}
          <div className="flex gap-1.5 mt-3 justify-center">
            {testimonials.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === currentTestimonial ? '20px' : '6px',
                  background: i === currentTestimonial ? '#34d399' : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats ticker + Feature Pills */}
      <div className="relative z-10 mt-6 space-y-4">
        {/* Stats ticker */}
        <div className="flex justify-between gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="flex-1 text-center p-3 bg-white/[0.05] backdrop-blur-md rounded-xl border border-white/10">
              <stat.icon className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className="text-lg font-black text-white tabular-nums">{stat.value}</div>
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 gap-3">
           <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3 spotlight-card">
              <Activity className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">AI Triage</p>
                <p className="text-sm font-bold">Instant Analysis</p>
              </div>
           </div>
           <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-3 spotlight-card">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Verified</p>
                <p className="text-sm font-bold">Trusted Network</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSidePanel;
