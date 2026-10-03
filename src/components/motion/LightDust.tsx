import { useEffect, useRef, type MutableRefObject } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** Текущее положение фонаря в px относительно родителя (пишет Hero). */
export interface LanternLight { x: number; y: number; r: number }

/** Неподвижный источник света на картинке, в долях её размеров (0..1). */
export interface StaticLight { x: number; y: number; r: number; strength: number }

interface LightDustProps {
    /** Фонарь, за которым следует свет; без него — только статичные источники. */
    lantern?: MutableRefObject<LanternLight>;
    /** Источники света на самой картинке (дверной проём, пятно на полу…). */
    lights?: StaticLight[];
    /** Размер исходной картинки и object-position по X — чтобы источники совпали с кадром при object-cover. */
    image?: { w: number; h: number; posX: number; posXMobile?: number };
    /** Фоновая яркость пылинок вне света (0 — видны только в лучах). */
    ambient?: number;
    density?: number;
    className?: string;
}

interface Mote { x: number; y: number; z: number; vx: number; vy: number; ph: number; sp: number }

const smooth = (t: number) => (t <= 0 ? 1 : t >= 1 ? 0 : 1 - t * t * (3 - 2 * t));

/**
 * Пыль в воздухе: сотни пылинок медленно плавают, но видны только там, где
 * на них падает свет — в луче фонаря и в свете из двери. Ближние пылинки
 * крупные и размытые (боке), дальние — мелкие искры. Резкое движение
 * фонарём «раздувает» пыль.
 */
export function LightDust({ lantern, lights = [], image, ambient = 0, density = 1, className = "" }: LightDustProps) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (prefersReducedMotion()) return;
        const canvas = ref.current!;
        const ctx = canvas.getContext("2d")!;
        let W = 0, H = 0, dpr = 1, raf = 0, visible = true;
        let motes: Mote[] = [];
        let px = 0, py = 0; // прошлое положение фонаря — для «ветра»

        const resize = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1);
            W = canvas.clientWidth; H = canvas.clientHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const n = Math.round((W < 768 ? 180 : 420) * density);
            motes = Array.from({ length: n }, () => ({
                x: Math.random() * W, y: Math.random() * H, z: Math.random() ** 1.6,
                vx: 0, vy: 0, ph: Math.random() * 6.28, sp: 0.6 + Math.random() * 1.8,
            }));
        };

        /** Источники с картинки → координаты экрана с учётом object-cover. */
        const staticLights = () => {
            if (!image) return lights.map((l) => ({ x: l.x * W, y: l.y * H, r: l.r * Math.max(W, H), s: l.strength }));
            const scale = Math.max(W / image.w, H / image.h);
            const posX = W < 768 && image.posXMobile !== undefined ? image.posXMobile : image.posX;
            const ox = (W - image.w * scale) * posX, oy = (H - image.h * scale) * 0.5;
            return lights.map((l) => ({ x: ox + l.x * image.w * scale, y: oy + l.y * image.h * scale, r: l.r * image.h * scale, s: l.strength }));
        };

        const tick = (now: number) => {
            const t = now / 1000;
            ctx.clearRect(0, 0, W, H);
            ctx.globalCompositeOperation = "lighter";
            const L = lantern?.current;
            const wx = L ? L.x - px : 0, wy = L ? L.y - py : 0;
            if (L) { px = L.x; py = L.y; }
            const statics = staticLights();

            for (const m of motes) {
                // броуновское движение + лёгкий подъём тёплого воздуха
                m.vx += (Math.random() - 0.5) * 0.03 * (0.4 + m.z);
                m.vy += (Math.random() - 0.5) * 0.03 * (0.4 + m.z) - 0.0025;
                let lit = ambient;
                if (L) {
                    const d = Math.hypot(m.x - L.x, m.y - L.y) / L.r;
                    if (d < 1.2) {
                        const f = smooth(d);
                        lit = Math.max(lit, f ** 1.4);
                        // фонарь двигается — воздух вокруг него тоже
                        m.vx += wx * 0.012 * f; m.vy += wy * 0.012 * f;
                    }
                }
                for (const s of statics) lit = Math.max(lit, smooth(Math.hypot(m.x - s.x, m.y - s.y) / s.r) * s.s);
                m.vx *= 0.97; m.vy *= 0.97;
                m.x += m.vx; m.y += m.vy;
                if (m.x < -20) m.x = W + 20; else if (m.x > W + 20) m.x = -20;
                if (m.y < -20) m.y = H + 20; else if (m.y > H + 20) m.y = -20;

                const tw = 0.55 + 0.45 * Math.sin(t * m.sp + m.ph);
                const a = Math.min(1, lit * tw * (0.35 + 0.95 * m.z) * 1.5);
                if (a < 0.015) continue;
                const size = 0.7 + 2.6 * m.z * m.z;
                if (m.z > 0.8) {
                    // ближняя пылинка не в фокусе — мягкое боке
                    const R = size * 5;
                    const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, R);
                    g.addColorStop(0, `rgba(255,214,165,${a * 0.45})`);
                    g.addColorStop(1, "rgba(255,214,165,0)");
                    ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, 6.283); ctx.fill();
                } else {
                    ctx.fillStyle = `rgba(255,${200 + Math.round(30 * m.z)},${150 + Math.round(40 * m.z)},${a})`;
                    ctx.beginPath(); ctx.arc(m.x, m.y, size, 0, 6.283); ctx.fill();
                }
            }
            if (visible) raf = requestAnimationFrame(tick);
        };

        resize();
        const io = new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
            cancelAnimationFrame(raf);
            if (visible) raf = requestAnimationFrame(tick);
        });
        io.observe(canvas);
        window.addEventListener("resize", resize);
        return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, [lantern, lights, image, ambient, density]);

    return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
