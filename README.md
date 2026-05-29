# 🐾 Pawfect Match

A friendly **pet adoption / matching** website — helping people find their perfect rescue
companion. Built as a fast, dependency-free static site (plain HTML + one shared stylesheet +
one shared script), with all visuals done in emoji (no image assets).

**Live site:** https://iriss-086.github.io/my-first-website/

## Pages

| Page | What it does |
|------|--------------|
| `index.html` | Home — hero, how it works, why adopt, featured pets, stats, testimonials, newsletter |
| `pets.html` | Browse adoptable pets with live species filtering and savable favorites |
| `match.html` | A 5-question quiz that suggests the kind of pet that fits your lifestyle |
| `about.html` | Mission, values, stats, and the team |
| `contact.html` | Validated contact form + FAQ accordion |

## Structure

```
.
├── index.html  pets.html  match.html  about.html  contact.html
├── css/style.css   # design system: tokens, components, responsive layout
├── js/main.js      # nav, pet filter, favorites, FAQ, match quiz, form validation, toast
└── .github/workflows/deploy.yml   # CI: validate HTML → deploy to GitHub Pages
```

## Run locally

It's a static site — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## CI / Deploy

Every push to `main` runs the **Build & Deploy** workflow:

1. **Validate** — `htmlhint` lints every page and a script checks that all internal links resolve.
2. **Deploy** — on success, the site is published to GitHub Pages.

## Design

- Palette: warm cream + calm teal (`#2A9D8F`) + friendly coral (`#FF8C61`)
- Fonts: Quicksand (headings) + Nunito (body)
- Fully responsive, accessible labels, no build step or external dependencies
