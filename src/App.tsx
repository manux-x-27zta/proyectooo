/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroAndEndemic } from './components/HeroAndEndemic';
import { FourSpeciesSection } from './components/FourSpeciesSection';
import { CuriositiesSection } from './components/CuriositiesSection';
import { ConservationSection } from './components/ConservationSection';
import { InteractiveQuiz } from './components/InteractiveQuiz';
import { PhotoGalleryModal } from './components/PhotoGalleryModal';
import { VolunteerProjectSection } from './components/VolunteerProjectSection';
import { KnowledgeSurvey } from './components/KnowledgeSurvey';
import { SocialTemplateGenerator } from './components/SocialTemplateGenerator';
import { InteractiveMap } from './components/InteractiveMap';
import { PaletteSelectorModal } from './components/PaletteSelectorModal';
import { FloatingPaletteButton } from './components/FloatingPaletteButton';
import { EvaluationsAndBadgesSection } from './components/EvaluationsAndBadgesSection';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { PaletteId, PALETTE_THEMES } from './data/paletteThemes';
import { Species, SurveyResponse } from './types';
import { COLOMBIAN_SPECIES } from './data/speciesData';
import { INITIAL_SURVEY_RESPONSES } from './data/initialSightings';
import { VirtualAssistantChat } from './components/VirtualAssistantChat';
import { Heart, Sparkles, MapPin, Printer } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'exhibition' | 'map' | 'posters'>('exhibition');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('bioexplora_dark_mode');
      if (saved === 'true') return true;
      if (saved === 'false') return false;
    } catch {}
    return false;
  });
  const [currentPalette, setCurrentPalette] = useState<PaletteId>(() => {
    try {
      const saved = localStorage.getItem('bioexplora_palette') as PaletteId;
      if (saved && PALETTE_THEMES.some(p => p.id === saved)) return saved;
    } catch {}
    return 'esmeralda';
  });
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [selectedSpeciesForContext, setSelectedSpeciesForContext] = useState<Species | null>(null);
  const [qrModalSpecies, setQrModalSpecies] = useState<Species | null>(null);
  const [surveys, setSurveys] = useState<SurveyResponse[]>(() => {
    try {
      const saved = localStorage.getItem('bioexplora_surveys');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SURVEY_RESPONSES;
  });
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Handle direct navigation and universal QR code incoming links (?s=... / ?species=... & ?v=... / ?view=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pathMatch = window.location.pathname.match(/^\/(?:ficha|especie)\/([^/]+)/i);
      const speciesParam =
        params.get('s') ||
        params.get('species') ||
        params.get('especie') ||
        (pathMatch ? decodeURIComponent(pathMatch[1]) : null);
      const rawView = (params.get('v') || params.get('view') || '').toLowerCase();
      const hashTarget = window.location.hash.replace(/^#/, '').toLowerCase();

      const foundSpecies = speciesParam
        ? COLOMBIAN_SPECIES.find((sp) => sp.id === speciesParam)
        : undefined;

      if (rawView === 'map') {
        if (foundSpecies) setSelectedSpeciesForContext(foundSpecies);
        setCurrentView('map');
        return;
      }

      if (rawView === 'posters') {
        if (foundSpecies) setSelectedSpeciesForContext(foundSpecies);
        setCurrentView('posters');
        return;
      }

      if (rawView === 'encuesta' || hashTarget === 'encuesta') {
        if (foundSpecies) {
          // Pre-select species for survey without blocking the screen with the ficha modal
          setSelectedSpeciesForContext(foundSpecies);
        }
        setCurrentView('exhibition');
        setTimeout(() => {
          const surveyEl = document.getElementById('encuesta');
          if (surveyEl) surveyEl.scrollIntoView({ behavior: 'smooth' });
        }, 180);
        return;
      }

      if (foundSpecies) {
        setSelectedSpeciesForContext(foundSpecies);
        setQrModalSpecies(foundSpecies);
        setCurrentView('exhibition');
        setTimeout(() => {
          const cardEl =
            document.getElementById(`species-card-${foundSpecies.id}`) ||
            document.getElementById('cuatro-especies');
          if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 180);
      } else if (rawView === 'exhibition') {
        setCurrentView('exhibition');
      }
    } catch {}
  }, []);

  const activeTheme = PALETTE_THEMES.find(p => p.id === currentPalette) || PALETTE_THEMES[0];

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', currentPalette);
    document.documentElement.setAttribute('data-theme-mode', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('dark', isDarkMode);
    document.documentElement.style.colorScheme = isDarkMode ? 'dark' : 'light';
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        'content',
        isDarkMode ? activeTheme.swatches.bgDark : activeTheme.swatches.bgLight
      );
    }
    try {
      localStorage.setItem('bioexplora_palette', currentPalette);
      localStorage.setItem('bioexplora_dark_mode', String(isDarkMode));
    } catch {}
  }, [currentPalette, isDarkMode, activeTheme]);

  const scrollToSection = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (view: 'exhibition' | 'map' | 'posters', sectionId?: string) => {
    setCurrentView(view);
    if (view === 'exhibition' && sectionId) {
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSpeciesOnMap = (species: Species) => {
    setSelectedSpeciesForContext(species);
    setCurrentView('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenSocialTemplate = (species: Species) => {
    setSelectedSpeciesForContext(species);
    setCurrentView('posters');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSurveySubmitted = (response: SurveyResponse) => {
    setSurveys(prev => [response, ...prev]);
  };

  return (
    <div 
      className={`min-h-screen min-h-dvh w-full max-w-full overflow-x-clip flex flex-col font-sans transition-colors duration-200 ${
        isDarkMode ? 'dark' : ''
      }`}
      style={{
        backgroundColor: 'var(--theme-bg-page)',
        color: 'var(--theme-text-body)',
      }}
    >
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        currentPalette={currentPalette}
        onOpenPaletteSelector={() => setIsPaletteModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-16">
        {currentView === 'exhibition' && (
          <div className="space-y-14 sm:space-y-24">
            {/* Sections 3 & 4: Portada Impactante y ¿Qué es una especie endémica? */}
            <div id="top">
              <HeroAndEndemic
                onExploreSpeciesClick={() => scrollToSection('cuatro-especies')}
                onExploreBiodiversityClick={() => scrollToSection('que-es-endemica')}
                isDarkMode={isDarkMode}
                currentPalette={currentPalette}
              />
            </div>

            {/* Section 5: Las Cuatro Especies Investigadas */}
            <FourSpeciesSection
              onSelectSpeciesOnMap={handleSelectSpeciesOnMap}
              onOpenSocialTemplate={handleOpenSocialTemplate}
              isDarkMode={isDarkMode}
              currentPalette={currentPalette}
              initialSelectedSpecies={qrModalSpecies}
            />

            {/* Section 7: Conoce los datos curiosos */}
            <CuriositiesSection
              isDarkMode={isDarkMode}
            />

            {/* Section 8: ¿Por qué debemos protegerlas? */}
            <ConservationSection
              isDarkMode={isDarkMode}
            />

            {/* Section 9: ¿Cuánto sabes sobre Colombia? (Trivia Interactiva) */}
            <InteractiveQuiz
              isDarkMode={isDarkMode}
            />

            {/* Section 12: Galería de Imágenes */}
            <PhotoGalleryModal
              isDarkMode={isDarkMode}
            />

            {/* Sistema Completo de Insignias, Evaluaciones por Nivel y Diplomas Digitales */}
            <div id="insignias-evaluaciones" className="scroll-mt-20">
              <EvaluationsAndBadgesSection isDarkMode={isDarkMode} />
            </div>

            {/* Section 10: Sección de Encuesta y Código QR */}
            <div id="encuesta" className="scroll-mt-20">
              <KnowledgeSurvey
                initialSpecies={selectedSpeciesForContext}
                onSurveySubmitted={handleSurveySubmitted}
                surveys={surveys}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Section 11: Nuestro proyecto de voluntariado ambiental */}
            <VolunteerProjectSection
              isDarkMode={isDarkMode}
              onNavigateToPosters={() => handleNavigate('posters')}
            />
          </div>
        )}

        {currentView === 'map' && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-[#163e2a] dark:text-white leading-tight">
                  Mapa Interactivo de Colombia
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Explora Colombia en alta resolución con vistas Satelital, Mapa de Calles e Híbrida junto a nuestras especies endémicas.
                </p>
              </div>
              <button
                onClick={() => handleNavigate('exhibition', 'cuatro-especies')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-[#196b44] hover:bg-[#145a38] text-white transition-colors cursor-pointer shrink-0 text-center"
              >
                Volver a la Exposición
              </button>
            </div>

            <InteractiveMap
              selectedSpeciesFromNav={selectedSpeciesForContext}
              onOpenSpeciesDetails={(sp) => {
                setSelectedSpeciesForContext(sp);
                handleNavigate('exhibition', 'cuatro-especies');
              }}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {currentView === 'posters' && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-[#163e2a] dark:text-white leading-tight">
                  Afiches Educativos y Fichas para Redes
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Descubre y comparte nuestros afiches educativos. Cada publicación te invita a conocer una especie endémica de Colombia y aprender por qué es importante conservar nuestra biodiversidad.
                </p>
              </div>
              <button
                onClick={() => handleNavigate('exhibition', 'cuatro-especies')}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-[#196b44] hover:bg-[#145a38] text-white transition-colors cursor-pointer shrink-0 text-center"
              >
                Volver a la Exposición
              </button>
            </div>

            <SocialTemplateGenerator
              initialSpecies={selectedSpeciesForContext}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer 
        className="border-t pt-10 pb-24 sm:pb-10 px-4 sm:px-6 mt-auto text-xs transition-colors w-full"
        style={{
          backgroundColor: isDarkMode ? 'var(--theme-bg-card)' : '#ffffff',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text-muted)'
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: activeTheme.style.primaryHex }}
              />
              <strong 
                className="text-sm font-black"
                style={{ color: activeTheme.style.primaryHex }}
              >
                BioExplora Colombia
              </strong>
            </div>
            <p className="text-[11px] text-stone-500 max-w-md">
              Iniciativa de voluntariado ambiental para la divulgación y valoración de las especies endémicas de nuestro territorio.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <button
              onClick={() => handleNavigate('exhibition', 'cuatro-especies')}
              className="hover:underline cursor-pointer"
              style={{ color: activeTheme.style.primaryHex }}
            >
              Las 4 Especies
            </button>
            <span>·</span>
            <button
              onClick={() => handleNavigate('exhibition', 'trivia')}
              className="hover:underline text-purple-700 dark:text-purple-400 cursor-pointer"
            >
              Trivia Interactiva
            </button>
            <span>·</span>
            <button
              onClick={() => handleNavigate('posters')}
              className="hover:underline text-amber-700 dark:text-amber-400 cursor-pointer"
            >
              Afiches para Imprimir
            </button>
            <span>·</span>
            <button
              onClick={() => handleNavigate('exhibition', 'encuesta')}
              className="hover:underline cursor-pointer"
              style={{ color: activeTheme.style.primaryHex }}
            >
              Encuesta Ciudadana
            </button>
            <span>·</span>
            <button
              onClick={() => setIsPaletteModalOpen(true)}
              className="hover:underline cursor-pointer font-bold flex items-center gap-1"
              style={{ color: activeTheme.style.primaryHex }}
            >
              <span>🎨 Paleta ({activeTheme.name})</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-inherit flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400">
          <span>Fuentes científicas consultadas: Instituto Humboldt · SiB Colombia · UICN Red List</span>
          <span className="mt-2 sm:mt-0">© BioExplora Colombia · Voluntariado Ambiental</span>
        </div>
      </footer>

      {/* Interactive Color Palette Selector Modal */}
      <PaletteSelectorModal
        isOpen={isPaletteModalOpen}
        onClose={() => setIsPaletteModalOpen(false)}
        currentPalette={currentPalette}
        onSelectPalette={(id) => setCurrentPalette(id)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Floating Quick Switcher Button */}
      <FloatingPaletteButton
        currentPalette={currentPalette}
        onClick={() => setIsPaletteModalOpen(true)}
        isDarkMode={isDarkMode}
      />

      {/* Floating Virtual Biodiversity Assistant */}
      <VirtualAssistantChat
        isDarkMode={isDarkMode}
      />

      {/* Auth Account Modal (Login / Register) */}
      <AuthModal />

      {/* Owner / Admin Panel Modal with 2-sheet Excel Export */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    </div>
  );
}
