"""Background music for the AgeNow promo, synthesized in code.

Writes music.wav (44.1 kHz stereo, 25 s). The arrangement follows the scene
times in promo.html: ticking clock under the hook, the beat drops on the logo,
drums step out for the privacy line, and a final hit lands on the end card.

Usage: python3 music.py [out.wav] [drop break end_hit]
(the three scene times default to the Hebrew promo; pass the English ones for ?lang=en)
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 25.0
N = int(SR * DUR)

# Scene times (seconds) from promo.html
DROP, BREAK, END_HIT = (float(x) for x in sys.argv[2:5]) if len(sys.argv) > 4 else (3.9, 17.85, 20.6)
# logo, privacy, end card

BAR = (BREAK - DROP) / 7   # 7 bars from DROP to BREAK (~120 BPM)
BEAT = BAR / 4

rng = np.random.default_rng(7)
L = np.zeros(N)
R = np.zeros(N)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N or i + len(sig) <= 0:
        return
    s = sig[max(0, -i):N - i] if i < 0 else sig[:N - i]
    i = max(i, 0)
    L[i:i + len(s)] += s * gain * np.cos((pan + 1) * np.pi / 4)
    R[i:i + len(s)] += s * gain * np.sin((pan + 1) * np.pi / 4)


def bandpass(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def adsr(n, a=0.01, r=0.1):
    env = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    env[:na] = np.linspace(0, 1, na)
    if nr:
        env[-nr:] *= np.linspace(1, 0, nr)
    return env


# ── Instruments ──────────────────────────────────────────────────────────────
def pad(notes, dur):
    t = tt(dur)
    out = np.zeros_like(t)
    for m in notes:
        for det in (-0.12, 0.0, 0.12):
            f = midi(m + det)
            for k in range(1, 9):
                out += np.sin(2 * np.pi * f * k * t + k) / k ** 1.4
    return out * adsr(len(t), 0.35, 0.5) / (len(notes) * 3)


def pluck(m, dur=0.4):
    t = tt(dur)
    f = midi(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return s * np.exp(-t * 9) * adsr(len(t), 0.003, 0.05)


def bass(m, dur):
    t = tt(dur)
    f = midi(m)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t)
    return np.tanh(1.6 * s) * adsr(len(t), 0.006, 0.08) * (0.65 + 0.35 * np.exp(-t * 6))


def kick():
    t = tt(0.4)
    freq = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(ph) * np.exp(-t * 7.5) + 0.3 * np.exp(-t * 200) * rng.standard_normal(len(t)) * 0.3


def clap():
    t = tt(0.3)
    n = bandpass(rng.standard_normal(len(t)), 900, 6000)
    env = np.exp(-t * 16)
    for d in (0.0, 0.011, 0.022):
        env += 0.6 * np.exp(-np.clip(t - d, 0, None) * 120) * (t >= d)
    return n * env / np.max(np.abs(n))


def hat(open_=False):
    t = tt(0.25 if open_ else 0.06)
    n = bandpass(rng.standard_normal(len(t)), 7000, 16000)
    return n * np.exp(-t * (14 if open_ else 70)) / np.max(np.abs(n))


def tick(high):
    t = tt(0.05)
    f = 2400 if high else 1800
    return (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)) * np.exp(-t * 140)


def riser(dur):
    t = tt(dur)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(t)
    seg = 8
    for i in range(seg):
        c = 400 * 2 ** (i * 5 / seg)
        band = bandpass(n, c * 0.7, c * 1.6)
        w = np.clip(1 - np.abs(t / dur * seg - i - 0.5) / 1.0, 0, 1)
        out += band * w
    return out / np.max(np.abs(out)) * (t / dur) ** 2


def crash():
    t = tt(3.0)
    n = bandpass(rng.standard_normal(len(t)), 4000, 15000)
    return n / np.max(np.abs(n)) * np.exp(-t * 2.2) * adsr(len(t), 0.001, 0.8)


def boom():
    t = tt(1.6)
    freq = 38 + 70 * np.exp(-t * 12)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(ph) * np.exp(-t * 2.6)


# ── Arrangement ──────────────────────────────────────────────────────────────
# I–V–vi–IV in C: (pad voicing, bass root, arpeggio notes)
CHORDS = [
    ([60, 64, 67, 72], 36, [72, 76, 79, 84]),
    ([59, 62, 67, 71], 43, [71, 74, 79, 83]),
    ([60, 64, 69, 72], 45, [72, 76, 81, 84]),
    ([60, 65, 69, 72], 41, [72, 77, 81, 84]),
]
ARP = [0, 2, 1, 3, 2, 1, 3, 2]  # eighth-note pattern over the chord's notes

# Intro: clock ticks on the beat and a pad swell into the drop
for i in range(int(DROP / BEAT) + 1):
    t = DROP - (i + 1) * BEAT
    if t >= 0:
        place(tick(i % 2 == 0), t, 0.22, pan=0.3 if i % 2 else -0.3)
place(pad(CHORDS[3][0], DROP + 0.3) * np.linspace(0.2, 1, int((DROP + 0.3) * SR)), 0.0, 0.32)
place(riser(1.4), DROP - 1.4, 0.22)

# Main section: 7 bars with full drums
for b in range(7):
    t0 = DROP + b * BAR
    pv, root, arp = CHORDS[b % 4]
    place(pad(pv, BAR + 0.4), t0, 0.26)
    for k in range(4):
        place(bass(root, BEAT * 0.9), t0 + k * BEAT, 0.42)
        place(kick(), t0 + k * BEAT, 0.85)
        place(hat(), t0 + k * BEAT + BEAT / 2, 0.16, pan=0.25)
        if k % 2 == 1:
            place(clap(), t0 + k * BEAT, 0.3, pan=-0.1)
    for e in range(8):
        place(pluck(arp[ARP[e]]), t0 + e * BEAT / 2, 0.17, pan=-0.35 if e % 2 else 0.35)
place(crash(), DROP, 0.25)

# Breakdown: pad and soft plucks only
for b, t0 in enumerate(np.arange(BREAK, END_HIT, BAR)):
    pv, root, arp = CHORDS[(7 + b) % 4]
    dur = min(BAR, END_HIT - t0) + 0.4
    place(pad(pv, dur), t0, 0.3)
    for e in range(8):
        if t0 + e * BEAT / 2 < END_HIT - 0.1:
            place(pluck(arp[ARP[e]] - 12), t0 + e * BEAT / 2, 0.13, pan=-0.35 if e % 2 else 0.35)
place(riser(1.0), END_HIT - 1.0, 0.16)

# End card: impact and a ringing final chord
place(boom(), END_HIT, 0.9)
place(crash(), END_HIT, 0.3)
place(pad([48, 60, 64, 67, 72], DUR - END_HIT), END_HIT, 0.38)
for e, m in enumerate([72, 76, 79, 84, 88]):
    place(pluck(m, 1.2), END_HIT + e * BEAT / 2, 0.15, pan=-0.3 + e * 0.15)

# ── Master ───────────────────────────────────────────────────────────────────
mix = np.stack([L, R], axis=1)
fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix *= 0.89 / np.max(np.abs(mix))

out = sys.argv[1] if len(sys.argv) > 1 else 'music.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('wrote', out)
