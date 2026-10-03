import { useEffect, useRef, useState } from "react";

interface FadeInProps {
    children: React.ReactNode;
    /** Extra delay in ms, useful for staggering a list of siblings. */
    delay?: number;
    /** Direction the element travels in from. Defaults to "up". */
    direction?: "up" | "left" | "right" | "none";
    /** Distance in px travelled during the reveal. */
    distance?: number;
    /** Soft focus-pull: blurs in from `blurPx` to sharp. Set 0 to disable. */
    blurPx?: number;
    /** Starts very slightly scaled down and settles at 1 — adds weight to the reveal. */
    scale?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const OFFSETS: Record<NonNullable<FadeInProps["direction"]>, (d: number) => string> = {
    up: (d) => `translateY(${d}px)`,
    left: (d) => `translateX(${d}px)`,
    right: (d) => `translateX(-${d}px)`,
    none: () => "translateY(0)",
};

/**
 * Scroll-triggered reveal wrapper (IntersectionObserver + opacity/transform/blur).
 * Same mechanism used across the site — no layout impact (filter/transform don't
 * affect flow), safe to wrap any block.
 */
export function FadeIn({ children, delay = 0, direction = "up", distance = 34, blurPx = 8, scale = true, className, style }: FadeInProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [vis, setVis] = useState(false);

    useEffect(() => {
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setVis(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    const hiddenTransform = `${OFFSETS[direction](distance)}${scale ? " scale(.94)" : ""}`;

    return (
        <div
            ref={ref}
            style={{
                opacity: vis ? 1 : 0,
                transform: vis ? "translate(0,0) scale(1)" : hiddenTransform,
                filter: blurPx ? (vis ? "blur(0px)" : `blur(${blurPx}px)`) : undefined,
                transition: `opacity .8s cubic-bezier(.16,1,.3,1) ${delay}ms, transform .8s cubic-bezier(.16,1,.3,1) ${delay}ms, filter .8s cubic-bezier(.16,1,.3,1) ${delay}ms`,
                ...style,
            }}
            className={className}
        >
            {children}
        </div>
    );
}
