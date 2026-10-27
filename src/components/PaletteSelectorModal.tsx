import React, { useEffect } from 'react';
import { 
  Palette, 
  X, 
  Check, 
  Sun, 
  Moon, 
  Sparkles, 
  RotateCcw,
  Compass,
  Layers,
  Leaf
} from 'lucide-react';
import { PALETTE_THEMES, PaletteId, PaletteTheme } from '../data/paletteThemes';

interface PaletteSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPalette: PaletteId;
  onSelectPalette: (paletteId: PaletteId) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const PaletteSelectorModal: React.FC<PaletteSelectorModalProps> = ({
  isOpen,
  onClose,
  currentPalette,
  onSelectPalette,
  isDarkMode,
  onToggleDarkMode,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeTheme = PALETTE_THEMES.find(p => p.id === currentPalette) || PALETTE_THEMES[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden transition-all duration-300 ${
          isDarkMode 
            ? 'bg-[#0f1d16] border-[#224434] text-stone-100' 
            : 'bg-white border-[#d8eae0] text-stone-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className={`p-5 sm:p-6 border-b flex items-center justify-between gap-4 ${
          isDarkMode ? 'border-[#1f3b2e] bg-[#0c1812]' : 'border-stone-200 bg-[#f8faf9]'
        }`}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md text-white transition-colors"
              style={{ backgroundColor: activeTheme.style.primaryHex }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  Paleta de Colores
                </h3>
                <span 
                  className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isDarkMode ? activeTheme.style.badgeBgDark : activeTheme.style.badgeBgLight,
                    color: isDarkMode ? activeTheme.style.badgeTextDark : activeTheme.style.badgeTextLight
                  }}
                >
                  {activeTheme.name}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                Elige la combinación visual inspirada en nuestros ecosistemas colombianos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Dark Mode Switcher inside modal */}
            <button
              onClick={onToggleDarkMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#152a20] border-[#294e3c] text-emerald-300 hover:bg-[#1b3629]' 
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 shadow-sm'
              }`}
              title="Alternar modo claro / oscuro"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Modo Noche</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Modo Día</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-stone-800 text-stone-400 hover:text-white' : 'hover:bg-stone-100 text-stone-500 hover:text-stone-800'
              }`}
              aria-label="Cerrar selector de colores"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Information Notice */}
          <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 transition-colors ${
            isDarkMode 
              ? 'bg-[#12241b] border-[#224434] text-stone-300' 
              : 'bg-[#f0f8f4] border-[#d0e8db] text-stone-700'
          }`}>
            <Sparkles className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <span className="font-extrabold block text-sm">
                Personalización en tiempo real
              </span>
              <p className="text-xs leading-relaxed opacity-90">
                Al seleccionar cualquier paleta, los botones, bordes, tarjetas, mapas y acentos visuales de toda la página se adaptarán al instante. Las combinaciones están calibradas tanto para fondo claro como para fondo oscuro.
              </p>
            </div>
          </div>

          {/* Grid of 6 Theme Palettes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PALETTE_THEMES.map((theme) => {
              const isSelected = theme.id === currentPalette;
              return (
                <div
                  key={theme.id}
                  onClick={() => onSelectPalette(theme.id)}
                  className={`group relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                    isSelected
                      ? 'shadow-xl scale-[1.02]'
                      : isDarkMode
                      ? 'bg-[#12241b]/60 border-[#1f3a2c] hover:border-[#345e47] hover:bg-[#12241b]'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-md'
                  }`}
                  style={{
                    borderColor: isSelected ? theme.style.primaryHex : undefined,
                    boxShadow: isSelected ? `0 10px 25px -5px ${theme.style.primaryHex}35` : undefined,
                  }}
                >
                  <div className="space-y-3">
                    {/* Top Row: Tag & Selection Indicator */}
                    <div className="flex items-center justify-between">
                      <span 
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isDarkMode ? `${theme.style.primaryHex}30` : `${theme.style.primaryHex}15`,
                          color: isDarkMode ? theme.swatches.glow : theme.style.primaryHex,
                        }}
                      >
                        {theme.tag}
                      </span>

                      {isSelected ? (
                        <div 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs shadow-sm"
                          style={{ backgroundColor: theme.style.primaryHex }}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          isDarkMode ? 'border-stone-600' : 'border-stone-300'
                        }`} />
                      )}
                    </div>

                    {/* Color Swatch Circles */}
                    <div className="flex items-center gap-2 pt-1">
                      <div 
                        className="w-7 h-7 rounded-full shadow-inner ring-2 ring-white/20 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: theme.swatches.primary }}
                        title={`Color Principal: ${theme.swatches.primary}`}
                      />
                      <div 
                        className="w-7 h-7 rounded-full shadow-inner ring-2 ring-white/20 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: theme.swatches.accent }}
                        title={`Acento: ${theme.swatches.accent}`}
                      />
                      <div 
                        className="w-7 h-7 rounded-full shadow-inner ring-2 ring-white/20 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: theme.swatches.glow }}
                        title={`Brillo / Detalle: ${theme.swatches.glow}`}
                      />
                      <div 
                        className="w-7 h-7 rounded-full shadow-inner border border-black/10 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: isDarkMode ? theme.swatches.bgDark : theme.swatches.bgLight }}
                        title={`Superficie (${isDarkMode ? 'Oscura' : 'Clara'})`}
                      />
                    </div>

                    {/* Palette Title and Subtitle */}
                    <div>
                      <h4 className="font-black text-base text-stone-900 dark:text-white group-hover:underline">
                        {theme.name}
                      </h4>
                      <p className={`text-xs leading-snug mt-1 ${
                        isDarkMode ? 'text-stone-400' : 'text-stone-600'
                      }`}>
                        {theme.subtitle}
                      </p>
                    </div>

                    {/* Colombian Inspiration Badge */}
                    <div className={`pt-2 border-t text-[11px] space-y-1 ${
                      isDarkMode ? 'border-stone-800 text-stone-400' : 'border-stone-100 text-stone-500'
                    }`}>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Compass className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="truncate">{theme.regionInspiration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Leaf className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{theme.speciesEmblem}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Preview Component Inside Card */}
                  <div className={`mt-3 p-2.5 rounded-xl border text-[11px] space-y-2 transition-colors ${
                    isDarkMode ? 'bg-[#091510] border-stone-800' : 'bg-stone-50 border-stone-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] uppercase tracking-wider text-stone-500">
                        Vista previa
                      </span>
                      <span 
                        className="text-[10px] font-black px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: isDarkMode ? theme.style.badgeBgDark : theme.style.badgeBgLight,
                          color: isDarkMode ? theme.style.badgeTextDark : theme.style.badgeTextLight
                        }}
                      >
                        Ejemplo
                      </span>
                    </div>

                    <button
                      type="button"
                      className="w-full py-1.5 rounded-lg text-white font-extrabold text-[11px] shadow-sm transition-transform active:scale-95"
                      style={{ backgroundColor: theme.style.primaryHex }}
                    >
                      {isSelected ? '✓ Paleta Activa' : 'Aplicar Paleta'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDarkMode ? 'border-[#1f3b2e] bg-[#0c1812]' : 'border-stone-200 bg-[#f8faf9]'
        }`}>
          <button
            onClick={() => onSelectPalette('esmeralda')}
            className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'text-stone-400 hover:text-white hover:bg-stone-800' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer a Selva Esmeralda</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white shadow-md transition-transform hover:scale-105 cursor-pointer"
            style={{ backgroundColor: activeTheme.style.primaryHex }}
          >
            Listo, aplicar y explorar
          </button>
        </div>
      </div>
    </div>
  );
};
