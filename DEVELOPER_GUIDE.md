# Ashik Portfolio - Quick Developer Guide

## Tech Stack

* React + Vite
* Tailwind CSS
* Framer Motion
* EmailJS
* Static CSS gradients with a cursor-responsive fine grid in the hero

---

## Important Folders

* `src/components/` → Website sections
* `src/data/portfolioData.js` → Main editable content
* `public/` → Static files
* `public/CNAME` → Custom domain config

-- 

## Run Project

Install:npm install
Start development: npm run dev
Build production: npm run build
Preview build: npm run preview
Deploy: npm run deploy

---

## Domain Setup

Domain: ashikch.com

Hosted using: GoDaddy DNS & GitHub Pages
 
  
This guide is designed for developers taking over or collaborating on this project. It outlines the technology stack, project architecture, content configurations, domain routing (GoDaddy ➡️ GitHub Pages), build commands, and deployment steps.

---

## 1. Project Overview & Tech Stack

This website is a premium, interactive software engineering portfolio built with a futuristic glassmorphic design and smooth, responsive animations.

*   **Framework Core:** React 19 + TypeScript / JSX
*   **Build Tool & Dev Server:** Vite 8 (extremely fast compiling and hot-module reloading)
*   **Styling Engine:** Tailwind CSS v4 (using the modern `@import "tailwindcss"` engine and standard CSS `@theme` variables)
*   **Animation System:** Framer Motion 12 (smooth 3D hover actions, slide-ins, and scroll-bound animations)
*   **Hero Background:** Static CSS gradients with a 36px square grid, subtle cells, and a crisp cursor-following snake trail along grid edges (14 vertices maximum, no fade). Mouse parallax moves separate wrappers at different depths, leaving text and links stationary. Updates are batched to one frame per pointer movement and eased with CSS; no continuous JavaScript loop runs. Parallax resets on pointer leave, scroll, blur, and resize, and is disabled for touch and reduced motion. `HeroPattern.jsx` disables pointer updates off-screen, in hidden tabs, and for reduced motion. Avoid continuous full-screen WebGL rendering; it caused excessive GPU load on the live portfolio.
*   **Forms & Messaging:** EmailJS (direct mail sending from the contact form without a backend)

---

## 2. Project Architecture & Workflow

The codebase is modular, keeping components decoupled and configuration details centralized.

### File Directory Skeleton
```text
├── .github/                  # CI/CD Workflows (if configured)
├── public/                   # Static assets served directly
│   ├── CNAME                 # Custom domain configuration for hosting
│   ├── robots.txt            # Search engine crawler policies
│   └── sitemap.xml           # XML Sitemap for SEO indexation
├── src/
│   ├── assets/               # Local images, SVG icons, and portrait media
│   ├── components/           # React Functional Sections
│   │   ├── ui/               # Core atomic UI primitives
│   │   │   └── hero.tsx      # Hero title, actions, and interactive grid
│   │   ├── About.jsx         # stats cards, interactive portrait spotlight
│   │   ├── Contact.jsx       # EmailJS form controls and statuses
│   │   ├── CustomCursor.jsx  # Interactive mouse follower primitives
│   │   ├── Experience.jsx    # Professional vertical journey line
│   │   ├── Layout.jsx        # App wrapper, global glows, and standard nav links
│   │   ├── Navbar.jsx        # Floating navigation dock
│   │   ├── Projects.jsx      # Tilt-and-hover project display cards
│   │   ├── Skills.jsx        # Technical skill chips
│   │   └── Testimonials.jsx  # Client feedback cards
│   ├── data/
│   │   └── portfolioData.js  # CENTRALIZED DATA CONSTANT (Change text here!)
│   ├── App.jsx               # Page state controller, AnimatePresence wrapper
│   ├── index.css             # Tailwind v4 core layers and utility definitions
│   └── main.jsx              # React DOM mounting entry point
├── index.html                # Root HTML template (contains semantic SEO fallbacks)
├── package.json              # Script runner configurations & dependencies
├── vite.config.js            # Vite build parameters
└── tsconfig.json             # TypeScript parameter compiler
```

### Centralized Content Configuration (`src/data/portfolioData.js`)
To update the text on the website (personal info, company roles, projects, links, phone numbers, or skills), **you do not need to modify react components**. Simply edit the data exported inside `src/data/portfolioData.js`. 

The components automatically parse this file dynamically.

---

## 3. First Paint and No-JavaScript Fallback

`index.html` includes a styled hero inside `#root`, with small inline critical styles so it does not depend on JavaScript or the main stylesheet. React replaces it with the interactive hero when ready. The hero content is visible immediately on mount, without a delayed entrance animation.

Keep the startup hero's copy and responsive dimensions in sync with `src/components/ui/hero.tsx` and `src/data/portfolioData.js`. Additional static navigation, project, and contact information lives in `<noscript>` so it remains available without JavaScript and does not flash before the app starts. This fallback does not guarantee search rankings or SEO scores.

