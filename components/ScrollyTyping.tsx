import React, { useEffect, useRef, useState, RefObject } from 'react';

interface ScrollyTypingProps {
  text: string;
  className?: string;
  highlightColor?: string;
  baseColor?: string;
  as?: React.ElementType;
  threshold?: number;
  scrollContainerRef?: RefObject<HTMLElement | null>;
}

const ScrollyTyping: React.FC<ScrollyTypingProps> = ({ 
  text, 
  className = '', 
  highlightColor = 'text-gray-900', 
  baseColor = 'text-gray-300',
  as: Component = 'p',
  threshold = 0.8,
  scrollContainerRef,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      
      // If we have a scrollContainerRef, calculate relative to that container
      let viewportHeight: number;
      let elementTop: number;
      
      if (scrollContainerRef?.current) {
        const containerRect = scrollContainerRef.current.getBoundingClientRect();
        viewportHeight = containerRect.height;
        elementTop = rect.top - containerRect.top;
      } else {
        viewportHeight = window.innerHeight;
        elementTop = rect.top;
      }
      
      const start = viewportHeight * threshold;
      const end = viewportHeight * 0.25;
      
      let current = (start - elementTop) / (start - end);
      current = Math.min(Math.max(current, 0), 1);
      
      setProgress(current);
    };

    // Listen to the scroll container if provided, otherwise window
    const scrollTarget = scrollContainerRef?.current || window;
    
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    // Initial calculation
    requestAnimationFrame(handleScroll);
    
    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [threshold, scrollContainerRef]);

  // Split into words instead of characters for smoother feel
  const words = text.split(' ');
  const totalWords = words.length;
  const visibleWords = Math.floor(progress * totalWords * 1.3); // slight overshoot for snappy feel

  return (
    <Component ref={containerRef} className={className}>
      {words.map((word, i) => {
        const isVisible = i < visibleWords;
        return (
          <span key={i} className="inline-block">
            <span 
              className={`inline-block transition-all duration-500 ${
                isVisible 
                  ? `${highlightColor} word-revealed` 
                  : `${baseColor} word-hidden`
              }`}
              style={{
                transitionDelay: isVisible ? `${Math.min(i * 30, 200)}ms` : '0ms',
              }}
              aria-hidden="true"
            >
              {word}
            </span>
            {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        );
      })}
      <span className="sr-only">{text}</span>
    </Component>
  );
};

export default ScrollyTyping;