/**
 * Всё, что относится к самой игре и не зависит от языка — ссылки, даты,
 * платформы. Меняйте здесь, а не по компонентам.
 * TODO: заменить заглушки на реальные данные игры.
 */
export const SITE = {
    name: "Alvasti",
    links: {
        steam: "https://store.steampowered.com/",
        telegram: "https://t.me/Alvasti_org",
        youtube: "https://youtube.com/",
        instagram: "https://instagram.com/",
        email: "usmonovsalokhiddin11@gmail.com",
    },
    /** YouTube video id трейлера (то, что после watch?v=). */
    trailerId: "",
    platforms: ["PC", "Steam Deck"],
    /** Автор игры — блок «Muallif» на главной. */
    author: {
        name: "Salokhiddin Usmonov",
        photo: "/images/author.webp",
        telegram: "https://t.me/salo_kh",
        telegramHandle: "@salo_kh",
        channel: "https://t.me/usmonov_salokh",
        channelHandle: "@usmonov_salokh",
    },
} as const;

export const NAV_ROUTES = [
    { to: "/", key: "home" },
    { to: "/lore", key: "lore" },
    { to: "/media", key: "media" },
    { to: "/news", key: "news" },
    { to: "/contact", key: "contact" },
] as const;

export type NavKey = (typeof NAV_ROUTES)[number]["key"];
