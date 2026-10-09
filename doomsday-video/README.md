# Avengers: Doomsday — "Everything You Need to Know" (YouTube video)

A ~12-minute, 1080p explainer video (plus a vertical YouTube Short cut) built in code with [Remotion](https://remotion.dev): narration, original score, motion graphics, chapters, captions and a thumbnail.

```
script/script.json        the narration + on-screen data for every scene (edit this)
tools/build_audio.py      TTS narration → score + SFX → mix → src/data/timeline.json, youtube/captions.srt, chapters
tools/scan_media.mjs      registers your stills in public/media → src/data/media.json
tools/preview_frames.mjs  renders one preview still per scene into out/preview/
src/                      Remotion composition (scenes in src/scenes/)
youtube/                  thumbnail, captions.srt, chapters, UPLOAD.md (title/description/tags)
```

## Rebuild from scratch

```bash
npm install

# 1) Narration + music (Python 3.10+)
python -m venv .venv && .venv/bin/pip install kokoro-onnx soundfile numpy scipy pyloudnorm
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
.venv/bin/python tools/build_audio.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin

# 2) Stills (optional, see below) + render
npm run media
npm run render       # → out/avengers-doomsday-explained.mp4
npm run thumbnail    # → youtube/thumbnail.png
npm run short        # → out/avengers-doomsday-short.mp4 (vertical 40s YouTube Short)
npm run dev          # preview / tweak in Remotion Studio
```

Change the narrator in `script/script.json → meta.voice` (e.g. `am_fenrir`, `bm_george`, `af_heart`) and `meta.speed`.
Any edit to the narration needs step 1 again, because scene timings come from the audio.

To use **your own voice**: record each line, or record the whole read and swap `public/audio/soundtrack.wav`. The timings in `src/data/timeline.json` must still match; the easiest route is to keep the TTS timings and read along with `youtube/captions.srt`.

## Adding images (recommended)

Every scene has a media slot. Drop a still into `public/media/` named after the slot, run `npm run media`, and re-render. The image replaces the emblem placeholder with a slow Ken Burns push and a colour grade:

| file name (any of .jpg .png .webp) | where it shows |
|---|---|
| `doom` | Doctor Doom case file |
| `thor`, `steve`, `sam`, `thunderbolts`, `fantastic-four`, `wakanda` | hero case files |
| `loki`, `shang-chi`, `ant-man` | "wild cards" cards |
| `first-steps`, `sentinels`, `trailer` | monitor next to the beat lists |
| `teaser-1` … `teaser-4` | the four teaser monitors |
| `thumbnail` | background of the thumbnail |

Use official promotional stills or your own screenshots, keep them on screen with commentary, and avoid leaked material. See `youtube/UPLOAD.md` for copyright notes.

## Licenses

Fonts in `public/fonts` are Bebas Neue, Inter and Oswald (SIL Open Font License, via Fontsource). Narration model: Kokoro-82M (Apache-2.0). Music and SFX are synthesized by `tools/build_audio.py`.
