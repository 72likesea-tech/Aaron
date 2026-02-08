import { useState } from 'react';
import { Clock, Settings, Zap, BarChart, Mic, Bell, User, Globe, Moon, Sun, Palette, Type } from 'lucide-react';
import { useUser } from '../context/UserContext';
import TimeDial from './UI/TimeDial';
import FontSizeController from './UI/FontSizeController';

export default function SettingsScreen({ onStart }) {
  const { settings, updateSettings } = useUser();
  const fontScale = settings.fontScales?.SettingsScreen || 1.0;

  const levels = ['초급', '중급', '고급'];
  const speeds = ['천천히', '보통', '빠르게'];

  return (
    <div className="settings-container" style={{ '--font-scale': fontScale }}>
      <header className="header">
        <div className="header-top">
          <h1>Settings</h1>
          <FontSizeController pageName="SettingsScreen" />
        </div>
        <p>어플리케이션 설정을 관리합니다</p>
      </header>

      <div className="settings-card">
        <div className="setting-item">
          <label><Clock size={18} /> 일일 목표량 (분)</label>
          <div className="range-control">
            <input
              type="range"
              min="1"
              max="60"
              value={settings.learningTime}
              onChange={(e) => updateSettings('learningTime', parseInt(e.target.value))}
            />
            <span className="value-display">{settings.learningTime}분</span>
          </div>
        </div>

        <div className="setting-item">
          <label><Bell size={18} /> 알람 시간</label>
          <div className="dial-wrapper">
            <TimeDial
              value={settings.alarmTime}
              onChange={(val) => updateSettings('alarmTime', val)}
            />
          </div>
        </div>
      </div>

      <div className="settings-card">
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

      <div className="settings-card">
        <label className="section-label"><Zap size={18} /> 말하기 속도 ({settings.speed}%)</label>
        <div className="range-control">
          <span className="speed-label">천천히</span>
          <input
            type="range"
            min="50"
            max="150"
            step="10"
            value={settings.speed}
            onChange={(e) => updateSettings('speed', parseInt(e.target.value))}
          />
          <span className="speed-label">빠르게</span>
        </div>
      </div>

      <div className="settings-card">
        <label className="section-label"><Mic size={18} /> AI 목소리</label>
        <div className="voice-grid">
          {['alloy', 'echo', 'shimmer', 'onyx'].map(v => (
            <button
              key={v}
              className={`voice-btn ${settings.voice === v ? 'active' : ''}`}
              onClick={() => updateSettings('voice', v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-card">
        <label className="section-label"><Palette size={18} /> 화면 테마 및 색상 설정</label>
        <div className="toggle-group">
          {['light', 'dark', 'custom'].map(m => (
            <button
              key={m}
              className={`toggle-btn ${settings.themeMode === m ? 'active' : ''}`}
              onClick={() => updateSettings('themeMode', m)}
            >
              {m === 'light' ? <Sun size={16} /> : m === 'dark' ? <Moon size={16} /> : <Palette size={16} />}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {settings.themeMode === 'custom' && (
          <div className="custom-colors">
            <div className="color-picker">
              <label>배경 색상</label>
              <input
                type="color"
                value={settings.customBgColor}
                onChange={(e) => updateSettings('customBgColor', e.target.value)}
              />
            </div>
            <div className="color-picker">
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
        저장하고 돌아가기
      </button>

      <style>{`
        .settings-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100vh;
          overflow-y: auto;
          background: var(--bg-main);
        }
        .header { margin-bottom: 24px; }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .header h1 { font-size: calc(28px * var(--font-scale)); font-weight: 800; color: var(--text-primary); }
        .header p { font-size: calc(16px * var(--font-scale)); color: var(--text-secondary); }
        
        .settings-card {
            background: var(--bg-card);
            padding: 24px;
            border-radius: var(--radius-lg);
            margin-bottom: 20px;
            border: 1px solid rgba(128,128,128,0.1);
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .section-label {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: calc(16px * var(--font-scale));
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 12px;
        }
        .setting-item label {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            font-size: calc(15px * var(--font-scale));
            font-weight: 600;
            color: var(--text-primary);
        }
        .range-control {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        input[type="range"] {
            flex: 1;
            accent-color: var(--accent-primary);
        }
        .value-display {
            font-weight: 700;
            color: var(--accent-primary);
            min-width: 40px;
        }
        .toggle-group {
            display: flex;
            gap: 8px;
            background: var(--bg-secondary);
            padding: 4px;
            border-radius: 12px;
        }
        .toggle-btn {
            flex: 1;
            padding: 12px;
            border-radius: 8px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
        }
        .toggle-btn.active {
            background: var(--bg-main);
            color: var(--accent-primary);
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .voice-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        .voice-btn {
            padding: 16px;
            border-radius: 12px;
            border: 1px solid rgba(128,128,128,0.1);
            background: var(--bg-main);
            color: var(--text-primary);
            font-weight: 600;
            transition: all 0.2s;
        }
        .voice-btn.active {
            border-color: var(--accent-primary);
            background: rgba(37, 99, 235, 0.05);
            color: var(--accent-primary);
        }
        .custom-colors {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(128,128,128,0.1);
        }
        .color-picker {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .color-picker label { font-size: 13px; color: var(--text-secondary); }
        .color-picker input { width: 100%; height: 40px; border: none; border-radius: 8px; cursor: pointer; }
        
        .primary-btn {
            background: var(--text-primary);
            color: var(--bg-main);
            padding: 20px;
            border-radius: var(--radius-md);
            font-weight: 700;
            border: none;
            font-size: 16px;
            margin-top: 20px;
        }
        .speed-label { font-size: 12px; color: var(--text-secondary); }
        .dial-wrapper { display: flex; justify-content: center; width: 100%; }
      `}</style>
    </div>
  );
}
