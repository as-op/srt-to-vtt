# SRT → VTT Converter

A lightweight, browser-based tool to convert SubRip (`.srt`) subtitle files to WebVTT (`.vtt`). 
No server, no uploads, no dependencies - everything runs locally in the browser.

## Features

- Drag & drop or file picker - select multiple files at once
- Instant in-browser conversion, nothing leaves your machine
- Per-file preview and download, plus a single **Download all** button
- Handles Windows (CRLF), Unix (LF), and old Mac (CR) line endings
- Strips UTF-8 BOM automatically

## Usage

Online: https://as-op.github.io/srt-to-vtt/

Locally: Open `docs/index.html` in any modern browser and drop your `.srt` files onto the page.

```
srt-to-vtt/
├── docs/
│   ├── index.html     
│   ├── style.css
│   ├── srt2vtt.js     ← conversion logic
│   └── app.js         ← UI logic
└── tests/
    └── srt2vtt.test.js
```

## What the conversion does

The SRT → VTT transformation is intentionally minimal:

1. Strip UTF-8 BOM if present
2. Normalize line endings to `\n`
3. Replace timestamp commas with dots: `00:00:01,000` → `00:00:01.000`
4. Prepend the `WEBVTT` header

Everything else - cue IDs, text content, formatting tags - is left untouched.

## Development

Install dependencies and run the test suite:

```sh
npm install
npm test
```

The core logic lives in `docs/srt2vtt.js` and exports `srtToVtt` and `vttFilename` as CommonJS for testing, while also working as plain browser globals.

## Tests

18 unit tests covering timestamp conversion, multi-cue files, multi-line text, line-ending normalization, BOM stripping, and filename handling.

## License

MIT