Run `node scripts/check-startup.mjs` against the production preview to check delayed JavaScript, unavailable CSS, no-JavaScript content, and desktop/mobile layout stability. On Windows, set `$env:BROWSER_CHANNEL = 'msedge'` to use installed Edge.

---

## 4. Custom Domain & DNS Mapping (GoDaddy ➡️ GitHub Pages)

The custom domain **`https://ashikch.com/`** is purchased/managed via **GoDaddy** and is served securely through **GitHub Pages**.

### How Custom Domain Binding Works:
1.  **CNAME Configuration:**
    *   The file `public/CNAME` contains exactly one line: `ashikch.com`.
    *   During deployment, Vite moves this file to the `dist/` directory root.
    *   GitHub Pages reads this file to map incoming requests for `ashikch.com` to this specific repository's deployment bundle.
2.  **GoDaddy DNS Record Setup:**
    To point `ashikch.com` to GitHub Pages, the following DNS records must be configured in your GoDaddy Domain Control Panel:

    | Record Type | Host / Name | Value / Points To | TTL | Purpose |
    | :--- | :--- | :--- | :--- | :--- |
    | **A** | `@` | `185.199.108.153` | Custom (1 Hour) | GitHub Pages Server IP 1 |
    | **A** | `@` | `185.199.109.153` | Custom (1 Hour) | GitHub Pages Server IP 2 |
    | **A** | `@` | `185.199.110.153` | Custom (1 Hour) | GitHub Pages Server IP 3 |
    | **A** | `@` | `185.199.111.153` | Custom (1 Hour) | GitHub Pages Server IP 4 |
    | **CNAME** | `www` | `ashik-ch.github.io` | Custom (1 Hour) | Subdomain routing redirection |

3.  **Enforce HTTPS:**
    Once DNS records resolve, check "Enforce HTTPS" in the **Settings -> Pages** tab of the GitHub repository.

---

## 5. Build, Development, and Deployment Commands

### Development Setup
To configure your local workspace, make sure you have **Node.js (LTS)** installed, then run:

```bash
# 1. Install dependencies
npm install

# 2. Run local development hot-reload server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to test and review code changes in real-time.

### Production Build
To test the production asset pipeline locally:
```bash
# Compiles React, TypeScript, and Tailwind CSS. Outputs production-ready bundles to the /dist folder.
npm run build

# Preview the compiled bundle locally on a simulated production server
npm run preview
```

### Live Deployment Script
To release and update the live website `https://ashikch.com/`:
```bash
# Deploys bundle instantly to GitHub Pages
npm run deploy
```

**What this command does behind the scenes:**
1.  Runs `npm run predeploy`, which triggers `npm run build` (compiles CSS/JS/images and generates the `/dist` directory).
2.  Launches `gh-pages -d dist` to push all files inside the `/dist` directory directly to the isolated `gh-pages` branch in your repository.
3.  GitHub Pages automatically triggers a server deployment, making your code live on the web in less than a minute.

---

## 6. Crucial Engineering & Performance Constraints

During maintenance, be extremely careful not to violate the following performance architecture constraints:

*   **Idle Rendering:** Keep the hero's base gradients static. Move the grid only in response to the pointer and disable updates when the hero is not visible. Pointer effects should settle without a continuous JavaScript animation loop.
*   **Optional Features:** Keep TaskManager behind its dynamic import. Firebase Auth and Firestore must not be imported by the public portfolio; messaging loads separately for visitors who enable notifications.
*   **Images:** Project cards use lazy-loaded WebP files. After editing the source PNGs listed in `scripts/optimize-images.mjs`, run `npm run optimize:images` and commit the generated WebP files. Original PNGs are retained as editable sources and are not included in the production build. Refresh the newer website previews with `node scripts/capture-project-previews.mjs` (optionally pass `gtec-mahe`, `mythili-manthra`, or `hg-legal-services` to refresh one). Inspect captures before optimizing; remote sites may show loading screens. The capture script supports the same `BROWSER_CHANNEL` option as the performance check.
*   **Pointer Effects:** Use motion values for card tilt, not React state updates on every pointer movement. Respect reduced-motion settings and skip tilt on touch input.
*   **Timer & Timeout Cleanups:** Any `setInterval` or `setTimeout` declared inside `useEffect` must return a precise cleanup handler (`clearInterval` / `clearTimeout`) to avoid severe browser memory leaks when routing or loading states toggle.

### Performance verification

Run `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4173`.
In a second terminal run `npm run check:performance`. Install the test browser with
`npx playwright install chromium` first, or on Windows use an installed Edge browser:
`$env:BROWSER_CHANNEL = 'msedge'; npm run check:performance`.
The check covers desktop/mobile navigation, reduced motion, image decoding,
deferred task loading, the task login screen, and idle animation work. Screenshots
are saved to a temporary directory, outside the deployment output. It does not
sign in, send contact messages, or create reminders.
