// Core SRT → VTT conversion logic.
// Works as a browser global and as a CommonJS module (for tests).

function srtToVtt(srtText) {
  // Strip BOM if present
  let text = srtText.replace(/^\uFEFF/, '');

  // Normalise line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Replace SRT timestamp commas with dots  (00:00:01,000 → 00:00:01.000)
  text = text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');

  return 'WEBVTT\n\n' + text + '\n';
}

function vttFilename(srtName) {
  return srtName.replace(/\.srt$/i, '.vtt');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { srtToVtt, vttFilename };
}
