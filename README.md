# PerfMon v2 — Unified Performance Monitoring System
> **City Transport and Traffic Management Office (CTTMO)**  
> Transport Planning and Management Division (TPMD) · Davao City Government

PerfMon v2 is an enterprise-grade Progressive Web Application (PWA) designed for tracking, monitoring, and evaluating Individual Performance Commitment and Review (IPCR) records for both Plantilla regular personnel and Job Order / Contract of Service (JO/COS) officers.

---

## 🚀 Key Features

* **Dual-Track Workflow Architecture**:
  * **Plantilla Regular Officers**: Quarterly MFO commitment planning, target vs. actual monthly distributions (M1, M2, M3), variance reporting, and approval tracking.
  * **JO/COS Officers**: Fast daily output tracking, quantitative accomplishment logs, and indicator metrics.
* **Institutional Pathfinder Bento UI**:
  * Clean, minimal bento-box card layouts with high-contrast typography adhering to WCAG AA/AAA standards.
  * Adaptive Dark & Light themes with zero garish gradients or distracting drop shadows.
  * Custom flat SVG positive mood avatars.
* **Administrative Console**:
  * Full employee roster management with division/section metadata.
  * Major Final Output (MFO) definitions and individual assignment matrices.
  * Performance indicator definitions.
  * In-app user account creation, profile editing, and password updates synchronized with Supabase Auth.
  * Review, endorse, and reject submissions with audit remarks.
  * Excel (XLSX) and PDF report exports.
* **Data Layer & Security**:
  * Backed by PostgreSQL via Supabase with secure server-side API routes and Row-Level Security (RLS) support.

---

## 🛠 Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Supabase Auth)
* **Icons**: [@phosphor-icons/react](https://phosphoricons.com/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Export Utilities**: [xlsx](https://sheetjs.com/), [jspdf](https://github.com/parallax/jsPDF), [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
```

---

## 📦 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run local development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Build for production
```bash
npm run build
npm run start
```

---

## 🚢 Deployment (Vercel)

1. Push this repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Add the three environment variables under **Project Settings > Environment Variables**:
   * `NEXT_PUBLIC_SUPABASE_URL`
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy. Build command: `npm run build`, Output directory: `.next`.
