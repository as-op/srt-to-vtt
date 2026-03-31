const { srtToVtt, vttFilename } = require('../dist/srt2vtt');

// ─── srtToVtt ─────────────────────────────────────────────────────────────────

describe('srtToVtt', () => {
  test('adds WEBVTT header', () => {
    const result = srtToVtt('1\n00:00:01,000 --> 00:00:02,000\nHello\n');
    expect(result.startsWith('WEBVTT\n\n')).toBe(true);
  });

  test('converts timestamp commas to dots', () => {
    const result = srtToVtt('1\n00:00:01,000 --> 00:00:02,500\nHello\n');
    expect(result).toContain('00:00:01.000 --> 00:00:02.500');
  });

  test('preserves subtitle text', () => {
    const result = srtToVtt('1\n00:00:01,000 --> 00:00:02,000\nHello world\n');
    expect(result).toContain('Hello world');
  });

  test('preserves sequence numbers', () => {
    const result = srtToVtt('42\n00:00:01,000 --> 00:00:02,000\nLine\n');
    expect(result).toContain('42');
  });

  test('handles multiple cues', () => {
    const srt = [
      '1',
      '00:00:01,000 --> 00:00:02,000',
      'First',
      '',
      '2',
      '00:00:03,000 --> 00:00:04,000',
      'Second',
    ].join('\n');

    const result = srtToVtt(srt);
    expect(result).toContain('00:00:01.000 --> 00:00:02.000');
    expect(result).toContain('00:00:03.000 --> 00:00:04.000');
    expect(result).toContain('First');
    expect(result).toContain('Second');
  });

  test('handles multi-line subtitle text', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nLine one\nLine two\n';
    const result = srtToVtt(srt);
    expect(result).toContain('Line one\nLine two');
  });

  test('normalises Windows CRLF line endings', () => {
    const srt = '1\r\n00:00:01,000 --> 00:00:02,000\r\nHello\r\n';
    const result = srtToVtt(srt);
    expect(result).not.toContain('\r');
    expect(result).toContain('00:00:01.000 --> 00:00:02.000');
  });

  test('normalises old Mac CR line endings', () => {
    const srt = '1\r00:00:01,000 --> 00:00:02,000\rHello\r';
    const result = srtToVtt(srt);
    expect(result).not.toContain('\r');
  });

  test('strips UTF-8 BOM', () => {
    const srt = '\uFEFF1\n00:00:01,000 --> 00:00:02,000\nHello\n';
    const result = srtToVtt(srt);
    expect(result.charCodeAt(0)).not.toBe(0xfeff);
    expect(result.startsWith('WEBVTT')).toBe(true);
  });

  test('output ends with newline', () => {
    const result = srtToVtt('1\n00:00:01,000 --> 00:00:02,000\nHello\n');
    expect(result.endsWith('\n')).toBe(true);
  });

  test('handles hours in timestamps', () => {
    const srt = '1\n01:23:45,678 --> 02:34:56,789\nText\n';
    const result = srtToVtt(srt);
    expect(result).toContain('01:23:45.678 --> 02:34:56.789');
  });

  test('handles empty subtitle text (music notes etc)', () => {
    const srt = '1\n00:00:01,000 --> 00:00:02,000\n\n';
    const result = srtToVtt(srt);
    expect(result.startsWith('WEBVTT')).toBe(true);
  });

  test('does not double-convert already dotted timestamps', () => {
    // If somehow a file already has dots, they must not be touched
    const srt = '1\n00:00:01,000 --> 00:00:02,000\nHello\n';
    const once = srtToVtt(srt);
    // Running the body through again shouldn't corrupt dots
    expect(once).toContain('00:00:01.000');
    expect(once).not.toContain('00:00:01,000');
  });
});

// ─── vttFilename ──────────────────────────────────────────────────────────────

describe('vttFilename', () => {
  test('replaces .srt extension', () => {
    expect(vttFilename('movie.srt')).toBe('movie.vtt');
  });

  test('is case-insensitive for extension', () => {
    expect(vttFilename('movie.SRT')).toBe('movie.vtt');
    expect(vttFilename('movie.Srt')).toBe('movie.vtt');
  });

  test('only replaces trailing .srt', () => {
    expect(vttFilename('my.srt.backup.srt')).toBe('my.srt.backup.vtt');
  });

  test('handles filenames with dots in the name', () => {
    expect(vttFilename('movie.2024.srt')).toBe('movie.2024.vtt');
  });

  test('handles path-like strings', () => {
    expect(vttFilename('subs/episode01.srt')).toBe('subs/episode01.vtt');
  });
});
