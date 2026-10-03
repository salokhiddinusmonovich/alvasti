import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { IMAGES, srcSetOf } from "@/config/media";
import { useLang } from "@/i18n/LanguageContext";
import { gsap } from "@/lib/motion";

/** Маршрут Алвасти по карте (координаты картинки 1024×765): ворота → топчан → тутовник → айван → комната бабушки. */
const ROUTE = "M515 590 C440 560 335 545 330 470 C325 405 380 392 470 395 C560 398 640 392 700 410 C745 430 740 520 700 560 C660 590 600 570 580 540 C560 500 600 420 640 360 C670 310 640 270 600 268 L445 265";

/**
 * Карта дома бабушки: при прокрутке по ней протягивается светящаяся нить —
 * её путь, бусина на конце нити идёт впереди. Карта слегка наклоняется
 * за курсором, как лист на столе.
 */
export function House() {
    const { t } = useLang();
    const root = useRef<HTMLElement>(null);
    const tilt = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const path = root.current!.querySelector<SVGPathElement>(".route")!;
        const bead = root.current!.querySelector<SVGCircleElement>(".route-bead")!;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
            strokeDashoffset: 0, ease: "none",
            scrollTrigger: {
                trigger: ".map-wrap", start: "top 70%", end: "bottom 40%", scrub: 0.8,
                onUpdate: (self) => {
                    const p = path.getPointAtLength(len * self.progress);
                    bead.setAttribute("cx", String(p.x));
                    bead.setAttribute("cy", String(p.y));
                },
            },
        });
        gsap.from(".map-wrap", { rotateX: 35, y: 100, opacity: 0, duration: 1.4, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 75%" } });
        gsap.from(".house-room", { opacity: 0, y: 10, stagger: 0.04, duration: 0.5, scrollTrigger: { trigger: ".house-rooms", start: "top 85%" } });
    }, { scope: root });

    const onMove = (e: React.PointerEvent) => {
        if (e.pointerType !== "mouse" || !tilt.current) return;
        const r = tilt.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(tilt.current, { rotateY: px * 8, rotateX: -py * 8, duration: 0.6, ease: "power2.out" });
    };
    const onLeave = () => tilt.current && gsap.to(tilt.current, { rotateX: 0, rotateY: 0, duration: 0.8 });

    return (
        <section ref={root} className="relative z-[2] py-24 sm:py-32">
            <div className="av-container grid items-center gap-12 lg:grid-cols-[1.5fr_1fr]">
                <div className="[perspective:1400px]" onPointerMove={onMove} onPointerLeave={onLeave}>
                    <div ref={tilt} className="map-wrap relative [transform-style:preserve-3d]">
                        <img src={IMAGES.houseMap} srcSet={srcSetOf(IMAGES.houseMap)} sizes="(min-width: 1024px) 60vw, 100vw" alt={t.media.captions.houseMap} loading="lazy" className="w-full rounded-sm shadow-[0_40px_80px_-30px_rgba(0,0,0,.95)]" />
                        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1024 765" aria-hidden="true">
                            <defs>
                                <filter id="routeGlow" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                            </defs>
                            <path className="route" d={ROUTE} fill="none" stroke="#e0483c" strokeWidth="5" strokeLinecap="round" filter="url(#routeGlow)" />
                            <circle className="route-bead" cx="515" cy="590" r="10" fill="#b3261e" stroke="#ff9a8a" strokeWidth="2" />
                        </svg>
                        <span className="absolute left-[34%] top-[86%] rotate-[-5deg] font-hand text-2xl text-blood drop-shadow sm:text-3xl">↑ {t.mapHint}</span>
                    </div>
                </div>
                <div>
                    <p className="av-kicker mb-3">{t.house.label}</p>
                    <h2 className="av-heading">{t.house.title}</h2>
                    <p className="mt-5 leading-relaxed text-bone-muted">{t.house.sub}</p>
                    <p className="house-rooms mt-8 font-hand text-2xl leading-relaxed text-bone/60">
                        {t.house.rooms.map((r, i) => (
                            <span key={r} className="house-room inline-block">{r}{i < t.house.rooms.length - 1 && <span className="mx-2 text-blood">·</span>}</span>
                        ))}
                    </p>
                </div>
            </div>
        </section>
    );
}
