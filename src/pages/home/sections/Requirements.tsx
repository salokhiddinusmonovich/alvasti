import { useLang } from "@/i18n/LanguageContext";
import { FadeIn } from "@/components/effects/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Requirements() {
    const { t } = useLang();
    const r = t.requirements;
    return (
        <section className="av-section">
            <div className="av-container">
                <SectionHeading label={r.label} title={r.title} />
                <FadeIn className="av-card overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                        <thead className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/40">
                            <tr className="border-b border-bone/10">
                                <th className="p-5" />
                                <th className="p-5">{r.min}</th>
                                <th className="p-5 text-blood-light">{r.rec}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {r.rows.map((row) => (
                                <tr key={row.k} className="border-b border-bone/5 last:border-0">
                                    <th scope="row" className="p-5 font-mono text-[11px] uppercase tracking-widest text-bone/50">{row.k}</th>
                                    <td className="p-5 text-bone-muted">{row.min}</td>
                                    <td className="p-5">{row.rec}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </FadeIn>
            </div>
        </section>
    );
}
