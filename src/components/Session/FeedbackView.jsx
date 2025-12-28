import { ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';

export default function FeedbackView({ onNext, corrections }) {
  return (
    <div className="feedback-container">
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
          <h2><AlertTriangle size={20} /> AI 피드백</h2>
          <div className="corrections-list">
            {corrections.map((item, i) => (
              <div key={i} className="correction-card">
                <div className="bad">
                  <span className="label">Original:</span>
                  <span className="text">"{item.original}"</span>
                </div>
                <div className="good">
                  <span className="label">Better:</span>
                  <span className="text">"{item.correction}"</span>
                </div>
                <p className="reason">💡 {item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="primary-btn" onClick={onNext}>
        홈으로 돌아가기 <ArrowRight size={20} />
      </button>

      <style>{`
        .feedback-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100vh;
          overflow-y: auto;
        }
        .header { text-align: center; }
        .header h1 { color: var(--accent-primary); margin-bottom: 8px; }
        .header p { color: var(--text-secondary); font-size: 14px; }
        
        .summary-card {
            background: var(--bg-card);
            padding: 32px;
            border-radius: var(--radius-lg);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            margin-bottom: 16px;
        }
        .score-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--accent-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 4px 12px rgba(118, 75, 162, 0.4);
        }
        
        .corrections-section h2 {
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            color: var(--accent-secondary);
        }
        .corrections-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .correction-card {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.1);
            padding: 16px;
            border-radius: var(--radius-md);
        }
        .correction-card .bad {
            color: var(--error);
            margin-bottom: 8px;
            text-decoration: line-through;
            opacity: 0.8;
            font-size: 14px;
        }
        .correction-card .good {
            color: var(--success);
            font-weight: 600;
            margin-bottom: 8px;
            font-size: 15px;
        }
        .correction-card .label {
            margin-right: 8px;
            font-size: 12px;
            text-transform: uppercase;
            opacity: 0.7;
        }
        .reason {
            font-size: 13px;
            color: var(--text-secondary);
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .primary-btn {
            background: var(--bg-secondary);
            color: white;
            padding: 16px;
            border-radius: var(--radius-md);
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: auto;
        }
      `}</style>
    </div>
  );
}
