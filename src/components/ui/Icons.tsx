import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({ width: 18, height: 18, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true, ...p });

export const SteamIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M12 2a10 10 0 0 0-9.96 9.2l5.35 2.21a2.8 2.8 0 0 1 1.6-.5l2.38-3.45v-.05a3.77 3.77 0 1 1 3.77 3.77h-.09l-3.4 2.43a2.83 2.83 0 0 1-5.6.6L2.22 14.6A10 10 0 1 0 12 2Zm-4.6 15.2-1.22-.5a2.12 2.12 0 1 0 1.16-2.9l1.27.52a1.56 1.56 0 1 1-1.2 2.88Zm9.75-7.04a2.51 2.51 0 1 0-2.51 2.51 2.51 2.51 0 0 0 2.5-2.5Zm-4.4 0a1.89 1.89 0 1 1 1.89 1.89 1.89 1.89 0 0 1-1.89-1.89Z" /></svg>
);
export const TelegramIcon = (p: SVGProps<SVGSVGElement>) => (
    <svg {...base(p)}><path d="M21.9 4.3 18.7 19.4c-.2 1.1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-5 9.2-8.3c.4-.4-.1-.6-.6-.2L6.2 13 1.3 11.5c-1.1-.3-1.1-1.1.2-1.6L20.5 2.6c.9-.3 1.7.2 1.4 1.7Z" /></svg>
);
export const PlayIcon = (p: SVGProps<SVGSVGElement>) => <svg {...base(p)}><path d="M8 5v14l11-7z" /></svg>;
