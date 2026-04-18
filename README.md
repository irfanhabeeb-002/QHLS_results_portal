# 🏆 QHLS Results Portal (2026)

Official results portal for the **QHLS Model Exam** (Surah Hajj Thafseer) organized by **ISM Ernakulam District Committee**.

[![Live Site](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://qhlsresults.netlify.app/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://qhlsresults.netlify.app/)

---

## 🌟 Project Overview

The QHLS Results Portal is a high-performance, mobile-first Single Page Application (SPA) designed to provide instant and transparent access to exam marks for the Qur'an Hadith Learning School students across 11 zones in Ernakulam.

## 🚀 Key Features

### 1. Instant Result Retrieval
Search by a registered phone number to instantly pull student details. The system handles multiple students linked to a single phone number gracefully with a clean profile selection view.

### 2. Premium Leaderboard
A high-contrast leaderboard showcasing the top performers with rank-specific medal styling (Gold, Silver, and Bronze).

### 3. Regional Browsing
Comprehensive exploration of results by **Zone** and **Centre**. Users can filter through 11 districts and their respective centres to see comparative performance.

### 4. Personal Scorecards
Each student gets a detailed scorecard featuring:
- Total Marks (out of 70)
- Registration & Zone data
- **Spiritual Anchors**: Randomized verses or Hadiths based on performance, providing motivation or scholarly reflection.

### 5. Mobile-First Excellence
Designed specifically for the 99% mobile user base, featuring glassmorphism elements, smooth transitions, and intuitive navigation.

---

## 🛠 Tech Stack

- **Core**: Vanilla HTML5, CSS3, ES6 JavaScript
- **Design**: Custom CSS Utility system (No frameworks for maximum speed)
- **Data Engine**: Lightweight JSON fetch-based state management
- **Deployment**: Netlify (CI/CD with GitHub)
- **SEO**: Schema.org JSON-LD, Open Graph, and optimized Metadata

---

## 📈 SEO & Discoverability

The portal is engineered to be discoverable for keywords like *"QHLS results"*, *"ISM Ernakulam exam results"*, and *"QHLS Model Exam"*:
- **Structured Data**: JSON-LD blocks help search engines identify the site as an official educational event.
- **Social Sharing**: Full Open Graph integration ensures professional previews on WhatsApp, Facebook, and Twitter.
- **Indexing**: Optimized `sitemap.xml` and `robots.txt` for healthy crawling.

---

## 📂 Project Structure

```bash
├── assets/             # Branding logos and images
├── app.js              # Core application logic & view switching
├── style.css           # Premium design system and utility classes
├── index.html          # Semantic HTML structure & SEO engine
├── data.json           # Centralized student & stats database
├── netlify.toml        # Deployment & Security headers
├── robots.txt          # Crawler instructions
└── sitemap.xml         # Site index for search engines
```

---

## 📖 How to Deploy Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/irfanhabeeb-002/QHLS_results_portal.git
   ```

2. **Serve the files**:
   Use any local server (e.g., Live Server in VS Code or Python's HTTP server):
   ```bash
   python3 -m http.server 8000
   ```

3. **Access**:
   Open `http://localhost:8000` in your browser.

---

## 🤝 Need Help?
Contact your respective **Zone Convenors** listed in the "Need Help?" section of the portal for technical or academic support.

---
*Organized by ISM Ernakulam District Committee*
