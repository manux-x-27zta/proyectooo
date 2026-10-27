import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  FileSpreadsheet, 
  Award, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  Lock,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserAccount, BadgeLevel } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const { user, token, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [filterUser, setFilterUser] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterApproval, setFilterApproval] = useState<'all' | 'approved' | 'not_approved'>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'export'>('users');

  const fetchUsers = async () => {
    if (!token || !isAdmin) return;
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch {
      console.error('Failed to load admin users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchUsers();
    }
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  const handleDownloadExcel = async () => {
    if (!token || !isAdmin) {
      setFeedbackMsg({
        text: 'Acceso denegado: solo el propietario o administrador autorizado puede descargar los resultados.',
        type: 'error'
      });
      return;
    }

    setDownloadingExcel(true);
    setFeedbackMsg(null);

    try {
      // Collect local surveys from browser storage if present
      let localSurveys = [];
      try {
        const storedS = localStorage.getItem('bioexplora_surveys');
        if (storedS) localSurveys = JSON.parse(storedS);
      } catch {}

      const localTrivias: Array<Record<string, unknown>> = [];
      try {
        const storedT = localStorage.getItem('bioexplora_trivia_results');
        if (storedT) {
          const parsedT = JSON.parse(storedT);
          if (Array.isArray(parsedT)) localTrivias.push(...parsedT);
        }
      } catch {}

      try {
        const storedEv = localStorage.getItem('bioexplora_evaluation_attempts');
        if (storedEv) {
          const parsedEv = JSON.parse(storedEv);
          if (Array.isArray(parsedEv)) {
            parsedEv.forEach((item: Record<string, unknown>) => {
              if (item && typeof item === 'object') {
                const { answersSummary: _omit, ...lightweightAttempt } = item;
                localTrivias.push(lightweightAttempt);
              }
            });
          }
        }
      } catch {}

      const res = await fetch('/api/owner/export-excel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          surveys: localSurveys,
          quizResults: localTrivias,
          filterUser: filterUser.trim() || undefined,
          filterLevel: filterLevel !== 'all' ? filterLevel : undefined,
          filterApproval,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Error al generar la exportación en el servidor.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `BioExplora_Evaluaciones_Oficiales_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setFeedbackMsg({
        text: '¡Archivo Excel oficial (.xlsx) descargado exitosamente con ambas hojas de datos (Encuesta y Evaluaciones)!',
        type: 'success',
      });
      setTimeout(() => setFeedbackMsg(null), 6000);
    } catch (err: any) {
      setFeedbackMsg({
        text: err?.message || 'Error al descargar el archivo Excel.',
        type: 'error',
      });
    } finally {
      setDownloadingExcel(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (filterUser && !u.username.toLowerCase().includes(filterUser.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-stone-800 to-stone-950 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-stone-950">
                  Panel de Propietario
                </span>
                <span className="text-xs text-amber-200 font-medium">
                  {user?.username} (Admin)
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Gestión y Exportación Oficial de BioExplora
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Access Check Guard */}
        {!isAdmin ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-stone-800 dark:text-stone-100">
              Acceso Restringido
            </h4>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
              Esta sección y la descarga oficial de resultados en Excel están reservadas exclusivamente para la cuenta administrativa verificada de BioExplora.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs & Controls Bar */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === 'users'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Estudiantes y Cuentas ({users.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('export')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === 'export'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Descargar Excel Oficial</span>
                </button>
              </div>

              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition-all"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            {/* Notification alert banner */}
            {feedbackMsg && (
              <div className={`p-3 mx-6 mt-4 rounded-2xl text-xs flex items-center gap-2 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            {/* Tab 1: Users List */}
            {activeTab === 'users' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={filterUser}
                      onChange={e => setFilterUser(e.target.value)}
                      placeholder="Buscar por usuario..."
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    {filteredUsers.length} usuario(s) encontrado(s)
                  </span>
                </div>

                {loadingUsers ? (
                  <div className="py-12 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Cargando directorio de estudiantes...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 text-xs">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredUsers.map(u => (
                      <div 
                        key={u.id}
                        className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-800 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-sm uppercase">
                              {u.username.substring(0, 2)}
                            </div>
                            <div>
                              <h5 className="text-sm font-black text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                                {u.username}
                                {u.role === 'admin' && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                                    Admin
                                  </span>
                                )}
                              </h5>
                              <span className="text-[10px] text-stone-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Registrado: {new Date(u.createdAt).toLocaleDateString('es-CO')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Badges count & Diplomas count */}
                        <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-stone-200/60 dark:border-stone-800">
                          <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                            <span className="text-[10px] uppercase font-bold text-stone-500 block">
                              Insignias
                            </span>
                            <span className="text-sm font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              {u.badges?.length || 0} / 5
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/60 dark:border-stone-700">
                            <span className="text-[10px] uppercase font-bold text-stone-500 block">
                              Diplomas
                            </span>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              {u.diplomas?.length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Badges pills */}
                        {u.badges && u.badges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {u.badges.map(b => (
                              <span 
                                key={b.badgeId}
                                className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                              >
                                {b.level} ({b.scorePercent}%)
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Export Excel Controls */}
            {activeTab === 'export' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
                  <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <p className="font-bold">
                      Exportación Profesional en 2 Hojas Oficiales de Excel (.xlsx)
                    </p>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                      • <strong>Hoja 1: Respuestas Encuesta:</strong> Todas las preguntas y respuestas de la encuesta existente (edad, departamento, especie, conocimientos previos, valor de orgullo, interés y aprendizajes).<br/>
                      • <strong>Hoja 2: Evaluaciones e Insignias:</strong> Historial consolidado de evaluaciones, niveles (Bronce a Leyenda), aciertos, porcentaje, aprobación, insignia desbloqueada y código de certificado.
                    </p>
                  </div>
                </div>

                {/* Optional Filters */}
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-amber-600" />
                    Filtros Opcionales para el Reporte
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                        Filtrar por Usuario
                      </label>
                      <input
                        type="text"
                        value={filterUser}
                        onChange={e => setFilterUser(e.target.value)}
                        placeholder="Todos los usuarios"
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                        Nivel de Evaluación
                      </label>
                      <select
                        value={filterLevel}
                        onChange={e => setFilterLevel(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      >
                        <option value="all">Todos los niveles</option>
                        <option value="bronce">Bronce (5 Qs, 70%)</option>
                        <option value="plata">Plata (8 Qs, 75%)</option>
                        <option value="oro">Oro (10 Qs, 80%)</option>
                        <option value="platino">Platino (15 Qs, 85%)</option>
                        <option value="leyenda">Leyenda (20 Qs, 90%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-600 dark:text-stone-400 block mb-1">
                        Estado de Aprobación
                      </label>
                      <select
                        value={filterApproval}
                        onChange={e => setFilterApproval(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                      >
                        <option value="all">Todas las respuestas</option>
                        <option value="approved">Solo Aprobadas / Insignia lograda</option>
                        <option value="not_approved">No aprobadas</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Big Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadExcel}
                  disabled={downloadingExcel}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 text-white font-black text-sm shadow-xl shadow-amber-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>
                    {downloadingExcel ? 'Generando archivo Excel (.xlsx)...' : 'Descargar Resultados Oficiales en Excel'}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
