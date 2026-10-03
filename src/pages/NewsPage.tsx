import { IMAGES, type ImageId } from "@/config/media";
import { useLang } from "@/i18n/LanguageContext";
import { StaggerReveal } from "@/components/effects/StaggerReveal";
import { PageHeader } from "@/components/ui/PageHeader";

const LOCALES = { uz: "uz-UZ", ru: "ru-RU", en: "en-US" } as const;

export function NewsPage() {
    const { t, lang } = useLang();
    const fmt = new Intl.DateTimeFormat(LOCALES[lang], { day: "numeric", month: "long", year: "numeric" });
    return (
        <>
            <PageHeader label={t.news.label} title={t.news.title} />
            <section className="av-section pt-0">
                <div className="av-container grid gap-6">
                    <StaggerReveal>
                        {t.news.items.map((n) => (
                            <article key={n.date} className="av-card grid overflow-hidden md:grid-cols-[320px_1fr]">
                                <img src={IMAGES[n.image as ImageId]} alt="" loading="lazy" className="aspect-video h-full w-full object-cover" />
                                <div className="p-7">
                                    <time dateTime={n.date} className="font-mono text-[11px] uppercase tracking-[0.18em] text-blood-light">{fmt.format(new Date(n.date))}</time>
                                    <h2 className="mt-2 font-display text-3xl font-semibold">{n.title}</h2>
                                    <p className="mt-3 leading-relaxed text-bone-muted">{n.excerpt}</p>
                                </div>
                            </article>
                        ))}
                    </StaggerReveal>
                </div>
            </section>
        </>
    );
}
