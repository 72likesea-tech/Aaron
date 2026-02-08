import { useState } from 'react';
import { BookOpen, HelpCircle, Volume2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { OpenAIService } from '../../services/OpenAIService';
import BlindText from '../UI/BlindText';
import FontSizeController from '../UI/FontSizeController';

export default function LearningView({ data, onNext }) {
  const { keyExpressions, tips } = data || {};
  const { settings } = useUser();
  const fontScale = settings.fontScales?.LearningView || 1.0;
  const [playingIndex, setPlayingIndex] = useState(null);

  const playTwice = async (text, index) => {
    if (playingIndex !== null) return; // Prevent overlapping playback
    setPlayingIndex(index);

    const voice = settings?.voice || 'shimmer';
    const speed = settings?.speed || 100;

    try {
      const audioUrl = await OpenAIService.speak(text, voice, speed);
      if (!audioUrl) {
        // Fallback
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.volume = 1.0;
        u.onend = () => {
          setTimeout(() => {
            const u2 = new SpeechSynthesisUtterance(text);
            u2.lang = 'en-US';
            u2.volume = 1.0;
            u2.onend = () => setPlayingIndex(null);
            window.speechSynthesis.speak(u2);
          }, 500);
        };
        window.speechSynthesis.speak(u);
        return;
      }

      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      audio.onended = () => {
        setTimeout(() => {
          const audio2 = new Audio(audioUrl);
          audio2.volume = 1.0;
          audio2.onended = () => setPlayingIndex(null);
          audio2.play();
        }, 500);
      };
      audio.play();
    } catch (e) {
      console.error(e);
      setPlayingIndex(null);
    }
  };

  return (
    <div className="learning-container" style={{ '--font-scale': fontScale }}>
      <div className="page-header-ctrl">
        <FontSizeController pageName="LearningView" />
      </div>
      <div className="section-header">
        <BookOpen size={24} color="var(--accent-primary)" />
        <h2>주요 표현 익히기</h2>
      </div>

      <div className="card">
        {keyExpressions && keyExpressions.map((exp, i) => (
          <div key={i} className={`expression-item ${playingIndex === i ? 'playing' : ''}`} onClick={() => playTwice(exp.text, i)}>
            <h3>
              {playingIndex === i && <Volume2 size={16} className="pulsing-icon" />}
              "{exp.text}"
            </h3>
            <div className="explanation-box">
              <p>{exp.explanation}</p>
            </div>
            <BlindText text={exp.translation} />
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
        .page-header-ctrl { width: 100%; display: flex; justify-content: flex-end; margin-bottom: 8px; }
        .section-header h2 {
          font-size: calc(18px * var(--font-scale));
          color: var(--text-primary);
        }
        .mission-text {
            font-size: 20px;
            font-weight: 500;
            line-height: 1.4;
            color: var(--text-primary);
        }
        .scenario-card {
            width: 100%;
            background: #f8fafc;
            padding: 24px;
            border-radius: var(--radius-lg);
            border: 1px solid #e2e8f0;
        }
        .card {
          background: var(--bg-main);
          padding: 24px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid rgba(128,128,128,0.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .expression-item h3 {
          color: var(--text-primary);
          font-size: calc(18px * var(--font-scale));
          font-weight: 600;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
        }
        .explanation-box {
          background: rgba(128, 128, 128, 0.05);
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          border-left: 3px solid var(--accent-primary);
        }
        .explanation-box p {
          color: var(--text-secondary);
          font-size: calc(14px * var(--font-scale));
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
        }
        .question-card p { font-size: calc(16px * var(--font-scale)); }
        /* Removed duplicate expression-item style */
        .expression-item:last-child {
            border-bottom: none;
            padding-bottom: 12px;
        }
        .question-card {
          border: 1px solid var(--accent-secondary);
          background: rgba(118, 75, 162, 0.05);
        }
        .primary-btn {
          background: var(--accent-gradient);
          color: white;
          padding: 16px;
          border-radius: var(--radius-md);
          font-weight: 700;
          margin-top: auto;
          box-shadow: 0 4px 12px rgba(118, 75, 162, 0.4);
          transition: transform 0.2s;
        }
        .primary-btn:active {
            transform: scale(0.98);
        }
        .expression-item {
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(128,128,128,0.1);
            cursor: pointer;
            transition: background 0.2s;
            border-radius: 12px;
            padding: 16px;
        }
        .expression-item:hover {
            background: rgba(128,128,128,0.05);
        }
        .expression-item.playing {
            background: rgba(37, 99, 235, 0.1);
            border: 1px solid var(--accent-primary);
        }
        .pulsing-icon {
            display: inline-block;
            margin-right: 8px;
            animation: pulse-scale 1s infinite;
            vertical-align: middle;
            color: var(--accent-primary);
        }
        @keyframes pulse-scale {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
