import { useRef, useEffect } from 'react';

export default function TimeDial({ value, onChange }) {
    const [hours, minutes] = value.split(':').map(Number);

    const hourRef = useRef(null);
    const minuteRef = useRef(null);

    const scrollHandler = (type, e) => {
        // Simple scroll implementation - in a real app this would be more complex with snap
        // For this demo, we'll just use buttons or simple selection to ensure usability
    };

    // Simplified Dial UI: Two columns with scrollable numbers
    return (
        <div className="time-dial-container">
            <div className="dial-column">
                <label>Hour</label>
                <div className="dial-scroll">
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div
                            key={i}
                            className={`dial-item ${hours === i ? 'active' : ''}`}
                            onClick={() => onChange(`${i.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)}
                        >
                            {i.toString().padStart(2, '0')}
                        </div>
                    ))}
                </div>
            </div>
            <div className="dial-separator">:</div>
            <div className="dial-column">
                <label>Minute</label>
                <div className="dial-scroll">
                    {Array.from({ length: 12 }).map((_, i) => {
                        const m = i * 5;
                        return (
                            <div
                                key={m}
                                className={`dial-item ${minutes === m ? 'active' : ''}`}
                                onClick={() => onChange(`${hours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)}
                            >
                                {m.toString().padStart(2, '0')}
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        .time-dial-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: rgba(0,0,0,0.2);
          padding: 16px;
          border-radius: var(--radius-md);
          height: 150px;
        }
        .dial-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          width: 60px;
        }
        .dial-column label {
          font-size: 10px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .dial-scroll {
          overflow-y: auto;
          width: 100%;
          text-align: center;
          scrollbar-width: none; /* Firefox */
        }
        .dial-scroll::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .dial-item {
          padding: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 4px;
        }
        .dial-item:hover {
          background: rgba(255,255,255,0.05);
        }
        .dial-item.active {
          color: white;
          font-size: 20px;
          font-weight: 700;
          background: var(--accent-primary);
        }
        .dial-separator {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-top: 16px;
        }
      `}</style>
        </div>
    );
}
