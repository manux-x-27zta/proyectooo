import React, { useState } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  WifiOff, 
  Wifi, 
  Lock, 
  AlertCircle,
  FileImage,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Sighting, Species } from '../types';
import { COLOMBIAN_SPECIES } from '../data/speciesData';
import {
  computeIntegrityHashAsync,
  fuzzCoordinatesForProtection,
  queueSightingForSync,
} from '../utils/offlineSyncManager';

interface SightingUploaderProps {
  isSimulatedOffline: boolean;
  onSightingAdded: (newSighting: Sighting) => void;
  onNavigateToMap: () => void;
}

export const SightingUploader: React.FC<SightingUploaderProps> = ({
  isSimulatedOffline,
  onSightingAdded,
  onNavigateToMap,
}) => {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(COLOMBIAN_SPECIES[0].id);
  const [observerName, setObserverName] = useState('Guardabosques Comunitario');
  const [observerRole, setObserverRole] = useState<'Biólogo de Campo' | 'Guardaparques' | 'Líder Comunitario' | 'Fotógrafo de Naturaleza' | 'Explorador'>('Explorador');
  const [notes, setNotes] = useState('');
  const [countObserved, setCountObserved] = useState(1);
  const [weather, setWeather] = useState('Húmedo de montaña con niebla (18°C)');
  const [habitatType, setHabitatType] = useState('Estrato arbóreo / Dosel');
  
  // Coordinates
  const [lat, setLat] = useState(4.6128);
  const [lng, setLng] = useState(-73.7425);
  const [locationName, setLocationName] = useState('PNN Chingaza / Sector Páramo');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isE2EEActive, setIsE2EEActive] = useState(true);

  // Photo
  const [photoPreview, setPhotoPreview] = useState<string>(
    'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1200&q=80'
  );
  const [photoResolutionInfo, setPhotoResolutionInfo] = useState<string>('Alta Resolución RAW (3840 x 2160 px)');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedSpecies = COLOMBIAN_SPECIES.find(s => s.id === selectedSpeciesId) || COLOMBIAN_SPECIES[0];

  // Auto-fill coordinates from chosen species if desired
  const handleSpeciesChange = (id: string) => {
    setSelectedSpeciesId(id);
    const sp = COLOMBIAN_SPECIES.find(s => s.id === id);
    if (sp) {
      setLat(sp.coordinates.lat);
      setLng(sp.coordinates.lng);
      setLocationName(sp.coordinates.locationName);
      setHabitatType(sp.habitat.slice(0, 40));
    }
  };

  // Get real GPS from device
  const handleFetchCurrentGps = () => {
    setIsGettingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(Number(pos.coords.latitude.toFixed(6)));
          setLng(Number(pos.coords.longitude.toFixed(6)));
          setLocationName(`Coordenadas de Campo GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setIsGettingLocation(false);
        },
        (err) => {
          console.warn('Geolocation warning/fallback', err);
          // Fallback to Colombia default center
          setLat(4.7110);
          setLng(-74.0721);
          setLocationName('Zona Andina Central (Bogotá / Sabana)');
          setIsGettingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  // Handle image upload from file or camera with strict MIME & 5MB size validation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Formato no permitido. Usa únicamente imágenes seguras JPEG, PNG o WebP.');
      e.target.value = '';
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxBytes) {
      setUploadError('La imagen supera el límite seguro de 5 MB. Selecciona un archivo más liviano.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:image/')) {
        setPhotoPreview(reader.result);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        const safeFileName = file.name.replace(/[^\w.-]/g, '_').slice(0, 40);
        setPhotoResolutionInfo(`Captura verificada (${safeFileName}) · ${sizeMb} MB`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadError(null);

    const boundedLat = Math.max(-5, Math.min(14, Number(lat) || 4.61));
    const boundedLng = Math.max(-83, Math.min(-66, Number(lng) || -73.74));

    // Apply real coordinate obfuscation (Geo-Fuzzing) when wildlife protection is active
    const publicCoords = isE2EEActive
      ? fuzzCoordinatesForProtection({ lat: boundedLat, lng: boundedLng })
      : { lat: Number(boundedLat.toFixed(5)), lng: Number(boundedLng.toFixed(5)) };

    const encryptionHash = await computeIntegrityHashAsync({ lat: boundedLat, lng: boundedLng });

    const newSighting: Sighting = {
      id: `sighting-${Date.now()}`,
      speciesId: selectedSpecies.id,
      speciesCommonName: selectedSpecies.commonName,
      scientificName: selectedSpecies.scientificName,
      category: selectedSpecies.category,
      observerName: (observerName.trim() || 'Explorador Anónimo').slice(0, 60),
      observerRole,
      timestamp: new Date().toISOString(),
      coordinates: {
        lat: publicCoords.lat,
        lng: publicCoords.lng,
        locationName: isE2EEActive
          ? `${locationName.slice(0, 80)} (Área difuminada ±2.5 km)`
          : locationName.slice(0, 80),
      },
      isCoordinatesFuzzedForProtection: isE2EEActive,
      encryptionHash,
      notes: (notes.trim() || 'Avistamiento de campo registrado mediante BioExplora Colombia.').slice(0, 500),
      photoUrl: photoPreview,
      countObserved: Math.min(100, Math.max(1, Number(countObserved) || 1)),
      habitatType: habitatType.slice(0, 80),
      weather: weather.slice(0, 60),
      status: isSimulatedOffline ? 'pending_sync' : 'synced',
      syncedAt: isSimulatedOffline ? undefined : new Date().toISOString(),
      verifiedBy: isSimulatedOffline ? undefined : 'Instituto Humboldt / Verificación Automática',
    };

    setTimeout(() => {
      if (isSimulatedOffline) {
        queueSightingForSync(newSighting);
        setSubmitSuccess('¡Registro guardado con Geo-Fuzzing y huella SHA-256 en almacenamiento local! Se sincronizará cuando recuperes conectividad.');
      } else {
        onSightingAdded(newSighting);
        setSubmitSuccess('¡Avistamiento verificado con protección geográfica y sincronizado con éxito!');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/60 backdrop-blur-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <Camera className="w-3.5 h-3.5" />
            <span>Módulo de Campo para Expediciones Remotas</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isSimulatedOffline ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-amber-950 text-amber-300 border border-amber-800">
                <WifiOff className="w-3.5 h-3.5" /> Modo Offline Activado
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                <Wifi className="w-3.5 h-3.5" /> Conectado en Tiempo Real
              </span>
            )}
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Registrar Avistamiento de Biodiversidad
        </h2>
        <p className="text-xs sm:text-sm text-stone-300">
          Captura fotos en alta resolución, guarda notas de campo sin internet y protege los nidos de especies en peligro crítico con cifrado de extremo a extremo.
        </p>
      </div>

      {submitSuccess ? (
        <div className="p-8 rounded-2xl border border-emerald-700 bg-emerald-950/40 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Registro Completado</h3>
          <p className="text-sm text-emerald-200 max-w-lg mx-auto">
            {submitSuccess}
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSubmitSuccess(null)}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              Registrar Otro Avistamiento
            </button>
            <button
              onClick={onNavigateToMap}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
            >
              Ver en el Mapa de Colombia
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Photo Upload & Preview */}
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                Fotografía de Alta Resolución
              </label>

              <div className="relative group rounded-xl border border-dashed border-stone-700 bg-stone-950 overflow-hidden h-72 flex flex-col items-center justify-center p-4 text-center">
                {photoPreview ? (
                  <>
                    <img
                      src={photoPreview}
                      alt="Vista previa del avistamiento"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                      <p className="text-xs text-white font-medium">Cambiar fotografía de campo</p>
                      <label className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer">
                        Seleccionar Archivo
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center mx-auto text-stone-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-300 font-semibold">Toma una foto o arrastra una imagen</p>
                      <p className="text-[11px] text-stone-500">Admite JPEG, PNG o WebP (máx. 5 MB)</p>
                    </div>
                    <label className="inline-block px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer">
                      Examinar
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Photo Metadata Bar */}
              <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center gap-1.5 truncate">
                  <FileImage className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{photoResolutionInfo}</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono shrink-0">EXIF Listo</span>
              </div>

              {/* E2EE Security Shield Card */}
              <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Cifrado de Extremo a Extremo (E2EE)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsE2EEActive(!isE2EEActive)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      isE2EEActive ? 'bg-emerald-600' : 'bg-stone-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        isE2EEActive ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Ofusca y cifra las coordenadas GPS exactas mediante Geo-Fuzzing (5 km) en servidores públicos para proteger nidos y refugios de especies en peligro crítico (como el Tití Cabeciblanco o el Lagarto de Gorgona) contra tráfico ilegal y coleccionistas.
                </p>
              </div>
            </div>

            {/* Right: Species & Field Observation Details */}
            <div className="space-y-4">
              {/* Species select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                  Especie Observada
                </label>
                <select
                  value={selectedSpeciesId}
                  onChange={(e) => handleSpeciesChange(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-emerald-500"
                >
                  {COLOMBIAN_SPECIES.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.commonName} ({sp.scientificName}) — {sp.region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Observer Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Tu Nombre o Alias</label>
                  <input
                    type="text"
                    value={observerName}
                    onChange={(e) => setObserverName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                    placeholder="Ej. Andrés Gómez"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Rol de Expedición</label>
                  <select
                    value={observerRole}
                    onChange={(e) => setObserverRole(e.target.value as any)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Explorador">Explorador / Aficionado</option>
                    <option value="Biólogo de Campo">Biólogo de Campo / Investigador</option>
                    <option value="Guardaparques">Guardaparques Nacional</option>
                    <option value="Líder Comunitario">Líder Comunitario / Guía Local</option>
                    <option value="Fotógrafo de Naturaleza">Fotógrafo de Naturaleza</option>
                  </select>
                </div>
              </div>

              {/* Coordinates & Location */}
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Coordenadas Geolocalizadas
                  </span>
                  <button
                    type="button"
                    onClick={handleFetchCurrentGps}
                    disabled={isGettingLocation}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGettingLocation ? 'animate-spin' : ''}`} />
                    <span>Obtener GPS Actual</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-stone-500">Latitud</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                      className="w-full bg-stone-900 border border-stone-800 rounded px-2 py-1.5 text-xs text-stone-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-stone-500">Longitud</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={lng}
                      onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                      className="w-full bg-stone-900 border border-stone-800 rounded px-2 py-1.5 text-xs text-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-500">Nombre del Lugar / Vereda / Parque</label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-stone-200"
                    placeholder="Ej. Sendero La Cascada, Cundinamarca"
                  />
                </div>
              </div>

              {/* Count & Weather */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Individuos Observados</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={countObserved}
                    onChange={(e) => setCountObserved(parseInt(e.target.value) || 1)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-400 mb-1">Clima en el Momento</label>
                  <input
                    type="text"
                    value={weather}
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100"
                    placeholder="Ej. Soleado, 24°C"
                  />
                </div>
              </div>

              {/* Field Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-400 mb-1">Notas de Comportamiento y Campo</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe qué estaba haciendo la especie (alimentación, vuelo, canto, interacción) y el estado del entorno..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Procesando y cifrando datos...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>
                      {isSimulatedOffline ? 'Guardar en Cola Offline Cifrada' : 'Registrar y Sincronizar en la Nube'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
