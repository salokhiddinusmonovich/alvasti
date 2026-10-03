import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { SITE } from "@/config/site";
import { useLang } from "@/i18n/LanguageContext";
import { gsap } from "@/lib/motion";
import { TelegramIcon } from "@/components/ui/Icons";

/**
 * Автор игры: чёрно-белое фото как полароид на скотче, подпись от руки,
 * ссылки на личный Telegram и канал. Фото «проявляется», как снимок.
 */
export function Author() {
    const { t } = useLang();
    const a = SITE.author;
    const root = useRef<HTMLElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 70%" } });
        tl.from(".author-photo", { y: -100, rotate: -16, opacity: 0, duration: 1.2, ease: "back.out(1.3)" })
            .fromTo(".author-img", { filter: "brightness(3) contrast(.3) blur(6px)" }, { filter: "brightness(1) contrast(1.05) blur(0px)", duration: 2.2, ease: "power2.out" }, "-=0.6")
            .from(".author-fade", { opacity: 0, y: 20, stagger: 0.12, duration: 0.8 }, "-=1.8");
        gsap.to(".author-photo", { yPercent: -8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
    }, { scope: root });

    return (
        <section ref={root} className="relative z-[2] overflow-x-hidden py-24 sm:py-32">
            <div className="av-container grid items-center gap-14 md:grid-cols-[minmax(0,380px)_1fr] md:gap-20">
                <figure className="author-photo relative mx-auto w-[82%] max-w-[340px] rotate-[-3deg] md:w-full bg-[#ece8e1] p-3 pb-16 shadow-[0_40px_80px_-25px_rgba(0,0,0,.95)]">
                    <span aria-hidden="true" className="absolute -top-4 left-1/2 h-9 w-28 -translate-x-1/2 rotate-[3deg] bg-[#e8dcb8]/75" />
                    <img src={a.photo} alt={a.name} loading="lazy" className="author-img aspect-[4/5] w-full object-cover" />
                    <figcaption className="absolute inset-x-0 bottom-3 text-center font-hand text-3xl text-[#241812]">{a.telegramHandle}</figcaption>
                    {/* красная нить от фото */}
                    <svg aria-hidden="true" className="absolute -right-8 top-6 h-44 w-12" viewBox="0 0 40 170">
                        <path d="M6 0 C 30 40, 4 80, 24 120 S 20 150, 22 158" fill="none" stroke="#b3261e" strokeWidth="3" strokeLinecap="round" className="origin-top [animation:av-thread_6s_ease-in-out_infinite]" />
                        <circle cx="22" cy="161" r="6.5" fill="#8e1a14" className="origin-top [animation:av-thread_6s_ease-in-out_infinite]" />
                    </svg>
                </figure>

                <div>
                    <p className="author-fade av-kicker mb-3">{t.author.label}</p>
                    <h2 className="author-fade av-heading">{a.name}</h2>
                    <p className="author-fade mt-3 font-hand text-3xl text-blood-light">{t.author.role}</p>
                    <p className="author-fade mt-6 max-w-xl text-lg leading-relaxed text-bone/75">{t.author.text}</p>
                    <div className="author-fade mt-9 flex flex-wrap gap-4">
                        <AuthorLink href={a.telegram} label={t.author.write} handle={a.telegramHandle} />
                        <AuthorLink href={a.channel} label={t.author.channel} handle={a.channelHandle} />
                    </div>
                </div>
            </div>
        </section>
    );
}

function AuthorLink({ href, label, handle }: { href: string; label: string; handle: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 border border-bone/15 px-5 py-3.5 transition-colors hover:border-blood-light hover:bg-blood/10">
            <TelegramIcon width={22} height={22} className="text-blood-light transition-transform group-hover:-rotate-12" />
            <span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-bone/45">{label}</span>
                <span className="block text-bone">{handle}</span>
            </span>
        </a>
    );
}
