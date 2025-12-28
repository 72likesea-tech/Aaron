import { useState, useRef, useEffect } from 'react';
import { Mic, Volume2, ArrowRightLeft, X, Repeat } from 'lucide-react';
import { OpenAIService } from '../services/OpenAIService';

const LANGUAGES = [
    { name: 'Korean', label: '한국어', flag: '🇰🇷', code: 'ko-KR' },
    { name: 'English', label: 'English', flag: '🇺🇸', code: 'en-US' },
    { name: 'Japanese', label: '日本語', flag: '🇯🇵', code: 'ja-JP' },
    { name: 'Chinese', label: '中文', flag: '🇨🇳', code: 'zh-CN' },
    { name: 'German', label: 'Deutsch', flag: '🇩🇪', code: 'de-DE' },
    { name: 'Spanish', label: 'Español', flag: '🇪🇸', code: 'es-ES' },
    { name: 'French', label: 'Français', flag: '🇫🇷', code: 'fr-FR' },
    { name: 'Vietnamese', label: 'Tiếng Việt', flag: '🇻🇳', code: 'vi-VN' },
    { name: 'Hindi', label: 'हिन्दी', flag: '🇮🇳', code: 'hi-IN' },
    { name: 'Indonesian', label: 'Bahasa Indonesia', flag: '🇮🇩', code: 'id-ID' },
    { name: 'Thai', label: 'ไทย', flag: '🇹🇭', code: 'th-TH' },
    { name: 'Italian', label: 'Italiano', flag: '🇮🇹', code: 'it-IT' },
    { name: 'Bengali', label: 'বাংলা', flag: '🇧🇩', code: 'bn-BD' },
    { name: 'Mongolian', label: 'Монгол', flag: '🇲🇳', code: 'mn-MN' },
];

