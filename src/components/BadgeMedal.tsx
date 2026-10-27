import React from 'react';
import { Lock, Sparkles, CheckCircle2, Award, Calendar } from 'lucide-react';
import { BadgeLevel, BadgeDefinition } from '../types';

interface BadgeMedalProps {
  badge: BadgeDefinition;
  status: 'locked' | 'in-progress' | 'unlocked';
  progressPercent?: number;
  unlockedAt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

export const BadgeMedal: React.FC<BadgeMedalProps> = ({
  badge,
  status,
  progressPercent = 0,
  unlockedAt,
  size = 'md',
  onClick,
  className = '',
}) => {
  const isUnlocked = status === 'unlocked';
  const isLocked = status === 'locked';

  // Level-specific styles and ribbons
  const levelThemes: Record<BadgeLevel, {
    ribbonGradient: string;
    outerRing: string;
    innerPlate: string;
    borderGlow: string;
    starColor: string;
    labelText: string;
  }> = {
    bronce: {
      ribbonGradient: 'from-amber-700 via-amber-800 to-amber-950',
      outerRing: 'from-amber-600 via-amber-700 to-amber-900',
      innerPlate: 'from-amber-800 to-amber-950',
      borderGlow: 'border-amber-600',
      starColor: '#d97706',
      labelText: 'BRONCE · PRINCIPIANTE',
    },
    plata: {
      ribbonGradient: 'from-slate-400 via-slate-600 to-slate-800',
      outerRing: 'from-slate-300 via-slate-400 to-slate-700',
      innerPlate: 'from-slate-700 to-slate-900',
      borderGlow: 'border-slate-400',
      starColor: '#cbd5e1',
      labelText: 'PLATA · APRENDIZ',
    },
    oro: {
      ribbonGradient: 'from-amber-400 via-yellow-500 to-amber-700',
      outerRing: 'from-yellow-300 via-amber-400 to-yellow-600',
      innerPlate: 'from-amber-600 to-amber-900',
      borderGlow: 'border-yellow-400',
      starColor: '#facc15',
      labelText: 'ORO · EXPERTO',
    },
    platino: {
      ribbonGradient: 'from-cyan-400 via-sky-600 to-blue-900',
      outerRing: 'from-cyan-300 via-sky-400 to-blue-600',
      innerPlate: 'from-sky-700 to-blue-950',
      borderGlow: 'border-cyan-400',
      starColor: '#38bdf8',
      labelText: 'PLATINO · MAESTRO',
    },
    leyenda: {
      ribbonGradient: 'from-emerald-400 via-amber-400 to-purple-600',
      outerRing: 'from-emerald-400 via-teal-500 to-amber-400',
      innerPlate: 'from-emerald-800 via-teal-900 to-purple-950',
      borderGlow: 'border-emerald-400',
      starColor: '#34d399',
      labelText: 'LEYENDA · NIVEL MÁXIMO',
    },
  };

  const theme = levelThemes[badge.level];

  // Sizes for medal disk
  const sizeClasses = {
    sm: 'w-20 h-20 sm:w-24 sm:h-24',
    md: 'w-24 h-24 sm:w-32 sm:h-32',
    lg: 'w-32 h-32 sm:w-40 sm:h-40',
    xl: 'w-40 h-40 sm:w-48 sm:h-48',
  };

  return (
    <div 
      onClick={onClick}
      className={`relative flex flex-col items-center text-center select-none transition-all w-full max-w-full min-w-0 ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
    >
      {/* Decorative Ribbon Flag behind the medal */}
      <div className={`w-12 h-8 bg-gradient-to-b ${theme.ribbonGradient} rounded-t-lg shadow-sm flex items-center justify-around px-1.5 opacity-90 -mb-2 z-0`}>
        <div className="w-1.5 h-full bg-white/20" />
        <div className="w-1.5 h-full bg-amber-400/40" />
        <div className="w-1.5 h-full bg-white/20" />
      </div>

      {/* Main Medal Circular Body */}
      <div className={`relative ${sizeClasses[size]} rounded-full p-2 bg-gradient-to-br ${theme.outerRing} shadow-2xl z-10 flex items-center justify-center transition-all ${
        isLocked ? 'grayscale opacity-60' : 'filter-none'
      }`}>
        {/* Outer Laurel / Dotted Border Ring */}
        <div className="w-full h-full rounded-full border-2 border-dashed border-white/40 flex items-center justify-center p-1 relative">
          
          {/* Inner Plate */}
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${theme.innerPlate} flex flex-col items-center justify-center relative overflow-hidden shadow-inner text-white border border-white/20`}>
            
            {/* Radial Shine overlay */}
            <div className="absolute inset-0 bg-radial from-white/25 via-transparent to-black/30 pointer-events-none" />

            {/* Official BioExplora Leaf Emblem integrated in medal center */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-md mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-emerald-300 fill-emerald-400/40">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>

              {/* BioExplora Badge Wordmark */}
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-200">
                BioExplora
              </span>
              <span className="text-[8px] font-bold tracking-tight opacity-90 truncate max-w-[90px]">
                {badge.level.toUpperCase()}
              </span>
            </div>

            {/* Locked Padlock Overlay */}
            {isLocked && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white z-20">
                <div className="w-8 h-8 rounded-full bg-black/70 border border-white/30 flex items-center justify-center shadow-lg">
                  <Lock className="w-4 h-4 text-stone-300" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-stone-300">
                  Bloqueada
                </span>
              </div>
            )}

            {/* In Progress Overlay */}
            {status === 'in-progress' && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center text-white z-20 p-2">
                <span className="text-xs font-black text-amber-300">
                  {progressPercent}%
                </span>
                <div className="w-3/4 h-1.5 bg-black/40 rounded-full overflow-hidden mt-1 border border-white/20">
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
                <span className="text-[7.5px] font-bold text-stone-200 mt-1 uppercase">
                  En progreso
                </span>
              </div>
            )}

            {/* Unlocked Star Glow Indicator */}
            {isUnlocked && (
              <div className="absolute top-1 right-2 z-20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badge Name & Level Pill */}
      <div className="mt-2.5 space-y-1 w-full max-w-[155px] min-w-0">
        <div className="flex items-center justify-center gap-1 min-w-0">
          <span 
            className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full shadow-sm truncate max-w-full ${
              isUnlocked 
                ? 'bg-[#196b44] text-white' 
                : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
            }`}
          >
            {theme.labelText}
          </span>
        </div>

        <h4 className="text-xs font-black leading-snug line-clamp-1 text-stone-900 dark:text-stone-100">
          {badge.title}
        </h4>

        {/* Status text or date */}
        {isUnlocked && unlockedAt ? (
          <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>{new Date(unlockedAt).toLocaleDateString('es-CO')}</span>
          </div>
        ) : (
          <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-tight">
            Min. {badge.minScorePercent}% aciertos ({badge.totalQuestions} preguntas)
          </p>
        )}
      </div>
    </div>
  );
};
