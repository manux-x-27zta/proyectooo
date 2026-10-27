import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PrintSheetPortalProps {
  children: React.ReactNode;
  active?: boolean;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Mounts a top-level print-only container directly into `document.body`.
 * On screen, `.bioexplora-print-sheet` is hidden (`display: none`).
 * During `@media print`, `body.has-print-sheet > #root` is completely hidden so ONLY
 * this clean single-page sheet is rendered by the printer / PDF engine without
 * navbar, controls, scroll clipping, or extra blank pages.
 */
export const PrintSheetPortal: React.FC<PrintSheetPortalProps> = ({
  children,
  active = true,
  orientation = 'portrait',
}) => {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return;

    const currentCount = Number(document.body.getAttribute('data-print-sheets') || '0');
    document.body.setAttribute('data-print-sheets', String(currentCount + 1));
    document.body.setAttribute('data-print-orientation', orientation);
    document.body.classList.add('has-print-sheet');

    return () => {
      const remaining = Math.max(
        0,
        Number(document.body.getAttribute('data-print-sheets') || '1') - 1
      );
      if (remaining === 0) {
        document.body.removeAttribute('data-print-sheets');
        document.body.removeAttribute('data-print-orientation');
        document.body.classList.remove('has-print-sheet');
      } else {
        document.body.setAttribute('data-print-sheets', String(remaining));
      }
    };
  }, [active, orientation]);

  if (!active || typeof document === 'undefined') return null;

  return createPortal(
    <div className="bioexplora-print-sheet" aria-hidden="true">
      {children}
    </div>,
    document.body
  );
};
