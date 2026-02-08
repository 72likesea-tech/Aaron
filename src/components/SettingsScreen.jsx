import { useUser } from '../context/UserContext';
import { Clock, Settings, Zap, BarChart, Mic } from 'lucide-react';
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
        <label className="section-label"><Zap size={18} /> 말하기 속도 ({settings.speed}%)</label>
        <div className="range-control">
          <span className="speed-label">천천히 (또렷하게)</span>
          <input
            type="range"
            min="50"
            max="120"
            step="5"
            value={settings.speed}
            onChange={(e) => updateSettings('speed', Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span className="speed-label">빠르게</span>
        </div>
      </div>

      <div className="card">
        <label className="section-label"><Mic size={18} /> AI 목소리</label>
        <div className="voice-grid">
          {['alloy', 'echo', 'shimmer', 'onyx'].map(v => (
            <button
              key={v}
              className={`voice-btn ${settings.voice === v ? 'active' : ''}`}
              onClick={() => {
                updateSettings('voice', v);
                // Preview sound? Maybe later.
              }}
            >
              <div className="voice-icon">{v[0].toUpperCase()}</div>
              <span className="voice-name">{v === 'shimmer' ? 'Sol (Shimmer)' : v.charAt(0).toUpperCase() + v.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <label className="section-label"><Settings size={18} /> 화면 테마 및 색상 설정</label>
        <div className="toggle-group">
          {['light', 'dark', 'custom'].map(m => (
            <button
              key={m}
              className={`toggle-btn ${settings.themeMode === m ? 'active' : ''}`}
              onClick={() => updateSettings('themeMode', m)}
            >
              {m === 'light' ? '밝게' : m === 'dark' ? '어둡게' : '커스텀'}
            </button>
          ))}
        </div>

        {settings.themeMode === 'custom' && (
          <div className="custom-colors">
            <div className="color-picker-item">
              <label>배경 색상</label>
              <input
                type="color"
                value={settings.customBgColor}
                onChange={(e) => updateSettings('customBgColor', e.target.value)}
              />
            </div>
            <div className="color-picker-item">
              <label>글자 색상</label>
              <input
                type="color"
                value={settings.customTextColor}
                onChange={(e) => updateSettings('customTextColor', e.target.value)}
              />
            </div>
          </div>
        )}
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
          padding: 24px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid rgba(128,128,128,0.1);
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
          background: #f1f5f9;
          padding: 6px;
          border-radius: var(--radius-sm);
        }
        .toggle-btn {
          flex: 1;
          padding: 10px 4px;
          font-size: 13px;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 6px;
          transition: all 0.2s;
          font-weight: 500;
        }
        .toggle-btn.active {
          background: #ffffff;
          color: var(--accent-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          font-weight: 700;
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
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #f1f5f9;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 20px;
        }
        .icon-btn:active {
          background: var(--accent-primary);
          color: white;
        }
        
        .voice-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        .voice-btn {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s;
        }
        .voice-btn.active {
            background: #eff6ff;
            border-color: var(--accent-primary);
            color: var(--accent-primary);
            font-weight: 600;
        }
        .voice-icon {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: var(--bg-main);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            color: var(--accent-primary);
        }
        .voice-btn.active .voice-icon {
            background: var(--accent-primary);
            color: white;
        }
        .voice-name {
            font-size: 14px;
            font-weight: 500;
        }
        .custom-colors {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 8px;
        }
        .color-picker-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .color-picker-item label {
            font-size: 14px;
            color: var(--text-secondary);
        }
        .color-picker-item input {
            width: 40px;
            height: 40px;
            border: none;
            cursor: pointer;
            background: none;
        }
      `}</style>
    </div>
  );
}
