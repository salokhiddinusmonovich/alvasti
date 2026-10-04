import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import wordmarkSvg from "@/assets/wordmark.svg?raw";
import { LightDust, type LanternLight } from "./LightDust";

declare global {
    interface Window {
        __alvastiIntro?: gsap.core.Timeline;
        /** Для покадровой записи видео: таймлайн стартует на паузе. */
        __alvastiIntroPaused?: boolean;
    }
}

const FACE = "/brand/face.webp";
const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/** Лицо-маска с тремя нитями и бусинами под подбородком (рисуется дважды: в тени и под светом). */
function Face({ className = "" }: { className?: string }) {
    return (
        <div className={`li-face absolute left-1/2 top-[40%] aspect-[767/965] w-[min(52vmin,520px)] -translate-x-1/2 -translate-y-1/2 ${className}`}>
            <img src={FACE} alt="" draggable={false} className="h-full w-full select-none" />
            <svg className="absolute left-0 top-[93%] h-[56%] w-full overflow-visible" viewBox="0 0 100 70" aria-hidden="true">
                {[[33, 50, -2], [50, 62, 1.5], [67, 44, 2]].map(([x, len, s], i) => (
                    <g key={i} className="li-thread" style={{ transformOrigin: `${x}px 0px` }}>
                        <path d={`M${x} 0 C ${x + s} ${len * 0.35}, ${x - s} ${len * 0.7}, ${x} ${len}`} fill="none" stroke="#a8221b" strokeWidth=".7" />
                        <circle cx={x} cy={len + 1.6} r="1.9" fill="#7a140f" />
                        <circle cx={x - 0.6} cy={len + 1} r=".6" fill="#ff8a7a" opacity=".7" />
                    </g>
                ))}
            </svg>
        </div>
    );
}

/**
 * Кинематографичная заставка «фонарь»: темнота, огонёк, луч фонаря
 * проходит по кадру и вырывает из тьмы её лицо, пыль в луче, наезд камеры;
 * фонарь мигает — и лицо уже ближе; свет уходит, красная нить
 * прошивает название. После — лицо едва дышит во тьме над названием.
 */
