# Ashik Portfolio - Quick Developer Guide

## Tech Stack

* React + Vite
* Tailwind CSS
* Framer Motion
* EmailJS
* WebGL Shader Effects

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
*   **WebGL Shaders:** `@paper-design/shaders-react` (high-performance WebGL-based mesh gradient background and border effects)
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
│   │   │   └── hero.tsx      # WebGL Shader header & main title section
│   │   ├── About.jsx         # stats cards, interactive portrait spotlight
│   │   ├── Contact.jsx       # EmailJS form controls and statuses
│   │   ├── CustomCursor.jsx  # Interactive mouse follower primitives
│   │   ├── Experience.jsx    # Professional vertical journey line
│   │   ├── Layout.jsx        # App wrapper, global glows, and standard nav links
│   │   ├── Navbar.jsx        # Glassmorphic responsive header
│   │   ├── PageLoader.jsx    # Pre-loading progress bar and randomized welcome titles
│   │   ├── Projects.jsx      # Tilt-and-hover project display cards
│   │   ├── Skills.jsx        # Technical skill chips
│   │   └── Testimonials.jsx  # Client feedback cards
│   ├── data/
│   │   └── portfolioData.js  # CENTRALIZED DATA CONSTANT (Change text here!)
│   ├── App.css               # Styling overrides
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

## 3. SEO Fallback Architecture

To guarantee search engine crawlers can index the site perfectly even if they block JavaScript execution, `index.html` implements a **Semantic SEO Fallback inside the `<div id="root">` element**:
*   When a bot crawls the page, it reads standard, highly structured `<h1>`, `<h2>`, and `<h3>` tags with internal link listings.
*   When a user loads the page, React instantly mounts and wipes the fallback, replacing it with the high-fidelity animated interface.
*   This achieves perfect SEO scores while maintaining advanced aesthetic designs.

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

*   **WebGL Uniform Stability:** WebGL color palettes, coordinate parameters, and CSS styles must **never** be defined inline within the render loops of React components. Always keep them as static constants outside the functional components to prevent referential equality checks from thrasher-recompiling WebGL shaders at 60 FPS (which will lock up the browser's thread and freeze Chrome).
*   **Canvas Overdraw Guard:** Keep only one active primary `<MeshGradient>` in `hero.tsx`. Layering multiple active canvas nodes overlaying each other creates a massive fill-rate performance cost and leads to severe GPU frame lag.
*   **Timer & Timeout Cleanups:** Any `setInterval` or `setTimeout` declared inside `useEffect` must return a precise cleanup handler (`clearInterval` / `clearTimeout`) to avoid severe browser memory leaks when routing or loading states toggle.
