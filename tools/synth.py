import numpy as np, json, subprocess, os, sys
from scipy import signal
from scipy.io import wavfile

SR = 44100
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/synth/out'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def t_(dur): return np.arange(int(dur * SR)) / SR
def noise(n): return rng.standard_normal(n)
def pink(n):
    X = np.fft.rfft(noise(n)); f = np.fft.rfftfreq(n, 1 / SR); f[0] = f[1]
    x = np.fft.irfft(X / np.sqrt(f), n); return x / np.std(x)
def brown(n):
    x = np.cumsum(noise(n)); x = hp(x, 20); return x / (np.std(x) + 1e-9)
def sos_f(x, kind, f, order=4):
    if kind == 'band': sos = signal.butter(order, [f[0] / (SR / 2), f[1] / (SR / 2)], 'band', output='sos')
    else: sos = signal.butter(order, f / (SR / 2), kind, output='sos')
    return signal.sosfilt(sos, x, axis=0)
def lp(x, f, o=4): return sos_f(x, 'low', f, o)
def hp(x, f, o=4): return sos_f(x, 'high', f, o)
def bp(x, lo, hi, o=2): return sos_f(x, 'band', (lo, hi), o)
def reson(x, f, q):
    b, a = signal.iirpeak(f / (SR / 2), q); return signal.lfilter(b, a, x)
def place(buf, x, at):
    i = int(at * SR)
    if i >= len(buf): return
    n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n]
def stereo(x, pan=0.0):
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l * 1.414, x * r * 1.414], 1)
def ir(t60, n_ch=2, bright=6000, pre=0.01):
    n = int(t60 * SR); tt = np.arange(n) / SR
    outs = []
    for _ in range(n_ch):
        e = noise(n) * np.exp(-6.9 * tt / t60)
        e = lp(e, bright, 2); e[:int(pre * SR)] = 0; outs.append(e / np.sqrt(np.sum(e ** 2)))
    return np.stack(outs, 1)
def reverb(st, t60=1.5, wet=0.3, bright=6000):
    if st.ndim == 1: st = stereo(st)
    h = ir(t60, 2, bright)
    w = np.stack([signal.fftconvolve(st[:, c], h[:, c]) for c in range(2)], 1)
    out = np.zeros_like(w); out[:len(st)] += st * (1 - wet)
    return out + w * wet * 1.5
def fade(x, a=0.005, r=0.05):
    n = len(x); e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return x * (e[:, None] if x.ndim == 2 else e)
def trim(st, thr=1e-4):
    a = np.abs(st).max(1) if st.ndim == 2 else np.abs(st)
    idx = np.where(a > thr * a.max())[0]
    return st[:idx[-1] + 1] if len(idx) else st
def norm_peak(st, db=-1.0): return st / (np.abs(st).max() + 1e-12) * 10 ** (db / 20)
def norm_rms(st, db=-22.0, peak=-3.0):
    st = st / (np.sqrt(np.mean(st ** 2)) + 1e-12) * 10 ** (db / 20)
    p = np.abs(st).max(); lim = 10 ** (peak / 20)
    if p > lim: st = np.tanh(st / lim) * lim
    return st
def decay(dur, tau): return np.exp(-t_(dur) / tau)
def gust(n, rate=0.3, depth=0.6):
    g = lp(noise(n), rate, 2); g = g / (np.abs(g).max() + 1e-9)
    return 1 - depth / 2 + depth / 2 * g
def seamless(st, L):
    """st has length >= L + X; crossfade tail into head -> perfectly periodic L."""
    X = len(st) - int(L * SR); n = int(L * SR)
    out = st[:n].copy(); w = np.linspace(0, 1, X)[:, None]
    out[:X] = st[:X] * np.sqrt(w) + st[n:n + X] * np.sqrt(1 - w)
    return out

meta = {}
def save(name, st, kind, title, loop=False):
    if st.ndim == 1: st = stereo(st)
    if loop:
        L = len(st) / SR
        st = np.concatenate([st, st[:SR]], 0)  # +1 s head for gapless region 0.5 .. 0.5+L
        meta[name] = dict(kind=kind, title=title, loop=True, loopStart=0.5, loopEnd=round(0.5 + L, 4), dur=round(L, 3))
    else:
        meta[name] = dict(kind=kind, title=title, loop=False, dur=round(len(st) / SR, 3))
    wav = f'{OUT}/{name}.wav'
    wavfile.write(wav, SR, (np.clip(st, -1, 1) * 32767).astype(np.int16))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '128k', f'{OUT}/{name}.mp3'], check=True)
    os.remove(wav)
    print(name, meta[name]['dur'])

