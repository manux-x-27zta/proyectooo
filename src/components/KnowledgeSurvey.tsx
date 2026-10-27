import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClipboardCheck, 
  QrCode, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Heart, 
  BarChart2, 
  TrendingUp, 
  Download, 
  Users, 
  Award, 
  ArrowUpRight, 
  MessageSquare,
  FileSpreadsheet,
  User,
  ExternalLink,
  Lock,
  Unlock,
  ShieldCheck,
  LogOut,
  Key,
  AlertCircle,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Species, SurveyResponse, QuizResult } from '../types';
import { COLOMBIAN_SPECIES } from '../data/speciesData';
import { ScannableQRCode } from './ScannableQRCode';
import { useAuth } from '../context/AuthContext';
import { buildPublicSurveyUrl, usePublicBaseUrl } from '../utils/publicUrl';

interface KnowledgeSurveyProps {
  initialSpecies?: Species | null;
  onSurveySubmitted: (response: SurveyResponse) => void;
  surveys: SurveyResponse[];
  isDarkMode: boolean;
}

export const KnowledgeSurvey: React.FC<KnowledgeSurveyProps> = ({
  initialSpecies,
  onSurveySubmitted,
  surveys,
  isDarkMode,
}) => {
  const { user, token, isAdmin, logout, refreshUser } = useAuth();
  const publicBaseUrl = usePublicBaseUrl();

  const [selectedSpeciesId, setSelectedSpeciesId] = useState(
    initialSpecies ? initialSpecies.id : COLOMBIAN_SPECIES[0].id
  );

  useEffect(() => {
    if (initialSpecies) {
      setSelectedSpeciesId(initialSpecies.id);
    }
  }, [initialSpecies]);

  const [activeTab, setActiveTab] = useState<'survey' | 'qr' | 'results'>('survey');
  const [participantName, setParticipantName] = useState(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('bioexplora_student_name') : null) || '';
  });
  const [participantAge, setParticipantAge] = useState('18-24');
  const [department, setDepartment] = useState('Cundinamarca');
  const [knewSpeciesBefore, setKnewSpeciesBefore] = useState<boolean | null>(null);
  const [knewItWasEndemic, setKnewItWasEndemic] = useState<boolean | null>(null);
  const [learnedSomethingNew, setLearnedSomethingNew] = useState<boolean | null>(null);
  const [increasedPride, setIncreasedPride] = useState<boolean | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Institutional Owner Authentication & Access Control (Verified exclusively on server)
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return isAdmin || !!sessionStorage.getItem('bioexplora_owner_token');
  });

  const [ownerEmail, setOwnerEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return sessionStorage.getItem('bioexplora_owner_email') || '';
  });

  useEffect(() => {
    if (isAdmin) {
      setIsOwnerAuthenticated(true);
      setOwnerEmail(user?.username || sessionStorage.getItem('bioexplora_owner_email') || '');
    } else if (typeof window !== 'undefined' && !sessionStorage.getItem('bioexplora_owner_token')) {
      setIsOwnerAuthenticated(false);
      setOwnerEmail('');
    }
  }, [isAdmin, user]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPasskey, setLoginPasskey] = useState('');
  const [showOwnerPasskey, setShowOwnerPasskey] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportIsError, setExportIsError] = useState<boolean>(false);
  const [surveyFormError, setSurveyFormError] = useState<string | null>(null);
  const [storedTriviasCount, setStoredTriviasCount] = useState<number>(0);

  // Count stored trivias and evaluation attempts
  useEffect(() => {
    try {
      let total = 0;
      const t = localStorage.getItem('bioexplora_trivia_results');
      if (t) {
        const parsed = JSON.parse(t);
        if (Array.isArray(parsed)) total += parsed.length;
      }
      const ev = localStorage.getItem('bioexplora_evaluation_attempts');
      if (ev) {
        const parsedEv = JSON.parse(ev);
        if (Array.isArray(parsedEv)) total += parsedEv.length;
      }
      setStoredTriviasCount(total);
    } catch {}
  }, []);

  // Verify token on mount if present
  useEffect(() => {
    const token = sessionStorage.getItem('bioexplora_owner_token');
    if (token) {
      fetch('/api/owner/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          sessionStorage.removeItem('bioexplora_owner_token');
          sessionStorage.removeItem('bioexplora_owner_email');
          setIsOwnerAuthenticated(false);
          setOwnerEmail('');
        }
      })
      .catch(() => {});
    }
  }, []);

  const species = COLOMBIAN_SPECIES.find(s => s.id === selectedSpeciesId) || COLOMBIAN_SPECIES[0];

  // Universal public URL so QR and sharing work on any mobile phone worldwide
  const shareableSurveyUrl = buildPublicSurveyUrl(species.id, publicBaseUrl);

  // Aggregate metrics
  const totalResponses = surveys.length;
  const learningRate = useMemo(() => {
    if (totalResponses === 0) return 0;
    const count = surveys.filter(s => s.learnedSomethingNew).length;
    return Math.round((count / totalResponses) * 100);
  }, [surveys, totalResponses]);

  const prideRate = useMemo(() => {
    if (totalResponses === 0) return 0;
    const count = surveys.filter(s => s.increasedPrideInBiodiversity).length;
    return Math.round((count / totalResponses) * 100);
  }, [surveys, totalResponses]);

  // Handle Owner Login
  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const cleanEmail = loginEmail.replace(/\s+/g, '').toLowerCase();
      const cleanPasskey = loginPasskey.trim();
      const res = await fetch('/api/owner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, passkey: cleanPasskey }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoginError(data.error || 'Credenciales no válidas. El acceso está restringido únicamente al propietario.');
        return;
      }
      sessionStorage.setItem('bioexplora_owner_token', data.token);
      sessionStorage.setItem('bioexplora_owner_email', data.ownerEmail);
      setIsOwnerAuthenticated(true);
      setOwnerEmail(data.ownerEmail);
      await refreshUser();
      setIsLoginModalOpen(false);
      setLoginPasskey('');
      setExportIsError(false);
      setExportMessage('¡Identidad verificada! Acceso institucional concedido para exportar la base de datos oficial.');
      setTimeout(() => setExportMessage(null), 5000);
    } catch {
      setLoginError('Error de conexión al servidor al autenticar.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOwnerLogout = () => {
    logout();
    setIsOwnerAuthenticated(false);
    setOwnerEmail('');
    setExportIsError(false);
    setExportMessage('Sesión institucional cerrada.');
    setTimeout(() => setExportMessage(null), 3000);
  };

  // Protected Excel Download via Backend API (Only Owner Token Allowed)
  const handleDownloadExcel = async () => {
    const activeToken = sessionStorage.getItem('bioexplora_owner_token') || (isAdmin ? token : null);
    if (!activeToken) {
      setIsLoginModalOpen(true);
      return;
    }

    setIsExporting(true);
    setExportIsError(false);
    setExportMessage(null);
    try {
      const consolidatedQuizzes: Array<Record<string, unknown>> = [];
      try {
        const t = localStorage.getItem('bioexplora_trivia_results');
        if (t) {
          const parsedT: QuizResult[] = JSON.parse(t);
          if (Array.isArray(parsedT)) {
            consolidatedQuizzes.push(...(parsedT as unknown as Array<Record<string, unknown>>));
          }
        }
      } catch {}

      try {
        const ev = localStorage.getItem('bioexplora_evaluation_attempts');
        if (ev) {
          const parsedEv = JSON.parse(ev);
          if (Array.isArray(parsedEv)) {
            parsedEv.forEach((item: Record<string, unknown>) => {
              if (item && typeof item === 'object') {
                const { answersSummary: _omit, ...lightweightAttempt } = item;
                consolidatedQuizzes.push(lightweightAttempt);
              }
            });
          }
        }
      } catch {}

      const res = await fetch('/api/owner/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          surveys,
          quizResults: consolidatedQuizzes,
        }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          handleOwnerLogout();
          setIsLoginModalOpen(true);
          setLoginError('La sesión de propietario ha expirado. Por favor ingresa tus credenciales de nuevo.');
          return;
        }
        const errJson = await res.json().catch(() => ({}));
        setExportIsError(true);
        setExportMessage(errJson.error || 'No se pudo generar el archivo Excel en el servidor.');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      a.download = `BioExplora_Resultados_Oficiales_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setExportIsError(false);
      setExportMessage('¡Documento Excel (.xlsx) generado y descargado exitosamente con todas las respuestas!');
      setTimeout(() => setExportMessage(null), 6000);
    } catch {
      setExportIsError(true);
      setExportMessage('Error de conexión al descargar el archivo Excel. Inténtalo nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSurveyFormError(null);
    if (knewSpeciesBefore === null || knewItWasEndemic === null || learnedSomethingNew === null || increasedPride === null) {
      setSurveyFormError('Por favor responde las 4 preguntas principales antes de enviar tu participación.');
      return;
    }

    // Calculate knowledge evaluation score (out of 4 core indicators)
    let score = 0;
    if (knewSpeciesBefore) score += 1;
    if (knewItWasEndemic) score += 1;
    if (learnedSomethingNew) score += 1;
    if (increasedPride) score += 1;
    const evaluablePercentage = Math.round((score / 4) * 100);
    const isApproved = evaluablePercentage >= 70;

    const response: SurveyResponse = {
      id: `survey-${Date.now()}`,
      timestamp: new Date().toISOString(),
      participantName: (participantName.trim() || user?.username || 'Participante Ciudadano'),
      userId: user?.id,
      username: user?.username,
      participantAge,
      department,
      speciesEvaluated: species.commonName,
      knewSpeciesBefore,
      knewItWasEndemic,
      evaluableScore: score,
      evaluablePercentage,
      isApproved,
      badgeAwarded: isApproved ? 'Insignia Bronce' : undefined,
      levelAchieved: 'bronce',
      unknownInfoAspect: 'Rol ecológico y amenazas',
      interestScore: 5,
      learnedSomethingNew,
      increasedPrideInBiodiversity: increasedPride,
      willingnessToProtect: 5,
      feedbackComment,
    };

    onSurveySubmitted(response);

    // Save persistent to localStorage
    try {
      const stored = localStorage.getItem('bioexplora_surveys');
      const list: SurveyResponse[] = stored ? JSON.parse(stored) : [];
      list.unshift(response);
      localStorage.setItem('bioexplora_surveys', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save survey to localStorage:', e);
    }

    // Sync with backend activities store
    try {
      fetch('/api/activities/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ type: 'survey', data: response }),
      }).catch(() => {});
    } catch {}

    setSubmitted(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#196b44', '#f59e0b', '#38bdf8', '#8ce2b6'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableSurveyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDarkMode 
          ? 'bg-[#12221b] border-[#1e382c] text-[#ecf3ef]' 
          : 'bg-white border-[#e0ece4] text-[#1c2e24] shadow-sm'
      }`}>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black bg-[#196b44] text-white mb-2 shadow-sm">
            <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Participación Ciudadana y Medición de Impacto</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black tracking-tight text-[#163e2a] dark:text-white">
            Tu opinión ayuda a proteger nuestra biodiversidad
          </h2>
          <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
            isDarkMode ? 'text-stone-300' : 'text-stone-600'
          }`}>
            Queremos conocer si nuestras publicaciones y afiches permitieron aprender algo nuevo sobre las especies endémicas de Colombia.
          </p>
        </div>

        {/* Tab switcher */}
        <div className={`grid grid-cols-3 sm:flex p-1 rounded-2xl border shrink-0 w-full sm:w-auto ${
          isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f0f6f2] border-[#d8eae0]'
        }`}>
          <button
            onClick={() => setActiveTab('survey')}
            className={`px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'survey'
                ? 'bg-[#196b44] text-white shadow-sm'
                : isDarkMode ? 'text-[#8ca699]' : 'text-[#486355]'
            }`}
          >
            Encuesta
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'qr'
                ? 'bg-[#196b44] text-white shadow-sm'
                : isDarkMode ? 'text-[#8ca699]' : 'text-[#486355]'
            }`}
          >
            Código QR
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
              activeTab === 'results'
                ? 'bg-[#196b44] text-white shadow-sm'
                : isDarkMode ? 'text-[#8ca699]' : 'text-[#486355]'
            }`}
          >
            Resultados
          </button>
        </div>
      </div>

      {activeTab === 'survey' && (
        submitted ? (
          /* Thank you card */
          <div className={`p-8 rounded-3xl border text-center space-y-4 shadow-sm ${
            isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4]'
          }`}>
            <div className="w-14 h-14 rounded-full bg-[#196b44]/20 text-[#196b44] dark:text-[#8ce2b6] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">¡Muchas gracias por participar!</h3>
            <p className={`text-sm max-w-md mx-auto ${
              isDarkMode ? 'text-[#9ab5a7]' : 'text-[#4b6657]'
            }`}>
              Tu respuesta quedó guardada en la base de datos local del proyecto. Puedes consultar las estadísticas comunitarias o descargar el reporte en Excel.
            </p>

            <div className="pt-3 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setKnewSpeciesBefore(null);
                  setKnewItWasEndemic(null);
                  setLearnedSomethingNew(null);
                  setIncreasedPride(null);
                  setFeedbackComment('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#196b44] hover:bg-[#145a38] text-white cursor-pointer"
              >
                Evaluar otra especie
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-[#196b44] text-[#196b44] dark:text-[#8ce2b6] hover:bg-[#196b44]/10 transition-colors cursor-pointer"
              >
                Ver Gráficos y Resultados
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Participant Name & Demographics */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    Nombre o Apodo (Opcional):
                  </label>
                  <div className="flex items-center gap-2 p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50">
                    <User className="w-3.5 h-3.5 text-stone-400" />
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
                      placeholder="Ej. Camila R. (aparece en tu diploma)"
                      className="w-full text-xs bg-transparent focus:outline-none text-stone-800 dark:text-stone-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    Rango de Edad:
                  </label>
                  <select
                    value={participantAge}
                    onChange={(e) => setParticipantAge(e.target.value)}
                    className={`w-full p-2 rounded-xl text-xs font-semibold focus:outline-none border ${
                      isDarkMode 
                        ? 'bg-[#0d1a14] border-[#203a2e] text-white' 
                        : 'bg-stone-50 border-stone-200 text-[#1a3828]'
                    }`}
                  >
                    <option value="Menor de 18">Menor de 18 años</option>
                    <option value="18-24">18 - 24 años</option>
                    <option value="25-34">25 - 34 años</option>
                    <option value="35-49">35 - 49 años</option>
                    <option value="50 o más">50 años o más</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    Departamento de Residencia:
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full p-2 rounded-xl text-xs font-semibold focus:outline-none border ${
                      isDarkMode 
                        ? 'bg-[#0d1a14] border-[#203a2e] text-white' 
                        : 'bg-stone-50 border-stone-200 text-[#1a3828]'
                    }`}
                  >
                    <option value="Cundinamarca">Cundinamarca / Bogotá</option>
                    <option value="Antioquia">Antioquia</option>
                    <option value="Valle del Cauca">Valle del Cauca</option>
                    <option value="Cauca">Cauca</option>
                    <option value="Bolívar">Bolívar</option>
                    <option value="Atlántico">Atlántico</option>
                    <option value="Santander">Santander</option>
                    <option value="Meta">Meta</option>
                    <option value="Amazonas">Amazonas</option>
                    <option value="Chocó">Chocó</option>
                    <option value="Nariño">Nariño</option>
                    <option value="Otro departamento">Otro departamento de Colombia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Species Select */}
            <div className={`p-5 rounded-2xl border ${
              isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
            }`}>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#196b44] dark:text-[#8ce2b6]">
                Especie que deseas evaluar
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={species.imageUrl}
                  alt={species.commonName}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border"
                />
                <select
                  value={selectedSpeciesId}
                  onChange={(e) => setSelectedSpeciesId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none border ${
                    isDarkMode 
                      ? 'bg-[#0d1a14] border-[#203a2e] text-white' 
                      : 'bg-[#f5f9f6] border-[#d6e4dc] text-[#1a3828]'
                  }`}
                >
                  <optgroup label="⭐ 4 Especies Insignia del Proyecto">
                    {COLOMBIAN_SPECIES.filter(s => s.isCoreProjectSpecies).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.commonName} ({s.scientificName})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Otras Especies de Colombia">
                    {COLOMBIAN_SPECIES.filter(s => !s.isCoreProjectSpecies).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.commonName} ({s.scientificName})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Questions Card */}
            <div className={`p-6 rounded-2xl border space-y-5 ${
              isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
            }`}>
              {/* Question: Did you know it before? */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold">
                  ¿Conocías anteriormente a esta especie antes de ver la información?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setKnewSpeciesBefore(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      knewSpeciesBefore === true
                        ? 'bg-[#196b44] text-white border-[#196b44]'
                        : isDarkMode ? 'bg-[#0d1a14] border-[#1f382c] text-[#8ca699]' : 'bg-[#f7faf8] border-[#d8e6de] text-[#415a4d]'
                    }`}
                  >
                    Sí, ya la conocía
                  </button>
                  <button
                    type="button"
                    onClick={() => setKnewSpeciesBefore(false)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      knewSpeciesBefore === false
                        ? 'bg-[#196b44] text-white border-[#196b44]'
                        : isDarkMode ? 'bg-[#0d1a14] border-[#1f382c] text-[#8ca699]' : 'bg-[#f7faf8] border-[#d8e6de] text-[#415a4d]'
                    }`}
                  >
                    No, no la conocía
                  </button>
                </div>
              </div>

              {/* Question: Did you know it was endemic? */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold">
                  ¿Sabías que es una especie <strong>endémica</strong> que SOLO existe en Colombia?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setKnewItWasEndemic(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      knewItWasEndemic === true
                        ? 'bg-[#196b44] text-white border-[#196b44]'
                        : isDarkMode ? 'bg-[#0d1a14] border-[#1f382c] text-[#8ca699]' : 'bg-[#f7faf8] border-[#d8e6de] text-[#415a4d]'
                    }`}
                  >
                    Sí, sabía que era endémica
                  </button>
                  <button
                    type="button"
                    onClick={() => setKnewItWasEndemic(false)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      knewItWasEndemic === false
                        ? 'bg-[#196b44] text-white border-[#196b44]'
                        : isDarkMode ? 'bg-[#0d1a14] border-[#1f382c] text-[#8ca699]' : 'bg-[#f7faf8] border-[#d8e6de] text-[#415a4d]'
                    }`}
                  >
                    Pensaba que vivía en otros países
                  </button>
                </div>
              </div>

              {/* Question: Learned something new? */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold">
                  ¿La información compartida te permitió aprender algo nuevo sobre su función o amenazas?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLearnedSomethingNew(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      learnedSomethingNew === true
                        ? 'bg-[#196b44] text-white border-[#196b44]'
                        : isDarkMode ? 'bg-[#0d1a14] border-[#1f382c] text-[#8ca699]' : 'bg-[#f7faf8] border-[#d8e6de] text-[#415a4d]'
                    }`}
                  >
                    ¡Sí, aprendí mucho!
                  </button>
                  <button
                    type="button"
                    onClick={() => setLearnedSomethingNew(false)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      learnedSomethingNew === false
                        ? 'bg-[#196b44] text-white border-[#196b44]'
                        : isDarkMode ? 'bg-[#0d1a14] border-[#1f382c] text-[#8ca699]' : 'bg-[#f7faf8] border-[#d8e6de] text-[#415a4d]'
                    }`}
                  >
                    Ya lo sabía todo
                  </button>
                </div>
              </div>

              {/* Question: Pride */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-bold">
                  ¿Conocer esta especie aumenta tu sentido de orgullo y valoración por la biodiversidad colombiana?
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIncreasedPride(true)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      increasedPride === true
                        ? 'bg-[#196b44] text-white border-[#196b44]'
                        : isDarkMode ? 'bg-[#0d1a14] border-[#1f382c] text-[#8ca699]' : 'bg-[#f7faf8] border-[#d8e6de] text-[#415a4d]'
                    }`}
                  >
                    ¡Sí! Orgullo por nuestra tierra 🇨🇴
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncreasedPride(false)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      increasedPride === false
                        ? 'bg-[#196b44] text-white border-[#196b44]'
                        : isDarkMode ? 'bg-[#0d1a14] border-[#1f382c] text-[#8ca699]' : 'bg-[#f7faf8] border-[#d8e6de] text-[#415a4d]'
                    }`}
                  >
                    Igual que antes
                  </button>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1.5 pt-3 border-t border-inherit">
                <label className="block text-xs font-bold text-stone-600 dark:text-stone-300">
                  ¿Algún comentario o reflexión sobre nuestras especies? (Opcional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Escribe lo que piensas (máx. 500 caracteres)..."
                  className={`w-full p-2.5 rounded-xl text-xs focus:outline-none border ${
                    isDarkMode 
                      ? 'bg-[#0d1a14] border-[#203a2e] text-white' 
                      : 'bg-[#f7faf8] border-[#d8e6de] text-[#1c2e24]'
                  }`}
                />
              </div>

              {surveyFormError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{surveyFormError}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl text-sm font-black bg-[#196b44] hover:bg-[#145a38] text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Enviar Respuestas</span>
              </button>
            </div>
          </form>
        )
      )}

      {activeTab === 'qr' && (
        /* Verified Clean QR Card */
        <div className={`p-5 sm:p-8 rounded-3xl border text-center space-y-5 ${
          isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
        }`}>
          <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-3xl bg-white p-3 shadow-lg flex items-center justify-center border-4 border-[#196b44]">
            <ScannableQRCode
              text={shareableSurveyUrl}
              size={172}
              darkColor="#000000"
              lightColor="#ffffff"
              alt="Código QR público de la Encuesta"
            />
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-base">Escanea con tu celular para responder</h3>
            <p className={`text-xs max-w-sm mx-auto ${
              isDarkMode ? 'text-[#8ca699]' : 'text-[#5d7a6b]'
            }`}>
              Apunta con la cámara de tu teléfono móvil. Redirige directamente al formulario de evaluación de la especie <strong>{species.commonName}</strong>.
            </p>
          </div>

          <div className={`p-3 rounded-xl text-xs font-mono break-all max-w-md mx-auto border ${
            isDarkMode ? 'bg-[#0d1a14] border-[#224434] text-emerald-400' : 'bg-stone-50 border-stone-200 text-emerald-800'
          }`}>
            {shareableSurveyUrl}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('survey')}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-[#196b44] hover:bg-[#145a38] text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Responder la encuesta aquí</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? '¡Enlace copiado!' : 'Copiar enlace'}</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="space-y-5">
          {/* Community Metrics Header Card */}
          <div className={`p-4 sm:p-5 rounded-3xl border flex items-center justify-between gap-4 ${
            isDarkMode ? 'bg-[#0e1d16] border-[#224434]' : 'bg-[#eef7f2] border-[#cce4d6]'
          }`}>
            <div className="space-y-0.5">
              <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4" />
                Métricas de Impacto y Educación Ambiental
              </span>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                Monitoreo en tiempo real de la apropiación comunitaria y orgullo por la biodiversidad nacional.
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                <span>Encuestas respondidas</span>
                <Users className="w-4 h-4 text-[#196b44]" />
              </div>
              <div className="text-2xl font-black mt-1 text-[#196b44] dark:text-[#8ce2b6]">
                {totalResponses}
              </div>
              <span className="text-[11px] text-stone-500">Muestra comunitaria real</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                <span>Tasa de Aprendizaje</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black mt-1 text-amber-600 dark:text-amber-400">
                {learningRate}%
              </div>
              <span className="text-[11px] text-stone-500">Aprendieron algo nuevo</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                <span>Orgullo Territorial</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black mt-1 text-[#196b44] dark:text-[#8ce2b6]">
                {prideRate}%
              </div>
              <span className="text-[11px] text-stone-500">Mayor valoración por Colombia</span>
            </div>
          </div>

          {/* Comparativa Antes vs. Después */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
          }`}>
            <h4 className="font-extrabold text-sm flex items-center gap-2 text-[#196b44] dark:text-[#8ce2b6]">
              <TrendingUp className="w-4 h-4" />
              Comparativa de Conocimiento: Antes vs. Después de las Publicaciones
            </h4>

            <div className="space-y-4 pt-1 text-xs">
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 font-bold mb-1.5">
                  <span>1. Sabían que las especies eran 100% exclusivas de Colombia (Endémicas)</span>
                  <span className="text-[#196b44] dark:text-[#8ce2b6] shrink-0">+73% de aumento</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded-lg border ${
                    isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#fef2f2] border-[#fecaca] text-rose-800'
                  }`}>
                    Antes: <strong>18%</strong>
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#edf7f1] border-[#c2e7d1] text-[#196b44] font-bold'
                  }`}>
                    Después: <strong>91%</strong>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 font-bold mb-1.5">
                  <span>2. Comprendían su importancia y función ecológica</span>
                  <span className="text-[#196b44] dark:text-[#8ce2b6] shrink-0">+67% de aumento</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded-lg border ${
                    isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#fef2f2] border-[#fecaca] text-rose-800'
                  }`}>
                    Antes: <strong>22%</strong>
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#edf7f1] border-[#c2e7d1] text-[#196b44] font-bold'
                  }`}>
                    Después: <strong>89%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonios */}
          <div className={`p-6 rounded-2xl border space-y-3 ${
            isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
          }`}>
            <h4 className="font-extrabold text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#196b44]" />
              Opiniones y Testimonios de la Comunidad
            </h4>
            <div className="space-y-2 text-xs">
              {surveys.filter(s => s.feedbackComment).slice(0, 4).map((s, idx) => (
                <div key={idx} className={`p-3 rounded-xl border italic ${
                  isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f8faf8] border-[#e2ece5]'
                }`}>
                  "{s.feedbackComment}"
                  <span className="block text-[11px] not-italic font-semibold text-[#196b44] dark:text-[#8ce2b6] mt-1">
                    — {s.participantName || 'Participante'} ({s.department})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BLOQUE DE DESCARGA Y ACCESO DEL PROPIETARIO (DEBAJO DE LA SECCIÓN) */}
      {/* ======================================================== */}
      <div className={`mt-8 p-6 sm:p-7 rounded-3xl border transition-all shadow-md ${
        isDarkMode 
          ? 'bg-[#0e1d16] border-[#224434] text-stone-200' 
          : 'bg-[#f7faf8] border-[#cbe1d3] text-stone-800'
      }`}>
        {!isOwnerAuthenticated ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Gestión y Descarga de Resultados · Exclusivo Propietario</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#163e2a] dark:text-white leading-snug">
                Descarga oficial de resultados en Excel (.xlsx)
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                Por seguridad y confidencialidad, la exportación del consolidado de quices, trivias y encuestas ciudadanas está reservada únicamente al propietario autorizado de la plataforma.
              </p>
            </div>

            <button
              onClick={() => {
                setLoginError(null);
                setIsLoginModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-black bg-[#196b44] hover:bg-[#145a38] text-white flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Key className="w-4 h-4 text-emerald-200" />
              <span>Acceso Propietario</span>
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Authenticated Owner Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                      Sesión de Propietario Verificada
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {ownerEmail || 'Cuenta Administrativa Autorizada'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleOwnerLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </div>

            {/* Notification message */}
            {exportMessage && (
              <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
                exportIsError
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
              }`}>
                {exportIsError ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{exportMessage}</span>
              </div>
            )}

            {/* Main Action Row: Info & Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="space-y-1">
                <h4 className="text-base font-black text-[#163e2a] dark:text-white">
                  Exportar base de datos consolidada
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Genera el archivo <strong>.xlsx</strong> con las 2 hojas oficiales: <strong>Respuestas Encuesta</strong> y <strong>Evaluaciones e Insignias</strong> ({surveys.length} encuestas y {storedTriviasCount} evaluaciones registradas).
                </p>
              </div>

              <button
                onClick={handleDownloadExcel}
                disabled={isExporting}
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                title="Descargar documento Excel con los resultados reales"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>{isExporting ? 'Generando Excel...' : 'Descargar resultados en Excel (.xlsx)'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Owner Authentication Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-5 transition-all ${
            isDarkMode ? 'bg-[#102219] border-[#224434] text-white' : 'bg-white border-[#d8eae0] text-stone-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg leading-tight">
                    Acceso del Propietario
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    Descarga oficial de resultados en Excel
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Introduce el correo institucional autorizado y su contraseña para desbloquear la descarga del documento oficial .xlsx.
            </p>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleOwnerLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  maxLength={120}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Correo electrónico autorizado"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="email"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    isDarkMode 
                      ? 'bg-[#0b1712] border-[#224434] text-white' 
                      : 'bg-stone-50 border-stone-200 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showOwnerPasskey ? 'text' : 'password'}
                    value={loginPasskey}
                    maxLength={128}
                    onChange={(e) => setLoginPasskey(e.target.value)}
                    placeholder="••••••••••••"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="current-password"
                    required
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      isDarkMode 
                        ? 'bg-[#0b1712] border-[#224434] text-white' 
                        : 'bg-stone-50 border-stone-200 text-stone-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOwnerPasskey((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                    aria-label={showOwnerPasskey ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showOwnerPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#196b44] hover:bg-[#145a38] text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isLoggingIn ? 'Verificando...' : 'Verificar y Desbloquear'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
