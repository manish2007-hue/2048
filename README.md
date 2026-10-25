# 2048 — Play 2048 Online

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://en.wikipedia.org/wiki/HTML5)
[![CSS3 / Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Mobile Friendly](https://img.shields.io/badge/Mobile-Optimized-brightgreen.svg)](#mobile-friendly--controls)

A modern, fast, and authentic web edition of the classic **2048** sliding puzzle game. Engineered with **zero fake bot scores**, a **real-time verified leaderboard**, an in-depth **Player Career Dashboard**, and a **mobile-first touch experience**.

---

## 🎮 Key Features

- **🏆 Real, Unfaked Leaderboard:** No mock bot players or fabricated scores. Every entry represents an authentic run completed on the device, filterable by **All-Time**, **Today**, and **Personal Runs**.
- **📊 Lifetime Career Dashboard:** Detailed analytics including **High Score**, **Highest Tile Reached** (with visual tile badge), **Total Games Played**, **2048 Wins & Win Rate %**, **Average Score**, and **Total Moves**.
- **📜 Match History & Activity Log:** Detailed chronological log of your recent games with move counts, play duration, and completion timestamps.
- **📱 Mobile-Friendly First:**
  - Dynamic Viewport Sizing (`100dvh`) prevents browser address bar clipping.
  - Safe-area insets (`env(safe-area-inset-bottom)`) for iPhones and edge-to-edge Android devices.
  - Zero-jitter touch events with `preventDefault()` on `touchmove` to eliminate screen bounce and pull-to-refresh.
  - Optional toggleable on-screen **🎮 D-Pad** for comfortable one-handed thumb navigation.
  - Subtle tactile **haptic vibration feedback** via `navigator.vibrate`.
- **🔊 Synthesized Web Audio API:** Crisp slide, merge, and victory sounds synthesized directly in the browser with zero external audio assets.
- **↶ Tactical Undos:** Up to 3 undos per match to recover from accidental slips.
- **⚡ 60 FPS Smooth Sliding Animations:** Powered by hardware-accelerated CSS transforms and container queries.
- **🔒 Privacy by Design:** 100% client-side storage (HTML5 LocalStorage). No account signups, no tracking cookies, and one-click data export (`Export Stats JSON`).

---

## 📂 Project Architecture

```
2048/
├── index.html                  # Main Web Root / Game Hub & SEO Article
├── 2048_play_2048_online.html  # Standalone Game Application file
├── about-us.html               # Platform Story & Gabriele Cirulli Tribute
├── contact-us.html             # Interactive Contact Form & Support Channels
├── privacy-policy.html         # GDPR / CCPA / COPPA Compliant Privacy Policy
├── terms.html                  # Terms & Conditions and Fair Play Rules
├── 404.html                    # Custom 404 Page Not Found with Navigation Hub
├── 500.html                    # Custom 500 Server Malfunction Error Page
├── robots.txt                  # Search Engine Crawler Directives
├── sitemap.xml                 # XML Sitemap for Search Engine Indexing
├── LICENSE                     # MIT Open Source License
└── README.md                   # Documentation & Setup Guide
```

---

## 🔍 On-Page SEO Highlights

- **Keyword Targeting:** Optimized for `play 2048 online`, `2048 game`, `2048 unblocked`, `2048 leaderboard`, `free 2048`, and `2048 strategy`.
- **Structured Data (JSON-LD):**
  - `VideoGame` / `WebApplication` schema.
  - `WebSite` schema.
  - `FAQPage` schema featuring **10 essential player questions & answers**.
- **Social Metadata:** Complete Open Graph (`og:*`) and Twitter Card (`twitter:*`) tags with 1200×630 share banners.
- **Content:** Comprehensive 1,100+ word strategy guide directly integrated into the home view.

---

## 🚀 Quick Deployment to GitHub Pages

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 2048 game with real leaderboard, mobile UI, and SEO"
   git branch -M main
   git remote add origin https://github.com/manish2007-hue/2048.git
   git push -u origin main
   ```

2. **Enable GitHub Pages:**
   - Go to your repository on GitHub: `https://github.com/manish2007-hue/2048`
   - Navigate to **Settings** → **Pages** (in the left sidebar).
   - Under **Build and deployment** → **Branch**, select `main` and `/ (root)`.
   - Click **Save**.
   - Your game will be live at: `https://manish2007-hue.github.io/2048/`

---

## 📜 Credits & License

- Original 2048 game created by **Gabriele Cirulli** based on *1024* by Veewo Studio and *Threes* by Sirvo.
- Licensed under the [MIT License](LICENSE).
