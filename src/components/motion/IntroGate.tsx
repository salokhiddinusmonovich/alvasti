import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, lockScroll } from "@/lib/motion";
import { LANGS, useLang } from "@/i18n/LanguageContext";
import { useMusic } from "@/components/audio/MusicContext";

// кинематографичная заставка грузится отдельным чанком
const LanternIntro = lazy(() => import("./LanternIntro").then((m) => ({ default: m.LanternIntro })));

const KEY = "alvasti_entered";
const seen = () => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } };

/**
 * Заставка на входе: кинематографичная сцена «фонарь» (LanternIntro) на весь
 * экран, управление — в чёрных кинополосах: язык сверху, «наденьте наушники»
 * и «Войти» снизу. Войти можно в любой момент, не дожидаясь конца сцены.
 * Клик — это жест пользователя, поэтому музыка гарантированно стартует.
 * Показывается один раз за сессию браузера.
 */
export function IntroGate() {
    const { t, lang, setLang } = useLang();
    const { start } = useMusic();
    const [open, setOpen] = useState(() => !seen());
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        lockScroll(true);
        return () => lockScroll(false);
    }, [open]);

    useGSAP(() => {
        if (!open) return;
        // управление проявляется в полосах, когда они уже выехали
        gsap.from(".gate-ui", { opacity: 0, duration: 1.2, stagger: 0.2, delay: 1.6, ease: "power2.out" });
    }, { scope: root, dependencies: [open] });

    const enter = () => {
        start();
        try { sessionStorage.setItem(KEY, "1"); } catch { /* */ }
        gsap.timeline({ onComplete: () => setOpen(false) })
            .to(".gate-content", { opacity: 0, scale: 1.15, filter: "blur(10px)", duration: 0.7, ease: "power2.in" })
            .to(".gate-left", { xPercent: -100, duration: 1.1, ease: "power4.inOut" }, "-=0.15")
            .to(".gate-right", { xPercent: 100, duration: 1.1, ease: "power4.inOut" }, "<");
    };

    if (!open) return null;

    return (
        <div ref={root} className="fixed inset-0 z-[2000]" role="dialog" aria-modal="true" aria-label="Alvasti">
            <div className="gate-left absolute inset-y-0 left-0 w-1/2 bg-[#070506]" />
            <div className="gate-right absolute inset-y-0 right-0 w-1/2 bg-[#070506]" />
            {/* шов между половинками — красные стежки */}
            <div className="gate-content absolute inset-0">
                <Suspense fallback={<div className="h-full w-full bg-[#050304]" />}>
                    <LanternIntro tagline={t.hero.tagline} />
                </Suspense>

                {/* верхняя полоса: язык */}
                <div className="gate-ui absolute inset-x-0 top-0 flex h-[9vh] items-center justify-end gap-1 px-4 font-mono text-[10px] tracking-widest sm:px-8">
                    {LANGS.map((l) => (
                        <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`px-2 py-1 ${lang === l.code ? "text-blood-light" : "text-bone/35 hover:text-bone"}`}>
                            {l.label}
                        </button>
                    ))}
                </div>

                {/* нижняя полоса: наушники и вход */}
                <div className="absolute inset-x-0 bottom-0 flex h-[9vh] items-center justify-between gap-4 px-4 sm:px-8">
                    <p className="gate-ui flex items-center font-hand text-xl text-bone/70 sm:text-2xl">
                        <HeadphonesIcon /> <span className="hidden sm:inline">{t.intro.headphones}</span>
                        <span className="ml-3 hidden font-mono text-[9px] uppercase tracking-[0.3em] text-bone/30 md:inline">{t.intro.note}</span>
                    </p>
                    <button
                        type="button"
                        onClick={enter}
                        className="gate-ui gate-btn group flex items-center gap-3 font-display text-xl tracking-[0.35em] text-bone transition-colors hover:text-blood-light sm:text-2xl"
                    >
                        {t.intro.enter}
                        <span className="inline-block h-px w-10 bg-blood-light transition-all duration-500 group-hover:w-16" />
                    </button>
                </div>
            </div>
        </div>
    );
}

const HeadphonesIcon = () => (
    <svg className="mr-1 inline-block -translate-y-0.5" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4" height="7" rx="1.5" /><rect x="17" y="14" width="4" height="7" rx="1.5" />
    </svg>
);
