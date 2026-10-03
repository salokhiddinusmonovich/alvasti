import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SITE } from "@/config/site";
import { useLang } from "@/i18n/LanguageContext";
import { SteamIcon } from "@/components/ui/Icons";
import { NavLinks } from "./NavLinks";
import { LangSwitcher } from "./LangSwitcher";
import { MobileMenu } from "./MobileMenu";
import { SoundToggle } from "@/components/audio/SoundToggle";

export function Navbar() {
    const { t } = useLang();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => setOpen(false), [pathname]);

    return (
        <header
            className={`fixed inset-x-0 top-0 z-[1000] transition-[background,border-color] duration-300 ${scrolled || open ? "border-b border-bone/10 bg-night/85 backdrop-blur-xl" : "border-b border-transparent"}`}
            style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
            <div className="av-container flex h-16 items-center justify-between gap-6">
                <Link to="/" className="av-flicker flex items-center gap-3" aria-label={SITE.name}>
                    <img src="/brand/mask-icon.webp" alt="" className="h-9 w-9 rounded-full ring-1 ring-blood/40" />
                    <img src="/brand/wordmark.svg" alt={SITE.name} className="hidden h-9 sm:block" />
                </Link>

                <NavLinks />

                <div className="hidden items-center gap-4 lg:flex">
                    <SoundToggle />
                    <LangSwitcher />
                    <a
                        href={SITE.links.steam}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-blood px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-bone transition hover:brightness-110"
                    >
                        <SteamIcon width={14} height={14} /> {t.nav.wishlist}
                    </a>
                </div>

                <div className="flex items-center gap-2 lg:hidden">
                <SoundToggle />
                <button
                    type="button"
                    className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-label="Menu"
                >
                    <span className={`h-px w-6 bg-bone transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
                    <span className={`h-px w-6 bg-bone transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
                </button>
                </div>
            </div>

            <MobileMenu open={open} onClose={() => setOpen(false)} />
        </header>
    );
}
