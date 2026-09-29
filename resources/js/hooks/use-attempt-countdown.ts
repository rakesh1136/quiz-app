import { useEffect, useRef, useState } from 'react';

type Options = {
    remainingSeconds: number;
    onExpire: () => void;
};

/**
 * Counts down from the server-provided remaining time. The deadline is pinned
 * to a wall-clock timestamp so throttled tabs stay accurate, and the server
 * remains the source of truth on every page load.
 */
export function useAttemptCountdown({
    remainingSeconds,
    onExpire,
}: Options): number {
    const [remaining, setRemaining] = useState(Math.max(0, remainingSeconds));
    const expiredRef = useRef(false);
    const onExpireRef = useRef(onExpire);

    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    useEffect(() => {
        const deadline = Date.now() + Math.max(0, remainingSeconds) * 1000;

        const tick = () => {
            const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

            setRemaining(next);

            if (next <= 0 && !expiredRef.current) {
                expiredRef.current = true;
                onExpireRef.current();
            }
        };

        tick();

        const interval = window.setInterval(tick, 1000);

        return () => window.clearInterval(interval);
    }, [remainingSeconds]);

    return remaining;
}
