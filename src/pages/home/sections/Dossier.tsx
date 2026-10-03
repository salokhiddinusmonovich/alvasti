import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useLang } from "@/i18n/LanguageContext";
import { gsap } from "@/lib/motion";
import { TurnViewer } from "@/components/motion/TurnViewer";

const FRAMES = {
    boy: [0, 1, 2, 3, 4].map((i) => `/images/turn/boy-${i}.webp`),
    alvasti: [0, 1, 2, 3, 4].map((i) => `/images/turn/alvasti-${i}.webp`),
};

/**
 * Персонажи как два листа досье, прилепленные скотчем к тёмной стене
 * и связанные красной нитью. Персонажа на листе можно вращать.
 */
export function Dossier() {
    const { t } = useLang();
    const root = useRef<HTMLElement>(null);

    useGSAP(() => {
        gsap.utils.toArray<HTMLElement>(".dossier-sheet").forEach((el, i) => {
            gsap.from(el, {
                y: -120, rotate: i ? 14 : -14, opacity: 0, duration: 1.3, ease: "back.out(1.4)",
                scrollTrigger: { trigger: el, start: "top 85%" },
            });
        });
        gsap.from(".dossier-stamp", { scale: 2.6, opacity: 0, rotate: 0, duration: 0.45, ease: "power4.in", scrollTrigger: { trigger: ".dossier-stamp", start: "top 75%" }, delay: 0.8 });
        const thread = root.current!.querySelector<SVGPathElement>(".dossier-thread");
        if (thread) {
            const len = thread.getTotalLength();
            gsap.fromTo(thread, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top 70%", end: "center 50%", scrub: true } });
        }
        gsap.from(".dossier-note", { opacity: 0, x: -15, stagger: 0.3, duration: 0.8, scrollTrigger: { trigger: root.current, start: "top 40%" } });
    }, { scope: root });

    const [boy, alvasti] = t.characters.items;

    return (
        <section ref={root} className="relative z-[2] overflow-hidden py-24 sm:py-32">
            <div className="av-container">
                <h2 className="av-heading mb-16 max-w-2xl">{t.characters.title}</h2>
                <div className="relative grid gap-14 md:grid-cols-2 md:gap-10">
                    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full md:block" viewBox="0 0 1000 600" preserveAspectRatio="none">
                        <path className="dossier-thread" d="M230 40 C 380 -10, 520 140, 640 60 S 760 30, 790 50" fill="none" stroke="#b3261e" strokeWidth="3" strokeLinecap="round" />
                    </svg>

                    <Sheet tilt="-rotate-2" name={boy.name} role={boy.role} desc={boy.desc} frames={FRAMES.boy} hint={t.dossier.dragHint}
                        note={<span className="dossier-note absolute bottom-24 right-3 rotate-[-6deg] font-hand text-xl text-blood sm:text-2xl">← {t.dossier.noteBoy}</span>} />
                    <Sheet tilt="rotate-[1.5deg] md:mt-16" name={alvasti.name} role={alvasti.role} desc={alvasti.desc} frames={FRAMES.alvasti} hint={t.dossier.dragHint}
                        note={<span className="dossier-note absolute bottom-6 left-3 rotate-[4deg] font-hand text-xl text-blood sm:text-2xl">{t.dossier.noteAlvasti} ↘</span>}
                        stamp={t.dossier.stamp} />
                </div>
            </div>
        </section>
    );
}

interface SheetProps { tilt: string; name: string; role: string; desc: string; frames: string[]; hint: string; note: React.ReactNode; stamp?: string }

function Sheet({ tilt, name, role, desc, frames, hint, note, stamp }: SheetProps) {
    return (
        <article className={`dossier-sheet relative ${tilt}`}>
            <div className="relative bg-[#dcdcd9] p-4 pb-6 text-[#241812] shadow-[0_30px_60px_-20px_rgba(0,0,0,.9)] sm:p-6">
                {/* скотч */}
                <span aria-hidden="true" className="absolute -left-4 -top-3 h-8 w-24 -rotate-[24deg] bg-[#e8dcb8]/70 shadow-sm" />
                <span aria-hidden="true" className="absolute -right-4 -top-3 h-8 w-24 rotate-[20deg] bg-[#e8dcb8]/70 shadow-sm" />
                <div className="relative h-[360px] sm:h-[440px]">
                    <TurnViewer frames={frames} alt={name} className="h-full" />
                    {note}
                    {stamp && (
                        <span className="dossier-stamp absolute right-2 top-4 rotate-[-14deg] border-[3px] border-blood px-3 py-1 font-display text-3xl font-bold tracking-[0.2em] text-blood opacity-80 mix-blend-multiply">
                            {stamp}
                        </span>
                    )}
                </div>
                <p className="mt-2 text-center font-hand text-lg text-[#241812]/50">↔ {hint}</p>
                <div className="mt-4 border-t border-dashed border-[#241812]/25 pt-4">
                    <p className="font-hand text-2xl text-blood">{role}</p>
                    <h3 className="font-display text-4xl font-bold">{name}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#241812]/80">{desc}</p>
                </div>
            </div>
        </article>
    );
}
