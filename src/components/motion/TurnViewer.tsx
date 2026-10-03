import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/motion";

interface TurnViewerProps {
    /** Кадры разворота: анфас → 3/4 → профиль → 3/4 со спины → спина. */
    frames: string[];
    alt: string;
    className?: string;
}

/**
 * Персонаж, которого можно вращать на 360°: тянуть мышью/пальцем, а при
 * прокрутке он медленно поворачивается сам. Вторая половина оборота —
 * зеркальные кадры первой.
 */
export function TurnViewer({ frames, alt, className = "" }: TurnViewerProps) {
    const seq = [...frames.map((src) => ({ src, flip: false })), ...frames.slice(1, -1).reverse().map((src) => ({ src, flip: true }))];
    const [pos, setPos] = useState(0);
    const root = useRef<HTMLDivElement>(null);
    const drag = useRef<{ x: number; start: number } | null>(null);

    // прокрутка страницы → лёгкий поворот
    useEffect(() => {
        const st = ScrollTrigger.create({
            trigger: root.current, start: "top bottom", end: "bottom top",
            onUpdate: (self) => { if (!drag.current) setPos(self.progress * seq.length * 1.5); },
        });
        return () => st.kill();
    }, [seq.length]);

    const idx = ((Math.round(pos) % seq.length) + seq.length) % seq.length;
    const frame = seq[idx];

    return (
        <div
            ref={root}
            className={`relative cursor-grab touch-pan-y select-none active:cursor-grabbing ${className}`}
            onPointerDown={(e) => { drag.current = { x: e.clientX, start: pos }; (e.target as Element).setPointerCapture?.(e.pointerId); }}
            onPointerMove={(e) => { if (drag.current) setPos(drag.current.start - (e.clientX - drag.current.x) / 45); }}
            onPointerUp={() => { drag.current = null; }}
            onPointerCancel={() => { drag.current = null; }}
        >
            {/* все кадры заранее в DOM — без мигания при первом повороте */}
            {seq.map((f, i) => (
                <img
                    key={i}
                    src={f.src}
                    alt={i === idx ? alt : ""}
                    aria-hidden={i !== idx}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ opacity: i === idx ? 1 : 0, transform: f.flip ? "scaleX(-1)" : undefined }}
                />
            ))}
            <img src={frame.src} alt="" aria-hidden="true" className="invisible h-full w-full object-contain" />
        </div>
    );
}