# ---------------- SFX ----------------
def thunder():
    d = 7.0; n = int(d * SR); tt = t_(d)
    crack = hp(noise(n), 1500) * np.exp(-tt / 0.08) * 1.2
    crack2 = bp(noise(n), 400, 4000) * np.exp(-np.maximum(tt - 0.12, 0) / 0.15) * (tt > 0.12) * 0.8
    rum = lp(brown(n), 180, 4) * np.exp(-tt / 2.2) * gust(n, 3, 0.9) * np.clip(tt / 0.25, 0, 1)
    rum2 = lp(brown(n), 90, 4) * np.exp(-tt / 3.0) * np.clip(tt / 0.6, 0, 1) * 1.3
    x = crack + crack2 + rum * 1.6 + rum2
    L = x; R = np.roll(x, 300) * 0.9 + lp(brown(n), 150) * np.exp(-tt / 2) * 0.3
    st = reverb(np.stack([L, R], 1), 3.5, 0.35, 3000)
    return fade(norm_peak(trim(st)), 0.001, 0.8)
def knock():
    out = np.zeros(int(1.6 * SR))
    for k, at in enumerate([0.05, 0.33, 0.58]):
        n = int(0.25 * SR); imp = np.zeros(n); imp[0] = 1
        body = reson(imp, 170 + rng.uniform(-8, 8), 6) * 3 + reson(imp, 410, 8) * 1.4 + reson(imp, 900, 10) * 0.5
        click = bp(noise(n), 1500, 6000) * np.exp(-t_(0.25) / 0.004) * 0.3
        place(out, (body + click) * (1.0 if k else 0.9), at)
    st = reverb(out, 0.6, 0.18, 4000)
    return fade(norm_peak(trim(st)), 0.0005, 0.1)
def footsteps():
    out_l = np.zeros(int(4.0 * SR)); out_r = np.zeros_like(out_l)
    for i in range(7):
        at = 0.1 + i * 0.52 + rng.uniform(-0.02, 0.02)
        n = int(0.2 * SR); tt = t_(0.2)
        heel = lp(noise(n), 900) * np.exp(-tt / 0.018) + np.sin(2 * np.pi * 85 * tt) * np.exp(-tt / 0.03) * 0.8
        toe = np.zeros(n); k = int(0.07 * SR)
        toe[k:] = (bp(noise(n - k), 600, 3500) * np.exp(-t_(0.2)[:n - k] / 0.02) * 0.5)
        s = heel + toe; pan = -0.6 + i * 0.2
        place(out_l, s * np.cos((pan + 1) * np.pi / 4), at); place(out_r, s * np.sin((pan + 1) * np.pi / 4), at)
    st = reverb(np.stack([out_l, out_r], 1), 0.9, 0.2, 5000)
    return fade(norm_peak(trim(st)), 0.0005, 0.15)
def sword():
    d = 3.0; n = int(d * SR); tt = t_(d)
    f0 = 1180; x = np.zeros(n)
    for r, a, tau in [(1, 1, 0.9), (2.76, 0.7, 0.6), (5.40, 0.45, 0.35), (8.93, 0.3, 0.2), (1.51, 0.4, 0.7), (3.9, 0.3, 0.4)]:
        x += a * np.sin(2 * np.pi * f0 * r * tt * (1 + 0.0015 * np.sin(2 * np.pi * 5 * tt))) * np.exp(-tt / tau)
    hit = hp(noise(n), 2000) * np.exp(-tt / 0.01) * 2
    scrape = bp(noise(n), 2500, 7000) * np.exp(-tt / 0.25) * 0.4
    st = reverb(stereo(x * 0.6 + hit + scrape, 0.15), 1.6, 0.3, 8000)
    return fade(norm_peak(trim(st)), 0.0005, 0.4)
