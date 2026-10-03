import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getLenis, ScrollTrigger } from "@/lib/motion";

/** Сбрасывает скролл наверх при смене маршрута и пересчитывает ScrollTrigger. */
export function ScrollToTop() {
    const { pathname, hash } = useLocation();
    useEffect(() => {
        if (hash) return;
        const l = getLenis();
        if (l) l.scrollTo(0, { immediate: true, force: true });
        else window.scrollTo(0, 0);
        requestAnimationFrame(() => ScrollTrigger.refresh());
    }, [pathname, hash]);
    return null;
}
