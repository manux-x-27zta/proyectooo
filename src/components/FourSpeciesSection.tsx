import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  MapPin, 
  BookOpen, 
  X, 
  Share2, 
  ShieldAlert, 
  CheckCircle2,
  Search,
  Filter,
  Layers,
  Star,
  Printer
} from 'lucide-react';
import { Species } from '../types';
import { COLOMBIAN_SPECIES } from '../data/speciesData';
import { PaletteId, PALETTE_THEMES } from '../data/paletteThemes';
import { getConservationLabel, getSpeciesCardTheme } from '../utils/speciesCardTheme';
import { PrintSheetPortal } from './PrintSheetPortal';
import { SpeciesPosterCard } from './SpeciesPosterCard';
import { buildPublicSpeciesUrl, usePublicBaseUrl } from '../utils/publicUrl';

interface FourSpeciesSectionProps {
  onSelectSpeciesOnMap: (species: Species) => void;
  onOpenSocialTemplate: (species: Species) => void;
  isDarkMode: boolean;
  currentPalette?: PaletteId;
  initialSelectedSpecies?: Species | null;
}

export const FourSpeciesSection: React.FC<FourSpeciesSectionProps> = ({
  onSelectSpeciesOnMap,
  onOpenSocialTemplate,
  isDarkMode,
  currentPalette = 'esmeralda',
  initialSelectedSpecies = null,
}) => {
  const activeTheme = PALETTE_THEMES.find(p => p.id === currentPalette) || PALETTE_THEMES[0];
  const publicBaseUrl = usePublicBaseUrl();
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(() => initialSelectedSpecies);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialSelectedSpecies) {
      setSelectedSpecies(initialSelectedSpecies);
    }
  }, [initialSelectedSpecies]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSpecies(null);
      }
    };
    if (selectedSpecies) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSpecies]);

  const handleOpenDetail = (sp: Species) => {
    setSelectedSpecies(sp);
  };

  const filteredSpecies = useMemo(() => {
    return COLOMBIAN_SPECIES.filter(sp => {
      // Category filter
      if (activeCategoryFilter === 'core' && !sp.isCoreProjectSpecies) return false;
      if (activeCategoryFilter === 'Aves' && sp.taxonomy.class !== 'Aves') return false;
      if (
        (activeCategoryFilter === 'Reptiles-Anfibios' || activeCategoryFilter === 'Anfibios-Reptiles') &&
        sp.taxonomy.class !== 'Amphibia' &&
        sp.taxonomy.class !== 'Reptilia'
      ) {
        return false;
      }
      if (activeCategoryFilter === 'Mamíferos' && sp.taxonomy.class !== 'Mammalia') return false;
      if (activeCategoryFilter === 'Flora' && sp.category !== 'Flora') return false;
      if (
        activeCategoryFilter === 'Crustáceos' &&
        sp.taxonomy.phylum !== 'Arthropoda' &&
        sp.taxonomy.class !== 'Malacostraca'
      ) {
        return false;
      }
      if (activeCategoryFilter === 'Peces' && sp.taxonomy.class !== 'Actinopterygii') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sp.commonName.toLowerCase().includes(q);
        const matchesSci = sp.scientificName.toLowerCase().includes(q);
        const matchesRegion = sp.region.toLowerCase().includes(q);
        const matchesDept = sp.department.some(d => d.toLowerCase().includes(q));
        const matchesHabitat = sp.habitat.toLowerCase().includes(q);
        return matchesName || matchesSci || matchesRegion || matchesDept || matchesHabitat;
      }

      return true;
    });
  }, [activeCategoryFilter, searchQuery]);

  const getCardTheme = getSpeciesCardTheme;

  const reptilesAnfibiosCount = COLOMBIAN_SPECIES.filter(
    s => s.taxonomy.class === 'Amphibia' || s.taxonomy.class === 'Reptilia'
  ).length;
  const mamiferosCount = COLOMBIAN_SPECIES.filter(s => s.taxonomy.class === 'Mammalia').length;
  const avesCount = COLOMBIAN_SPECIES.filter(s => s.taxonomy.class === 'Aves').length;
  const floraCount = COLOMBIAN_SPECIES.filter(s => s.category === 'Flora').length;
  const crustaceosCount = COLOMBIAN_SPECIES.filter(
    s => s.taxonomy.phylum === 'Arthropoda' || s.taxonomy.class === 'Malacostraca'
  ).length;

  const categories = [
    { id: 'all', label: `Todas (${COLOMBIAN_SPECIES.length})`, count: COLOMBIAN_SPECIES.length },
    { id: 'core', label: '⭐ 4 Especies Insignias', count: COLOMBIAN_SPECIES.filter(s => s.isCoreProjectSpecies).length },
    { id: 'Reptiles-Anfibios', label: `🦎 Reptiles y Anfibios (${reptilesAnfibiosCount})`, count: reptilesAnfibiosCount },
    { id: 'Mamíferos', label: `🐒 Primates y Marsupiales (${mamiferosCount})`, count: mamiferosCount },
    { id: 'Aves', label: `🦜 Aves Únicas (${avesCount})`, count: avesCount },
    { id: 'Flora', label: `🌿 Flora Restringida (${floraCount})`, count: floraCount },
    { id: 'Crustáceos', label: `🦀 Crustáceos Insulares (${crustaceosCount})`, count: crustaceosCount },
  ];

  return (
    <section id="cuatro-especies" className="space-y-8 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div 
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black text-white shadow-md"
          style={{ backgroundColor: activeTheme.style.primaryHex }}
        >
          <Layers className="w-4 h-4 text-amber-300" />
          <span>Biodiversidad Única de Colombia · Especies Endémicas</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-stone-900 dark:text-white">
          Descubre las especies
        </h2>

        <p className={`text-sm sm:text-base leading-relaxed ${
          isDarkMode ? 'text-stone-300' : 'text-stone-600'
        }`}>
          Seres extraordinarios que solo habitan en nuestro territorio nacional: desde las 4 especies insignia de nuestro voluntariado hasta los tesoros biológicos de nuestras selvas, ríos y páramos.
        </p>
      </div>

      {/* Search Bar & Filter Tabs */}
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Search input */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, departamento, hábitat..."
            className={`w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border transition-all focus:outline-none focus:ring-2 shadow-sm ${
              isDarkMode 
                ? 'bg-[#12221b] border-[#254637] text-white placeholder-stone-500' 
                : 'bg-white border-[#d8eae0] text-stone-800 placeholder-stone-400'
            }`}
            style={{
              borderColor: activeCategoryFilter !== 'all' ? activeTheme.style.primaryHex : undefined
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories scrollable pill row */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const isCatActive = activeCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCatActive
                    ? 'text-white shadow-md scale-105'
                    : isDarkMode
                    ? 'bg-[#12221b] text-stone-300 hover:bg-[#1a3328] border border-[#203a2e]'
                    : 'bg-white text-stone-700 hover:bg-[#edf5f0] border border-[#d8eae0] shadow-sm'
                }`}
                style={{
                  backgroundColor: isCatActive ? activeTheme.style.primaryHex : undefined
                }}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Counter readout */}
        <div className="text-center text-xs text-stone-500 dark:text-stone-400">
          Mostrando <strong>{filteredSpecies.length}</strong> de <strong>{COLOMBIAN_SPECIES.length}</strong> especies endémicas
        </div>
      </div>

      {/* Species Grid: 20 Colombian Species */}
      {filteredSpecies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredSpecies.map((sp) => {
            const theme = getCardTheme(sp);

            return (
              <article
                id={`species-card-${sp.id}`}
                key={sp.id}
                className={`group relative rounded-3xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl flex flex-col justify-between ${theme.border} ${
                  isDarkMode ? 'bg-[#12221b]' : 'bg-white shadow-lg'
                }`}
              >
                {/* Top Photo with Gradient Overlay */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-stone-950">
                  <img
                    src={sp.imageUrl}
                    alt={sp.commonName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

                  {/* Region, Core Project & Conservation Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-1.5">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md ${theme.badgeBg}`}>
                        {sp.region}
                      </span>
                      {sp.isCoreProjectSpecies && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 shadow-md flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Insignia
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/75 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shrink-0">
                      <span className="min-[360px]:hidden">{sp.conservationStatus}</span>
                      <span className="hidden min-[360px]:inline">
                        {getConservationLabel(sp.conservationStatus)}
                      </span>
                    </span>
                  </div>

                  {/* Names overlaid on bottom of photo */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight drop-shadow-md">
                      {sp.commonName}
                    </h3>
                    <p className="text-xs italic font-serif text-stone-200 mt-0.5 drop-shadow">
                      {sp.scientificName}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                  <div className="space-y-3">
                    {/* Location */}
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${
                      isDarkMode ? 'text-stone-300' : 'text-stone-700'
                    }`}>
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{sp.coordinates.locationName}</span>
                    </div>

                    {/* Característica que la hace especial */}
                    <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                      isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f8faf8] border-[#e2eee6]'
                    }`}>
                      <strong className={`block text-[10px] font-black uppercase tracking-wider mb-1 ${theme.accentText}`}>
                        ✨ ¿Por qué es especial?
                      </strong>
                      <p className="text-stone-700 dark:text-stone-300 font-medium line-clamp-3">
                        {theme.specialFeature}
                      </p>
                    </div>

                    {/* Dato curioso */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-stone-800 dark:text-amber-100 space-y-0.5">
                      <strong className="block text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
                        💡 Dato Curioso:
                      </strong>
                      <p className="font-medium line-clamp-3">
                        {sp.curiousFact}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-inherit flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenDetail(sp)}
                      className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${theme.buttonBg}`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Conocer más</span>
                    </button>

                    <button
                      onClick={() => onSelectSpeciesOnMap(sp)}
                      title="Ver ubicación en el mapa de Colombia"
                      className={`p-2.5 rounded-2xl transition-colors cursor-pointer ${
                        isDarkMode 
                          ? 'bg-[#182c23] hover:bg-[#203a2f] text-emerald-300' 
                          : 'bg-[#edf7f1] hover:bg-[#dff0e6] text-emerald-800'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenSocialTemplate(sp)}
                      title="Generar afiche o post para redes"
                      className={`p-2.5 rounded-2xl transition-colors cursor-pointer ${
                        isDarkMode 
                          ? 'bg-[#182c23] hover:bg-[#203a2f] text-cyan-300' 
                          : 'bg-[#edf7f1] hover:bg-[#dff0e6] text-cyan-800'
                      }`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 space-y-3">
          <p className="text-sm font-bold text-stone-500">
            No se encontraron especies con el término "{searchQuery}"
          </p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategoryFilter('all'); }}
            className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 text-white cursor-pointer"
          >
            Ver todas las {COLOMBIAN_SPECIES.length} especies
          </button>
        </div>
      )}

      {/* Detailed Modal Dossier required in prompt */}
      {selectedSpecies && (
        <>
          <PrintSheetPortal active orientation="portrait">
            <SpeciesPosterCard
              species={selectedSpecies}
              qrUrl={buildPublicSpeciesUrl(selectedSpecies.id, publicBaseUrl)}
              variant="poster"
              isPrintCopy
            />
          </PrintSheetPortal>

          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedSpecies(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-3xl max-h-[92dvh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-500/50 cursor-default ${
              isDarkMode 
                ? 'bg-[#112019] text-[#ecf3ef]' 
                : 'bg-white text-[#1c2e24]'
            }`}>
              {/* Highly Prominent Floating Close 'X' Button on top right */}
              <button
                type="button"
                onClick={() => setSelectedSpecies(null)}
                aria-label="Cerrar ventana"
                title="Cerrar ventana (X o Esc)"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 sm:p-3 rounded-full bg-stone-900/90 hover:bg-rose-600 text-white border-2 border-white/50 shadow-2xl backdrop-blur-md transition-all hover:scale-110 cursor-pointer flex items-center justify-center group"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform" />
              </button>

              {/* Modal Hero Image */}
              <div className="relative h-52 sm:h-80 bg-stone-950 shrink-0">
                <img
                  src={selectedSpecies.imageUrl}
                  alt={selectedSpecies.commonName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

              <div className="absolute bottom-4 left-4 right-14 sm:bottom-5 sm:left-6 sm:right-16 text-white space-y-1">
                <span className="inline-block text-[10px] sm:text-[11px] font-black px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-600 text-white shadow">
                  {selectedSpecies.endemicLevel}
                </span>
                <h3 className="text-xl sm:text-4xl font-black tracking-tight leading-tight">
                  {selectedSpecies.commonName}
                </h3>
                <p className="text-xs sm:text-sm italic font-serif text-stone-200 truncate">
                  {selectedSpecies.scientificName} ({selectedSpecies.englishName})
                </p>
              </div>
            </div>

            {/* Modal Body with All Required Fields */}
            <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 flex-1 overflow-y-auto text-xs sm:text-sm">
              {/* Distribución geográfica y hábitat */}
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f4faf6] border-[#d8eae0]'
              }`}>
                <h4 className="font-black text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> Distribución Geográfica y Hábitat
                </h4>
                <p className="font-bold text-sm">{selectedSpecies.coordinates.locationName}</p>
                <p className="text-stone-600 dark:text-stone-300 mt-1">
                  Departamentos: <strong>{selectedSpecies.department.join(', ')}</strong> · Rango Altitudinal: <strong>{selectedSpecies.elevationRange}</strong>
                </p>
                <p className="text-stone-700 dark:text-stone-300 mt-1">
                  <strong>Ecosistema:</strong> {selectedSpecies.habitat}
                </p>
              </div>

              {/* Características físicas y comportamiento */}
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider mb-2 text-[#163e2a] dark:text-white">
                  Características Físicas y Comportamiento
                </h4>
                <ul className="space-y-1.5 leading-relaxed text-stone-700 dark:text-stone-300">
                  {selectedSpecies.characteristics.map((char, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>{char}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Importancia ecológica */}
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                  Función e Importancia Ecológica
                </h4>
                <p className="leading-relaxed text-stone-700 dark:text-stone-300">
                  {selectedSpecies.ecologicalRole}
                </p>
              </div>

              {/* Amenazas que enfrenta y Estado de conservación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-200">
                  <h4 className="font-black text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Amenazas que enfrenta
                  </h4>
                  <ul className="space-y-1 text-xs">
                    {selectedSpecies.threats.map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold shrink-0">✕</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-stone-800 dark:text-stone-200 flex flex-col justify-between">
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                      Estado de Conservación (UICN)
                    </h4>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white mt-1">
                      {getConservationLabel(selectedSpecies.conservationStatus)}
                    </span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2">
                      Evaluada por el Libro Rojo de Especies y la UICN Red List de Colombia.
                    </p>
                  </div>
                </div>
              </div>

              {/* Datos curiosos */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-stone-900 dark:text-amber-100 space-y-1">
                <strong className="block text-xs uppercase font-black text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Dato Curioso para Recordar
                </strong>
                <p className="text-xs sm:text-sm font-medium leading-relaxed">{selectedSpecies.curiousFact}</p>
              </div>

              {/* Fuentes confiables consultadas */}
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-stone-500 mb-2">
                  Fuentes Científicas Consultadas
                </h4>
                <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                  {selectedSpecies.sources.map((src, i) => (
                    <div key={i} className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                      <div>
                        <strong>{src.institution} ({src.year}):</strong> {src.name} — <span className="italic">{src.citation}</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className={`p-4 sm:p-5 border-t shrink-0 flex flex-col-reverse sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-2.5 ${
              isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f7faf8] border-[#e2eee6]'
            }`}>
              {/* Dedicated bottom Close 'X' button so user is never trapped */}
              <button
                type="button"
                onClick={() => setSelectedSpecies(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 flex items-center justify-center gap-2 transition-colors cursor-pointer border border-stone-300 dark:border-stone-750"
              >
                <X className="w-4 h-4 text-rose-500 font-black" />
                <span>Cerrar ventana</span>
              </button>

              <div className="grid grid-cols-1 min-[420px]:grid-cols-3 sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 sm:px-4 py-2.5 rounded-xl text-xs font-black bg-[#196b44] hover:bg-[#145a38] text-white flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span>Imprimir Ficha</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sp = selectedSpecies;
                    setSelectedSpecies(null);
                    onOpenSocialTemplate(sp);
                  }}
                  className="px-3 sm:px-4 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <Share2 className="w-4 h-4 shrink-0" />
                  <span>Afiche y QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const sp = selectedSpecies;
                    setSelectedSpecies(null);
                    onSelectSpeciesOnMap(sp);
                  }}
                  className="px-3 sm:px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span>Ver en Mapa</span>
                </button>
              </div>
            </div>
          </div>
          </div>
        </>
      )}
    </section>
  );
};
