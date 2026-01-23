import { useState } from 'react';

export default function BlindText({ text, className = '' }) {
    const [revealed, setRevealed] = useState(false);

    return (
        <p
            className={`translation-sub ${revealed ? 'visible' : 'blind'} ${className}`}
            onDoubleClick={() => setRevealed(true)}
            onClick={(e) => {
                const now = Date.now();
                // Check if previous click was less than 300ms ago or simple click (user requested tap to reveal)
                // Original code had double tap logic, but user asked for "tap to reveal". 
                // Let's support both: direct click reveals it for better UX on mobile/desktop.
                setRevealed(true);
            }}
        >
            {revealed ? text : "Tap to reveal / 눌러서 보기"}
            <style>{`
        .translation-sub {
          font-size: 14px;
          color: var(--accent-primary);
          margin-top: 8px;
          cursor: pointer;
          transition: all 0.3s;
          user-select: none;
          min-height: 24px;
          font-weight: 500;
          display: inline-block; /* Ensure it wraps correctly */
        }
        .translation-sub.blind {
            background: rgba(255, 255, 255, 0.15);
            color: transparent;
            text-shadow: 0 0 8px rgba(255,255,255,0.4);
            border-radius: 6px;
            padding: 4px 8px;
            position: relative;
        }
        /* Mobile/Touch friendly visual hint for blind text */
        .translation-sub.blind:after {
            content: 'Tap to reveal';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: rgba(255,255,255,0.6);
            font-size: 11px;
            font-weight: 400;
            text-shadow: none;
            white-space: nowrap;
        }
        .translation-sub.visible {
            color: #a78bfa; /* Lighter purple for better readability against dark bg */
        }
      `}</style>
        </p>
    );
}
