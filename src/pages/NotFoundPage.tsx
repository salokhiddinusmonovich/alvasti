import { useLang } from "@/i18n/LanguageContext";
import { ButtonLink } from "@/components/ui/Button";

export function NotFoundPage() {
    const { t } = useLang();
    return (
        <section className="relative z-[2] flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
            <img src="/brand/mask.webp" alt="" aria-hidden="true" className="w-48 [animation:av-sway_7s_ease-in-out_infinite] [mask-image:linear-gradient(to_bottom,black_62%,transparent_92%)]" />
            <p className="av-flicker -mt-6 font-display text-[clamp(5rem,18vw,10rem)] font-bold leading-none text-blood">404</p>
            <h1 className="mt-4 font-display text-3xl">{t.notFound.title}</h1>
            <p className="mt-3 text-bone-muted">{t.notFound.sub}</p>
            <ButtonLink to="/" className="mt-10">{t.notFound.back}</ButtonLink>
        </section>
    );
}
