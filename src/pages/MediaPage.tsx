import { SITE } from "@/config/site";
import { ALL_MEDIA } from "@/config/media";
import { useLang } from "@/i18n/LanguageContext";
import { PageHeader } from "@/components/ui/PageHeader";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { ButtonAnchor } from "@/components/ui/Button";

export function MediaPage() {
    const { t } = useLang();
    return (
        <>
            <PageHeader label={t.media.label} title={t.media.title} />
            <section className="av-section pt-0">
                <div className="av-container">
                    <ImageGallery ids={ALL_MEDIA} gridClassName="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />
                    <div className="mt-12">
                        <ButtonAnchor href={`mailto:${SITE.links.email}`} variant="ghost">{t.media.presskit}</ButtonAnchor>
                    </div>
                </div>
            </section>
        </>
    );
}
