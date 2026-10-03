import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

const SRC = "/audio/alla.mp3";
const VOLUME = 0.45;
const STORAGE_KEY = "alvasti_muted";

interface MusicCtx { playing: boolean; muted: boolean; toggle: () => void; start: () => void; duck: (on: boolean) => void }
const MusicContext = createContext<MusicCtx>({ playing: false, muted: false, toggle: () => { }, start: () => { }, duck: () => { } });

const savedMuted = () => { try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; } };

/** Плавно меняет громкость за `ms` миллисекунд; новый fade отменяет предыдущий. */
const fadeIds = new WeakMap<HTMLAudioElement, number>();
function fade(audio: HTMLAudioElement, to: number, ms: number, done?: () => void) {
    const id = (fadeIds.get(audio) ?? 0) + 1;
    fadeIds.set(audio, id);
    const from = audio.volume, start = performance.now();
    const step = (now: number) => {
        if (fadeIds.get(audio) !== id) return;
        const k = Math.min(1, (now - start) / ms);
        audio.volume = Math.min(1, Math.max(0, from + (to - from) * k));
        if (k < 1) requestAnimationFrame(step); else done?.();
    };
    requestAnimationFrame(step);
}

/**
 * Фоновая музыка сайта («Alla»). Пытается стартовать сразу при загрузке;
 * браузеры обычно блокируют звук до первого действия пользователя — тогда
 * музыка запускается на первый клик / тап / клавишу. Выбор «без звука»
 * запоминается, на скрытой вкладке музыка ставится на паузу.
 */
export function MusicProvider({ children }: { children: ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [muted, setMuted] = useState(savedMuted);
    const [playing, setPlaying] = useState(false);
    const mutedRef = useRef(muted);
    mutedRef.current = muted;

    const play = useCallback(() => {
        const a = audioRef.current;
        if (!a || mutedRef.current) return Promise.resolve(false);
        a.volume = 0;
        return a.play().then(() => { fade(a, VOLUME, 2500); return true; }, () => false);
    }, []);

    useEffect(() => {
        const a = new Audio(SRC);
        a.loop = true;
        a.preload = "auto";
        audioRef.current = a;
        const onPlay = () => setPlaying(true), onPause = () => setPlaying(false);
        a.addEventListener("play", onPlay);
        a.addEventListener("pause", onPause);

        // Автозапуск заблокирован → ждём первого жеста пользователя.
        const events = ["pointerdown", "keydown", "touchstart"] as const;
        const unlock = (e: Event) => {
            // Клик по самой кнопке звука обрабатывает toggle — не дублируем.
            if ((e.target as Element | null)?.closest?.("[data-sound-toggle]")) return;
            play().then((ok) => { if (ok) events.forEach((ev) => window.removeEventListener(ev, unlock)); });
        };
        play().then((ok) => { if (!ok) events.forEach((e) => window.addEventListener(e, unlock)); });

        const onVisibility = () => {
            if (document.hidden) a.pause();
            else if (!mutedRef.current && a.currentTime > 0) a.play().catch(() => { });
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            events.forEach((e) => window.removeEventListener(e, unlock));
            document.removeEventListener("visibilitychange", onVisibility);
            a.removeEventListener("play", onPlay);
            a.removeEventListener("pause", onPause);
            a.pause();
            audioRef.current = null;
        };
    }, [play]);

    const toggle = () => {
        const a = audioRef.current;
        if (!a) return;
        // Опираемся на реальное состояние плеера, а не на флаг: если автозапуск
        // был заблокирован, клик по кнопке должен включить звук, а не выключить.
        const next = !a.paused;
        setMuted(next);
        mutedRef.current = next;
        try { localStorage.setItem(STORAGE_KEY, next ? "1" : "0"); } catch { /* */ }
        if (next) fade(a, 0, 600, () => a.pause());
        else play();
    };

    /** Явный старт (заставка «Войти»): включает звук, даже если раньше выключали. */
    const start = () => {
        const a = audioRef.current;
        if (!a || !a.paused) return;
        setMuted(false);
        mutedRef.current = false;
        try { localStorage.setItem(STORAGE_KEY, "0"); } catch { /* */ }
        play();
    };

    /** Приглушить музыку на время скримера и вернуть обратно. */
    const duck = (on: boolean) => {
        const a = audioRef.current;
        if (!a || a.paused) return;
        fade(a, on ? VOLUME * 0.15 : VOLUME, on ? 900 : 2000);
    };

    return <MusicContext.Provider value={{ playing, muted, toggle, start, duck }}>{children}</MusicContext.Provider>;
}

export const useMusic = () => useContext(MusicContext);
