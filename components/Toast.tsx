
import React, { useEffect, useState } from 'react';

interface ToastProps {
  message: string | null;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Allow time for fade-out animation before clearing message from parent
        setTimeout(onClose, 500); 
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-2xl z-50 transition-all duration-500 pointer-events-none ${
        visible && message ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}
    >
      {message}
    </div>
  );
};

export default Toast;
