import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { IMAGES, type ImageId } from "@/config/media";
import { useLang } from "@/i18n/LanguageContext";
import { gsap } from "@/lib/motion";

const SCENES: ImageId[] = ["sceneGrandmotherRoom", "sceneHiding", "sceneUnderSandal"];

/**
 * История той ночи, рассказанная прокруткой: экран «прилипает», сцены
 * сменяют друг друга, строки проявляются по одной, как шёпот. Сверху
 * через весь экран протягивается красная нить.
 */
export function Story() {
    const { t } = useLang();
    const root = useRef<HTMLElement>(null);

    useGSAP(() => {
        const per = 3;
        const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        const thread = root.current!.querySelector<SVGPathElement>(".story-thread")!;
        const len = thread.getTotalLength();
        gsap.set(thread, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(thread, { strokeDashoffset: 0, duration: SCENES.length * per }, 0);

        SCENES.forEach((_, i) => {
            const at = i * per;
            if (i > 0) tl.fromTo(`.story-img-${i}`, { opacity: 0 }, { opacity: 1, duration: 0.6 }, at - 0.3);
            tl.fromTo(`.story-img-${i}`, { scale: 1.18 }, { scale: 1, duration: per + 0.3 }, Math.max(0, at - 0.3));
            gsap.utils.toArray<HTMLElement>(`.story-line-${i}`).forEach((line, j) => {
                tl.fromTo(line, { opacity: 0, y: 30, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power2.out" }, at + 0.3 + j * 0.8);
                if (i < SCENES.length - 1) tl.to(line, { opacity: 0, y: -20, filter: "blur(6px)", duration: 0.4 }, at + per - 0.5);
            });
            tl.fromTo(`.story-count`, { textContent: i }, { textContent: i + 1, duration: 0.01, snap: { textContent: 1 } }, at);
        });
    }, { scope: root });

    return (
        <section ref={root} className="relative z-[2]" style={{ height: `${SCENES.length * 110 + 60}vh` }}>
            <div className="sticky top-0 h-[100svh] overflow-hidden">
                {SCENES.map((id, i) => (
                    <img key={id} src={IMAGES[id]} alt="" aria-hidden="true" className={`story-img-${i} absolute inset-0 h-full w-full object-cover brightness-[.55]`} style={{ opacity: i === 0 ? 1 : 0 }} />
                ))}
                <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(10,8,9,.9)_85%)]" />
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-night to-transparent" />
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night to-transparent" />

                <svg aria-hidden="true" className="absolute inset-x-0 top-[12%] h-24 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
                    <path className="story-thread" d="M-20 40 C 200 90, 380 10, 620 55 S 1000 95, 1180 35 S 1400 60, 1460 50" fill="none" stroke="#b3261e" strokeWidth="3" strokeLinecap="round" />
                </svg>

                <div className="av-container absolute inset-x-0 bottom-[14%]">
                    {SCENES.map((id, i) => (
                        <div key={id} className="absolute bottom-0 max-w-3xl">
                            {t.story.scenes[i].map((line, j) => (
                                <p key={j} className={`story-line-${i} font-serif text-4xl italic leading-tight text-bone opacity-0 sm:text-6xl ${j > 0 ? "mt-3 text-bone/70" : ""}`}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>
                <p aria-hidden="true" className="absolute right-6 top-24 font-mono text-[11px] tracking-[0.3em] text-bone/40">
                    <span className="story-count">1</span> / {SCENES.length}
                </p>
            </div>
        </section>
    );
}
