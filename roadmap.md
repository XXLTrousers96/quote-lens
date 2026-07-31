# QuoteLens Product Roadmap

## 📌 Executive Summary
QuoteLens is an offline, client-side life insurance illustration analysis engine built for Lincoln Financial internal wholesalers. This roadmap outlines the strategic direction and prioritized feature backlog tailored specifically to wholesale sales workflows.

---

## 🎯 Short-Term Focus (Current & Next Up)

### 1. 📊 Interactive Visual Comparison Charts (Sandbox Priority)
- **Goal**: Provide high-impact visual charts for advisor interactions and presentation decks.
- **Scope**:
  - **Death Benefit IRR Curve**: Line chart tracking policy IRR % over time (Years 1 to 40).
  - **Estate Wealth Transfer Growth**: Comparison bar chart tracking Taxable Portfolio vs. Life Insurance Death Benefit at key ages.
- **Compliance & Privacy**: 100% client-side SVG rendering with no external telemetry.

### 2. ⚡ Competitor Quick-Entry Form
- **Goal**: Enable comparing Lincoln illustrations against competitor PDF proposals without fragile PDF parsing.
- **Scope**:
  - A 30-second form allowing wholesalers to input 3–4 key numbers from a competitor PDF (Carrier Name, Product Name, Outlay, and Death Benefit/Cash Value at key milestone years).
  - Converts manual inputs into a session illustration object that populates all 3 output modules.

### 3. 🎛️ Real-Time Target Age Slider
- **Goal**: Interactive age scrubbing on the Analysis page.
- **Scope**:
  - Add a smooth age slider (Ages 60 to 100) allowing wholesalers to adjust target age in real-time and watch MOIC metrics update dynamically.

---

## 🚀 Medium-Term Backlog (Future Consideration)

### 4. 📋 One-Click "Copy for Excel" (TSV Clipboard)
- **Goal**: Separate button from "Copy for Email" specifically formatted for direct pasting into Microsoft Excel spreadsheets (clean raw numbers without HTML table tags).

### 5. 🔄 Dual Lincoln Policy Blend Analysis
- **Goal**: Support wholesaler scenarios where two Lincoln policies are run in parallel.
- **Scope**:
  - Combine two Lincoln illustrations into a single blended portfolio view.

---

## 🌿 Branching & Deployment Strategy

- **`main` Branch**: Production branch. Clean, stable, and auto-deployed to Railway (`quote-lens-production.up.railway.app`).
- **`sandbox` Branch**: Experimental playground. Used to prototype and test new features (such as Visual Charts and Age Sliders) before merging into main.
