// Главный символ Alvasti — пришитая маска. Генератор SVG (v2, детальнее).
// Запуск: node brand/generate-mask.mjs <outDir>  → alvasti-mask*.svg
import fs from "fs";

const OUT = process.argv[2] || "./mask";
fs.mkdirSync(OUT, { recursive: true });

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const jit = (a) => (rnd() - 0.5) * 2 * a;
const f = (n) => +n.toFixed(1);
const KRAFT = [218, 194, 154];
const rgb = (c) => `rgb(${c.map((v) => Math.round(Math.max(0, Math.min(255, v)))).join(",")})`;
const RED = "#b3261e", RED_DARK = "#6e1410", RED_LIGHT = "#e0483c";

const cx = 512, cy = 470, rx = 168, ry = 218;
const edge = (t, s = 1) => {
    const w = 1 + 0.07 * -Math.sin(t) - 0.04 * Math.max(0, Math.sin(t)) ** 3; // шире лоб, уже подбородок
    return [cx + rx * s * w * Math.cos(t), cy + ry * s * Math.sin(t)];
};
const g2 = (u, v, u0, v0, su, sv) => Math.exp(-(((u - u0) / su) ** 2) - (((v - v0) / sv) ** 2));

/** Рельеф лица (u,v — нормированные координаты, v вниз). */
function height(x, y) {
    const u = (x - cx) / rx, v = (y - cy) / ry, au = Math.abs(u);
    let z = Math.sqrt(Math.max(0, 1 - u * u * 0.95 - v * v)) * 150;
    z += 60 * Math.exp(-((u / 0.09) ** 2)) * g2(0, v, 0, 0.16, 1, 0.26);   // спинка носа
    z += 22 * g2(au, v, 0.1, 0.3, 0.07, 0.06);                               // крылья носа
    z -= 44 * g2(au, v, 0.39, -0.04, 0.17, 0.1);                             // глазницы
    z += 10 * g2(au, v, 0.39, -0.06, 0.12, 0.035);                           // веко
    z += 22 * g2(au, v, 0.33, -0.22, 0.3, 0.06);                             // надбровье
    z += 20 * g2(au, v, 0.5, 0.2, 0.16, 0.13);                               // скулы
    z -= 16 * g2(au, v, 0.32, 0.12, 0.08, 0.1);                              // мешки под глазами
    z -= 13 * Math.exp(-(((au - 0.2 - (v - 0.32) * 0.35) / 0.035) ** 2)) * g2(0, v, 0, 0.42, 1, 0.14); // носогубные складки
    z += 9 * g2(u, v, 0, 0.53, 0.22, 0.035);                                 // верхняя губа
    z -= 12 * g2(u, v, 0, 0.585, 0.24, 0.025);                               // линия рта
    z += 14 * g2(u, v, 0, 0.8, 0.22, 0.08);                                  // подбородок
    z -= 10 * g2(au, v, 0.72, -0.15, 0.1, 0.2);                              // виски
    return z;
}

/** Треугольник → цвет по нормали (свет сверху-слева + тёплый подсвет снизу). */
function triColor(p) {
    const P = p.map(([x, y]) => [x, y, height(x, y)]);
    const a = P[1].map((v, i) => v - P[0][i]), b = P[2].map((v, i) => v - P[0][i]);
    let n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    if (n[2] < 0) n = n.map((c) => -c);
    const len = Math.hypot(...n); n = n.map((c) => c / len);
    const dot = (l) => { const L = Math.hypot(...l); return Math.max(0, (n[0] * l[0] + n[1] * l[1] + n[2] * l[2]) / L); };
    const key = dot([-0.55, -0.65, 0.8]), rim = dot([0.6, 0.5, 0.25]);
    const s = 0.36 + 0.7 * key + jit(0.025);
    return rgb([KRAFT[0] * s + 70 * rim, KRAFT[1] * s + 20 * rim, KRAFT[2] * s + 12 * rim]);
}

