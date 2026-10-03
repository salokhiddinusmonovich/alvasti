/**
 * Звуки скримеров, синтезированные Web Audio — без отдельных файлов.
 * Работают только после первого жеста пользователя (политика браузеров);
 * если AudioContext недоступен, функции молча ничего не делают.
 */
let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
    try {
        ctx ??= new AudioContext();
        if (ctx.state === "suspended") void ctx.resume();
        return ctx;
    } catch {
        return null;
    }
}

function noise(c: AudioContext, sec: number) {
    const buf = c.createBuffer(1, Math.ceil(c.sampleRate * sec), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    return src;
}

/** Шёпот: полосовой шум «слогами», проходит слева направо. */
export function whisper(dur = 1.8) {
    const c = ac(); if (!c) return;
    const t = c.currentTime, src = noise(c, dur);
    const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 2400; bp.Q.value = 0.9;
    const g = c.createGain(); g.gain.setValueAtTime(0, t);
    const n = 7;
    for (let i = 0; i < n; i++) {
        const s = t + (i * dur) / n;
        g.gain.linearRampToValueAtTime(0.12 + Math.random() * 0.12, s + 0.07);
        g.gain.linearRampToValueAtTime(0.02, s + dur / n);
    }
    g.gain.linearRampToValueAtTime(0, t + dur);
    const pan = c.createStereoPanner(); pan.pan.setValueAtTime(0.9, t); pan.pan.linearRampToValueAtTime(-0.7, t + dur);
    src.connect(bp).connect(g).connect(pan).connect(c.destination);
    src.start(t); src.stop(t + dur);
}

/** Резкий визг-удар для момента «в лицо». */
export function sting() {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const src = noise(c, 0.7);
    const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
    const g = c.createGain(); g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
    src.connect(hp).connect(g).connect(c.destination); src.start(t); src.stop(t + 0.7);
    for (const f of [880, 932]) {
        const o = c.createOscillator(); o.type = "sawtooth";
        o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(90, t + 0.7);
        const og = c.createGain(); og.gain.setValueAtTime(0.09, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
        o.connect(og).connect(c.destination); o.start(t); o.stop(t + 0.72);
    }
}

/** Глухой удар — когда гаснет свет. */
export function thump() {
    const c = ac(); if (!c) return;
    const t = c.currentTime;
    const o = c.createOscillator(); o.type = "sine";
    o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.5);
    const g = c.createGain(); g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.62);
}
