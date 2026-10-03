import { Link } from "react-router-dom";
import { NAV_ROUTES, SITE } from "@/config/site";
import { useLang } from "@/i18n/LanguageContext";

const SOCIALS = [
    { label: "Steam", href: SITE.links.steam },
    { label: "Telegram", href: SITE.links.telegram },
    { label: "YouTube", href: SITE.links.youtube },
    { label: "Instagram", href: SITE.links.instagram },
];

export function Footer() {
    const { t } = useLang();
    return (
        <footer className="relative z-[2] border-t border-bone/10 bg-night-900/80">
            <div className="av-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                    <img src="/brand/wordmark.svg" alt={SITE.name} className="-ml-4 h-16" />
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-bone-muted">{t.footer.tagline}</p>
                </div>
                <ul className="space-y-2.5">
                    {NAV_ROUTES.map(({ to, key }) => (
                        <li key={to}>
                            <Link to={to} className="text-sm text-bone/60 transition-colors hover:text-blood-light">{t.nav[key]}</Link>
                        </li>
                    ))}
                </ul>
                <ul className="space-y-2.5">
                    {SOCIALS.map((s) => (
                        <li key={s.label}>
                            <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-sm text-bone/60 transition-colors hover:text-blood-light">{s.label}</a>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="av-container flex flex-col justify-between gap-2 border-t border-bone/5 py-6 font-mono text-[10px] uppercase tracking-widest text-bone/30 sm:flex-row">
                <span>© {new Date().getFullYear()} {SITE.name}. {t.footer.rights}</span>
                <span>{SITE.platforms.join(" · ")}</span>
            </div>
        </footer>
    );
}
