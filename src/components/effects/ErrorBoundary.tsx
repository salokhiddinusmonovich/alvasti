import { Component, type ReactNode } from "react";

interface Props {
    children: ReactNode;
    /** Rendered in place of a crashed subtree. Receives a retry callback that resets the boundary. */
    fallback: (retry: () => void) => ReactNode;
    /** Called when a crash is caught — e.g. to log it, or to reset upstream state (close the modal). */
    onError?: (error: unknown) => void;
}

interface State {
    hasError: boolean;
}

/**
 * Without this, a render crash anywhere in `children` — e.g. one post's data
 * being shaped unexpectedly — takes the whole app down to a blank white/black
 * screen with no message, which reads as "the site is just broken" with no
 * way to recover short of a hard reload. This catches it and shows `fallback`
 * instead, scoped to just the subtree that crashed.
 */
export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback(() => this.setState({ hasError: false }));
        }
        return this.props.children;
    }
}
