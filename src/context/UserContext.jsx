import { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('userSettings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            learningTime: 30, // minutes
            alarmTime: '09:00',
            level: 'Intermediate',
            speed: 100, // percentage
            showTranslation: false,
            voice: 'shimmer', // Default to 'shimmer' (Sol-like)
            themeMode: 'light', // 'light' or 'dark'
            customBgColor: '#ffffff',
            customTextColor: '#1a1a1a',
            fontScales: {
                TopicSelector: 1.0,
                MissionView: 1.0,
                LearningView: 1.0,
                ShadowingView: 1.0,
                FreeTalkView: 1.0,
                FeedbackView: 1.0,
                SettingsScreen: 1.0
            }
        };
    });

    const updateSettings = (key, value) => {
        setSettings(prev => {
            const newSettings = { ...prev, [key]: value };
            localStorage.setItem('userSettings', JSON.stringify(newSettings));
            return newSettings;
        });
    };

    return (
        <UserContext.Provider value={{ settings, updateSettings }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