def hooves():
    out = np.zeros(int(3.6 * SR)); beat = 0.42
    def clop(a=1):
        n = int(0.12 * SR); tt = t_(0.12)
        return a * (bp(noise(n), 700, 2600) * np.exp(-tt / 0.012) * 1.2 + np.sin(2 * np.pi * 240 * tt) * np.exp(-tt / 0.02) * 0.6)
    for b in range(7):
        base = 0.05 + b * beat
        for off, a in [(0, 0.7), (0.08, 0.85), (0.17, 1.0)]: place(out, clop(a * rng.uniform(0.85, 1.05)), base + off)
    tt = t_(len(out) / SR); out *= np.clip(0.4 + tt / 1.5, 0, 1)
    st = np.stack([out * np.linspace(1.2, 0.5, len(out)), out * np.linspace(0.5, 1.2, len(out))], 1)
    st = reverb(st, 1.0, 0.18, 5000)
    return fade(norm_peak(trim(st)), 0.0005, 0.3)
def glass():
    d = 2.5; n = int(d * SR); tt = t_(d)
    imp = hp(noise(n), 2500) * np.exp(-tt / 0.02) * 1.5 + bp(noise(n), 300, 1500) * np.exp(-tt / 0.03) * 0.6
    L = imp.copy(); R = imp.copy()
    for _ in range(70):
        at = abs(rng.normal(0, 0.35)) + 0.01
        f = rng.uniform(2800, 9500); dd = rng.uniform(0.05, 0.25); m = int(dd * SR); tm = t_(dd)
        tk = np.sin(2 * np.pi * f * tm) * np.exp(-tm / (dd / 4)) * rng.uniform(0.1, 0.5) * np.exp(-at / 0.8)
        p = rng.uniform(-0.9, 0.9)
        place(L, tk * np.cos((p + 1) * np.pi / 4), at); place(R, tk * np.sin((p + 1) * np.pi / 4), at)
    st = reverb(np.stack([L, R], 1), 1.2, 0.25, 9000)
    return fade(norm_peak(trim(st)), 0.0005, 0.3)
def bell():
    d = 7.0; n = int(d * SR); tt = t_(d); f0 = 196
    x = np.zeros(n)
    for r, a, tau in [(0.5, 0.6, 4.5), (1.0, 1.0, 3.2), (1.183, 0.7, 2.6), (1.506, 0.5, 2.0), (2.0, 0.45, 1.6), (2.51, 0.3, 1.1), (2.66, 0.25, 1.0), (3.01, 0.2, 0.8), (4.17, 0.12, 0.5)]:
        beat = 1 + 0.25 * np.sin(2 * np.pi * rng.uniform(0.6, 2.0) * tt)
        x += a * beat * np.sin(2 * np.pi * f0 * r * tt + rng.uniform(0, 6)) * np.exp(-tt / tau)
    strike = bp(noise(n), 1000, 5000) * np.exp(-tt / 0.008)
    st = reverb(stereo(x + strike, -0.1), 3.0, 0.35, 5000)
    return fade(norm_peak(trim(st)), 0.0005, 0.6)
def rain_layer(d, dens=600, lvl=1.0):
    n = int(d * SR)
    bed = bp(pink(n), 400, 9000) * 0.35 * lvl
    L = bed.copy(); R = bp(pink(n), 400, 9000) * 0.35 * lvl
    for _ in range(int(dens * d)):
        at = rng.uniform(0, d); dd = 0.012; tm = t_(dd)
        f = rng.uniform(1500, 6000)
        dr = np.sin(2 * np.pi * f * tm * (1 + 2 * tm)) * np.exp(-tm / 0.003) * rng.uniform(0.05, 0.4)
        if rng.random() < 0.5: place(L, dr, at)
        else: place(R, dr, at)
    return np.stack([L, R], 1)
def rain():
    d = 8.0; st = rain_layer(d, 700); st = reverb(st, 0.8, 0.15, 8000)[:int(d * SR)]
    return fade(norm_peak(st, -2), 1.2, 2.0)
def crowd_layer(d, voices=28, lo=1.0):
    n = int(d * SR); L = np.zeros(n); R = np.zeros(n)
    for v in range(voices):
        src = noise(n)
        f1 = rng.uniform(350, 800); f2 = rng.uniform(900, 2200)
        vo = reson(src, f1, 4) + reson(src, f2, 5) * 0.6
        syl = lp(np.maximum(noise(n), 0) ** 1.5, rng.uniform(4, 7), 2)
        phr = (lp(noise(n), 0.4, 2) > -0.2).astype(float); phr = lp(phr, 4, 2)
        vo *= np.maximum(syl, 0) * np.maximum(phr, 0)
        vo = vo / (np.std(vo) + 1e-9) * rng.uniform(0.4, 1.0) * lo
        p = rng.uniform(-0.9, 0.9)
        L += vo * np.cos((p + 1) * np.pi / 4); R += vo * np.sin((p + 1) * np.pi / 4)
    return np.stack([L, R], 1)
