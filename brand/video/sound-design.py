"""
Звук для видео-заставки Alvasti (синтез, без сэмплов).
Использование: python3 sound-design.py labels.json out.wav [длительность_с]
labels.json — {"dur": ..., "labels": {"click":..,"beat":..,"dark":..,"closer":..,"title":..,"end":..}}
"""
import json, sys
import numpy as np

SR = 48000
info = json.load(open(sys.argv[1]))
L = info["labels"]
TOTAL = float(sys.argv[3]) if len(sys.argv) > 3 else info["dur"] + 2.5
N = int(SR * TOTAL)
rng = np.random.default_rng(7)
mix = np.zeros((N, 2))


def t_arr(sec):
    return np.arange(int(SR * sec)) / SR


def bandpass_fft(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    if sig.ndim == 1:
        mix[i:i + len(sig), 0] += sig * gain * l * 1.414
        mix[i:i + len(sig), 1] += sig * gain * r * 1.414
    else:
        mix[i:i + len(sig)] += sig * gain


def env(n, attack, release):
    e = np.ones(n)
    a, r = int(attack * SR), int(release * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[-r:] *= np.exp(-np.linspace(0, 6, r))
    return e


# ── гул комнаты: два низких тона в диссонансе + «воздух»
dur_drone = L["dark"]
t = t_arr(dur_drone)
drone = 0.5 * np.sin(2 * np.pi * 41 * t) + 0.35 * np.sin(2 * np.pi * 58.3 * t + 1) + 0.15 * np.sin(2 * np.pi * 82 * t)
drone *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * t)
air = bandpass_fft(rng.standard_normal(len(t)), 80, 900) * 0.25
d = (drone + air) * np.minimum(1, t / 2.5)  # медленно нарастает
d[-int(0.03 * SR):] *= np.linspace(1, 0, int(0.03 * SR))  # резко обрывается в темноту
add(d, 0, 0.5)

# ── чирк спички и щелчок фонаря
strike = bandpass_fft(rng.standard_normal(int(0.35 * SR)), 1500, 9000) * env(int(0.35 * SR), 0.005, 0.3)
add(strike, 0.25, 0.35, -0.4)
click = np.sin(2 * np.pi * 1900 * t_arr(0.04)) * np.exp(-t_arr(0.04) * 120)
add(click, L["click"], 0.5, -0.5)
# треск пламени — пока горит фонарь
for k in range(70):
    at = rng.uniform(L["click"], L["beat"] + 0.3)
    c = rng.standard_normal(int(0.012 * SR)) * np.exp(-t_arr(0.012) * 400)
    add(c, at, rng.uniform(0.02, 0.07), rng.uniform(-0.6, 0.6))

# ── сердце
def thump(f0=55, dur=0.35):
    tt = t_arr(dur)
    return np.sin(2 * np.pi * (f0 - 25 * tt / dur) * tt) * np.exp(-tt * 14)
for k, at in enumerate([L["beat"], L["beat"] + 0.24, L["beat"] + 0.95, L["beat"] + 1.17]):
    add(thump(), at, 0.9 if k % 2 == 0 else 0.6)

# ── треск мигающего фонаря
for at in [4.9, 4.97, 5.05, 5.12, 5.18]:
    z = bandpass_fft(rng.standard_normal(int(0.05 * SR)), 400, 6000) * env(int(0.05 * SR), 0.002, 0.04)
    add(z, at, 0.3, 0.3)

# ── в темноте: обратный нарастающий шум к удару
gap = L["closer"] - L["dark"]
sw = bandpass_fft(rng.standard_normal(int(gap * SR)), 300, 7000) * (np.linspace(0, 1, int(gap * SR)) ** 3)
add(sw, L["dark"], 0.45)

# ── «она ближе»: удар + визг-кластер + суббас
tt = t_arr(3.0)
boom = np.sin(2 * np.pi * (60 * np.exp(-tt * 1.5) + 28) * tt) * np.exp(-tt * 2.2)
hit = bandpass_fft(rng.standard_normal(len(tt)), 200, 12000) * np.exp(-tt * 9)
cluster = sum(np.sign(np.sin(2 * np.pi * f * tt)) * 0.25 for f in (466, 494, 523, 739)) * np.exp(-tt * 1.8)
cluster = bandpass_fft(cluster, 300, 8000)
add(boom, L["closer"], 1.0)
add(hit, L["closer"], 0.5)
add(cluster, L["closer"], 0.22)

# ── название: нить протягивается (свист), стежки щёлкают
T = L["title"]
tt = t_arr(1.1)
zip_ = rng.standard_normal(len(tt))
zip_ = bandpass_fft(zip_, 2500, 9000) * np.sin(np.pi * tt / 1.1) ** 2
pan_sweep = np.linspace(-0.8, 0.8, len(tt))
add(np.stack([zip_ * np.sqrt((1 - pan_sweep) / 2), zip_ * np.sqrt((1 + pan_sweep) / 2)], 1), T, 0.7)
for k in range(14):
    c = np.sin(2 * np.pi * 3200 * t_arr(0.02)) * np.exp(-t_arr(0.02) * 300)
    add(c, T + 0.7 + k * 0.05, 0.35, -0.6 + k * 0.09)
# шёпот: полосовой шум «слогами»
tt = t_arr(1.8)
wh = bandpass_fft(rng.standard_normal(len(tt)), 1800, 4200)
wh *= np.abs(np.sin(2 * np.pi * 3.2 * tt)) ** 1.5 * np.sin(np.pi * tt / 1.8)
add(wh, T + 1.4, 0.3, 0.7)
# финальный низкий тон
tt = t_arr(TOTAL - T)
tail = (0.5 * np.sin(2 * np.pi * 36.7 * tt) + 0.3 * np.sin(2 * np.pi * 55 * tt)) * np.minimum(1, tt / 1.2) * np.exp(-tt * 0.35)
add(tail, T + 0.2, 0.7)

# ── эхо пустой комнаты: свёртка с затухающим шумом
ir_len = int(1.8 * SR)
ir = rng.standard_normal((ir_len, 2)) * np.exp(-np.linspace(0, 7, ir_len))[:, None]
ir[0] = 1.0
wet = np.zeros_like(mix)
nfft = 1 << int(np.ceil(np.log2(N + ir_len)))
for ch in range(2):
    wet[:, ch] = np.fft.irfft(np.fft.rfft(mix[:, ch], nfft) * np.fft.rfft(ir[:, ch], nfft), nfft)[:N]
out = mix * 0.75 + wet * 0.09
out[-int(0.5 * SR):] *= np.linspace(1, 0, int(0.5 * SR))[:, None]
# мягкий лимитер: удар не «съедает» громкость остального
out /= max(1e-9, np.abs(out).max())
out = np.tanh(out * 3.0) / np.tanh(3.0) * 0.89

import wave
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype("<i2").tobytes())
print("ok", sys.argv[2], f"{TOTAL:.2f}s")
