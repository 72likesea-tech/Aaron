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
        홈으로 돌아가기 <ArrowRight size={20} />
      </button>

      <style>{`
        .feedback-container {
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          height: 100vh;
          overflow-y: auto;
          background: #ffffff;
          color: #1a1a1a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .header { text-align: center; margin-bottom: 8px; }
        .header h1 { 
          color: #1a1a1a;
          margin-bottom: 8px; 
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .header p { 
          color: #666666;
          font-size: 18px; 
          font-weight: 400;
        }
        
        .summary-card {
            background: #f8fafc;
            padding: 40px;
            border-radius: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            border: 1px solid #e2e8f0;
        }
        .score-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #2563eb;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 20px;
            color: white;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .summary-card h3 {
          font-size: 24px;
          color: #1e293b;
          margin: 0;
        }
        .summary-card p {
          font-size: 16px;
          color: #64748b;
          margin: 0;
        }
        
        .corrections-section h2 {
            font-size: 22px;
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 24px;
            color: #1e293b;
            font-weight: 700;
        }
        .corrections-list {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }
        .correction-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 24px;
            border-radius: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .correction-label {
            font-size: 13px;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            margin-bottom: 8px;
            display: block;
        }

        .bad-box {
            background: #fff5f5;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 16px;
            border-left: 4px solid #feb2b2;
        }
        .correction-card .bad-text {
            color: #c53030;
            font-size: 17px;
            line-height: 1.5;
            display: block;
        }

        .good-box {
            background: #f0f9ff;
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 16px;
            border-left: 4px solid #2563eb;
        }
        .correction-card .good-text {
            color: #2563eb;
            font-weight: 700;
            font-size: 19px;
            line-height: 1.5;
            display: block;
        }

        .reason {
            font-size: 15px;
            color: #475569;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #f1f5f9;
            line-height: 1.6;
        }

        .pronunciation-tip {
            margin-top: 12px;
            padding: 12px;
            background: #f8fafc;
            border-radius: 12px;
            font-size: 15px;
            color: #64748b;
            line-height: 1.6;
        }
        .pronunciation-tip strong {
          color: #1e293b;
        }

        .primary-btn {
            background: #1a1a1a;
            color: white;
            padding: 18px;
            border-radius: 16px;
            font-weight: 700;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-top: 40px;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
        }
        .primary-btn:active {
          transform: scale(0.98);
          background: #333333;
        }
      `}</style>
    </div>
  );
}
