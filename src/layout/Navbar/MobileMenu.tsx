import { useEffect } from "react";
import { SITE } from "@/config/site";
import { useLang } from "@/i18n/LanguageContext";
import { SteamIcon } from "@/components/ui/Icons";
import { NavLinks } from "./NavLinks";
import { LangSwitcher } from "./LangSwitcher";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { t } = useLang();

    // Блокируем прокрутку страницы под открытым меню.
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="av-page-in h-[calc(100dvh-4rem)] overflow-y-auto border-t border-bone/10 bg-night px-4 pb-10 pt-6 lg:hidden">
            <NavLinks vertical onNavigate={onClose} />
            <div className="mt-8 flex flex-col gap-4 px-4">
                <LangSwitcher />
                <a
                    href={SITE.links.steam}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blood px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-bone"
                >
                    <SteamIcon width={16} height={16} /> {t.nav.wishlist}
                </a>
            </div>
        </div>
    );
}
