import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import Toast from './Toast';

type ToastType = 'success' | 'error' | 'warning';
type AddToast = (message: string, type?: ToastType) => void;

const ToastContext = createContext<AddToast | null>(null);

interface ToastItem {
 id: number;
 message: string;
 type: ToastType;
}

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
 const [toasts, setToasts] = useState<ToastItem[]>([]);

 const addToast = useCallback<AddToast>((message, type = 'success') => {
 const id = ++idCounter;
 setToasts((prev) => [...prev, { id, message, type }]);
 setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
 }, []);

 const removeToast = useCallback((id: number) => {
 setToasts((prev) => prev.filter((t) => t.id !== id));
 }, []);

 return (
 <ToastContext.Provider value={addToast}>
 {children}
 <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none" aria-live="polite">
 {toasts.map((t) => (
 <div key={t.id} className="pointer-events-auto">
 <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
 </div>
 ))}
 </div>
 </ToastContext.Provider>
 );
}

export function useToast(): AddToast {
 const ctx = useContext(ToastContext);
 if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
 return ctx;
}
