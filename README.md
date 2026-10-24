<div align="center">

# 🎸 Fretboard Companion

**Pick a chord. Follow the dots. Hear it. Understand it.**

An interactive guitar chord and note finder with a tiltable 3D fretboard, built-in sound and beginner-friendly music theory. Free, private and runs entirely in your browser.

[**▶ Open the app**](https://maikereis.github.io/fretboard-companion/) · [**💖 Sponsor me**](https://github.com/sponsors/maikereis) · [Report a bug](https://github.com/maikereis/fretboard-companion/issues)

![License: PolyForm Shield 1.0.0](https://img.shields.io/badge/license-PolyForm%20Shield%201.0.0-blue)
![Dependencies: none](https://img.shields.io/badge/dependencies-none-brightgreen)
![Build step: none](https://img.shields.io/badge/build-none-brightgreen)

</div>

---

## Why Fretboard Companion?

Most chord charts show you a shape and stop there. Fretboard Companion helps you see **where** a chord lives on the neck, **how** it sounds and **why** it works, all on one screen.

It is made for:

- **Beginners** learning their first chords and wondering what "major", "minor" and "7th" actually mean.
- **Self-taught players** who know a few shapes and want to connect them across the whole neck.
- **Teachers and students** who need a quick visual to point at during a lesson.

## What you can do

### See the chord
- A **chord diagram** you can switch between **finger numbers**, **note names** and **intervals**, with fret numbers and position dots.
- **Rotate** the diagram to a horizontal player view, or **tilt** it in 3D.
- A full **fretboard** showing every place the chord's notes appear on the first 15 frets. Bright dots are the chord shape, faded dots are the same notes elsewhere, and orange marks the root.
- **Tilt view** angles the neck like you are looking down at your own guitar, and each note lights up in place with a ripple as it sounds.

### Hear the chord
- **Tap any note** to hear it.
- Press **Strum** or **Arpeggio** to hear the whole chord.
- Sound is synthesized live in your browser (Karplus-Strong plucked string on the Web Audio API). No audio files, no downloads.

### Understand the chord
- The **chord formula** and what each note contributes.
- Plain-language explanations of scales, major vs minor, 7th chords and barre chords.
- **Where it lives in a key**: see which keys the chord belongs to and jump straight to its neighbours.

### Play it anywhere on the neck
- The five **CAGED shapes** (C, A, G, E, D) show the same chord in five positions, each named after the open chord it comes from.

### Make it yours
- **Light and Night** themes. It follows your device on the first visit, then remembers your choice.
- Works on desktop, tablet and phone.

## Chords included

Major, minor, major 7, dominant 7 and minor 7, on all twelve root notes, in all five CAGED shapes.

## Privacy

No accounts, no tracking, no cookies, no external requests (no CDN, no web fonts). Everything runs locally in your browser.

---

## 💖 Support the project

Fretboard Companion is free to use, and the source is available for you to read and learn from. If it helped you learn a chord, teach a lesson or just noodle around, you can help keep it growing:

<div align="center">

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?logo=github-sponsors&logoColor=white&style=for-the-badge)](https://github.com/sponsors/maikereis)

**[github.com/sponsors/maikereis](https://github.com/sponsors/maikereis)**

</div>

Other ways to help, all free:

- ⭐ **Star** the repository so more players can find it.
- 🐛 **Report** bugs or confusing explanations in [Issues](https://github.com/maikereis/fretboard-companion/issues).
- 📣 **Share** it with a friend who is learning guitar.

Thank you! Every bit of support goes toward new chord types, scales and more voicings.

---

## Roadmap

- [ ] More chord types: sus, 6th and power chords
- [ ] Scale finder
- [ ] Progression player
- [ ] More voicings per chord

Have an idea? [Open an issue](https://github.com/maikereis/fretboard-companion/issues) and tell me what would help you most.

---

## Run it yourself

**Runtime dependencies: none.** Plain HTML, CSS and JavaScript. No framework, no `node_modules`, no build step.

**Browser:** any current Chrome, Edge, Firefox or Safari (needs the Web Audio API and CSS custom properties). Audio starts after your first click or tap, which is a browser rule.

```bash
git clone https://github.com/maikereis/fretboard-companion.git
cd fretboard-companion
```

Then pick one:

| Option | How |
| --- | --- |
| Open the file | Double-click `index.html` (works because the scripts are not ES modules) |
| Node.js 18+ | `npx serve` and open the printed address (`npx http-server` also works) |
| VS Code | Install **Live Server**, right-click `index.html`, **Open with Live Server** |

Nothing needs `npm install`; `npx` tools are downloaded temporarily and not added to the project.

### Project structure

```
index.html            page markup
css/style.css         styles (light and dark mode)
js/theme.js           Light / Night switch
js/donate.js          builds the Support section
js/audio.js           sound engine (Sound.note, Sound.strum)
js/app.js             chord data, diagrams, fretboard, theory
.github/FUNDING.yml   repository Sponsor button
```

### Troubleshooting

- **No sound:** click or tap a note first (browsers block audio until a user gesture), then check that your device is not muted.

## License

Released under the [PolyForm Shield License 1.0.0](https://polyformproject.org/licenses/shield/1.0.0). See [`LICENSE`](LICENSE) for the full terms. Copyright © [maikereis](https://github.com/maikereis).
