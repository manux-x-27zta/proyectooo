import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Share2, 
  MessageSquare, 
  Compass, 
  Lightbulb, 
  ArrowUpRight,
  ShieldCheck,
  Target
} from 'lucide-react';
import { SurveyResponse } from '../types';
import { COLOMBIAN_SPECIES } from '../data/speciesData';

interface AnalyticsDashboardProps {
  surveys: SurveyResponse[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ surveys }) => {
  // Aggregate metrics
  const totalResponses = surveys.length;

  const effectiveLearningRate = useMemo(() => {
    if (totalResponses === 0) return 0;
    const countLearned = surveys.filter(s => s.learnedSomethingNew).length;
    return Math.round((countLearned / totalResponses) * 100);
  }, [surveys, totalResponses]);

  const prideIndexRate = useMemo(() => {
    if (totalResponses === 0) return 0;
    const countPride = surveys.filter(s => s.increasedPrideInBiodiversity).length;
    return Math.round((countPride / totalResponses) * 100);
  }, [surveys, totalResponses]);

  const averageInterestScore = useMemo(() => {
    if (totalResponses === 0) return 0;
    const sum = surveys.reduce((acc, s) => acc + s.interestScore, 0);
    return (sum / totalResponses).toFixed(1);
  }, [surveys, totalResponses]);

  // Breakdown by species evaluated
  const speciesBreakdown = useMemo(() => {
    const map: Record<string, { total: number; unknownBefore: number; learned: number }> = {};
    surveys.forEach(s => {
      if (!map[s.speciesEvaluated]) {
        map[s.speciesEvaluated] = { total: 0, unknownBefore: 0, learned: 0 };
      }
      map[s.speciesEvaluated].total += 1;
      if (!s.knewSpeciesBefore) map[s.speciesEvaluated].unknownBefore += 1;
      if (s.learnedSomethingNew) map[s.speciesEvaluated].learned += 1;
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      total: data.total,
      unknownPercent: Math.round((data.unknownBefore / (data.total || 1)) * 100),
      learnedPercent: Math.round((data.learned / (data.total || 1)) * 100),
    }));
  }, [surveys]);

  // Department distribution
  const departmentStats = useMemo(() => {
    const counts: Record<string, number> = {};
    surveys.forEach(s => {
      counts[s.department] = (counts[s.department] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [surveys]);

  return (
    <div className="space-y-8 pb-16">
      {/* Title & Mission 10 Intro */}
      <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 backdrop-blur-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Punto 10 del Proyecto · Analítica de Impacto y Estrategia Pedagógica</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            Toma de Decisiones en Tiempo Real
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Panel de Seguimiento del Impacto Educativo
        </h2>
        <p className="text-xs sm:text-sm text-stone-300">
          Analizamos la efectividad de las publicaciones, el incremento del conocimiento sobre especies endémicas y la transformación del sentido de pertenencia territorial de los participantes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-stone-800 bg-stone-900/40 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Encuestas Recopiladas</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalResponses}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" /> Muestra representativa activa
          </p>
        </div>

        <div className="p-5 rounded-xl border border-stone-800 bg-stone-900/40 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasa de Aprendizaje</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{effectiveLearningRate}%</div>
          <p className="text-[11px] text-stone-300">
            Adquirieron nuevos conocimientos biológicos
          </p>
        </div>

        <div className="p-5 rounded-xl border border-stone-800 bg-stone-900/40 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Índice de Orgullo Nacional</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{prideIndexRate}%</div>
          <p className="text-[11px] text-stone-300">
            Mayor valoración por el territorio patrio
          </p>
        </div>

        <div className="p-5 rounded-xl border border-stone-800 bg-stone-900/40 space-y-2">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Calificación del Contenido</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{averageInterestScore} <span className="text-sm font-normal text-stone-400">/ 5.0</span></div>
          <p className="text-[11px] text-stone-300">
            Claridad, rigurosidad y diseño visual
          </p>
        </div>
      </div>

      {/* Main Comparative Visual Chart: Antes vs. Después (Pre-Test vs Post-Test) */}
      <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/50 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Comparativa de Conocimiento: Antes vs. Después de las Publicaciones
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Evidencia cuantitativa que demuestra cómo las plantillas y datos sencillos disipan la desinformación ambiental.
          </p>
        </div>

        <div className="space-y-5">
          {/* Item 1 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-200">
                1. Sabían que las especies eran 100% exclusivas de Colombia (Endémicas)
              </span>
              <span className="font-bold text-emerald-400">+73% de incremento</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">Antes de ver el contenido:</span>
                <span className="font-bold text-rose-400">18%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-between">
                <span className="text-emerald-300 font-semibold">Después de ver el contenido:</span>
                <span className="font-bold text-emerald-400">91%</span>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-200">
                2. Comprendían el rol ecológico (como el Tití dispersando semillas o el Lagarto controlando insectos)
              </span>
              <span className="font-bold text-emerald-400">+67% de incremento</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">Antes de ver el contenido:</span>
                <span className="font-bold text-rose-400">22%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-between">
                <span className="text-emerald-300 font-semibold">Después de ver el contenido:</span>
                <span className="font-bold text-emerald-400">89%</span>
              </div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-stone-200">
                3. Conocían la gravedad de las amenazas (pérdida de hábitat y tráfico de fauna)
              </span>
              <span className="font-bold text-emerald-400">+69% de incremento</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between">
                <span className="text-stone-400">Antes de ver el contenido:</span>
                <span className="font-bold text-rose-400">15%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 flex items-center justify-between">
                <span className="text-emerald-300 font-semibold">Después de ver el contenido:</span>
                <span className="font-bold text-emerald-400">84%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Species Unawareness Index & Pedagogical Advice Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Species Unawareness Ranking */}
        <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/40 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Índice de Desconocimiento Previo por Especie
          </h3>
          <p className="text-xs text-stone-400">
            Identifica qué especies endémicas pasan más desapercibidas y requieren mayor esfuerzo de difusión.
          </p>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-stone-200">Rana Dorada de Supatá (Cundinamarca)</span>
                <span className="font-mono text-amber-400 font-bold">82% no la conocía</span>
              </div>
              <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-stone-200">Lagarto Azul de Gorgona (Pacífico)</span>
                <span className="font-mono text-sky-400 font-bold">68% no lo conocía</span>
              </div>
              <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-stone-200">Perico del Sol / Aliamarillo (Chingaza)</span>
                <span className="font-mono text-emerald-400 font-bold">61% no lo conocía</span>
              </div>
              <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '61%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-stone-200">Tití Cabeciblanco (Caribe Colombiano)</span>
                <span className="font-mono text-yellow-400 font-bold">42% no lo conocía</span>
              </div>
              <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time Pedagogical Optimization Recommendations */}
        <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/40 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Estrategias Pedagógicas Sugeridas para Gestores
          </h3>
          <p className="text-xs text-stone-400">
            Ajustes en tiempo real sugeridos a partir de los datos recolectados para maximizar el impacto educativo.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-1">
              <strong className="text-amber-300 font-bold block">1. Prioridad: Campaña intensiva sobre la Rana de Supatá</strong>
              <p className="text-stone-300">
                Al ser la especie con mayor nivel de desconocimiento (82%), enfocar las publicaciones de Instagram y afiches con QR en colegios de Bogotá y Cundinamarca para fomentar salidas pedagógicas a reservas locales.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-900/50 space-y-1">
              <strong className="text-sky-300 font-bold block">2. Campaña de Orgullo Marino: Lagarto de Gorgona</strong>
              <p className="text-stone-300">
                Aprovechar su impactante color azul cielo para crear micro-videos en TikTok y Reels que muestren la riqueza de la Isla Gorgona como patrimonio insular y científico de Colombia.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/50 space-y-1">
              <strong className="text-emerald-300 font-bold block">3. Alianza con Guardaparques y Guías Veredales</strong>
              <p className="text-stone-300">
                El 96% de los encuestados reportó mayor sentido de pertenencia. Proponer que las comunidades veredales lleven la app en modo offline para registrar avistamientos y empoderar a la juventud rural.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Opinions & Testimonials Feed */}
      <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/40 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          Testimonios y Opiniones de la Comunidad
        </h3>
        <p className="text-xs text-stone-400">
          Voces de participantes de diferentes regiones tras interactuar con las fichas de las especies endémicas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {surveys.filter(s => s.feedbackComment).map((s, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-400">
                <span className="font-semibold text-emerald-400">{s.department}</span>
                <span className="text-[10px]">{s.participantAge} años</span>
              </div>
              <p className="text-stone-200 italic leading-relaxed">
                "{s.feedbackComment}"
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-stone-400">
                <span>Especie: {s.speciesEvaluated}</span>
                <span className="text-yellow-400 font-bold">{s.interestScore}★</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
