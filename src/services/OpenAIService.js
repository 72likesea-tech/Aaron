import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Direct client for development only
const directOpenAI = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
});

const MODEL_NAME = "gpt-4o-mini";

// Helper to switch between Proxy (Prod) and Direct (Dev)
const callOpenAI = async (messages, max_tokens = 4000) => {
    // In development mode, use direct SDK for speed/debugging ease
    if (import.meta.env.DEV) {
        const completion = await directOpenAI.chat.completions.create({
            messages,
            model: MODEL_NAME,
            max_tokens,
        });
        return completion;
    }

    // In production (Vercel), use the serverless proxy
    const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages,
            model: MODEL_NAME,
            max_tokens,
        }),
    });

    if (!response.ok) {
        throw new Error(`Proxy error: ${response.statusText}`);
    }

    return await response.json();
};

export const OpenAIService = {
    // Generate topics based on user preferences and learning time
    generateTopics: async (interest = 'general', learningTime = 10) => {
        try {
            const prompt = `Generate 5 English conversation topics for a ${interest} context. 
      The user wants to study for ${learningTime} minutes.
      If the time is short (<=10 mins), keep topics simple and focused.
      Return strictly a JSON array of objects with keys: id (number), type (string: Business/Casual/Deep), title (string), icon (emoji string).
      Do not wrap in markdown code blocks.`;

            const completion = await callOpenAI(
                [{ role: "system", content: "You are a helpful English tutor." }, { role: "user", content: prompt }]
            );

            let text = completion.choices[0].message.content.trim();
            text = text.replace(/```json/g, '').replace(/```/g, '');
            const firstBracket = text.indexOf('[');
            const lastBracket = text.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                text = text.substring(firstBracket, lastBracket + 1);
            }
            return JSON.parse(text);
        } catch (error) {
            console.error("OpenAI generateTopics error:", error);
            return [
                { id: 1, type: 'Casual', title: 'Daily Routine (Fallback)', icon: '📅' },
                { id: 2, type: 'Business', title: 'Job Interview (Fallback)', icon: '💼' }
            ];
        }
    },

    // Start a new learning session
    startSession: async (topic, learningTime = 10) => {
        try {
            const complexity = learningTime <= 10 ? "simple, short, and concise" : "natural, detailed, and engaging";
            const sentenceCount = learningTime <= 10 ? 3 : 5;

            const prompt = `Create an English learning session about "${topic.title}".
      Target audience: Korean English learner.
      Context: ${complexity}.
      Return strictly a JSON object with:
      - mission: string (Goal of the session in English)
      - missionTranslation: string (Korean translation of the mission)
      - scenario: string (Situation description in English)
      - scenarioTranslation: string (Korean translation of the scenario)
      - keyExpressions: array of ${sentenceCount} objects { text: string (English sentence), translation: string (Korean), explanation: string (Korean nuance) }
      - shadowingSentences: array of 3 objects { text: string (English sentence), translation: string (Korean translation) }
      - tips: string (One sentence advice in English)
      - freeTalkIntro: string (An engaging opening question for the free talk session in English, related to the topic)
      Do not wrap in markdown code blocks.`;

            const completion = await callOpenAI(
                [{ role: "system", content: "You are a helpful English tutor." }, { role: "user", content: prompt }]
            );

            let text = completion.choices[0].message.content.trim();
            text = text.replace(/```json/g, '').replace(/```/g, '');
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                text = text.substring(firstBrace, lastBrace + 1);
            }
            return JSON.parse(text);
        } catch (error) {
            console.error("OpenAI startSession error:", error);
            // Fallback data
            return {
                mission: `Master the topic "${topic.title}" (Offline Mode)`,
                missionTranslation: `주제 "${topic.title}" 마스터하기`,
                scenario: "You are practicing specialized English expressions.",
                scenarioTranslation: "전문적인 영어 표현을 연습하는 상황입니다.",
                keyExpressions: [
                    {
                        text: "Could you elaborate on that?",
                        translation: "그 부분에 대해 좀 더 자세히 말씀해 주시겠어요?",
                        explanation: "상대방의 의견을 더 듣고 싶을 때 사용하는 정중한 표현입니다."
                    }
                ],
                shadowingSentences: [
                    { text: "Could you elaborate on that?", translation: "그 부분에 대해 좀 더 자세히 말씀해 주시겠어요?" },
                    { text: "I see where you're coming from.", translation: "어떤 입장이신지 이해가 갑니다." },
                    { text: "That's a valid point.", translation: "일리가 있는 말씀이네요." }
                ],
                tips: "Focus on clear pronunciation and polite intonation.",
                freeTalkIntro: "What are your thoughts on this topic?"
            };
        }
    },

    // Assess pronunciation/grammar for Shadowing step
    assessPronunciation: async (targetSentence, userSpeech) => {
        try {
            const prompt = `Target sentence: "${targetSentence}"
            User said: "${userSpeech}"
            Compare the user's speech to the target.
            Return a JSON object: { "isCorrect": boolean, "feedback": string (Korean, brief advice on pronunciation or missing words) }
            If it's mostly correct, say "Good job" or similar in feedback.`;

            const completion = await callOpenAI(
                [{ role: "system", content: "You are a helpful pronunciation coach." }, { role: "user", content: prompt }]
            );

            let text = completion.choices[0].message.content.trim();
            text = text.replace(/```json/g, '').replace(/```/g, '');
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                text = text.substring(firstBrace, lastBrace + 1);
            }
            return JSON.parse(text);
        } catch (error) {
            console.error("Assessment error", error);
            return { isCorrect: true, feedback: "AI 연결 상태가 좋지 않아 정확한 피드백을 드릴 수 없습니다." };
        }
    },

    // Free Talk Chat
    freeTalkChat: async (message, history) => {
        try {
            const openAIMessages = history.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : 'user',
                content: msg.parts[0].text
            }));

            openAIMessages.push({ role: 'user', content: message });
            openAIMessages.unshift({ role: "system", content: "You are a friendly English conversation partner. Keep responses concise and engaging." });

            const completion = await callOpenAI(
                openAIMessages,
                150 // max_tokens
            );

            return completion.choices[0].message.content;
        } catch (error) {
            console.error("OpenAI freeTalkChat error:", error);
            return "Good job! Let's continue.";
        }
    },

    // Analyze conversation and provide feedback
    generateConversationFeedback: async (history) => {
        try {
            // Extract only user messages for analysis
            const userMessages = history.filter(m => m.role === 'user' || m.sender === 'user');

            // If very little conversation, skip
            if (userMessages.length < 1) return [];

            const conversationText = history.map(m => {
                const role = m.role === 'model' || m.sender === 'ai' ? 'AI' : 'Student';
                const text = m.parts ? m.parts[0].text : m.text;
                return `${role}: ${text}`;
            }).join('\n');

            const prompt = `Review this conversation between an AI Tutor and a Student. 
            Analyze the Student's English for:
            1. Grammatical errors
            2. Awkward expressions (suggest more natural, native-like phrasing)
            3. Potential pronunciation challenges based on the text (e.g. difficult words, linking).

            Return a strictly valid JSON array of objects (top 5 most critical items).
            Each object must have:
            - original: string (The student's exact part of the sentence)
            - correction: string (The natural/corrected version)
            - reason: string (Brief explanation in Korean about grammar or nuance)
            - pronunciationTip: string (Optional Korean tip on how to pronounce this better. e.g., "Note the 'th' sound in 'think'.")

            Conversation:
            ${conversationText}`;

            const completion = await callOpenAI(
                [{ role: "system", content: "You are an expert English linguist and pronunciation coach." }, { role: "user", content: prompt }],
                600 // max_tokens
            );

            let text = completion.choices[0].message.content.trim();
            // Handle markdown wrapping
            text = text.replace(/```json/g, '').replace(/```/g, '');
            const firstBracket = text.indexOf('[');
            const lastBracket = text.lastIndexOf(']');
            if (firstBracket !== -1 && lastBracket !== -1) {
                text = text.substring(firstBracket, lastBracket + 1);
            }
            return JSON.parse(text);
        } catch (error) {
            console.error("Feedback generation error:", error);
            return [];
        }
    },
    // Generate Speech (TTS)
    speak: async (text, voice = 'shimmer', speedPercent = 100) => {
        try {
            // Map percentage (50-120) to OpenAI speed (0.7 - 1.2)
            // 50% -> 0.75 (very slow & clear)
            // 100% -> 1.0
            // 120% -> 1.2
            let speed = 1.0;
            if (speedPercent <= 50) speed = 0.75;
            else if (speedPercent >= 120) speed = 1.2;
            else {
                // Linear interpolation between 0.75 and 1.2?
                // Actually, let's keep it simple:
                // 50-99 -> map 0.75 to 1.0
                // 100-120 -> map 1.0 to 1.2
                if (speedPercent < 100) {
                    speed = 0.75 + ((speedPercent - 50) / 50) * 0.25;
                } else {
                    speed = 1.0 + ((speedPercent - 100) / 20) * 0.2;
                }
            }

            // Limit range strictly for API safety (0.25 to 4.0 is allowed, but we want natural range)
            speed = Math.max(0.7, Math.min(1.3, speed));

            if (import.meta.env.DEV) {
                // Direct TTS for Dev
                const mp3 = await directOpenAI.audio.speech.create({
                    model: "tts-1",
                    voice: voice,
                    input: text,
                    speed: speed,
                });
                const blob = await mp3.blob();
                return URL.createObjectURL(blob);
            }

            // Production Proxy
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice, speed }),
            });
            if (!response.ok) throw new Error("TTS Failed");
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error("OpenAI TTS error:", error);
            return null; // Fallback will be handled by caller
        }
    },

    // Transcript Audio (Whisper)
    transcribeAudio: async (audioBlob) => {
        try {
            const file = new File([audioBlob], "input.webm", { type: "audio/webm" });

            if (import.meta.env.DEV) {
                const response = await directOpenAI.audio.transcriptions.create({
                    file: file,
                    model: "whisper-1",
                });
                return response.text;
            }

            // Production Proxy strategy (assumes formData support on endpoint, or need new endpoint)
            // For now, let's assume we can post FormData to a transcription endpoint
            // OR simpler: Since we don't have a backend proxy implemented for multipart yet in this context,
            // we might stick to Direct for now if the user hasn't set up a full backend.
            // BUT the user context implies a 'proxy' endpoint exists (`/api/proxy`).
            // Handling multipart/form-data on generic JSON proxy is hard.
            // Let's assume Dev mode / Direct is primary for this user (Localhost).
            // If Prod, we need a specific endpoint. I'll implement a defensive error or attempt.

            // NOTE: Current /api/proxy likely expects JSON. Uploading files requires different handling.
            // I will implement Direct call logic for the immediate fix as most users here are local.
            // If strictly needed, I'd create a /api/transcribe endpoint.
            // For safety, I'll stick to the pattern but if Dev is detected (which is likely true for `npm run dev`) it works.

            // Fallback for production if needed:
            const formData = new FormData();
            formData.append('file', file);
            formData.append('model', 'whisper-1');

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("Transcription Server Error:", errText);
                throw new Error("Transcription Failed");
            }
            const data = await response.json();
            return data.text;

        } catch (error) {
            console.error("OpenAI Transcribe error:", error);
            return "";
        }
    },

    // Simultaneous Interpretation
    interpret: async (text, sourceLang, targetLang) => {
        try {
            const prompt = `Translate the following text from ${sourceLang} to ${targetLang}.
            Only return the translated text. Do not add any explanations or notes.
            
            Text: "${text}"`;

            const completion = await callOpenAI(
                [
                    { role: "system", content: "You are a professional simultaneous interpreter." },
                    { role: "user", content: prompt }
                ]
            );

            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error("Interpretation error:", error);
            return "Translation failed due to error.";
        }
    }
};
