import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAccount, UserDiploma, BadgeLevel } from '../types';

interface AuthContextType {
  user: UserAccount | null;
  token: string | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserAccount }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  submitEvaluation: (data: {
    level: BadgeLevel;
    totalQuestions: number;
    correctAnswers: number;
    scorePercentage: number;
    participantName?: string;
    answersSummary?: Array<{
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string;
    }>;
  }) => Promise<{
    success: boolean;
    approved: boolean;
    newlyUnlockedBadge?: boolean;
    diploma?: UserDiploma;
    minScorePercent?: number;
    error?: string;
  }>;
  selectedDiploma: UserDiploma | null;
  setSelectedDiploma: (diploma: UserDiploma | null) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STUDENT_TOKEN_KEY = 'bioexplora_auth_token';
const ADMIN_SESSION_TOKEN_KEY = 'bioexplora_owner_token';

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return (
      sessionStorage.getItem(ADMIN_SESSION_TOKEN_KEY) ||
      sessionStorage.getItem(STUDENT_TOKEN_KEY) ||
      localStorage.getItem(STUDENT_TOKEN_KEY)
    );
  } catch {
    return null;
  }
}

function clearAllStoredTokens(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(ADMIN_SESSION_TOKEN_KEY);
    sessionStorage.removeItem('bioexplora_owner_email');
    sessionStorage.removeItem(STUDENT_TOKEN_KEY);
    localStorage.removeItem(STUDENT_TOKEN_KEY);
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(readStoredToken);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [selectedDiploma, setSelectedDiploma] = useState<UserDiploma | null>(null);

  const refreshUser = useCallback(async () => {
    const currentToken = readStoredToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setToken(currentToken);
          setUser(data.user);
        } else {
          clearAllStoredTokens();
          setToken(null);
          setUser(null);
        }
      } else {
        clearAllStoredTokens();
        setToken(null);
        setUser(null);
      }
    } catch {
      // Transient network error: preserve state without exposing internals
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Credenciales no válidas.' };
      }

      // Store privileged admin tokens exclusively in ephemeral sessionStorage (never persistent localStorage)
      clearAllStoredTokens();
      if (data.user?.role === 'admin') {
        sessionStorage.setItem(ADMIN_SESSION_TOKEN_KEY, data.token);
        sessionStorage.setItem('bioexplora_owner_email', data.ownerEmail || data.user.username);
      } else {
        sessionStorage.setItem(STUDENT_TOKEN_KEY, data.token);
      }

      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);

      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Error de conexión con el servidor.' };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'No se pudo crear la cuenta.' };
      }

      clearAllStoredTokens();
      sessionStorage.setItem(STUDENT_TOKEN_KEY, data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Error al registrar el usuario en el servidor.' };
    }
  };

  const logout = () => {
    clearAllStoredTokens();
    setToken(null);
    setUser(null);
  };

  const submitEvaluation = async (evalData: {
    level: BadgeLevel;
    totalQuestions: number;
    correctAnswers: number;
    scorePercentage: number;
    participantName?: string;
    answersSummary?: Array<{
      question: string;
      selectedAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string;
    }>;
  }) => {
    try {
      const activeToken = readStoredToken() || token;
      const res = await fetch('/api/evaluations/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
        },
        body: JSON.stringify({
          level: evalData.level,
          totalQuestions: evalData.totalQuestions,
          correctAnswers: evalData.correctAnswers,
          participantName: evalData.participantName,
        }),
      });

      const result = await res.json();
      if (result.success && user) {
        await refreshUser();
      }
      return result;
    } catch (e: unknown) {
      return {
        success: false,
        approved: false,
        error: e instanceof Error ? e.message : 'Error al enviar evaluación.',
      };
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
        submitEvaluation,
        selectedDiploma,
        setSelectedDiploma,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
