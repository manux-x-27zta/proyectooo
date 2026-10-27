import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Compass, 
  Leaf, 
  ChevronDown, 
  Maximize2, 
  Minimize2,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface VirtualAssistantChatProps {
  isDarkMode: boolean;
}

const SUGGESTED_PROMPTS = [
  '¿Por qué el Lagarto Azul solo vive en Gorgona?',
  'Háblame de una especie endémica de la Amazonía',
  '¿Qué amenazas enfrenta el Tití Cabeciblanco?',
  '¿Qué aves endémicas habitan los Andes colombianos?',
  '¿Por qué Colombia es el segundo país más biodiverso del mundo?'
];

export const VirtualAssistantChat: React.FC<VirtualAssistantChatProps> = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '¡Hola! 🇨🇴 Soy **BioGuía**, tu asistente de biodiversidad colombiana.\n\nPuedo responder tus dudas sobre las 20 especies de nuestra plataforma o contarte sobre cualquier otra especie, ave, anfibio, felino, orquídea o ecosistema de Colombia. ¿Sobre qué te gustaría aprender hoy?',
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (userPrompt?: string) => {
    const textToSend = (userPrompt || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare conversation history for server-side Gemini endpoint
      const conversationHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: textToSend,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || 'No recibí respuesta del servidor.';

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Failed to get response from assistant:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        text: '🌿 Hubo un problema momentáneo de conexión con el servicio del asistente. Puedes intentar de nuevo en unos segundos.',
        timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: 'Conversación reiniciada. ¿Qué otra especie o región de Colombia deseas explorar?',
        timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Basic formatting helper for bold and bullets
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Parse bold **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-black text-emerald-950 dark:text-emerald-200">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <li key={lIdx} className="ml-4 list-disc my-0.5 leading-relaxed">
            {formattedParts}
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={lIdx} className="h-2" />;
      }

      return (
        <p key={lIdx} className="leading-relaxed my-0.5">
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-4 right-3.5 sm:bottom-6 sm:right-6 z-40 flex items-center">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2 sm:gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-emerald-400/40"
            title="Abrir Asistente de Biodiversidad"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-yellow-300 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-black tracking-tight leading-none">BioGuía IA</span>
              <span className="hidden sm:block text-[10px] text-emerald-200 leading-none mt-0.5">Asistente de Biodiversidad</span>
            </div>
          </button>
        )}
      </div>

      {/* Chat Window Modal / Sheet */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 shadow-2xl flex flex-col border overflow-hidden ${
          isExpanded 
            ? 'inset-2.5 sm:inset-10 rounded-3xl' 
            : 'inset-x-3 bottom-3 sm:left-auto sm:bottom-6 sm:right-6 w-auto sm:w-[420px] h-[min(560px,calc(100dvh-1.5rem))] max-h-[calc(100dvh-1.5rem)] rounded-3xl'
        } ${
          isDarkMode 
            ? 'bg-[#0f1f18] border-[#224434] text-stone-100 shadow-emerald-950/60' 
            : 'bg-white border-[#d2e7da] text-stone-900 shadow-emerald-900/20'
        }`}>
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black tracking-tight leading-none">BioGuía Colombia</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-bold">
                    IA Ambiental
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90 leading-none mt-1">
                  Especialista en fauna, flora y ecosistemas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-xl hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                title="Limpiar conversación"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:block p-1.5 rounded-xl hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                title={isExpanded ? 'Restablecer tamaño' : 'Maximizar'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                title="Cerrar asistente"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick suggestions banner */}
          <div className={`p-2.5 border-b text-xs overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0 ${
            isDarkMode ? 'bg-[#0b1712] border-[#1d3a2c]' : 'bg-[#f4faf6] border-[#e2efe7]'
          }`}>
            <span className="text-[10px] font-black uppercase text-stone-500 dark:text-stone-400 flex items-center gap-1 pl-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Preguntas sugeridas:
            </span>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleSendMessage(prompt)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer shrink-0 ${
                  isDarkMode 
                    ? 'bg-[#12241b] border-[#224434] text-stone-300 hover:border-emerald-500' 
                    : 'bg-white border-[#d8eae0] text-stone-700 hover:border-emerald-600'
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : isDarkMode
                          ? 'bg-[#15291f] text-stone-200 border border-[#234535] rounded-bl-none'
                          : 'bg-[#f5f9f6] text-stone-800 border border-[#d8eae0] rounded-bl-none'
                    }`}
                  >
                    {renderFormattedText(msg.text)}
                  </div>
                  <span className="text-[9px] text-stone-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs w-fit">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                <span>BioGuía está consultando la información sobre biodiversidad...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className={`p-3 border-t shrink-0 ${
            isDarkMode ? 'bg-[#0c1813] border-[#1d3a2c]' : 'bg-[#fafdfb] border-[#e2efe7]'
          }`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Pregunta sobre cualquier especie o ecosistema..."
                disabled={isLoading}
                className={`flex-1 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border focus:outline-none transition-all ${
                  isDarkMode 
                    ? 'bg-[#14281f] border-[#254637] text-white placeholder-stone-500 focus:border-emerald-500' 
                    : 'bg-white border-[#d8eae0] text-stone-800 placeholder-stone-400 focus:border-emerald-600'
                }`}
              />

              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`p-2.5 rounded-2xl text-white transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                  inputValue.trim() && !isLoading
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md scale-105'
                    : 'bg-stone-300 dark:bg-stone-700 opacity-60 cursor-not-allowed'
                }`}
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-1.5 flex items-center justify-between text-[10px] text-stone-400 px-1">
              <span>BioExplora Colombia · Rigor botánico y zoológico</span>
              <span className="hidden sm:inline">Presiona Enter para enviar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
