import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/** Тонкая полоса сверху на каждой смене маршрута — чисто визуальная. */
export function TopProgressBar() {
    const location = useLocation();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

    useEffect(() => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        setVisible(true);
        setProgress(0);

        const raf = requestAnimationFrame(() => setProgress(30));
        timers.current.push(setTimeout(() => setProgress(65), 120));
        timers.current.push(setTimeout(() => setProgress(90), 320));
        timers.current.push(setTimeout(() => setProgress(100), 480));
        timers.current.push(setTimeout(() => setVisible(false), 700));

        return () => {
            cancelAnimationFrame(raf);
            timers.current.forEach(clearTimeout);
        };
    }, [location.pathname]);

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2.5px] transition-opacity duration-300"
            style={{ opacity: visible ? 1 : 0 }}
        >
            <div
                className="h-full bg-gradient-to-r from-blood-dark via-blood-light to-ember shadow-[0_0_10px_rgba(224,72,60,0.7)]"
                style={{ width: `${progress}%`, transition: "width .35s cubic-bezier(.16,1,.3,1)" }}
            />
        </div>
    );
}
