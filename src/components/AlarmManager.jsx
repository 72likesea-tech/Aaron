import { useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';

export default function AlarmManager() {
    const { settings } = useUser();
    const lastTriggeredRef = useRef(null); // Keep track of the last triggered date (YYYY-MM-DD-HH-MM)

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Check time every minute
    useEffect(() => {
        const checkTime = () => {
            if (!settings.alarmTime) return;

            const now = new Date();
            const currentHours = now.getHours().toString().padStart(2, '0');
            const currentMinutes = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${currentHours}:${currentMinutes}`;

            // Create a unique key for "today's alarm" to prevent multiple triggers in the same minute
            const triggerKey = `${now.toDateString()}-${currentTimeStr}`;

            if (currentTimeStr === settings.alarmTime && lastTriggeredRef.current !== triggerKey) {
                lastTriggeredRef.current = triggerKey;
                triggerAlarm();
            }
        };

        const timerId = setInterval(checkTime, 10000); // Check every 10 seconds to be safe
        checkTime(); // Check immediately

        return () => clearInterval(timerId);
    }, [settings.alarmTime]);

    const triggerAlarm = () => {
        if (!('Notification' in window)) {
            alert("This browser does not support desktop notification");
            return;
        }

        if (Notification.permission === 'granted') {
            new Notification("Time to study English!", {
                body: "It's time for your daily English session.",
                icon: "/icon.png" // Assuming an icon exists, or it will just be default
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification("Time to study English!", {
                        body: "It's time for your daily English session."
                    });
                }
            });
        }
    };

    return null; // Logic-only component
}
