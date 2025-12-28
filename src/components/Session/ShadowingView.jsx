import { useState, useRef, useEffect } from 'react';
import { Mic, Play, ArrowRight, RotateCcw } from 'lucide-react';
import { OpenAIService } from '../../services/OpenAIService';

export default function ShadowingView({ data, onNext }) {
  // Use data.shadowingSentences or fallback to keyExpressions text
  const sentences = data?.shadowingSentences || data?.keyExpressions?.map(e => e.text) || ["Hello", "How are you?"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null); // { isCorrect, feedback }
  const [transcript, setTranscript] = useState('');

  const recognition = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.lang = 'en-US';
      recognition.current.interimResults = true;

      recognition.current.onresult = (event) => {
        const current = event.resultIndex;
        const t = event.results[current][0].transcript;
        setTranscript(t);
      };

      recognition.current.onend = () => {
        setIsListening(false);
        if (transcript.trim()) {
          assessSpeech(transcript);
        }
      };
    }
  }, [transcript, currentIndex]);

  const assessSpeech = async (userSpeech) => {
    const target = sentences[currentIndex];
    const result = await OpenAIService.assessPronunciation(target, userSpeech);
    setFeedback(result);
  };

  const toggleRecording = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      setFeedback(null);
      setTranscript('');
      recognition.current?.start();
      setIsListening(true);
    }
  };

  const speakTarget = () => {
    const text = sentences[currentIndex];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleNextSentence = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFeedback(null);
      setTranscript('');
    } else {
      onNext(); // Go to Free Talk
    }
  };

  return (
    <div className="shadowing-step-container">
      <header className="step-header">
        <h2>Step 3. Shadowing</h2>
        <p>문장을 듣고 정확하게 따라 말해보세요 ({currentIndex + 1}/{sentences.length})</p>
      </header>

      <div className="target-card">
        <h3 className="target-text">{sentences[currentIndex]}</h3>
        <button className="play-btn" onClick={speakTarget}>
          <Play size={24} fill="currentColor" />
        </button>
      </div>

      <div className="feedback-area">
        {transcript && <p className="user-transcript">" {transcript} "</p>}

        {feedback && (
          <div className={`feedback-box ${feedback.isCorrect ? 'success' : 'warning'}`}>
            <strong>{feedback.isCorrect ? "Perfect! 🎉" : "Try again! 💪"}</strong>
            <p>{feedback.feedback}</p>
          </div>
        )}
      </div>

      <div className="controls-area">
        <button
          className={`record-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleRecording}
        >
          <Mic size={32} />
        </button>
        <p>{isListening ? "Listening..." : "Tap to Speak"}</p>
      </div>

      <button className="next-btn" onClick={handleNextSentence}>
        {currentIndex < sentences.length - 1 ? "Next Sentence" : "Start Free Talk"} <ArrowRight size={20} />
      </button>

      <style>{`
        .shadowing-step-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 24px;
            gap: 24px;
            align-items: center;
        }
        .step-header { text-align: center; }
        .step-header h2 { color: var(--accent-primary); margin-bottom: 8px; }
        .step-header p { color: var(--text-secondary); font-size: 14px; }

        .target-card {
            background: var(--bg-card);
            padding: 32px;
            border-radius: var(--radius-lg);
            width: 100%;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.05);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            margin-top: 20px;
        }
        .target-text { font-size: 24px; font-weight: 500; line-height: 1.4; }
        .play-btn {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            color: var(--accent-primary);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .play-btn:active { transform: scale(0.95); background: rgba(255,255,255,0.2); }

        .feedback-area {
            flex: 1;
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            min-height: 100px;
        }
        .user-transcript { color: var(--text-secondary); font-style: italic; }
        .feedback-box {
            background: rgba(46, 213, 115, 0.1);
            border: 1px solid var(--success);
            padding: 16px;
            border-radius: var(--radius-md);
            width: 100%;
            text-align: center;
        }
        .feedback-box.warning {
            background: rgba(255, 71, 87, 0.1);
            border-color: var(--error);
        }
        
        .controls-area {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
        }
        .record-btn {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: var(--accent-secondary);
            color: white;
            border: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .record-btn.listening {
            background: var(--error);
            animation: pulse-red 1.5s infinite;
        }

        .next-btn {
            background: transparent;
            color: var(--text-primary);
            border: 1px solid rgba(255,255,255,0.2);
            padding: 16px 32px;
            border-radius: 100px;
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            justify-content: center;
            font-weight: 600;
        }
        .next-btn:active { background: rgba(255,255,255,0.05); }

        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(255, 69, 58, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(255, 69, 58, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 69, 58, 0); }
        }
      `}</style>
    </div>
  );
}
