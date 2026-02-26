# Tigre Fashion — Checkout Drop-Off Visualizer

Interactive analytics dashboard for diagnosing why **22% of customers fail to complete checkout**.
Visualizes the payment funnel stage-by-stage and surfaces key performance red flags.

> **Prototype** — all data is synthetic and generated in-memory. No backend required.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173/tigre-checkout-dashboard/](http://localhost:5173/tigre-checkout-dashboard/)

## Build & Deploy (GitHub Pages)

```bash
npm run deploy
```

The site will be published at `https://<your-github-username>.github.io/tigre-checkout-dashboard/`

---

## Features

- **Checkout Funnel** — 5-stage funnel with absolute counts and % drop-off between each stage
- **4 KPI Summary Cards** — auth rate (color-coded), total volume, worst payment method, biggest drop-off stage
- **Filters** — payment method, country, date range (7d/14d/30d), amount tier (<$50 / $50–$200 / >$200)
- **Decline Breakdown** — soft vs hard decline donut + top 5 decline reasons
- **Auth Rate Over Time** — daily line chart per payment method

---

## Discoverable Patterns

Try these filter combinations to surface built-in insights:

| Filter | What you'll find |
|---|---|
| Country: **Peru** | Auth rate visibly lower (~65% vs ~78% overall) |
| Payment: **OXXO** | Funnel completion drops sharply (cash-pay abandonment) |
| Amount: **>$200** + Payment: **Credit Card** | Auth rate drops to ~68% |
| Payment: **PSE** | Highest auth rate (bank transfer, lower fraud) |
| No filters | Peru's share is ~20% but punches above its weight in declines |

---

## Key Insights

### 1. Peru is the biggest problem
Authorization rate ~13pp below Colombia. This is likely a processor routing issue — worth investigating with Yuno or your acquirer. A targeted retry strategy for Peruvian cards could recover significant revenue.

### 2. High-value card transactions need attention
Auth rates drop sharply above $200, suggesting 3DS friction combined with issuer risk scoring. Recommended actions:
- Enable soft-decline retry flows
- Offer PSE as an alternative for Colombia users
- Review 3DS exemption thresholds with your PSP

### 3. OXXO has high selection but low completion
A significant share of OXXO users generate a voucher but never pay. Recommended actions:
- In-app voucher reminder notifications
- SMS follow-ups at 2h / 24h after voucher generation
- Reduce voucher expiry window to create urgency

---

## Tech Stack

- **React 19 + Vite** — fast dev setup with hot reload
- **Recharts** — FunnelChart, BarChart, LineChart, PieChart
- **Tailwind CSS 3** — utility-first styling
- **GitHub Pages** — static hosting via `gh-pages`

## Project Structure

```
src/
├── data/
│   └── generateTransactions.js   ← 650 synthetic records with built-in patterns
├── utils/
│   └── analytics.js              ← filterTransactions, buildFunnelData, calcSummaryCards, …
├── components/
│   ├── FilterBar.jsx             ← controlled filter dropdowns + active pills
│   ├── SummaryCards.jsx          ← 4 KPI cards with color coding
│   ├── FunnelChart.jsx           ← core funnel visualization
│   ├── DeclineBreakdown.jsx      ← donut + top 5 reasons bar chart
│   └── TimeSeriesChart.jsx       ← daily auth rate line chart
└── App.jsx                       ← root with filter state + useMemo derived data
```
