import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/motion";

/**
 * Красная нить у левого края экрана: она «отматывается» по мере прокрутки
 * страницы, на конце висит бусина. Заменяет обычный индикатор прогресса.
 */
export function ThreadProgress() {
    const svg = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const el = svg.current!;
        const path = el.querySelector("path")!, bead = el.querySelector("circle")!;
        let len = 0;
        const build = () => {
            const h = window.innerHeight;
            el.setAttribute("viewBox", `0 0 30 ${h}`);
            let d = "M15 0";
            for (let y = 8; y <= h; y += 8) d += ` L${(15 + Math.sin(y / 55) * 5 + Math.sin(y / 23) * 1.5).toFixed(1)} ${y}`;
            path.setAttribute("d", d);
            len = path.getTotalLength();
            path.style.strokeDasharray = `${len}`;
        };
        const update = (p: number) => {
            path.style.strokeDashoffset = `${len * (1 - p)}`;
            const pt = path.getPointAtLength(Math.max(1, len * p));
            bead.setAttribute("cx", String(pt.x));
            bead.setAttribute("cy", String(pt.y));
        };
        build();
        const st = ScrollTrigger.create({ start: 0, end: "max", onUpdate: (s) => update(s.progress), onRefresh: (s) => { build(); update(s.progress); } });
        update(0);
        return () => st.kill();
    }, []);

    return (
        <svg ref={svg} aria-hidden="true" className="pointer-events-none fixed left-1 top-0 z-[900] hidden h-screen w-[30px] md:block">
            <path fill="none" stroke="#b3261e" strokeWidth="2" strokeLinecap="round" opacity=".85" />
            <circle r="5" fill="#8e1a14" stroke="#e0483c" strokeWidth="1.5" />
        </svg>
    );
}
