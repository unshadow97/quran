# Uthmanic Hafs

`UthmanicHafs1Ver18.woff2` sets the basmalah printed under a surah heading on
the mushaf page.

## Why this font, for this one thing

The page itself is drawn with the King Fahd Complex's per-page fonts, in which
one word is one glyph. Those fonts have no basmalah: checked against the pages
themselves, the only codepoints in them that the page data does not use are
control characters and a space. The API carries none either — a page that
opens a surah returns only `word` and `end` glyphs, and the line the basmalah
is printed on comes back empty. So the basmalah has to be set from our own
text, in a text face.

Which face decides whether it looks like part of the page. This is **KFGQPC
HAFS Uthmanic Script**, the Complex's own text font, drawn in the same hand by
the same publisher as the page fonts. Amiri Quran, which it replaced here, is a
fine Quranic face from a different tradition — Bulaq press Naskh rather than
Uthman Taha's Madani hand — and under a Madani heading it reads as a line
borrowed from another book.

It is used **only** for that basmalah. Everywhere else the Arabic face is
unchanged.

## Coverage, verified

All four words of the basmalah, and every codepoint in them, are in this
font's cmap. Checked with `scripts/woff2-cmap.mjs` against the committed file.

## Where it came from

Downloaded unmodified from the Quran.com asset CDN, which serves it for the
same purpose:

    https://verses.quran.foundation/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2

    sha256  8c00e7a7d5f773bcfb1642fdcfba505dbd81975fef39f14718827a32d075020c

Internal name: *KFGQPC HAFS Uthmanic Script*, Version 0.18, ISBN
978-603-8010-15-0.

## Terms

KFGQPC grant permission, free of charge, to use, copy and distribute their font
software. They retain ownership, and the font may not be sold, modified,
altered, translated, reverse-engineered, decompiled or disassembled.

This repository complies: the file is committed byte-for-byte as downloaded,
is not sold, and nothing here alters it. The same terms cover
`public/fonts/surah-names/` and `public/fonts/qcf/`.
