"""Build the narration, original score, SFX and timeline for the video.

Usage (from the doomsday-video folder):
    python tools/build_audio.py --model path/to/kokoro-v1.0.onnx --voices path/to/voices-v1.0.bin

Outputs:
    public/audio/soundtrack.wav   final mix (voice + music + sfx), loudness-normalized to -14 LUFS
    out/stems/voice.wav, out/stems/music.wav
    src/data/timeline.json        scene + line timings consumed by the Remotion composition
    youtube/captions.srt          upload to YouTube as the subtitle track
    youtube/chapters.txt          paste into the YouTube description
"""

import argparse
import hashlib
import json
import math
import os
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
from scipy.signal import butter, oaconvolve, resample_poly, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
VOICE_SR = 24000
rng = np.random.default_rng(1218)


# ---------------------------------------------------------------- narration


def synth_lines(script, model, voices):
    from kokoro_onnx import Kokoro

    meta = script["meta"]
    cache = ROOT / "out" / "tts-cache"
    cache.mkdir(parents=True, exist_ok=True)
    kokoro = None
    clips = {}
    for scene in script["scenes"]:
        for line in scene.get("lines", []):
            text = line.get("say", line["t"])
            key = hashlib.sha1(f"{meta['voice']}|{meta['speed']}|{text}".encode()).hexdigest()[:16]
            path = cache / f"{key}.wav"
            if not path.exists():
                if kokoro is None:
                    kokoro = Kokoro(model, voices)
                samples, sr = kokoro.create(text, voice=meta["voice"], speed=meta["speed"], lang="en-us")
                assert sr == VOICE_SR
                sf.write(path, samples, sr)
                print(f"  tts  {text[:70]}")
            audio, _ = sf.read(path, dtype="float32")
            clips[text] = trim(audio)
    return clips


def trim(audio, thresh=0.012, margin=0.04):
    idx = np.where(np.abs(audio) > thresh)[0]
    if len(idx) == 0:
        return audio
    pad = int(margin * VOICE_SR)
    return audio[max(0, idx[0] - pad) : min(len(audio), idx[-1] + pad)]


# ---------------------------------------------------------------- timeline


def build_timeline(script, clips):
    meta = script["meta"]
    fps = meta["fps"]
    frame = 0
    scenes = []
    for scene in script["scenes"]:
        out = {k: v for k, v in scene.items() if k != "lines"}
        out["from"] = frame
        lines = []
        if scene.get("lines"):
            cursor = meta["scenePre"]
            for i, line in enumerate(scene["lines"]):
                audio = clips[line.get("say", line["t"])]
                dur = len(audio) / VOICE_SR
                entry = {k: v for k, v in line.items() if k != "say"}
                entry["start"] = round(cursor, 3)
                entry["end"] = round(cursor + dur, 3)
                entry["from"] = round(cursor * fps)
                entry["to"] = round((cursor + dur) * fps)
                entry["_audio"] = line.get("say", line["t"])
                lines.append(entry)
                cursor += dur + (meta["lineGap"] if i < len(scene["lines"]) - 1 else 0)
            seconds = cursor + meta["scenePost"] + scene.get("tail", 0)
        else:
            seconds = scene["duration"]
        out["lines"] = lines
        out["durationInFrames"] = int(math.ceil(seconds * fps))
        frame += out["durationInFrames"]
        scenes.append(out)
    return {"fps": fps, "width": 1920, "height": 1080, "durationInFrames": frame, "scenes": scenes}


def render_voice(timeline, clips):
    fps = timeline["fps"]
    total = int(timeline["durationInFrames"] / fps * VOICE_SR) + VOICE_SR
    voice = np.zeros(total, dtype=np.float32)
    for scene in timeline["scenes"]:
        base = scene["from"] / fps
        for line in scene["lines"]:
            audio = clips[line.pop("_audio")]
            start = int((base + line["start"]) * VOICE_SR)
            voice[start : start + len(audio)] += audio
    voice = voice / (np.max(np.abs(voice)) + 1e-9) * 0.9
    voice48 = resample_poly(voice, 2, 1).astype(np.float32)
    # gentle presence lift + low-cut for a broadcast feel
    voice48 = sosfilt(butter(2, 80, "highpass", fs=SR, output="sos"), voice48)
    return voice48


# ---------------------------------------------------------------- score


def saw_additive(freq, t, harmonics=10, rolloff=1.25, phase=0.0):
    out = np.zeros_like(t)
    for h in range(1, harmonics + 1):
        if freq * h > 9000:
            break
        out += np.sin(2 * np.pi * freq * h * t + phase * h) / (h**rolloff)
    return out


