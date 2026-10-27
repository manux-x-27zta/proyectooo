import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import L from 'leaflet';
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

type ColombiaMapMode = 'hybrid' | 'satellite' | 'roadmap';

export interface OpenFreeColombiaMapProps {
  selectedSpeciesFromNav?: Species | null;
  onOpenSpeciesDetails: (species: Species) => void;
  isDarkMode: boolean;
}

interface SearchedPlacePin {
  name: string;
  address: string;
  lat: number;
  lng: number;
  bounds?: [[number, number], [number, number]];
}

interface NominatimPlaceResult {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  boundingbox?: [string, string, string, string];
}

const COLOMBIA_DEFAULT_CENTER: [number, number] = [4.85, -74.45];
const COLOMBIA_DEFAULT_ZOOM = 5.5;
const COLOMBIA_FULL_BOUNDS: L.LatLngBoundsExpression = [
  [-4.35, -81.95],
  [13.45, -66.75],
];

const REGION_CAMERA_BOUNDS: Record<ColombianRegion, L.LatLngBoundsExpression> = {
  Caribe: [
    [6.8, -77.4],
    [12.55, -71.1],
  ],
  Pacífica: [
    [1.35, -79.1],
    [8.65, -76.0],
  ],
  Andina: [
    [0.65, -76.8],
    [8.8, -72.2],
  ],
  Orinoquía: [
    [2.1, -74.1],
    [7.15, -67.4],
  ],
  Amazonía: [
    [-4.3, -76.6],
    [2.6, -66.8],
  ],
  Insular: [
    [2.8, -81.95],
    [13.55, -78.0],
  ],
};

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getConservationBadge(status: Species['conservationStatus']) {
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
}

