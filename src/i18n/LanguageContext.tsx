import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { en, type Dict } from "./locales/en";
import { ru } from "./locales/ru";
import { uz } from "./locales/uz";

export type Lang = "uz" | "ru" | "en";

export const LANGS: { code: Lang; label: string }[] = [
    { code: "uz", label: "UZ" },
    { code: "ru", label: "RU" },
    { code: "en", label: "EN" },
];

const DICTS: Record<Lang, Dict> = { uz, ru, en };
const STORAGE_KEY = "alvasti_lang";

const savedLang = (): Lang => {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === "uz" || v === "ru" || v === "en") return v;
    } catch { /* storage недоступен — остаёмся на дефолте */ }
    return "uz";
};

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: Dict }

const LanguageContext = createContext<LangCtx>({ lang: "uz", setLang: () => { }, t: uz });

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLangState] = useState<Lang>(savedLang);

    useEffect(() => { document.documentElement.lang = lang; }, [lang]);

    const setLang = (l: Lang) => {
        setLangState(l);
        try { localStorage.setItem(STORAGE_KEY, l); } catch { /* */ }
    };

    return <LanguageContext.Provider value={{ lang, setLang, t: DICTS[lang] }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
