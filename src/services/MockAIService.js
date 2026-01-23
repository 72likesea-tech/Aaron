// Mock AI Service to simulate dynamic generation

const TOPIC_TEMPLATES = {
    business: [
        { title: "Negotiating a new software contract" },
        { title: "Presenting Q3 sales results" },
        { title: "Discussing product roadmap with stakeholders" },
        { title: "Handling a customer complaint about delivery" },
        { title: "Interviewing for a Project Manager role" }
    ],
    casual_standard: [
        { title: "Discussing weekend hiking plans" },
        { title: "Recommending a favorite restaurant" },
        { title: "Talking about a new Netflix series" },
        { title: "Explaining a Korean traditional holiday" },
        { title: "Asking for advice on a relationship issue" }
    ],
    casual_movie: [
        { title: "I love you 3000.", source: "Avengers: Endgame (2019)" },
        { title: "This is the way.", source: "The Mandalorian (2019)" },
        { title: "Be curious, not judgmental.", source: "Ted Lasso (2020)" },
        { title: "I can do this all day.", source: "Captain America: Civil War (2016)" },
        { title: "Whatever it takes.", source: "Avengers: Endgame (2019)" },
        { title: "We are the spark, that will light the fire that'll burn the First Order down.", source: "Star Wars: The Last Jedi (2017)" },
        { title: "Just let me go. It's okay.", source: "Black Widow (2021)" },
        { title: "I have nothing to prove to you.", source: "Captain Marvel (2019)" }
    ],
    deep: [
        { title: "Debating the ethics of AI development" },
        { title: "Discussing climate change solutions" },
        { title: "Analyzing the impact of remote work on society" },
        { title: "Exploring the future of space travel" },
        { title: "Talking about economic inequality" }
    ]
};

export const MockAIService = {
    generateTopics: async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        // Helper to format topic object
        const createTopic = (type, template, icon) => ({
            id: Math.random().toString(36).substr(2, 9),
            type: type,
            title: template.title,
            source: template.source || null,
            icon: icon
        });

        return [
            createTopic('Business', getRandom(TOPIC_TEMPLATES.business), '💼'),
            // Casual 1: Movie/Drama Quote
            createTopic('Casual', getRandom(TOPIC_TEMPLATES.casual_movie), '🎬'),
            // Casual 2: Standard Topic
            createTopic('Casual', getRandom(TOPIC_TEMPLATES.casual_standard), '☕'),
            createTopic('Deep', getRandom(TOPIC_TEMPLATES.deep), '🌍'),
            createTopic('Deep', getRandom(TOPIC_TEMPLATES.deep), '🧠'),
        ];
    },

    startSession: async (topic) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
            mission: `Master the conversation about "${topic.title}"`,
            missionTranslation: `"${topic.title}"에 대한 대화를 마스터하세요`,
            scenario: "You are meeting a colleague/friend in a quiet cafe.",
            scenarioTranslation: "조용한 카페에서 동료/친구를 만나는 상황입니다.",
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
    },

    generateConversationFeedback: async (history) => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Mock feedback
        return [
            {
                original: "I am boring.",
                correction: "I am bored.",
                reason: "'Boring'은 지루하게 만드는 사람을 의미하고, 감정을 느낄 때는 'bored'를 씁니다.",
                pronunciationTip: "Pay attention to the 'd' ending in 'bored' vs 'boredom'."
            },
            {
                original: "I go to home.",
                correction: "I go home.",
                reason: "'Home'은 부사로 사용될 때 전치사 'to'를 사용하지 않습니다.",
                pronunciationTip: null
            },
            {
                original: "She don't like it.",
                correction: "She doesn't like it.",
                reason: "3인칭 단수 주어 뒤에는 'doesn't'를 사용해야 합니다."
            }
        ];
    }
};