def crowd():
    d = 7.0; st = crowd_layer(d); st = lp(st, 4000, 2)
    st = reverb(st, 1.6, 0.35, 4000)[:int(d * SR)]
    return fade(norm_peak(st, -2), 0.8, 1.5)
def heartbeat():
    out = np.zeros(int(5.6 * SR)); per = 60 / 72
    def thump(f, a):
        n = int(0.25 * SR); tt = t_(0.25)
        ph = 2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-tt / 0.02))) / SR
        return a * np.sin(ph) * (1 - np.exp(-tt / 0.004)) * np.exp(-tt / 0.07)
    for i in range(6):
        place(out, thump(52, 1.0), 0.05 + i * per); place(out, thump(60, 0.7), 0.05 + i * per + 0.28)
    out = lp(out, 300) + lp(noise(len(out)), 200) * 0.01
    return fade(norm_peak(trim(stereo(out))), 0.002, 0.2)
def clock():
    out_l = np.zeros(int(8.0 * SR)); out_r = np.zeros_like(out_l)
    for i in range(16):
        n = int(0.06 * SR); imp = np.zeros(n); imp[0] = 1
        f = 2900 if i % 2 == 0 else 2300
        tk = reson(imp, f, 30) * 2 + reson(imp, f * 1.6, 40) + bp(noise(n), 3000, 9000) * np.exp(-t_(0.06) / 0.002) * 0.4
        place(out_l, tk, 0.05 + i * 0.5); place(out_r, tk * 0.85, 0.05 + i * 0.5)
    st = reverb(np.stack([out_l, out_r], 1), 0.7, 0.2, 7000)[:len(out_l)]
    return fade(norm_peak(st), 0.0005, 0.2)
def wind_layer(d, lo=250, hi=1100, howl=0.5):
    n = int(d * SR)
    base = lp(pink(n), 700, 2) * gust(n, 0.25, 0.8)
    tt = t_(d); fc = (lo + hi) / 2 + (hi - lo) / 2 * np.sin(2 * np.pi * 0.07 * tt + 1) * np.sin(2 * np.pi * 0.11 * tt)
    wh = np.zeros(n); src = noise(n); blk = 2048; zi = None
    for s in range(0, n, blk):
        b, a = signal.iirpeak(fc[s] / (SR / 2), 25); seg = src[s:s + blk]
        if zi is None: zi = signal.lfilter_zi(b, a) * 0
        y, zi = signal.lfilter(b, a, seg, zi=zi); wh[s:s + blk] = y
    wh *= gust(n, 0.2, 0.9)
    m = base + wh * howl * 3
    return np.stack([m, np.roll(m, int(0.013 * SR)) * 0.9 + lp(pink(n), 500, 2) * 0.2 * gust(n, 0.3)], 1)
def wind():
    d = 8.0; st = wind_layer(d, 300, 900, 0.8)
    return fade(norm_peak(st, -2), 1.5, 2.0)
def door():
    d = 3.0; n = int(d * SR); tt = t_(d)
    rate = 40 + 70 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.45 * tt + 0.3)) + 20 * lp(noise(n), 3, 2) / 0.05
    rate = np.clip(rate, 25, 180)
    ph = np.cumsum(rate) / SR; pulses = np.diff(np.floor(ph), prepend=0)
    pulses *= (0.5 + 0.5 * np.abs(lp(noise(n), 8, 2)) / 0.02).clip(0, 2)
    x = reson(pulses, 620, 9) * 1.2 + reson(pulses, 1450, 12) + reson(pulses, 2900, 15) * 0.5
    x *= np.clip(tt / 0.15, 0, 1) * np.clip((d - 0.2 - tt) / 0.4, 0, 1)
    st = reverb(stereo(x, 0.2), 0.9, 0.22, 6000)
    return fade(norm_peak(trim(st)), 0.01, 0.3)
