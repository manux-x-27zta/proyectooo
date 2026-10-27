import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Globe2, 
  Compass, 
  ArrowDown, 
  CheckCircle2, 
  Leaf, 
  Info,
  Heart
} from 'lucide-react';
import heroBgImage from '../assets/images/regenerated_image_1792170095890.avif';
import endemicLagartoImage from '../assets/images/regenerated_image_1792170096244.webp';
import { PaletteId, PALETTE_THEMES } from '../data/paletteThemes';

interface HeroAndEndemicProps {
  onExploreSpeciesClick: () => void;
  onExploreBiodiversityClick: () => void;
  isDarkMode: boolean;
  currentPalette: PaletteId;
}

export const HeroAndEndemic: React.FC<HeroAndEndemicProps> = ({
  onExploreSpeciesClick,
  onExploreBiodiversityClick,
  isDarkMode,
  currentPalette,
}) => {
  const activeTheme = PALETTE_THEMES.find(p => p.id === currentPalette) || PALETTE_THEMES[0];
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* 3. Portada Impactante (Hero Section) */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 bg-stone-950">
        {/* Background Nature Photography with High-Contrast Mobile & Desktop Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBgImage}
            alt="Bosque Tropical y Biodiversidad de Colombia"
            className="w-full h-full object-cover scale-105 transition-transform duration-1000 contrast-105 saturate-120"
          />
          {/* Measured high-contrast scrim so white hero text is effortless to read on mobile & desktop */}
          <div className="absolute inset-0 bg-stone-950/45 sm:bg-stone-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/65 to-stone-950/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/25 to-black/25" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-5 sm:p-12 lg:p-16 max-w-3xl text-white space-y-5 sm:space-y-6">
          {/* Project & Country Badge */}
          <div 
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black text-white shadow-lg backdrop-blur-md border max-w-full"
            style={{ 
              backgroundColor: `${activeTheme.style.primaryHex}ee`,
              borderColor: activeTheme.swatches.glow 
            }}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
            <span className="truncate">Voluntariado Ambiental · Biodiversidad Colombiana</span>
          </div>

          {/* Main Title required in prompt */}
          <h1 className="text-2xl min-[380px]:text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight drop-shadow-lg text-white">
            Colombia: <span 
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: `var(--theme-hero-gradient, linear-gradient(to right, #34d399, #5eead4, #bef264))` }}
            >
              un tesoro de especies únicas
            </span>
          </h1>

          {/* Subtitle required in prompt */}
          <p className="text-sm sm:text-lg lg:text-xl text-stone-200 font-medium leading-relaxed drop-shadow">
            Descubre las especies que solo habitan en nuestro territorio y conoce por qué protegerlas es responsabilidad de todos.
          </p>

          {/* The Two Prominent Action Buttons required in prompt */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
            <button
              onClick={onExploreSpeciesClick}
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 text-sm sm:text-base font-black rounded-2xl text-white shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-2"
              style={{ 
                backgroundImage: `var(--theme-btn-gradient)`,
                borderColor: activeTheme.swatches.glow
              }}
            >
              <Compass className="w-5 h-5 text-white/90 shrink-0" />
              <span>Explorar las especies</span>
            </button>

            <button
              onClick={onExploreBiodiversityClick}
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 text-sm sm:text-base font-black rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xl shadow-amber-950/40 hover:scale-105 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-stone-950 shrink-0" />
              <span>Descubrir nuestra biodiversidad</span>
            </button>
          </div>

          {/* Highlights Counter Ribbon */}
          <div className="pt-5 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-3 border-t border-white/15 text-stone-200">
            <div className="min-w-0">
              <span className="block text-base min-[380px]:text-lg sm:text-2xl font-black text-emerald-400">#2</span>
              <span className="text-[11px] sm:text-xs text-stone-300 leading-tight block">País más biodiverso del mundo</span>
            </div>
            <div className="min-w-0">
              <span className="block text-base min-[380px]:text-lg sm:text-2xl font-black text-amber-400">10%</span>
              <span className="text-[11px] sm:text-xs text-stone-300 leading-tight block">De la biodiversidad del planeta</span>
            </div>
            <div className="min-w-0">
              <span className="block text-base min-[380px]:text-lg sm:text-2xl font-black text-cyan-400">4 Insignias</span>
              <span className="text-[11px] sm:text-xs text-stone-300 leading-tight block">Especies investigadas a fondo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sección: ¿Qué significa que una especie sea endémica? */}
      <section id="que-es-endemica" className={`scroll-mt-20 rounded-3xl p-5 sm:p-10 border transition-all shadow-lg ${
        isDarkMode 
          ? 'bg-[#112019] border-[#224434] text-[#ecf3ef]' 
          : 'bg-gradient-to-br from-[#f2f8f4] via-[#ffffff] to-[#e8f5ee] border-[#d4e7dc] text-[#1c2e24]'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Educational Text & Core Principle */}
          <div className="lg:col-span-7 space-y-4">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: activeTheme.style.primaryHex }}
            >
              <Globe2 className="w-3.5 h-3.5 text-yellow-300" />
              <span>Concepto Biológico Fundamental</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-white">
              ¿Qué significa que una especie sea <span style={{ color: activeTheme.style.primaryHex }}>endémica</span>?
            </h2>

            {/* The Highlighted Idea required in prompt */}
            <div 
              className="p-4 sm:p-5 rounded-2xl border-l-4 text-stone-800 dark:text-stone-200 space-y-1"
              style={{ 
                backgroundColor: isDarkMode ? `${activeTheme.style.primaryHex}18` : `${activeTheme.style.primaryHex}10`,
                borderColor: activeTheme.style.primaryHex 
              }}
            >
              <span 
                className="text-[11px] font-black uppercase tracking-wider block"
                style={{ color: activeTheme.style.primaryHex }}
              >
                Definición Clave
              </span>
              <blockquote className="text-base sm:text-lg font-bold leading-relaxed">
                "Una especie endémica es aquella que se encuentra de forma natural exclusivamente en una región geográfica determinada".
              </blockquote>
            </div>

            <p className={`text-sm leading-relaxed ${
              isDarkMode ? 'text-stone-300' : 'text-stone-700'
            }`}>
              Esto significa que <strong>si desaparece de Colombia, desaparece para siempre de la faz de la Tierra</strong>. A diferencia de las especies cosmopolitas que habitan en múltiples continentes, nuestras especies endémicas evolucionaron adaptadas a microclimas únicos: las cumbres frías de los páramos, las islas oceánicas del Pacífico o los parches relictos de bosque seco caribeño.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-white border-[#d8eae0]'
              }`}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-stone-900 dark:text-white">Patrimonio Irremplazable</strong>
                  <span className="text-stone-600 dark:text-stone-400">No existen réplicas en ninguna otra parte del mundo.</span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-white border-[#d8eae0]'
              }`}>
                <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-stone-900 dark:text-white">Guardianes Ecosistémicos</strong>
                  <span className="text-stone-600 dark:text-stone-400">Regulan el agua, dispersan semillas y controlan plagas.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Representative Illustration / Photo Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-stone-800">
              <img
                src={endemicLagartoImage}
                alt="Ejemplo de especie endémica: Lagarto Azul de Gorgona"
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-cyan-500 text-stone-950">
                  Ejemplo Colombiano
                </span>
                <h4 className="font-extrabold text-base">Lagarto Azul de Gorgona</h4>
                <p className="text-xs text-stone-200 leading-snug">
                  Solo habita en la pequeña Isla Gorgona en el Pacífico de Colombia. Ningún otro país tiene este reptil azul brillante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
