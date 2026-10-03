/**
 * Рваный край бумаги между секциями. Форма детерминирована `seed`,
 * поэтому не «прыгает» между рендерами.
 */
export function TornEdge({ color, flip = false, seed = 1, className = "" }: { color: string; flip?: boolean; seed?: number; className?: string }) {
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const pts: string[] = ["0,40"];
    for (let x = 0; x <= 1440; x += 14 + rnd() * 26) pts.push(`${x.toFixed(0)},${(6 + rnd() * 26).toFixed(1)}`);
    pts.push("1440,40");
    return (
        <svg aria-hidden="true" viewBox="0 0 1440 40" preserveAspectRatio="none" className={`block h-6 w-full sm:h-9 ${flip ? "rotate-180" : ""} ${className}`}>
            <polygon points={pts.join(" ")} fill={color} />
        </svg>
    );
}
