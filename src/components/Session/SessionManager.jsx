import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { MockAIService } from '../../services/MockAIService';
import { OpenAIService } from '../../services/OpenAIService';
import { X } from 'lucide-react';

import MissionView from './MissionView';
import LearningView from './LearningView';
import ShadowingView from './ShadowingView';
import FreeTalkView from './FreeTalkView';
import FeedbackView from './FeedbackView';

export default function SessionManager({ topic, onExit, onError }) {
  const { settings } = useUser();
  const [step, setStep] = useState('loading'); // loading, mission, learning, shadowing, freetalk, feedback
  const [sessionData, setSessionData] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]); // corrections from free talk

  useEffect(() => {
    const initSession = async () => {
      setStep('loading');
      try {
        const data = await OpenAIService.startSession(topic, settings.learningTime);
        setSessionData(data);
        setStep('mission');
      } catch (error) {
        console.error("Session init failed", error);
        if (onError) onError("세션 데이터를 불러오는 중 오류가 발생했습니다.");
        onExit();
      }
    };
    initSession();
  }, [topic, settings.learningTime]);

  const handleNext = async (dataFromStep) => {
    if (step === 'mission') setStep('learning');
    else if (step === 'learning') setStep('shadowing');
    else if (step === 'shadowing') setStep('freetalk');
    else if (step === 'freetalk') {
      // dataFromStep is the chat history
      setStep('analyzing'); // Show loading state for analysis
      const corrections = await OpenAIService.generateConversationFeedback(dataFromStep);
      setFeedbackData(corrections);
      setStep('feedback');
    }
    else if (step === 'feedback') onExit();
  };

  if (step === 'loading' || step === 'analyzing') {
    const msg = step === 'loading' ? "AI가 학습 코스를 준비하고 있습니다..." : "AI가 대화 내용을 분석하고 있습니다...";
    return (
      <div className="loading-container">
        <div className="spin-loader"></div>
        <p>{msg}</p>
        <style>{`
                  .loading-container {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                    gap: 16px;
                  }
                  .spin-loader {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-top-color: var(--accent-primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                  }
                  @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
      </div>
    );
  }

  const steps = ['mission', 'learning', 'shadowing', 'freetalk', 'feedback'];
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="session-layout">
      <nav className="navbar">
        <button onClick={onExit} className="nav-btn"><X size={24} /></button>
        <div className="progress-bar">
          {steps.slice(0, 4).map((s, i) => (
            <div key={s} className={`step ${i <= currentStepIndex ? 'active' : ''}`} />
          ))}
        </div>
        <div style={{ width: 24 }} />
      </nav>

      <main className="content">
        {step === 'mission' && <MissionView data={sessionData} onNext={handleNext} />}
        {step === 'learning' && <LearningView data={sessionData} onNext={handleNext} />}
        {step === 'shadowing' && <ShadowingView data={sessionData} onNext={handleNext} />}
        {step === 'freetalk' && <FreeTalkView data={sessionData} onNext={handleNext} />}
        {step === 'feedback' && <FeedbackView onNext={handleNext} corrections={feedbackData} />}
      </main>

      <style>{`
        .session-layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .navbar {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .nav-btn {
          background: transparent;
          color: var(--text-secondary);
          border: none;
          padding: 8px;
        }
        .progress-bar {
          display: flex;
          gap: 4px;
        }
        .step {
          width: 32px;
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          transition: background 0.3s;
        }
        .step.active {
          background: var(--accent-primary);
        }
        .content {
          flex: 1;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
