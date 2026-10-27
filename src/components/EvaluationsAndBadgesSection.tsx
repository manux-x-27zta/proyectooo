import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  User,
  HelpCircle,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { BADGE_DEFINITIONS } from '../data/badgeDefinitions';
import { EVALUATION_QUESTIONS_BY_LEVEL, EvaluationQuestion } from '../data/evaluationsData';
import { BadgeLevel, UserDiploma, EvaluationAttempt } from '../types';
import { BadgeMedal } from './BadgeMedal';
import { DigitalDiplomaModal } from './DigitalDiplomaModal';
import { BioExploraLogo } from './BioExploraLogo';

interface EvaluationsAndBadgesSectionProps {
  isDarkMode?: boolean;
}

export const EvaluationsAndBadgesSection: React.FC<EvaluationsAndBadgesSectionProps> = ({
  isDarkMode = false,
}) => {
  const { user, submitEvaluation, selectedDiploma, setSelectedDiploma } = useAuth();

  const [activeTab, setActiveTab] = useState<'badges' | 'evaluations' | 'history'>('badges');
  const [selectedLevel, setSelectedLevel] = useState<BadgeLevel>('bronce');

  // Pre-Diploma Recipient Name Modal State (asks for name BEFORE issuing/displaying diploma)
  const [pendingDiploma, setPendingDiploma] = useState<UserDiploma | null>(null);
  const [recipientNameInput, setRecipientNameInput] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('bioexplora_diploma_recipient_name') || '';
  });
  const [recipientNameError, setRecipientNameError] = useState<string | null>(null);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    correctCount: number;
    totalCount: number;
    scorePercent: number;
    approved: boolean;
    newlyUnlockedBadge?: boolean;
    diploma?: UserDiploma;
  } | null>(null);

  // Local attempts history for guest or instant display
  const [localAttempts, setLocalAttempts] = useState<EvaluationAttempt[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('bioexplora_evaluation_attempts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const currentQuestions: EvaluationQuestion[] = EVALUATION_QUESTIONS_BY_LEVEL[selectedLevel] || [];
  const currentBadgeDef = BADGE_DEFINITIONS.find((b) => b.level === selectedLevel) || BADGE_DEFINITIONS[0];

  // Open the Pre-Diploma Name Modal first before showing any diploma
  const requestDiplomaWithNamePrompt = (diplomaTemplate: UserDiploma) => {
    const savedRecipient =
      typeof window !== 'undefined'
        ? localStorage.getItem('bioexplora_diploma_recipient_name') || ''
        : '';
    setRecipientNameInput(savedRecipient);
    setRecipientNameError(null);
    setPendingDiploma(diplomaTemplate);
  };

  // Confirm recipient name and then issue & display the official diploma
  const handleConfirmRecipientAndShowDiploma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingDiploma) return;

    const cleanName = recipientNameInput.trim();
    if (!cleanName || cleanName.length < 2) {
      setRecipientNameError('Por favor ingresa tu nombre para emitir el diploma.');
      return;
    }

    try {
      localStorage.setItem('bioexplora_diploma_recipient_name', cleanName);
      localStorage.setItem('bioexplora_student_name', cleanName);
    } catch {}

    const issuedDiploma: UserDiploma = {
      ...pendingDiploma,
      username: cleanName,
    };

    setEvaluationResult((prev) =>
      prev && prev.diploma ? { ...prev, diploma: issuedDiploma } : prev
    );
    setPendingDiploma(null);
    setRecipientNameError(null);
    setSelectedDiploma(issuedDiploma);
  };

  const levelsOrder: BadgeLevel[] = ['bronce', 'plata', 'oro', 'platino', 'leyenda'];

  const earnedBadgesCount = React.useMemo(() => {
    const unlockedSet = new Set<string>();
    if (user?.badges) {
      user.badges.forEach((b) => unlockedSet.add(b.level));
    }
    localAttempts.forEach((a) => {
      if (a.approved) unlockedSet.add(a.level);
    });
    return unlockedSet.size;
  }, [user, localAttempts]);

  // Helper to determine status for a badge (supports both free students and institutional session)
  const getBadgeStatus = (
    level: BadgeLevel
  ): { status: 'locked' | 'in-progress' | 'unlocked'; unlockedAt?: string; progressPercent?: number } => {
    const earnedInAccount = user?.badges?.find((b) => b.level === level);
    if (earnedInAccount) {
      return { status: 'unlocked', unlockedAt: earnedInAccount.unlockedAt, progressPercent: 100 };
    }

    const passedAttempt = localAttempts.find((a) => a.level === level && a.approved);
    if (passedAttempt) {
      return { status: 'unlocked', unlockedAt: passedAttempt.timestamp, progressPercent: 100 };
    }

    const levelAttempts = localAttempts.filter((a) => a.level === level);
    if (levelAttempts.length > 0) {
      const bestScore = Math.max(...levelAttempts.map((a) => a.scorePercentage));
      return { status: 'in-progress', progressPercent: bestScore };
    }

    const idx = levelsOrder.indexOf(level);
    if (idx === 0) return { status: 'in-progress', progressPercent: 0 };

    const prevLevel = levelsOrder[idx - 1];
    const prevEarned =
      Boolean(user?.badges?.some((b) => b.level === prevLevel)) ||
      localAttempts.some((a) => a.level === prevLevel && a.approved);

    if (prevEarned) return { status: 'in-progress', progressPercent: 0 };

    return { status: 'locked', progressPercent: 0 };
  };

  const handleStartEvaluation = (level: BadgeLevel) => {
    setSelectedLevel(level);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsCompleted(false);
    setEvaluationResult(null);
    setActiveTab('evaluations');
  };

  const handleSelectOption = (optionIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: optionIndex }));
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      finishEvaluation();
    }
  };

  const finishEvaluation = async () => {
    let correct = 0;
    const summary: Array<{
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string;
    }> = [];

    currentQuestions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      const isRight = chosen === q.correctIndex;
      if (isRight) correct += 1;
      summary.push({
        question: q.question,
        selectedAnswer: chosen !== undefined ? q.options[chosen] : 'Sin responder',
        correctAnswer: q.options[q.correctIndex],
        isCorrect: isRight,
        explanation: q.explanation,
      });
    });

    const total = currentQuestions.length;
    const scorePct = Math.round((correct / total) * 100);
    const approved = scorePct >= currentBadgeDef.minScorePercent;

    const storedStudentName =
      typeof window !== 'undefined'
        ? localStorage.getItem('bioexplora_diploma_recipient_name') ||
          localStorage.getItem('bioexplora_student_name')
        : null;
    const studentDisplayName = user?.username || storedStudentName || 'Estudiante BioExplora';

    const attemptRecord: EvaluationAttempt = {
      id: `eval-${Date.now()}`,
      userId: user?.id || 'invitado',
      username: studentDisplayName,
      level: selectedLevel,
      levelName: currentBadgeDef.name,
      totalQuestions: total,
      correctAnswers: correct,
      scorePercentage: scorePct,
      approved,
      minScoreRequired: currentBadgeDef.minScorePercent,
      timestamp: new Date().toISOString(),
      badgeAwarded: approved ? currentBadgeDef.name : undefined,
      answersSummary: summary,
    };

    const updatedAttempts = [attemptRecord, ...localAttempts];
    setLocalAttempts(updatedAttempts);
    try {
      localStorage.setItem('bioexplora_evaluation_attempts', JSON.stringify(updatedAttempts));
    } catch {}

    let newlyUnlocked = false;
    let diplomaGenerated: UserDiploma | undefined;

    const serverRes = await submitEvaluation({
      level: selectedLevel,
      totalQuestions: total,
      correctAnswers: correct,
      scorePercentage: scorePct,
      participantName: storedStudentName || 'Estudiante BioExplora',
      answersSummary: summary,
    });

    if (serverRes?.success) {
      newlyUnlocked = !!serverRes.newlyUnlockedBadge;
      if (serverRes.diploma) {
        diplomaGenerated = serverRes.diploma;
      }
    }

    if (approved && !diplomaGenerated) {
      diplomaGenerated = {
        id: `dip-${Date.now()}`,
        certificateNumber: `BIO-CERT-${Date.now().toString(36).toUpperCase()}`,
        userId: user?.id || 'invitado',
        username: studentDisplayName,
        badgeLevel: selectedLevel,
        badgeName: `${currentBadgeDef.name} · ${currentBadgeDef.title}`,
        subject: 'Fauna, Flora y Ecosistemas Endémicos de Colombia',
        score: correct,
        maxScore: total,
        scorePercentage: scorePct,
        issuedAt: new Date().toISOString(),
        recognitionText:
          '¡Felicitaciones! Has demostrado tus conocimientos y superado este desafío en BioExplora. Sigue explorando, aprendiendo y alcanzando nuevos logros.',
      };
    }

    setEvaluationResult({
      correctCount: correct,
      totalCount: total,
      scorePercent: scorePct,
      approved,
      newlyUnlockedBadge: newlyUnlocked,
      diploma: diplomaGenerated,
    });
    setIsCompleted(true);

    if (approved) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#10b981', '#f59e0b', '#0284c7', '#34d399', '#facc15'],
        });
      } catch {}

      // Prompt for the student's full name immediately before issuing their diploma
      if (diplomaGenerated) {
        requestDiplomaWithNamePrompt(diplomaGenerated);
      }
    }
  };

  const handleOpenDiplomaFlow = (level: BadgeLevel) => {
    if (user && user.diplomas) {
      const d = user.diplomas.find((dip) => dip.badgeLevel === level);
      if (d) {
        requestDiplomaWithNamePrompt(d);
        return;
      }
    }

    const bDef = BADGE_DEFINITIONS.find((b) => b.level === level) || BADGE_DEFINITIONS[0];
    const generated: UserDiploma = {
      id: `dip-view-${Date.now()}`,
      certificateNumber: `BIO-CERT-${Date.now().toString(36).toUpperCase()}`,
      userId: user?.id || 'demo-usr',
      username: user?.username || 'Estudiante BioExplora',
      badgeLevel: level,
      badgeName: `${bDef.name} · ${bDef.title}`,
      subject: 'Fauna, Flora y Ecosistemas Endémicos de Colombia',
      score: bDef.totalQuestions,
      maxScore: bDef.totalQuestions,
      scorePercentage: 100,
      issuedAt: new Date().toISOString(),
      recognitionText:
        '¡Felicitaciones! Has demostrado tus conocimientos y superado este desafío en BioExplora. Sigue explorando, aprendiendo y alcanzando nuevos logros.',
    };
    requestDiplomaWithNamePrompt(generated);
  };

  return (
    <div id="insignias-evaluaciones" className="w-full space-y-8 scroll-mt-24">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-5 sm:p-10 bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 text-white overflow-hidden shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Cátedra de Biodiversidad de Colombia</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Insignias Oficiales, Evaluaciones y Diplomas Digitales
            </h2>

            <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
              Pon a prueba tus conocimientos sobre fauna, flora y ecosistemas endémicos de Colombia. Supera los 5 niveles pedagógicos, desbloquea las insignias y obtén tus diplomas oficiales acreditados por BioExplora.
            </p>
          </div>

          {/* Session & Progress Status Widget */}
          <div className="w-full md:w-auto p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 flex flex-col items-start gap-3">
            {user ? (
              <div className="space-y-2 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500 text-stone-950 font-black flex items-center justify-center text-sm uppercase">
                    {user.username.substring(0, 2)}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block">
                      Sesión Institucional Activa
                    </span>
                    <h4 className="text-sm font-black text-white">{user.username}</h4>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10 text-xs">
                  <span className="text-stone-300">Insignias logradas:</span>
                  <span className="font-black text-amber-400">
                    {earnedBadgesCount} de 5
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 w-full">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                  <Award className="w-4 h-4" />
                  <span>Modo Estudiante · Acceso Libre</span>
                </div>
                <p className="text-[11px] text-stone-300 max-w-[240px]">
                  Supera cada nivel para desbloquear tu insignia e ingresar tu nombre completo antes de emitir tu diploma oficial.
                </p>
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10 text-xs">
                  <span className="text-stone-300">Insignias desbloqueadas:</span>
                  <span className="font-black text-amber-400">
                    {earnedBadgesCount} de 5
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-2 border-t border-white/10 pt-5 sm:pt-6">
          <button
            type="button"
            onClick={() => setActiveTab('badges')}
            className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-white text-emerald-950 shadow-lg'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Mis Insignias y Diplomas ({earnedBadgesCount}/5)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluations')}
            className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'evaluations'
                ? 'bg-white text-emerald-950 shadow-lg'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Trivias y Evaluaciones por Nivel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-emerald-950 shadow-lg'
                : 'bg-white/10 text-white/90 hover:bg-white/20'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Historial de Intentos ({localAttempts.length})</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: MIS INSIGNIAS Y DIPLOMAS                                */}
      {/* ============================================================== */}
      {activeTab === 'badges' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {BADGE_DEFINITIONS.map((badge) => {
              const { status, unlockedAt, progressPercent } = getBadgeStatus(badge.level);
              return (
                <div
                  key={badge.id}
                  className="p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-w-0"
                >
                  <BadgeMedal
                    badge={badge}
                    status={status}
                    progressPercent={progressPercent}
                    unlockedAt={unlockedAt}
                    size="md"
                    onClick={() => {
                      if (status === 'unlocked') {
                        handleOpenDiplomaFlow(badge.level);
                      } else {
                        handleStartEvaluation(badge.level);
                      }
                    }}
                  />

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                    {status === 'unlocked' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenDiplomaFlow(badge.level)}
                        className="w-full py-2 px-2.5 rounded-xl text-[11px] font-black bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Obtener Diploma</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartEvaluation(badge.level)}
                        className="w-full py-2 px-2.5 rounded-xl text-[11px] font-bold bg-stone-100 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-stone-700 dark:text-stone-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Presentar Examen</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Level Requirements Detailed Table */}
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <h3 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Reglamento y Requisitos para el Desbloqueo de Insignias</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Nivel</th>
                    <th className="py-3 px-4">Enfoque Pedagógico</th>
                    <th className="py-3 px-4 text-center">Preguntas</th>
                    <th className="py-3 px-4 text-center">Mínimo Aprobatorio</th>
                    <th className="py-3 px-4 text-center">Reconocimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                  {BADGE_DEFINITIONS.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-black">{b.levelName}</td>
                      <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                        {b.focusArea}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">{b.totalQuestions}</td>
                      <td className="py-3 px-4 text-center font-black text-emerald-600 dark:text-emerald-400">
                        {b.minScorePercent}%
                      </td>
                      <td className="py-3 px-4 text-center font-semibold">
                        Medalla + Diploma Oficial
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: TRIVIAS Y EVALUACIONES POR NIVEL                        */}
      {/* ============================================================== */}
      {activeTab === 'evaluations' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Level Switcher Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {BADGE_DEFINITIONS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => handleStartEvaluation(b.level)}
                className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer ${
                  selectedLevel === b.level
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300'
                }`}
              >
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                    {b.level}
                  </span>
                  <h4 className="text-xs font-black text-stone-900 dark:text-stone-100 truncate">
                    {b.title}
                  </h4>
                </div>
                <div className="mt-2 text-[10px] text-stone-500 flex items-center justify-between">
                  <span>{b.totalQuestions} Qs</span>
                  <span className="font-bold text-emerald-600">{b.minScorePercent}% min.</span>
                </div>
              </button>
            ))}
          </div>

          {/* Active Quiz Area */}
          {!isCompleted ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg space-y-6">
              {/* Progress and Level Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {currentBadgeDef.levelName}
                  </span>
                  <span className="text-stone-500">
                    Pregunta {currentQuestionIndex + 1} de {currentQuestions.length}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Current Question */}
              {currentQuestions[currentQuestionIndex] && (
                <div className="space-y-6">
                  <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                    {currentQuestions[currentQuestionIndex].question}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {currentQuestions[currentQuestionIndex].options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                      const isCorrect = optIdx === currentQuestions[currentQuestionIndex].correctIndex;

                      let btnStyle =
                        'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-800 dark:text-stone-200 hover:border-emerald-400 hover:bg-emerald-50/40';

                      if (showExplanation) {
                        if (isCorrect) {
                          btnStyle =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30';
                        } else if (isSelected) {
                          btnStyle =
                            'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/30';
                        } else {
                          btnStyle = 'border-stone-200 dark:border-stone-800 opacity-50';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(optIdx)}
                          disabled={showExplanation}
                          className={`w-full p-4 rounded-2xl text-left border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 cursor-pointer disabled:cursor-default ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 text-center leading-6 text-xs font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{option}</span>
                          </div>

                          {showExplanation && (
                            <div>
                              {isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                              )}
                              {!isCorrect && isSelected && (
                                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Pedagogical Explanation Box */}
                  {showExplanation && (
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
                        <HelpCircle className="w-4 h-4" />
                        <span>Fundamentación Biológica:</span>
                      </div>
                      <p className="text-xs text-emerald-900/90 dark:text-emerald-200 leading-relaxed">
                        {currentQuestions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}

                  {/* Next / Finish Button */}
                  {showExplanation && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <span>
                          {currentQuestionIndex < currentQuestions.length - 1
                            ? 'Siguiente Pregunta'
                            : 'Finalizar y Calificar'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Results & Diploma Presentation */
            <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                {evaluationResult?.approved ? (
                  <Award className="w-10 h-10 text-amber-300" />
                ) : (
                  <RotateCcw className="w-10 h-10" />
                )}
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  {currentBadgeDef.levelName}
                </span>

                <h3 className="text-2xl font-black text-stone-900 dark:text-stone-100">
                  {evaluationResult?.approved
                    ? '¡Felicitaciones! Has Superado la Evaluación'
                    : 'Sigue explorando y vuelve a intentarlo'}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                  Obtuviste{' '}
                  <strong className="text-stone-900 dark:text-white">
                    {evaluationResult?.correctCount} aciertos
                  </strong>{' '}
                  de {evaluationResult?.totalCount} preguntas ({evaluationResult?.scorePercent}%).
                  {evaluationResult?.approved
                    ? ` Superaste el mínimo requerido de ${currentBadgeDef.minScorePercent}%.`
                    : ` Se requiere mínimo ${currentBadgeDef.minScorePercent}% para obtener la insignia.`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {evaluationResult?.approved && (
                  <button
                    type="button"
                    onClick={() => {
                      if (evaluationResult.diploma) {
                        requestDiplomaWithNamePrompt(evaluationResult.diploma);
                      } else {
                        handleOpenDiplomaFlow(selectedLevel);
                      }
                    }}
                    className="py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Emitir y Ver mi Diploma Oficial</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleStartEvaluation(selectedLevel)}
                  className="py-3 px-6 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reintentar Evaluación</span>
                </button>
              </div>

              {/* Local Progress Confirmation */}
              {!user && evaluationResult?.approved && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 max-w-md mx-auto text-left flex items-start gap-3">
                  <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                    <p className="font-bold">¡Insignia desbloqueada en este dispositivo!</p>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                      Tu avance queda guardado localmente para que continúes hacia el siguiente nivel y descargues tu diploma oficial con tu nombre.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: HISTORIAL DE INTENTOS                                   */}
      {/* ============================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 min-h-[260px] sm:min-h-[420px]"
          >
            <h3 className="text-base font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>Registro Histórico de Intentos y Evaluaciones</span>
            </h3>

            {localAttempts.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                Aún no has presentado evaluaciones. Selecciona un nivel en la pestaña de trivias para comenzar tu primera evaluación.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {localAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                          {attempt.level.toUpperCase()}
                        </span>
                        <h4 className="text-sm font-black text-stone-900 dark:text-stone-100">
                          {attempt.levelName}
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {new Date(attempt.timestamp).toLocaleString('es-CO')} ·{' '}
                        {attempt.correctAnswers} de {attempt.totalQuestions} aciertos
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                          attempt.approved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {attempt.scorePercentage}% ·{' '}
                        {attempt.approved ? 'Aprobada' : 'No aprobada'}
                      </span>

                      {attempt.approved && (
                        <button
                          type="button"
                          onClick={() => handleOpenDiplomaFlow(attempt.level)}
                          className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                          title="Emitir y ver diploma"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PRE-DIPLOMA MODAL: ASK FOR RECIPIENT NAME BEFORE ISSUING       */}
      {/* ============================================================== */}
      {pendingDiploma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setPendingDiploma(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-2 pt-1">
              <BioExploraLogo variant="crest" size="md" />
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                Emisión de Diploma Oficial
              </span>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 dark:text-white leading-tight">
                ¿A nombre de quién emitimos tu diploma?
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Ingresa tu nombre completo antes de generar el certificado. Aparecerá impreso directamente en tu diploma oficial de{' '}
                <strong className="text-emerald-700 dark:text-emerald-400">
                  {pendingDiploma.badgeName}
                </strong>
                .
              </p>
            </div>

            <form onSubmit={handleConfirmRecipientAndShowDiploma} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="diploma-recipient-fullname"
                  className="block text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300"
                >
                  Nombre para el diploma
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="diploma-recipient-fullname"
                    type="text"
                    value={recipientNameInput}
                    onChange={(e) => {
                      setRecipientNameInput(e.target.value);
                      if (recipientNameError) setRecipientNameError(null);
                    }}
                    placeholder="Escribe aquí tu nombre y apellidos..."
                    autoFocus
                    maxLength={70}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-bold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {recipientNameError && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {recipientNameError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingDiploma(null)}
                  className="px-4 py-3 rounded-2xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generar mi Diploma</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Issued Digital Diploma Modal */}
      {selectedDiploma && (
        <DigitalDiplomaModal
          diploma={selectedDiploma}
          isOpen={!!selectedDiploma}
          onClose={() => setSelectedDiploma(null)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
