import { SITE } from "@/config/site";
import { useLang } from "@/i18n/LanguageContext";
import { FadeIn } from "@/components/effects/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IMAGES, srcSetOf } from "@/config/media";
import { PlayIcon } from "@/components/ui/Icons";

export function Trailer() {
    const { t } = useLang();
    return (
        <section id="trailer" className="av-section scroll-mt-16">
            <div className="av-container">
                <SectionHeading label={t.trailer.label} title={t.trailer.title} center />
                <FadeIn>
                    {SITE.trailerId ? (
                        <div className="aspect-video overflow-hidden rounded-xl border border-bone/10 shadow-[0_30px_120px_-30px_rgba(179,38,30,0.5)]">
                            <iframe
                                className="h-full w-full"
                                src={`https://www.youtube-nocookie.com/embed/${SITE.trailerId}`}
                                title={t.trailer.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <div className="relative aspect-video overflow-hidden rounded-xl border border-bone/10">
                            <img src={IMAGES.sceneGrandmotherRoom} srcSet={srcSetOf(IMAGES.sceneGrandmotherRoom)} sizes="(min-width: 1152px) 1152px, 100vw" alt="" loading="lazy" className="h-full w-full object-cover opacity-50" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-bone/30 bg-night/60 text-bone/70"><PlayIcon width={22} height={22} /></span>
                                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-bone/70">{t.trailer.soon}</span>
                            </div>
                        </div>
                    )}
                </FadeIn>
            </div>
        </section>
    );
}
