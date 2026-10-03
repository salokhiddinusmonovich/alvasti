import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis: Lenis | null = null;
/** Текущий экземпляр плавной прокрутки (null — если отключена). */
export const getLenis = () => lenis;

/** Запрос на остановку прокрутки (например, пока открыта заставка). */
let lockCount = 0;
export function lockScroll(on: boolean) {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    const locked = lockCount > 0;
    document.documentElement.style.overflow = locked ? "hidden" : "";
    if (locked) lenis?.stop(); else lenis?.start();
}

/**
 * Плавная прокрутка Lenis, синхронизированная с GSAP ScrollTrigger.
 * Вызывается один раз в App. Для prefers-reduced-motion — обычный скролл.
 */
export function useSmoothScroll() {
    useEffect(() => {
        if (prefersReducedMotion()) return;
        const l = new Lenis({ lerp: 0.085, anchors: { offset: -64 } });
        lenis = l;
        if (lockCount > 0) l.stop();
        l.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => l.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        // картинки догружаются → высоты меняются → пересчитать триггеры
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        return () => {
            window.removeEventListener("load", refresh);
            gsap.ticker.remove(tick);
            l.destroy();
            lenis = null;
        };
    }, []);
}
