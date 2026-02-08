import { useState, useRef, useEffect } from 'react';
import { Mic, Play, ArrowRight, RotateCcw } from 'lucide-react';
import { OpenAIService } from '../../services/OpenAIService';
import { useUser } from '../../context/UserContext';
import BlindText from '../UI/BlindText';
import FontSizeController from '../UI/FontSizeController';

export default function ShadowingView({ data, onNext }) {
  // Determine sentences: data.shadowingSentences (new format) or mapped keyExpressions (fallback)
  const rawSentences = data?.shadowingSentences || data?.keyExpressions || [];
  const sentences = rawSentences.map(item => {
    if (typeof item === 'string') return { text: item, translation: '' };
    return { text: item.text, translation: item.translation || '' };
  });

  // Fallback if empty
  if (sentences.length === 0) {
    sentences.push({ text: "Hello", translation: "안녕하세요" });
    sentences.push({ text: "How are you?", translation: "어떻게 지내세요?" });
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState(null); // { isCorrect, feedback }
  const [transcript, setTranscript] = useState('');

  const recognition = useRef(null);
  const { settings } = useUser();
  const currentVoice = settings?.voice || 'shimmer';
  const currentSpeed = settings?.speed || 100;

  const currentSentence = sentences[currentIndex] || sentences[0];

  const assessSpeech = async (userSpeech) => {
    if (!currentSentence) return;
    const target = currentSentence.text;
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

  const speakTarget = async () => {
    const text = currentSentence.text;
    // Use OpenAI TTS instead of browser
    const audioUrl = await OpenAIService.speak(text, currentVoice, currentSpeed);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      // Fallback
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
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



  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.lang = 'en-US';
      recognition.current.interimResults = true;
      // Handlers attached dynamically or refs used?
    }
    return () => {
      recognition.current?.stop();
    }
  }, []);

  // Use refs for callbacks
  const transcriptRef = useRef('');
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  useEffect(() => {
    if (!recognition.current) return;

    recognition.current.onresult = (event) => {
      const current = event.resultIndex;
      const t = event.results[current][0].transcript;
      setTranscript(t);
    };

    recognition.current.onend = () => {
      setIsListening(false);
      if (transcriptRef.current.trim()) {
        assessSpeech(transcriptRef.current);
      }
    };
  }, [assessSpeech]); // assessSpeech depends on currentSentence, so it changes.


  const fontScale = settings.fontScales?.ShadowingView || 1.0;

  return (
    <div className="shadowing-step-container" style={{ '--font-scale': fontScale }}>
      <div className="page-header-ctrl">
        <FontSizeController pageName="ShadowingView" />
      </div>
      <header className="step-header">
        <h2>Step 3. Shadowing</h2>
        <p>문장을 듣고 정확하게 따라 말해보세요 ({currentIndex + 1}/{sentences.length})</p>
      </header>

      <div className="target-card">
        <h3 className="target-text">{currentSentence.text}</h3>
        {currentSentence.translation && (
          <BlindText text={currentSentence.translation} />
        )}
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
        .page-header-ctrl { width: 100%; display: flex; justify-content: flex-end; }
        .step-header { text-align: center; }
        .step-header h2 { color: var(--accent-primary); margin-bottom: 8px; font-size: calc(24px * var(--font-scale)); }
        .step-header p { color: var(--text-secondary); font-size: calc(14px * var(--font-scale)); }

        .target-card {
            background: var(--bg-main);
            padding: 32px;
            border-radius: var(--radius-lg);
            width: 100%;
            text-align: center;
            border: 1px solid rgba(128,128,128,0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 24px;
            margin-top: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .target-text { font-size: calc(24px * var(--font-scale)); font-weight: 500; line-height: 1.4; color: var(--text-primary); }
        .target-translation { display: none; }
        .play-btn {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: rgba(37, 99, 235, 0.1);
            color: var(--accent-primary);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        .play-btn:active { transform: scale(0.95); background: rgba(37, 99, 235, 0.2); }

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
            background: rgba(239, 68, 68, 0.1);
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
            background: var(--text-primary);
            color: var(--bg-main);
            border: none;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }
        .record-btn.listening {
            background: var(--error);
            animation: pulse-red 1.5s infinite;
        }

        .next-btn {
            background: var(--bg-card);
            color: var(--text-primary);
            border: 1px solid rgba(128,128,128,0.2);
            padding: 16px 32px;
            border-radius: 100px;
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            justify-content: center;
            font-weight: 700;
        }
        .next-btn:active { background: rgba(128,128,128,0.1); }

        @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(255, 69, 58, 0.4); }
            70% { box-shadow: 0 0 0 15px rgba(255, 69, 58, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 69, 58, 0); }
        }
      `}</style>
    </div>
  );
}
