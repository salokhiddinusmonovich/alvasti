import { FadeIn } from "@/components/effects/FadeIn";

interface SectionHeadingProps { label: string; title: string; sub?: string; center?: boolean }

export function SectionHeading({ label, title, sub, center = false }: SectionHeadingProps) {
    return (
        <FadeIn className={`mb-12 max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
            <p className="av-kicker mb-4">{label}</p>
            <h2 className="av-heading">{title}</h2>
            {sub && <p className="mt-5 text-bone-muted leading-relaxed">{sub}</p>}
        </FadeIn>
    );
}
