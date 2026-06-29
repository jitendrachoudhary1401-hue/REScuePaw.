import React, { useEffect, useRef, useState } from 'react';

interface ScrollyTypingProps {
  text: string;
  className?: string;
  highlightColor?: string;
  baseColor?: string;
  as?: React.ElementType;
  threshold?: number; // 0 to 1, where to start the effect in viewport
}

const ScrollyTyping: React.FC<ScrollyTypingProps> = ({ 
  text, 
  className = '', 
  highlightColor = 'text-gray-900', 
  baseColor = 'text-gray-300',
  as: Component = 'p',
  threshold = 0.8 // Start when element is at 80% of viewport height
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Define the scroll range for the effect
      // Starts when element enters threshold
      const start = windowHeight * threshold;
      // Ends when element is further up (e.g., 30% of viewport)
      const end = windowHeight * 0.3;
      
      // Calculate progress 0 to 1
      let current = (start - rect.top) / (start - end);
      current = Math.min(Math.max(current, 0), 1);
      
      setProgress(current);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    // Initial calculation
    setTimeout(handleScroll, 100);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [threshold]);

  const chars = text.split('');
  const totalChars = chars.length;
  const visibleChars = Math.floor(progress * totalChars);

  return (
    <Component ref={containerRef} className={`${className} transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 drop-shadow-sm hover:drop-shadow-xl cursor-pointer`}>
      {chars.map((char, i) => (
        <span 
          key={i} 
          className={`transition-all duration-150 inline-block ${i < visibleChars ? highlightColor : baseColor}`}
          style={{
            textShadow: i < visibleChars ? '0px 4px 8px rgba(0,0,0,0.15)' : 'none',
            transform: i < visibleChars ? 'translateY(-1px)' : 'none',
            whiteSpace: char === ' ' ? 'pre' : 'normal'
          }}
          aria-hidden="true"
        >
          {char}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </Component>
  );
};

export default ScrollyTyping;