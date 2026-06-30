
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronDown, ArrowRight, Zap, Shield, Heart, Activity, Sparkles, Users, Phone } from 'lucide-react';
import ScrollyTyping from '../components/ScrollyTyping';

interface IntroStoryScreenProps {
  onComplete: (path: string) => void;
}

// Animated counter component
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number; isActive: boolean }> = ({ end, suffix = '', duration = 2000, isActive }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isActive || hasAnimated.current) return;
    hasAnimated.current = true;
    
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    const stepDuration = duration / steps;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [isActive, end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Floating particle component
const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="intro-particle"
          style={{
            left: p.left,
            bottom: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `rgba(16, 185, 129, ${p.opacity})`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px rgba(16, 185, 129, ${p.opacity * 0.5})`,
          }}
        />
      ))}
    </div>
  );
};

const IntroStoryScreen: React.FC<IntroStoryScreenProps> = ({ onComplete }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set([0]));
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const progress = scrollTop / (scrollHeight - clientHeight);
    setScrollProgress(Math.min(progress, 1));

    const section = Math.min(Math.floor(progress * 5.5), 4);
    setActiveSection(section);

    // Track which sections have become visible
    sectionRefs.current.forEach((ref, index) => {
      if (!ref || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const rect = ref.getBoundingClientRect();
      const relativeTop = rect.top - containerRect.top;
      if (relativeTop < containerRect.height * 0.75) {
        setVisibleSections(prev => new Set([...prev, index]));
      }
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // initial
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const backgrounds = [
    "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1599406839352-73650f952c4b?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=2000&auto=format&fit=crop"
  ];

  const sectionColors = [
    'from-black/90 via-black/70',
    'from-black/90 via-rose-950/30',
    'from-black/90 via-cyan-950/30',
    'from-black/90 via-amber-950/30',
    'from-black/90 via-emerald-950/30',
  ];

  return (
    <div className="relative w-full h-screen bg-black text-white selection:bg-emerald-500 selection:text-white overflow-hidden">
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Dynamic Backgrounds with parallax */}
      {backgrounds.map((bg, index) => (
        <div 
          key={index}
          className={`fixed inset-0 z-0 transition-opacity duration-1000 ease-in-out ${activeSection === index ? 'opacity-50' : 'opacity-0'}`}
        >
          <img
            src={bg}
            alt=""
            className="w-full h-full object-cover"
            style={{ transform: `scale(${1.1 + scrollProgress * 0.15}) translateY(${scrollProgress * -30}px)` }}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${sectionColors[index]} to-transparent`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
        </div>
      ))}

      {/* Dot grid overlay */}
      <div className="fixed inset-0 z-[1] particles-bg pointer-events-none" />

      {/* Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            {['Welcome', 'Reality', 'Technology', 'Community', 'Join Us'][activeSection]}
          </span>
          <div className="flex-1 progress-track h-1">
            <div className="progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
          </div>
          <span className="text-[10px] font-mono text-white/40">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={() => onComplete('/login')}
        className="fixed top-4 right-6 z-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors glass-dark rounded-full"
      >
        Skip →
      </button>

      {/* Side progress dots */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-3 hidden md:flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i} 
            onClick={() => {
              sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`rounded-full transition-all duration-500 ${
              activeSection === i 
                ? 'w-2 h-8 bg-emerald-500 shadow-lg shadow-emerald-500/30' 
                : activeSection > i 
                  ? 'w-2 h-2 bg-emerald-500/50' 
                  : 'w-2 h-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Scrollable Container */}
      <div 
        ref={containerRef}
        className="relative z-10 w-full h-full overflow-y-auto snap-y snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        
        {/* ═══ Section 1: Introduction ═══ */}
        <section 
          ref={el => { sectionRefs.current[0] = el; }}
          className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start relative"
        >
          <div className={`max-w-4xl space-y-8 section-content ${visibleSections.has(0) ? 'visible' : ''}`}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-full text-emerald-300 font-bold text-sm tracking-widest uppercase animate-float">
              <Sparkles className="w-4 h-4" />
              Welcome to REScue Paw
            </div>
            
            <ScrollyTyping
              text="Every street animal has a story."
              className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9]"
              highlightColor="text-white"
              baseColor="text-white/10"
              as="h1"
              threshold={0.6}
              scrollContainerRef={containerRef}
            />

            <p className="text-lg md:text-2xl text-gray-300/80 max-w-lg font-medium leading-relaxed">
              In the hustle of the city, their whispers often go unheard. 
              <span className="text-emerald-400 font-bold"> We built a voice for them.</span>
            </p>

            {/* Quick stat pills */}
            <div className="flex flex-wrap gap-3 pt-4">
              {[
                { value: '62M+', label: 'Strays in India' },
                { value: '1 in 3', label: 'Need medical aid' },
                { value: '<2min', label: 'Our response time' },
              ].map((stat, i) => (
                <div key={i} className="glass px-4 py-3 rounded-2xl flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${0.4 + i * 0.15}s`, opacity: 0 }}>
                  <span className="text-lg font-black text-emerald-400">{stat.value}</span>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40">Scroll to begin</span>
            <ChevronDown className="w-5 h-5 text-white/30" />
          </div>
        </section>

        {/* ═══ Section 2: The Struggle ═══ */}
        <section 
          ref={el => { sectionRefs.current[1] = el; }}
          className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start"
        >
          <div className={`max-w-3xl section-content ${visibleSections.has(1) ? 'visible' : ''}`}>
            <div className="pl-6 border-l-2 border-rose-500/40">
              <div className="mb-8 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400/80">The Reality</span>
              </div>
              
              <ScrollyTyping
                text="Injury. Hunger. Silence. Millions face these shadows alone."
                className="text-4xl md:text-7xl lg:text-8xl font-bold leading-tight"
                highlightColor="text-rose-400"
                baseColor="text-white/8"
                threshold={0.7}
                scrollContainerRef={containerRef}
              />
              
              <p className="mt-10 text-lg text-gray-400 leading-relaxed max-w-xl">
                Without a voice, their pain is invisible. Traditional reporting is slow, manual, and often too late.
              </p>

              {/* Impact counters */}
              <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { end: 62, suffix: 'M+', label: 'Strays nationwide', color: 'text-rose-400' },
                  { end: 85, suffix: '%', label: 'Go untreated', color: 'text-rose-400' },
                  { end: 12, suffix: 'hrs', label: 'Average rescue time', color: 'text-rose-400' },
                ].map((item, i) => (
                  <div key={i} className="glass-dark rounded-2xl p-5">
                    <div className={`text-3xl md:text-4xl font-black ${item.color}`}>
                      <AnimatedCounter end={item.end} suffix={item.suffix} isActive={visibleSections.has(1)} />
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Section 3: AI Technology ═══ */}
        <section 
          ref={el => { sectionRefs.current[2] = el; }}
          className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start"
        >
          <div className={`max-w-4xl section-content ${visibleSections.has(2) ? 'visible' : ''}`}>
            <div className="mb-8 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 animate-glow-pulse" style={{ animationDuration: '3s' }}>
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/80">AI Powered Response</span>
            </div>
            
            <ScrollyTyping
              text="Instant medical triage in your pocket."
              className="text-4xl md:text-7xl lg:text-8xl font-bold leading-tight"
              highlightColor="text-cyan-400"
              baseColor="text-white/8"
              threshold={0.7}
              scrollContainerRef={containerRef}
            />

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  title: 'Visual Recognition',
                  desc: 'Our AI identifies injuries and species instantly from a single photo.',
                  icon: '🔍',
                  gradient: 'from-cyan-500/10 to-blue-500/10',
                },
                {
                  title: 'Smart Triage',
                  desc: 'Prioritizes critical cases so the most urgent get help first.',
                  icon: '⚡',
                  gradient: 'from-cyan-500/10 to-emerald-500/10',
                },
                {
                  title: 'Auto Dispatch',
                  desc: 'Nearest volunteers and NGOs are alerted within seconds.',
                  icon: '📡',
                  gradient: 'from-blue-500/10 to-violet-500/10',
                },
                {
                  title: 'Recovery Tracking',
                  desc: 'Follow the animal\'s journey from rescue to forever home.',
                  icon: '💚',
                  gradient: 'from-emerald-500/10 to-cyan-500/10',
                },
              ].map((card, i) => (
                <div 
                  key={i} 
                  className={`group p-6 rounded-3xl bg-gradient-to-br ${card.gradient} border border-white/10 backdrop-blur-sm 
                    hover:border-cyan-500/30 transition-all duration-500 hover:scale-[1.02] cursor-default`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="text-3xl mb-4">{card.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{card.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 4: Community ═══ */}
        <section 
          ref={el => { sectionRefs.current[3] = el; }}
          className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start"
        >
          <div className={`max-w-4xl section-content ${visibleSections.has(3) ? 'visible' : ''}`}>
            <div className="mb-8 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400/80">Connected Network</span>
            </div>
            
            <ScrollyTyping
              text="Uniting citizens, volunteers, and vets."
              className="text-4xl md:text-7xl lg:text-8xl font-bold leading-tight"
              highlightColor="text-amber-400"
              baseColor="text-white/8"
              threshold={0.7}
              scrollContainerRef={containerRef}
            />
            
            <p className="mt-10 text-lg text-gray-400 leading-relaxed max-w-xl">
              One report triggers a synchronized response. From food banks to medical evacuations, we coordinate it all.
            </p>

            {/* Network visualization */}
            <div className="mt-10 flex flex-wrap gap-4">
              {[
                { icon: Users, label: 'Citizens Report', count: '10K+' },
                { icon: Heart, label: 'Volunteers Respond', count: '450+' },
                { icon: Shield, label: 'NGOs Coordinate', count: '50+' },
                { icon: Phone, label: 'Vets Treat', count: '120+' },
              ].map((node, i) => (
                <div key={i} className="flex-1 min-w-[140px] glass rounded-2xl p-5 text-center group hover:bg-amber-500/10 transition-all duration-500">
                  <node.icon className="w-6 h-6 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-xl font-black text-white">
                    <AnimatedCounter end={parseInt(node.count)} suffix={node.count.replace(/\d/g, '')} isActive={visibleSections.has(3)} />
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">{node.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Section 5: CTA ═══ */}
        <section 
          ref={el => { sectionRefs.current[4] = el; }}
          className="min-h-screen w-full flex flex-col justify-center items-start px-8 md:px-24 snap-start pb-20"
        >
          <div className={`max-w-3xl mb-12 section-content ${visibleSections.has(4) ? 'visible' : ''}`}>
            <div className="mb-8 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 animate-glow-pulse">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/80">Your Role</span>
            </div>
            
            <ScrollyTyping
              text="Be the hero they've been waiting for."
              className="text-4xl md:text-7xl lg:text-8xl font-bold leading-tight"
              highlightColor="text-emerald-400"
              baseColor="text-white/8"
              threshold={0.7}
              scrollContainerRef={containerRef}
            />

            <p className="mt-8 text-lg text-gray-400 leading-relaxed max-w-xl">
              It takes just one person, one photo, one moment. Your action can save a life today.
            </p>
          </div>
          
          <div className={`flex flex-col sm:flex-row gap-4 w-full sm:w-auto section-content ${visibleSections.has(4) ? 'visible' : ''}`} style={{ transitionDelay: '0.2s' }}>
            <button
              onClick={() => onComplete('/register')}
              className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 bg-emerald-600 text-white rounded-2xl font-bold text-lg tracking-wide 
                transition-all hover:bg-emerald-500 hover:scale-[1.03] active:scale-[0.98]
                shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)] hover:shadow-[0_0_80px_-15px_rgba(16,185,129,0.7)]
                w-full sm:w-auto animate-glow-pulse"
              style={{ animationDuration: '4s' }}
            >
              <span className="relative z-10">Join the Mission</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
            </button>

            <button
              onClick={() => onComplete('/login')}
              className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 glass text-white rounded-2xl font-bold text-lg tracking-wide 
                transition-all hover:bg-white/15 hover:scale-[1.03] active:scale-[0.98]
                w-full sm:w-auto"
            >
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
            <p className="font-medium flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-gray-400"><AnimatedCounter end={450} suffix="+" isActive={visibleSections.has(4)} /> Rescuers Online</span>
            </p>
            <span className="text-gray-700">•</span>
            <p className="text-gray-400 font-medium">Free to join</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default IntroStoryScreen;
