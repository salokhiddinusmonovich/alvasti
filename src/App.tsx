import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { Navbar } from "@/layout/Navbar/Navbar";
import { Footer } from "@/layout/Footer/Footer";
import { HomePage } from "@/pages/home/HomePage";
import { EmberCanvas } from "@/components/effects/EmberCanvas";
import { TopProgressBar } from "@/components/effects/TopProgressBar";
import { PageTransition } from "@/components/effects/PageTransition";
import { ScrollToTop } from "@/components/effects/ScrollToTop";
import { ErrorBoundary } from "@/components/effects/ErrorBoundary";
import { ButtonLink } from "@/components/ui/Button";
import { MusicProvider } from "@/components/audio/MusicContext";
import { IntroGate } from "@/components/motion/IntroGate";
import { ThreadProgress } from "@/components/motion/ThreadProgress";
import { ScareDirector } from "@/components/motion/ScareDirector";
import { useSmoothScroll } from "@/lib/motion";

// Главная грузится сразу, остальные страницы — отдельными чанками.
const LorePage = lazy(() => import("@/pages/LorePage").then((m) => ({ default: m.LorePage })));
const MediaPage = lazy(() => import("@/pages/MediaPage").then((m) => ({ default: m.MediaPage })));
const NewsPage = lazy(() => import("@/pages/NewsPage").then((m) => ({ default: m.NewsPage })));
const ContactPage = lazy(() => import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));

/** Пустой тёмный экран, пока качается чанк страницы — без мигания спиннера. */
const RouteFallback = () => <div className="min-h-screen bg-night" />;

const CrashFallback = (retry: () => void) => (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
        <p className="font-display text-3xl">Something went wrong</p>
        <button type="button" onClick={retry} className="font-mono text-xs uppercase tracking-widest text-blood-light">Retry</button>
        <ButtonLink to="/" variant="ghost">Home</ButtonLink>
    </div>
);

export default function App() {
    useSmoothScroll();
    return (
        <BrowserRouter>
            <LanguageProvider>
            <MusicProvider>
                <IntroGate />
                <EmberCanvas count={40} />
                <ThreadProgress />
                <ScareDirector />
                <ScrollToTop />
                <TopProgressBar />
                <Navbar />
                <main className="relative">
                    <ErrorBoundary fallback={CrashFallback}>
                        <Suspense fallback={<RouteFallback />}>
                            <PageTransition>
                                <Routes>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/lore" element={<LorePage />} />
                                    <Route path="/media" element={<MediaPage />} />
                                    <Route path="/news" element={<NewsPage />} />
                                    <Route path="/contact" element={<ContactPage />} />
                                    <Route path="*" element={<NotFoundPage />} />
                                </Routes>
                            </PageTransition>
                        </Suspense>
                    </ErrorBoundary>
                </main>
                <Footer />
            </MusicProvider>
            </LanguageProvider>
        </BrowserRouter>
    );
}
