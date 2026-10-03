import { useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

/**
 * Перемонтирует контент страницы по pathname и проигрывает fade-in при
 * навигации внутри приложения. Первый рендер пропускается — при жёсткой
 * загрузке анимировать не из чего. Только opacity: transform на этой обёртке
 * сломал бы position:fixed у модалок внутри страниц. CSS — в styles/global.css.
 */
export function PageTransition({ children }: { children: ReactNode }) {
    const location = useLocation();
    const isFirstRender = useRef(true);
    const skipAnimation = isFirstRender.current;
    isFirstRender.current = false;

    return (
        <div key={location.pathname} className={skipAnimation ? undefined : "av-page-in"}>
            {children}
        </div>
    );
}
