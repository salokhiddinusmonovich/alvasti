import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { sting, thump, whisper } from "@/lib/sfx";
import { useLang } from "@/i18n/LanguageContext";
import { useMusic } from "@/components/audio/MusicContext";

/** Сколько всего сцен; за визит проигрываются все, каждая — один раз. */
const SCARES = 3;
const SESSION_KEY = "alvasti_scares_played"; // sessionStorage: сколько сцен уже было в этом визите
/** Где срабатывает сцена: доля прокрутки главной (первая — после ~1 экрана). */
const AT = [0, 0.42, 0.78];
/** Пауза после достижения точки, мс. */
const DELAY_MS = [4500, 2500, 2000];
/** Минимум между концом одной сцены и началом следующей, мс. */
const GAP_MS = 15000;

const read = (st: Storage, k: string) => { try { return st.getItem(k); } catch { return null; } };
const write = (st: Storage, k: string, v: string) => { try { st.setItem(k, v); } catch { /* */ } };

/** Разбивает строку на буквы-span'ы, чтобы «писать» её по одной букве. */
const Letters = ({ text, className }: { text: string; className: string }) => (
    <span className={className} aria-label={text}>
        {[...text].map((ch, i) => <span key={i} aria-hidden="true" className="s-ch inline-block whitespace-pre">{ch}</span>)}
    </span>
);

/**
 * Скримеры. За один визит на главной разыгрываются все три сцены по
 * очереди: после первого экрана прокрутки, около середины страницы и ближе
 * к концу — с паузой не меньше GAP_MS между ними, чтобы не шли подряд.
 * В новом визите (новая сессия браузера) всё повторяется.
 *
 * Для просмотра одной сцены: добавьте к адресу ?scare=0, ?scare=1 или ?scare=2.
 */
