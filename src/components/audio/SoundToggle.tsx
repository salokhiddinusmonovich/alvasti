import { useLang } from "@/i18n/LanguageContext";
import { useMusic } from "./MusicContext";

/** Кнопка звука: «эквалайзер» из трёх полосок, которые двигаются, пока играет музыка. */
export function SoundToggle({ className = "" }: { className?: string }) {
    const { playing, toggle } = useMusic();
    const { t } = useLang();
    const label = playing ? t.nav.soundOff : t.nav.soundOn;

    return (
        <button
            type="button"
            data-sound-toggle
            onClick={toggle}
            aria-label={label}
            aria-pressed={playing}
            title={label}
            className={`flex h-9 w-9 items-end justify-center gap-[3px] rounded-lg border border-bone/10 bg-bone/5 pb-[9px] transition-colors hover:border-blood-light ${className}`}
        >
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className={`w-[3px] rounded-full ${playing ? "bg-blood-light" : "bg-bone/40"}`}
                    style={playing ? { height: 14, animation: `av-eq .9s ease-in-out ${i * 0.18}s infinite alternate` } : { height: 3 }}
                />
            ))}
        </button>
    );
}
