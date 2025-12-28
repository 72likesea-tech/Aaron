import { useState } from 'react';
import { UserProvider } from './context/UserContext';
import SettingsScreen from './components/SettingsScreen';
import TopicSelector from './components/TopicSelector';
import SessionManager from './components/Session/SessionManager';
import InterpretationView from './components/InterpretationView';
import ErrorBanner from './components/UI/ErrorBanner';
import AlarmManager from './components/AlarmManager';

function AppContent() {
    const [screen, setScreen] = useState('settings'); // settings, topics, session
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [error, setError] = useState(null);

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
                    onInterpretationClick={() => setScreen('interpretation')}
                />
            )}
            {screen === 'session' && (
                <SessionManager
                    topic={selectedTopic}
                    onExit={handleExitSession}
                    onError={handleError}
                />
            )}
            {screen === 'interpretation' && (
                <InterpretationView onExit={() => setScreen('topics')} />
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
