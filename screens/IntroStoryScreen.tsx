
import React, { useEffect, useState, useRef } from 'react';
import { ChevronDown, ArrowRight, Zap, Shield, Heart, Activity } from 'lucide-react';
import ScrollyTyping from '../components/ScrollyTyping';

interface IntroStoryScreenProps {
  onComplete: (path: string) => void;
}

const IntroStoryScreen: React.FC<IntroStoryScreenProps> = ({ onComplete }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(progress);

      // Determine active section based on scroll position
      // We have 5 sections, so roughly 0.2 per section
      const section = Math.min(Math.floor(progress * 5.5), 4);
      setActiveSection(section);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const backgrounds = [
    "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=2000&auto=format&fit=crop", // Pets playing
    "https://images.unsplash.com/photo-1599406839352-73650f952c4b?q=80&w=2000&auto=format&fit=crop", // Sad/Street dog context
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop", // Tech/Mobile
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2000&auto=format&fit=crop", // Community/People
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2000&auto=format&fit=crop"  // Happy dog/Success
  ];

  return (
    <div className="relative w-full h-screen bg-black text-white selection:bg-emerald-500 selection:text-white overflow-hidden">
      
      {/* Dynamic Backgrounds */}
      {backgrounds.map((bg, index) => (
        <div 
          key={index}
          className={`fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out ${activeSection === index ? 'opacity-60' : 'opacity-0'}`}
        >
          <img
            src={bg}
            alt={`Background ${index}`}
            className="w-full h-full object-cover scale-105"
            style={{ transform: `scale(${1 + scrollProgress * 0.1})` }} // Subtle zoom effect
          />
           <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
           <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
        </div>
      ))}

      {/* Progress Bar */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`w-1.5 rounded-full transition-all duration-300 ${activeSection === i ? 'h-8 bg-emerald-500' : 'h-1.5 bg-white/20'}`} 
          />
        ))}
      </div>

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className="relative z-10 w-full h-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
      >
        
        {/* Section 1: Introduction */}
        <section className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start relative">
          <div className="max-w-4xl space-y-8">
            <div className="inline-block px-4 py-2 bg-emerald-500/20 backdrop-blur-md rounded-full border border-emerald-500/30 text-emerald-300 font-bold text-sm tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-left-8 duration-1000">
              Welcome to REScue Paw
            </div>
            <ScrollyTyping
              text="Every street animal has a story..."
              className="text-6xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 tracking-tighter leading-[0.9]"
              highlightColor="text-white"
              baseColor="text-white/10"
              as="h1"
              threshold={0.6}
            />
             <p className="text-xl md:text-2xl text-gray-300 max-w-lg font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 delay-300 duration-1000">
               In the hustle of the city, their whispers often go unheard. We built a voice for them.
             </p>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/50 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Begin Journey</span>
            <ChevronDown className="w-6 h-6" />
          </div>
        </section>

        {/* Section 2: The Struggle */}
        <section className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start">
          <div className="max-w-3xl pl-6 border-l-4 border-rose-500/50">
             <div className="mb-6 flex items-center gap-3 text-rose-400">
                <Activity className="w-8 h-8" />
                <span className="text-sm font-bold uppercase tracking-widest">The Reality</span>
             </div>
             <ScrollyTyping
              text="Injury. Hunger. Silence. Millions face these shadows alone."
              className="text-5xl md:text-8xl font-bold text-gray-200 leading-tight"
              highlightColor="text-rose-500"
              baseColor="text-white/10"
              threshold={0.7}
            />
            <p className="mt-8 text-xl text-gray-400 leading-relaxed max-w-xl">
              Without a voice, their pain is invisible. Traditional reporting is slow, manual, and often too late.
            </p>
          </div>
        </section>

        {/* Section 3: AI Technology */}
        <section className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start">
           <div className="max-w-4xl">
             <div className="mb-6 flex items-center gap-3 text-cyan-400">
                <Zap className="w-8 h-8" />
                <span className="text-sm font-bold uppercase tracking-widest">AI Powered Response</span>
             </div>
             <ScrollyTyping
              text="Instant medical triage in your pocket."
              className="text-5xl md:text-8xl font-bold text-gray-200 leading-tight"
              highlightColor="text-cyan-400"
              baseColor="text-white/10"
              threshold={0.7}
            />
             <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                   <h3 className="text-xl font-bold text-white mb-2">Visual Recognition</h3>
                   <p className="text-sm text-gray-400">Our AI identifies injuries and species instantly from a single photo.</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                   <h3 className="text-xl font-bold text-white mb-2">Smart Triage</h3>
                   <p className="text-sm text-gray-400">Prioritizes critical cases so the most urgent get help first.</p>
                </div>
             </div>
           </div>
        </section>

        {/* Section 4: Community */}
        <section className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start">
           <div className="max-w-4xl">
             <div className="mb-6 flex items-center gap-3 text-amber-400">
                <Shield className="w-8 h-8" />
                <span className="text-sm font-bold uppercase tracking-widest">Connected Network</span>
             </div>
             <ScrollyTyping
              text="Uniting citizens, volunteers, and vets."
              className="text-5xl md:text-8xl font-bold text-gray-200 leading-tight"
              highlightColor="text-amber-400"
              baseColor="text-white/10"
              threshold={0.7}
            />
            <p className="mt-8 text-xl text-gray-400 leading-relaxed max-w-xl">
              One report triggers a synchronized response. From food banks to medical evacuations, we coordinate it all.
            </p>
           </div>
        </section>

        {/* Section 5: CTA */}
        <section className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start pb-20">
           <div className="max-w-3xl mb-16">
             <div className="mb-6 flex items-center gap-3 text-emerald-400">
                <Heart className="w-8 h-8" />
                <span className="text-sm font-bold uppercase tracking-widest">Your Role</span>
             </div>
             <ScrollyTyping
              text="Be the hero they've been waiting for."
              className="text-5xl md:text-8xl font-bold text-gray-200 leading-tight"
              highlightColor="text-emerald-400"
              baseColor="text-white/10"
              threshold={0.7}
            />
           </div>
          
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={() => onComplete('/register')}
              className="group relative inline-flex items-center justify-center gap-4 px-8 py-5 bg-emerald-600 text-white rounded-full font-bold text-lg tracking-wider transition-all hover:bg-emerald-500 hover:scale-105 shadow-[0_0_60px_-15px_rgba(16,185,129,0.6)] active:scale-95 ring-4 ring-emerald-500/20 w-full sm:w-auto"
            >
              Join Mission
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>

            <button
              onClick={() => onComplete('/login')}
              className="group relative inline-flex items-center justify-center gap-4 px-8 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg tracking-wider transition-all hover:bg-white/20 hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              Let's Go
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
            <p className="mt-8 text-sm text-gray-400 font-medium flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              450+ Active Rescuers Online
            </p>
        </section>

      </div>
    </div>
  );
};

export default IntroStoryScreen;
