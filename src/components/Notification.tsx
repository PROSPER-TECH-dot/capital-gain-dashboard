import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification = ({ message, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 400);
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(handleClose, 2500);
    return () => clearTimeout(timer);
  }, [handleClose]);

  if (!isVisible && !isExiting) return null;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-[420px] w-[90vw] ${isExiting ? 'animate-slide-out-up' : 'animate-slide-in-down'}`}>
      <div className="rounded-xl p-4 bg-background/95 backdrop-blur-xl border border-border/40 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-foreground flex-1 leading-relaxed">{message}</p>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1">
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 h-1 bg-muted/30 rounded-full overflow-hidden">
          <div className="h-full bg-primary/80 rounded-full notification-timer" />
        </div>
      </div>
    </div>
  );
};

export default Notification;
