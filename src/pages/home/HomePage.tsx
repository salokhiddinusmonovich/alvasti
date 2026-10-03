import { Hero } from "./sections/Hero";
import { Story } from "./sections/Story";
import { Rules } from "./sections/Rules";
import { Dossier } from "./sections/Dossier";
import { House } from "./sections/House";
import { FilmStrip } from "./sections/FilmStrip";
import { Author } from "./sections/Author";
import { Trailer } from "./sections/Trailer";
import { Requirements } from "./sections/Requirements";
import { WishlistCta } from "./sections/WishlistCta";
import { Footprints } from "@/components/motion/Footprints";

/**
 * Главная рассказывает одну ночь: фонарь → история → правила бабушки →
 * её следы → кто есть кто → дом → кадры → автор → трейлер → «не впускай её».
 */
export function HomePage() {
    return (
        <>
            <Hero />
            <Story />
            <Rules />
            <Footprints />
            <Dossier />
            <House />
            <FilmStrip />
            <Author />
            <Trailer />
            <Requirements />
            <WishlistCta />
        </>
    );
}
