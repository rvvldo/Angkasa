import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertContextType {
  showAlert: (message: string, type?: AlertType, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string, confirmText?: string) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

interface AlertState {
  isOpen: boolean;
  message: string;
  title: string;
  type: AlertType;
  confirmText: string;
  cancelText: string;
  resolve: (value: any) => void;
}

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const closetimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = useCallback((message: string, type: AlertType = 'info', title?: string) => {
    return new Promise<void>((resolve) => {
      setAlertState({
        isOpen: true,
        message,
        title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Sukses' : 'Info'),
        type,
        confirmText: 'OK',
        cancelText: '',
        resolve: () => {
          setAlertState(null);
          resolve();
        },
      });

      // Auto close for info/success after 3 seconds
      if (type === 'success' || type === 'info') {
        if (closetimeoutRef.current) clearTimeout(closetimeoutRef.current);
        closetimeoutRef.current = setTimeout(() => {
           setAlertState(prev => {
             if (prev && prev.isOpen) {
               prev.resolve(null);
               return null;
             }
             return prev;
           });
        }, 3000);
      }
    });
  }, []);

  const showConfirm = useCallback((message: string, title: string = 'Konfirmasi', confirmText: string = 'Ya, Lanjutkan') => {
    return new Promise<boolean>((resolve) => {
      setAlertState({
        isOpen: true,
        message,
        title,
        type: 'confirm',
        confirmText,
        cancelText: 'Batal',
        resolve: (result: boolean) => {
          setAlertState(null);
          resolve(result);
        },
      });
    });
  }, []);

  const handleClose = (result: boolean | null) => {
    if (closetimeoutRef.current) clearTimeout(closetimeoutRef.current);
    if (alertState) {
      alertState.resolve(result);
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AnimatePresence>
        {alertState && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => handleClose(alertState.type === 'confirm' ? false : null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center border-2 
                  ${alertState.type === 'success' ? 'bg-green-500/10 border-green-500 text-green-400' : 
                    alertState.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-400' :
                    alertState.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' :
                    alertState.type === 'confirm' ? 'bg-blue-500/10 border-blue-500 text-blue-400' :
                    'bg-slate-500/10 border-slate-500 text-slate-400'}`}
                >
                  {alertState.type === 'success' && <CheckCircle size={32} />}
                  {alertState.type === 'error' && <AlertCircle size={32} />}
                  {alertState.type === 'warning' && <AlertTriangle size={32} />}
                  {alertState.type === 'confirm' && <AlertCircle size={32} />}
                  {alertState.type === 'info' && <Info size={32} />}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{alertState.title}</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">{alertState.message}</p>

                <div className="flex gap-3 justify-center">
                  {alertState.type === 'confirm' && (
                    <button
                      onClick={() => handleClose(false)}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition border border-white/5"
                    >
                      {alertState.cancelText}
                    </button>
                  )}
                  <button
                    onClick={() => handleClose(true)}
                    className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95
                      ${alertState.type === 'error' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 
                        alertState.type === 'success' ? 'bg-green-600 hover:bg-green-500 shadow-green-500/20' :
                        'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'}`}
                  >
                    {alertState.confirmText}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
