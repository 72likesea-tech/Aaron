import { AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export default function ErrorBanner({ message, onClose }) {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onClose, 5000); // Auto hide after 5s
            return () => clearTimeout(timer);
        }
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className="error-banner">
            <div className="error-content">
                <AlertCircle size={20} />
                <span>{message}</span>
            </div>
            <button onClick={onClose} className="close-btn"><X size={18} /></button>
            <style>{`
        .error-banner {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #FF453A;
          color: white;
          padding: 12px 20px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 12px rgba(255, 69, 58, 0.4);
          z-index: 9999;
          animation: slideUp 0.3s ease-out;
          max-width: 90%;
        }
        .error-content {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: white;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