def applause():
    d = 7.0; n = int(d * SR); L = np.zeros(n); R = np.zeros(n); tt = t_(d)
    dens = np.interp(tt, [0, 1.2, 5, 7], [5, 45, 45, 2])
    for i in range(int(np.sum(dens) / SR) * 1):
        pass
    k = 0
    for s in np.arange(0, d, 0.01):
        lam = np.interp(s, [0, 1.2, 5, 7], [5, 45, 45, 2]) * 0.01 * 6
        for _ in range(rng.poisson(lam)):
            at = s + rng.uniform(0, 0.01); m = int(0.03 * SR); tm = t_(0.03)
            c = bp(noise(m), rng.uniform(800, 1500), rng.uniform(2500, 5000)) * np.exp(-tm / rng.uniform(0.004, 0.009)) * rng.uniform(0.3, 1)
            p = rng.uniform(-1, 1)
            place(L, c * np.cos((p + 1) * np.pi / 4), at); place(R, c * np.sin((p + 1) * np.pi / 4), at)
    st = reverb(np.stack([L, R], 1), 1.4, 0.3, 6000)[:n]
    return fade(norm_peak(st, -1.5), 0.3, 1.0)
def whoosh():
    d = 3.2; n = int(d * SR); tt = t_(d)
    fc = 300 * (25 ** (np.clip(tt / 1.6, 0, 1))); src = noise(n); y = np.zeros(n); zi = None
    for s in range(0, n, 1024):
        f = min(fc[s], 15000); b, a = signal.iirpeak(f / (SR / 2), 3)
        if zi is None: zi = signal.lfilter_zi(b, a) * 0
        yy, zi = signal.lfilter(b, a, src[s:s + 1024], zi=zi); y[s:s + 1024] = yy
    env = np.sin(np.pi * np.clip(tt / 1.8, 0, 1)) ** 2
    sh = np.zeros(n)
    for j, f in enumerate([1318.5, 1568, 1975.5, 2637, 3136]):
        at = 0.5 + j * 0.18; m = n - int(at * SR); tm = t_(m / SR)
        sh[int(at * SR):] += np.sin(2 * np.pi * f * tm) * np.exp(-tm / 0.9) * 0.25 * (1 + 0.3 * np.sin(2 * np.pi * 6 * tm))
    x = y * env * 2 + sh
    st = np.stack([x * np.clip(1.3 - tt / 1.6, 0.3, 1.3), x * np.clip(0.3 + tt / 1.6, 0.3, 1.3)], 1)
    st = reverb(st, 2.5, 0.4, 9000)
    return fade(norm_peak(trim(st)), 0.05, 0.6)
def doira_hits(pattern, bpm=112, bars=2):
    beat = 60 / bpm; step = beat / 2; total = step * len(pattern) * bars + 1.2
    out = np.zeros(int(total * SR))
    def dum():
        n = int(0.6 * SR); tt = t_(0.6)
        ph = 2 * np.pi * np.cumsum(88 * (1 + 0.5 * np.exp(-tt / 0.03))) / SR
        return np.sin(ph) * np.exp(-tt / 0.18) * 1.1 + lp(noise(n), 500) * np.exp(-tt / 0.01) * 0.4 + jingle(n, 0.6)
    def tak():
        n = int(0.4 * SR); tt = t_(0.4)
        return (reson(np.r_[1, np.zeros(n - 1)], 720, 6) * 3 + bp(noise(n), 1500, 5000) * np.exp(-tt / 0.006)) * 0.8 + jingle(n, 0.8)
    def jingle(n, a):
        tt = np.arange(n) / SR; j = np.zeros(n)
        for k in range(5):
            o = int(rng.uniform(0, 0.012) * SR)
            j[o:] += hp(noise(n - o), 5500) * np.exp(-tt[:n - o] / rng.uniform(0.05, 0.12)) * 0.12
        return j * a
    i = 0
    for b in range(bars):
        for s in pattern:
            at = 0.03 + i * step + rng.uniform(-0.004, 0.004)
            if s == 'D': place(out, dum(), at)
            elif s == 't': place(out, tak() * 0.75, at)
            elif s == 'T': place(out, tak(), at)
            i += 1
    st = reverb(stereo(out, -0.1), 0.8, 0.18, 7000)
    return st
def doira():
    st = doira_hits(list('D.tTD.Tt'), 112, 2)
    return fade(norm_peak(trim(st)), 0.001, 0.4)

