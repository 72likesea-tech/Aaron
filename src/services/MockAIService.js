// Mock AI Service to simulate dynamic generation

const TOPIC_TEMPLATES = {
    business: [
        "Negotiating a new software contract",
        "Presenting Q3 sales results",
        "Discussing product roadmap with stakeholders",
        "Handling a customer complaint about delivery",
        "Interviewing for a Project Manager role"
    ],
    casual: [
        "Discussing weekend hiking plans",
        "Recommending a favorite restaurant",
        "Talking about a new Netflix series",
        "Explaining a Korean traditional holiday",
        "Asking for advice on a relationship issue"
    ],
    deep: [
        "Debating the ethics of AI development",
        "Discussing climate change solutions",
        "Analyzing the impact of remote work on society",
        "Exploring the future of space travel",
        "Talking about economic inequality"
    ]
};

export const MockAIService = {
    generateTopics: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        return [
            { id: 1, type: 'Business', title: getRandom(TOPIC_TEMPLATES.business), icon: '💼' },
            { id: 2, type: 'Casual', title: getRandom(TOPIC_TEMPLATES.casual), icon: '☕' },
            { id: 3, type: 'Casual', title: getRandom(TOPIC_TEMPLATES.casual), icon: '✈️' },
            { id: 4, type: 'Deep', title: getRandom(TOPIC_TEMPLATES.deep), icon: '🌍' },
            { id: 5, type: 'Deep', title: getRandom(TOPIC_TEMPLATES.deep), icon: '🧠' },
        ];
    },

    startSession: async (topic) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            mission: `Master the conversation about "${topic.title}"`,
            scenario: "You are meeting a colleague/friend in a quiet cafe.",
            keyExpressions: [
                {
                    text: "Could you elaborate on that?",
                    translation: "그 부분에 대해 좀 더 자세히 말씀해 주시겠어요?",
                    explanation: "상대방의 의견을 더 듣고 싶을 때 사용하는 정중한 표현입니다."
                },
                {
                    text: "I see where you're coming from.",
                    translation: "당신의 입장이 이해가 됩니다.",
                    explanation: "상대방의 의견에 공감하거나 이해했음을 나타낼 때 씁니다."
                },
                {
                    text: "Let's agree to disagree.",
                    translation: "서로의 의견 차이를 인정하고 넘어가죠.",
                    explanation: "논쟁이 해결되지 않을 때 서로의 다름을 인정하며 마무리하는 표현입니다."
                },
                {
                    text: "That's a valid point.",
                    translation: "일리 있는 말씀이네요.",
                    explanation: "상대방의 주장이 타당하다고 인정할 때 사용합니다."
                },
                {
                    text: "In my humble opinion...",
                    translation: "제 짧은 소견으로는...",
                    explanation: "자신의 의견을 조심스럽고 겸손하게 밝힐 때 쓰는 서두입니다."
                }
            ],
            tips: "Focus on clear pronunciation and polite intonation."
        };
    },

    getDemoConversation: async () => {
        return [
            { sender: 'ai', text: "Hi there! Is this seat taken?" },
            { sender: 'user', text: "No, go ahead." },
            { sender: 'ai', text: "Thanks. I'm waiting for a friend. How about you?" },
            { sender: 'user', text: "I'm just catching up on some reading." },
            { sender: 'ai', text: "Nice. I'm Alex, by the way." },
            { sender: 'ai', text: "Are you ready?" }
        ];
    },

    processUserMessage: async (message) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
            text: `That's interesting! You said "${message}". Tell me more about that.`,
            correction: null
        };
    }
};