CHORDS = [
    [110.0, 164.81, 220.0, 261.63, 329.63],  # Am
    [87.31, 130.81, 174.61, 220.0, 261.63],  # F
    [73.42, 146.83, 220.0, 293.66, 349.23],  # Dm
    [82.41, 123.47, 164.81, 207.65, 246.94],  # E
]
CHORD_LEN = 5.0


def pad_loop():
    seg_len = CHORD_LEN + 1.6
    n_loop = int(CHORD_LEN * len(CHORDS) * SR)
    left = np.zeros(n_loop + int(seg_len * SR), dtype=np.float64)
    right = np.zeros_like(left)
    t = np.arange(int(seg_len * SR)) / SR
    env = np.minimum(1, t / 1.4) * np.clip((seg_len - t) / 1.6, 0, 1)
    for ci, chord in enumerate(CHORDS):
        start = int(ci * CHORD_LEN * SR)
        for note in chord:
            for cents, pan in ((-9, 0.25), (0, 0.5), (8, 0.75)):
                f = note * 2 ** (cents / 1200)
                wave = saw_additive(f, t, harmonics=8, rolloff=1.6, phase=rng.uniform(0, 6.28)) * env
                left[start : start + len(t)] += wave * (1 - pan)
                right[start : start + len(t)] += wave * pan
        # sub
        sub = np.sin(2 * np.pi * (chord[0] / 2 if chord[0] > 80 else chord[0]) * t) * env * 1.6
        left[start : start + len(t)] += sub
        right[start : start + len(t)] += sub
    # wrap the tail into the loop start so it tiles seamlessly
    tail = len(left) - n_loop
    left[:tail] += left[n_loop:]
    right[:tail] += right[n_loop:]
    loop = np.stack([left[:n_loop], right[:n_loop]], axis=1)
    loop = sosfilt(butter(2, 1800, "lowpass", fs=SR, output="sos"), loop, axis=0)
    return loop / np.max(np.abs(loop))


def ostinato_loop():
    """Low staccato pulse (8th notes) that follows the chord roots."""
    n_loop = int(CHORD_LEN * len(CHORDS) * SR)
    out = np.zeros(n_loop + SR, dtype=np.float64)
    step = 60 / 132 / 2
    note_t = np.arange(int(0.22 * SR)) / SR
    env = np.exp(-note_t / 0.06)
    pattern = [1, 1, 2, 1, 1, 2, 1.5, 1]
    k = 0
    pos = 0.0
    while pos < CHORD_LEN * len(CHORDS):
        chord = CHORDS[int(pos // CHORD_LEN) % len(CHORDS)]
        root = chord[0] if chord[0] < 100 else chord[0] / 2
        f = root * pattern[k % len(pattern)]
        s = int(pos * SR)
        out[s : s + len(note_t)] += saw_additive(f, note_t, harmonics=7, rolloff=1.1) * env
        pos += step
        k += 1
    out[: SR] += out[n_loop:]
    out = sosfilt(butter(2, 900, "lowpass", fs=SR, output="sos"), out[:n_loop])
    return out / np.max(np.abs(out))


def shimmer_loop():
    n_loop = int(CHORD_LEN * len(CHORDS) * SR)
    t = np.arange(n_loop) / SR
    out = np.zeros(n_loop)
    for ci, chord in enumerate(CHORDS):
        s, e = int(ci * CHORD_LEN * SR), int((ci + 1) * CHORD_LEN * SR)
        seg_t = t[s:e] - t[s]
        env = np.minimum(1, seg_t / 0.8) * np.minimum(1, (CHORD_LEN - seg_t) / 0.8)
        for note in chord[-2:]:
            out[s:e] += np.sin(2 * np.pi * note * 4 * seg_t) * env * (0.6 + 0.4 * np.sin(2 * np.pi * 5.5 * seg_t))
    return out / np.max(np.abs(out))


def tile(loop, n):
    reps = int(np.ceil(n / len(loop)))
    if loop.ndim == 1:
        return np.tile(loop, reps)[:n]
    return np.tile(loop, (reps, 1))[:n]


def kick(n=None):
    t = np.arange(int(0.45 * SR)) / SR
    freq = 40 + 70 * np.exp(-t / 0.03)
    phase = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(phase) * np.exp(-t / 0.13)


def impact():
    t = np.arange(int(3.2 * SR)) / SR
    freq = 28 + 110 * np.exp(-t / 0.12)
    boom = np.sin(2 * np.pi * np.cumsum(freq) / SR) * np.exp(-t / 0.7)
    noise = rng.standard_normal(len(t)) * np.exp(-t / 0.05)
    crack = sosfilt(butter(2, [300, 4000], "bandpass", fs=SR, output="sos"), noise)
    tail = sosfilt(butter(2, 400, "lowpass", fs=SR, output="sos"), rng.standard_normal(len(t))) * np.exp(-t / 0.9) * 0.6
    return boom * 1.0 + crack * 0.5 + tail * 0.5


def riser(length=1.1):
    t = np.arange(int(length * SR)) / SR
    noise = rng.standard_normal(len(t))
    env = (t / length) ** 2.2
    hp = sosfilt(butter(2, 1500, "highpass", fs=SR, output="sos"), noise)
    lp = sosfilt(butter(2, 700, "lowpass", fs=SR, output="sos"), noise)
    mix = (lp * (1 - t / length) + hp * (t / length)) * env
    return mix


def tick():
    t = np.arange(int(0.05 * SR)) / SR
    return sosfilt(butter(2, 2500, "highpass", fs=SR, output="sos"), rng.standard_normal(len(t))) * np.exp(-t / 0.006)


def hit():
    """Short low thud + glitch used for kicker words and rumor cards."""
    t = np.arange(int(0.6 * SR)) / SR
    thud = np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-t / 0.04)) / SR) * np.exp(-t / 0.18)
    glitch = sosfilt(butter(2, [1200, 6000], "bandpass", fs=SR, output="sos"), rng.standard_normal(len(t))) * np.exp(-t / 0.03)
    return thud + glitch * 0.4