/** Сетка из колец + треугольники между соседними кольцами. */
function faceMesh() {
    const K = 11, rings = [[[cx, cy + 10, 0]]];
    for (let k = 1; k <= K; k++) {
        const n = 6 * k + 3, s = k / K, off = rnd();
        const ring = [];
        for (let i = 0; i < n; i++) {
            const t = ((i + off + (k < K ? jit(0.3) : 0)) / n) * Math.PI * 2;
            const [x, y] = edge(t, k < K ? s * (1 + jit(0.035)) : 1);
            ring.push([x, y, ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)]);
        }
        ring.sort((p, q) => p[2] - q[2]);
        rings.push(ring);
    }
    const tris = [];
    for (let k = 1; k <= K; k++) {
        const A = rings[k - 1], B = rings[k];
        if (A.length === 1) { B.forEach((_, i) => tris.push([A[0], B[i], B[(i + 1) % B.length]])); continue; }
        const ang = (r, i) => r[i % r.length][2] + Math.floor(i / r.length) * 2 * Math.PI;
        let i = 0, j = 0;
        while (i < A.length || j < B.length) {
            if (j >= B.length || (i < A.length && ang(A, i + 1) < ang(B, j + 1))) { tris.push([A[i % A.length], A[(i + 1) % A.length], B[j % B.length]]); i++; }
            else { tris.push([A[i % A.length], B[j % B.length], B[(j + 1) % B.length]]); j++; }
        }
    }
    return tris.map((t) => {
        const c = triColor(t);
        return `<path d="M${t.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z" fill="${c}" stroke="${c}" stroke-width=".9" stroke-linejoin="round"/>`;
    }).join("");
}

/** Сужающийся мазок вдоль квадратичной кривой — «вырезанная из бумаги» морщина/бровь. */
function taper(x1, y1, qx, qy, x2, y2, w, fill, op = 1) {
    const pts = [], N = 14;
    for (let i = 0; i <= N; i++) {
        const t = i / N, m = 1 - t;
        const x = m * m * x1 + 2 * m * t * qx + t * t * x2, y = m * m * y1 + 2 * m * t * qy + t * t * y2;
        const dx = 2 * m * (qx - x1) + 2 * t * (x2 - qx), dy = 2 * m * (qy - y1) + 2 * t * (y2 - qy);
        const L = Math.hypot(dx, dy) || 1, ww = w * Math.sin(Math.PI * Math.min(0.98, Math.max(0.02, t))) ** 0.7;
        pts.push([x, y, (-dy / L) * ww / 2, (dx / L) * ww / 2]);
    }
    const a = pts.map(([x, y, nx, ny]) => `${f(x + nx)} ${f(y + ny)}`), b = pts.reverse().map(([x, y, nx, ny]) => `${f(x - nx)} ${f(y - ny)}`);
    return `<path d="M${a.join("L")}L${b.join("L")}Z" fill="${fill}" opacity="${op}"/>`;
}

function features() {
    const ink = "#2e2018", soft = "#5a4130", brow = "#a59d92";
    let s = "";
    for (const d of [-1, 1]) {
        const ex = cx + d * 66, ey = cy - 10;
        // глаз: тёмная щель + тяжёлое верхнее веко + складка
        s += `<path d="M${ex - 34 * d} ${ey + 2} Q${ex} ${ey - 11} ${ex + 36 * d} ${ey - 1} Q${ex + 4 * d} ${ey + 8} ${ex - 34 * d} ${ey + 2}Z" fill="#120b09"/>`;
        s += taper(ex - 40 * d, ey + 2, ex - 2 * d, ey - 17, ex + 42 * d, ey - 2, 7, ink);
        s += taper(ex - 30 * d, ey - 12, ex + 2 * d, ey - 30, ex + 36 * d, ey - 15, 3.2, soft, 0.55);
        s += taper(ex - 26 * d, ey + 14, ex + 2 * d, ey + 24, ex + 30 * d, ey + 12, 3.2, soft, 0.5);
        s += taper(ex - 18 * d, ey + 28, ex + 4 * d, ey + 36, ex + 26 * d, ey + 26, 2.4, soft, 0.35);
        // гусиные лапки
        for (const k of [-1, 0, 1]) s += taper(ex + 44 * d, ey + k * 7, ex + 54 * d, ey + k * 10, ex + 64 * d, ey + k * 15, 2.4, soft, 0.4);
        // брови — бумажные полоски
        s += taper(ex - 42 * d, ey - 42, ex - 2 * d, ey - 64, ex + 44 * d, ey - 44, 12, brow, 0.95);
        // ноздри
        s += taper(cx + d * 4, cy + 74, cx + d * 22, cy + 84, cx + d * 22, cy + 68, 4, ink);
        // носогубная складка
        s += taper(cx + d * 30, cy + 64, cx + d * 50, cy + 100, cx + d * 46, cy + 140, 3.4, soft, 0.55);
        // уголки рта вниз
        s += taper(cx + d * 40, cy + 128, cx + d * 48, cy + 134, cx + d * 50, cy + 146, 3, soft, 0.6);
    }
    s += taper(cx - 46, cy + 127, cx, cy + 135, cx + 46, cy + 127, 6, ink);
    s += taper(cx - 26, cy + 146, cx, cy + 152, cx + 26, cy + 146, 3, soft, 0.4);
    s += taper(cx - 16, cy + 176, cx, cy + 182, cx + 16, cy + 176, 3, soft, 0.3);
    for (const [y, w, o] of [[-122, 66, 0.4], [-106, 86, 0.45], [-90, 70, 0.35], [-138, 44, 0.25]]) s += taper(cx - w, cy + y + 3, cx, cy + y - 9, cx + w, cy + y + 3, 3.4, soft, o);
    s += taper(cx - 8, cy - 70, cx - 4, cy - 58, cx - 6, cy - 46, 2.4, soft, 0.35);
    s += taper(cx + 8, cy - 70, cx + 4, cy - 58, cx + 6, cy - 46, 2.4, soft, 0.35);
    return s;
}

