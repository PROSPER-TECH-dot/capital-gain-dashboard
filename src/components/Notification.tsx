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
    }, 300);
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(handleClose, 2500);
    return () => clearTimeout(timer);
  }, [handleClose]);

  if (!isVisible && !isExiting) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${isExiting ? 'notification-slide-out' : 'notification-slide'}`}>
      <div className="glass rounded-xl p-4 mr-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground flex-1">{message}</p>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="mt-3 h-0.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full notification-timer" />
        </div>
      </div>
    </div>
  );
};

export default Notification;
