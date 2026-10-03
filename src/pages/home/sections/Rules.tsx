import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { useLang } from "@/i18n/LanguageContext";
import { gsap } from "@/lib/motion";
import { TornEdge } from "@/components/ui/TornEdge";

const PAPER = "#d9c6a2";
/** Правило, которое мальчик нарушил: зачёркнуто, рядом его приписка. */
const BROKEN = 0;

/**
 * «Правила бабушки» — единственная светлая секция: лист крафт-бумаги
 * с линовкой, рукописный текст пишется строка за строкой при прокрутке.
 */
export function Rules() {
    const { t } = useLang();
    const root = useRef<HTMLElement>(null);

    useGSAP(() => {
        const st = { trigger: ".rules-sheet", start: "top 75%" };
        gsap.from(".rules-sheet", { rotate: -4, y: 80, opacity: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 80%" } });
        gsap.fromTo(".rules-title", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 1.4, ease: "power2.inOut", scrollTrigger: st });
        gsap.utils.toArray<HTMLElement>(".rules-item").forEach((el, i) => {
            gsap.fromTo(el, { clipPath: "inset(-20% 100% -20% 0)" }, {
                clipPath: "inset(-20% 0% -20% 0)", duration: 1.1, ease: "power1.inOut",
                scrollTrigger: { trigger: el, start: "top 85%" }, delay: i * 0.05,
            });
        });
        const strike = root.current!.querySelector(".rules-strike");
        if (strike) {
            const tl = gsap.timeline({ scrollTrigger: { trigger: strike, start: "top 70%" } });
            tl.fromTo(strike, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.in", delay: 0.9 })
                .from(".rules-note", { opacity: 0, scale: 0.6, rotate: -20, duration: 0.6, ease: "back.out(3)" });
        }
        gsap.from(".rules-sign", { opacity: 0, x: 30, duration: 1, scrollTrigger: { trigger: ".rules-sign", start: "top 90%" } });
    }, { scope: root });

    return (
        <section ref={root} className="relative z-[2] py-16 sm:py-24">
            <div className="rules-sheet relative mx-auto max-w-3xl px-4 [transform:rotate(-1deg)]">
                <TornEdge color={PAPER} seed={3} />
                <div
                    className="relative px-6 pb-14 pt-8 text-[#2a1c12] sm:px-14"
                    style={{
                        background: `${PAPER} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.04 .6' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .12 0 0 0 .35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                        boxShadow: "0 40px 80px -30px rgba(0,0,0,.9)",
                    }}
                >
                    {/* линовка тетради */}
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(transparent_0_51px,rgba(60,90,140,.18)_51px_52px)] [background-position:0_118px]" />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-10 w-px bg-blood/35 sm:left-24" />
                    {/* пятно от чая */}
                    <div aria-hidden="true" className="pointer-events-none absolute -right-6 top-10 h-40 w-40 rounded-full border-[6px] border-[#8a5a2b]/15 blur-[1px]" />

                    <h2 className="rules-title relative font-hand text-5xl sm:text-6xl">{t.rules.title}</h2>
                    <ol className="relative mt-6 space-y-[19px] pl-6 sm:pl-14">
                        {t.rules.items.map((rule, i) => (
                            <li key={i} className="relative font-hand text-[26px] leading-[33px] sm:text-[30px]">
                                {/* clip-path «пишет» строку; приписку держим вне него, чтобы её не обрезало */}
                                <span className="rules-item inline-block">
                                    <span className="mr-3 text-blood">{i + 1}.</span>
                                    <span className="relative">
                                        {rule}
                                        {i === BROKEN && <span aria-hidden="true" className="rules-strike absolute left-0 right-0 top-1/2 h-[3px] origin-left -rotate-1 bg-[#2a1c12]" />}
                                    </span>
                                </span>
                                {i === BROKEN && <span className="rules-note ml-4 inline-block rotate-[-8deg] text-[28px] text-blood">{t.rules.note}</span>}
                            </li>
                        ))}
                    </ol>
                    <p className="rules-sign relative mt-10 text-right font-hand text-3xl">{t.rules.sign}</p>
                </div>
                <TornEdge color={PAPER} seed={7} flip />
                {/* красная нить, привязанная к листу */}
                <svg aria-hidden="true" className="absolute -top-6 right-16 h-40 w-16" viewBox="0 0 60 160">
                    <path d="M30 0 C 18 40, 44 70, 28 110 S 34 140, 32 150" fill="none" stroke="#b3261e" strokeWidth="3" strokeLinecap="round" className="origin-top [animation:av-thread_5s_ease-in-out_infinite]" />
                    <circle cx="32" cy="152" r="7" fill="#8e1a14" className="origin-top [animation:av-thread_5s_ease-in-out_infinite]" />
                </svg>
            </div>
        </section>
    );
}