/** Стежок: проколы + нить с объёмом. */
function stitch(x1, y1, x2, y2) {
    let s = "";
    for (const [x, y] of [[x1, y1], [x2, y2]]) s += `<circle cx="${f(x)}" cy="${f(y)}" r="4.2" fill="#1a0e0b" opacity=".75"/>`;
    s += `<line x1="${f(x1 + 1.5)}" y1="${f(y1 + 3.5)}" x2="${f(x2 + 1.5)}" y2="${f(y2 + 3.5)}" stroke="#000" stroke-opacity=".5" stroke-width="7.5" stroke-linecap="round"/>`;
    s += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${RED}" stroke-width="6.5" stroke-linecap="round"/>`;
    s += `<line x1="${f(x1 + (x2 - x1) * 0.15)}" y1="${f(y1 + (y2 - y1) * 0.15 - 1.4)}" x2="${f(x1 + (x2 - x1) * 0.7)}" y2="${f(y1 + (y2 - y1) * 0.7 - 1.4)}" stroke="${RED_LIGHT}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`;
    return s;
}

function bead(x, y, r) {
    return `<circle cx="${f(x + 2)}" cy="${f(y + 4)}" r="${r}" fill="#000" opacity=".45"/><circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="url(#bead)"/>`;
}
function thread(pts, beads, w = 4) {
    const d = `M${pts[0].join(" ")} C${pts.slice(1).map((p) => p.join(" ")).join(" ")}`;
    let s = `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="${w + 1.5}" stroke-linecap="round" transform="translate(2 4)"/>`;
    s += `<path d="${d}" fill="none" stroke="${RED}" stroke-width="${w}" stroke-linecap="round"/>`;
    return s + beads.map(([x, y, r]) => bead(x, y, r)).join("");
}

function stitchesAndThreads() {
    let s = "";
    const N = 30;
    for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 2 + 0.04 + jit(0.02);
        const len = 0.065 + jit(0.012), tilt = jit(0.035);
        const [x1, y1] = edge(t - tilt, 1 - len), [x2, y2] = edge(t + tilt, 1 + len);
        s += stitch(x1, y1, x2, y2);
    }
    const hang = (t, dy, sway, beads) => {
        const [x, y] = edge(t, 1.065);
        return thread([[f(x), f(y)], [f(x + sway), f(y + dy * 0.35)], [f(x - sway * 0.6), f(y + dy * 0.7)], [f(x + sway * 0.2), f(y + dy)]],
            beads.map(([k, r]) => [x + sway * 0.2 * k, y + dy * k + (k === 1 ? r * 0.7 : 0), r]));
    };
    s += hang(Math.PI * 0.69, 185, -14, [[0.55, 9], [1, 11]]);
    s += hang(Math.PI * 0.5, 120, 8, [[1, 9]]);
    s += hang(Math.PI * 0.31, 160, 12, [[1, 11]]);
    return s;
}

