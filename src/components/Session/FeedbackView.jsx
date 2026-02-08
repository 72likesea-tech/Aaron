import { ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import BlindText from '../UI/BlindText';
import FontSizeController from '../UI/FontSizeController';
import { useUser } from '../../context/UserContext';

export default function FeedbackView({ onNext, corrections }) {
  const { settings } = useUser();
  const fontScale = settings.fontScales?.FeedbackView || 1.0;

  return (
    <div className="feedback-container" style={{ '--font-scale': fontScale }}>
      <div className="page-header-ctrl">
        <FontSizeController pageName="FeedbackView" />
      </div>
      <header className="header">
        <h1>학습 완료!</h1>
        <p>오늘의 학습 결과를 확인해보세요</p>
      </header>

      <div className="summary-card">
        <div className="score-circle">
          <span className="sc-val">Done</span>
        </div>
        <h3>Great Job!</h3>
        <p>오늘의 학습을 성공적으로 마쳤습니다.</p>
      </div>

      {corrections && corrections.length > 0 && (
        <div className="corrections-section">
          <h2><AlertTriangle size={20} /> 실력 향상을 위한 AI 피드백</h2>
          <div className="corrections-list">
            {corrections.map((item, i) => (
              <div key={i} className="correction-card">
                <div className="bad-box">
                  <span className="correction-label">상대방이 들은 나의 표현</span>
                  <span className="bad-text">"{item.original}"</span>
                </div>

                <div className="good-box">
                  <span className="correction-label">더 자연스러운 권장 표현</span>
                  <span className="good-text">"{item.correction}"</span>
                  {item.translation && <BlindText text={item.translation} className="feedback-translation" />}
                </div>

                <p className="reason">💡 {item.reason}</p>
                {item.pronunciationTip && (
                  <p className="pronunciation-tip">🗣️ <strong>발음 팁:</strong> {item.pronunciationTip}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="primary-btn" onClick={onNext}>
        처음으로 돌아가기 <ArrowRight size={20} />
      </button>

      <style>{`
        .page-header-ctrl { width: 100%; display: flex; justify-content: flex-end; margin-bottom: 8px; }
        .feedback-container {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            background: var(--bg-main);
        }
        .header { text-align: center; margin-bottom: 8px; }
        .header h1 {
          color: var(--text-primary);
          margin-bottom: 8px;
          font-size: calc(28px * var(--font-scale));
          font-weight: 800;
        }
        .header p {
          color: var(--text-secondary);
          font-size: calc(16px * var(--font-scale));
        }

        .summary-card {
            background: var(--bg-card);
            padding: 32px;
            border-radius: var(--radius-lg);
            text-align: center;
            border: 1px solid rgba(128,128,128,0.1);
        }
        .score-circle {
            width: 80px;
            height: 80px;
            background: var(--accent-gradient);
            border-radius: 50%;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 800;
            box-shadow: 0 8px 16px rgba(118, 75, 162, 0.3);
        }

        .corrections-section h2 {
            font-size: calc(20px * var(--font-scale));
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            color: var(--text-primary);
        }
        .corrections-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .correction-card {
            background: var(--bg-card);
            padding: 20px;
            border-radius: var(--radius-md);
            border: 1px solid rgba(128,128,128,0.1);
        }
        .bad-box, .good-box {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 12px;
        }
        .bad-box { background: rgba(239, 68, 68, 0.05); }
        .good-box { background: rgba(37, 99, 235, 0.05); }

        .correction-label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-secondary);
            margin-bottom: 4px;
            display: block;
        }
        .bad-text {
            display: block;
            color: var(--error);
            font-size: calc(18px * var(--font-scale));
            font-weight: 600;
            line-height: 1.4;
        }
        .good-text {
            display: block;
            color: var(--success);
            font-size: calc(18px * var(--font-scale));
            font-weight: 600;
            line-height: 1.4;
            margin-bottom: 8px;
        }
        .reason { font-size: calc(15px * var(--font-scale)); color: var(--text-primary); margin-top: 12px; }
        .pronunciation-tip { font-size: calc(14px * var(--font-scale)); color: var(--text-secondary); margin-top: 8px; }

        .primary-btn {
            background: var(--text-primary);
            color: var(--bg-main);
            padding: 18px;
            border-radius: var(--radius-md);
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            border: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
