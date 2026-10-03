import { SectionHeading } from "./SectionHeading";

/** Шапка внутренних страниц — отступ под фиксированный Navbar + заголовок. */
export function PageHeader(props: { label: string; title: string; sub?: string }) {
    return (
        <header className="av-container relative z-[2] pt-32 sm:pt-40">
            <SectionHeading {...props} />
        </header>
    );
}
