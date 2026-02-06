
import React from 'react';

export const BackgroundDecor: React.FC = () => {
  const elements = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 5 + Math.random() * 40,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 15,
    opacity: 0.05 + Math.random() * 0.2,
    type: i % 3 === 0 ? 'heart' : i % 3 === 1 ? 'sparkle' : 'bubble'
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute"
          style={{
            left: `${el.left}%`,
            top: `${el.top}%`,
            width: el.size,
            height: el.size,
            opacity: el.opacity,
            animation: `float ${el.duration}s ease-in-out infinite`,
            animationDelay: `${el.delay}s`,
          }}
        >
          {el.type === 'heart' ? (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-[#9575CD]">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : el.type === 'sparkle' ? (
            <svg viewBox="0 0 24 24" className="w-full h-full fill-[#B39DDB]">
              <path d="M12,2L14.5,9.5L22,12L14.5,14.5L12,22L9.5,14.5L2,12L9.5,9.5L12,2Z" />
            </svg>
          ) : (
            <div className="w-full h-full rounded-full border-2 border-[#D1C4E9] shadow-inner bg-white/10" />
          )}
        </div>
      ))}
    </div>
  );
};
