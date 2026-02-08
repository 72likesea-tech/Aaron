import { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import SettingsScreen from './components/SettingsScreen';
import TopicSelector from './components/TopicSelector';
import SessionManager from './components/Session/SessionManager';
import ErrorBanner from './components/UI/ErrorBanner';
import AlarmManager from './components/AlarmManager';

function AppContent() {
    const { settings } = useUser();
    const [screen, setScreen] = useState('settings'); // settings, topics, session
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const root = document.documentElement;
        if (settings.themeMode === 'dark') {
            root.style.setProperty('--bg-secondary', '#1a1a1a');
            root.style.setProperty('--bg-main', '#1a1a1a');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--text-secondary', '#a0a0b0');
            root.style.setProperty('--bg-card', '#262626');
        } else if (settings.themeMode === 'light') {
            root.style.setProperty('--bg-secondary', '#ffffff');
            root.style.setProperty('--bg-main', '#ffffff');
            root.style.setProperty('--text-primary', '#1a1a1a');
            root.style.setProperty('--text-secondary', '#64748b');
            root.style.setProperty('--bg-card', '#f8fafc');
        } else if (settings.themeMode === 'custom') {
            root.style.setProperty('--bg-secondary', settings.customBgColor);
            root.style.setProperty('--bg-main', settings.customBgColor);
            root.style.setProperty('--text-primary', settings.customTextColor);
            root.style.setProperty('--text-secondary', settings.customTextColor + 'aa'); // semi-transparent
            root.style.setProperty('--bg-card', 'rgba(0,0,0,0.05)');
        }
    }, [settings.themeMode, settings.customBgColor, settings.customTextColor]);

    const handleError = (msg) => {
        setError(msg);
    };

    const handleStart = () => {
        setScreen('topics');
    };

    const handleTopicSelect = (topic) => {
        setSelectedTopic(topic);
        setScreen('session');
    };

    const handleExitSession = () => {
        setScreen('topics');
        setSelectedTopic(null);
    };

    return (
        <>
            {screen === 'settings' && <SettingsScreen onStart={handleStart} onError={handleError} />}
            {screen === 'topics' && (
                <TopicSelector
                    onSelect={handleTopicSelect}
                    onError={handleError}
                />
            )}
            {screen === 'session' && (
                <SessionManager
                    topic={selectedTopic}
                    onExit={handleExitSession}
                    onError={handleError}
                />
            )}
            <ErrorBanner message={error} onClose={() => setError(null)} />
        </>
    );
}

function App() {
    return (
        <UserProvider>
            <AlarmManager />
            <AppContent />
        </UserProvider>
    );
}

export default App;
