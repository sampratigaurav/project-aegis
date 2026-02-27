import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ShieldCheck, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now().toString();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 5s
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl min-w-[300px] max-w-sm ${t.type === 'error'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-100'
                                    : t.type === 'success'
                                        ? 'bg-aegis-accent/10 border-aegis-accent/20 text-aegis-accent'
                                        : 'bg-white/10 border-white/20 text-white'
                                }`}
                        >
                            {t.type === 'error' && <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />}
                            {t.type === 'success' && <ShieldCheck className="w-5 h-5 mt-0.5 flex-shrink-0" />}

                            <div className="flex-1 text-sm font-medium leading-relaxed">{t.message}</div>

                            <button
                                onClick={() => removeToast(t.id)}
                                className="opacity-50 hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
