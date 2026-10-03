import { useEffect } from "react";
import { createPortal } from "react-dom";

export interface LightboxItem { src: string; caption: string }

interface LightboxProps {
    items: LightboxItem[];
    index: number | null;
    onChange: (index: number | null) => void;
    closeLabel: string;
}

/**
 * Полноэкранный просмотр картинки: Esc — закрыть, ←/→ — листать.
 * Рендерится порталом в body, чтобы никакой transform/filter у предков
 * (FadeIn, backdrop-blur) не сломал position: fixed.
 */
export function Lightbox({ items, index, onChange, closeLabel }: LightboxProps) {
    const open = index !== null;

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onChange(null);
            if (e.key === "ArrowRight") onChange((index! + 1) % items.length);
            if (e.key === "ArrowLeft") onChange((index! - 1 + items.length) % items.length);
        };
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, index, items.length, onChange]);

    if (!open) return null;
    const item = items[index];
    const nav = "absolute top-1/2 hidden -translate-y-1/2 rounded-full border border-bone/20 bg-night/70 px-4 py-3 text-xl text-bone transition hover:border-blood-light sm:block";

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={item.caption}
            className="av-page-in fixed inset-0 z-[1100] flex flex-col items-center justify-center bg-night/95 p-4 backdrop-blur-md"
            onClick={() => onChange(null)}
        >
            <button type="button" onClick={() => onChange(null)} className="absolute right-4 top-4 font-mono text-[11px] uppercase tracking-[0.2em] text-bone/60 hover:text-bone">
                {closeLabel} ✕
            </button>
            <img
                src={item.src}
                alt={item.caption}
                className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
            <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-bone/60">
                {item.caption} · {index + 1}/{items.length}
            </p>
            {items.length > 1 && (
                <>
                    <button type="button" aria-label="Previous" className={`${nav} left-4`} onClick={(e) => { e.stopPropagation(); onChange((index - 1 + items.length) % items.length); }}>←</button>
                    <button type="button" aria-label="Next" className={`${nav} right-4`} onClick={(e) => { e.stopPropagation(); onChange((index + 1) % items.length); }}>→</button>
                </>
            )}
        </div>,
        document.body,
    );
}
