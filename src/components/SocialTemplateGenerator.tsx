import React, { useEffect, useState } from 'react';
import {
  Printer,
  Copy,
  Check,
  QrCode,
  Instagram,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { Species } from '../types';
import { COLOMBIAN_SPECIES } from '../data/speciesData';
import { SpeciesPosterCard } from './SpeciesPosterCard';
import { PrintSheetPortal } from './PrintSheetPortal';
import { buildPublicSpeciesUrl, usePublicBaseUrl } from '../utils/publicUrl';

interface SocialTemplateGeneratorProps {
  initialSpecies?: Species | null;
  isDarkMode: boolean;
  onNavigateToSpecies?: (species: Species) => void;
}

export const SocialTemplateGenerator: React.FC<SocialTemplateGeneratorProps> = ({
  initialSpecies,
  isDarkMode,
}) => {
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(
    initialSpecies ? initialSpecies.id : COLOMBIAN_SPECIES[0].id
  );
  const [posterStyle, setPosterStyle] = useState<'poster' | 'social'>('poster');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const publicBaseUrl = usePublicBaseUrl();

  useEffect(() => {
    if (initialSpecies) {
      setSelectedSpeciesId(initialSpecies.id);
    }
  }, [initialSpecies]);

  const species =
    COLOMBIAN_SPECIES.find((s) => s.id === selectedSpeciesId) || COLOMBIAN_SPECIES[0];

  // Universal public URL accessible by anyone in the world on any mobile phone
  const targetSpeciesUrl = buildPublicSpeciesUrl(species.id, publicBaseUrl);

  const socialCopy =
    `🇨🇴 ¿Sabías que ${species.commonName} (${species.scientificName}) habita en los ecosistemas únicos de Colombia?\n\n` +
    `📍 Ubicación: ${species.coordinates.locationName}\n` +
    `✨ Dato curioso: ${species.curiousFact}\n` +
    `🌱 Función ecológica: ${species.ecologicalRole}\n\n` +
    `¡Escanea el código QR del afiche o entra a este enlace público desde cualquier celular para explorar su ficha completa y participar en la encuesta ambiental!\n` +
    `${targetSpeciesUrl}\n\n` +
    `#BioExploraColombia #EspeciesEndémicas #OrgulloColombiano #Biodiversidad #${species.commonName.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '')}`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(socialCopy).catch(() => {});
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(targetSpeciesUrl).catch(() => {});
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handlePrintPoster = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      // Ensure the species photograph is fully decoded in memory before opening print preview
      const preloader = new Image();
      preloader.src = species.imageUrl;
      await Promise.race([
        preloader.decode ? preloader.decode().catch(() => {}) : Promise.resolve(),
        new Promise((resolve) => setTimeout(resolve, 1200)),
      ]);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      window.print();
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Dedicated top-level 1-page Print Portal (hidden on screen, sole output in @media print) */}
      <PrintSheetPortal active orientation="portrait">
        <SpeciesPosterCard
          species={species}
          qrUrl={targetSpeciesUrl}
          variant={posterStyle}
          isPrintCopy
        />
      </PrintSheetPortal>

      {/* Header */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDarkMode
            ? 'bg-[#12221b] border-[#1e382c] text-[#ecf3ef]'
            : 'bg-white border-[#e0ece4] text-[#1c2e24] shadow-sm'
        }`}
      >
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#196b44] text-white mb-2">
            <Printer className="w-3.5 h-3.5" />
            <span>Material de Divulgación y Afiches Imprimibles</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Afiches Imprimibles y Fichas con Código QR Universal
          </h2>
          <p
            className={`text-xs sm:text-sm mt-1 leading-relaxed ${
              isDarkMode ? 'text-[#8ca699]' : 'text-[#5d7a6b]'
            }`}
          >
            Cada afiche se imprime limpio en una sola hoja con diseño idéntico a la ficha y código QR público escaneable por cualquier persona en el mundo.
          </p>
        </div>

        {/* Style switcher */}
        <div
          className={`grid grid-cols-2 sm:flex p-1 rounded-2xl border shrink-0 w-full sm:w-auto ${
            isDarkMode ? 'bg-[#0d1a14] border-[#1d382b]' : 'bg-[#f0f6f2] border-[#d8eae0]'
          }`}
        >
          <button
            type="button"
            onClick={() => setPosterStyle('poster')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              posterStyle === 'poster'
                ? 'bg-[#196b44] text-white shadow-sm'
                : isDarkMode
                ? 'text-[#8ca699]'
                : 'text-[#486355]'
            }`}
          >
            <Printer className="w-3.5 h-3.5 shrink-0" /> Afiche Imprimible
          </button>
          <button
            type="button"
            onClick={() => setPosterStyle('social')}
            className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              posterStyle === 'social'
                ? 'bg-[#196b44] text-white shadow-sm'
                : isDarkMode
                ? 'text-[#8ca699]'
                : 'text-[#486355]'
            }`}
          >
            <Instagram className="w-3.5 h-3.5 shrink-0" /> Estilo Oscuro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="md:col-span-5 space-y-4">
          {/* Select species */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
            }`}
          >
            <label className="block text-xs font-bold uppercase tracking-wider text-[#196b44] dark:text-[#8ce2b6]">
              Selecciona una de las {COLOMBIAN_SPECIES.length} Especies
            </label>
            <select
              value={selectedSpeciesId}
              onChange={(e) => setSelectedSpeciesId(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs sm:text-sm font-bold focus:outline-none cursor-pointer ${
                isDarkMode
                  ? 'bg-[#0d1a14] border border-[#203a2e] text-white'
                  : 'bg-[#f5f9f6] border border-[#d6e4dc] text-[#1a3828]'
              }`}
            >
              <optgroup label="⭐ 4 Especies Insignia del Proyecto">
                {COLOMBIAN_SPECIES.filter((s) => s.isCoreProjectSpecies).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commonName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🌿 Demás Especies Endémicas y Emblemáticas">
                {COLOMBIAN_SPECIES.filter((s) => !s.isCoreProjectSpecies).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.commonName}
                  </option>
                ))}
              </optgroup>
            </select>

            <button
              type="button"
              onClick={handlePrintPoster}
              disabled={isPrinting}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-black bg-[#196b44] hover:bg-[#145a38] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>
                {isPrinting ? 'Preparando afiche...' : 'Imprimir Afiche / Guardar en PDF'}
              </span>
            </button>
          </div>

          {/* QR Destination Link Information */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#196b44] dark:text-[#8ce2b6] flex items-center gap-1.5">
                <QrCode className="w-4 h-4 shrink-0" /> Enlace Público del QR
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                <Globe className="w-3 h-3" /> Público · Todo el mundo
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Al escanear el código QR desde cualquier celular (sin cuentas ni contraseñas), se abre directamente la ficha interactiva de{' '}
              <strong>{species.commonName}</strong>:
            </p>

            <div
              className={`p-2.5 rounded-xl text-[11px] font-mono break-all border ${
                isDarkMode
                  ? 'bg-[#0b1712] border-[#224434] text-emerald-400'
                  : 'bg-stone-50 border-stone-200 text-emerald-800'
              }`}
            >
              {targetSpeciesUrl}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedUrl ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedUrl ? '¡Enlace copiado!' : 'Copiar enlace'}</span>
              </button>

              <a
                href={targetSpeciesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-xl text-xs font-bold bg-[#196b44] hover:bg-[#145a38] text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Probar QR</span>
              </a>
            </div>
          </div>

          {/* Social Copy Card */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-[#12221b] border-[#1e382c]' : 'bg-white border-[#e0ece4] shadow-sm'
            }`}
          >
            <label className="block text-xs font-bold uppercase tracking-wider text-[#196b44] dark:text-[#8ce2b6]">
              Texto Preparado para Redes Sociales
            </label>
            <div
              className={`p-3 rounded-xl text-xs font-sans whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto border ${
                isDarkMode
                  ? 'bg-[#0d1a14] border-[#1d382b] text-stone-300'
                  : 'bg-[#f7faf8] border-[#e0eee6] text-stone-700'
              }`}
            >
              {socialCopy}
            </div>

            <button
              type="button"
              onClick={handleCopyText}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-[#196b44] text-[#196b44] dark:text-[#8ce2b6] hover:bg-[#196b44]/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedText ? '¡Copiado al portapapeles!' : 'Copiar texto para redes'}</span>
            </button>
          </div>
        </div>

        {/* Poster Preview Column */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="w-full max-w-lg flex flex-wrap items-center justify-between gap-2 mb-2.5 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Vista Previa Exacta de Impresión
            </span>
            <button
              type="button"
              onClick={handlePrintPoster}
              disabled={isPrinting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-stone-950 transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Imprimir Ficha</span>
            </button>
          </div>

          <SpeciesPosterCard
            id="printable-poster"
            species={species}
            qrUrl={targetSpeciesUrl}
            variant={posterStyle}
          />
        </div>
      </div>
    </div>
  );
};
