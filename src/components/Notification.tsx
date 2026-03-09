import { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  variant?: 'default' | 'success';
}

const Notification = ({ message, onClose, variant = 'default' }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedRef = useRef(false);

  const handleClose = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;

    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 400);
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);
    autoCloseTimerRef.current = setTimeout(() => {
      handleClose();
    }, 2500);

    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  if (!isVisible && !isExiting) return null;

  const isSuccess = variant === 'success';

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-[420px] w-[90vw] ${isExiting ? 'animate-slide-out-up' : 'animate-slide-in-down'}`}>
      <div className={`rounded-xl p-4 backdrop-blur-xl border shadow-xl ${
        isSuccess
          ? 'bg-green-600/95 border-green-400/40'
          : 'bg-background/95 border-border/40'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <p className={`text-sm font-medium flex-1 leading-relaxed ${isSuccess ? 'text-white' : 'text-foreground'}`}>{message}</p>
          <button onClick={handleClose} className={`transition-colors flex-shrink-0 p-1 ${isSuccess ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}>
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 h-1 bg-muted/30 rounded-full overflow-hidden">
          <div className={`h-full rounded-full notification-timer ${isSuccess ? 'bg-white/80' : 'bg-primary/80'}`} />
        </div>
      </div>
    </div>
  );
};

export default Notification;
