import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Eye, 
  X, 
  Share2, 
  Leaf, 
  Bird, 
  BookOpen,
  Camera,
  Image as ImageIcon,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Species, ColombianRegion } from '../types';
import { COLOMBIAN_SPECIES } from '../data/speciesData';

interface SpeciesExplorerProps {
  onSelectSpeciesOnMap: (species: Species) => void;
  onOpenSocialTemplate: (species: Species) => void;
  onOpenSurvey: (species: Species) => void;
  isDarkMode: boolean;
}

export const SpeciesExplorer: React.FC<SpeciesExplorerProps> = ({
  onSelectSpeciesOnMap,
  onOpenSocialTemplate,
  onOpenSurvey,
  isDarkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Fauna' | 'Flora'>('all');
  const [selectedRegion, setSelectedRegion] = useState<'all' | ColombianRegion>('all');
  const [onlyCoreFour, setOnlyCoreFour] = useState(false);
  const [activeSpeciesModal, setActiveSpeciesModal] = useState<Species | null>(null);
  const [selectedModalImage, setSelectedModalImage] = useState<string | null>(null);

  // Filter species
  const filteredSpecies = useMemo(() => {
    return COLOMBIAN_SPECIES.filter(sp => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matches = 
          sp.commonName.toLowerCase().includes(q) ||
          sp.scientificName.toLowerCase().includes(q) ||
          sp.department.some(d => d.toLowerCase().includes(q)) ||
          sp.coordinates.locationName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (onlyCoreFour && !sp.isCoreProjectSpecies) return false;
      if (selectedCategory !== 'all' && sp.category !== selectedCategory) return false;
      if (selectedRegion !== 'all' && sp.region !== selectedRegion) return false;

      return true;
    });
  }, [searchQuery, selectedCategory, selectedRegion, onlyCoreFour]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'CR':
        return { label: 'En Peligro Crítico', bg: 'bg-rose-500 text-white' };
      case 'EN':
        return { label: 'En Peligro', bg: 'bg-amber-500 text-stone-950 font-bold' };
      case 'VU':
        return { label: 'Vulnerable', bg: 'bg-yellow-500 text-stone-950 font-bold' };
      default:
        return { label: 'Preocupación Menor', bg: 'bg-emerald-600 text-white' };
    }
  };

  const handleOpenModal = (sp: Species) => {
    setActiveSpeciesModal(sp);
    setSelectedModalImage(sp.imageUrl);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Rich Visual Hero with Colombian Wilderness Imagery */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-200 dark:border-stone-800">
        {/* Background Image Collage & Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
            alt="Biodiversidad de Colombia"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-stone-950/80 to-stone-950/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6 sm:p-10 max-w-2xl text-white space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-[#196b44] text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Fauna y Flora Endémica de Colombia</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            Conoce las especies que <span className="text-emerald-400">solo existen</span> en nuestra tierra
          </h1>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed drop-shadow">
            Colombia posee una riqueza natural inigualable. Descubre los animales y plantas más asombrosos de nuestras selvas, islas y páramos, y aprende por qué debemos protegerlos.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                setOnlyCoreFour(!onlyCoreFour);
                setSearchQuery('');
              }}
              className={`px-4 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-lg flex items-center gap-2 ${
                onlyCoreFour
                  ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-300/40'
                  : 'bg-[#196b44] hover:bg-[#145a38] text-white ring-2 ring-emerald-400/30'
              }`}
            >
              <span>⭐ 4 Especies Insignia</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/30">
                Gorgona · Caribe · Supatá · Chingaza
              </span>
            </button>

            <button
              onClick={() => {
                setOnlyCoreFour(false);
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all"
            >
              Ver todas ({COLOMBIAN_SPECIES.length})
            </button>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className={`p-4 rounded-2xl border transition-colors ${
        isDarkMode 
          ? 'bg-[#112019] border-[#1e382c]' 
          : 'bg-white border-[#e0ece4] shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${
              isDarkMode ? 'text-[#7e9b8d]' : 'text-[#6c8678]'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o lugar (ej. Lagarto Azul, Tití, Supatá, Chingaza)..."
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs sm:text-sm transition-colors focus:outline-none ${
                isDarkMode 
                  ? 'bg-[#0b1712] border border-[#213d30] text-white placeholder-[#5c7a6c] focus:border-[#2f9361]' 
                  : 'bg-[#f7faf8] border border-[#d6e4dc] text-[#1b2f24] placeholder-[#7d9689] focus:border-[#1d7749]'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-xl font-bold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#196b44] text-white shadow-sm'
                  : isDarkMode ? 'bg-[#0d1a14] text-[#9ab3a6]' : 'bg-[#f0f6f2] text-[#3e594c]'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setSelectedCategory('Fauna')}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                selectedCategory === 'Fauna'
                  ? 'bg-[#196b44] text-white shadow-sm'
                  : isDarkMode ? 'bg-[#0d1a14] text-[#9ab3a6]' : 'bg-[#f0f6f2] text-[#3e594c]'
              }`}
            >
              <Bird className="w-3.5 h-3.5" />
              <span>Fauna</span>
            </button>
            <button
              onClick={() => setSelectedCategory('Flora')}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${
                selectedCategory === 'Flora'
                  ? 'bg-[#196b44] text-white shadow-sm'
                  : isDarkMode ? 'bg-[#0d1a14] text-[#9ab3a6]' : 'bg-[#f0f6f2] text-[#3e594c]'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Flora</span>
            </button>

            {/* Region dropdown */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none ${
                isDarkMode 
                  ? 'bg-[#0d1a14] border border-[#213d30] text-[#a9c4b7]' 
                  : 'bg-[#f0f6f2] border border-[#d6e4dc] text-[#2c473a]'
              }`}
            >
              <option value="all">Todas las Regiones</option>
              <option value="Andina">Región Andina</option>
              <option value="Caribe">Región Caribe</option>
              <option value="Pacífica">Región Pacífica</option>
              <option value="Amazonía">Región Amazonía</option>
              <option value="Insular">Región Insular</option>
            </select>
          </div>
        </div>
      </section>

      {/* Rich Grid of Species Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSpecies.map((sp) => {
          const status = getStatusDisplay(sp.conservationStatus);
          return (
            <article
              key={sp.id}
              className={`group flex flex-col justify-between rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-[#12221b] border-[#1e382c] hover:border-[#2f9361]' 
                  : 'bg-white border-[#e0ece4] hover:border-[#1d7749] shadow-sm'
              }`}
            >
              {/* Large Image Header */}
              <div className="relative h-60 overflow-hidden bg-stone-900 cursor-pointer" onClick={() => handleOpenModal(sp)}>
                <img
                  src={sp.imageUrl}
                  alt={sp.commonName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-black/20" />

                {/* Region & Spotlight Pill */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-black/60 text-white backdrop-blur-md shadow-sm">
                    {sp.region}
                  </span>
                  {sp.isCoreProjectSpecies && (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 shadow-md">
                      ⭐ Insignia
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <span className={`absolute top-3.5 right-3.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md ${status.bg}`}>
                  {status.label}
                </span>

                {/* Bottom title overlay on photo */}
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-xl font-black tracking-tight leading-tight drop-shadow-md">
                    {sp.commonName}
                  </h3>
                  <p className="text-xs italic font-serif text-stone-200 drop-shadow">
                    {sp.scientificName}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  {/* Location info */}
                  <div className={`flex items-center gap-1.5 text-xs ${
                    isDarkMode ? 'text-[#8ca699]' : 'text-[#486b59]'
                  }`}>
                    <MapPin className="w-3.5 h-3.5 text-[#196b44] shrink-0" />
                    <span className="font-semibold truncate">{sp.coordinates.locationName}</span>
                  </div>

                  {/* Highlight Fact in a rich soft card */}
                  <div className={`p-3 rounded-2xl border text-xs leading-relaxed ${
                    isDarkMode 
                      ? 'bg-[#0d1a14] border-[#1d382b] text-[#c6ddd2]' 
                      : 'bg-[#f4faf6] border-[#d8eae0] text-[#2c473a]'
                  }`}>
                    <span className="font-black text-[#196b44] dark:text-[#8ce2b6] block text-[10px] uppercase tracking-wider mb-0.5">
                      ✨ Dato Asombroso
                    </span>
                    <p className="line-clamp-2">{sp.curiousFact}</p>
                  </div>

                  {/* Habitat thumbnail preview if available */}
                  {sp.habitatImageUrl && (
                    <div className="flex items-center gap-2 pt-1">
                      <img 
                        src={sp.habitatImageUrl} 
                        alt="Ecosistema"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700" 
                      />
                      <div className="text-[11px] leading-tight text-stone-500 dark:text-stone-400">
                        <span className="font-bold block text-stone-700 dark:text-stone-200">Hábitat natural</span>
                        <span className="truncate block max-w-[180px]">{sp.habitat}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className={`pt-3 border-t flex items-center justify-between gap-2 ${
                  isDarkMode ? 'border-[#1b3328]' : 'border-[#e8f1ec]'
                }`}>
                  <button
                    onClick={() => handleOpenModal(sp)}
                    className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black bg-[#196b44] hover:bg-[#145a38] text-white transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Conocer Especie</span>
                  </button>

                  <button
                    onClick={() => onSelectSpeciesOnMap(sp)}
                    title="Ver en el mapa de Colombia"
                    className={`p-2.5 rounded-xl transition-colors ${
                      isDarkMode 
                        ? 'bg-[#182c23] hover:bg-[#203a2f] text-[#8ce2b6]' 
                        : 'bg-[#f0f6f2] hover:bg-[#e2ece6] text-[#196b44]'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenSocialTemplate(sp)}
                    title="Crear afiche o post"
                    className={`p-2.5 rounded-xl transition-colors ${
                      isDarkMode 
                        ? 'bg-[#182c23] hover:bg-[#203a2f] text-sky-400' 
                        : 'bg-[#f0f6f2] hover:bg-[#e2ece6] text-sky-700'
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

      {/* Rich Multi-Image Species Modal */}
      {activeSpeciesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className={`relative w-full max-w-3xl my-6 rounded-3xl shadow-2xl overflow-hidden border ${
            isDarkMode 
              ? 'bg-[#112019] border-[#254637] text-[#ecf3ef]' 
              : 'bg-white border-[#d8e6de] text-[#1c2e24]'
          }`}>
            {/* Modal Hero Image */}
            <div className="relative h-72 sm:h-80 bg-stone-950">
              <img
                src={selectedModalImage || activeSpeciesModal.imageUrl}
                alt={activeSpeciesModal.commonName}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              <button
                onClick={() => setActiveSpeciesModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title & Endemism Tag */}
              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-600 text-white shadow">
                  {activeSpeciesModal.endemicLevel}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  {activeSpeciesModal.commonName}
                </h2>
                <p className="text-sm italic font-serif text-stone-200">
                  {activeSpeciesModal.scientificName} ({activeSpeciesModal.englishName})
                </p>
              </div>
            </div>

            {/* Image Gallery Switcher if available */}
            {activeSpeciesModal.gallery && activeSpeciesModal.gallery.length > 0 && (
              <div className={`px-6 py-3 border-b flex items-center gap-2 overflow-x-auto ${
                isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f7faf8] border-[#e2eee6]'
              }`}>
                <span className="text-[11px] font-bold text-stone-500 uppercase shrink-0 mr-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Galería:
                </span>
                {activeSpeciesModal.gallery.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedModalImage(imgUrl)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      selectedModalImage === imgUrl ? 'border-emerald-500 scale-105 shadow' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Miniatura" className="w-full h-full object-cover" />
                  </button>
                ))}
                {activeSpeciesModal.habitatImageUrl && (
                  <button
                    onClick={() => setSelectedModalImage(activeSpeciesModal.habitatImageUrl!)}
                    className={`h-12 px-2.5 rounded-xl border-2 shrink-0 flex items-center gap-1.5 text-xs font-bold transition-all ${
                      selectedModalImage === activeSpeciesModal.habitatImageUrl ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-stone-700 text-stone-400'
                    }`}
                  >
                    <img src={activeSpeciesModal.habitatImageUrl} alt="Hábitat" className="w-7 h-7 rounded-lg object-cover" />
                    <span>Ver Hábitat</span>
                  </button>
                )}
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto text-xs sm:text-sm">
              {/* Habitat card */}
              <div className={`p-4 rounded-2xl border ${
                isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f4faf6] border-[#d8eae0]'
              }`}>
                <h4 className="font-black text-xs uppercase tracking-wider text-[#196b44] dark:text-[#8ce2b6] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  ¿Dónde vive en Colombia?
                </h4>
                <p className="font-bold text-sm">{activeSpeciesModal.coordinates.locationName}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Departamentos: {activeSpeciesModal.department.join(', ')} · Rango altitudinal: {activeSpeciesModal.elevationRange}
                </p>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5">
                  <strong>Ecosistema:</strong> {activeSpeciesModal.habitat}
                </p>
              </div>

              {/* Characteristics */}
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider mb-2">
                  Características Principales
                </h4>
                <ul className="space-y-1.5 leading-relaxed text-stone-700 dark:text-stone-300">
                  {activeSpeciesModal.characteristics.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#196b44] mt-2 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Ecological role */}
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-[#196b44] dark:text-[#8ce2b6] mb-1">
                  Función e Importancia en el Ecosistema
                </h4>
                <p className="leading-relaxed text-stone-700 dark:text-stone-300">
                  {activeSpeciesModal.ecologicalRole}
                </p>
              </div>

              {/* Curious fact */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200 space-y-1 shadow-sm">
                <strong className="block text-xs uppercase font-black flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  Dato Curioso que te Sorprenderá
                </strong>
                <p className="text-xs sm:text-sm leading-relaxed">{activeSpeciesModal.curiousFact}</p>
              </div>

              {/* Threats */}
              <div>
                <h4 className="font-black text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1.5">
                  Amenazas que enfrenta
                </h4>
                <ul className="space-y-1 text-xs">
                  {activeSpeciesModal.threats.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                      <span className="text-rose-500 font-bold shrink-0">✕</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sources */}
              <div className="pt-2 border-t border-inherit text-[11px] text-stone-500 dark:text-stone-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span>Fuente verificada: Instituto Humboldt & SiB Colombia</span>
                <span>Foto: {activeSpeciesModal.imageAttribution}</span>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className={`p-4 border-t flex flex-wrap items-center justify-end gap-2.5 ${
              isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f7faf8] border-[#e2eee6]'
            }`}>
              <button
                onClick={() => {
                  const sp = activeSpeciesModal;
                  setActiveSpeciesModal(null);
                  onOpenSocialTemplate(sp);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#196b44] hover:bg-[#145a38] text-white flex items-center gap-1.5 shadow"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Generar Afiche con QR</span>
              </button>

              <button
                onClick={() => {
                  const sp = activeSpeciesModal;
                  setActiveSpeciesModal(null);
                  onSelectSpeciesOnMap(sp);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                  isDarkMode ? 'border-[#254637] text-stone-200 hover:bg-[#182c23]' : 'border-[#d0e0d6] text-[#1c3829] hover:bg-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#196b44]" />
                <span>Ver en Mapa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
