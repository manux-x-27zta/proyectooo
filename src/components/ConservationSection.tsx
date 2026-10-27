import React from 'react';
import { 
  ShieldAlert, 
  Heart, 
  AlertTriangle, 
  TreePine, 
  Ban, 
  Recycle, 
  Megaphone, 
  Camera,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface ConservationSectionProps {
  isDarkMode: boolean;
}

export const ConservationSection: React.FC<ConservationSectionProps> = ({ isDarkMode }) => {
  const threats = [
    {
      title: 'Pérdida de Hábitat y Deforestación',
      desc: 'La tala para ganadería extensiva y monocultivos fragmenta los bosques nativos, dejando a especies como el Tití Cabeciblanco sin árboles continuos para desplazarse.',
      icon: TreePine,
      color: 'text-amber-500',
    },
    {
      title: 'Tráfico Ilegal de Fauna Silvestre',
      desc: 'La captura de loros, monos y reptiles llamativos (como el Lagarto Azul) para venderlos como mascotas daña las poblaciones y rompe familias enteras.',
      icon: Ban,
      color: 'text-rose-500',
    },
    {
      title: 'Cambio Climático y Hongos',
      desc: 'El aumento de temperatura en las altas montañas seca los páramos del Perico del Sol y favorece la propagación de enfermedades en ranas de niebla.',
      icon: AlertTriangle,
      color: 'text-orange-500',
    },
  ];

  const practicalTips = [
    {
      title: 'Nunca compres animales silvestres',
      text: 'Los loros, micos, tortugas y ranas pertenecen a la libertad de su hábitat. Denuncia el tráfico ante las autoridades ambientales (CAR y Policía Ambiental).',
    },
    {
      title: 'Comparte información y educa',
      text: 'Habla con tus amigos, familiares y en redes sobre las especies endémicas. La desinformación se combate cuando la gente conoce lo que tiene.',
    },
    {
      title: 'Apoya el ecoturismo responsable',
      text: 'Cuando visites parques naturales o reservas comunitarias, no dejes basura, no arranques plantas como frailejones y contrata guías locales.',
    },
    {
      title: 'Cuida el agua y reduce residuos',
      text: 'El agua que ahorras en casa viene de los páramos y ríos donde viven estas especies. Reducir plásticos protege las cuencas fluviales.',
    },
  ];

  return (
    <section id="conservacion" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md">
          <ShieldAlert className="w-4 h-4" />
          <span>Compromiso Ambiental</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#163e2a] dark:text-white">
          ¿Por qué debemos protegerlas?
        </h2>

        <p className={`text-sm sm:text-base leading-relaxed ${
          isDarkMode ? 'text-stone-300' : 'text-stone-600'
        }`}>
          Las especies endémicas tienen áreas de distribución reducidas. Si una alteración destruye su único hogar, se extinguen sin retorno.
        </p>
      </div>

      {/* Highlighted Banner Message required in prompt */}
      <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 text-center text-white shadow-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 border border-emerald-600/40">
        <div className="max-w-2xl mx-auto space-y-3">
          <Heart className="w-10 h-10 text-yellow-300 mx-auto animate-pulse" />
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight drop-shadow-md">
            "Conocer nuestra biodiversidad es el primer paso para aprender a protegerla"
          </h3>
          <p className="text-emerald-200 text-xs sm:text-sm max-w-xl mx-auto">
            Nadie ama ni defiende lo que no conoce. Al compartir estas especies en colegios y redes, evitamos que desaparezcan en el silencio.
          </p>
        </div>
      </div>

      {/* Threats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {threats.map((t, idx) => {
          const Icon = t.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl border transition-all ${
                isDarkMode 
                  ? 'bg-[#12221b] border-[#1e382c]' 
                  : 'bg-white border-[#e0ece4] shadow-md'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
                <Icon className={`w-6 h-6 ${t.color}`} />
              </div>
              <h4 className="text-base font-black mb-2 text-[#163e2a] dark:text-white">{t.title}</h4>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {t.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Practical Tips Card Grid */}
      <div className={`p-8 rounded-3xl border space-y-6 ${
        isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f4faf6] border-[#d8eae0]'
      }`}>
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Acciones Cotidianas
          </span>
          <h4 className="text-xl sm:text-2xl font-black">
            ¿Cómo puedes contribuir desde tu vida diaria?
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {practicalTips.map((tip, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#d8eae0] shadow-sm'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <strong className="block text-sm font-extrabold mb-1 text-[#163e2a] dark:text-white">
                  {tip.title}
                </strong>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {tip.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