def place(track, clip, at, gain=1.0):
    s = int(at * SR)
    if s < 0:
        clip = clip[-s:]
        s = 0
    e = min(len(track), s + len(clip))
    if e <= s:
        return
    if track.ndim == 2:
        track[s:e] += (clip[: e - s] * gain)[:, None]
    else:
        track[s:e] += clip[: e - s] * gain


INTENSE = {"coldOpen", "rumor", "teasers", "disclaimer"}
DRIVING = {"beats", "universes", "title"}


def build_music(timeline, n):
    fps = timeline["fps"]
    pad = tile(pad_loop(), n)
    ost = tile(ostinato_loop(), n)
    shim = tile(shimmer_loop(), n)

    # per-sample intensity envelopes for each layer, set per scene type
    ost_env = np.zeros(n)
    kick_times = []
    shim_env = np.zeros(n)
    for sc in timeline["scenes"]:
        s = int(sc["from"] / fps * SR)
        e = min(n, int((sc["from"] + sc["durationInFrames"]) / fps * SR))
        if sc["type"] in INTENSE:
            ost_env[s:e] = 1.0
            beat = 60 / 72
            t0 = sc["from"] / fps
            k = 0
            while t0 + k * beat < (sc["from"] + sc["durationInFrames"]) / fps:
                kick_times.append(t0 + k * beat)
                k += 1
        elif sc["type"] in DRIVING:
            ost_env[s:e] = 0.6
        if sc["type"] in {"outro", "quote", "watchlist", "universes"}:
            shim_env[s:e] = 1.0
    smooth = lambda x: uniform_filter1d(x, int(0.8 * SR))
    ost_env, shim_env = smooth(ost_env), smooth(shim_env)

    music = pad * 0.55
    music[:, 0] += ost * ost_env * 0.32
    music[:, 1] += ost * ost_env * 0.32
    music[:, 0] += shim * shim_env * 0.05
    music[:, 1] += shim * shim_env * 0.05
    kk = kick()
    for kt in kick_times:
        place(music, kk, kt, 0.55)

    # synthetic hall reverb
    ir_t = np.arange(int(2.4 * SR)) / SR
    ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t / 0.55)[:, None]
    ir = sosfilt(butter(2, 3500, "lowpass", fs=SR, output="sos"), ir, axis=0)
    ir /= np.sqrt(np.sum(ir**2, axis=0))
    wet = np.stack([oaconvolve(music[:, c], ir[:, c])[:n] for c in range(2)], axis=1)
    music = music * 0.75 + wet * 0.45

    # fade in/out
    fade = int(1.5 * SR)
    music[:fade] *= np.linspace(0, 1, fade)[:, None]
    end_n = int(timeline["durationInFrames"] / fps * SR)
    music[end_n - int(3 * SR) : end_n] *= np.linspace(1, 0, int(3 * SR))[:, None]
    music[end_n:] = 0
    return music


