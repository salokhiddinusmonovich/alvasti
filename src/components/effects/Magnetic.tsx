import { useRef } from "react";
import { Link } from "react-router-dom";

interface MagneticBaseProps {
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
    /** How strongly the element follows the cursor. Lower = subtler. */
    strength?: number;
}

function useMagnetic<T extends HTMLElement>(strength: number) {
    const ref = useRef<T>(null);
    const handleMove = (e: React.MouseEvent<T>) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength * 1.3}px)`;
    };
    const reset = () => {
        if (ref.current) ref.current.style.transform = "translate(0,0)";
    };
    return { ref, handleMove, reset };
}

/** Internal route link that gently pulls toward the cursor on hover. */
export function MagneticLink({ to, className, style, children, strength = 0.12 }: MagneticBaseProps & { to: string }) {
    const { ref, handleMove, reset } = useMagnetic<HTMLAnchorElement>(strength);
    return (
        <Link
            ref={ref}
            to={to}
            className={className}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            style={{ transition: "transform .15s ease-out", ...style }}
        >
            {children}
        </Link>
    );
}

/** External / mailto / tel link with the same magnetic hover pull. */
export function MagneticAnchor({ href, className, style, children, strength = 0.12, target, rel }: MagneticBaseProps & { href: string; target?: string; rel?: string }) {
    const { ref, handleMove, reset } = useMagnetic<HTMLAnchorElement>(strength);
    return (
        <a
            ref={ref}
            href={href}
            target={target}
            rel={rel}
            className={className}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            style={{ transition: "transform .15s ease-out", ...style }}
        >
            {children}
        </a>
    );
}

/** Clickable <button> with the same magnetic hover pull — for submits, modal actions, etc. */
export function MagneticButton({ onClick, className, style, children, strength = 0.12, type = "button", disabled }: MagneticBaseProps & { onClick?: React.MouseEventHandler<HTMLButtonElement>; type?: "button" | "submit"; disabled?: boolean }) {
    const { ref, handleMove, reset } = useMagnetic<HTMLButtonElement>(strength);
    return (
        <button
            ref={ref}
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={className}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            style={{ transition: "transform .15s ease-out", ...style }}
        >
            {children}
        </button>
    );
}
