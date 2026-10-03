import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { SITE } from "@/config/site";
import { IMAGES, srcSetOf } from "@/config/media";
import { useLang } from "@/i18n/LanguageContext";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import { ButtonAnchor } from "@/components/ui/Button";
import { PlayIcon, SteamIcon } from "@/components/ui/Icons";
import { LightDust, type LanternLight, type StaticLight } from "@/components/motion/LightDust";

/** Свет на самой картинке с дверью (доли кадра 1376×768): проём, луч, пятно на полу. */
const DOOR_LIGHTS: StaticLight[] = [
    { x: 0.76, y: 0.36, r: 0.3, strength: 0.55 },
    { x: 0.6, y: 0.62, r: 0.2, strength: 0.32 },
    { x: 0.66, y: 0.86, r: 0.22, strength: 0.38 },
    { x: 0.295, y: 0.83, r: 0.17, strength: 0.5 }, // фонарь мальчика
];
const DOOR_IMAGE = { w: 1376, h: 768, posX: 0.5, posXMobile: 0.72 };

/**
 * Первый экран: сцена почти в полной темноте, видно только то, что под
 * «фонарём». Фонарь идёт за курсором (на тач-экранах бродит сам и
 * следует за пальцем), свет дрожит как живое пламя.
 */
export function Hero() {
    const { t } = useLang();
    const root = useRef<HTMLElement>(null);
    const [moved, setMoved] = useState(false);
    const light = useRef<LanternLight>({ x: 0, y: 0, r: 300 });

    useEffect(() => {
        const el = root.current!;
        const reduce = prefersReducedMotion();
        let auto = window.matchMedia("(pointer: coarse)").matches;
        let w = el.clientWidth, h = el.clientHeight;
        let x = w * 0.3, y = h * 0.8, tx = x, ty = y, raf = 0, visible = true, idleSince = performance.now();
        const t0 = performance.now();

        const set = (r: number) => {
            light.current = { x, y, r };
            el.style.setProperty("--lx", `${x}px`);
            el.style.setProperty("--ly", `${y}px`);
            el.style.setProperty("--lr", `${r}px`);
        };
        const onMove = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            tx = e.clientX - rect.left; ty = e.clientY - rect.top;
            idleSince = performance.now();
            if (e.pointerType === "mouse") auto = false;
            setMoved(true);
        };
        const loop = (now: number) => {
            const s = (now - t0) / 1000;
            // нет движения 4 с — фонарь начинает сам медленно бродить
            const wander = auto || now - idleSince > 4000;
            if (wander) { tx = w * (0.5 + 0.25 * Math.sin(s * 0.31)); ty = h * (0.62 + 0.18 * Math.sin(s * 0.47 + 1)); }
            x += (tx - x) * (wander ? 0.02 : 0.09);
            y += (ty - y) * (wander ? 0.02 : 0.09);
            const base = Math.min(w, h) * 0.34 + 90;
            set(base * (1 + 0.035 * Math.sin(s * 8.3) + 0.025 * Math.sin(s * 21.7) + 0.02 * Math.sin(s * 3.1)));
            if (visible) raf = requestAnimationFrame(loop);
        };
        const onResize = () => { w = el.clientWidth; h = el.clientHeight; };

        if (reduce) { set(Math.min(w, h) * 0.5); return; }
        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
            cancelAnimationFrame(raf);
            if (visible) raf = requestAnimationFrame(loop);
        });
        io.observe(el);
        window.addEventListener("pointermove", onMove);
        window.addEventListener("resize", onResize);
        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    useGSAP(() => {
        gsap.timeline({ delay: 0.3 })
            .from(".hero-made", { opacity: 0, y: -10, duration: 0.8 })
            .fromTo(".hero-word", { clipPath: "inset(0 100% 0 0)", filter: "blur(6px)" }, { clipPath: "inset(0 0% 0 0)", filter: "blur(0px)", duration: 1.8, ease: "power3.inOut" }, "-=0.4")
            .from(".hero-tag", { opacity: 0, x: -20, rotate: -3, duration: 1, ease: "power2.out" }, "-=0.6")
            .from(".hero-fade", { opacity: 0, y: 24, stagger: 0.15, duration: 0.9, ease: "power2.out" }, "-=0.5");
        // при прокрутке сцена уходит вглубь, текст — вверх
        gsap.to(".hero-scene", { scale: 1.15, yPercent: 8, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        gsap.to(".hero-copy", { yPercent: -30, opacity: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "80% top", scrub: true } });
    }, { scope: root });

    const lit = "radial-gradient(circle var(--lr, 320px) at var(--lx, 30%) var(--ly, 80%), #000 0%, rgba(0,0,0,.92) 30%, rgba(0,0,0,.35) 62%, transparent 100%)";

    return (
        <section ref={root} className="relative z-[2] flex min-h-[100svh] items-end overflow-hidden pb-20 pt-28 md:items-start md:pt-[13vh]">
            <div className="hero-scene absolute inset-0">
                {/* тёмный слой — то, что видно без света */}
                <img src={IMAGES.sceneDoor} srcSet={srcSetOf(IMAGES.sceneDoor)} sizes="100vw" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-[72%_center] brightness-[.2] saturate-[.6] md:object-center" />
                {/* освещённый слой — проступает только под фонарём */}
                <img
                    src={IMAGES.sceneDoor} srcSet={srcSetOf(IMAGES.sceneDoor)} sizes="100vw"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover object-[72%_center] md:object-center"
                    style={{ maskImage: lit, WebkitMaskImage: lit }}
                />
                {/* тёплый отсвет пламени */}
                <div className="absolute inset-0 mix-blend-soft-light" style={{ background: "radial-gradient(circle calc(var(--lr, 320px) * .9) at var(--lx, 30%) var(--ly, 80%), rgba(255,160,70,.45), transparent 70%)" }} />
                {/* пыль в воздухе — видна только в свете фонаря и двери */}
                <LightDust lantern={light} lights={DOOR_LIGHTS} image={DOOR_IMAGE} />
            </div>
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-night/85 via-night/20 to-transparent" />
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-night via-night/80 to-transparent md:h-40 md:via-transparent" />

            <div className="hero-copy av-container relative">
                <p className="hero-made mb-6 inline-flex items-center gap-2 border border-bone/15 bg-night/50 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/70 backdrop-blur-sm">
                    <UzFlag /> {t.madeIn.badge}
                </p>
                <h1 className="-ml-[3%] w-[min(90vw,600px)]">
                    <img src="/brand/wordmark.svg" alt={t.hero.title} className="hero-word w-full drop-shadow-[0_0_30px_rgba(179,38,30,0.35)]" />
                </h1>
                <p className="hero-tag -mt-4 font-hand text-4xl text-blood-light sm:text-5xl">{t.hero.tagline}</p>
                <div className="hero-fade mt-8 flex flex-wrap gap-4">
                    <ButtonAnchor href={SITE.links.steam}><SteamIcon width={16} height={16} /> {t.hero.ctaPrimary}</ButtonAnchor>
                    <ButtonAnchor href="#trailer" variant="ghost"><PlayIcon width={14} height={14} /> {t.hero.ctaSecondary}</ButtonAnchor>
                </div>
                <p className="hero-fade mt-8 inline-flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.25em] text-bone/50">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blood-light shadow-[0_0_10px_rgba(224,72,60,0.9)]" />
                    {t.hero.status}
                </p>
            </div>

            <p
                aria-hidden="true"
                className={`absolute bottom-10 right-8 hidden rotate-[-4deg] font-hand text-2xl text-bone/50 transition-opacity duration-1000 md:block ${moved ? "opacity-0" : "opacity-100"}`}
            >
                ↖ {t.lanternHint}
            </p>
        </section>
    );
}

const UzFlag = () => (
    <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" className="rounded-[1px]">
        <rect width="18" height="4" fill="#1eb5e6" /><rect y="4" width="18" height="4" fill="#fff" /><rect y="8" width="18" height="4" fill="#1eb53a" />
        <rect y="3.7" width="18" height=".6" fill="#ce1126" /><rect y="7.7" width="18" height=".6" fill="#ce1126" />
        <circle cx="3.2" cy="2" r="1.3" fill="#fff" /><circle cx="3.7" cy="2" r="1.1" fill="#1eb5e6" />
    </svg>
);