def build_sfx(timeline, n):
    fps = timeline["fps"]
    sfx = np.zeros((n, 2))
    imp, ris, ht, tk = impact(), riser(), hit(), tick()
    for sc in timeline["scenes"]:
        t0 = sc["from"] / fps
        if sc.get("sfx") == "impact":
            place(sfx, ris, t0 - len(ris) / SR, 0.35)
            place(sfx, imp, t0, 0.9)
        if sc["type"] == "coldOpen":
            for line in sc["lines"]:
                place(sfx, ht, t0 + line["start"], 0.55)
            k = 0.0
            end = (sc["from"] + sc["durationInFrames"]) / fps
            while t0 + k < end:
                place(sfx, tk, t0 + k, 0.12)
                k += 0.5
        if sc["type"] in {"rumor", "disclaimer"}:
            place(sfx, ht, t0 + 0.05, 0.45)
    return sfx


def duck(music, voice):
    env = np.abs(voice)
    env = maximum_filter1d(env, int(0.12 * SR))
    env = uniform_filter1d(env, int(0.35 * SR))
    active = np.clip(env / 0.08, 0, 1)
    gain = 1 - 0.55 * active
    return music * gain[:, None]


def limiter(x, ceiling=0.89):
    peak = np.max(np.abs(x), axis=1)
    g = np.minimum(1.0, ceiling / (peak + 1e-9))
    g = minimum_filter1d(g, int(0.02 * SR))
    g = uniform_filter1d(g, int(0.012 * SR))
    g = np.minimum(g, 1.0)
    y = x * g[:, None]
    return np.clip(y, -0.98, 0.98)


# ---------------------------------------------------------------- outputs


def fmt_srt(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def write_youtube(timeline):
    fps = timeline["fps"]
    yt = ROOT / "youtube"
    yt.mkdir(exist_ok=True)
    srt, i = [], 1
    for sc in timeline["scenes"]:
        for line in sc["lines"]:
            a = sc["from"] / fps + line["start"]
            b = sc["from"] / fps + line["end"]
            srt.append(f"{i}\n{fmt_srt(a)} --> {fmt_srt(b)}\n{line['t']}\n")
            i += 1
    (yt / "captions.srt").write_text("\n".join(srt))

    chapters = ["0:00 Intro"]
    for sc in timeline["scenes"]:
        if sc["type"] == "chapter":
            sec = int(sc["from"] / fps)
            title = sc["title"].title().replace("& ", "& ").replace("X-Men", "X-Men")
            chapters.append(f"{sec // 60}:{sec % 60:02} {title}")
    (yt / "chapters.txt").write_text("\n".join(chapters) + "\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--voices", required=True)
    args = ap.parse_args()

    script = json.loads((ROOT / "script" / "script.json").read_text())
    print("synthesizing narration…")
    clips = synth_lines(script, args.model, args.voices)
    timeline = build_timeline(script, clips)
    total_s = timeline["durationInFrames"] / timeline["fps"]
    print(f"timeline: {timeline['durationInFrames']} frames = {total_s / 60:.2f} min")

    voice = render_voice(timeline, clips)
    n = int(total_s * SR) + SR
    voice = np.pad(voice, (0, max(0, n - len(voice))))[:n]
    print("composing score…")
    music = build_music(timeline, n)
    music = duck(music, voice)
    sfx = build_sfx(timeline, n)

    import pyloudnorm as pyln

    meter = pyln.Meter(SR)
    v_st = np.stack([voice, voice], axis=1)
    v_l = meter.integrated_loudness(v_st)
    m_l = meter.integrated_loudness(music)
    # music bed sits ~17 LU under the narration
    music *= 10 ** (((v_l - 17) - m_l) / 20)
    sfx *= 10 ** (((v_l - 9) - meter.integrated_loudness(sfx + 1e-7)) / 20)
    mix = v_st + music + sfx
    mix *= 10 ** ((-14 - meter.integrated_loudness(mix)) / 20)
    mix = limiter(mix)
    mix = mix[: int(total_s * SR)]
    print(f"final loudness: {meter.integrated_loudness(mix):.1f} LUFS, peak {np.max(np.abs(mix)):.2f}")

    (ROOT / "public" / "audio").mkdir(parents=True, exist_ok=True)
    (ROOT / "out" / "stems").mkdir(parents=True, exist_ok=True)
    sf.write(ROOT / "public" / "audio" / "soundtrack.wav", mix.astype(np.float32), SR, subtype="PCM_16")
    sf.write(ROOT / "out" / "stems" / "voice.wav", voice[: len(mix)].astype(np.float32), SR, subtype="PCM_16")
    sf.write(ROOT / "out" / "stems" / "music.wav", (music + sfx)[: len(mix)].astype(np.float32) * 0.9, SR, subtype="PCM_16")

    (ROOT / "src" / "data").mkdir(parents=True, exist_ok=True)
    (ROOT / "src" / "data" / "timeline.json").write_text(json.dumps(timeline, indent=1))
    write_youtube(timeline)
    print("done.")


if __name__ == "__main__":
    main()
