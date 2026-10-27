import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  Palette, 
  Share2, 
  QrCode, 
  BarChart3, 
  Heart, 
  Target,
  Sparkles,
  ArrowRight,
  Printer,
  Award,
  Compass,
  ShieldCheck,
  Lock,
  Unlock
} from 'lucide-react';

interface VolunteerProjectSectionProps {
  isDarkMode: boolean;
  onNavigateToPosters?: () => void;
}

export const VolunteerProjectSection: React.FC<VolunteerProjectSectionProps> = ({ 
  isDarkMode,
  onNavigateToPosters 
}) => {
  // Track unlocked badges in localStorage to reward real user engagement
  const [unlockedBadges, setUnlockedBadges] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bioexplora_volunteer_badges');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'badge-explorador': true, // Auto unlocked upon visiting the platform
      'badge-guardian': false,
      'badge-divulgador': false,
      'badge-defensor': false,
    };
  });

  useEffect(() => {
    // Check if user has answered surveys or played trivia
    try {
      const surveys = localStorage.getItem('bioexplora_surveys');
      const trivias = localStorage.getItem('bioexplora_trivia_results');
      const hasSurvey = surveys && JSON.parse(surveys).length > 0;
      const hasTrivia = trivias && JSON.parse(trivias).length > 0;

      if (hasSurvey || hasTrivia) {
        setUnlockedBadges(prev => {
          const updated = {
            ...prev,
            'badge-guardian': true,
            'badge-defensor': true,
          };
          localStorage.setItem('bioexplora_volunteer_badges', JSON.stringify(updated));
          return updated;
        });
      }
    } catch {}
  }, []);

  const handleUnlockBadge = (id: string) => {
    setUnlockedBadges(prev => {
      const updated = { ...prev, [id]: true };
      try {
        localStorage.setItem('bioexplora_volunteer_badges', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const stages = [
    {
      number: '1',
      title: 'Investigamos',
      desc: 'Seleccionamos especies endémicas representativas de Colombia y estudiamos a fondo sus características, hábitats e importancia ecológica.',
      icon: Search,
      color: 'bg-emerald-500 text-white',
    },
    {
      number: '2',
      title: 'Verificamos',
      desc: 'Consultamos fuentes científicas confiables (Instituto Humboldt, UICN, SiB Colombia) para garantizar que la información sea rigurosa.',
      icon: CheckCircle2,
      color: 'bg-teal-500 text-white',
    },
    {
      number: '3',
      title: 'Diseñamos',
      desc: 'Creamos publicaciones y afiches educativos con información clara, datos biológicos relevantes e imágenes de alta calidad.',
      icon: Palette,
      color: 'bg-amber-500 text-stone-950',
    },
    {
      number: '4',
      title: 'Compartimos',
      desc: 'Difundimos los contenidos en redes sociales, medios digitales y espacios educativos comunitarios.',
      icon: Share2,
      color: 'bg-cyan-500 text-stone-950',
    },
    {
      number: '5',
      title: 'Evaluamos',
      desc: 'Utilizamos una encuesta accesible mediante códigos QR interactivos para medir el aprendizaje y la concientización ambiental.',
      icon: QrCode,
      color: 'bg-purple-500 text-white',
    },
    {
      number: '6',
      title: 'Analizamos',
      desc: 'Procesamos los resultados y exportamos los datos para evaluar el impacto educativo real de la divulgación.',
      icon: BarChart3,
      color: 'bg-rose-500 text-white',
    },
  ];

  const volunteerBadges = [
    {
      id: 'badge-explorador',
      name: 'Insignia Explorador de la Biodiversidad',
      icon: Compass,
      gradient: 'from-emerald-500 to-teal-600',
      border: 'border-emerald-500/40',
      criteria: 'Explorar las fichas taxonómicas y el mapa de especies de Colombia',
      description: 'Reconoce la curiosidad científica y el compromiso de conocer los seres vivos únicos que habitan nuestro país.',
      level: 'Nivel 1 · Iniciación Científica',
    },
    {
      id: 'badge-guardian',
      name: 'Insignia Guardián Insular y Marino',
      icon: ShieldCheck,
      gradient: 'from-sky-500 to-blue-600',
      border: 'border-sky-500/40',
      criteria: 'Conocer los ecosistemas del Pacífico (Isla Gorgona y Malpelo)',
      description: 'Distingue a los voluntarios que promueven la preservación de los santuarios oceánicos y su fauna endémica amenazada.',
      level: 'Nivel 2 · Conservación de Hábitats',
    },
    {
      id: 'badge-divulgador',
      name: 'Insignia Divulgador Ambiental',
      icon: Share2,
      gradient: 'from-amber-500 to-orange-600',
      border: 'border-amber-500/40',
      criteria: 'Ver o compartir afiches educativos con código QR',
      description: 'Otorgada por multiplicar el mensaje educativo, llevando el conocimiento a escuelas, familias y redes sociales.',
      level: 'Nivel 3 · Acción Comunitaria',
    },
    {
      id: 'badge-defensor',
      name: 'Insignia Defensor del Territorio',
      icon: Award,
      gradient: 'from-purple-500 to-indigo-600',
      border: 'border-purple-500/40',
      criteria: 'Completar la trivia o responder la encuesta ciudadana de impacto',
      description: 'Máximo galardón del voluntariado para quienes asumen un rol activo en la defensa de nuestro patrimonio natural.',
      level: 'Nivel 4 · Embajador Ambiental',
    },
  ];

  return (
    <section id="voluntariado" className="space-y-12 scroll-mt-20">
      {/* Section Header & Main Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md">
          <Users className="w-4 h-4 text-emerald-200" />
          <span>Iniciativa Ciudadana y Ambiental</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#163e2a] dark:text-white">
          Nuestro proyecto de voluntariado ambiental
        </h2>

        <p className={`text-sm sm:text-base leading-relaxed ${
          isDarkMode ? 'text-stone-300' : 'text-stone-700'
        }`}>
          Somos una iniciativa de voluntariado ambiental que busca dar a conocer la riqueza natural de Colombia, especialmente las especies endémicas que muchas veces pasan desapercibidas. A través de la divulgación científica en redes sociales y materiales educativos, queremos despertar la curiosidad, fortalecer el conocimiento y promover el cuidado de nuestra biodiversidad.
        </p>
      </div>

      {/* 4 Insignias del Voluntariado Ambiental */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Award className="w-3.5 h-3.5" />
            <span>Reconocimientos al Mérito Ecológico</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-[#163e2a] dark:text-white">
            4 Insignias del Voluntariado Ambiental
          </h3>
          <p className={`text-xs sm:text-sm ${
            isDarkMode ? 'text-stone-400' : 'text-stone-600'
          }`}>
            Reconocimientos oficiales para los voluntarios y ciudadanos que participan activamente en las etapas pedagógicas del proyecto:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {volunteerBadges.map((badge) => {
            const Icon = badge.icon;
            const isUnlocked = unlockedBadges[badge.id] || false;

            return (
              <div
                key={badge.id}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between shadow-md relative overflow-hidden group ${
                  isUnlocked 
                    ? isDarkMode 
                      ? 'bg-[#12221b] border-emerald-500/50 hover:border-emerald-400' 
                      : 'bg-white border-emerald-400/60 hover:border-emerald-500' 
                    : isDarkMode 
                      ? 'bg-[#0d1813] border-stone-800 opacity-75' 
                      : 'bg-[#f7faf8] border-stone-200 opacity-80'
                }`}
              >
                {/* Glow accent */}
                {isUnlocked && (
                  <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${badge.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`} />
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${badge.gradient} text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" /> Obtenida
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-500/20 text-stone-600 dark:text-stone-400 border border-stone-500/30">
                          <Lock className="w-3 h-3" /> Bloqueada
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {badge.level}
                    </span>
                    <h4 className="text-base font-black text-[#163e2a] dark:text-white leading-tight mt-0.5">
                      {badge.name}
                    </h4>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    {badge.description}
                  </p>

                  <div className={`p-3 rounded-xl border text-[11px] leading-snug ${
                    isDarkMode ? 'bg-[#0a1510] border-[#1d382b]' : 'bg-[#edf6f0] border-[#d2e7da]'
                  }`}>
                    <strong className="block text-[#196b44] dark:text-[#8ce2b6] mb-0.5">
                      Condición de obtención:
                    </strong>
                    <span>{badge.criteria}</span>
                  </div>
                </div>

                {!isUnlocked && (
                  <button
                    onClick={() => handleUnlockBadge(badge.id)}
                    className="mt-4 w-full py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-stone-600 dark:text-stone-300"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Desbloquear insignia</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subsección: ¿Qué queremos lograr? */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-all shadow-md ${
        isDarkMode 
          ? 'bg-[#112019] border-[#224434] text-[#ecf3ef]' 
          : 'bg-gradient-to-br from-[#f2f8f4] via-[#ffffff] to-[#e8f5ee] border-[#d4e7dc] text-[#1c2e24]'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg">
            <Target className="w-7 h-7 text-yellow-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#163e2a] dark:text-white">
              ¿Qué queremos lograr?
            </h3>
            <p className={`text-sm sm:text-base leading-relaxed ${
              isDarkMode ? 'text-stone-300' : 'text-stone-700'
            }`}>
              Nuestro objetivo es acercar el conocimiento sobre las especies endémicas de Colombia a más personas, utilizando información confiable, sencilla y visualmente atractiva. Queremos demostrar que conocer nuestra fauna y flora es el primer paso para aprender a valorarla y protegerla.
            </p>
          </div>
        </div>
      </div>

      {/* Subsección: ¿Cómo lo hacemos? (Las Seis Etapas) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h3 className="text-2xl sm:text-3xl font-black text-[#163e2a] dark:text-white">
            ¿Cómo lo hacemos?
          </h3>
          <p className={`text-xs sm:text-sm ${
            isDarkMode ? 'text-stone-400' : 'text-stone-600'
          }`}>
            Desarrollamos nuestra iniciativa a través de seis etapas ordenadas y colaborativas:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.number}
                className={`p-6 rounded-3xl border-2 transition-all hover:scale-[1.02] shadow-md flex flex-col justify-between ${
                  isDarkMode 
                    ? 'bg-[#12221b] border-[#1e382c]' 
                    : 'bg-white border-[#d8eae0]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${stage.color}`}>
                      {stage.number}
                    </div>
                    <Icon className="w-5 h-5 text-stone-400 dark:text-stone-500" />
                  </div>

                  <h4 className="text-base font-black text-[#163e2a] dark:text-white leading-snug">
                    {stage.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subsección: Nuestro propósito & Enlace a Afiches */}
      <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 transition-all shadow-md ${
        isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f4faf6] border-[#d8eae0]'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
              <Heart className="w-6 h-6 text-stone-950" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-[#163e2a] dark:text-white">
                Nuestro propósito
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed max-w-2xl">
                Creemos que la biodiversidad colombiana merece ser conocida y valorada. Por eso, queremos aprovechar las herramientas digitales para compartir conocimiento, despertar interés por nuestras especies endémicas y contribuir a la educación ambiental.
              </p>
            </div>
          </div>

          {onNavigateToPosters && (
            <button
              onClick={onNavigateToPosters}
              className="w-full md:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-[#196b44] hover:bg-[#145a38] text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 hover:scale-105 transition-all shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Ver Afiches Educativos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
