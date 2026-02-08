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
                {item.pronunciationTip && (
                  <p className="pronunciation-tip">🗣️ <strong>Pronunciation Tip:</strong> {item.pronunciationTip}</p>
                )}
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
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          height: 100vh;
          overflow-y: auto;
          background: var(--bg-main);
        }
        .header { text-align: center; }
        .header h1 { 
          color: var(--accent-primary); 
          margin-bottom: 12px; 
          font-size: 32px;
          font-weight: 800;
        }
        .header p { 
          color: var(--text-secondary); 
          font-size: 18px; 
          font-weight: 500;
        }
        
        .summary-card {
            background: var(--bg-card);
            padding: 40px;
            border-radius: var(--radius-lg);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            margin-bottom: 24px;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .score-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: var(--accent-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 24px;
            box-shadow: 0 4px 15px rgba(118, 75, 162, 0.5);
            color: white;
        }
        .summary-card h3 {
          font-size: 28px;
          color: white;
        }
        .summary-card p {
          font-size: 18px;
          color: var(--text-secondary);
        }
        
        .corrections-section h2 {
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            color: var(--accent-secondary);
            font-weight: 700;
        }
        .corrections-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .correction-card {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.12);
            padding: 24px;
            border-radius: var(--radius-lg);
            transition: transform 0.2s;
        }
        .correction-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.08);
        }
        .correction-card .bad {
            color: #ff6b6b;
            margin-bottom: 12px;
            text-decoration: line-through;
            opacity: 0.9;
            font-size: 18px;
            line-height: 1.5;
        }
        .correction-card .good {
            color: #2ed573;
            font-weight: 700;
            margin-bottom: 12px;
            font-size: 20px;
            line-height: 1.5;
        }
        .correction-card .label {
            margin-right: 12px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 800;
            color: var(--text-secondary);
        }
        .reason {
            font-size: 17px;
            color: #ecf0f1;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid rgba(255,255,255,0.1);
            line-height: 1.6;
        }

        .primary-btn {
            background: var(--accent-primary);
            color: white;
            padding: 20px;
            border-radius: var(--radius-md);
            font-weight: 700;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-top: 32px;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
            transition: all 0.2s;
        }
        .primary-btn:active {
          transform: scale(0.98);
        }
        
        .pronunciation-tip {
            margin-top: 12px;
            padding: 12px;
            background: rgba(118, 75, 162, 0.1);
            border-radius: 8px;
            border-left: 4px solid var(--accent-primary);
            font-size: 17px;
            color: #d1d8e0;
            line-height: 1.6;
        }
        .pronunciation-tip strong {
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
