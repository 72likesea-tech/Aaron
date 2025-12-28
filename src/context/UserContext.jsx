import { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [settings, setSettings] = useState({
        learningTime: 30, // minutes
        alarmTime: '09:00',
        level: 'Intermediate',
        speed: 'Normal',
        showTranslation: false,
    });

    const updateSettings = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <UserContext.Provider value={{ settings, updateSettings }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
