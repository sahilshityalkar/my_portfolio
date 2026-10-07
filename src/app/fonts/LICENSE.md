# Font licenses

Both families are licensed under the SIL Open Font License 1.1
(https://openfontlicense.org), which permits self-hosting and redistribution.

- **Newsreader** (variable, wght + opsz; instanced and subset, see below): Production Type, for Google Fonts.
  Source: https://github.com/productiontype/Newsreader, via Fontsource `@fontsource-variable/newsreader@5.3.0`.
- **IBM Plex Mono** (400, 500; Latin subset): IBM Corp.
  Source: https://github.com/IBM/plex, via Fontsource `@fontsource/ibm-plex-mono@5.3.0`.

## Optimisation

The Newsreader files are instanced and subset with fontTools (OFL permits
modification). The roman keeps optical sizes 12 to 72 and weights 300 to 500. The
italic is used only at display sizes, so it's pinned to optical size 60 with
weights 300 to 400. Both are subset to Latin-1, general punctuation and arrows.
Together they're 142 KB instead of 279 KB. Commands:

    fonttools varLib.instancer newsreader-latin-standard-normal.woff2 wght=300:500 opsz=12:72
    fonttools varLib.instancer newsreader-latin-standard-italic.woff2 wght=300:400 opsz=60
    fonttools subset <instanced>.ttf --flavor=woff2 \
      --unicodes="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2010-2027,U+2030-203A,U+2190-2199,U+2212" \
      --layout-features="kern,liga,calt,onum,lnum,case,ccmp,locl,mark,mkmk"
