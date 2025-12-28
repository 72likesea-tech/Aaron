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
      - scenario: string (Situation description in English)
      - keyExpressions: array of ${sentenceCount} objects { text: string (English sentence), translation: string (Korean), explanation: string (Korean nuance) }
      - shadowingSentences: array of 3 strings (English sentences related to the topic for shadowing practice)
      - tips: string (One sentence advice in English)
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
                scenario: "You are practicing specialized English expressions.",
                keyExpressions: [
                    {
                        text: "Could you elaborate on that?",
                        translation: "그 부분에 대해 좀 더 자세히 말씀해 주시겠어요?",
                        explanation: "상대방의 의견을 더 듣고 싶을 때 사용하는 정중한 표현입니다."
                    }
                ],
                shadowingSentences: [
                    "Could you elaborate on that?",
                    "I see where you're coming from.",
                    "That's a valid point."
                ],
                tips: "Focus on clear pronunciation and polite intonation."
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

            const prompt = `Review this conversation and identify grammatical errors or awkward expressions used by the Student.
            Ignore the AI's lines.
            Focus ONLY on mistakes. If the student's sentence is perfect, ignore it.
            
            Return a strictly valid JSON array of objects.
            Each object must have:
            - original: string (The student's exact wrong sentence)
            - correction: string (Natural native correction)
            - reason: string (Brief explanation in Korean)
            
            Limit to top 5 most important corrections.
            
            Conversation:
            ${conversationText}`;

            const completion = await callOpenAI(
                [{ role: "system", content: "You are an English teacher." }, { role: "user", content: prompt }],
                400 // max_tokens
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
