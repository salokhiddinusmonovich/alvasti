import { useState } from "react";
import { SITE } from "@/config/site";
import { useLang } from "@/i18n/LanguageContext";
import { FadeIn } from "@/components/effects/FadeIn";
import { PageHeader } from "@/components/ui/PageHeader";
import { TelegramIcon } from "@/components/ui/Icons";

export function ContactPage() {
    const { t } = useLang();
    const c = t.contact;
    const [openIdx, setOpenIdx] = useState<number | null>(0);

    return (
        <>
            <PageHeader label={c.label} title={c.title} sub={c.sub} />
            <section className="av-section pt-0">
                <div className="av-container grid gap-12 lg:grid-cols-[1fr_1.4fr]">
                    <FadeIn className="space-y-4">
                        <a href={`mailto:${SITE.links.email}`} className="av-card block p-6">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">{c.email}</p>
                            <p className="mt-2 text-lg">{SITE.links.email}</p>
                        </a>
                        <a href={SITE.links.telegram} target="_blank" rel="noopener noreferrer" className="av-card flex items-center justify-between p-6">
                            <div>
                                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">{c.community}</p>
                                <p className="mt-2 text-lg">@Alvasti_org</p>
                            </div>
                            <TelegramIcon width={28} height={28} className="text-blood-light" />
                        </a>
                    </FadeIn>

                    <FadeIn delay={120}>
                        <h2 className="mb-6 font-display text-3xl font-semibold">{c.faqTitle}</h2>
                        <div className="divide-y divide-bone/10 border-y border-bone/10">
                            {c.faq.map((f, i) => {
                                const open = openIdx === i;
                                return (
                                    <div key={f.q}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenIdx(open ? null : i)}
                                            aria-expanded={open}
                                            className="flex w-full items-center justify-between gap-4 py-5 text-left font-semibold"
                                        >
                                            {f.q}
                                            <span className={`text-blood-light transition-transform ${open ? "rotate-45" : ""}`}>+</span>
                                        </button>
                                        {open && <p className="av-page-in pb-5 leading-relaxed text-bone-muted">{f.a}</p>}
                                    </div>
                                );
                            })}
                        </div>
                    </FadeIn>
                </div>
            </section>
        </>
    );
}
