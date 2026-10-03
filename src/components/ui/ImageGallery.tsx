import { useState } from "react";
import { IMAGES, type ImageId, srcSetOf } from "@/config/media";
import { useLang } from "@/i18n/LanguageContext";
import { StaggerReveal } from "@/components/effects/StaggerReveal";
import { Lightbox } from "./Lightbox";

interface ImageGalleryProps {
    ids: ImageId[];
    /** Tailwind-классы сетки. */
    gridClassName?: string;
    /** Классы для каждой плитки (соотношение сторон и т.п.). */
    tileClassName?: string;
}

/** Сетка картинок с подписями; клик открывает Lightbox по всему набору. */
export function ImageGallery({ ids, gridClassName = "grid gap-4 sm:grid-cols-2", tileClassName = "aspect-video" }: ImageGalleryProps) {
    const { t } = useLang();
    const [active, setActive] = useState<number | null>(null);
    const items = ids.map((id) => ({ src: IMAGES[id], caption: t.media.captions[id] }));

    return (
        <>
            <div className={gridClassName}>
                <StaggerReveal step={70}>
                    {items.map((it, i) => (
                        <ImageTile key={it.src} src={it.src} caption={it.caption} className={tileClassName} onOpen={() => setActive(i)} />
                    ))}
                </StaggerReveal>
            </div>
            <Lightbox items={items} index={active} onChange={setActive} closeLabel={t.media.close} />
        </>
    );
}

/** Одна плитка: картинка с лёгким зумом на hover и подписью снизу. */
export function ImageTile({ src, caption, className = "", onOpen }: { src: string; caption: string; className?: string; onOpen: () => void }) {
    return (
        <button
            type="button"
            onClick={onOpen}
            className={`group relative block w-full overflow-hidden rounded-xl border border-bone/10 bg-night-900 text-left ${className}`}
        >
            <img src={src} srcSet={srcSetOf(src)} sizes="(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw" alt={caption} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/90 to-transparent px-4 pb-3 pt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-bone/80 opacity-90 transition group-hover:opacity-100">
                {caption}
            </span>
        </button>
    );
}
