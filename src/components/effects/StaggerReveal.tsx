import { Children, isValidElement } from "react";
import { FadeIn } from "./FadeIn";

interface StaggerRevealProps {
    children: React.ReactNode;
    /** Delay step between siblings, in ms. */
    step?: number;
    direction?: "up" | "left" | "right" | "none";
}

/**
 * Wraps each direct child in a FadeIn with an incrementing delay, so a grid
 * or list reveals card-by-card as it scrolls into view instead of all at once.
 * Doesn't add any wrapper element around the list itself — only around each item.
 */
export function StaggerReveal({ children, step = 90, direction = "up" }: StaggerRevealProps) {
    return (
        <>
            {Children.map(children, (child, i) =>
                isValidElement(child) ? (
                    <FadeIn key={child.key ?? i} delay={i * step} direction={direction}>
                        {child}
                    </FadeIn>
                ) : (
                    child
                )
            )}
        </>
    );
}
