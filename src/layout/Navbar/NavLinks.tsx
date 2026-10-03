import { NavLink } from "react-router-dom";
import { NAV_ROUTES } from "@/config/site";
import { useLang } from "@/i18n/LanguageContext";

/** Список пунктов меню — общий для десктопа и мобильного меню. */
export function NavLinks({ vertical = false, onNavigate }: { vertical?: boolean; onNavigate?: () => void }) {
    const { t } = useLang();
    return (
        <nav className={vertical ? "flex flex-col gap-1" : "hidden items-center gap-7 lg:flex"}>
            {NAV_ROUTES.map(({ to, key }) => (
                <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                        vertical
                            ? `rounded-lg px-4 py-3 font-display text-2xl ${isActive ? "bg-blood/15 text-blood-light" : "text-bone"}`
                            : `relative font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-blood-light after:transition-all ${isActive ? "text-bone after:w-full" : "text-bone/50 after:w-0 hover:text-bone hover:after:w-full"}`
                    }
                >
                    {t.nav[key]}
                </NavLink>
            ))}
        </nav>
    );
}
