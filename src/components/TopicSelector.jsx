import { useState, useEffect } from 'react';
import { MockAIService } from '../services/MockAIService';
import { useUser } from '../context/UserContext';
import FontSizeController from './UI/FontSizeController';
import { RefreshCw, ArrowRight } from 'lucide-react';

export default function TopicSelector({ onSelect, onError, onInterpretationClick }) {
  const { settings } = useUser();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await MockAIService.generateTopics('general', settings.learningTime);
      if (data && data.length > 0) {
        setTopics(data);
      } else {
        throw new Error("주제를 생성하지 못했습니다.");
      }
    } catch (e) {
      console.error(e);
      onError("주제 생성 중 오류가 발생했습니다. (AI 응답 실패)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleSelect = (topic) => {
    try {
      onSelect(topic);
    } catch (e) {
      console.error("Selection error", e);
      onError("세션을 시작하는 도중 오류가 발생했습니다.");
    }
  };

  const fontScale = settings.fontScales?.TopicSelector || 1.0;

  return (
    <div className="topic-selector-container" style={{ '--font-scale': fontScale }}>
      <header className="page-header">
        <div className="header-top">
          <h1>Learning Topics</h1>
          <FontSizeController pageName="TopicSelector" />
        </div>
        <p>어떤 주제로 대화해볼까요?</p>
      </header>

      {loading ? (
        <div className="loading-state">
          <RefreshCw className="spin" size={32} color="var(--accent-primary)" />
          <p>AI가 맞춤형 주제를 생성중입니다...</p>
        </div>
      ) : (
        <div className="topic-list">
          {topics.map((topic, index) => (
            <div key={topic.id || index} className="topic-card" onClick={() => handleSelect(topic)}>
              <div className="topic-icon">{topic.icon}</div>
              <div className="topic-info">
                <span className="topic-type">{topic.type}</span>
                <h3>{topic.title}</h3>
                {topic.source && <span className="topic-source">{topic.source}</span>}
              </div>
              <ArrowRight size={20} color="var(--text-secondary)" />
            </div>
          ))}
          {topics.length === 0 && (
            <div className="empty-state">
              <p>생성된 주제가 없습니다. 다시 시도해주세요.</p>
            </div>
          )}
        </div>
      )}

      <button className="secondary-btn" onClick={loadTopics} disabled={loading}>
        <RefreshCw size={18} /> 주제 다시 생성하기
      </button>

      <style>{`
        .topic-selector-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100vh;
        }
        .page-header { margin-bottom: 24px; }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .page-header h1 { font-size: calc(28px * var(--font-scale)); font-weight: 800; color: var(--text-primary); }
        .page-header p { font-size: calc(16px * var(--font-scale)); color: var(--text-secondary); }
        .loading-state, .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--text-secondary);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .topic-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          overflow-y: auto;
        }
        .topic-card {
          background: var(--bg-card);
          padding: 16px;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: center;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
          border: 1px solid rgba(128,128,128,0.1);
        }
        .topic-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent-primary);
          background: var(--bg-secondary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .topic-icon {
          font-size: 24px;
          background: rgba(128,128,128,0.1);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .topic-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .topic-type {
          font-size: 11px;
          color: var(--accent-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
        }
        .topic-source {
          font-size: calc(16px * var(--font-scale));
          color: var(--success);
          font-weight: 600;
          margin-top: 4px;
        }
        .topic-info h3 {
          font-size: calc(22px * var(--font-scale));
          font-weight: 700;
          line-height: 1.4;
          color: var(--text-primary);
        }
        .secondary-btn {
          background: transparent;
          border: 1px solid var(--text-secondary);
          color: var(--text-primary);
          padding: 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .secondary-btn:hover {
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}
