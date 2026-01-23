import { Flag, Play, Target } from 'lucide-react';
import BlindText from '../UI/BlindText';

export default function MissionView({ data, onNext }) {
  const { mission, missionTranslation, scenario, scenarioTranslation } = data || {};

  return (
    <div className="mission-container">
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
        <p>{scenario || "Situation description..."}</p>
        {scenarioTranslation && <BlindText text={scenarioTranslation} />}
      </div>

      <button className="primary-btn pulse-btn" onClick={onNext}>
        <Play size={20} fill="currentColor" /> 미션 시작하기
      </button>

      <style>{`
        .center-text {
            text-align: center;
            width: 100%;
        }
        .mission-container {
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          gap: 32px;
        }
        .hero-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
            margin-top: 40px;
        }
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
            font-size: 20px;
            font-weight: 300;
            line-height: 1.4;
            color: white;
        }
        .scenario-card {
            width: 100%;
            background: var(--bg-card);
            padding: 24px;
            border-radius: var(--radius-lg);
            border: 1px solid rgba(255,255,255,0.05);
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
