'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedGaugeProps {
  score: number; // 0 to 100
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AnimatedGauge({ score, label, size = 'md' }: AnimatedGaugeProps) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    // Animate number counter
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      
      setCurrentScore(Math.round(score * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const sizeClasses = {
    sm: 'w-32 h-32 text-xl',
    md: 'w-48 h-48 text-3xl',
    lg: 'w-64 h-64 text-5xl',
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  // Color determination
  let color = '#ef4444'; // Red (Poor)
  if (score >= 50) color = '#eab308'; // Yellow (Fair)
  if (score >= 70) color = '#3b82f6'; // Blue (Good)
  if (score >= 90) color = '#06b6d4'; // Cyan (Excellent - Electric Teal)

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Background Circle */}
        <svg 
          className="absolute w-full h-full transform -rotate-90" 
          viewBox="-10 -10 120 120"
          style={{ overflow: 'visible' }}
        >
          <circle
            className="text-slate-800"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          {/* Animated Progress Circle */}
          <motion.circle
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              filter: `drop-shadow(0 0 8px ${color})` // Neon Glow
            }}
          />
        </svg>
        
        {/* Counter Text */}
        <div className="z-10 font-bold text-white text-glow">
            {currentScore}%
        </div>
      </div>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 font-medium text-slate-400 tracking-wide uppercase text-sm"
      >
        {label}
      </motion.span>
    </div>
  );
}
