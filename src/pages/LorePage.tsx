import { useLang } from "@/i18n/LanguageContext";
import { StaggerReveal } from "@/components/effects/StaggerReveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { FadeIn } from "@/components/effects/FadeIn";
import { IMAGES, srcSetOf } from "@/config/media";

export function LorePage() {
    const { t } = useLang();
    const l = t.loreFull;
    return (
        <>
            <PageHeader label={l.label} title={l.title} sub={l.intro} />
            <section className="av-section pt-0">
                <FadeIn className="av-container mb-16">
                    <figure className="overflow-hidden rounded-2xl border border-bone/10 bg-[#e6e4df]">
                        <img src={IMAGES.alvastiFeet} srcSet={srcSetOf(IMAGES.alvastiFeet)} sizes="(min-width: 1152px) 1152px, 100vw" alt={l.feetCaption} className="w-full" />
                    </figure>
                    <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-bone/50">{l.feetCaption}</figcaption>
                </FadeIn>
                <ol className="av-container relative space-y-6 border-l border-bone/10 pl-8 sm:pl-12">
                    <StaggerReveal step={110} direction="left">
                        {l.entries.map((e, i) => (
                            <li key={e.title} className="relative">
                                <span aria-hidden="true" className="absolute -left-[41px] top-7 h-3 w-3 rounded-full bg-blood shadow-[0_0_14px_rgba(224,72,60,0.8)] sm:-left-[57px]" />
                                <article className="av-card p-7">
                                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-bone/30">{String(i + 1).padStart(2, "0")}</p>
                                    <h2 className="mt-2 font-display text-3xl font-semibold">{e.title}</h2>
                                    <p className="mt-3 leading-relaxed text-bone-muted">{e.desc}</p>
                                </article>
                            </li>
                        ))}
                    </StaggerReveal>
                </ol>
            </section>
        </>
    );
}
