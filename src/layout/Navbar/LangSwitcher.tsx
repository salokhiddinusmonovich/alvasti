import { LANGS, useLang } from "@/i18n/LanguageContext";

export function LangSwitcher() {
    const { lang, setLang } = useLang();
    return (
        <div className="flex items-center gap-0.5 rounded-lg border border-bone/10 bg-bone/5 p-[3px]" role="group" aria-label="Language">
            {LANGS.map(({ code, label }) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                    className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest transition-colors ${lang === code ? "bg-blood text-bone" : "text-bone/45 hover:text-bone"}`}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
