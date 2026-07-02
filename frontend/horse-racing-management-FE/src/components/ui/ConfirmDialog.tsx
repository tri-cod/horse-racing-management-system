import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
 open: boolean;
 onClose: () => void;
 onConfirm: () => void;
 title?: string;
 message?: string;
 confirmLabel?: string;
 cancelLabel?: string;
 variant?: 'danger' | 'primary';
 loading?: boolean;
}

export default function ConfirmDialog({
 open,
 onClose,
 onConfirm,
 title = 'Are you sure?',
 message,
 confirmLabel = 'Confirm',
 cancelLabel = 'Cancel',
 variant = 'danger',
 loading = false,
}: ConfirmDialogProps) {
 return (
 <Modal open={open} onClose={onClose} size="sm">
 <div className="flex flex-col items-center gap-3 text-center">
 <div className={`flex h-12 w-12 items-center justify-center rounded-full ${variant === 'danger' ? 'bg-fail-subtle text-fail' : 'bg-gold/10 text-gold'}`}
 >
 <AlertTriangle size={24} />
 </div>
 <h3 className="text-base font-semibold text-ink">{title}</h3>
 {message && <p className="text-sm text-ink-3">{message}</p>}
 <div className="mt-2 flex w-full gap-3">
 <Button variant="ghost" className="flex-1" onClick={onClose} disabled={loading}>
 {cancelLabel}
 </Button>
 <Button
 variant={variant === 'danger' ? 'dark' : 'primary'}
 className="flex-1"
 onClick={onConfirm}
 disabled={loading}
 >
 {loading ? 'Please wait…' : confirmLabel}
 </Button>
 </div>
 </div>
 </Modal>
 );
}
