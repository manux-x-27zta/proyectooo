import { 
  Compass, 
  MapPin, 
  ClipboardCheck, 
  Printer,
  Moon, 
  Sun,
  Leaf,
  Sparkles,
  Camera,
  BrainCircuit,
  Globe2,
  Users,
  Palette,
  Award,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { PaletteId, PALETTE_THEMES } from '../data/paletteThemes';
import { useAuth } from '../context/AuthContext';

export type MainNavAction = 
  | 'home' 
  | 'species' 
  | 'ecosystems' 
  | 'curiosities' 
  | 'conservation' 
  | 'quiz' 
  | 'gallery' 
  | 'posters' 
  | 'survey' 
  | 'volunteer' 
  | 'evaluations'
  | 'map';

interface NavbarProps {
  currentView: 'exhibition' | 'map' | 'posters';
  onNavigate: (view: 'exhibition' | 'map' | 'posters', sectionId?: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentPalette: PaletteId;
  onOpenPaletteSelector: () => void;
  onOpenAdminPanel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  currentPalette,
  onOpenPaletteSelector,
  onOpenAdminPanel,
}) => {
  const activeTheme = PALETTE_THEMES.find(p => p.id === currentPalette) || PALETTE_THEMES[0];
  const { user, openAuthModal, logout, isAdmin } = useAuth();

  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 ${
      isDarkMode 
        ? 'bg-[#0f1d17]/95 border-[#1f372c] text-[#ecf3ef]' 
        : 'bg-[#fbfbfa]/95 border-[#e2ece5] text-[#1c2e24]'
    } backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2 h-14 sm:h-16 min-w-0">
          {/* Logo & Identity */}
          <div 
            onClick={() => onNavigate('exhibition', 'top')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
          >
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 text-white shrink-0"
              style={{ backgroundColor: activeTheme.style.primaryHex }}
            >
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-black text-base sm:text-lg tracking-tight truncate">BioExplora</span>
                <span className={`text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
                  isDarkMode 
                    ? 'bg-[#1e4a35] text-[#86e2b5]' 
                    : 'bg-[#e2f3ea] text-[#146b43]'
                }`}>
                  Colombia
                </span>
              </div>
              <p className={`hidden sm:block text-[11px] font-medium -mt-0.5 truncate ${
                isDarkMode ? 'text-[#8ca699]' : 'text-[#647c70]'
              }`}>
                Especies endémicas de nuestra tierra
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              onClick={() => onNavigate('exhibition', 'top')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentView === 'exhibition'
                  ? isDarkMode ? 'text-white' : 'text-[#146b43]'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => onNavigate('exhibition', 'cuatro-especies')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>⭐ 4 Especies</span>
            </button>



            <button
              onClick={() => onNavigate('exhibition', 'datos-curiosos')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-500/10 transition-all cursor-pointer"
            >
              Datos Curiosos
            </button>

            <button
              onClick={() => onNavigate('exhibition', 'trivia')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-all cursor-pointer flex items-center gap-1"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Trivia</span>
            </button>

            <button
              onClick={() => onNavigate('exhibition', 'galeria')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-500/10 transition-all cursor-pointer flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Galería</span>
            </button>

            <button
              onClick={() => onNavigate('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentView === 'map'
                  ? 'bg-[#196b44] text-white shadow'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-500/10'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Mapa</span>
            </button>

            <button
              onClick={() => onNavigate('posters')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentView === 'posters'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-amber-700 dark:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Afiches</span>
            </button>

            <button
              onClick={() => onNavigate('exhibition', 'insignias-evaluaciones')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-all cursor-pointer flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Insignias y Diplomas</span>
            </button>

            <button
              onClick={() => onNavigate('exhibition', 'encuesta')}
              className="px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all shadow-md flex items-center gap-1 cursor-pointer hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: activeTheme.style.primaryHex }}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Encuesta</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Admin Panel Button (Owner only) */}
            {isAdmin && onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                title="Abrir Panel de Propietario / Admin"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Panel Admin</span>
              </button>
            )}

            {/* User Session Button */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-1.5 bg-stone-100 dark:bg-stone-800/80 p-1 pl-2 rounded-xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center uppercase shrink-0">
                    {user.username.substring(0, 1)}
                  </div>
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 max-w-[64px] sm:max-w-[110px] truncate">
                    {user.username}
                  </span>
                  {user.badges && user.badges.length > 0 && (
                    <span className="hidden min-[390px]:flex text-[10px] font-black px-1.5 py-0.2 rounded-md bg-amber-400 text-stone-950 items-center gap-0.5 shrink-0">
                      <Award className="w-2.5 h-2.5" />
                      {user.badges.length}
                    </span>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="p-1 text-stone-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Ingresar</span>
              </button>
            )}

            {/* Palette Trigger Button (Shown from sm+ because mobile nav bar below has Paleta pill) */}
            <button
              onClick={onOpenPaletteSelector}
              aria-label={`Paleta de colores: ${activeTheme.name}`}
              className={`hidden sm:flex px-3 py-1.5 rounded-xl border transition-all items-center gap-2 cursor-pointer shadow-sm hover:scale-105 ${
                isDarkMode 
                  ? 'bg-[#14281f] border-[#224434] text-stone-200 hover:bg-[#1b362a]' 
                  : 'bg-white border-[#e0ece4] text-stone-800 hover:bg-[#f4faf6]'
              }`}
              title="Personalizar paleta de colores"
            >
              <Palette 
                className="w-4 h-4" 
                style={{ color: activeTheme.style.primaryHex }} 
              />
              <span className="text-xs font-bold hidden md:inline">{activeTheme.name}</span>
              <div className="flex items-center -space-x-1 ml-0.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-white dark:border-stone-900" 
                  style={{ backgroundColor: activeTheme.swatches.primary }} 
                />
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-white dark:border-stone-900" 
                  style={{ backgroundColor: activeTheme.swatches.accent }} 
                />
                <span 
                  className="w-2.5 h-2.5 rounded-full border border-white dark:border-stone-900" 
                  style={{ backgroundColor: activeTheme.swatches.glow }} 
                />
              </div>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              aria-label="Alternar modo visual"
              className={`p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                isDarkMode 
                  ? 'bg-[#14281f] border-[#224434] text-[#86e2b5] hover:bg-[#1b362a]' 
                  : 'bg-white border-[#e0ece4] text-[#2c5240] hover:bg-[#f4faf6] shadow-sm'
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Scroll */}
        <div className="flex xl:hidden overflow-x-auto no-scrollbar py-2 gap-1.5 border-t border-inherit text-xs items-center -mx-1 px-1">
          <button
            onClick={onOpenPaletteSelector}
            className="whitespace-nowrap px-2.5 py-1.5 rounded-lg font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            style={{
              backgroundColor: isDarkMode ? activeTheme.style.badgeBgDark : activeTheme.style.badgeBgLight,
              color: isDarkMode ? activeTheme.style.badgeTextDark : activeTheme.style.badgeTextLight,
              borderColor: activeTheme.style.primaryHex
            }}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="sm:hidden">Paleta</span>
            <span className="hidden sm:inline">Paleta ({activeTheme.name})</span>
          </button>
          <button
            onClick={() => onNavigate('exhibition', 'top')}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg font-bold text-white shrink-0"
            style={{ backgroundColor: activeTheme.style.primaryHex }}
          >
            Inicio
          </button>
          <button
            onClick={() => onNavigate('exhibition', 'cuatro-especies')}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg font-bold bg-amber-500 text-stone-950 shrink-0"
          >
            ⭐ 4 Especies
          </button>
          <button
            onClick={() => onNavigate('map')}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg font-bold bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 shrink-0"
          >
            Mapa
          </button>
          <button
            onClick={() => onNavigate('exhibition', 'insignias-evaluaciones')}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 flex items-center gap-1"
          >
            <Award className="w-3 h-3 text-amber-500" />
            <span>Insignias</span>
          </button>
          <button
            onClick={() => onNavigate('exhibition', 'trivia')}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg font-bold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 shrink-0"
          >
            Trivia
          </button>
          <button
            onClick={() => onNavigate('exhibition', 'galeria')}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg font-bold bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 shrink-0"
          >
            Galería
          </button>
          <button
            onClick={() => onNavigate('posters')}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 shrink-0"
          >
            Afiches
          </button>
          <button
            onClick={() => onNavigate('exhibition', 'encuesta')}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg font-bold text-white shrink-0"
            style={{ backgroundColor: activeTheme.style.primaryHex }}
          >
            Encuesta
          </button>
        </div>
      </div>
    </header>
  );
};
