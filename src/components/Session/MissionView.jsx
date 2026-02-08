import { Flag, Play, Target } from 'lucide-react';
import BlindText from '../UI/BlindText';
import FontSizeController from '../UI/FontSizeController';
import { useUser } from '../../context/UserContext';

export default function MissionView({ data, onNext }) {
  const { mission, missionTranslation, scenario, scenarioTranslation } = data || {};
  const { settings } = useUser();
  const fontScale = settings.fontScales?.MissionView || 1.0;

  return (
    <div className="mission-container" style={{ '--font-scale': fontScale }}>
      <div className="page-header-ctrl">
        <FontSizeController pageName="MissionView" />
      </div>
      <header className="hero-section">
        <div className="icon-circle">
          <Flag size={32} />
        </div>
        <h1>오늘의 미션</h1>
        <p className="mission-text">{mission || "Master the conversation"}</p>
        {missionTranslation && <BlindText text={missionTranslation} className="center-text" />}
      </header>

      <div className="scenario-card">
        <div className="card-header">
          <Target size={20} className="accent-icon" />
          <h3>상황 설정 (Scenario)</h3>
        </div>
        <p className="scenario-desc">{scenario || "Situation description..."}</p>
        {scenarioTranslation && <BlindText text={scenarioTranslation} />}
      </div>

      <button className="primary-btn pulse-btn" onClick={onNext}>
        <Play size={20} fill="currentColor" /> 미션 시작하기
      </button>

      <style>{`
        .page-header-ctrl { width: 100%; display: flex; justify-content: flex-end; }
        .hero-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
            margin-top: 10px;
        }
        .hero-section h1 { font-size: calc(24px * var(--font-scale)); }
        .icon-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--accent-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            box-shadow: 0 10px 20px rgba(118, 75, 162, 0.5);
        }
        .mission-text {
            font-size: calc(20px * var(--font-scale));
            font-weight: 500;
            line-height: 1.4;
            color: var(--text-primary);
        }
        .scenario-card h3 { font-size: calc(18px * var(--font-scale)); }
        .scenario-desc { font-size: calc(16px * var(--font-scale)); }
        .scenario-card {
            width: 100%;
            background: var(--bg-card);
            padding: 24px;
            border-radius: var(--radius-lg);
            border: 1px solid rgba(128,128,128,0.2);
        }
        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            color: var(--accent-secondary);
        }
        .accent-icon {
            color: var(--accent-secondary);
        }
        .primary-btn {
            margin-top: auto;
            width: 100%;
            background: var(--accent-gradient);
            color: white;
            padding: 18px;
            border-radius: var(--radius-md);
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 16px;
        }
        .pulse-btn {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(118, 75, 162, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(118, 75, 162, 0); }
            100% { box-shadow: 0 0 0 0 rgba(118, 75, 162, 0); }
        }
      `}</style>
    </div>
  );
}
