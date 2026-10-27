import React from 'react';
import { MapPin, Sparkles, Star, Leaf } from 'lucide-react';
import { Species } from '../types';
import { ScannableQRCode } from './ScannableQRCode';
import { getConservationLabel, getSpeciesCardTheme } from '../utils/speciesCardTheme';

interface SpeciesPosterCardProps {
  species: Species;
  qrUrl: string;
  variant?: 'poster' | 'social';
  isPrintCopy?: boolean;
  id?: string;
}

/**
 * Unified Species Ficha & Printable Educational Poster Card.
 * Mirrors the exact visual hierarchy, badges, photography, and data blocks of the
 * interactive species ficha while adding an institutional header and universal QR code.
 */
export const SpeciesPosterCard: React.FC<SpeciesPosterCardProps> = ({
  species,
  qrUrl,
  variant = 'poster',
  isPrintCopy = false,
  id,
}) => {
  const theme = getSpeciesCardTheme(species);
  const isSocialDark = variant === 'social';

  return (
    <div
      id={id}
      className={`w-full rounded-3xl overflow-hidden border-4 border-[#196b44] ${
        isPrintCopy ? 'bioexplora-print-card' : 'max-w-lg shadow-2xl'
      } ${
        isSocialDark
          ? 'bg-[#0e1d16] text-[#ecf3ef]'
          : 'bg-white text-[#14241b]'
      }`}
    >
      {/* Institutional Poster Top Header */}
      <div className="px-4 py-3 bg-[#196b44] text-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center font-black text-base shrink-0">
            🇨🇴
          </div>
          <div className="min-w-0">
            <span className="text-xs sm:text-sm font-black tracking-tight block leading-tight truncate">
              BioExplora Colombia
            </span>
            <span className="text-[10px] text-emerald-100 font-semibold block leading-tight">
              Ficha de Divulgación y Biodiversidad
            </span>
          </div>
        </div>

        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 shrink-0">
          {species.endemicLevel === 'Nativa Emblemática'
            ? 'Tesoro Insular'
            : 'Solo en Colombia'}
        </span>
      </div>

      {/* Thematic Headline Banner */}
      <div className="px-4 py-2 bg-amber-400 text-stone-950 text-center border-b border-amber-500/40">
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-snug">
          {species.category === 'Flora'
            ? '¿SABÍAS QUE ESTA PLANTA ÚNICA CRECE EN NUESTRO TERRITORIO?'
            : '¿SABÍAS QUE ESTA ESPECIE HABITA EN LOS ECOSISTEMAS DE COLOMBIA?'}
        </p>
      </div>

      {/* Main Species Photography + Ficha Badges & Overlaid Names */}
      <div
        className={`relative overflow-hidden bg-stone-950 ${
          isPrintCopy ? 'h-56' : 'h-64 sm:h-72'
        }`}
      >
        <img
          src={species.imageUrl}
          alt={species.commonName}
          loading="eager"
          decoding="sync"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/35 to-transparent" />

        {/* Region, Insignia & Conservation Status Badges (Identical to Ficha) */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${theme.badgeBg}`}>
              {species.region}
            </span>
            {species.isCoreProjectSpecies && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current" />
                Insignia
              </span>
            )}
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-950/90 text-emerald-300 border border-emerald-400/40 shrink-0">
            {getConservationLabel(species.conservationStatus)}
          </span>
        </div>

        {/* Common & Scientific Names at Bottom of Photo */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {species.commonName}
          </h3>
          <p className="text-xs italic font-serif text-stone-200 mt-0.5">
            {species.scientificName} · <span className="not-italic font-sans text-[11px] font-semibold text-emerald-300">{species.endemicLevel}</span>
          </p>
        </div>
      </div>

      {/* Ficha Content Body */}
      <div
        className={`p-4 sm:p-5 space-y-2.5 ${
          isSocialDark ? 'bg-[#0e1d16] text-[#ecf3ef]' : 'bg-white text-[#14241b]'
        }`}
      >
        {/* Geographic Location & Altitude */}
        <div
          className={`flex flex-wrap items-center justify-between gap-1.5 text-xs px-3 py-2 rounded-xl border ${
            isSocialDark
              ? 'bg-[#152a20] border-[#244736] text-emerald-200'
              : 'bg-[#f3faf6] border-[#d2e8dc] text-[#17462f]'
          }`}
        >
          <span className="font-bold flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="leading-snug">{species.coordinates.locationName}</span>
          </span>
          <span className="font-black text-[10px] uppercase tracking-wide shrink-0 opacity-90">
            {species.elevationRange}
          </span>
        </div>

        {/* ✨ ¿Por qué es especial? (Exact match to Ficha card) */}
        <div
          className={`p-3 rounded-2xl border text-xs leading-relaxed ${
            isSocialDark
              ? 'bg-[#13261d] border-[#214031] text-stone-200'
              : 'bg-[#f8faf8] border-[#dfece4] text-stone-800'
          }`}
        >
          <strong
            className="block text-[10px] font-black uppercase tracking-wider mb-0.5"
            style={{ color: isSocialDark ? '#6ee7b7' : theme.posterAccentHex }}
          >
            ✨ ¿Por qué es especial?
          </strong>
          <p className="font-medium leading-snug">{theme.specialFeature}</p>
        </div>

        {/* 💡 Dato Curioso (Exact match to Ficha card) */}
        <div
          className={`p-3 rounded-2xl border text-xs leading-relaxed ${
            isSocialDark
              ? 'bg-amber-500/15 border-amber-400/35 text-amber-100'
              : 'bg-amber-50 border-amber-300 text-stone-900'
          }`}
        >
          <strong
            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider mb-0.5 ${
              isSocialDark ? 'text-amber-300' : 'text-amber-800'
            }`}
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>💡 Dato Curioso:</span>
          </strong>
          <p className="font-medium leading-snug">{species.curiousFact}</p>
        </div>

        {/* 🌱 Función Ecológica */}
        <div
          className={`px-3 py-2 rounded-xl border text-[11px] leading-snug ${
            isSocialDark
              ? 'bg-[#13261d] border-[#214031] text-stone-300'
              : 'bg-stone-50 border-stone-200 text-stone-700'
          }`}
        >
          <strong
            className={`inline-flex items-center gap-1 font-black mr-1 ${
              isSocialDark ? 'text-emerald-300' : 'text-[#196b44]'
            }`}
          >
            <Leaf className="w-3 h-3 inline shrink-0" />
            <span>Importancia ecológica:</span>
          </strong>
          <span className="font-medium">{species.ecologicalRole}</span>
        </div>

        {/* Universal Scannable QR Code Section */}
        <div
          className={`pt-2.5 border-t-2 border-dashed flex items-center gap-3.5 ${
            isSocialDark ? 'border-[#254637]' : 'border-stone-200'
          }`}
        >
          <div className="p-1.5 rounded-2xl bg-white border-2 border-[#196b44] shrink-0 flex items-center justify-center">
            <ScannableQRCode
              text={qrUrl}
              size={98}
              darkColor="#000000"
              lightColor="#ffffff"
              alt={`Código QR público de ${species.commonName}`}
            />
          </div>

          <div className="space-y-1 min-w-0 text-left">
            <span
              className={`text-xs font-black uppercase tracking-tight block leading-tight ${
                isSocialDark ? 'text-emerald-300' : 'text-[#196b44]'
              }`}
            >
              ¡Escanea con cualquier celular!
            </span>
            <p
              className={`text-[11px] leading-snug ${
                isSocialDark ? 'text-stone-300' : 'text-stone-700'
              }`}
            >
              Apunta la cámara de tu teléfono para abrir la ficha completa de esta especie, ver su ubicación en el mapa y participar en la encuesta ambiental.
            </p>
            <span
              className={`text-[9.5px] font-semibold block pt-0.5 ${
                isSocialDark ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              Acceso público universal · Fuentes: Instituto Humboldt, SiB Colombia & UICN
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
