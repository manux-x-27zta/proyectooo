import React, { useRef, useState } from 'react';
import {
  X,
  Printer,
  Share2,
  Award,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserDiploma } from '../types';
import { BioExploraLogo } from './BioExploraLogo';
import { PrintSheetPortal } from './PrintSheetPortal';
import { usePublicBaseUrl } from '../utils/publicUrl';

interface DigitalDiplomaModalProps {
  diploma: UserDiploma;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export const DigitalDiplomaModal: React.FC<DigitalDiplomaModalProps> = ({
  diploma,
  isOpen,
  onClose,
  isDarkMode = false,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const publicBaseUrl = usePublicBaseUrl();

  if (!isOpen) return null;

  const recipientName =
    diploma.username &&
    diploma.username !== 'Estudiante BioExplora' &&
    diploma.username !== 'Estudiante Explorador' &&
    diploma.username !== 'Participante Ciudadano' &&
    diploma.username !== 'invitado'
      ? diploma.username
      : (typeof window !== 'undefined'
          ? localStorage.getItem('bioexplora_diploma_recipient_name') ||
            localStorage.getItem('bioexplora_student_name')
          : null) ||
        diploma.username ||
        'Estudiante BioExplora';

  const handlePrintOrDownload = () => {
    window.print();
  };

  const handleShare = () => {
    const shareText = `¡Obtuve mi ${diploma.badgeName} (${diploma.badgeLevel.toUpperCase()}) en BioExplora Colombia con un puntaje de ${diploma.scorePercentage}%! Certificado N° ${diploma.certificateNumber}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Diploma BioExplora: ${diploma.badgeName}`,
          text: shareText,
          url: publicBaseUrl,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(`${shareText} - ${publicBaseUrl}`)
        .then(() => {
          setCopiedShare(true);
          setTimeout(() => setCopiedShare(false), 2500);
        })
        .catch(() => {});
    }
  };

  const renderCertificateCanvas = (isPrintCopy = false) => (
    <div
      ref={isPrintCopy ? undefined : certificateRef}
      className={`relative rounded-2xl border-4 sm:border-8 border-double border-amber-600/50 p-4 sm:p-10 bg-gradient-to-b from-[#fafcfb] via-white to-[#f4faf6] text-stone-900 overflow-hidden ${
        isPrintCopy ? 'bioexplora-print-diploma border-8 p-8' : 'shadow-xl'
      }`}
    >
      {/* Subtle Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-96 h-96 text-emerald-950">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      </div>

      {/* Colombian Tricolor Ribbon Header */}
      <div className="absolute top-0 inset-x-0 h-2 flex">
        <div className="w-1/2 bg-amber-400" />
        <div className="w-1/4 bg-blue-600" />
        <div className="w-1/4 bg-rose-600" />
      </div>

      {/* Header with Official Logo */}
      <div className="flex flex-col items-center text-center space-y-2 relative z-10 pt-2">
        <BioExploraLogo variant="crest" size="lg" />

        <div className="pt-2">
          <span className="inline-block text-[9px] sm:text-[11px] font-black uppercase tracking-[0.1em] sm:tracking-[0.25em] text-emerald-800 border-b-2 border-emerald-700/30 pb-0.5">
            Certificado Oficial de Aprobación y Excelencia Biológica
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-[#163e2a] mt-2 font-serif tracking-tight">
            DIPLOMA DE CONOCIMIENTO BIOLÓGICO
          </h2>
        </div>
      </div>

      {/* Awardee Section */}
      <div className="text-center my-5 sm:my-6 space-y-2 relative z-10">
        <p className="text-xs sm:text-sm text-stone-600 font-serif italic">
          El Comité de BioExplora certifica con honor que:
        </p>

        <div className="py-1.5 flex items-center justify-center">
          <h1 className="text-xl sm:text-4xl font-black text-emerald-900 tracking-tight font-serif uppercase decoration-amber-500/50 underline underline-offset-8 select-text break-words max-w-full">
            {recipientName}
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-stone-700 max-w-xl mx-auto pt-2 leading-relaxed">
          Ha demostrado riguroso conocimiento y superado satisfactoriamente los requisitos evaluables del nivel:
        </p>

        {/* Badge Highlight Pill */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md my-2 max-w-full">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="font-black text-xs sm:text-sm tracking-wide">
            {diploma.badgeName} ({diploma.badgeLevel.toUpperCase()})
          </span>
          <span className="text-[11px] sm:text-xs bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-full">
            {diploma.scorePercentage}% Aciertos
          </span>
        </div>

        <p className="text-xs font-bold text-stone-600">
          Tema: <span className="text-stone-900">{diploma.subject}</span>
        </p>
      </div>

      {/* Official Congratulation Message */}
      <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 text-center max-w-xl mx-auto my-4 relative z-10">
        <p className="text-xs text-emerald-950 font-serif italic leading-relaxed">
          "{diploma.recognitionText}"
        </p>
      </div>

      {/* Footer: Signatures, Date and Verification ID */}
      <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-stone-200 grid grid-cols-3 items-end gap-4 text-center text-xs relative z-10">
        <div className="space-y-1">
          <div className="font-serif italic text-sm sm:text-base text-emerald-900 font-bold border-b border-stone-400 pb-1 max-w-[170px] mx-auto">
            Comité de BioExplora
          </div>
          <span className="text-[10px] text-stone-600 font-medium block">
            Comité de BioExplora
          </span>
        </div>

        <div className="flex flex-col items-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 font-bold text-[9px]">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
          </div>
          <span className="text-[9px] font-mono font-bold text-stone-600">
            ID: {diploma.certificateNumber}
          </span>
          <span className="text-[9px] text-stone-500">
            {new Date(diploma.issuedAt).toLocaleDateString('es-CO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>

        <div className="space-y-1">
          <div className="font-serif italic text-sm sm:text-base text-emerald-900 font-bold border-b border-stone-400 pb-1 max-w-[170px] mx-auto">
            Dirección de BioExplora
          </div>
          <span className="text-[10px] text-stone-600 font-medium block">
            Dirección de BioExplora
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <PrintSheetPortal active={isOpen} orientation="portrait">
        {renderCertificateCanvas(true)}
      </PrintSheetPortal>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto">
        <div
          className={`relative w-full max-w-3xl max-h-[92dvh] overflow-y-auto rounded-3xl border shadow-2xl p-4 sm:p-8 space-y-4 sm:space-y-6 transition-all ${
            isDarkMode
              ? 'bg-[#0a1811] border-[#224434] text-white'
              : 'bg-white border-[#d8eae0] text-stone-900'
          }`}
        >
          {/* Modal Top Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-inherit">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-500 font-bold shrink-0">
                <Award className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black leading-none truncate">
                  Diploma Oficial Digital
                </h3>
                <span className="text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400 font-mono truncate block mt-0.5">
                  Certificado: {diploma.certificateNumber}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
              <button
                type="button"
                onClick={handleShare}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Compartir logro"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Compartir</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrintOrDownload}
                className="px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black bg-[#196b44] hover:bg-[#145a38] text-white transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                title="Imprimir o guardar en PDF"
              >
                <Printer className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">PDF / Imprimir</span>
                <span className="hidden sm:inline">Descargar / Imprimir PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {renderCertificateCanvas(false)}
        </div>
      </div>
    </>
  );
};
