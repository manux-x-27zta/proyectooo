import React from 'react';
import { Palette, Sparkles } from 'lucide-react';
import { PaletteId, PALETTE_THEMES } from '../data/paletteThemes';

interface FloatingPaletteButtonProps {
  currentPalette: PaletteId;
  onClick: () => void;
  isDarkMode: boolean;
}

export const FloatingPaletteButton: React.FC<FloatingPaletteButtonProps> = ({
  currentPalette,
  onClick,
  isDarkMode,
}) => {
  const activeTheme = PALETTE_THEMES.find(p => p.id === currentPalette) || PALETTE_THEMES[0];

  return (
    <aside aria-label="Personalización visual">
      <button
        onClick={onClick}
        aria-label={`Cambiar paleta de colores. Paleta actual: ${activeTheme.name}`}
        className={`fixed bottom-4 left-3.5 sm:bottom-5 sm:left-5 z-30 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border shadow-xl flex items-center gap-2 sm:gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer backdrop-blur-md ${
          isDarkMode
            ? 'bg-[#0f1f18]/90 border-[#234b37] text-white hover:bg-[#152e23]'
            : 'bg-white/95 border-stone-200 text-stone-800 hover:bg-stone-50 shadow-emerald-950/10'
        }`}
        style={{
          boxShadow: `0 8px 24px -4px ${activeTheme.style.primaryHex}40`,
        }}
      >
        {/* Animated Icon Container */}
        <div 
          className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:rotate-12"
          style={{ backgroundColor: activeTheme.style.primaryHex }}
        >
          <Palette className="w-4 h-4" />
        </div>

        {/* Text and Mini Swatch Preview */}
        <div className="text-left hidden sm:block">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-400">
              Paleta
            </span>
            <div className="flex items-center -space-x-1">
              <span 
                className="w-2 h-2 rounded-full border border-white dark:border-stone-900" 
                style={{ backgroundColor: activeTheme.swatches.primary }} 
              />
              <span 
                className="w-2 h-2 rounded-full border border-white dark:border-stone-900" 
                style={{ backgroundColor: activeTheme.swatches.accent }} 
              />
              <span 
                className="w-2 h-2 rounded-full border border-white dark:border-stone-900" 
                style={{ backgroundColor: activeTheme.swatches.glow }} 
              />
            </div>
          </div>
          <span className="text-xs font-black block mt-0.5 truncate max-w-[120px]">
            {activeTheme.name}
          </span>
        </div>

        <span className="text-xs font-black sm:hidden">
          Color
        </span>
      </button>
    </aside>
  );
};
