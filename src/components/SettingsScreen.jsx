import { useUser } from '../context/UserContext';
import { Clock, Settings, Zap, BarChart } from 'lucide-react';
import TimeDial from './UI/TimeDial';

export default function SettingsScreen({ onStart }) {
  const { settings, updateSettings } = useUser();

  const levels = ['초급', '중급', '고급'];
  const speeds = ['천천히', '보통', '빠르게'];

  return (
    <div className="screen-container">
      <header className="header">
        <h1>학습 설정</h1>
        <p>오늘의 맞춤형 영어 코칭을 설정하세요</p>
      </header>

      <div className="card">
        <div className="setting-item">
          <label><Clock size={18} /> 일일 목표량 (분)</label>
          <div className="range-control">
            <button className="icon-btn" onClick={() => updateSettings('learningTime', Math.max(1, settings.learningTime - 1))}>-</button>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={settings.learningTime}
              onChange={(e) => updateSettings('learningTime', Number(e.target.value))}
            />
            <button className="icon-btn" onClick={() => updateSettings('learningTime', Math.min(60, settings.learningTime + 1))}>+</button>
          </div>
          <span className="value-display">{settings.learningTime} 분</span>
        </div>

        <div className="setting-item">
          <label><Settings size={18} /> 알람 시간</label>
          <TimeDial
            value={settings.alarmTime}
            onChange={(val) => updateSettings('alarmTime', val)}
          />
        </div>
      </div>

      <div className="card">
        <label className="section-label"><BarChart size={18} /> 나의 레벨</label>
        <div className="toggle-group">
          {levels.map(l => (
            <button
              key={l}
              className={`toggle-btn ${settings.level === l ? 'active' : ''}`}
              onClick={() => updateSettings('level', l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="section-label"><Zap size={18} /> 말하기 속도</label>
        <div className="toggle-group">
          {speeds.map(s => (
            <button
              key={s}
              className={`toggle-btn ${settings.speed === s ? 'active' : ''}`}
              onClick={() => updateSettings('speed', s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button className="primary-btn" onClick={onStart}>
        오늘의 학습 시작하기
      </button>

      <style>{`
        .screen-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100vh;
          overflow-y: auto;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header p {
          color: var(--text-secondary);
          font-size: 14px;
        }
        .card {
          background: var(--bg-card);
          padding: 20px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .setting-item label, .section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
          font-weight: 500;
        }
        input[type="range"] {
          width: 100%;
          accent-color: var(--accent-primary);
        }
        .value-display {
          font-size: 14px;
          font-weight: 600;
          color: var(--accent-primary);
          align-self: flex-end;
        }
        .toggle-group {
          display: flex;
          gap: 8px;
          background: rgba(0,0,0,0.2);
          padding: 4px;
          border-radius: var(--radius-sm);
        }
        .toggle-btn {
          flex: 1;
          padding: 8px 4px;
          font-size: 12px;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 4px;
          transition: all 0.2s;
        }
        .toggle-btn.active {
          background: var(--bg-secondary);
          color: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .primary-btn {
          margin-top: auto;
          background: var(--accent-gradient);
          color: white;
          padding: 16px;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(118, 75, 162, 0.4);
        }
        .range-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
        }
        .icon-btn:active {
          background: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
