import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion";

const SOLE = "M0 120 C-38 120 -46 70 -40 30 C-34 -10 -52 -40 -50 -78 C-48 -120 -10 -132 18 -122 C48 -110 54 -70 44 -36 C36 -6 40 40 34 80 C30 110 22 120 0 120 Z";
const TOES: [number, number, number, number][] = [[-38, -152, 17, 21], [-6, -166, 13, 16], [18, -160, 11, 13], [37, -146, 9, 11], [51, -128, 7.5, 9]];

/**
 * Следы, которые появляются шаг за шагом по мере прокрутки. Идут вверх по
 * странице, но пальцы смотрят вниз — её ступни вывернуты назад.
 */
export function Footprints({ steps = 9 }: { steps?: number }) {
    const root = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(".fp", { opacity: 0 }, {
            opacity: (i) => 0.75 - (i / steps) * 0.35, stagger: 0.5, ease: "power2.out",
            scrollTrigger: { trigger: root.current, start: "top 85%", end: "bottom 35%", scrub: 0.5 },
        });
    }, { scope: root });

    return (
        <div ref={root} aria-hidden="true" className="relative z-[2] mx-auto h-[70vh] max-w-xl">
            <svg viewBox={`0 0 400 ${steps * 110 + 100}`} className="h-full w-full">
                {Array.from({ length: steps }, (_, i) => {
                    // снизу вверх, левая/правая по очереди, лёгкий изгиб пути
                    const y = steps * 110 - i * 110 + 20, x = 200 + (i % 2 ? 34 : -34) + Math.sin(i * 0.7) * 40;
                    const rot = 180 + (i % 2 ? 8 : -8) + Math.cos(i * 0.7) * 12;
                    return (
                        <g key={i} className="fp" transform={`translate(${x.toFixed(1)} ${y}) rotate(${rot.toFixed(1)}) scale(.32)`}>
                            <g transform={i % 2 ? "scale(-1 1)" : undefined}>
                                <path d={SOLE} fill="#c9b28f" />
                                {TOES.map(([tx, ty, rx, ry], k) => <ellipse key={k} cx={tx} cy={ty} rx={rx} ry={ry} fill="#c9b28f" />)}
                            </g>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
