import React from 'react';

interface BioExploraLogoProps {
  variant?: 'icon' | 'horizontal' | 'crest' | 'diploma';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isDarkMode?: boolean;
}

export const BioExploraLogo: React.FC<BioExploraLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  isDarkMode = false,
}) => {
  // Dimension helpers
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  if (variant === 'icon') {
    return (
      <div 
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-center shadow-md relative overflow-hidden shrink-0 ${className}`}
        title="Logo Oficial BioExplora Colombia"
      >
        <div className="absolute inset-0 bg-white/10 opacity-30 pointer-events-none" />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3/5 h-3/5 text-emerald-200 fill-emerald-300/40">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>
    );
  }

  if (variant === 'crest' || variant === 'diploma') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Emblem Crest Shield with Colombian Tricolor Ring & Leaf */}
        <div className="relative mb-2">
          {/* Subtle Outer Laurel/Gold Ring */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-emerald-700 to-teal-900 p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-[22px] bg-[#0c1f17] flex items-center justify-center relative overflow-hidden border border-amber-400/40">
              {/* Colombian subtle tricolor band inside emblem */}
              <div className="absolute top-0 inset-x-0 h-1.5 flex">
                <div className="w-1/2 bg-amber-400" />
                <div className="w-1/4 bg-blue-600" />
                <div className="w-1/4 bg-rose-600" />
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-emerald-400 fill-emerald-500/30">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 justify-center">
          <span className="font-black text-xl tracking-tight text-[#163e2a] dark:text-white">
            BioExplora
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-sm">
            Colombia
          </span>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
          Plataforma Educativa de Biodiversidad y Especies Endémicas
        </p>
      </div>
    );
  }

  // Full Horizontal (Default)
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div 
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white flex items-center justify-center shadow-md relative overflow-hidden shrink-0`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-3/5 h-3/5 text-emerald-200 fill-emerald-300/40">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className={`font-black ${textSizes[size]} tracking-tight leading-none`}>
            BioExplora
          </span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
            isDarkMode ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}>
            Colombia
          </span>
        </div>
        <p className={`text-[10px] sm:text-[11px] font-medium leading-none mt-1 ${
          isDarkMode ? 'text-stone-400' : 'text-stone-500'
        }`}>
          Especies endémicas de nuestra tierra
        </p>
      </div>
    </div>
  );
};
