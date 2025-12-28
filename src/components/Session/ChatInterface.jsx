import { useState, useEffect, useRef } from 'react';
import { Mic, Send, Volume2, Play, Square, ArrowRight } from 'lucide-react';
import { MockAIService } from '../../services/MockAIService';
import { useUser } from '../../context/UserContext';

export default function ChatInterface({ step, onComplete }) {
  const { settings } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Shadowing Mode State
  const [shadowIndex, setShadowIndex] = useState(0);
  const [shadowData, setShadowData] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const isShadowingMode = step === 2 || step === 5; // Changed from "Demo" to "Shadowing"

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert("Browser does not support speech recognition.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // TTS Helper
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = settings.speed === 'Slow' ? 0.8 : settings.speed === 'Fast' ? 1.2 : 1.0;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    setMessages([]);
    setShadowIndex(0);

    if (isShadowingMode) {
      loadShadowingData();
    } else {
      const greeting = "Hello! Shall we start?";
      setMessages([{ sender: 'ai', text: greeting }]);
      speak(greeting);
    }
  }, [step]);

  const loadShadowingData = async () => {
    const data = await MockAIService.getDemoConversation();
    setShadowData(data);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const response = await MockAIService.processUserMessage(input);
    setIsTyping(false);

    const aiMsg = { sender: 'ai', text: response.text };
    setMessages(prev => [...prev, aiMsg]);
    speak(response.text);
  };

  // Shadowing Logic
  const currentShadowItem = shadowData[shadowIndex];

  const handleShadowNext = () => {
    if (shadowIndex < shadowData.length - 1) {
      setShadowIndex(prev => prev + 1);
    } else {
      onComplete(); // Finish step
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, shadowIndex]);

  // Render Shadowing View
  if (isShadowingMode && currentShadowItem) {
    return (
      <div className="shadowing-container">
        <div className="shadow-header">
          <h2>Listen & Repeat</h2>
          <div className="step-indicator">{shadowIndex + 1} / {shadowData.length}</div>
        </div>

        <div className="shadow-card">
          <div className={`avatar-large ${currentShadowItem.sender}`}>
            {currentShadowItem.sender === 'ai' ? 'AI' : 'You'}
          </div>
          <div className="shadow-text">
            {currentShadowItem.text}
          </div>
          {settings.showTranslation && (
            <div className="shadow-trans">(번역 예시: {currentShadowItem.text}...)</div>
          )}
        </div>

        <div className="shadow-controls">
          <button className="control-btn" onClick={() => speak(currentShadowItem.text)}>
            {isPlaying ? <Square size={24} /> : <Volume2 size={24} />}
            <span>Listen</span>
          </button>

          <button className={`control-btn ${isListening ? 'active' : ''}`} onClick={toggleMic}>
            <Mic size={24} />
            <span>{isListening ? 'Listening...' : 'Speak'}</span>
          </button>
        </div>

        <div className="shadow-input-display">
          {input && <p>You said: "{input}"</p>}
        </div>

        <button className="primary-btn next-shadow-btn" onClick={handleShadowNext}>
          Next Sentence <ArrowRight size={18} />
        </button>

        <style>{`
          .shadowing-container {
            padding: 24px;
            display: flex;
            flex-direction: column;
            height: 100%;
            align-items: center;
            gap: 24px;
          }
          .shadow-header {
            text-align: center;
          }
          .step-indicator {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 4px;
          }
          .shadow-card {
            background: var(--bg-card);
            padding: 32px;
            border-radius: var(--radius-md);
            width: 100%;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          .avatar-large {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
          }
          .avatar-large.ai { background: var(--accent-gradient); }
          .avatar-large.user { background: var(--accent-secondary); }
          
          .shadow-text {
            font-size: 20px;
            font-weight: 600;
            line-height: 1.4;
          }
          .shadow-trans {
            font-size: 14px;
            color: var(--text-secondary);
          }
          .shadow-controls {
            display: flex;
            gap: 24px;
          }
          .control-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.1);
            padding: 16px;
            border-radius: var(--radius-md);
            width: 100px;
            transition: all 0.2s;
          }
          .control-btn:active { transform: scale(0.95); }
          .control-btn.active { background: var(--accent-primary); color: white; }
          
          .shadow-input-display {
            min-height: 24px;
            color: var(--accent-primary);
            font-size: 14px;
          }
          .next-shadow-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
        `}</style>
      </div>
    );
  }

  // Normal Chat Interface (Roleplay)
  return (
    <div className="chat-container">
      <div className="messages-area">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-row ${msg.sender}`}>
            {msg.sender === 'ai' && <div className="avatar">AI</div>}
            <div className="bubble-container">
              <div className="bubble">
                {msg.text}
                {msg.sender === 'ai' && (
                  <button className="audio-btn" onClick={() => speak(msg.text)}>
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
              {settings.showTranslation && msg.sender === 'ai' && (
                <div className="translation">
                  (한국어 번역 예시: {msg.text.substring(0, 10)}...)
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && <div className="typing-indicator">AI is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <button className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={toggleMic}>
          <Mic size={20} />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? "Listening..." : "Type your response..."}
        />
        <button className="send-btn" onClick={handleSend}><Send size={20} /></button>
        <button className="next-step-btn" onClick={onComplete}>Next Step</button>
      </div>

      <style>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .messages-area {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .message-row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .message-row.user {
          flex-direction: row-reverse;
        }
        .avatar {
          width: 32px;
          height: 32px;
          background: var(--accent-gradient);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .bubble-container {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 70%;
        }
        .bubble {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 15px;
          line-height: 1.5;
          position: relative;
        }
        .message-row.ai .bubble {
          background: var(--bg-card);
          border-bottom-left-radius: 4px;
        }
        .message-row.user .bubble {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .audio-btn {
          position: absolute;
          right: -24px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          color: var(--text-secondary);
        }
        .translation {
          font-size: 12px;
          color: var(--text-secondary);
          padding-left: 4px;
        }
        .input-area {
          padding: 16px;
          background: var(--bg-secondary);
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .mic-btn {
          background: rgba(255,255,255,0.1);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.2s;
        }
        .mic-btn.listening {
          background: var(--accent-primary);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(118, 75, 162, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(118, 75, 162, 0); }
          100% { box-shadow: 0 0 0 0 rgba(118, 75, 162, 0); }
        }
        input {
          flex: 1;
          background: rgba(0,0,0,0.2);
          border: none;
          padding: 12px;
          border-radius: 20px;
          color: white;
        }
        .send-btn {
          color: var(--accent-primary);
          background: transparent;
        }
        .next-step-btn {
          font-size: 12px;
          padding: 8px;
          background: rgba(255,255,255,0.1);
          color: white;
          border-radius: 8px;
        }
        .typing-indicator {
          font-size: 12px;
          color: var(--text-secondary);
          margin-left: 44px;
        }
      `}</style>
    </div>
  );
}
