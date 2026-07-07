import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
 open: boolean;
 onClose: () => void;
 title?: string;
 children: ReactNode;
 size?: ModalSize;
}

export default function Modal({ open, onClose, title, children, size: _size = 'md' }: ModalProps) {
 useEffect(() => {
 if (!open) return;
 const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
 document.addEventListener('keydown', handleKey);
 return () => document.removeEventListener('keydown', handleKey);
 }, [open, onClose]);

 if (!open) return null;

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
 onMouseDown={onClose}
 >
 <div
 className="relative w-full max-w-md border border-rim bg-surface-raised shadow-2xl"
 onMouseDown={(e) => e.stopPropagation()}
 role="dialog"
 aria-modal="true"
 >
 <div className="flex items-center justify-between border-b border-rim px-5 py-4">
 {title && <h3 className="text-base font-semibold text-ink">{title}</h3>}
 <button
 type="button"
 className="ml-auto p-1 text-ink-3 hover:text-ink hover:bg-surface-overlay transition-colors"
 onClick={onClose}
 aria-label="Close"
 >
 <X size={20} />
 </button>
 </div>
 <div className="px-5 py-4">{children}</div>
 </div>
 </div>
 );
}
