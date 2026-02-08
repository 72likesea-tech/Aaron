import { useState, useRef } from 'react';
import { BookOpen, HelpCircle, Volume2, MessageCircle, Loader2, Mic } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { OpenAIService } from '../../services/OpenAIService';
import BlindText from '../UI/BlindText';
import FontSizeController from '../UI/FontSizeController';

export default function LearningView({ data, onNext }) {
  const { keyExpressions, tips } = data || {};
  const { settings } = useUser();
  const fontScale = settings.fontScales?.LearningView || 1.0;
  const [playingIndex, setPlayingIndex] = useState(null);

  // Q&A State per expression: { index: { question: '', answer: '', isAsking: false, isRecording: false } }
  const [qaStates, setQaStates] = useState({});

  // Mic/Recording Refs
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const playTwice = async (text, index) => {
    if (playingIndex !== null) return;
    setPlayingIndex(index);

    const voice = settings?.voice || 'shimmer';
    const speed = settings?.speed || 100;

    try {
      const audioUrl = await OpenAIService.speak(text, voice, speed);
      if (!audioUrl) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.volume = 1.0;
        u.onend = () => {
          setTimeout(() => {
            const u2 = new SpeechSynthesisUtterance(text);
            u2.lang = 'en-US';
            u2.volume = 1.0;
            u2.onend = () => setPlayingIndex(null);
            window.speechSynthesis.speak(u2);
          }, 500);
        };
        window.speechSynthesis.speak(u);
        return;
      }

      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      audio.onended = () => {
        setTimeout(() => {
          const audio2 = new Audio(audioUrl);
          audio2.volume = 1.0;
          audio2.onended = () => setPlayingIndex(null);
          audio2.play();
        }, 500);
      };
      audio.play();
    } catch (e) {
      console.error(e);
      setPlayingIndex(null);
    }
  };

  const submitQuestion = async (index, expression, explicitText) => {
    if (!explicitText || !explicitText.trim()) return;

    setQaStates(prev => ({
      ...prev,
      [index]: { ...prev[index], isAsking: true, question: explicitText }
    }));

    try {
      const answer = await OpenAIService.askAboutExpression(expression, explicitText);
      setQaStates(prev => ({
        ...prev,
        [index]: { ...prev[index], answer, isAsking: false }
      }));
    } catch (err) {
      console.error(err);
      setQaStates(prev => ({
        ...prev,
        [index]: { ...prev[index], isAsking: false }
      }));
    }
  };

  // Voice Q&A Implementation
  const startVoiceQuestion = async (index, expression) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      setQaStates(prev => ({
        ...prev,
        [index]: { ...prev[index], isRecording: true, question: '말씀해 주세요...' }
      }));

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        setQaStates(prev => ({
          ...prev,
          [index]: { ...prev[index], isRecording: false, isAsking: true, question: '인식 중...' }
        }));

        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        try {
          const transcribedText = await OpenAIService.transcribeAudio(audioBlob);
          if (transcribedText.trim()) {
            await submitQuestion(index, expression, transcribedText);
          } else {
            setQaStates(prev => ({
              ...prev,
              [index]: { ...prev[index], isAsking: false, question: '' }
            }));
          }
        } catch (err) {
          console.error("Transcribe error", err);
          setQaStates(prev => ({
            ...prev,
            [index]: { ...prev[index], isAsking: false, question: '' }
          }));
        }
      };

      mediaRecorder.current.start();
    } catch (err) {
      console.error("Mic access error", err);
      alert("마이크 접근 권한이 필요합니다.");
    }
  };

  const stopVoiceQuestion = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const toggleMic = (e, index, expression) => {
    e.stopPropagation();
    if (qaStates[index]?.isRecording) {
      stopVoiceQuestion();
    } else {
      startVoiceQuestion(index, expression);
    }
  };

  return (
    <div className="learning-container" style={{ '--font-scale': fontScale }}>
      <div className="page-header-ctrl">
        <FontSizeController pageName="LearningView" />
      </div>
      <div className="section-header">
        <BookOpen size={24} color="var(--accent-primary)" />
        <h2>주요 표현 익히기</h2>
      </div>

      <div className="card">
        {keyExpressions && keyExpressions.map((exp, i) => (
          <div key={i} className={`expression-item ${playingIndex === i ? 'playing' : ''}`} onClick={() => playTwice(exp.text, i)}>
            <h3>
              {playingIndex === i && <Volume2 size={16} className="pulsing-icon" />}
              "{exp.text}"
            </h3>
            <div className="explanation-box">
              <p>{exp.explanation}</p>
            </div>
            <BlindText text={exp.translation} />

            <div className="qa-section" onClick={(e) => e.stopPropagation()}>
              <div className="qa-input-row">
                <div className="qa-visual-status">
                  {qaStates[i]?.isAsking ? (
                    <div className="asking-loader"><Loader2 size={18} className="spin" /> <span>분석 중...</span></div>
                  ) : qaStates[i]?.isRecording ? (
                    <div className="recording-label">음성 질문 대기 중...</div>
                  ) : qaStates[i]?.question ? (
                    <div className="question-preview">Q: {qaStates[i]?.question}</div>
                  ) : (
                    <div className="placeholder-text">마이크를 눌러 질문하세요</div>
                  )}
                </div>
                <button
                  className={`qa-mic-btn-large ${qaStates[i]?.isRecording ? 'recording' : ''}`}
                  onClick={(e) => toggleMic(e, i, exp.text)}
                  disabled={qaStates[i]?.isAsking}
                >
                  {qaStates[i]?.isAsking ? <Loader2 size={24} className="spin" /> : <Mic size={24} />}
                </button>
              </div>
              {qaStates[i]?.answer && (
                <div className="qa-answer">
                  <MessageCircle size={14} className="ai-icon" />
                  <p>{qaStates[i].answer}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <HelpCircle size={24} color="var(--accent-secondary)" />
        <h2>학습 팁</h2>
      </div>

      <div className="card question-card">
        <p>{tips || "Speak clearly and confidently!"}</p>
      </div>

      <button className="primary-btn" onClick={onNext} disabled={Object.values(qaStates).some(s => s.isRecording || s.isAsking)}>
        다음 단계 (쉐도잉)
      </button>

      <style>{`
        .learning-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: var(--bg-main);
        }
        .page-header-ctrl { width: 100%; display: flex; justify-content: flex-end; margin-bottom: 8px; }
        .section-header { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
        .section-header h2 {
          font-size: calc(18px * var(--font-scale));
          color: var(--text-primary);
          font-weight: 700;
        }
        .card {
          background: var(--bg-card);
          padding: 20px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 20px;
          border: 1px solid rgba(128,128,128,0.1);
        }
        .expression-item {
            padding: 20px;
            border-bottom: 1px solid rgba(128,128,128,0.1);
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 12px;
            background: var(--bg-main);
        }
        .expression-item:last-child { border-bottom: none; }
        .expression-item:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .expression-item.playing { border-color: var(--accent-primary); background: rgba(37, 99, 235, 0.03); }
        
        .expression-item h3 {
          color: var(--text-primary);
          font-size: calc(19px * var(--font-scale));
          font-weight: 700;
          margin-bottom: 12px;
        }
        .explanation-box {
          background: rgba(128, 128, 128, 0.05);
          padding: 14px;
          border-radius: 8px;
          margin-bottom: 12px;
          border-left: 4px solid var(--accent-primary);
        }
        .explanation-box p {
          color: var(--text-secondary);
          font-size: calc(14px * var(--font-scale));
          line-height: 1.6;
          margin: 0;
          white-space: pre-wrap;
        }

        .qa-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px dashed rgba(128,128,128,0.2);
        }
        .qa-input-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-secondary);
          padding: 12px 16px;
          border-radius: 12px;
          gap: 16px;
        }
        .qa-visual-status {
            flex: 1;
            font-size: 13px;
            color: var(--text-secondary);
        }
        .placeholder-text { opacity: 0.6; }
        .recording-label { color: var(--error); font-weight: 700; animation: flash 1s infinite; }
        .asking-loader { display: flex; align-items: center; gap: 8px; color: var(--accent-primary); font-weight: 600; }
        .question-preview { color: var(--text-primary); font-weight: 500; font-style: italic; }

        .qa-mic-btn-large {
          background: var(--accent-primary);
          color: white;
          border: none;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          transition: all 0.2s;
        }
        .qa-mic-btn-large.recording {
          background: var(--error);
          animation: pulse-red 1.5s infinite;
        }
        .qa-mic-btn-large:disabled { opacity: 0.5; }
        
        .qa-answer {
          margin-top: 12px;
          background: rgba(37, 99, 235, 0.05);
          padding: 12px;
          border-radius: 8px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          animation: fadeIn 0.3s ease;
        }
        .ai-icon { color: var(--accent-primary); margin-top: 2px; }
        .qa-answer p {
          font-size: 13px;
          line-height: 1.5;
          color: var(--text-primary);
          margin: 0;
        }

        @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
            100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        .question-card p { font-size: calc(16px * var(--font-scale)); line-height: 1.6; }
        .question-card {
          border: 1px solid var(--accent-secondary);
          background: rgba(118, 75, 162, 0.04);
        }
        .primary-btn {
          background: var(--accent-gradient);
          color: white;
          padding: 18px;
          border-radius: var(--radius-md);
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
          border: none;
          font-size: 16px;
        }
        .primary-btn:disabled { opacity: 0.5; pointer-events: none; }
        .pulsing-icon { margin-right: 8px; animation: pulse-scale 1s infinite; color: var(--accent-primary); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-scale {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
