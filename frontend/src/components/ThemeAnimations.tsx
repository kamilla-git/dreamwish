'use client';

import React, { useEffect, useState } from 'react';

interface ThemeAnimationsProps {
  animation?: 'snow' | 'hearts' | 'balloons' | 'sparkles' | 'presents' | string;
}

export default function ThemeAnimations({ animation }: ThemeAnimationsProps) {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (!animation || animation === 'none') {
      setParticles([]);
      return;
    }

    const count = animation === 'snow' ? 40 : 12;
    const icons: Record<string, string[]> = {
      snow: ['❄', '❅', '❆'],
      hearts: ['❤', '💖', '💕', '❣'],
      balloons: ['🎈', '✨'],
      presents: ['🎁', '⭐', '🎈'],
      sparkles: ['✨', '⭐', '🌟']
    };

    const currentIcons = icons[animation] || ['✨'];

    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Math.random(),
      left: `${Math.random() * 100}%`,
      top: animation === 'sparkles' ? `${Math.random() * 100}%` : undefined,
      delay: `${Math.random() * 10}s`,
      duration: `${5 + Math.random() * 10}s`,
      size: animation === 'snow' ? `${Math.random() * 10 + 10}px` : `${20 + Math.random() * 20}px`,
      opacity: 0.2 + Math.random() * 0.5,
      icon: currentIcons[Math.floor(Math.random() * currentIcons.length)]
    }));

    setParticles(newParticles);
  }, [animation]);

  if (!animation || animation === 'none') return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={
            animation === 'snow' ? 'snowflake' : 
            animation === 'hearts' ? 'heart-particle' : 
            animation === 'balloons' ? 'balloon-particle' :
            animation === 'presents' ? 'present-particle' :
            'sparkle-particle'
          }
          style={{
            left: p.left,
            top: p.top,
            animationDelay: p.delay,
            animationDuration: p.duration,
            fontSize: p.size,
            opacity: p.opacity,
          }}
        >
          {p.icon}
        </div>
      ))}
    </div>
  );
}
