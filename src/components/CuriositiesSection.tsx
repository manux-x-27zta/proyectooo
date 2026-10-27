import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  HelpCircle, 
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { CURIOSITIES_DATA, Curiosity } from '../data/curiositiesData';

interface CuriositiesSectionProps {
  isDarkMode: boolean;
}

export const CuriositiesSection: React.FC<CuriositiesSectionProps> = ({ isDarkMode }) => {
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="datos-curiosos" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 shadow-md">
          <Lightbulb className="w-4 h-4" />
          <span>Secretos Biológicos de Colombia</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#163e2a] dark:text-white">
          Conoce los datos curiosos
        </h2>

        <p className={`text-sm sm:text-base leading-relaxed ${
          isDarkMode ? 'text-stone-300' : 'text-stone-600'
        }`}>
          Toca cada tarjeta para revelar las adaptaciones y comportamientos más sorprendentes de nuestras cuatro especies endémicas.
        </p>
      </div>

      {/* Grid of 4 Interactive Curiosity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {CURIOSITIES_DATA.map((item) => {
          const isRevealed = !!revealedIds[item.id];

          return (
            <div
              key={item.id}
              className={`rounded-3xl overflow-hidden border-2 transition-all duration-300 shadow-lg flex flex-col justify-between ${
                isDarkMode 
                  ? 'bg-[#12221b] border-[#254637]' 
                  : 'bg-white border-[#d8eae0]'
              }`}
            >
              <div>
                {/* Photo Header */}
                <div className="relative h-48 overflow-hidden bg-stone-900">
                  <img
                    src={item.imageUrl}
                    alt={item.speciesName}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  <span className="absolute top-3.5 left-3.5 text-[10px] font-black px-3 py-1 rounded-full bg-amber-400 text-stone-950 shadow-md">
                    {item.badge}
                  </span>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h4 className="font-black text-lg leading-tight">{item.speciesName}</h4>
                    <p className="text-xs italic font-serif text-stone-300">{item.scientificName}</p>
                  </div>
                </div>

                {/* Question Hook */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-extrabold text-[#163e2a] dark:text-white leading-snug">
                      {item.shortHook}
                    </p>
                  </div>

                  {/* Expandable Revealed Story */}
                  {isRevealed && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-amber-100 animate-in fade-in duration-300">
                      {item.fullStory}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Interactive Reveal Button */}
              <div className={`p-4 border-t flex items-center justify-between ${
                isDarkMode ? 'border-[#1b3328]' : 'border-[#e8f1ec]'
              }`}>
                <span className="text-[11px] text-stone-500 font-medium">
                  {isRevealed ? 'Respuesta revelada' : '¿Quieres saber la respuesta?'}
                </span>

                <button
                  onClick={() => toggleReveal(item.id)}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {isRevealed ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Ocultar</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Descubrir secreto</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
