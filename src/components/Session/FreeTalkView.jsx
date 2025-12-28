import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Square, AlertCircle } from 'lucide-react';
import { OpenAIService } from '../../services/OpenAIService';

export default function FreeTalkView({ data, onNext }) {
    const [messages, setMessages] = useState([
        { sender: 'ai', text: "Let's start free talking! What do you think about the topic?" }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const chatEndRef = useRef(null);
    const recognition = useRef(null);
    const stopTimer = useRef(null); // Timer for auto-submit after speech stops
    const isRestarting = useRef(false); // Flag to prevent double-starts

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = true; // Changed to true to keep mic open longer
            recognition.current.lang = 'en-US';
            recognition.current.interimResults = true;
            recognition.current.maxAlternatives = 1;

            recognition.current.onstart = () => {
                setIsListening(true);
                isRestarting.current = false;
            };

            recognition.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // If we have text, update UI
                const currentText = finalTranscript || interimTranscript;
                setTranscript(currentText);

                // Debounce logic: If user stops speaking for 1.5s, submit.
                if (stopTimer.current) clearTimeout(stopTimer.current);

                if (currentText.trim()) {
                    stopTimer.current = setTimeout(() => {
                        // User stopped speaking for 1.5s -> Submit
                        recognition.current?.stop();
                        // onend will handle the submission check
                    }, 1500);
                }
            };

            recognition.current.onerror = (event) => {
                console.error("Speech Recognition Error", event.error);
                if (event.error === 'no-speech') {
                    // Ignore no-speech error, allow auto-restart in onend
                    return;
                }
                setIsListening(false);

                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    setErrorMsg("마이크 권한이 거부되었습니다.");
                    setIsSessionActive(false);
                } else if (event.error === 'network') {
                    setErrorMsg("네트워크 오류 발생.");
                } else if (event.error === 'aborted') {
                    // Ignore aborted (manual stop)
                } else {
                    // For other errors, we might want to show them but not kill session
                    // setErrorMsg(`오류: ${event.error}`);
                }
            };

            recognition.current.onend = () => {
                setIsListening(false); // Update UI state

                // Logic:
                // 1. If we have a transcript -> Submit it (and AI will reply, then we restart listening after TTS)
                // 2. If NO transcript -> and session active -> Restart listening immediately (loop)
                // 3. If session not active -> Do nothing

                // We need to access the LATEST transcript state. 
                // Since this closure might be stale, we rely on the fact that setTranscript updates state 
                // but we can't read it here easily without a ref. 
                // Refactoring to use a ref for transcript.
            };
        } else {
            setErrorMsg("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.");
        }

        return () => {
            if (stopTimer.current) clearTimeout(stopTimer.current);
            recognition.current?.stop();
            window.speechSynthesis.cancel();
        };
    }, []);

    // Use a ref to track transcript for accessing inside callbacks
    const transcriptRef = useRef('');
    useEffect(() => {
        transcriptRef.current = transcript;
    }, [transcript]);

    // Use a ref to track session active state
    const isSessionActiveRef = useRef(false);
    useEffect(() => {
        isSessionActiveRef.current = isSessionActive;
    }, [isSessionActive]);


    // Re-attach onend/onerror with access to fresh refs if needed, or just use refs inside the static logic
    // Actually, `recognition.current` is stable. We can just define the callbacks once and use refs.
    useEffect(() => {
        if (!recognition.current) return;

        recognition.current.onend = () => {
            setIsListening(false);
            const text = transcriptRef.current;

            if (isSessionActiveRef.current) {
                if (text.trim()) {
                    // We have text! Submit it.
                    handleSendMessage(text);
                } else {
                    // No text (silence or error), but session is active.
                    // Restart listening immediately.
                    if (!isSpeaking) { // verifying we are not speaking TTS
                        // Introduce small delay to prevent rapid-fire loops
                        setTimeout(() => {
                            if (isSessionActiveRef.current && !isSpeaking) startListening();
                        }, 100);
                    }
                }
            }
        };
    }, []); // Run once to attach handlers


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startSession = () => {
        setErrorMsg(null);
        setIsSessionActive(true);
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => playInitialGreeting();
        } else {
            playInitialGreeting();
        }
    };

    const playInitialGreeting = () => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.sender === 'ai') {
            speak(lastMsg.text, true);
        } else {
            startListening();
        }
    };

    const stopSession = () => {
        setIsSessionActive(false);
        setIsListening(false);
        setIsSpeaking(false);
        if (stopTimer.current) clearTimeout(stopTimer.current);
        recognition.current?.stop();
        window.speechSynthesis.cancel();
    };

    const startListening = () => {
        setErrorMsg(null);
        setTranscript(''); // Clear UI transcript
        transcriptRef.current = ''; // Clear ref

        try {
            recognition.current?.start();
        } catch (e) {
            // console.log("Already started", e);
        }
    };

    const handleSendMessage = async (text) => {
        const userMsg = { sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setTranscript('');
        transcriptRef.current = '';

        // Stop listening (it's already stopped by onEnd usually, but safe to ensure)
        // recognition.current?.stop(); 

        const history = messages.map(m => ({
            role: m.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        const aiResponseText = await OpenAIService.freeTalkChat(text, history);

        const aiMsg = { sender: 'ai', text: aiResponseText };
        setMessages(prev => [...prev, aiMsg]);

        speak(aiResponseText);
    };

    const speak = (text, force = false) => {
        window.speechSynthesis.cancel();
        recognition.current?.stop(); // Ensure mic is off while speaking

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US');
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setTimeout(() => {
                // Resume listening only if session is still active
                if (isSessionActiveRef.current) {
                    startListening();
                }
            }, 300);
        };
        utterance.onerror = (e) => {
            console.error("TTS Error", e);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleFinish = () => {
        stopSession();
        onNext(messages);
    };

    return (
        <div className="freetalk-container">
            <header className="chat-header">
                <h2>Real-time Free Talk</h2>
                <div className="status-indicator">
                    {isSessionActive ? (
                        <span className="live">● LIVE</span>
                    ) : (
                        <span className="paused">● Ready</span>
                    )}
                </div>
            </header>

            <div className="chat-window">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.sender}`}>
                        {msg.sender === 'ai' && <div className="avatar">AI</div>}
                        <div className="bubble">
                            {msg.text}
                        </div>
                    </div>
                ))}
                {(isListening || transcript) && (
                    <div className="message user preview">
                        <div className="bubble typing">
                            {transcript || "Listening..."} <span className="cursor">|</span>
                        </div>
                    </div>
                )}
                {errorMsg && (
                    <div className="error-message">
                        <AlertCircle size={16} /> {errorMsg}
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="controls-area">
                {!isSessionActive ? (
                    <button className="icon-btn start" onClick={startSession}>
                        <Mic size={32} />
                        <span>Start Talking</span>
                    </button>
                ) : (
                    <div className="active-controls">
                        <div className={`visualizer ${isSpeaking ? 'speaking' : 'listening'}`}>
                            {isSpeaking ? (
                                <>
                                    <Volume2 className="pulse-icon" size={24} /> AI Speaking...
                                </>
                            ) : (
                                <>
                                    <Mic className="pulse-icon" size={24} />
                                    {isListening ? "Listening..." : "Processing..."}
                                </>
                            )}
                        </div>
                        <button className="icon-btn stop" onClick={stopSession}>
                            <Square size={24} fill="currentColor" />
                            <span>Pause</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Manual Retry Button if active but stuck */}
            {isSessionActive && !isListening && !isSpeaking && (
                <button className="retry-listening-btn" onClick={startListening}>
                    Resume Listening
                </button>
            )}

            <button className="finish-link" onClick={handleFinish}>
                학습 종료하기 (Finish & Feedback)
            </button>

            <style>{`
        .freetalk-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-main);
        }
        .chat-header {
            padding: 16px;
            background: rgba(0,0,0,0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chat-header h2 { font-size: 16px; color: var(--accent-primary); }
        .live { color: var(--success); font-weight: 700; font-size: 12px; }
        .paused { color: var(--text-secondary); font-size: 12px; }
        
        .chat-window {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .message {
            display: flex;
            gap: 8px;
            max-width: 80%;
        }
        .message.ai { align-self: flex-start; }
        .message.user .bubble {
            background: var(--accent-primary);
            color: white;
            border-bottom-right-radius: 4px;
        }
        .message.user { align-self: flex-end; flex-direction: row-reverse; }
        .message.ai .bubble {
            border-top-left-radius: 4px;
        }
        .bubble {
            background: var(--bg-card);
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 15px;
            line-height: 1.5;
        }
        
        .error-message {
            background: rgba(255, 71, 87, 0.1);
            color: var(--error);
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
        }

        .controls-area {
            padding: 24px;
            background: var(--bg-card);
            border-top: 1px solid rgba(255,255,255,0.05);
            display: flex;
            justify-content: center;
        }
        
        .icon-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
        }
        .icon-btn.start { color: var(--success); }
        .icon-btn.start svg {
            background: rgba(46, 213, 115, 0.2);
            padding: 16px;
            border-radius: 50%;
            width: 64px;
            height: 64px;
            transition: all 0.3s;
        }
        .icon-btn.start:hover svg {
            transform: scale(1.05);
            background: rgba(46, 213, 115, 0.3);
        }
        
        .active-controls {
            display: flex;
            align-items: center;
            gap: 24px;
            width: 100%;
            justify-content: center;
        }
        
        .visualizer {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-weight: 600;
            color: var(--accent-primary);
        }
        .visualizer.listening { color: var(--error); }
        .pulse-icon { animation: pulse-scale 1s infinite; }
        
        .icon-btn.stop { color: var(--text-secondary); }

        .finish-link {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 16px;
            font-size: 14px;
            text-decoration: underline;
        }
        
        .retry-listening-btn {
            background: var(--bg-secondary);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            margin: 0 auto 10px;
            display: block;
            font-size: 12px;
        }
        
        @keyframes pulse-scale {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
        </div>
    );
}