export function ScareDirector() {
    const { t } = useLang();
    const { playing, duck } = useMusic();
    const { pathname } = useLocation();
    const [active, setActive] = useState<number | null>(null);
    const root = useRef<HTMLDivElement>(null);
    const sound = useRef(playing);
    sound.current = playing;
    /** Вызывается по окончании сцены — запоминает время и проверяет, не пора ли следующая. */
    const onSceneEnd = useRef<() => void>(() => { });

    useEffect(() => {
        if (prefersReducedMotion() || pathname !== "/") return;
        const forced = new URLSearchParams(window.location.search).get("scare");
        let played = forced !== null ? 0 : Number(read(sessionStorage, SESSION_KEY) ?? 0);
        const queue = forced !== null ? [Number(forced) % SCARES] : [0, 1, 2];
        let timer = 0, pending = false, running = false, lastEnd = 0;

        const blocked = () => document.documentElement.style.overflow === "hidden" || document.body.style.overflow === "hidden";
        const fire = () => {
            // не мешаем заставке, лайтбоксу и мобильному меню
            if (blocked()) { timer = window.setTimeout(fire, 1500); return; }
            const scene = queue[played];
            played += 1;
            if (forced === null) write(sessionStorage, SESSION_KEY, String(played));
            pending = false;
            running = true;
            setActive(scene);
        };
        const check = () => {
            if (pending || running || played >= queue.length) return;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const reached = forced !== null || played === 0
                ? window.scrollY > window.innerHeight * 0.9
                : max > 0 && window.scrollY / max >= AT[queue[played]];
            if (!reached) return;
            pending = true;
            const wait = forced !== null ? 800 : Math.max(DELAY_MS[queue[played]], lastEnd + GAP_MS - Date.now());
            timer = window.setTimeout(fire, wait);
        };
        onSceneEnd.current = () => { running = false; lastEnd = Date.now(); check(); };

        window.addEventListener("scroll", check, { passive: true });
        check();
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener("scroll", check);
            onSceneEnd.current = () => { };
        };
    }, [pathname]);

    useGSAP(() => {
        if (active === null) return;
        const sfx = (fn: () => void) => () => { if (sound.current) fn(); };
        const done = () => { duck(false); setActive(null); onSceneEnd.current(); };
        gsap.set(".s-center", { xPercent: -50, yPercent: -50, scale: 0.9 });
        const tl = gsap.timeline({ onComplete: done });
        tl.call(() => duck(true));

        if (active === 0) {
            // ── 1. Из угла: «я тебя вижу» → прыжок в лицо
            gsap.set(".s-mask", { xPercent: 100, yPercent: 35, rotate: -38 });
            gsap.set(".s-ch", { opacity: 0 });
            tl.to(".s-vig", { opacity: 1, duration: 1.6 })
                .call(sfx(() => whisper(2.2)), [], "<0.6")
                .to(".s-mask", { xPercent: 30, yPercent: 6, rotate: -14, duration: 2.8, ease: "power2.out" }, "<")
                .to(".s-mask", { rotate: -4, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 1 })
                .to(".s-ch", { opacity: 1, duration: 0.05, stagger: 0.07 }, "<")
                .to({}, { duration: 1.1 })
                .call(sfx(sting))
                .set(".s-mask, .s-text", { opacity: 0 })
                .fromTo(".s-face", { opacity: 1, scale: 0.5 }, { scale: 1.7, duration: 0.16, ease: "power4.in", immediateRender: false }, "<")
                .fromTo(".s-flash", { opacity: 0.7 }, { opacity: 0, duration: 0.5, immediateRender: false }, "<0.1")
                .fromTo(".s-root", { x: -14 }, { x: 0, duration: 0.4, ease: "elastic.out(3, 0.2)", immediateRender: false }, "<")
                .to(".s-face", { scale: 1.85, duration: 0.45, ease: "none" })
                .to(".s-face", { opacity: 0, duration: 0.15 })
                .to(".s-vig", { opacity: 0, duration: 1 });
        }

        if (active === 1) {
            // ── 2. С потолка: нити и перевёрнутая маска «не оборачивайся»
            gsap.set(".s-thread", { scaleY: 0, transformOrigin: "50% 0%" });
            gsap.set(".s-hang", { yPercent: -120, rotate: 180 });
            gsap.set(".s-ch", { opacity: 0 });
            tl.to(".s-vig", { opacity: 1, duration: 1.2 })
                .to(".s-thread", { scaleY: 1, duration: 1.4, stagger: { each: 0.08, from: "random" }, ease: "power2.out" }, "<0.2")
                .to(".s-hang", { yPercent: -18, duration: 2.6, ease: "power1.out" }, "<0.6")
                .call(sfx(() => whisper(1.8)), [], "<1.2")
                .to(".s-hang", { rotate: 172, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 2 }, "<")
                .to(".s-ch", { opacity: 1, duration: 0.05, stagger: 0.08 }, "<0.4")
                .to({}, { duration: 0.8 })
                .call(sfx(sting))
                .to(".s-hang", { scale: 1.35, duration: 0.1, ease: "power3.in" })
                .fromTo(".s-flash", { opacity: 0.5 }, { opacity: 0, duration: 0.4, immediateRender: false }, "<")
                .to(".s-hang", { yPercent: -160, duration: 0.25, ease: "power4.in" })
                .to(".s-thread", { scaleY: 0, duration: 0.3, ease: "power4.in" }, "<")
                .to(".s-text", { opacity: 0, duration: 0.2 }, "<")
                .to(".s-vig", { opacity: 0, duration: 1 });
        }

        if (active === 2) {
            // ── 3. Свет гаснет: «тебя позвали дважды… не отвечай»
            gsap.set(".s-l1, .s-l2, .s-ghost", { opacity: 0 });
            tl.to(".s-black", { opacity: 0.85, duration: 0.05 })
                .to(".s-black", { opacity: 0, duration: 0.08 })
                .to(".s-black", { opacity: 0.95, duration: 0.05, delay: 0.15 })
                .to(".s-black", { opacity: 0.2, duration: 0.1 })
                .to(".s-black", { opacity: 1, duration: 0.06, delay: 0.25 })
                .call(sfx(thump))
                .to(".s-l1", { opacity: 1, y: 0, duration: 1.4, ease: "power2.out" }, "+=0.6")
                .to(".s-ghost", { opacity: 0.22, scale: 1, duration: 3, ease: "power1.inOut" }, "<0.5")
                .call(sfx(() => whisper(1.6)), [], "<0.8")
                .to(".s-l2", { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(3)" }, "+=0.4")
                .to({}, { duration: 1.6 })
                .to(".s-l1, .s-l2, .s-ghost", { opacity: 0, duration: 0.3 })
                .to(".s-black", { opacity: 0.3, duration: 0.06 })
                .to(".s-black", { opacity: 0.9, duration: 0.06, delay: 0.1 })
                .to(".s-black", { opacity: 0, duration: 0.6 });
        }
    }, { scope: root, dependencies: [active] });

    if (active === null) return null;

    const maskImg = "/brand/mask.webp";
    const fade = "[mask-image:linear-gradient(to_bottom,black_60%,transparent_92%)]";

    return (
        <div ref={root} aria-hidden="true" className="s-root pointer-events-none fixed inset-0 z-[1500] overflow-hidden">
            <div className="s-vig absolute inset-0 opacity-0" style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(5,3,4,.92) 80%)" }} />
            <div className="s-flash absolute inset-0 bg-blood opacity-0 mix-blend-screen" />

            {active === 0 && (
                <>
                    <img src={maskImg} alt="" className={`s-mask absolute bottom-0 right-0 w-[min(52vw,400px)] ${fade}`} />
                    <Letters text={t.scares.peek} className="s-text absolute bottom-[38%] right-[min(46vw,360px)] rotate-[-6deg] font-hand text-4xl text-blood-light drop-shadow-[0_2px_10px_rgba(0,0,0,.9)] sm:text-6xl" />
                    <img src={maskImg} alt="" className={`s-face s-center absolute left-1/2 top-1/2 w-[min(80vw,620px)] opacity-0 ${fade}`} />
                </>
            )}

            {active === 1 && (
                <>
                    {Array.from({ length: 11 }, (_, i) => {
                        const x = 6 + i * 8.8 + (i % 3) * 1.5, len = 35 + ((i * 37) % 40);
                        return (
                            <svg key={i} className="s-thread absolute top-0 h-[80vh] w-6" style={{ left: `${x}%` }} viewBox="0 0 24 800" preserveAspectRatio="none">
                                <path d={`M12 0 C ${4 + (i % 4) * 4} ${len * 3}, ${20 - (i % 3) * 5} ${len * 6}, 12 ${len * 8}`} fill="none" stroke="#b3261e" strokeWidth="2" />
                                <circle cx="12" cy={len * 8} r="5" fill="#8e1a14" />
                            </svg>
                        );
                    })}
                    <img src={maskImg} alt="" className={`s-hang absolute left-1/2 top-0 -ml-[min(20vw,160px)] w-[min(40vw,320px)] ${fade}`} />
                    <Letters text={t.scares.ceiling} className="s-text absolute left-1/2 top-[58%] -translate-x-1/2 whitespace-nowrap font-hand text-5xl text-blood-light drop-shadow-[0_2px_10px_rgba(0,0,0,.9)] sm:text-7xl" />
                </>
            )}

            {active === 2 && (
                <>
                    <div className="s-black absolute inset-0 bg-[#030202] opacity-0" />
                    <img src={maskImg} alt="" className={`s-ghost s-center absolute left-1/2 top-1/2 w-[min(70vw,520px)] opacity-0 blur-[1px] ${fade}`} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                        <p className="s-l1 translate-y-4 font-serif text-3xl italic text-bone/85 opacity-0 sm:text-5xl">{t.scares.blackout1}</p>
                        <p className="s-l2 mt-6 scale-75 font-hand text-6xl text-blood-light opacity-0 sm:text-8xl">{t.scares.blackout2}</p>
                    </div>
                </>
            )}
        </div>
    );
}
