import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { IMAGES, type ImageId } from "@/config/media";
import { useLang } from "@/i18n/LanguageContext";
import { gsap } from "@/lib/motion";
import { Lightbox } from "@/components/ui/Lightbox";

const FRAMES: ImageId[] = ["sceneDoor", "sceneUnderSandal", "sceneGrandmotherRoom", "boyPoses", "sceneHiding", "alvastiPoses", "houseDiorama", "prototype"];
const HOLES = "repeating-linear-gradient(90deg, transparent 0 14px, #e8dfd0 14px 30px, transparent 30px 44px)";

/**
 * Кадры игры как киноплёнка: на десктопе секция «прилипает», и вертикальная
 * прокрутка двигает ленту вбок. На телефоне — обычная горизонтальная лента.
 */
export function FilmStrip() {
    const { t } = useLang();
    const root = useRef<HTMLElement>(null);
    const [active, setActive] = useState<number | null>(null);
    const items = FRAMES.map((id) => ({ src: IMAGES[id], caption: t.media.captions[id] }));

    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
            const track = root.current!.querySelector<HTMLElement>(".film-track")!;
            const dist = () => track.scrollWidth - window.innerWidth + 64;
            gsap.to(track, {
                x: () => -dist(), ease: "none",
                scrollTrigger: { trigger: ".film-pin", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.7, invalidateOnRefresh: true },
            });
            gsap.utils.toArray<HTMLElement>(".film-frame img").forEach((img) => {
                gsap.fromTo(img, { xPercent: -13 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: ".film-pin", start: "top top", end: () => `+=${dist()}`, scrub: true } });
            });
        });
        return () => mm.revert();
    }, { scope: root });

    return (
        <section ref={root} className="relative z-[2]">
            <div className="film-pin flex min-h-[100svh] flex-col justify-center overflow-hidden py-16">
                <div className="av-container mb-10">
                    <p className="av-kicker mb-3">{t.gallery.label}</p>
                    <h2 className="av-heading">{t.gallery.title}</h2>
                </div>
                <div className="overflow-x-auto md:overflow-visible">
                    <div className="film-track flex w-max gap-0 bg-[#0d0a0b] px-4 py-7 md:px-10" style={{ backgroundImage: `${HOLES}, ${HOLES}`, backgroundSize: "44px 10px, 44px 10px", backgroundPosition: "0 8px, 0 calc(100% - 8px)", backgroundRepeat: "repeat-x" }}>
                        {items.map((it, i) => (
                            <button key={it.src} type="button" onClick={() => setActive(i)} className="film-frame group relative mx-2 h-[42vh] w-[75vw] shrink-0 overflow-hidden bg-black sm:w-[55vw] md:h-[56vh] md:w-[44vw]">
                                <img src={it.src} alt={it.caption} loading="lazy" className="h-full w-[116%] max-w-none -translate-x-[8%] object-cover brightness-90 transition duration-500 group-hover:brightness-110" />
                                <span className="absolute bottom-3 left-4 font-hand text-2xl text-bone drop-shadow-[0_2px_6px_rgba(0,0,0,.9)]">{it.caption}</span>
                                <span className="absolute right-4 top-3 font-mono text-[10px] tracking-widest text-bone/50">{String(i + 1).padStart(2, "0")}A</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <Lightbox items={items} index={active} onChange={setActive} closeLabel={t.media.close} />
        </section>
    );
}