export default function InterpretationView({ onExit }) {
    const [sourceLang, setSourceLang] = useState(LANGUAGES[0]); // Korean default
    const [targetLang, setTargetLang] = useState(LANGUAGES[1]); // English default

    const [history, setHistory] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [activeSide, setActiveSide] = useState(null); // 'source' or 'target'
    const [isProcessing, setIsProcessing] = useState(false);

    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    useEffect(() => {
        // Initialize Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                handleSpeechResult(transcript);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                setActiveSide(null);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                // Don't reset activeSide here, wait for processing
            };
        }
    }, [sourceLang, targetLang, activeSide]);

    const startListening = (side) => {
        if (!recognitionRef.current) {
            alert("Browser does not support speech recognition.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        setActiveSide(side);
        // Set language based on side
        recognitionRef.current.lang = side === 'source' ? sourceLang.code : targetLang.code;

        recognitionRef.current.start();
        setIsListening(true);
    };

    const handleSpeechResult = async (text) => {
        setIsListening(false);
        setIsProcessing(true);

        const fromLang = activeSide === 'source' ? sourceLang : targetLang;
        const toLang = activeSide === 'source' ? targetLang : sourceLang;

        // Add tentative entry
        const newEntry = {
            id: Date.now(),
            sourceText: text,
            sourceLang: fromLang,
            targetLang: toLang,
            translatedText: "Translating...",
            isSource: activeSide === 'source'
        };

        setHistory(prev => [...prev, newEntry]);

        try {
            const result = await OpenAIService.interpret(text, fromLang.name, toLang.name);

            setHistory(prev => prev.map(item =>
                item.id === newEntry.id ? { ...item, translatedText: result } : item
            ));

            // Auto speak translation
            speak(result, toLang.code);

        } catch (error) {
            console.error("Translation failed", error);
            setHistory(prev => prev.map(item =>
                item.id === newEntry.id ? { ...item, translatedText: "Translation failed." } : item
            ));
        } finally {
            setIsProcessing(false);
            setActiveSide(null);
        }
    };

    const speak = (text, langCode) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = langCode;
            window.speechSynthesis.speak(utterance);
        }
    };

    const swapLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
    };

    return (
        <div className="interpret-container">
            <header className="header">
                <button className="icon-btn" onClick={onExit}><X size={24} /></button>
                <h2>Simultaneous Interpretation</h2>
                <div style={{ width: 40 }} />
            </header>

            <div className="history-area">
                {history.length === 0 && (
                    <div className="empty-state">
                        <Repeat size={48} style={{ opacity: 0.2 }} />
                        <p>Select languages and tap the microphone to start.</p>
                    </div>
                )}
                {history.map((item) => (
                    <div key={item.id} className={`history-item ${item.isSource ? 'left' : 'right'}`}>
                        <div className="lang-label">{item.sourceLang.flag} {item.sourceLang.label}</div>
                        <div className="original-text">{item.sourceText}</div>
                        <div className="divider">↓</div>
                        <div className="translated-box">
                            <div className="translated-text">{item.translatedText}</div>
                            <button className="speak-btn" onClick={() => speak(item.translatedText, item.targetLang.code)}>
                                <Volume2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="controls-area">
                <div className="lang-selector">
                    <select
                        value={sourceLang.name}
                        onChange={(e) => setSourceLang(LANGUAGES.find(l => l.name === e.target.value))}
                    >
                        {LANGUAGES.map(l => (
                            <option key={l.name} value={l.name}>{l.flag} {l.label}</option>
                        ))}
                    </select>
                </div>

                <button className="swap-btn" onClick={swapLanguages}>
                    <ArrowRightLeft size={20} />
                </button>

                <div className="lang-selector">
                    <select
                        value={targetLang.name}
                        onChange={(e) => setTargetLang(LANGUAGES.find(l => l.name === e.target.value))}
                    >
                        {LANGUAGES.map(l => (
                            <option key={l.name} value={l.name}>{l.flag} {l.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="mic-controls">
                <button
                    className={`mic-big ${activeSide === 'source' && isListening ? 'listening' : ''}`}
                    onClick={() => startListening('source')}
                    disabled={isProcessing || (isListening && activeSide !== 'source')}
                >
                    <Mic size={32} />
                    <span>{sourceLang.label}</span>
                </button>

                <button
                    className={`mic-big ${activeSide === 'target' && isListening ? 'listening' : ''}`}
                    onClick={() => startListening('target')}
                    disabled={isProcessing || (isListening && activeSide !== 'target')}
                >
                    <Mic size={32} />
                    <span>{targetLang.label}</span>
                </button>
            </div>

            <style>{`
        .interpret-container {
            display: flex;
            flex-direction: column;
            height: 100vh;
            background: var(--bg-primary);
            color: var(--text-primary);
        }
        .header {
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .icon-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            padding: 8px;
            cursor: pointer;
        }
        .history-area {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .empty-state {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            gap: 16px;
        }
        .history-item {
            display: flex;
            flex-direction: column;
            max-width: 85%;
        }
        .history-item.left {
            align-self: flex-start;
        }
        .history-item.right {
            align-self: flex-end;
            align-items: flex-end;
            text-align: right;
        }
        .lang-label {
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 4px;
        }
        .original-text {
            font-size: 18px;
            margin-bottom: 4px;
        }
        .divider {
            font-size: 12px;
            color: var(--text-secondary);
            margin: 4px 0;
            opacity: 0.5;
        }
        .translated-box {
            background: var(--bg-card);
            padding: 12px 16px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .history-item.right .translated-box {
            flex-direction: row-reverse;
        }
        .translated-text {
            color: var(--accent-primary);
            font-weight: 500;
        }
        .speak-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
        }
        .controls-area {
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background: rgba(0,0,0,0.2);
        }
        .lang-selector select {
            background: var(--bg-secondary);
            color: white;
            border: 1px solid rgba(255,255,255,0.1);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            width: 120px;
        }
        .swap-btn {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
        }
        .mic-controls {
            padding: 20px 20px 40px;
            display: flex;
            justify-content: center;
            gap: 32px;
        }
        .mic-big {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            background: rgba(255,255,255,0.05);
            border: 2px solid transparent;
            width: 100px;
            height: 100px;
            border-radius: 50%;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            color: white;
        }
        .mic-big:active { transform: scale(0.95); }
        .mic-big.listening {
            background: var(--accent-primary);
            box-shadow: 0 0 20px rgba(118, 75, 162, 0.5);
            transform: scale(1.1);
        }
        .mic-big:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
      `}</style>
        </div>
    );
}
