import type { ReactNode } from "react";
import { MagneticAnchor, MagneticLink } from "@/components/effects/Magnetic";

type Variant = "primary" | "ghost";

const BASE = "inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-[filter,background,border-color] duration-200";
const VARIANTS: Record<Variant, string> = {
    primary: "bg-blood text-bone shadow-[0_10px_40px_-10px_rgba(179,38,30,0.8)] hover:brightness-110",
    ghost: "border border-bone/20 text-bone hover:border-blood-light hover:bg-blood/10",
};

interface ButtonProps { variant?: Variant; children: ReactNode; className?: string }

/** Внутренняя ссылка-кнопка (react-router). */
export function ButtonLink({ to, variant = "primary", children, className = "" }: ButtonProps & { to: string }) {
    return <MagneticLink to={to} className={`${BASE} ${VARIANTS[variant]} ${className}`}>{children}</MagneticLink>;
}

/** Внешняя ссылка-кнопка — открывается в новой вкладке. */
export function ButtonAnchor({ href, variant = "primary", children, className = "" }: ButtonProps & { href: string }) {
    const external = /^https?:/.test(href);
    return (
        <MagneticAnchor
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={`${BASE} ${VARIANTS[variant]} ${className}`}
        >
            {children}
        </MagneticAnchor>
    );
}
