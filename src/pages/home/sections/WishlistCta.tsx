import { SITE } from "@/config/site";
import { useLang } from "@/i18n/LanguageContext";
import { FadeIn } from "@/components/effects/FadeIn";
import { ButtonAnchor } from "@/components/ui/Button";
import { SteamIcon, TelegramIcon } from "@/components/ui/Icons";

export function WishlistCta() {
    const { t } = useLang();
    return (
        <section className="av-section">
            <div className="av-container">
                <FadeIn className="relative overflow-hidden rounded-3xl border border-blood/30 bg-[radial-gradient(ellipse_at_bottom,rgba(179,38,30,0.35),transparent_70%)] px-6 py-20 text-center">
                    <img src="/brand/mask.webp" alt="" aria-hidden="true" loading="lazy" className="mx-auto -mt-10 mb-2 w-56 [animation:av-sway_7s_ease-in-out_infinite] [mask-image:linear-gradient(to_bottom,black_62%,transparent_92%)] sm:w-72" />
                    <h2 className="av-flicker av-heading">{t.cta.title}</h2>
                    <p className="mx-auto mt-5 max-w-xl leading-relaxed text-bone-muted">{t.cta.sub}</p>
                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <ButtonAnchor href={SITE.links.steam}><SteamIcon width={16} height={16} /> {t.cta.primary}</ButtonAnchor>
                        <ButtonAnchor href={SITE.links.telegram} variant="ghost"><TelegramIcon width={16} height={16} /> {t.cta.secondary}</ButtonAnchor>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}