export function LanternIntro({ tagline, className = "" }: { tagline?: string; className?: string }) {
    const root = useRef<HTMLDivElement>(null);
    const light = useRef<LanternLight>({ x: 0, y: 0, r: 0 });

    useEffect(() => {
        const el = root.current!;
        const cam = el.querySelector<HTMLElement>(".li-cam")!;
        const word = el.querySelector<SVGSVGElement>(".li-word svg");
        const thread = el.querySelector<SVGPathElement>(".li-title-thread");

        // свет в долях кадра: x, y, радиус (от меньшей стороны) и яркость
        const L = { x: 0.13, y: 0.86, r: 0, b: 1 };
        const apply = () => {
            const W = el.clientWidth, H = el.clientHeight, m = Math.min(W, H);
            const px = L.x * W, py = L.y * H, pr = Math.max(1, L.r * m);
            el.style.setProperty("--lx", `${px}px`);
            el.style.setProperty("--ly", `${py}px`);
            el.style.setProperty("--lr", `${pr}px`);
            el.style.setProperty("--lb", String(L.b));
            light.current = { x: px, y: py, r: pr * L.b };
        };

        const ctx = gsap.context(() => {
            if (word) {
                gsap.set(word, { clipPath: "inset(-20% 100% -20% 0%)", filter: "blur(8px)", opacity: 0.9 });
                gsap.set(word.querySelectorAll("line"), { opacity: 0, scale: 2, transformOrigin: "50% 50%" });
            }
            if (thread) { const len = thread.getTotalLength(); gsap.set(thread, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 }); }
            gsap.set(".li-tag", { opacity: 0, letterSpacing: "0.6em" });
            gsap.set(".li-bar", { scaleY: 0 });
            gsap.set(".li-ember", { opacity: 0, scale: 0.4 });

            if (prefersReducedMotion()) {
                Object.assign(L, { x: 0.5, y: 0.4, r: 0.4, b: 0.6 }); apply();
                if (word) gsap.set(word, { clipPath: "inset(-20% 0% -20% 0%)", filter: "none" });
                gsap.set(".li-tag", { opacity: 1, letterSpacing: "0.35em" });
                return;
            }

            const tl = gsap.timeline({ paused: !!window.__alvastiIntroPaused, onUpdate: apply });
            window.__alvastiIntro = tl;

            // 1. темнота → полосы кино → огонёк фонаря
            tl.to(".li-bar", { scaleY: 1, duration: 1, ease: "power3.inOut" }, 0)
                .to(".li-ember", { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" }, 0.3)
                .addLabel("click", 0.6)
                .to(L, { r: 0.2, duration: 1.1, ease: "power2.out" }, 0.6)

            // 2. луч идёт по кадру и находит лицо; камера медленно наезжает
                .to(L, { x: 0.34, y: 0.6, duration: 1.3, ease: "sine.inOut" }, 1.3)
                .to(L, { x: 0.62, y: 0.33, r: 0.28, duration: 1.2, ease: "sine.inOut" })
                .to(L, { x: 0.5, y: 0.4, r: 0.42, duration: 1.1, ease: "power2.out" })
                .to(".li-ember", { opacity: 0, duration: 0.8 }, 2.2)
                .to(".li-ghost", { opacity: 1, duration: 1.5 }, 3.4)
                .fromTo(cam, { scale: 1, rotation: -1.2 }, { scale: 1.08, rotation: 0, duration: 4.6, ease: "none" }, 0.4)
                .addLabel("beat", 4.6)

            // 3. фонарь мигает и гаснет… свет возвращается — она ближе
                .to(L, { b: 0.25, duration: 0.05 }, 4.9)
                .to(L, { b: 1, duration: 0.05 })
                .to(L, { b: 0.1, duration: 0.05, delay: 0.08 })
                .to(L, { b: 0.9, duration: 0.04 })
                .to(L, { b: 0, duration: 0.06 })
                .addLabel("dark")
                .set(cam, { scale: 1.42 }, "+=0.42")
                .set(L, { x: 0.5, y: 0.37, r: 0.55 })
                .addLabel("closer")
                .to(L, { b: 1, duration: 0.04 })
                .fromTo(cam, { x: -10 }, { x: 0, duration: 0.45, ease: "elastic.out(3, 0.25)", immediateRender: false }, "<")
                .to(cam, { scale: 1.5, duration: 1.1, ease: "none" }, "<")

            // 4. свет уходит, лицо тонет во тьме
                .to(L, { b: 0, r: 0.3, duration: 1.1, ease: "power2.in" }, ">-0.3")
                .set(cam, { scale: 1, rotation: 0 })

            // 5. красная нить прошивает название
                .addLabel("title")
                .set(thread ?? {}, { opacity: 1 }, "title")
                .to(thread ?? {}, { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, "title")
                .to(word ?? {}, { clipPath: "inset(-20% 0% -20% 0%)", filter: "blur(0px)", opacity: 1, duration: 1.1, ease: "power2.inOut" }, "title+=0.1")
                .to(word ? word.querySelectorAll("line") : {}, { opacity: 1, scale: 1, duration: 0.16, stagger: 0.05, ease: "back.out(3)" }, "title+=0.7")
                .to(thread ?? {}, { opacity: 0, duration: 0.6 }, "title+=1.2")
                .to(".li-tag", { opacity: 1, letterSpacing: "0.35em", duration: 1.2, ease: "power2.out" }, "title+=0.9")

            // 6. лицо едва проступает над названием и «дышит»
                .to(L, { x: 0.5, y: 0.37, r: 0.34, b: 0.42, duration: 1.8, ease: "power1.inOut" }, "title+=0.5")
                .addLabel("end");

            // постоянная жизнь: нити качаются, свет дрожит как пламя
            gsap.to(".li-thread", { rotation: 4, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: 0.35 });
            const flame = { k: 1 };
            gsap.to(flame, {
                k: 1.06, duration: 0.11, ease: "rough({ strength: 2, points: 12, randomize: true, clamp: true })", yoyo: true, repeat: -1,
                onUpdate: () => el.style.setProperty("--fl", String(flame.k)),
            });
        }, el);

        apply();
        window.addEventListener("resize", apply);
        return () => { window.removeEventListener("resize", apply); ctx.revert(); };
    }, []);

    const lit = "radial-gradient(circle calc(var(--lr) * var(--fl, 1)) at var(--lx) var(--ly), #000 0%, rgba(0,0,0,.85) 35%, rgba(0,0,0,.25) 65%, transparent 100%)";

    return (
        <div ref={root} className={`relative h-full w-full overflow-hidden bg-[#050304] ${className}`} aria-hidden="true">
            <div className="li-cam absolute inset-0 will-change-transform">
                {/* в тени — почти не видно */}
                <div className="li-ghost opacity-0"><Face className="opacity-[.07] [filter:brightness(.5)]" /></div>
                {/* под светом фонаря */}
                <div className="absolute inset-0" style={{ maskImage: lit, WebkitMaskImage: lit, opacity: "var(--lb, 1)" }}>
                    <Face className="[filter:sepia(.35)_saturate(1.2)_contrast(1.08)_brightness(1.05)]" />
                </div>
                {/* тёплый отсвет пламени */}
                <div className="absolute inset-0 mix-blend-soft-light" style={{ opacity: "var(--lb, 1)", background: "radial-gradient(circle calc(var(--lr) * 1.1) at var(--lx) var(--ly), rgba(255,150,60,.75), transparent 70%)" }} />
            </div>

            {/* огонёк фонаря в темноте */}
            <div className="li-ember absolute left-[13%] top-[86%] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,190,110,.95) 0%, rgba(255,120,40,.35) 25%, transparent 65%)" }} />

            <LightDust lantern={light} />

            {/* название, прошитое нитью */}
            <div className="absolute inset-x-0 top-[70%] flex flex-col items-center">
                <div className="relative w-[min(78vmin,680px)]">
                    <div className="li-word [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: wordmarkSvg }} />
                    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path className="li-title-thread" d="M-6 14 C 20 18, 45 11, 70 15 S 98 13, 106 15" fill="none" stroke="#c22a20" strokeWidth=".45" strokeLinecap="round" />
                    </svg>
                </div>
                {tagline && <p className="li-tag -mt-[2vmin] font-mono text-[clamp(9px,1.5vmin,13px)] uppercase text-bone/55">{tagline}</p>}
            </div>

            {/* плёнка: зерно, виньетка, кинополосы */}
            <div className="pointer-events-none absolute inset-0 opacity-[.13] mix-blend-overlay [animation:li-grain_.5s_steps(5)_infinite]" style={{ backgroundImage: NOISE }} />
            <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,.85) 100%)" }} />
            <div className="li-bar absolute inset-x-0 top-0 h-[9vh] origin-top bg-black" />
            <div className="li-bar absolute inset-x-0 bottom-0 h-[9vh] origin-bottom bg-black" />
        </div>
    );
}