for name, fn, title in [
    ('thunder', thunder, 'Momaqaldiroq'), ('knock', knock, 'Eshik taqillashi'), ('steps', footsteps, 'Qadam tovushi'),
    ('sword', sword, 'Qilich zarbi'), ('horse', hooves, "Ot tuyog'i"), ('glass', glass, 'Shisha sinishi'),
    ('bell', bell, "Qo'ng'iroq"), ('rain', rain, "Yomg'ir"), ('crowd', crowd, 'Olomon shovqini'),
    ('heart', heartbeat, 'Yurak urishi'), ('clock', clock, 'Soat chiqillashi'), ('wind', wind, 'Shamol guvillashi'),
    ('door', door, "Eshik g'ichirlashi"), ('applause', applause, 'Qarsaklar'), ('whoosh', whoosh, 'Sehrli shuvullash'),
    ('drum', doira, 'Doira zarbi')]:
    save('sfx_' + name, fn(), 'sfx', title)

# ---------------- ATMOS STEMS (seamless loops) ----------------
LOOP = 16.0; X = 2.0; D = LOOP + X; N = int(D * SR)
def crickets():
    L = np.zeros(N); R = np.zeros(N)
    for c in range(5):
        f = rng.uniform(4200, 5200); per = rng.uniform(0.45, 0.8); p = rng.uniform(-0.9, 0.9); a = rng.uniform(0.3, 1)
        s = rng.uniform(0, per)
        while s < D:
            for k in range(rng.integers(3, 5)):
                m = int(0.014 * SR); tm = t_(0.014)
                pl = np.sin(2 * np.pi * f * tm) * np.sin(np.pi * tm / 0.014) * a
                place(L, pl * np.cos((p + 1) * np.pi / 4), s + k * 0.028); place(R, pl * np.sin((p + 1) * np.pi / 4), s + k * 0.028)
            s += per * rng.uniform(0.9, 1.1)
    st = reverb(np.stack([L, R], 1), 1.2, 0.3, 8000)[:N]
    return norm_rms(seamless(st, LOOP), -26)
def owl():
    L = np.zeros(N); R = np.zeros(N)
    for at, p in [(2.0, -0.5), (9.5, 0.6), (13.8, -0.2)]:
        for k, (f, dur) in enumerate([(410, 0.45), (380, 0.7)]):
            tm = t_(dur); env = np.sin(np.pi * tm / dur) ** 1.5
            h = (np.sin(2 * np.pi * f * tm * (1 - 0.04 * tm) + 2 * np.sin(2 * np.pi * 5 * tm) * 0.05) + 0.15 * np.sin(4 * np.pi * f * tm)) * env
            h = lp(h, 1200, 2) + lp(noise(len(tm)), 800, 2) * env * 0.04
            place(L, h * np.cos((p + 1) * np.pi / 4), at + k * 0.6); place(R, h * np.sin((p + 1) * np.pi / 4), at + k * 0.6)
    st = reverb(np.stack([L, R], 1), 2.8, 0.55, 3000)[:N]
    return norm_rms(seamless(st, LOOP), -30, -6)
def leaves():
    st = np.stack([bp(noise(N), 1800, 9000) * gust(N, 0.5, 1.0) ** 2, bp(noise(N), 1800, 9000) * gust(N, 0.45, 1.0) ** 2], 1)
    return norm_rms(seamless(st, LOOP), -28)
def forest_wind():
    st = wind_layer(D, 220, 650, 0.35); st = lp(st, 1500, 2)
    return norm_rms(seamless(st, LOOP), -24)
def hall_tone():
    st = np.stack([lp(brown(N), 160), lp(brown(N), 160)], 1) * 0.6 + reverb(np.stack([lp(pink(N), 2500) * 0.05] * 2, 1), 2.5, 0.8)[:N]
    return norm_rms(seamless(st, LOOP), -30)
def hall_murmur():
    st = crowd_layer(D, 18, 1.0); st = lp(st, 1800, 2); st = reverb(st, 3.2, 0.6, 2500)[:N]
    return norm_rms(seamless(st, LOOP), -27)
def hall_steps():
    L = np.zeros(N); R = np.zeros(N)
    for i in range(10):
        at = 3 + i * 0.6; p = -0.8 + i * 0.16; n = int(0.15 * SR); tt = t_(0.15)
        s = bp(noise(n), 500, 4000) * np.exp(-tt / 0.01) + np.sin(2 * np.pi * 120 * tt) * np.exp(-tt / 0.02) * 0.4
        place(L, s * np.cos((p + 1) * np.pi / 4), at); place(R, s * np.sin((p + 1) * np.pi / 4), at)
    st = reverb(np.stack([L, R], 1), 3.5, 0.75, 3500)[:N]
    return norm_rms(seamless(st, LOOP), -32, -8)
