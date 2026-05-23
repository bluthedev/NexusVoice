import React from 'react';

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'purple';
}

export const GlowingCard: React.FC<GlowingCardProps> = ({ 
  children, 
  className = '',
  glowColor = 'cyan'
}) => {
  const glowClasses = glowColor === 'cyan' 
    ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]'
    : 'border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]';

  return (
    <div className={`
      bg-nexus-card/80 backdrop-blur-xl 
      border rounded-2xl p-6 
      transition-all duration-500 ease-out
      ${glowClasses}
      ${className}
    `}>
      {children}
    </div>
  );
};