# 🇸🇦 Saudi Arabia Autonomous Economy Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-00d986.svg)](LICENSE)
[![WCAG 2.1 AA target](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-5B8DEF.svg)](ACCESSIBILITY.md)
[![Code of Conduct](https://img.shields.io/badge/Code%20of%20Conduct-Contributor%20Covenant-2DD4A8.svg)](CODE_OF_CONDUCT.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Data: World Bank API](https://img.shields.io/badge/data-World%20Bank%20API-F5A623.svg)](https://api.worldbank.org/v2/country/SAU)

> **محاكي الاقتصاد السعودي المستقل** — a Vision 2030 scenario engine that models Saudi Arabia's transition from a wage-based labour economy to an **autonomous, asset-backed household income system** driven by AI automation, sovereign capital and data/energy dividends.

A single-page, zero-backend dashboard: deterministic macro simulation in the browser, live baseline inputs from the free World Bank API, full English/Arabic (USD/SAR) duality, and shareable scenarios.

---

## 🎯 Core Idea

Saudi Arabia's structural advantage is not labour — it is **assets**: the Public Investment Fund, hydrocarbon equity, Tadawul listings, spectrum/data and a very young population. Vision 2030 already converts those assets into returns. This simulator asks the quantitative question:

> **As AI removes wage labour, what replaces the household income statement — and how fast must the asset-based streams scale to keep (and grow) real purchasing power?**

Every year from **2025 → 2060+** the engine stacks nine income streams per household, while automation compounds, GDP grows, and the sovereign fund accrues:

| # | Stream | Source of value |
|---|--------|-----------------|
| 1 | **National Wages** | Shrinking residual labour income as automation rises |
| 2 | **Structural Subsidies** | State services scaled to GDP |
| 3 | **Citizen's Account (Enhanced)** | UBI ramping to target per adult |
| 4 | **PIF Dividend** | `spend rule % ×` sovereign fund balance |
| 5 | **Tadawul & PE** | Broad domestic equity ownership growth |
| 6 | **Youth Grants (Nitaqat)** | Birth-endowment compounding to age 18 |
| 7 | **AI & Data Royalty** | Household share of national AI/data value |
| 8 | **Energy Commons** | Cash return from fossil & mineral revenues |
| 9 | **Deflation Gain** | Real purchasing power added as AI-driven prices collapse |

Outputs are reported as **household-equivalent annual income**, alongside **GDP**, **PIF balance** and **% of the workforce automated**.

### Default scenario (calibrated baseline)

| Milestone | Household income | Automation | Macro |
|---|---|---|---|
| **Baseline 2025** | **$60,639** | 7% | GDP $1.1T seed |
| **Midpoint 2043** | **$88,394** (+46%) | 48% | — |
| **End State 2060** | **$138,069** (+128%) | 74% | GDP $3.4T · PIF $5.2T · **288%** of baseline purchasing power |

---

## 🖥️ Dashboard

```
┌────────────────────────────────────────────────────────────────────────┐
│ SA  Saudi Arabia Autonomous Economy Simulator          [Vision 2030]   │
│    ● Bundled snapshot — GDP $1.28T · Pop 37.0M · Growth 4.5% (2025)    │
│                              [Reactive] [Delayed] [No Action] [↺] [عربي]│
├──────────────┬─────────────────────────────────────────────────────────┤
│ SIMULATION   │  Baseline 2025   Midpoint 2043   End State 2060   PIF   │
│  End Year    │  $60,639         $88,394 +46%    $138,069 +128%   $5.2T │
│  Automation  │  ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  │
│  Base GDP    │  [Income Streams | GDP & PIF]  ▸ interactive stacked area│
│  PIF ──────  │  ● wages ● social ● ubi ● swf ● esop ● grants ● royalty │
│  UBI ──────  │                                                         │
│  Tadawul ──  │  Saudi Autonomous Economy Framework · World Bank API     │
└──────────────┴─────────────────────────────────────────────────────────┘
```

**UI/UX features**

- **KPI cards** with delta chips (`+128% vs baseline`, `×5.6 vs seed`) and automation meters.
- **Two chart modes**: stacked *Income Streams* and *GDP & PIF* macro trajectories (dual axis, USD/SAR aware).
- **Clickable legend chips** to isolate any stream; index tooltips show year, household total, automation %, GDP and PIF at once.
- **Accordion control panel** with min/max bounds, contextual tooltips, per-slider enable/disable tied to its toggle, and `Reset` / `Export CSV` actions.
- **Scenario state lives in the URL hash** — copy the address bar to share an exact configuration.
- **Responsive**: sidebar becomes an overlay drawer with scrim below 980px; RTL/LTR use logical CSS properties throughout.
- **Reduced-motion** and keyboard (`Enter`/`Space`) support on switches and headers.

---

## 📡 Data & API (three-tier loader)

The dashboard never dies with `Local Mode (Failed to parse JSON API)`. It resolves its baseline through a fallback chain and reports exactly which tier it is on:

| Tier | Source | When | Status pill |
|---|---|---|---|
| 1 | `docs/macro_data.json` (bundled snapshot, also falls back to `../macro_data.json`) | Served locally or on GitHub Pages | 🟦 `Bundled snapshot — GDP … · fetched YYYY-MM-DD` |
| 2 | **Live World Bank API** (`api.worldbank.org/v2/country/SAU/indicator/…`, CORS-enabled, 5 indicators in parallel) | Snapshot missing/unreadable, e.g. `file://` double-click | 🟩 `World Bank API · live — GDP … (2025)` |
| 3 | Embedded offline constants compiled into the app | No network at all | 🟨 `Offline baseline` |

**Model calibration is deliberately decoupled from live data.** Live indicators feed the status line and narrative; the simulation's baseline constants (base year, baseline GDP, household count, median household income, PIF seed AUM, SAR peg) live in the `calibration` block so scenario results stay comparable across quarterly refreshes.

**Indicators tracked:** `SP.POP.TOTL`, `NY.GDP.MKTP.CD`, `NY.GDP.PCAP.CD`, `NY.GDP.MKTP.KD.ZG`, `SL.TLF.CACT.ZS`.

---

## 🎛️ Controls reference

### 1 · Simulation scope
| Control | What it does |
|---|---|
| **End Year** | Horizon of the projection (2035–2100). |
| **Automation Pace** | % of human labour tasks transferred to AI/robotics per year (logistic adoption curve). |
| **Base GDP Growth** | Organic, automation-independent annual GDP growth. |

### 2 · Public Investment Fund (PIF)
| Control | What it does |
|---|---|
| **Enable PIF Dividend** | Master switch for sovereign-fund physics. |
| **Seed AUM** | Starting assets under management ($B). |
| **State Contrib.** | % of GDP routed into the fund each year. |
| **Return Rate** | Annual portfolio ROI. |
| **Civic Spend Rule** | % of balance liquidated yearly as citizen dividends. |

### 3 · Citizen's Account (UBI)
| Control | What it does |
|---|---|
| **Enable CA Expansion** | Turns the targeted benefit into a universal basic income. |
| **Target / Mo** | Monthly grant per adult at full ramp. |
| **Expansion Ramp** | Years to reach the target. |

### 4 · Tadawul & private equity
| Control | What it does |
|---|---|
| **Enable Broad Equity** | Citizens systematically acquire privatised industrial capital. |
| **Domestic Eq. Growth** | Annual equity return modelling private-sector transfer. |
| **AI / Data Royalties** + **Max Royalty Pool** | Household ceiling on national AI/data royalties at full AGI. |

### 5 · Youth & energy commons
| Control | What it does |
|---|---|
| **Youth Grants (Nitaqat)** + **Seed Amount** | Capital allocated at birth, compounded until 18, then pays a return. |
| **Energy / Aramco Base** + **Energy Div.** | Direct cash distribution from fossil & mineral revenues. |

### 6 · Deflationary effects
| Control | What it does |
|---|---|
| **AI Demonetization** + **Max Deflation** | Prices of digital services, transport, health and energy collapse toward zero; real purchasing power of every fixed stream multiplies (`1/(1−cr)`). |

### Scenario presets
`Vision 2030` (calibrated default) · `Reactive Support` (small fund, slow ramp) · `Delayed Shift` (fund/youth/data/equity off, 22-year ramp) · `No Action` (wages + subsidies only).

---

## 🏗️ Architecture

```
UHI_SAUDI/
├── docs/
│   ├── index.html        # The entire simulator: UI + i18n + engine (zero-backend SPA)
│   └── macro_data.json   # Tier-1 data: { metadata, indicators, calibration }
├── scripts/
│   └── fetch_worldbank.py# Refreshes indicators only — never touches calibration
├── .github/workflows/
│   └── quarterly_update.yml # Scheduled quarterly refresh + JSON validation + auto-commit
└── README.md
```

- **Engine**: deterministic loop in constant USD; the Arabic UI renders SAR at the peg (×3.75) without mutating internal state.
- **Rendering**: Chart.js 4 (CDN) with graceful degradation — if the chart library fails to load, KPI values still render.
- **State**: `{...DEFAULTS}` + URL-hash restore; slider edits clear the active preset chip.

---

## 🚀 Run it

```bash
# any static server from the repo root
python -m http.server 8000
# → http://localhost:8000/docs/
```

Or double-click `docs/index.html` — it falls through to the live World Bank API automatically.

**GitHub Pages:** Settings → Pages → Deploy from branch → `main` → folder `/docs`.

**URL parameters**
- `?lang=ar` — start in Arabic/SAR, `?mode=macro` — start on the GDP & PIF chart.
- `#<base64 of scenario JSON>` — restore a shared scenario.

**Export:** the sidebar's `Export CSV` downloads every stream, total, automation %, GDP and PIF balance for the full timeline.

---

## 🔄 Data refresh pipeline

```bash
python scripts/fetch_worldbank.py   # rewrites docs/macro_data.json
```

- Fetches the newest non-null value per indicator (3 retries, HTTPS, custom UA).
- On API failure it **keeps the cached value** (marked `Stale cache`) or uses the embedded fallback — it never blanks the file.
- Writes `metadata.fetched_at` and `metadata.partial`.
- **Preserves the `calibration` block**, so hand-tuned model constants survive automated runs.

`.github/workflows/quarterly_update.yml` runs this on the 1st of every quarter (and on manual dispatch), validates the JSON schema in Python, and commits `docs/macro_data.json`.

---

## ✅ Verification

Headless-Chrome checks run against the built page (local server, live-API-only and `file://` variants): baseline/midpoint/end KPI values, step-accurate slider labels, preset switching, slider recompute, plain-year labels, per-card accents, toggle ARIA state, chart mode + legend hiding, section collapse, RTL/SAR switch, document title sync, drawer behaviour, reset and URL-hash sync — **33/33 passing**. Layout is verified at 1600px, 768px and 430px (0 overflowing elements).

---

## 🤝 Community

| Document | What it covers |
|----------|----------------|
| [Contributing guide](CONTRIBUTING.md) | Dev setup, project conventions (bilingual dictionary, constant-USD engine, calibration vs indicators), testing checklist, PR flow |
| [Code of Conduct](CODE_OF_CONDUCT.md) | Contributor Covenant 2.1 — our standards and enforcement ladder |
| [Security policy](SECURITY.md) | How to report vulnerabilities privately, scope, and response targets |
| [Accessibility statement](ACCESSIBILITY.md) | Supported environments, implemented features, known limitations, how to report a barrier |
| [License (MIT)](LICENSE) | Attribution and reuse terms |

**Filing something?** Use the [issue forms](https://github.com/muxd22-alt/UHI_SAUDI/issues/new/choose)
for 🐛 bugs, 💡 features and ♿ accessibility barriers — or the
[private advisory channel](https://github.com/muxd22-alt/UHI_SAUDI/security/advisories/new)
for security reports. Pull requests follow the
[PR template](.github/PULL_REQUEST_TEMPLATE.md).

---

## 📄 License

Released under the [MIT License](LICENSE). Baseline macro indicators are
fetched from the free [World Bank API](https://api.worldbank.org/v2/country/SAU)
and remain subject to the World Bank's dataset terms of use. Model outputs are
indicative research — not financial advice.


<div dir="rtl" align="right">

## 🇸🇦 بالعربية

**محاكي الاقتصاد السعودي المستقل** هو لوحة تحكم تفاعلية لنمذجة اقتصاد المملكة نحو عام 2060 تحت أثر الثورة التكنولوجية للذكاء الاصطناعي.

**الفكرة الجوهرية:** يعتمد الاقتصاد السعودي على **الأصول** لا على الأجر الوظيفي؛ لذا يبني المحاكي تسعة مصادر دخل سنوية لكل أسرة (الأجور، الدعم الهيكلي، حساب المواطن، توزيعات صندوق الاستثمارات، ملكية الأسهم عبر تداول، منح الشباب، عوائد البيانات والذكاء الاصطناعي، عوائد الطاقة، ومكاسب الانكماش) ويقيس قوتها مقابل الناتج المحلي ورصيد الصندوق السيادي ونسبة الأتمتة.

**البنية:**
- واجهة واحدة مستقلة (`docs/index.html`) — بدون خادم خلفي.
- تحميل البيانات بثلاث طبقات: لقطة محفوظة ← واجهة البنك الدولي المباشرة ← قيم مدمجة دون اتصال (وليس رسالة خطأ).
- تبديل حي بين الإنجليزية (USD) والعربية (SAR بمعامل 3.75) مع اتجاه RTL كامل.
- مشاركة السيناريو عبر رابط الصفحة، وتصدير CSV، ووضعا رسم (مصادر الدخل / الناتج والصندوق).
- تحديث ربع سنوي آلي لبيانات البنك الدولي مع الحفاظ على ثوابت المعايرة.

**التشغيل:** `python -m http.server 8000` ثم افتح `http://localhost:8000/docs/` — أو افتح الملف مباشرة في المتصفح.

**المشاركة:** يُرحَّب بالمساهمات من المطوّرين والباحثين والمترجمين. راجع [دليل المساهمة](CONTRIBUTING.md)، و[ملف قواعد السلوك](CODE_OF_CONDUCT.md)، و[سياسة الأمان](SECURITY.md)، و[بيان الوصولية](ACCESSIBILITY.md). تُرفع البلاغات عبر [نماذج Issues](https://github.com/muxd22-alt/UHI_SAUDI/issues/new/choose)، وتُرفع ثغرات الأمان عبر [القناة الخاصة](https://github.com/muxd22-alt/UHI_SAUDI/security/advisories/new). المشروع مرخّص برخصة [MIT](LICENSE).

**إخلاء مسؤولية:** نمذجة توضيحية لأغراض البحث والتعليم، وليست نصيحة مالية أو استثمارية.

</div>

---

*Baseline inputs from the free [World Bank API](https://api.worldbank.org/v2/country/SAU) · Scenario engine for Vision 2030 research · Indicative modelling only, not financial advice.*
