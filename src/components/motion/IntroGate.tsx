import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, lockScroll } from "@/lib/motion";
import { LANGS, useLang } from "@/i18n/LanguageContext";
import { useMusic } from "@/components/audio/MusicContext";

const KEY = "alvasti_entered";
const seen = () => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } };

/**
 * Заставка на входе: маска в темноте, «наденьте наушники», кнопка «Войти».
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
        gsap.timeline()
            .from(".gate-mask", { opacity: 0, scale: 0.85, filter: "blur(18px)", duration: 2.2, ease: "power2.out" })
            .from(".gate-line", { opacity: 0, y: 14, stagger: 0.18, duration: 0.9, ease: "power2.out" }, "-=1.1")
            .from(".gate-btn", { opacity: 0, scale: 0.9, duration: 0.8, ease: "back.out(2)" }, "-=0.4");
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
            <div className="gate-content absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <div className="absolute right-4 top-4 flex gap-1 font-mono text-[10px] tracking-widest">
                    {LANGS.map((l) => (
                        <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`px-2 py-1 ${lang === l.code ? "text-blood-light" : "text-bone/35 hover:text-bone"}`}>
                            {l.label}
                        </button>
                    ))}
                </div>
                <img src="/brand/mask.webp" alt="" className="gate-mask w-56 [animation:av-sway_7s_ease-in-out_infinite] [mask-image:linear-gradient(to_bottom,black_60%,transparent_92%)] sm:w-72" />
                <p className="gate-line mt-2 font-hand text-3xl text-bone/85">
                    <HeadphonesIcon /> {t.intro.headphones}
                </p>
                <p className="gate-line mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-bone/35">{t.intro.note}</p>
                <button
                    type="button"
                    onClick={enter}
                    className="gate-btn group relative mt-10 px-12 py-4 font-display text-2xl tracking-[0.3em] text-bone transition-colors hover:text-blood-light"
                >
                    <span className="absolute inset-0 border border-dashed border-blood/70 transition-transform duration-500 group-hover:scale-105" />
                    {t.intro.enter}
                </button>
            </div>
        </div>
    );
}

const HeadphonesIcon = () => (
    <svg className="mr-1 inline-block -translate-y-0.5" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4" height="7" rx="1.5" /><rect x="17" y="14" width="4" height="7" rx="1.5" />
    </svg>
);
