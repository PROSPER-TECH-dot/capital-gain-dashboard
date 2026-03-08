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
    <div className={`fixed top-20 right-3 z-50 max-w-[280px] w-full ${isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}>
      <div className="rounded-2xl p-3.5 bg-background/80 backdrop-blur-xl border border-border/60 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium text-foreground flex-1 leading-relaxed">{message}</p>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X size={14} />
          </button>
        </div>
        <div className="mt-2.5 h-[2px] bg-muted/50 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full notification-timer" />
        </div>
      </div>
    </div>
  );
};

export default Notification;
