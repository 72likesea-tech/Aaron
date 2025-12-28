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
            speed: 'Normal',
            showTranslation: false,
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
