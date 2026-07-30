import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';
import './Toast.css';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const generateId = () => `toast_${Math.random().toString(36).slice(2, 10)}`;

export const ToastProvider = ({ children, position = 'top-right' }) => {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timeoutId = timers.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    ({ type = 'info', title, description, duration = 4000 }) => {
      const id = generateId();
      setToasts((prev) => [...prev, { id, type, title, description }]);
      if (duration > 0) {
        const timeoutId = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timeoutId);
      }
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      push,
      dismiss,
      success: (title, description, options = {}) => push({ type: 'success', title, description, ...options }),
      error: (title, description, options = {}) => push({ type: 'error', title, description, ...options }),
      info: (title, description, options = {}) => push({ type: 'info', title, description, ...options }),
      warning: (title, description, options = {}) => push({ type: 'warning', title, description, ...options }),
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className={`toast-stack toast-stack--${position}`} aria-live="polite" aria-atomic="false">
            {toasts.map((toast) => {
              const Icon = ICONS[toast.type] || Info;
              return (
                <div key={toast.id} className={`toast toast--${toast.type}`} role="status">
                  <span className="toast__icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <div className="toast__content">
                    {toast.title && <p className="toast__title">{toast.title}</p>}
                    {toast.description && <p className="toast__description">{toast.description}</p>}
                  </div>
                  <button
                    type="button"
                    className="toast__dismiss"
                    onClick={() => dismiss(toast.id)}
                    aria-label="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

export default ToastContext;