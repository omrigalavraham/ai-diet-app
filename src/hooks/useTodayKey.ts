import { useState, useEffect } from 'react';

const jsDayToKey: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
};

function getCurrentDayKey(): string {
    return jsDayToKey[new Date().getDay()];
}

function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * Returns the current day key (e.g. 'sunday', 'monday') and today's ISO date string.
 * Automatically updates when:
 * - The user returns to the tab after it was hidden (visibilitychange)
 * - Midnight is crossed (timer-based)
 */
export function useTodayKey() {
    const [todayKey, setTodayKey] = useState(getCurrentDayKey);
    const [todayDate, setTodayDate] = useState(getTodayDateString);

    useEffect(() => {
        const refresh = () => {
            const newKey = getCurrentDayKey();
            const newDate = getTodayDateString();
            setTodayKey(prev => prev !== newKey ? newKey : prev);
            setTodayDate(prev => prev !== newDate ? newDate : prev);
        };

        // Re-check when the user comes back to the tab
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                refresh();
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        // Set a timer for the next midnight so the day rolls over automatically
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow.getTime() - now.getTime() + 500; // +500ms buffer

        const midnightTimer = setTimeout(() => {
            refresh();
        }, msUntilMidnight);

        // Also check every 60 seconds as a safety net (cheap operation)
        const interval = setInterval(refresh, 60_000);

        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
            clearTimeout(midnightTimer);
            clearInterval(interval);
        };
    }, []);

    return { todayKey, todayDate };
}
