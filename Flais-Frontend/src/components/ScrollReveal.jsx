import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({ children, className = '', variant = 'fade-up', delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const variantClasses = {
    'fade-up': 'opacity-0 translate-y-8',
    'fade-left': 'opacity-0 -translate-x-12',
    'fade-right': 'opacity-0 translate-x-12',
    'fade-in': 'opacity-0',
  };

  const activeClasses = isVisible
    ? 'opacity-100 translate-y-0 translate-x-0'
    : variantClasses[variant] || variantClasses['fade-up'];

  const delayStyle = delay ? { transitionDelay: `${delay}ms` } : {};

  return (
    <div
      ref={ref}
      className={`transition-[transform,opacity] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu ${activeClasses} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
