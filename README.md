# Budget Tracker (50/30/20 Rule)

A modern, mobile-friendly personal finance dashboard built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

Designed around the **50/30/20 budgeting rule** (Needs, Wants, Savings) with full support for **Indonesian Rupiah (IDR)** currency formatting and dynamic budget planning.

---

## ✨ Features

- **50/30/20 Budget System**: Live tracking of Needs, Wants, and Savings buckets with dynamic ratio adjustments.
- **Dynamic Allocation Balancing**: Symmetrical 1:1 auto-balancing sliders, numeric step inputs, bucket locking (`🔒`), and quick ratio presets (e.g. Standard 50/30/20, High Cost 70/20/10).
- **Indonesian UMR-Friendly**: Quick income presets tailored for Indonesian salary ranges (Rp 2.5jt – Rp 10jt) with custom IDR input parser (`k`, `rb`, `jt`).
- **Interactive Spending Speedometer**: Dual-arc SVG gauge displaying real-time spending status against budget limits.
- **Smart Financial Intelligence**: Instant actionable insights highlighting remaining spendable budget and savings goals.
- **Category Breakdown & Cash Flow**: Detailed spending breakdown by categories with visual progress meters.
- **Transaction Management**: Fast expense and income tracking with auto-categorization, merchant memory, and search/filter.
- **Dark & Light Modes**: System-aware and persistent theme toggle.
- **100% Client-Side**: LocalStorage data persistence with export/backup options—zero external database setup needed.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn / pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/GabrielRyan1999/TrackerApp.git
cd TrackerApp

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Build & Test
```bash
# Type check and build for production
npm run build

# Run unit tests
npm test
```

---

## 🛠 Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations / FX**: Canvas Confetti
- **Testing**: Vitest
