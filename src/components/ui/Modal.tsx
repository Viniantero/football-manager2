import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-chalk-950/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-chalk-800 bg-chalk-900 shadow-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-chalk-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-whistle-400" />
            <h2 className="font-display text-base font-semibold uppercase tracking-wide2 text-chalk-100">
              {title}
            </h2>
          </div>
          <button className="btn-ghost p-1" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </header>
        <div className="px-4 py-4 text-sm text-chalk-300">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-chalk-800 px-4 py-3">{footer}</footer>}
      </div>
    </div>
  );
}
