import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
type ModalBackdrop = 'dark' | 'navy';

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

const BACKDROP_CLASSES: Record<ModalBackdrop, string> = {
  dark: 'bg-black/60',
  navy: 'bg-navy/50',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  backdrop?: ModalBackdrop;
  bodyClassName?: string;
  showCloseButton?: boolean;
  rounded?: boolean;
  accentClassName?: string;
}

// Shared modal shell: backdrop, Escape-to-close, click-outside-to-close, header/body/footer slots.
// `title`/`footer` accept any ReactNode so callers can render icons, step indicators, etc.
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  backdrop = 'dark',
  bodyClassName = 'px-5 py-4',
  showCloseButton = true,
  rounded = false,
  accentClassName,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${BACKDROP_CLASSES[backdrop]} backdrop-blur-sm p-4`}
      onMouseDown={onClose}
    >
      <div
        className={`relative flex max-h-[90vh] w-full ${SIZE_CLASSES[size]} flex-col overflow-hidden border border-rim bg-surface-raised shadow-2xl ${rounded ? 'rounded-lg' : ''}`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {accentClassName && <div className={`absolute inset-x-0 top-0 h-0.5 ${accentClassName}`} />}
        {(title || showCloseButton) && (
          <div className="flex shrink-0 items-center justify-between border-b border-rim px-5 py-4">
            {title && <div className="min-w-0 flex-1 text-base font-semibold text-ink">{title}</div>}
            {showCloseButton && (
              <button
                type="button"
                className="ml-auto shrink-0 p-1 text-ink-3 hover:text-ink hover:bg-surface-overlay transition-colors"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <div className={`min-h-0 flex-1 overflow-y-auto ${bodyClassName}`}>{children}</div>

        {footer && <div className="shrink-0 border-t border-rim px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
