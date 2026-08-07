# eason523.github.io

Personal site of ***eason* **— a CS student building software for calm, useful tools.

## What's here

- **`/`** — the personal homepage (this README's index).
  Bilingual (中文 / English), follows your OS light/dark theme, with subtle motion.
  Static HTML + CSS + JS — no build step.
- **`/editor/`** — a node-based dialogue tree editor, kept around for posterity.
  Originally at the repo root; moved here when the homepage took over.

## Local preview

The whole thing is plain HTML — just open `index.html` in a browser, or serve the directory:

```bash
# from the repo root
python -m http.server 8000
# then open http://localhost:8000
```

## Customising

All placeholder strings live in [`main.js`](./main.js) under `PLACEHOLDERS`
(name, email, school, tagline, bio). Project copy lives in [`i18n.js`](./i18n.js).
Project covers go in [`/PNG/`](./PNG/).

## License

MIT — do whatever you want with the code, attribution appreciated.
