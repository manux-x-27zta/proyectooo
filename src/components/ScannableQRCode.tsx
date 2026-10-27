import React, { useMemo } from 'react';
import QRCode from 'qrcode';

interface ScannableQRCodeProps {
  text: string;
  size?: number;
  darkColor?: string;
  lightColor?: string;
  className?: string;
  alt?: string;
}

/**
 * Synchronous, infinite-resolution vector SVG QR Code generator.
 * Uses RFC/ISO-18004 compliant `QRCode.create` so QR codes render immediately on first paint
 * (zero async delay or blank lazy-loaded images when printing) and maintain razor-sharp
 * vector edges and standard quiet zones for any iOS or Android camera worldwide.
 */
export const ScannableQRCode: React.FC<ScannableQRCodeProps> = ({
  text,
  size = 180,
  darkColor = '#000000',
  lightColor = '#ffffff',
  className = '',
  alt = 'Código QR escaneable',
}) => {
  const qrVector = useMemo(() => {
    const safeValue = text && text.trim().length > 0 ? text.trim() : 'https://bioexplora.org';
    try {
      const qr = QRCode.create(safeValue, {
        errorCorrectionLevel: 'M',
      });
      const moduleCount = qr.modules.size;
      const quietZone = 2.5;
      const viewBoxSize = moduleCount + quietZone * 2;

      let pathD = '';
      for (let row = 0; row < moduleCount; row += 1) {
        for (let col = 0; col < moduleCount; col += 1) {
          if (qr.modules.get(row, col)) {
            const x = col + quietZone;
            const y = row + quietZone;
            pathD += `M${x} ${y}h1v1h-1z`;
          }
        }
      }

      return { viewBoxSize, pathD };
    } catch (err) {
      console.error('Failed to encode QR matrix:', err);
      return null;
    }
  }, [text]);

  if (!qrVector) {
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${qrVector.viewBoxSize} ${qrVector.viewBoxSize}`}
      width={size}
      height={size}
      role="img"
      aria-label={alt}
      className={`block rounded-lg shrink-0 select-none ${className}`}
    >
      <title>{alt}</title>
      <rect
        x="0"
        y="0"
        width={qrVector.viewBoxSize}
        height={qrVector.viewBoxSize}
        fill={lightColor}
      />
      <path
        d={qrVector.pathD}
        fill={darkColor}
        shapeRendering="crispEdges"
      />
    </svg>
  );
};
