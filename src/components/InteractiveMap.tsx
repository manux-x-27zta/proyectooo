import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  CollisionBehavior,
  useMap,
  useMapsLibrary,
  useApiLoadingStatus,
  APILoadingStatus,
  MapCameraChangedEvent,
} from '@vis.gl/react-google-maps';
import {
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  MapPin,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Sparkles,
  Leaf,
  PawPrint,
  Star,
  AlertCircle,
  X,
  Globe,
  Map as MapIcon,
  Navigation,
  Building2,
  EyeOff,
} from 'lucide-react';
import { Species, ColombianRegion } from '../types';
import { COLOMBIAN_SPECIES } from '../data/speciesData';
import { hasValidCoordinates } from '../data/colombiaGeoData';
import { OpenFreeColombiaMap } from './OpenFreeColombiaMap';

export type ColombiaMapMode = 'hybrid' | 'satellite' | 'roadmap';

interface InteractiveMapProps {
  selectedSpeciesFromNav?: Species | null;
  onOpenSpeciesDetails: (species: Species) => void;
  isDarkMode: boolean;
}

const GOOGLE_MAPS_API_KEY: string = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
const HAS_VALID_GOOGLE_MAPS_KEY: boolean = Boolean(
  GOOGLE_MAPS_API_KEY.length > 10 &&
    GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY' &&
    GOOGLE_MAPS_API_KEY !== 'MY_GOOGLE_MAPS_API_KEY'
);
const COLOMBIA_MAP_ID = 'bioexplora-colombia-map';
const COLOMBIA_DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 4.85, lng: -74.45 };
const COLOMBIA_DEFAULT_ZOOM = 5.4;
const COLOMBIA_FULL_BOUNDS: google.maps.LatLngBoundsLiteral = {
  north: 13.45,
  south: -4.35,
  east: -66.75,
  west: -81.95,
};

const REGION_CAMERA_BOUNDS: Record<ColombianRegion, google.maps.LatLngBoundsLiteral> = {
  Caribe: { north: 12.55, south: 6.8, east: -71.1, west: -77.4 },
  Pacífica: { north: 8.65, south: 1.35, east: -76.0, west: -79.1 },
  Andina: { north: 8.8, south: 0.65, east: -72.2, west: -76.8 },
  Orinoquía: { north: 7.15, south: 2.1, east: -67.4, west: -74.1 },
  Amazonía: { north: 2.6, south: -4.3, east: -66.8, west: -76.6 },
  Insular: { north: 13.55, south: 2.8, east: -78.0, west: -81.95 },
};

interface SearchedPlacePin {
  name: string;
  address: string;
  location: google.maps.LatLngLiteral;
}

