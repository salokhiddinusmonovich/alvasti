import { useEffect, useRef } from "react";

interface Particle { x: number; y: number; vx: number; vy: number; r: number; a: number; life: number; flicker: number; ember: boolean; }

interface EmberCanvasProps {
    /** Количество частиц (угли + пепел). */
    count?: number;
    /** Доля раскалённых углей среди частиц, 0..1; остальное — серый пепел. */
    emberRatio?: number;
    className?: string;
}

/**
 * Фоновый canvas на весь экран: поднимающиеся угли и падающий пепел.
 * Аналог AmbientCanvas из YashilQo'llar (там — листья и узлы), настраивается
 * пропсами. Для prefers-reduced-motion не анимируется.
 */
export function EmberCanvas({ count = 70, emberRatio = 0.35, className }: EmberCanvasProps) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const canvas = ref.current!;
        const ctx = canvas.getContext("2d")!;
        let id = 0, w = 0, h = 0;
        const parts: Particle[] = [];

        const spawn = (p: Partial<Particle> = {}): Particle => {
            const ember = Math.random() < emberRatio;
            return {
                x: Math.random() * w,
                y: ember ? h + 10 : Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: ember ? -(Math.random() * 0.7 + 0.3) : Math.random() * 0.25 + 0.05,
                r: ember ? Math.random() * 1.6 + 0.6 : Math.random() * 1.2 + 0.4,
                a: ember ? Math.random() * 0.6 + 0.4 : Math.random() * 0.25 + 0.08,
                life: 0,
                flicker: Math.random() * Math.PI * 2,
                ember,
                ...p,
            };
        };

        const init = () => {
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
            parts.length = 0;
            for (let i = 0; i < count; i++) parts.push(spawn({ y: Math.random() * h }));
        };

        const tick = () => {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < parts.length; i++) {
                const p = parts[i];
                p.life++;
                p.flicker += 0.08;
                p.x += p.vx + Math.sin(p.life * 0.02) * 0.2;
                p.y += p.vy;
                if (p.y < -10 || p.y > h + 10 || p.x < -10 || p.x > w + 10) {
                    parts[i] = spawn();
                    continue;
                }
                const alpha = p.ember ? p.a * (0.6 + 0.4 * Math.sin(p.flicker)) : p.a;
                if (p.ember) {
                    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
                    g.addColorStop(0, `rgba(255,122,61,${alpha * 0.5})`);
                    g.addColorStop(1, "transparent");
                    ctx.fillStyle = g;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = p.ember ? `rgba(255,160,90,${alpha})` : `rgba(200,190,180,${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            id = requestAnimationFrame(tick);
        };

        init();
        tick();
        window.addEventListener("resize", init);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener("resize", init);
        };
    }, [count, emberRatio]);

    return (
        <canvas
            ref={ref}
            aria-hidden="true"
            className={className}
            style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
        />
    );
}