def birds():
    L = np.zeros(N); R = np.zeros(N)
    for _ in range(26):
        at = rng.uniform(0, D - 1.5); p = rng.uniform(-0.9, 0.9); kind = rng.integers(0, 3); a = rng.uniform(0.3, 1)
        if kind == 0:  # trill
            f = rng.uniform(3500, 5500); cnt = rng.integers(6, 14); x = np.zeros(int(1.2 * SR))
            for k in range(cnt):
                tm = t_(0.035); place(x, np.sin(2 * np.pi * (f + 1500 * tm / 0.035) * tm) * np.sin(np.pi * tm / 0.035), k * 0.07)
        elif kind == 1:  # whistle glide
            dur = rng.uniform(0.25, 0.5); tm = t_(dur); f1, f2 = rng.uniform(2000, 3000), rng.uniform(2800, 4200)
            x = np.sin(2 * np.pi * np.cumsum(np.linspace(f1, f2, len(tm))) / SR) * np.sin(np.pi * tm / dur)
        else:  # chirps
            x = np.zeros(int(0.8 * SR))
            for k in range(rng.integers(2, 4)):
                tm = t_(0.08); fsw = np.linspace(5500, 2500, len(tm))
                place(x, np.sin(2 * np.pi * np.cumsum(fsw) / SR) * np.sin(np.pi * tm / 0.08), k * 0.18)
        x *= a
        place(L, x * np.cos((p + 1) * np.pi / 4), at); place(R, x * np.sin((p + 1) * np.pi / 4), at)
    st = reverb(np.stack([L, R], 1), 1.8, 0.35, 9000)[:N]
    return norm_rms(seamless(st, LOOP), -27)
def breeze():
    st = lp(np.stack([pink(N), pink(N)], 1), 900, 2) * np.stack([gust(N, 0.2, 0.9)] * 2, 1)
    return norm_rms(seamless(st, LOOP), -30)
def stream():
    bed = np.stack([bp(pink(N), 300, 4000), bp(pink(N), 300, 4000)], 1) * 0.5
    for _ in range(int(D * 90)):
        at = rng.uniform(0, D); dd = rng.uniform(0.008, 0.03); tm = t_(dd); f = rng.uniform(500, 1800)
        b = np.sin(2 * np.pi * np.cumsum(f * (1 + 3 * tm / dd)) / SR) * np.sin(np.pi * tm / dd) * rng.uniform(0.1, 0.5)
        ch = rng.integers(0, 2); place(bed[:, ch], b, at)
    return norm_rms(seamless(bed, LOOP), -29)

for name, fn, title, kind in [
    ('forest_wind', forest_wind, 'Shamol', 'forest'), ('forest_crickets', crickets, 'Tungi hasharotlar', 'forest'),
    ('forest_owl', owl, "Boyo'g'li", 'forest'), ('forest_leaves', leaves, 'Daraxt shitirlashi', 'forest'),
    ('hall_tone', hall_tone, 'Zal havosi', 'hall'), ('hall_murmur', hall_murmur, 'Uzoq suhbat', 'hall'),
    ('hall_steps', hall_steps, 'Tosh poldagi qadamlar', 'hall'),
    ('dawn_birds', birds, 'Qushlar', 'dawn'), ('dawn_breeze', breeze, 'Tong shabadasi', 'dawn'), ('dawn_stream', stream, 'Soy shildirashi', 'dawn')]:
    save('atm_' + name, fn(), 'atmos:' + kind, title, loop=True)

# ---------------- MUSIC ----------------
def note(m): return 440 * 2 ** ((m - 69) / 12)
def strings(midi, dur, att=1.5, rel=1.5, cutoff=2500):
    tt = t_(dur); x = np.zeros(len(tt))
    for dv in [-9, -4, 0, 4, 9]:
        f = note(midi) * 2 ** (dv / 1200)
        x += signal.sawtooth(2 * np.pi * f * tt + rng.uniform(0, 6) + 0.3 * np.sin(2 * np.pi * 5.2 * tt) * (tt > 0.5))
    x = lp(x, cutoff, 2) / 5
    env = np.clip(tt / att, 0, 1) * np.clip((dur - tt) / rel, 0, 1)
    return x * env
