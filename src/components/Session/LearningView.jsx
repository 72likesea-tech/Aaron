import { useState } from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';
import { useUser } from '../../context/UserContext';

function BlindText({ text }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <p
      className={`translation-sub ${revealed ? 'visible' : 'blind'}`}
      onDoubleClick={() => setRevealed(true)}
      onClick={(e) => {
        const now = Date.now();
        // Check if previous click was less than 300ms ago
        if (e.target.lastClick && now - e.target.lastClick < 300) {
          setRevealed(true);
        }
        e.target.lastClick = now;
      }}
    >
      {revealed ? text : "Double tap to reveal / 더블 탭하여 보기"}
    </p>
  );
}

export default function LearningView({ data, onNext }) {
  const { keyExpressions, tips } = data || {};

  return (
    <div className="learning-container">
      <div className="section-header">
        <BookOpen size={24} color="var(--accent-primary)" />
        <h2>주요 표현 익히기</h2>
      </div>

      <div className="card">
        {keyExpressions && keyExpressions.map((exp, i) => (
          <div key={i} className="expression-item">
            <h3>"{exp.text}"</h3>
            <p>{exp.explanation}</p>
            <BlindText text={`(${exp.translation})`} />
          </div>
        ))}
      </div>

      <div className="section-header">
        <HelpCircle size={24} color="var(--accent-secondary)" />
        <h2>학습 팁</h2>
      </div>

      <div className="card question-card">
        <p>{tips || "Speak clearly and confidently!"}</p>
      </div>

      <button className="primary-btn" onClick={onNext}>
        다음 단계 (쉐도잉)
      </button>

      <style>{`
        .learning-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-header h2 {
          font-size: 18px;
        }
        .card {
          background: var(--bg-card);
          padding: 20px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .expression-item h3 {
          color: var(--accent-primary);
          margin-bottom: 4px;
        }
        .expression-item p {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .expression-item {
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .expression-item:last-child {
            border-bottom: none;
        }
        .question-card {
          border: 1px solid var(--accent-secondary);
        }
        .primary-btn {
          background: var(--accent-gradient);
          color: white;
          padding: 16px;
          border-radius: var(--radius-md);
          font-weight: 700;
          margin-top: auto;
        }
        .translation-sub {
          font-size: 13px;
          color: var(--accent-primary);
          margin-top: 4px;
          cursor: pointer;
          transition: all 0.3s;
          user-select: none;
          min-height: 20px;
        }
        .translation-sub.blind {
            background: rgba(255,255,255,0.1);
            color: transparent;
            text-shadow: 0 0 5px rgba(255,255,255,0.5);
            border-radius: 4px;
            padding: 2px 8px;
            position: relative;
        }
        /* Mobile/Touch friendly visual hint for blind text */
        .translation-sub.blind:after {
            content: '?';
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            color: rgba(255,255,255,0.3);
            font-size: 10px;
        }
        .translation-sub.visible {
            color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