function checkAndDispatchQuotaError(err: unknown): void {
  const msg = String(err ?? '');
  if (
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('QuotaExceededError') ||
    msg.includes('OverQuotaMapError') ||
    msg.includes('429')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
}

// ============================================================================
// GOOGLE PLACES (NEW) LIVE SEARCH FOR COLOMBIAN CITIES, STREETS & LANDMARKS
// Uses AutocompleteSuggestion.fetchAutocompleteSuggestions + Session Tokens
// ============================================================================

interface ColombiaPlaceSearchProps {
  isDarkMode: boolean;
  onPlaceSelected: (pin: SearchedPlacePin | null) => void;
  activeSearchedPlace: SearchedPlacePin | null;
}

const ColombiaPlaceSearchBox: React.FC<ColombiaPlaceSearchProps> = ({
  isDarkMode,
  onPlaceSelected,
  activeSearchedPlace,
}) => {
  const map = useMap(COLOMBIA_MAP_ID);
  const placesLib = useMapsLibrary('places');

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!placesLib || trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }

        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['co'],
          language: 'es',
          region: 'CO',
        });

        setSuggestions(response.suggestions || []);
        setDropdownOpen(true);
      } catch (err) {
        checkAndDispatchQuotaError(err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [placesLib, query]);

  const handleSelectSuggestion = useCallback(
    async (suggestion: google.maps.places.AutocompleteSuggestion) => {
      if (!placesLib || !suggestion.placePrediction) return;
      try {
        const place = suggestion.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
        });

        sessionTokenRef.current = null;
        setSuggestions([]);
        setDropdownOpen(false);

        const loc = place.location
          ? { lat: place.location.lat(), lng: place.location.lng() }
          : null;

        if (map) {
          if (place.viewport) {
            map.fitBounds(place.viewport, 48);
          } else if (loc) {
            map.panTo(loc);
            map.setZoom(16);
          }
        }

        if (loc) {
          const label =
            place.displayName ||
            suggestion.placePrediction.text?.text ||
            'Ubicación en Colombia';
          setQuery(label);
          onPlaceSelected({
            name: label,
            address: place.formattedAddress || '',
            location: loc,
          });
        }
      } catch (err) {
        checkAndDispatchQuotaError(err);
      }
    },
    [placesLib, map, onPlaceSelected]
  );

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setDropdownOpen(false);
    sessionTokenRef.current = null;
    onPlaceSelected(null);
  };

  return (
    <div ref={containerRef} className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md">
      <Navigation className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1a73e8] dark:text-sky-400 pointer-events-none" />
      <input
        type="text"
        value={query}
        maxLength={100}
        onFocus={() => {
          if (suggestions.length > 0) setDropdownOpen(true);
        }}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ir a ciudad, municipio, barrio, calle, parque o aeropuerto..."
        className={`w-full pl-8 pr-8 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/60 transition-colors ${
          isDarkMode
            ? 'bg-[#091510] border-[#214232] text-white placeholder-stone-400'
            : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-500'
        }`}
      />
      {(query || activeSearchedPlace) && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          title="Limpiar ubicación buscada"
          aria-label="Limpiar ubicación buscada"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {dropdownOpen && (suggestions.length > 0 || loading) && (
        <div
          className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border shadow-2xl overflow-hidden max-h-64 overflow-y-auto ${
            isDarkMode
              ? 'bg-[#0c1b14] border-[#244836] text-stone-100'
              : 'bg-white border-stone-200 text-stone-800'
          }`}
        >
          {loading && suggestions.length === 0 ? (
            <div className="px-3.5 py-2.5 text-xs text-stone-400">
              Buscando lugares en Colombia...
            </div>
          ) : (
            suggestions.map((sug, idx) => {
              const text = sug.placePrediction?.text?.text || '';
              if (!text) return null;
              return (
                <button
                  key={`${text}-${idx}`}
                  type="button"
                  onClick={() => void handleSelectSuggestion(sug)}
                  className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-start gap-2 border-b last:border-b-0 transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'border-[#193326] hover:bg-emerald-900/40'
                      : 'border-stone-100 hover:bg-emerald-50/80'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#1a73e8] dark:text-sky-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{text}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// INNER WORKSPACE CONNECTED TO GOOGLE MAPS CONTEXT
// ============================================================================

const ColombiaGoogleAtlasInner: React.FC<InteractiveMapProps> = ({
  selectedSpeciesFromNav,
  onOpenSpeciesDetails,
  isDarkMode,
}) => {
  const map = useMap(COLOMBIA_MAP_ID);
  const apiStatus = useApiLoadingStatus();

  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(() => {
    return selectedSpeciesFromNav || COLOMBIAN_SPECIES[0] || null;
  });
  const [mapMode, setMapMode] = useState<ColombiaMapMode>('hybrid');
  const [showSpeciesMarkers, setShowSpeciesMarkers] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'Fauna' | 'Flora'>('all');
  const [speciesSearchQuery, setSpeciesSearchQuery] = useState<string>('');
  const [currentZoom, setCurrentZoom] = useState<number>(COLOMBIA_DEFAULT_ZOOM);
  const [searchedPlace, setSearchedPlace] = useState<SearchedPlacePin | null>(null);

  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const hasFittedInitialBoundsRef = useRef<boolean>(false);

  // Smooth imperative camera helpers (zero render loops during user drag/hover)
  const focusOnSpecies = useCallback(
    (sp: Species, targetZoom?: number) => {
      if (!map || !hasValidCoordinates(sp)) return;
      const pos = { lat: sp.coordinates.lat, lng: sp.coordinates.lng };
      map.panTo(pos);
      if (typeof targetZoom === 'number') {
        map.setZoom(targetZoom);
      }
    },
    [map]
  );

  // Frame full Colombian continental + insular territory once on first map mount
  useEffect(() => {
    if (!map || hasFittedInitialBoundsRef.current) return;
    hasFittedInitialBoundsRef.current = true;
    if (!selectedSpeciesFromNav) {
      map.fitBounds(COLOMBIA_FULL_BOUNDS, 24);
    }
  }, [map, selectedSpeciesFromNav]);

  const resetColombiaView = useCallback(() => {
    if (!map) return;
    setSearchedPlace(null);
    map.setHeading(0);
    map.setTilt(0);
    map.fitBounds(COLOMBIA_FULL_BOUNDS, 24);
  }, [map]);

  const handleZoomStep = useCallback(
    (delta: number) => {
      if (!map) return;
      const z = map.getZoom() ?? currentZoom;
      const next = Math.max(3, Math.min(21, z + delta));
      map.setZoom(next);
    },
    [map, currentZoom]
  );

  // Sync external navigation / QR code species selection
  useEffect(() => {
    if (selectedSpeciesFromNav) {
      setSelectedSpecies(selectedSpeciesFromNav);
      setSelectedRegion('all');
      setSelectedCategory('all');
      setSpeciesSearchQuery('');
      setShowSpeciesMarkers(true);
      if (map && hasValidCoordinates(selectedSpeciesFromNav)) {
        map.panTo({
          lat: selectedSpeciesFromNav.coordinates.lat,
          lng: selectedSpeciesFromNav.coordinates.lng,
        });
        map.setZoom(11);
      }
    }
  }, [selectedSpeciesFromNav, map]);

  // Filtered species list
  const filteredSpecies = useMemo(() => {
    return COLOMBIAN_SPECIES.filter((sp) => {
      if (selectedCategory === 'core' && !sp.isCoreProjectSpecies) return false;
      if (selectedCategory === 'Fauna' && sp.category !== 'Fauna') return false;
      if (selectedCategory === 'Flora' && sp.category !== 'Flora') return false;
      if (selectedRegion !== 'all' && sp.region !== selectedRegion) return false;
      if (speciesSearchQuery.trim()) {
        const q = speciesSearchQuery.toLowerCase().trim();
        const matchesName = sp.commonName.toLowerCase().includes(q);
        const matchesSci = sp.scientificName.toLowerCase().includes(q);
        const matchesLoc = (sp.coordinates?.locationName || '').toLowerCase().includes(q);
        const matchesDept = sp.department.some((d) => d.toLowerCase().includes(q));
        return matchesName || matchesSci || matchesLoc || matchesDept;
      }
      return true;
    });
  }, [selectedCategory, selectedRegion, speciesSearchQuery]);

  // Keep selectedSpecies synced with active filter results
  useEffect(() => {
    if (filteredSpecies.length > 0) {
      const stillVisible =
        selectedSpecies && filteredSpecies.some((s) => s.id === selectedSpecies.id);
      if (!stillVisible) {
        setSelectedSpecies(filteredSpecies[0]);
      }
    }
  }, [filteredSpecies, selectedSpecies]);

  const mappableSpecies = useMemo(
    () => filteredSpecies.filter((sp) => hasValidCoordinates(sp)),
    [filteredSpecies]
  );

  const unlocatedSpecies = useMemo(
    () => filteredSpecies.filter((sp) => !hasValidCoordinates(sp)),
    [filteredSpecies]
  );

  const currentIndex = useMemo(() => {
    if (!selectedSpecies || filteredSpecies.length === 0) return 0;
    const idx = filteredSpecies.findIndex((s) => s.id === selectedSpecies.id);
    return idx >= 0 ? idx : 0;
  }, [selectedSpecies, filteredSpecies]);

  const scrollChipIntoView = useCallback((id: string) => {
    requestAnimationFrame(() => {
      const chipEl = document.getElementById(`species-chip-${id}`);
      if (chipEl && carouselContainerRef.current) {
        chipEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }, []);

  const handlePrevSpecies = useCallback(() => {
    if (filteredSpecies.length === 0) return;
    const prevIdx = (currentIndex - 1 + filteredSpecies.length) % filteredSpecies.length;
    const targetSp = filteredSpecies[prevIdx];
    setSelectedSpecies(targetSp);
    focusOnSpecies(targetSp);
    scrollChipIntoView(targetSp.id);
  }, [currentIndex, filteredSpecies, focusOnSpecies, scrollChipIntoView]);

  const handleNextSpecies = useCallback(() => {
    if (filteredSpecies.length === 0) return;
    const nextIdx = (currentIndex + 1) % filteredSpecies.length;
    const targetSp = filteredSpecies[nextIdx];
    setSelectedSpecies(targetSp);
    focusOnSpecies(targetSp);
    scrollChipIntoView(targetSp.id);
  }, [currentIndex, filteredSpecies, focusOnSpecies, scrollChipIntoView]);

  // Keyboard Left / Right species navigation when not typing in an input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevSpecies();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextSpecies();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePrevSpecies, handleNextSpecies]);

  const handleRegionChange = useCallback(
    (regionValue: string) => {
      setSelectedRegion(regionValue);
      if (!map) return;
      if (regionValue === 'all') {
        map.fitBounds(COLOMBIA_FULL_BOUNDS, 24);
      } else if (regionValue in REGION_CAMERA_BOUNDS) {
        map.fitBounds(REGION_CAMERA_BOUNDS[regionValue as ColombianRegion], 36);
      }
    },
    [map]
  );

  // Only update zoom indicator when zoom integer/half step changes -> 0 pan re-renders
  const handleZoomChanged = useCallback((ev: MapCameraChangedEvent) => {
    const nextZoom = Math.round(ev.detail.zoom * 10) / 10;
    setCurrentZoom((prev) => (prev === nextZoom ? prev : nextZoom));
  }, []);

  const handleCardTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleCardTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const diffY = e.changedTouches[0].clientY - touchStartRef.current.y;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) >= 38) {
      if (diffX > 0) {
        handlePrevSpecies();
      } else {
        handleNextSpecies();
      }
    }
    touchStartRef.current = null;
  };

  const getConservationBadge = (status: Species['conservationStatus']) => {
    switch (status) {
      case 'CR':
        return { label: 'En Peligro Crítico (CR)', short: 'CR', cls: 'bg-rose-600 text-white' };
      case 'EN':
        return { label: 'En Peligro (EN)', short: 'EN', cls: 'bg-amber-500 text-stone-950' };
      case 'VU':
        return { label: 'Vulnerable (VU)', short: 'VU', cls: 'bg-yellow-400 text-stone-950' };
      default:
        return { label: 'Preocupación Menor (LC)', short: 'LC', cls: 'bg-emerald-600 text-white' };
    }
  };

  const zoomScaleDescription = useMemo(() => {
    if (currentZoom >= 17) return 'Detalle Urbano · Calles, Edificios y Parques';
    if (currentZoom >= 13) return 'Escala Ciudad · Barrios, Avenidas y Ríos';
    if (currentZoom >= 9) return 'Escala Departamental · Municipios y Carreteras';
    return 'Escala Nacional · Colombia y Regiones';
  }, [currentZoom]);

  const mapLoadFailed =
    apiStatus === APILoadingStatus.FAILED || apiStatus === APILoadingStatus.AUTH_FAILURE;

  if (mapLoadFailed) {
    return (
      <OpenFreeColombiaMap
        selectedSpeciesFromNav={selectedSpeciesFromNav}
        onOpenSpeciesDetails={onOpenSpeciesDetails}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="space-y-5 pb-12">
      {/* ================================================================== */}
      {/* 1. TOP TOOLBAR: MAP MODES (HÍBRIDA / SATELITAL / CALLES) & SEARCH  */}
      {/* ================================================================== */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-colors space-y-4 shadow-sm ${
          isDarkMode
            ? 'bg-[#0e1f17] border-[#214232] text-[#ecf3ef]'
            : 'bg-white border-[#d8eae0] text-[#1c2e24]'
        }`}
      >
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug">
                Google Maps HD · Biodiversidad y Territorio de Colombia
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Imágenes satelitales progresivas de alta resolución (Full HD / 4K), ciudades, barrios, calles, carreteras, edificios y hábitats endémicos
              </p>
            </div>
          </div>

          {/* 3-MODE VIEW SELECTOR: VISTA HÍBRIDA | VISTA SATELITAL | MAPA DE CALLES */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 w-full xl:w-auto">
            <div
              className={`grid grid-cols-3 sm:inline-flex p-1 rounded-2xl border text-xs font-bold gap-1 ${
                isDarkMode ? 'bg-[#08130e] border-[#214232]' : 'bg-stone-100 border-stone-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setMapMode('hybrid')}
                className={`px-2 sm:px-3.5 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mapMode === 'hybrid'
                    ? 'bg-[#1a73e8] text-white shadow-sm'
                    : isDarkMode
                    ? 'text-stone-300 hover:text-white'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
                title="Imágenes satelitales de alta resolución combinadas con nombres de ciudades, barrios, calles y carreteras"
              >
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">Híbrida</span>
                <span className="hidden sm:inline">Vista Híbrida</span>
              </button>

              <button
                type="button"
                onClick={() => setMapMode('satellite')}
                className={`px-2 sm:px-3.5 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mapMode === 'satellite'
                    ? 'bg-[#1a73e8] text-white shadow-sm'
                    : isDarkMode
                    ? 'text-stone-300 hover:text-white'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
                title="Fotografía satelital pura en máxima resolución sin etiquetas viales"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">Satelital</span>
                <span className="hidden sm:inline">Vista Satelital</span>
              </button>

              <button
                type="button"
                onClick={() => setMapMode('roadmap')}
                className={`px-2 sm:px-3.5 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  mapMode === 'roadmap'
                    ? 'bg-[#196b44] text-white shadow-sm'
                    : isDarkMode
                    ? 'text-stone-300 hover:text-white'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
                title="Mapa vectorial de calles, avenidas, carreteras, edificios, parques, aeropuertos y puntos de referencia"
              >
                <MapIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">Calles</span>
                <span className="hidden sm:inline">Mapa de Calles</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowSpeciesMarkers((prev) => !prev)}
              className={`w-full sm:w-auto px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                showSpeciesMarkers
                  ? 'bg-emerald-600/15 border-emerald-600/40 text-emerald-800 dark:text-emerald-300'
                  : isDarkMode
                  ? 'bg-[#091510] border-[#214232] text-stone-400'
                  : 'bg-stone-50 border-stone-200 text-stone-600'
              }`}
              title="Mostrar u ocultar los marcadores de especies para inspeccionar calles y edificios libremente"
            >
              {showSpeciesMarkers ? (
                <>
                  <PawPrint className="w-3.5 h-3.5" />
                  <span>Especies: ON</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Especies: OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Google Places Search + Species Filter Controls */}
        <div className="pt-3 border-t border-stone-100 dark:border-[#1c382a] flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
            {/* 1. Live Google Maps Place Search (Cities, Neighborhoods, Streets, Parks, Airports) */}
            <ColombiaPlaceSearchBox
              isDarkMode={isDarkMode}
              activeSearchedPlace={searchedPlace}
              onPlaceSelected={(pin) => setSearchedPlace(pin)}
            />

            {/* 2. Endemic Species Filter Input */}
            <div className="relative w-full sm:flex-1 sm:min-w-[190px] sm:max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              <input
                type="text"
                value={speciesSearchQuery}
                maxLength={80}
                onChange={(e) => setSpeciesSearchQuery(e.target.value)}
                placeholder="Filtrar especie o departamento..."
                className={`w-full pl-8 pr-7 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isDarkMode
                    ? 'bg-[#091510] border-[#214232] text-white placeholder-stone-500'
                    : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                }`}
              />
              {speciesSearchQuery && (
                <button
                  type="button"
                  onClick={() => setSpeciesSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  title="Limpiar filtro de especies"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Category Filter Tabs */}
            <div
              className={`grid grid-cols-4 sm:inline-flex p-1 rounded-xl border text-xs font-bold ${
                isDarkMode ? 'bg-[#091510] border-[#214232]' : 'bg-[#f4faf6] border-[#d8eae0]'
              }`}
            >
              {(
                [
                  { id: 'all', label: 'Todas' },
                  { id: 'core', label: '4 Insignias' },
                  { id: 'Fauna', label: 'Fauna' },
                  { id: 'Flora', label: 'Flora' },
                ] as const
              ).map((tab) => {
                const active = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={`px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg transition-colors cursor-pointer text-center truncate ${
                      active
                        ? 'bg-[#196b44] text-white shadow-sm'
                        : isDarkMode
                        ? 'text-stone-300 hover:text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Region Selector */}
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              aria-label="Filtrar por región natural"
              className={`w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none ${
                isDarkMode
                  ? 'bg-[#091510] border-[#214232] text-[#ecf3ef]'
                  : 'bg-[#f4faf6] border-[#d8eae0] text-[#2c473a]'
              }`}
            >
              <option value="all">Todo el Territorio ({COLOMBIAN_SPECIES.length})</option>
              <option value="Caribe">
                Región Caribe ({COLOMBIAN_SPECIES.filter((s) => s.region === 'Caribe').length})
              </option>
              <option value="Pacífica">
                Región Pacífica ({COLOMBIAN_SPECIES.filter((s) => s.region === 'Pacífica').length})
              </option>
              <option value="Andina">
                Región Andina ({COLOMBIAN_SPECIES.filter((s) => s.region === 'Andina').length})
              </option>
              <option value="Orinoquía">
                Región Orinoquía ({COLOMBIAN_SPECIES.filter((s) => s.region === 'Orinoquía').length})
              </option>
              <option value="Amazonía">
                Región Amazonía ({COLOMBIAN_SPECIES.filter((s) => s.region === 'Amazonía').length})
              </option>
              <option value="Insular">
                Región Insular ({COLOMBIAN_SPECIES.filter((s) => s.region === 'Insular').length})
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. TWO-ZONE ATLAS WORKSPACE: GOOGLE MAP (8 COL) + FICHA (4 COL)    */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT ZONE: REAL MULTI-RESOLUTION GOOGLE MAP + LEGEND */}
        <div className="lg:col-span-8 flex flex-col gap-3 min-w-0">
          <div
            className={`relative w-full h-[430px] sm:h-[600px] lg:h-[650px] rounded-3xl border overflow-hidden shadow-lg ${
              isDarkMode ? 'bg-[#071926] border-[#1f3b4d]' : 'bg-[#e5eef5] border-[#c8dce9]'
            }`}
          >
            {/* Top-Left Non-Intrusive Status Pill (pointer-events-none so pan/zoom never snag) */}
            <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10 pointer-events-none flex flex-col gap-1.5 max-w-[calc(100%-4rem)] sm:max-w-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950/80 backdrop-blur-md border border-white/15 text-white text-[11px] font-bold shadow-md">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{zoomScaleDescription}</span>
              </div>

              {searchedPlace && (
                <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1a73e8]/95 backdrop-blur-md border border-white/25 text-white text-[11px] font-bold shadow-md">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{searchedPlace.name}</span>
                  <button
                    type="button"
                    onClick={() => setSearchedPlace(null)}
                    className="ml-1 p-0.5 rounded hover:bg-white/20 cursor-pointer"
                    title="Quitar marcador de lugar buscado"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Quick Zoom & Reset Colombia Controls (Bottom-Left on mobile so it never overlaps top-left pill; Top-Right on sm+) */}
            <div className="absolute bottom-5 left-3 sm:bottom-auto sm:left-auto sm:top-3.5 sm:right-14 z-10 flex items-center gap-1 p-1 rounded-2xl bg-stone-950/80 backdrop-blur-md border border-white/15 text-white shadow-lg">
              <button
                type="button"
                onClick={() => handleZoomStep(-1)}
                className="p-1.5 rounded-xl hover:bg-white/15 transition-colors cursor-pointer"
                title="Alejar zoom (-)"
                aria-label="Alejar zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono tabular-nums font-bold px-1.5 min-w-[40px] text-center">
                {currentZoom.toFixed(0)}x
              </span>
              <button
                type="button"
                onClick={() => handleZoomStep(1)}
                className="p-1.5 rounded-xl hover:bg-white/15 transition-colors cursor-pointer"
                title="Acercar zoom a nivel calle/edificio (+)"
                aria-label="Acercar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/20 mx-0.5" />
              <button
                type="button"
                onClick={resetColombiaView}
                className="px-2 py-1.5 rounded-xl hover:bg-white/15 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Restablecer vista completa de Colombia"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Colombia</span>
              </button>
            </div>

            {mapLoadFailed ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center gap-3">
                <AlertCircle className="w-10 h-10 text-amber-500" />
                <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
                  No fue posible inicializar Google Maps en este momento.
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md">
                  Verifica tu conexión a red o la disponibilidad de la clave de Google Maps Platform. Puedes seguir consultando todas las fichas documentadas de especies a la derecha.
                </p>
              </div>
            ) : (
              <Map
                id={COLOMBIA_MAP_ID}
                mapId="DEMO_MAP_ID"
                defaultCenter={COLOMBIA_DEFAULT_CENTER}
                defaultZoom={COLOMBIA_DEFAULT_ZOOM}
                minZoom={3}
                maxZoom={21}
                mapTypeId={mapMode}
                gestureHandling="greedy"
                mapTypeControl={false}
                streetViewControl={true}
                fullscreenControl={true}
                scaleControl={true}
                zoomControl={true}
                rotateControl={true}
                clickableIcons={true}
                onZoomChanged={handleZoomChanged}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                {/* Searched City / Street / Park / Airport Marker */}
                {searchedPlace && (
                  <AdvancedMarker
                    position={searchedPlace.location}
                    zIndex={1200}
                    collisionBehavior={CollisionBehavior.REQUIRED}
                    title={searchedPlace.name}
                  >
                    <div className="flex flex-col items-center select-none pointer-events-none">
                      <div className="px-2.5 py-1 rounded-lg bg-[#1a73e8] text-white text-[11px] font-black shadow-lg border border-white whitespace-nowrap mb-1">
                        {searchedPlace.name}
                      </div>
                      <div className="w-4 h-4 rounded-full bg-[#1a73e8] border-2 border-white shadow-md" />
                    </div>
                  </AdvancedMarker>
                )}

                {/* All Documented Colombian Endemic Species Advanced Markers */}
                {showSpeciesMarkers &&
                  mappableSpecies.map((sp) => {
                    const isSelected = selectedSpecies?.id === sp.id;
                    const isCore = sp.isCoreProjectSpecies;
                    const isFlora = sp.category === 'Flora';
                    const statusBadge = getConservationBadge(sp.conservationStatus);

                    const frameBg = isCore
                      ? 'bg-amber-500 border-white'
                      : isFlora
                      ? 'bg-teal-600 border-white'
                      : 'bg-emerald-600 border-white';

                    const tipColor = isCore
                      ? 'border-t-amber-500'
                      : isFlora
                      ? 'border-t-teal-600'
                      : 'border-t-emerald-600';

                    return (
                      <AdvancedMarker
                        key={sp.id}
                        position={{
                          lat: sp.coordinates.lat,
                          lng: sp.coordinates.lng,
                        }}
                        zIndex={isSelected ? 1000 : isCore ? 500 : 100}
                        collisionBehavior={CollisionBehavior.REQUIRED}
                        onClick={() => {
                          setSelectedSpecies(sp);
                          scrollChipIntoView(sp.id);
                        }}
                        title={`${sp.commonName} (${sp.scientificName})`}
                      >
                        <div className="group relative flex flex-col items-center cursor-pointer select-none">
                          {/* Non-interactive floating species callout (CSS group-hover -> Zero flicker!) */}
                          <div
                            className={`pointer-events-none absolute bottom-full mb-1.5 px-2.5 py-1 rounded-xl bg-stone-950/95 border text-white shadow-xl whitespace-nowrap flex items-center gap-1.5 transition-opacity duration-150 ${
                              isSelected
                                ? 'opacity-100 border-amber-400'
                                : 'opacity-0 group-hover:opacity-100 border-white/25'
                            }`}
                          >
                            <span className="text-[11px] font-extrabold">{sp.commonName}</span>
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded ${statusBadge.cls}`}
                            >
                              {statusBadge.short}
                            </span>
                          </div>

                          {/* Wildlife Portrait Medallion */}
                          <div
                            className={`relative w-11 h-11 rounded-full p-0.5 border-2 shadow-xl transition-colors ${frameBg} ${
                              isSelected
                                ? 'ring-4 ring-sky-400/80'
                                : 'group-hover:ring-2 group-hover:ring-white/90'
                            }`}
                          >
                            <img
                              src={sp.imageUrl}
                              alt={sp.commonName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full rounded-full object-cover bg-stone-900"
                            />
                            {isCore && (
                              <span className="pointer-events-none absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-300 border border-white text-[9px] font-black text-amber-950 flex items-center justify-center shadow">
                                ★
                              </span>
                            )}
                          </div>

                          {/* Exact Geodesic Coordinate Pointer Tip */}
                          <div
                            className={`pointer-events-none w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-0.5 drop-shadow ${tipColor}`}
                          />
                        </div>
                      </AdvancedMarker>
                    );
                  })}
              </Map>
            )}
          </div>

          {/* ================================================================ */}
          {/* INTERACTIVE REGION JUMP BAR & SPECIES CONVENTIONS LEGEND         */}
          {/* ================================================================ */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isDarkMode
                ? 'bg-[#0e1f17] border-[#214232] text-stone-200'
                : 'bg-white border-[#d8eae0] text-stone-700 shadow-sm'
            }`}
          >
            {/* Interactive Region Camera Focus Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Regiones Naturales de Colombia (clic para enfocar territorio):</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'Caribe', dotCls: 'bg-yellow-500', label: 'Caribe' },
                    { id: 'Pacífica', dotCls: 'bg-emerald-600', label: 'Pacífica' },
                    { id: 'Andina', dotCls: 'bg-lime-600', label: 'Andina' },
                    { id: 'Orinoquía', dotCls: 'bg-amber-600', label: 'Orinoquía' },
                    { id: 'Amazonía', dotCls: 'bg-green-700', label: 'Amazonía' },
                    { id: 'Insular', dotCls: 'bg-sky-600', label: 'Insular' },
                  ] as Array<{ id: ColombianRegion; dotCls: string; label: string }>
                ).map((reg) => {
                  const isActive = selectedRegion === reg.id;
                  return (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => handleRegionChange(isActive ? 'all' : reg.id)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-700 text-white border-emerald-600'
                          : isDarkMode
                          ? 'bg-[#091510] border-[#1f3b2d] text-stone-300 hover:border-emerald-500/60'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-emerald-50'
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 border border-black/15 ${reg.dotCls}`}
                      />
                      <span>{reg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Marker Categories Legend */}
            <div className="space-y-1.5 sm:border-l sm:pl-4 border-stone-200 dark:border-[#214232] shrink-0">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
                Convenciones de Especies
              </span>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm flex items-center justify-center text-[8px] text-amber-950 font-black">
                    ★
                  </span>
                  <span>Insignia ({COLOMBIAN_SPECIES.filter((s) => s.isCoreProjectSpecies).length})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-sm" />
                  <span>Fauna ({COLOMBIAN_SPECIES.filter((s) => s.category === 'Fauna').length})</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-600 border-2 border-white shadow-sm" />
                  <span>Flora ({COLOMBIAN_SPECIES.filter((s) => s.category === 'Flora').length})</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* RIGHT ZONE: SPECIES INFORMATION CARD (FICHA INFORMATIVA ESTABLE)   */}
        {/* ================================================================== */}
        <div className="lg:col-span-4 flex flex-col">
          {selectedSpecies ? (
            <aside
              onTouchStart={handleCardTouchStart}
              onTouchEnd={handleCardTouchEnd}
              className={`flex-1 rounded-3xl border overflow-hidden shadow-lg flex flex-col justify-between transition-colors ${
                isDarkMode
                  ? 'bg-[#0e1f17] border-[#214232] text-[#ecf3ef]'
                  : 'bg-white border-[#d8eae0] text-[#1c2e24]'
              }`}
            >
              <div>
                {/* Top Navigation Header inside Ficha */}
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between gap-2 ${
                    isDarkMode ? 'bg-[#091510] border-[#1f3b2d]' : 'bg-[#f4faf6] border-[#e2efe7]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    {selectedSpecies.isCoreProjectSpecies ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Especie Insignia</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                        {selectedSpecies.category === 'Flora' ? (
                          <Leaf className="w-3.5 h-3.5" />
                        ) : (
                          <PawPrint className="w-3.5 h-3.5" />
                        )}
                        <span>{selectedSpecies.category}</span>
                      </span>
                    )}
                    <span className="text-stone-400">·</span>
                    <span className="text-stone-500 dark:text-stone-400">
                      {selectedSpecies.region}
                    </span>
                  </div>

                  {/* Species Prev / Counter / Next */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevSpecies}
                      disabled={filteredSpecies.length <= 1}
                      className="p-1.5 rounded-lg hover:bg-emerald-600/15 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Especie anterior (←)"
                      aria-label="Especie anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono tabular-nums font-bold px-1.5 text-stone-600 dark:text-stone-300">
                      {filteredSpecies.length > 0
                        ? `${currentIndex + 1} / ${filteredSpecies.length}`
                        : '0 / 0'}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextSpecies}
                      disabled={filteredSpecies.length <= 1}
                      className="p-1.5 rounded-lg hover:bg-emerald-600/15 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Especie siguiente (→)"
                      aria-label="Especie siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Species Hero Photography */}
                <div className="relative h-52 sm:h-56 bg-stone-950 overflow-hidden">
                  <img
                    src={selectedSpecies.imageUrl}
                    alt={selectedSpecies.commonName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-transparent" />

                  <div className="absolute top-3 right-3">
                    {(() => {
                      const badge = getConservationBadge(selectedSpecies.conservationStatus);
                      return (
                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <h3 className="text-lg sm:text-xl font-black leading-tight drop-shadow">
                      {selectedSpecies.commonName}
                    </h3>
                    <p className="text-xs italic font-serif text-stone-200">
                      {selectedSpecies.scientificName}
                    </p>
                  </div>
                </div>

                {/* Species Details Body */}
                <div className="p-4 sm:p-5 space-y-3.5 text-xs">
                  <div
                    className={`p-3 rounded-2xl border space-y-1 ${
                      isDarkMode
                        ? 'bg-[#091510] border-[#1f3b2d]'
                        : 'bg-[#f6fbf8] border-[#deede4]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Ubicación Documentada
                      </span>
                      {hasValidCoordinates(selectedSpecies) && (
                        <span className="text-[10px] font-mono tabular-nums text-stone-500 dark:text-stone-400">
                          {Math.abs(selectedSpecies.coordinates.lat).toFixed(4)}°
                          {selectedSpecies.coordinates.lat >= 0 ? 'N' : 'S'},{' '}
                          {Math.abs(selectedSpecies.coordinates.lng).toFixed(4)}°O
                        </span>
                      )}
                    </div>

                    {hasValidCoordinates(selectedSpecies) ? (
                      <>
                        <p className="font-bold text-stone-800 dark:text-stone-100 leading-snug">
                          {selectedSpecies.coordinates.locationName}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Dpto(s): {selectedSpecies.department.join(', ')} · Altitud:{' '}
                          {selectedSpecies.elevationRange}
                        </p>
                      </>
                    ) : (
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Distribución regional ({selectedSpecies.department.join(', ')}) — sin coordenada puntual asignada.
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
                      Descripción y Hábitat
                    </span>
                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                      {selectedSpecies.projectSpotlightReason ||
                        selectedSpecies.characteristics[0]}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-0.5">
                      <strong className="text-stone-700 dark:text-stone-200">Ecosistema:</strong>{' '}
                      {selectedSpecies.habitat}
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Dato Asombroso
                    </span>
                    <p className="text-[11px] text-stone-700 dark:text-amber-100/90 leading-relaxed line-clamp-3">
                      {selectedSpecies.curiousFact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                className={`p-4 border-t flex items-center gap-2 ${
                  isDarkMode
                    ? 'border-[#1f3b2d] bg-[#091510]/60'
                    : 'border-[#e4f0e8] bg-stone-50/70'
                }`}
              >
                {hasValidCoordinates(selectedSpecies) && (
                  <button
                    type="button"
                    onClick={() => focusOnSpecies(selectedSpecies, 14)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isDarkMode
                        ? 'bg-[#12261d] border-[#264c3a] text-emerald-300 hover:bg-[#193528]'
                        : 'bg-white border-[#cde2d5] text-emerald-800 hover:bg-emerald-50'
                    }`}
                    title="Acercar el mapa en alta resolución al hábitat exacto de la especie"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Hábitat HD</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenSpeciesDetails(selectedSpecies)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black bg-[#196b44] hover:bg-[#145a38] text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Ficha Completa</span>
                </button>
              </div>
            </aside>
          ) : (
            <div
              className={`flex-1 rounded-3xl border p-8 flex flex-col items-center justify-center text-center gap-3 ${
                isDarkMode
                  ? 'bg-[#0e1f17] border-[#214232] text-stone-400'
                  : 'bg-white border-[#d8eae0] text-stone-500'
              }`}
            >
              <Compass className="w-10 h-10 text-emerald-600/60" />
              <p className="text-sm font-bold text-stone-700 dark:text-stone-200">
                No hay especies que coincidan con este filtro
              </p>
              <button
                type="button"
                onClick={() => {
                  handleRegionChange('all');
                  setSelectedCategory('all');
                  setSpeciesSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#196b44] text-white cursor-pointer"
              >
                Mostrar todas las especies
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3. BOTTOM HORIZONTAL SPECIES NAVIGATOR STRIP                       */}
      {/* ================================================================== */}
      <div
        className={`p-4 rounded-3xl border space-y-3 ${
          isDarkMode
            ? 'bg-[#0e1f17] border-[#214232]'
            : 'bg-white border-[#d8eae0] shadow-sm'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-black text-stone-800 dark:text-stone-100">
              Recorrido rápido de especies ({filteredSpecies.length}):
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:inline">
              Toca cualquier especie para centrar su territorio o acerca el zoom para explorar ciudades y calles
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevSpecies}
              disabled={filteredSpecies.length <= 1}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 ${
                isDarkMode
                  ? 'bg-[#091510] border-[#214232] text-stone-200 hover:border-emerald-500'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-emerald-50'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              onClick={handleNextSpecies}
              disabled={filteredSpecies.length <= 1}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 ${
                isDarkMode
                  ? 'bg-[#091510] border-[#214232] text-stone-200 hover:border-emerald-500'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-emerald-50'
              }`}
            >
              <span>Siguiente</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          ref={carouselContainerRef}
          onTouchStart={handleCardTouchStart}
          onTouchEnd={handleCardTouchEnd}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
        >
          {filteredSpecies.map((sp) => {
            const isSelected = selectedSpecies?.id === sp.id;
            return (
              <button
                key={sp.id}
                id={`species-chip-${sp.id}`}
                type="button"
                onClick={() => {
                  setSelectedSpecies(sp);
                  focusOnSpecies(sp, Math.max(currentZoom, 10));
                  scrollChipIntoView(sp.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border shrink-0 transition-colors flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#196b44] text-white border-[#196b44] shadow-sm'
                    : isDarkMode
                    ? 'bg-[#091510] border-[#1f3b2d] text-stone-300 hover:border-emerald-500/60'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-emerald-500'
                }`}
              >
                <img
                  src={sp.imageUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-md object-cover shrink-0"
                />
                <span>{sp.commonName}</span>
                <span
                  className={`text-[10px] ${
                    isSelected ? 'text-emerald-100' : 'text-stone-400'
                  }`}
                >
                  · {sp.region}
                </span>
              </button>
            );
          })}
        </div>

        {unlocatedSpecies.length > 0 && (
          <div className="pt-2 border-t border-stone-200 dark:border-[#1f3b2d] flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
            <span>Especies en consulta documental (sin pin geográfico):</span>
            {unlocatedSpecies.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => setSelectedSpecies(sp)}
                className="underline font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer"
              >
                {sp.commonName}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTED WRAPPER WITH GOOGLE MAPS API PROVIDER (LOCALE: ES / REGION: CO)
// ============================================================================

export const InteractiveMap: React.FC<InteractiveMapProps> = (props) => {
  if (!HAS_VALID_GOOGLE_MAPS_KEY) {
    return <OpenFreeColombiaMap {...props} />;
  }

  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      language="es"
      region="CO"
      libraries={['marker', 'places']}
      onError={(err) => checkAndDispatchQuotaError(err)}
    >
      <ColombiaGoogleAtlasInner {...props} />
    </APIProvider>
  );
};