export const OpenFreeColombiaMap: React.FC<OpenFreeColombiaMapProps> = ({
  selectedSpeciesFromNav,
  onOpenSpeciesDetails,
  isDarkMode,
}) => {
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(() => {
    return selectedSpeciesFromNav || COLOMBIAN_SPECIES[0] || null;
  });
  const [mapMode, setMapMode] = useState<ColombiaMapMode>('hybrid');
  const [showSpeciesMarkers, setShowSpeciesMarkers] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'Fauna' | 'Flora'>('all');
  const [speciesSearchQuery, setSpeciesSearchQuery] = useState<string>('');
  const [currentZoom, setCurrentZoom] = useState<number>(6);
  const [searchedPlace, setSearchedPlace] = useState<SearchedPlacePin | null>(null);

  // Free Colombian Place Search (Nominatim OpenStreetMap)
  const [placeQuery, setPlaceQuery] = useState<string>('');
  const [placeSuggestions, setPlaceSuggestions] = useState<NominatimPlaceResult[]>([]);
  const [placeLoading, setPlaceLoading] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayersRef = useRef<L.LayerGroup | null>(null);
  const speciesLayerRef = useRef<L.LayerGroup | null>(null);
  const searchedPlaceLayerRef = useRef<L.LayerGroup | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const carouselContainerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Live Colombian Location Search (No API Key Required)
  useEffect(() => {
    const trimmed = placeQuery.trim();
    if (trimmed.length < 2) {
      setPlaceSuggestions([]);
      setPlaceLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setPlaceLoading(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=co&accept-language=es&addressdetails=1&limit=6&q=${encodeURIComponent(
          trimmed
        )}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
          setPlaceSuggestions([]);
          return;
        }
        const data = (await res.json()) as NominatimPlaceResult[];
        setPlaceSuggestions(Array.isArray(data) ? data : []);
        setDropdownOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setPlaceSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setPlaceLoading(false);
        }
      }
    }, 280);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [placeQuery]);

  // Initialize Leaflet Map Once
  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: COLOMBIA_DEFAULT_CENTER,
      zoom: COLOMBIA_DEFAULT_ZOOM,
      minZoom: 3,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true,
    });

    L.control
      .zoom({
        position: 'bottomright',
        zoomInTitle: 'Acercar',
        zoomOutTitle: 'Alejar',
      })
      .addTo(map);

    const tileGroup = L.layerGroup().addTo(map);
    const speciesGroup = L.layerGroup().addTo(map);
    const searchedGroup = L.layerGroup().addTo(map);

    tileLayersRef.current = tileGroup;
    speciesLayerRef.current = speciesGroup;
    searchedPlaceLayerRef.current = searchedGroup;
    leafletMapRef.current = map;

    if (selectedSpeciesFromNav && hasValidCoordinates(selectedSpeciesFromNav)) {
      map.setView(
        [selectedSpeciesFromNav.coordinates.lat, selectedSpeciesFromNav.coordinates.lng],
        11
      );
    } else {
      map.fitBounds(COLOMBIA_FULL_BOUNDS, { padding: [24, 24] });
    }

    setCurrentZoom(Math.round(map.getZoom() * 10) / 10);

    map.on('zoomend', () => {
      const nextZoom = Math.round(map.getZoom() * 10) / 10;
      setCurrentZoom((prev) => (prev === nextZoom ? prev : nextZoom));
    });

    // Ensure tiles fill container cleanly on mobile orientation / tab switches
    const raf = requestAnimationFrame(() => map.invalidateSize());
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      leafletMapRef.current = null;
      tileLayersRef.current = null;
      speciesLayerRef.current = null;
      searchedPlaceLayerRef.current = null;
    };
  }, []);

  // Switch Satellite / Hybrid / Street Tile Layers Cleanly
  useEffect(() => {
    const tileGroup = tileLayersRef.current;
    if (!tileGroup) return;

    tileGroup.clearLayers();

    if (mapMode === 'roadmap') {
      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      });
      tileGroup.addLayer(osmLayer);
    } else if (mapMode === 'satellite') {
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri &mdash; World Imagery',
        }
      );
      tileGroup.addLayer(satLayer);
    } else {
      // Hybrid: High-Resolution Satellite + Roads/Streets + Colombian City & Region Labels
      const satLayer = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri &mdash; World Imagery &amp; Reference',
        }
      );
      const roadsOverlay = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          pane: 'overlayPane',
        }
      );
      const labelsOverlay = L.tileLayer(
        'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          pane: 'overlayPane',
        }
      );
      tileGroup.addLayer(satLayer);
      tileGroup.addLayer(roadsOverlay);
      tileGroup.addLayer(labelsOverlay);
    }
  }, [mapMode]);

  const scrollChipIntoView = useCallback((id: string) => {
    requestAnimationFrame(() => {
      const chipEl = document.getElementById(`species-chip-${id}`);
      if (chipEl && carouselContainerRef.current) {
        chipEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }, []);

  const focusOnSpecies = useCallback((sp: Species, targetZoom?: number) => {
    const map = leafletMapRef.current;
    if (!map || !hasValidCoordinates(sp)) return;
    const z = typeof targetZoom === 'number' ? targetZoom : map.getZoom();
    map.flyTo([sp.coordinates.lat, sp.coordinates.lng], z, {
      duration: 0.65,
    });
  }, []);

  const resetColombiaView = useCallback(() => {
    const map = leafletMapRef.current;
    setSearchedPlace(null);
    if (!map) return;
    map.fitBounds(COLOMBIA_FULL_BOUNDS, { padding: [24, 24] });
  }, []);

  const handleZoomStep = useCallback((delta: number) => {
    const map = leafletMapRef.current;
    if (!map) return;
    const next = Math.max(3, Math.min(19, map.getZoom() + delta));
    map.setZoom(next);
  }, []);

  // Sync external navigation / QR code species selection
  useEffect(() => {
    if (selectedSpeciesFromNav) {
      setSelectedSpecies(selectedSpeciesFromNav);
      setSelectedRegion('all');
      setSelectedCategory('all');
      setSpeciesSearchQuery('');
      setShowSpeciesMarkers(true);
      if (leafletMapRef.current && hasValidCoordinates(selectedSpeciesFromNav)) {
        leafletMapRef.current.flyTo(
          [selectedSpeciesFromNav.coordinates.lat, selectedSpeciesFromNav.coordinates.lng],
          11,
          { duration: 0.7 }
        );
      }
    }
  }, [selectedSpeciesFromNav]);

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

  // Render All Documented Colombian Species Medallion Markers
  useEffect(() => {
    const group = speciesLayerRef.current;
    if (!group) return;

    group.clearLayers();
    if (!showSpeciesMarkers) return;

    mappableSpecies.forEach((sp) => {
      const isSelected = selectedSpecies?.id === sp.id;
      const isCore = Boolean(sp.isCoreProjectSpecies);
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

      const calloutStateCls = isSelected
        ? 'opacity-100 border-amber-400'
        : 'opacity-0 group-hover:opacity-100 border-white/25';

      const ringCls = isSelected
        ? 'ring-4 ring-sky-400/90'
        : 'group-hover:ring-2 group-hover:ring-white/90';

      const safeName = escapeHtml(sp.commonName);
      const safeImage = escapeHtml(sp.imageUrl);
      const starHtml = isCore
        ? `<span class="pointer-events-none absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-300 border border-white text-[9px] font-black text-amber-950 flex items-center justify-center shadow">&#9733;</span>`
        : '';

      const html = `
        <div class="group relative flex flex-col items-center cursor-pointer select-none w-[44px]">
          <div class="pointer-events-none absolute bottom-full mb-1.5 px-2.5 py-1 rounded-xl bg-stone-950/95 border text-white shadow-xl whitespace-nowrap flex items-center gap-1.5 transition-opacity duration-150 ${calloutStateCls}">
            <span class="text-[11px] font-extrabold">${safeName}</span>
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded ${statusBadge.cls}">${statusBadge.short}</span>
          </div>
          <div class="relative w-11 h-11 rounded-full p-0.5 border-2 shadow-xl transition-colors ${frameBg} ${ringCls}">
            <img src="${safeImage}" alt="${safeName}" referrerpolicy="no-referrer" class="w-full h-full rounded-full object-cover bg-stone-900" />
            ${starHtml}
          </div>
          <div class="pointer-events-none w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] -mt-0.5 drop-shadow ${tipColor}"></div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'bioexplora-leaflet-pin',
        html,
        iconSize: [44, 52],
        iconAnchor: [22, 52],
      });

      const marker = L.marker([sp.coordinates.lat, sp.coordinates.lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : isCore ? 500 : 100,
        title: `${sp.commonName} (${sp.scientificName})`,
      });

      marker.on('click', () => {
        setSelectedSpecies(sp);
        scrollChipIntoView(sp.id);
      });

      group.addLayer(marker);
    });
  }, [mappableSpecies, selectedSpecies, showSpeciesMarkers, scrollChipIntoView]);

  // Render Searched Place Pin
  useEffect(() => {
    const group = searchedPlaceLayerRef.current;
    if (!group) return;
    group.clearLayers();
    if (!searchedPlace) return;

    const safeLabel = escapeHtml(searchedPlace.name);
    const icon = L.divIcon({
      className: 'bioexplora-leaflet-pin',
      html: `
        <div class="flex flex-col items-center select-none pointer-events-none">
          <div class="px-2.5 py-1 rounded-lg bg-[#1a73e8] text-white text-[11px] font-black shadow-lg border border-white whitespace-nowrap mb-1">
            ${safeLabel}
          </div>
          <div class="w-4 h-4 rounded-full bg-[#1a73e8] border-2 border-white shadow-md"></div>
        </div>
      `,
      iconSize: [24, 42],
      iconAnchor: [12, 42],
    });

    const marker = L.marker([searchedPlace.lat, searchedPlace.lng], {
      icon,
      zIndexOffset: 1400,
    });
    group.addLayer(marker);
  }, [searchedPlace]);

  const handleSelectPlaceSuggestion = useCallback((item: NominatimPlaceResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    const shortLabel =
      (item.name && item.name.trim()) ||
      item.display_name.split(',')[0]?.trim() ||
      'Ubicación en Colombia';

    let parsedBounds: [[number, number], [number, number]] | undefined;
    if (item.boundingbox && item.boundingbox.length === 4) {
      const south = parseFloat(item.boundingbox[0]);
      const north = parseFloat(item.boundingbox[1]);
      const west = parseFloat(item.boundingbox[2]);
      const east = parseFloat(item.boundingbox[3]);
      if (![south, north, west, east].some(Number.isNaN)) {
        parsedBounds = [
          [south, west],
          [north, east],
        ];
      }
    }

    setPlaceQuery(shortLabel);
    setPlaceSuggestions([]);
    setDropdownOpen(false);
    setSearchedPlace({
      name: shortLabel,
      address: item.display_name,
      lat,
      lng,
      bounds: parsedBounds,
    });

    const map = leafletMapRef.current;
    if (map) {
      if (parsedBounds) {
        map.fitBounds(parsedBounds, { padding: [36, 36], maxZoom: 16 });
      } else {
        map.flyTo([lat, lng], 15, { duration: 0.7 });
      }
    }
  }, []);

  const handleClearPlaceSearch = () => {
    setPlaceQuery('');
    setPlaceSuggestions([]);
    setDropdownOpen(false);
    setSearchedPlace(null);
  };

  const currentIndex = useMemo(() => {
    if (!selectedSpecies || filteredSpecies.length === 0) return 0;
    const idx = filteredSpecies.findIndex((s) => s.id === selectedSpecies.id);
    return idx >= 0 ? idx : 0;
  }, [selectedSpecies, filteredSpecies]);

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

  const handleRegionChange = useCallback((regionValue: string) => {
    setSelectedRegion(regionValue);
    const map = leafletMapRef.current;
    if (!map) return;
    if (regionValue === 'all') {
      map.fitBounds(COLOMBIA_FULL_BOUNDS, { padding: [24, 24] });
    } else if (regionValue in REGION_CAMERA_BOUNDS) {
      map.fitBounds(REGION_CAMERA_BOUNDS[regionValue as ColombianRegion], {
        padding: [36, 36],
      });
    }
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

  const zoomScaleDescription = useMemo(() => {
    if (currentZoom >= 16) return 'Detalle Urbano · Calles, Edificios y Parques';
    if (currentZoom >= 12) return 'Escala Ciudad · Barrios, Avenidas y Ríos';
    if (currentZoom >= 8.5) return 'Escala Departamental · Municipios y Carreteras';
    return 'Escala Nacional · Colombia y Regiones';
  }, [currentZoom]);

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
                Atlas Satelital HD · Biodiversidad y Territorio de Colombia
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Imágenes satelitales de alta resolución, ciudades, municipios, calles, carreteras y los 20 hábitats documentados
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
                title="Mapa vectorial de calles, avenidas, carreteras, edificios, parques y puntos de referencia"
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

        {/* Live Place Search + Species Filter Controls */}
        <div className="pt-3 border-t border-stone-100 dark:border-[#1c382a] flex flex-col xl:flex-row xl:items-center justify-between gap-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 min-w-0">
            {/* 1. Live Colombian City / Street / Park Search */}
            <div
              ref={searchBoxRef}
              className="relative w-full sm:flex-1 sm:min-w-[220px] sm:max-w-md"
            >
              <Navigation className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#1a73e8] dark:text-sky-400 pointer-events-none" />
              <input
                type="text"
                value={placeQuery}
                maxLength={100}
                onFocus={() => {
                  if (placeSuggestions.length > 0) setDropdownOpen(true);
                }}
                onChange={(e) => setPlaceQuery(e.target.value)}
                placeholder="Ir a ciudad, municipio, barrio, calle, parque o aeropuerto..."
                className={`w-full pl-8 pr-8 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/60 transition-colors ${
                  isDarkMode
                    ? 'bg-[#091510] border-[#214232] text-white placeholder-stone-400'
                    : 'bg-stone-50 border-stone-200 text-stone-900 placeholder-stone-500'
                }`}
              />
              {(placeQuery || searchedPlace) && (
                <button
                  type="button"
                  onClick={handleClearPlaceSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                  title="Limpiar ubicación buscada"
                  aria-label="Limpiar ubicación buscada"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {dropdownOpen && (placeSuggestions.length > 0 || placeLoading) && (
                <div
                  className={`absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border shadow-2xl overflow-hidden max-h-64 overflow-y-auto ${
                    isDarkMode
                      ? 'bg-[#0c1b14] border-[#244836] text-stone-100'
                      : 'bg-white border-stone-200 text-stone-800'
                  }`}
                >
                  {placeLoading && placeSuggestions.length === 0 ? (
                    <div className="px-3.5 py-2.5 text-xs text-stone-400">
                      Buscando lugares en Colombia...
                    </div>
                  ) : (
                    placeSuggestions.map((sug) => (
                      <button
                        key={sug.place_id}
                        type="button"
                        onClick={() => handleSelectPlaceSuggestion(sug)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-start gap-2 border-b last:border-b-0 transition-colors cursor-pointer ${
                          isDarkMode
                            ? 'border-[#193326] hover:bg-emerald-900/40'
                            : 'border-stone-100 hover:bg-emerald-50/80'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#1a73e8] dark:text-sky-400 shrink-0 mt-0.5" />
                        <span className="leading-snug line-clamp-2">{sug.display_name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

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
      {/* 2. TWO-ZONE ATLAS WORKSPACE: INTERACTIVE MAP (8 COL) + FICHA (4)   */}
      {/* ================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col gap-3 min-w-0">
          <div
            className={`relative w-full h-[430px] sm:h-[600px] lg:h-[650px] rounded-3xl border overflow-hidden shadow-lg ${
              isDarkMode ? 'bg-[#071926] border-[#1f3b4d]' : 'bg-[#e5eef5] border-[#c8dce9]'
            }`}
          >
            {/* Top-Left Non-Intrusive Status Pill */}
            <div className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 z-10 pointer-events-none flex flex-col gap-1.5 max-w-[calc(100%-1.5rem)] sm:max-w-xs">
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

            {/* Quick Zoom & Reset Colombia Controls */}
            <div className="absolute bottom-6 left-3 sm:bottom-auto sm:left-auto sm:top-3.5 sm:right-3.5 z-10 flex items-center gap-1 p-1 rounded-2xl bg-stone-950/80 backdrop-blur-md border border-white/15 text-white shadow-lg">
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
                title="Acercar zoom (+)"
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

            {/* Leaflet Container */}
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* INTERACTIVE REGION JUMP BAR & SPECIES CONVENTIONS LEGEND */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isDarkMode
                ? 'bg-[#0e1f17] border-[#214232] text-stone-200'
                : 'bg-white border-[#d8eae0] text-stone-700 shadow-sm'
            }`}
          >
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

            <div className="space-y-1.5 sm:border-l sm:pl-4 border-stone-200 dark:border-[#214232] shrink-0">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
                Convenciones de Especies
              </span>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm flex items-center justify-center text-[8px] text-amber-950 font-black">
                    ★
                  </span>
                  <span>
                    Insignia ({COLOMBIAN_SPECIES.filter((s) => s.isCoreProjectSpecies).length})
                  </span>
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

        {/* RIGHT ZONE: SPECIES INFORMATION CARD */}
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
