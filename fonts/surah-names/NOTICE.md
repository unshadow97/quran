# Surah name font

`sura_names_v2.woff2` renders each of the 114 surah names as the calligraphic
heading printed in the Madani mushaf — `سُورَةُ الفَاتِحَة` rather than the name set
in an ordinary Arabic face.

## Where it came from

Downloaded unmodified from the Quran.com asset CDN, which serves it for the
same purpose:

    https://static.qurancdn.com/fonts/quran/surah-names/v2/sura_names.woff2

The typeface originates with the **King Fahd Glorious Quran Printing Complex
(KFGQPC)**, who publish the Madani mushaf this app's page images and text
follow.

## Terms

KFGQPC grant permission, free of charge, to use, copy and distribute their font
software. They retain ownership, and the font may not be sold, modified,
altered, translated, reverse-engineered, decompiled or disassembled.

This repository complies: the file is committed byte-for-byte as downloaded,
is not sold, and nothing here alters it.

## How it is used

The font is ligature-based rather than mapped to Unicode. A heading is the
zero-padded surah number and nothing else:

    001  →  سُورَةُ الفَاتِحَة
    114  →  سُورَةُ النَّاس

**Version 2, deliberately.** Version 1 keys on `surah001` and draws the two
words in an order that only reads correctly when the run is laid out
right-to-left — which it never is, since the source characters are Latin. It
prints الفاتحة before سورة. Neither `dir` nor `unicode-bidi` fixes that:
forcing the run right-to-left reverses the digits as well, so `001` matches
`100` and Al-Fatihah renders as Al-Adiyat. Version 2 gets the order right from
a plain digit ligature.

Because the source text is meaningless without the font, `font-display: block`
is used so nothing is painted until the font arrives — with `swap` a reader
would briefly see `001` in the middle of a mushaf page. The accessible name
comes from a visually hidden label beside it, never from the ligature text.

See `src/features/quran/SurahCartouche.tsx`.
