import React, { useState } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  Award, 
  ArrowRight,
  BrainCircuit,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/quizData';
import { QuizResult } from '../types';

interface InteractiveQuizProps {
  isDarkMode: boolean;
}

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ isDarkMode }) => {
  const [participantName, setParticipantName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('bioexplora_student_name') || '';
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [recordedAnswers, setRecordedAnswers] = useState<Array<{
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>>([]);

  const currentQ: QuizQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setRecordedAnswers(prev => [
      ...prev,
      {
        question: currentQ.question,
        selectedAnswer: currentQ.options[selectedOption],
        correctAnswer: currentQ.options[currentQ.correctIndex],
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      
      // Persist trivia result to localStorage
      const finalScore = score + (selectedOption === currentQ.correctIndex ? 0 : 0); // already updated
      const result: QuizResult = {
        id: `trivia-${Date.now()}`,
        timestamp: new Date().toISOString(),
        participantName: participantName.trim() || 'Participante Ciudadano',
        activityType: 'trivia',
        activityName: 'Trivia: ¿Cuánto sabes sobre Colombia?',
        totalQuestions: QUIZ_QUESTIONS.length,
        correctAnswers: score,
        scorePercentage: Math.round((score / QUIZ_QUESTIONS.length) * 100),
        questionsSummary: recordedAnswers,
      };

      try {
        const stored = localStorage.getItem('bioexplora_trivia_results');
        const list: QuizResult[] = stored ? JSON.parse(stored) : [];
        list.unshift(result);
        localStorage.setItem('bioexplora_trivia_results', JSON.stringify(list));
      } catch (e) {
        console.error('Failed to store trivia result:', e);
      }

      // Sync with backend activities store
      try {
        fetch('/api/activities/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'quiz', data: result }),
        }).catch(() => {});
      } catch {}

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#38bdf8', '#8ce2b6'],
        });
      } catch {
        // safe fallback
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setRecordedAnswers([]);
    setIsQuizCompleted(false);
  };

  return (
    <section id="trivia" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
          <BrainCircuit className="w-4 h-4" />
          <span>Juego Interactivo</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#163e2a] dark:text-white">
          ¿Cuánto sabes sobre Colombia?
        </h2>

        <p className={`text-sm sm:text-base leading-relaxed ${
          isDarkMode ? 'text-stone-300' : 'text-stone-600'
        }`}>
          Pon a prueba tus conocimientos sobre nuestras especies endémicas y descubre datos sorprendentes con este breve cuestionario interactivo.
        </p>
      </div>

      {/* Main Quiz Box */}
      <div className={`max-w-2xl mx-auto rounded-3xl border-2 overflow-hidden shadow-2xl transition-all ${
        isDarkMode 
          ? 'bg-[#12221b] border-[#254637]' 
          : 'bg-white border-[#d8eae0]'
      }`}>
        {!isQuizCompleted ? (
          <div>
            {/* Progress bar */}
            <div className="bg-stone-200 dark:bg-stone-800 h-2 w-full">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Question Count and Tag */}
              <div className="flex items-center justify-between text-xs font-bold text-stone-500">
                <span className="text-emerald-600 dark:text-emerald-400 font-black">
                  Pregunta {currentQuestionIndex + 1} de {QUIZ_QUESTIONS.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                  {currentQ.speciesRelated}
                </span>
              </div>

              {/* Optional participant name on question 1 */}
              {currentQuestionIndex === 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50">
                  <User className="w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setParticipantName(val);
                      if (val.trim()) {
                        localStorage.setItem('bioexplora_student_name', val.trim());
                      }
                    }}
                    placeholder="Tu nombre o apodo (aparecerá en tu diploma y reportes)"
                    className="w-full text-xs bg-transparent focus:outline-none text-stone-800 dark:text-stone-200 placeholder-stone-400"
                  />
                </div>
              )}

              {/* Question Text */}
              <h3 className="text-lg sm:text-xl font-black text-[#163e2a] dark:text-white leading-snug">
                {currentQ.question}
              </h3>

              {/* Options list */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let optionStyle = isDarkMode ? 'bg-[#0d1a14] border-[#1d382b] text-stone-200' : 'bg-[#f8faf8] border-[#e2eee6] text-stone-800';

                  if (selectedOption === idx) {
                    optionStyle = isDarkMode
                      ? 'border-emerald-400 bg-emerald-500/20 text-white font-bold'
                      : 'border-emerald-600 bg-emerald-50 text-stone-900 font-bold';
                  }

                  if (isAnswerSubmitted) {
                    if (idx === currentQ.correctIndex) {
                      optionStyle = 'border-emerald-500 bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold';
                    } else if (selectedOption === idx) {
                      optionStyle = 'border-rose-500 bg-rose-500/20 text-rose-800 dark:text-rose-300';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optionStyle} ${
                        !isAnswerSubmitted ? 'hover:border-emerald-500 cursor-pointer' : 'cursor-default'
                      }`}
                    >
                      <span>{opt}</span>
                      {isAnswerSubmitted && idx === currentQ.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {isAnswerSubmitted && selectedOption === idx && idx !== currentQ.correctIndex && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation note when answered */}
              {isAnswerSubmitted && (
                <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                  selectedOption === currentQ.correctIndex 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                }`}>
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Dato Biológico Explicativo:</span>
                  </p>
                  <p>{currentQ.explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                {!isAnswerSubmitted ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleConfirmAnswer}
                    className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-black text-white transition-all shadow-md ${
                      selectedOption !== null 
                        ? 'bg-[#196b44] hover:bg-[#145a38] cursor-pointer' 
                        : 'bg-stone-300 dark:bg-stone-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    Confirmar Respuesta
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-black bg-[#196b44] hover:bg-[#145a38] text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>{currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'Siguiente Pregunta' : 'Ver Resultados'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Final Score Card */
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                ¡Trivia Registrada con Éxito!
              </span>
              <h4 className="text-2xl sm:text-3xl font-black text-[#163e2a] dark:text-white">
                Tu puntaje: {score} de {QUIZ_QUESTIONS.length} aciertos ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-300 max-w-md mx-auto pt-1">
                {score === 5
                  ? '¡Impresionante! Tienes alma de biólogo y un conocimiento excepcional de las especies endémicas colombianas.'
                  : score >= 3
                  ? '¡Muy buen trabajo! Conoces aspectos clave sobre nuestra biodiversidad. Sigue explorando para convertirte en embajador de la naturaleza.'
                  : '¡Buen intento! Cada especie nueva que aprendes a conocer es un paso para proteger el tesoro natural de Colombia.'}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRestartQuiz}
                className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#196b44] hover:bg-[#145a38] text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Intentar de nuevo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
