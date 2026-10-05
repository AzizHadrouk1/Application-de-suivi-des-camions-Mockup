import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg';
}

export function Drawer({ open, onClose, title, subtitle, headerExtra, children, footer, width = 'md' }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[1150]">
          <motion.div
          className="absolute inset-0 bg-navy-950/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose} />
        
          <motion.aside
          role="dialog"
          aria-modal="true"
          className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-pop ${width === 'lg' ? 'max-w-[720px]' : 'max-w-[560px]'}`}
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 32, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
          
            <header className="border-b border-line px-6 pb-0 pt-5">
              <div className="flex items-start justify-between gap-4 pb-4">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-ink">{title}</div>
                  {subtitle && <div className="mt-1 text-sm text-ink-muted">{subtitle}</div>}
                </div>
                <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              {headerExtra}
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <footer className="flex flex-wrap gap-2 border-t border-line bg-canvas/60 px-6 py-3">{footer}</footer>}
          </motion.aside>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}