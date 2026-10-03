import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "lenis/dist/lenis.css";
import "./styles/global.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("app")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
