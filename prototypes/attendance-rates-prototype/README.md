# Greenhill — Attendance Rates Dashboard

A React + TypeScript recreation of the Greenhill International School
"Attendance Rates" dashboard screen.

## Stack

- **React 18** + **TypeScript** (Vite)
- **lucide-react** for icons (authored as code — no raster assets)
- **recharts** for the trend and student-group charts
- Plain CSS with design tokens (`src/index.css`, `src/App.css`)

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
npm run preview  # preview the production build
```

## Project structure

```
src/
  main.tsx                        # entry point
  App.tsx                         # page composition (header, filters, panels)
  index.css                       # design tokens, reset, shell, sidebar, topbar
  App.css                         # dashboard content styles
  types.ts                        # shared TypeScript types
  data.ts                         # mock data (stats, charts, tables)
  components/
    Sidebar.tsx                   # collapsible navigation
    Topbar.tsx                    # search, actions, user menu
    BrandMark.tsx                 # inline SVG Greenhill crest (shield + stripes)
    SelectField.tsx               # labelled select (year / campus filters)
    StatCard.tsx                  # KPI card
    Panel.tsx                     # card shell with title + tools
    Badge.tsx                     # status pill
    AttendanceTrendChart.tsx      # multi-series line chart
    StudentGroupChart.tsx         # grouped horizontal bar chart
    ClassComparisonTable.tsx      # term-by-term comparison table
    InterventionQueueTable.tsx    # intervention queue table
```

## Notes

- All colours and spacing are driven by CSS custom properties in `:root`
  (`src/index.css`), so a brand re-theme is a single-file change.
- The sidebar collapses to an icon rail below `1080px` and the stat cards
  stack below `860px`.
- Chart values and table rows in `src/data.ts` are placeholder figures for the
  prototype — swap them for real API data.
