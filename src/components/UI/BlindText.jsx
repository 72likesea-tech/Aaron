import { useState } from 'react';

export default function BlindText({ text, className = '' }) {
    const [revealed, setRevealed] = useState(false);

    if (!text) return null;

    return (
        <p
            className={`blind-text-container ${revealed ? 'revealed' : 'blurred'} ${className}`}
            onClick={() => setRevealed(true)}
        >
            <span className="text-content">{text}</span>
            {!revealed && <span className="tap-hint">터치하여 번역 보기</span>}
            <style>{`
        .blind-text-container {
          position: relative;
          font-size: 14px;
          margin-top: 6px;
          cursor: pointer;
          user-select: none;
          transition: all 0.4s ease;
          display: inline-block;
          color: var(--text-secondary);
        }
        .text-content {
          transition: filter 0.4s ease, opacity 0.4s ease;
          line-height: 1.5;
        }
        .blurred .text-content {
          filter: blur(8px);
          opacity: 0.6;
        }
        .revealed .text-content {
          filter: blur(0);
          opacity: 1;
          color: var(--accent-primary);
          font-weight: 500;
        }
        .tap-hint {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          color: var(--text-primary);
          background: rgba(0, 0, 0, 0.4);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 2;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .revealed .tap-hint {
          display: none;
        }
      `}</style>
        </p>
    );
}
