import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Square, AlertCircle, Send, Loader2 } from 'lucide-react';
import { OpenAIService } from '../../services/OpenAIService';
import { useUser } from '../../context/UserContext';

export default function FreeTalkView({ data, onNext }) {
    const { settings } = useUser();
    const currentVoice = settings?.voice || 'shimmer';

    const [messages, setMessages] = useState([
        {
            sender: 'ai',
            text: data?.freeTalkIntro || "Let's start free talking! What do you think about the topic?"
        }
    ]);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const audioRef = useRef(null);
    const voicesChangedListener = useRef(false);

    useEffect(() => {
        isSessionActiveRef.current = isSessionActive;
        return () => {
            // Cleanup audio and synthesis on unmount
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            window.speechSynthesis.cancel();
        };
    }, [isSessionActive]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isRecording, isTranscribing]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const startSession = () => {
        setErrorMsg(null);
        setIsSessionActive(true);

        // Prevent multiple initial greetings
        if (window.speechSynthesis.getVoices().length === 0 && !voicesChangedListener.current) {
            voicesChangedListener.current = true;
            const handleVoices = () => {
                playInitialGreeting();
                window.speechSynthesis.removeEventListener('voiceschanged', handleVoices);
            };
            window.speechSynthesis.addEventListener('voiceschanged', handleVoices);
        } else {
            playInitialGreeting();
        }
    };

    const playInitialGreeting = () => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.sender === 'ai') {
            speak(lastMsg.text);
        } else {
            startRecording();
        }
    };

    const stopSession = () => {
        setIsSessionActive(false);
        setIsRecording(false);
        setIsSpeaking(false);
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop();
        }
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();
    };

    const startRecording = async () => {
        if (!isSessionActiveRef.current) return;
        try {
            setErrorMsg(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                await processAudioMessage(audioBlob);
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error starting recording:", err);
            setErrorMsg("마이크 접근에 실패했습니다.");
            setIsSessionActive(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    const processAudioMessage = async (audioBlob) => {
        setIsTranscribing(true);
        try {
            const text = await OpenAIService.transcribeAudio(audioBlob);
            if (text && text.trim()) {
                await handleUserMessage(text);
            } else {
                if (isSessionActiveRef.current) startRecording();
            }
        } catch (err) {
            console.error("Transcription error:", err);
            setErrorMsg("음성 인식 중 오류가 발생했습니다.");
            if (isSessionActiveRef.current) startRecording();
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleUserMessage = async (text) => {
        const userMsg = { sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);

        const history = [...messages, userMsg].map(m => ({
            role: m.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        try {
            const aiResponseText = await OpenAIService.freeTalkChat(text, history);
            const aiMsg = { sender: 'ai', text: aiResponseText };
            setMessages(prev => [...prev, aiMsg]);
            speak(aiResponseText);
        } catch (err) {
            console.error("Chat error:", err);
            setErrorMsg("AI 응답을 가져오는 중 오류가 발생했습니다.");
        }
    };

    const speak = async (text) => {
        // Stop any currently playing audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.speechSynthesis.cancel();

        setIsSpeaking(true);
        try {
            const audioUrl = await OpenAIService.speak(text, currentVoice, settings.speed || 100);
            if (audioUrl) {
                const audio = new Audio(audioUrl);
                audioRef.current = audio;
                audio.onended = () => {
                    setIsSpeaking(false);
                    audioRef.current = null;
                    if (isSessionActiveRef.current) {
                        startRecording();
                    }
                };
                audio.play().catch(e => {
                    console.error("Audio play failed:", e);
                    fallbackSpeak(text);
                });
            } else {
                fallbackSpeak(text);
            }
        } catch (e) {
            console.error("TTS Error", e);
            fallbackSpeak(text);
        }
    };

    const fallbackSpeak = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.onend = () => {
            setIsSpeaking(false);
            if (isSessionActiveRef.current) {
                startRecording();
            }
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

                {isRecording && (
                    <div className="message user preview">
                        <div className="bubble recording-pulse">
                            <div className="recording-dot" />
                            말씀하시면 녹음됩니다...
                        </div>
                    </div>
                )}

                {isTranscribing && (
                    <div className="message user preview">
                        <div className="bubble transcribing">
                            <Loader2 className="spin" size={16} />
                            생각하는 중...
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
                    <div className="active-controls-column">
                        <div className={`status-text ${isSpeaking ? 'speaking' : isTranscribing ? 'transcribing' : 'listening'}`}>
                            {isSpeaking ? (
                                <>
                                    <Volume2 size={24} /> AI Speaking...
                                </>
                            ) : isTranscribing ? (
                                <>
                                    <Loader2 size={24} className="spin" /> Processing...
                                </>
                            ) : (
                                <>
                                    <Mic size={24} /> Listening...
                                </>
                            )}
                        </div>

                        {!isSpeaking && !isTranscribing && (
                            <button className="large-done-btn" onClick={stopRecording}>
                                <Send size={24} fill="currentColor" />
                                <span>말하기 완료 (DONE)</span>
                            </button>
                        )}

                        {(isSpeaking || isTranscribing) && (
                            <div className="speaking-spacer">
                                {isSpeaking ? "AI가 답변 중입니다..." : "음성을 텍스트로 변환 중입니다..."}
                            </div>
                        )}
                    </div>
                )}
            </div>

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
        .message.user { align-self: flex-end; flex-direction: row-reverse; }
        .message.ai .bubble {
            background: var(--bg-card);
            border-top-left-radius: 4px;
        }
        .message.user .bubble {
            background: var(--accent-primary);
            color: white;
            border-bottom-right-radius: 4px;
        }
        .bubble {
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 15px;
            line-height: 1.5;
        }
        
        .recording-pulse {
            display: flex;
            align-items: center;
            gap: 8px;
            opacity: 0.8;
            font-style: italic;
        }
        .recording-dot {
            width: 8px;
            height: 8px;
            background: #ff4757;
            border-radius: 50%;
            animation: blink 1s infinite;
        }
        
        .transcribing {
            display: flex;
            align-items: center;
            gap: 8px;
            opacity: 0.7;
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
        
        .active-controls-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            gap: 16px;
        }

        .status-text {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            color: var(--text-secondary);
        }
        .status-text.listening { color: var(--success); }
        .status-text.speaking { color: var(--accent-primary); }
        .status-text.transcribing { color: #f1c40f; }

        .large-done-btn {
            width: 100%;
            max-width: 320px;
            background: var(--accent-primary);
            color: white;
            border: none;
            padding: 18px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
            transition: transform 0.1s;
        }
        .large-done-btn:active {
            transform: scale(0.98);
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
        
        .spin { animation: spin 2s linear infinite; }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.3; }
            100% { opacity: 1; }
        }
        
        .finish-link {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 16px;
            font-size: 14px;
            text-decoration: underline;
        }
        
        .speaking-spacer {
            height: 24px;
            font-size: 14px;
            color: var(--text-secondary);
        }
      `}</style>
        </div>
    );
}