def overture():
    chords = [[50, 53, 57, 62, 38], [46, 53, 58, 62, 34], [41, 48, 57, 65, 41], [45, 52, 57, 61, 33], [50, 57, 62, 65, 38]]
    seg = 5.5; d = seg * len(chords) + 4; n = int(d * SR); L = np.zeros(n); R = np.zeros(n)
    for i, ch in enumerate(chords):
        for j, m in enumerate(ch):
            s = strings(m, seg + 1.6, 1.8, 1.6, 900 + 500 * i + (300 if m > 55 else 0)) * (0.7 if m < 40 else 1)
            p = -0.6 + j * 0.3
            place(L, s * np.cos((p + 1) * np.pi / 4), i * seg); place(R, s * np.sin((p + 1) * np.pi / 4), i * seg)
    tt = t_(d); cres = 0.35 + 0.65 * np.clip(tt / (seg * 4), 0, 1)
    L *= cres; R *= cres
    roll_s = seg * 4 - 3.5
    for k in range(int(3.5 / 0.045)):
        a = 0.15 + 0.85 * k / (3.5 / 0.045); m = int(0.3 * SR); tm = t_(0.3)
        hit = np.sin(2 * np.pi * 73.4 * tm) * np.exp(-tm / 0.25) * a * 0.5 + lp(noise(m), 400) * np.exp(-tm / 0.02) * a * 0.15
        place(L, hit, roll_s + k * 0.045); place(R, hit, roll_s + k * 0.045)
    m = int(3 * SR); tm = t_(3); boom = np.sin(2 * np.pi * np.cumsum(73.4 * (1 + 0.3 * np.exp(-tm / 0.05))) / SR) * np.exp(-tm / 1.0) * 1.6
    place(L, boom, seg * 4); place(R, boom, seg * 4)
    st = reverb(np.stack([L, R], 1), 3.2, 0.35, 5000)
    return fade(norm_peak(trim(st)), 0.3, 2.5)
def battle():
    bpm = 140; beat = 60 / bpm; bars = 14; d = bars * 4 * beat + 3; n = int(d * SR); L = np.zeros(n); R = np.zeros(n)
    def taiko(a=1.0, f=62):
        m = int(0.8 * SR); tm = t_(0.8)
        return a * (np.sin(2 * np.pi * np.cumsum(f * (1 + 0.8 * np.exp(-tm / 0.025))) / SR) * np.exp(-tm / 0.3) + lp(noise(m), 1200) * np.exp(-tm / 0.015) * 0.5)
    tpat = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0]
    ost = [38, 38, 38, 41, 38, 38, 40, 36] * 2
    for b in range(bars):
        for s in range(16):
            at = (b * 16 + s) * beat / 4
            if tpat[s] and b >= 1:
                h = taiko(1.0 if s in (0, 6) else 0.7, 58 if s in (0, 6) else 70); place(L, h, at); place(R, h * 0.95, at)
            if b >= 2:
                m = ost[s] + (0 if b % 4 < 2 else (-2 if b % 4 == 2 else 1))
                dur = beat / 4 * 0.9; tm = t_(dur)
                nt = lp(signal.sawtooth(2 * np.pi * note(m) * tm) + signal.sawtooth(2 * np.pi * note(m + 12) * tm * 1.002) * 0.5, 1400, 2) * np.exp(-tm / 0.09) * 0.45
                place(L, nt, at); place(R, nt * 0.8, at)
        if b >= 4 and b % 2 == 0:
            ch = [62, 65, 69] if b % 4 == 0 else [60, 64, 67]
            dur = beat * 1.5; tm = t_(dur)
            br = sum(lp(signal.sawtooth(2 * np.pi * note(m) * tm), 600 + 2500 * np.minimum(tm / 0.15, 1).mean(), 2) for m in ch) / 3
            br = lp(br, 3000, 2) * np.clip(tm / 0.06, 0, 1) * np.exp(-tm / 0.5) * 0.6
            place(L, br * 0.8, b * 4 * beat); place(R, br, b * 4 * beat)
    st = reverb(np.stack([L, R], 1), 2.2, 0.28, 6000)
    tt = t_(len(st) / SR); st *= np.clip(0.5 + tt / 6, 0, 1)[:, None]
    return fade(norm_peak(trim(st)), 0.01, 2.0)

save('mus_overture', overture(), 'music', 'Parda ochilishi')
save('mus_battle', battle(), 'music', 'Jang sahnasi')

json.dump(meta, open(f'{OUT}/meta.json', 'w'), ensure_ascii=False, indent=1)
print('done')
