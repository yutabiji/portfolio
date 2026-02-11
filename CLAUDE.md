# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an actor's portfolio website built with **Astro** and deployed via **GitHub Pages**. The site is data-driven, using YAML and Markdown files to manage content (roles, works, profile info) without requiring code changes for updates.

## Tech Stack

- **Framework:** Astro (optimized for Markdown/YAML content and static site generation)
- **Styling:** Tailwind CSS (responsive design)
- **Deployment:** GitHub Pages with GitHub Actions for automated builds
- **Data Management:** YAML (structured content like works) and Markdown (longer-form content like profile)

## Project Structure

Once initialized, the key directories will be:

- `/src/pages/` - Astro page components (Home, Profile, Works, Gallery, Contact)
- `/src/components/` - Reusable Astro/component files
- `/src/content/` - Content data (works.yml, profile.md, etc.)
- `/public/` - Static assets (images, PDFs)
- `.github/workflows/` - GitHub Actions deployment configuration
- `astro.config.mjs` - Astro configuration

## Data Structure

### Content Files

The site uses two primary data management approaches:

1. **YAML Files** (`/src/content/`):
   - `works.yml` - Career/works list (movies, TV, stage)
   - Site metadata and structured data

2. **Markdown Files** (`/src/content/`):
   - `profile.md` - Biographical information with frontmatter (name, skills, etc.)

### Key Pattern

Use Astro's `getCollection()` to load YAML/Markdown content and automatically render it. This enables the "add data, content auto-generates" workflow.

## Common Development Commands

Once `package.json` is set up:

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

## Important Considerations

- **Image Optimization:** Use Astro's `assets` feature for automatic WebP conversion and optimization (critical for photo-heavy actor portfolio)
- **OGP/Social Meta:** Configure OGP tags for proper SNS sharing with actor's photo and name
- **PDF Generation (Future):** The profile data can be repurposed to generate printable PDF profiles for auditions
- **GitHub Actions:** Deployment workflow should be configured in `.github/workflows/deploy.yml` to auto-publish on push to `main`

## Architecture Philosophy

This is a **content-first, low-maintenance design**:
- All content updates happen in YAML/Markdown files, not in code
- Astro's `getCollection()` API automatically discovers and renders content
- No database or CMS needed
- Fully static output suitable for GitHub Pages