function hair() {
    const hood = `M${cx - rx - 64} ${cy - 20} A${rx + 64} ${ry + 62} 0 0 1 ${cx + rx + 64} ${cy - 20} L${cx + rx + 104} 1120 L${cx - rx - 104} 1120 Z`;
    let strips = "";
    for (let x = cx - rx - 115; x <= cx + rx + 115; x += 13 + rnd() * 8) {
        const side = Math.abs(x - cx) > rx - 30;
        const bottom = side ? 905 + jit(75) : cy + 130;
        const w = 14 + rnd() * 12, a = jit(1.4) + (x - cx) * 0.012, top = cy - ry - 150;
        const tone = rnd() ** 1.7;
        const c = rgb([18 + tone * 26, 14 + tone * 20, 15 + tone * 21]);
        strips += `<g transform="rotate(${f(a)} ${f(x)} ${top})"><path d="M${f(x)} ${top} L${f(x + w)} ${top} L${f(x + w + jit(5))} ${f(bottom)} L${f(x + w / 2)} ${f(bottom + 12 + rnd() * 18)} L${f(x + jit(5))} ${f(bottom)} Z" fill="${c}" stroke="#090607" stroke-width="1.6"/>`;
        if (rnd() < 0.45) strips += `<line x1="${f(x + 2.5)}" y1="${top}" x2="${f(x + 2.5)}" y2="${f(bottom - 10)}" stroke="#4a3f41" stroke-width="1.1" opacity="${f(0.25 + rnd() * 0.4)}"/>`;
        strips += `</g>`;
    }
    return `<clipPath id="hood"><path d="${hood}"/></clipPath><g clip-path="url(#hood)">${strips}<path d="${hood}" fill="url(#hairShade)"/></g>`;
}

const DEFS = `
  <radialGradient id="bg" cx="50%" cy="42%" r="66%"><stop offset="0" stop-color="#3a1715"/><stop offset=".45" stop-color="#170d0d"/><stop offset="1" stop-color="#070506"/></radialGradient>
  <radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#c0392b" stop-opacity=".38"/><stop offset="1" stop-color="#c0392b" stop-opacity="0"/></radialGradient>
  <radialGradient id="bead" cx="35%" cy="32%" r="70%"><stop offset="0" stop-color="#f06a5c"/><stop offset=".35" stop-color="#b3261e"/><stop offset="1" stop-color="#4a0b08"/></radialGradient>
  <linearGradient id="hairShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".05"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#070506" stop-opacity=".95"/></linearGradient>
  <radialGradient id="faceVignette" cx="45%" cy="38%" r="65%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0d08" stop-opacity=".45"/></radialGradient>
  <filter id="paperShadow" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity=".7"/></filter>
  <filter id="fiber" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035 .9" numOctaves="3" seed="8"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .15  0 0 0 .55 -.1"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .07 0"/></filter>`;

function faceOutline() {
    let d = "";
    for (let i = 0; i <= 120; i++) { const [x, y] = edge((i / 120) * Math.PI * 2); d += `${i ? "L" : "M"}${f(x)} ${f(y)}`; }
    return d + "Z";
}

/** Собирает маску; variant: "avatar" (фон), "transparent", "icon" (крупно, только лицо). */
function build(variant) {
    seed = 11;
    const face = faceMesh(), feat = features(), st = stitchesAndThreads(), hr = hair();
    const outline = faceOutline();
    const maskGroup = `
      <g filter="url(#paperShadow)">${face}</g>
      <clipPath id="faceClip"><path d="${outline}"/></clipPath>
      <g clip-path="url(#faceClip)"><rect x="300" y="200" width="430" height="520" filter="url(#fiber)" opacity=".5"/><path d="${outline}" fill="url(#faceVignette)"/></g>
      <g>${feat}</g>${st}`;
    if (variant === "icon") {
        // крупно лицо со стежками — для favicon и мелких размеров
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="262 220 500 500" width="1024" height="1024"><defs>${DEFS}</defs>
          <rect x="262" y="220" width="500" height="500" fill="url(#bg)"/><ellipse cx="512" cy="450" rx="260" ry="280" fill="url(#halo)"/>${hr}${maskGroup}</svg>`;
    }
    const bg = variant === "avatar"
        ? `<rect width="1024" height="1024" fill="url(#bg)"/><ellipse cx="512" cy="400" rx="330" ry="360" fill="url(#halo)"/>`
        : "";
    const grain = variant === "avatar" ? `<rect width="1024" height="1024" filter="url(#grain)"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024"><defs>${DEFS}</defs>${bg}
      <g transform="translate(512 452) scale(1.22) translate(-512 -470)">${hr}${maskGroup}</g>${grain}</svg>`;
}

fs.writeFileSync(`${OUT}/alvasti-mask.svg`, build("avatar"));
fs.writeFileSync(`${OUT}/alvasti-mask-transparent.svg`, build("transparent"));
fs.writeFileSync(`${OUT}/alvasti-mask-icon.svg`, build("icon"));
console.log("ok");
