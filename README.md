# Fabian Ramseier – Portfolio

Personal portfolio website built as an individual project for the Web Engineering module at Berner Fachhochschule (Fachschule Bern).

**Live site:** https://ajax994.github.io/EWEB--Portfolio-Page-Fabian-Ramseier/

---

## About the Project

A single-page portfolio showcasing professional experience, skills, and projects. The site targets recruiters and potential collaborators, with a dedicated AI-powered recruiter chat that assesses candidate fit for a given role.

---

## Features

- **Recruiter Chat** — AI-powered chat (Anthropic Claude API) that evaluates Fabian's fit for a described role, with predefined sample prompts for quick testing
- **Skills Section** — Interactive radar and bar charts (Chart.js) loaded from a JSON data source
- **Projects Grid** — Filterable project cards with category tags and direct links
- **Contact Form** — Client-side validated form submitted via Formspree
- **Section Animations** — Intersection Observer-based fade-in and slide-up on scroll
- **Responsive Design** — Three breakpoints (480px, 768px, 1024px), mobile burger menu, fully fluid layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 (semantic elements) |
| Styling | CSS3 with Custom Properties, Flexbox, Grid |
| Scripting | Vanilla JavaScript (ES6+), Async/Await |
| Charts | Chart.js 4.4 |
| AI Chat | Anthropic Claude API (claude-sonnet-4-6) |
| Forms | Formspree |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (API key injection at build time) |
| Fonts | Google Fonts — Plus Jakarta Sans, Inter |

---

## Project Structure

```
├── index.html          # Single HTML entry point
├── stylesheet.css      # All styles, CSS Custom Properties, responsive breakpoints
├── script.js           # All JS logic (nav, chat, charts, animations, form)
├── assets/
│   ├── img/            # Profile picture and initials logo
│   ├── cv/             # Downloadable CV PDF
│   ├── data/           # skills.json (Chart.js data source)
│   └── projects/       # Project case study PDFs
└── .github/workflows/  # GitHub Actions deployment workflow
```

---

## Architecture Notes

**Code quality rules enforced throughout:**
- No inline styles, no `<style>` or `<script>` tags in HTML
- Mandatory file separation: HTML / CSS / JS
- CSS Custom Properties for all design tokens
- Flexbox/Grid only (no floats, no fixed pixel layouts)
- Async/await with try/catch for all API calls
- Conventional Commits for all commit messages

**API Key Security:**
The Anthropic API key is never committed to the repository. A GitHub Actions workflow injects it as an environment variable at deployment time. A spending limit and key rotation after use are in place as additional safeguards.

---

## Local Development

No build step required. Serve the root directory with any static file server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080`.

Note: The Recruiter Chat will not function locally without a valid API key in `secret.js`.

---

## Author

**Fabian Ramseier**
Product Manager · BSc Digital Business & AI (laufend), Berner Fachhochschule

[LinkedIn](https://www.linkedin.com/in/fabian-ramseier) · [GitHub](https://github.com/Ajax994)
