# 📊 Analytics Dashboard

A browser-based analytics dashboard built to replace a manual spreadsheet workflow.  
The application allows a team lead to track monthly performance metrics, visualize trends, and generate reports — all without external tools.

🔗 Live Demo: https://sharongrace06.github.io/js-dashboard/

---

## 🧠 Problem

The client previously tracked operational metrics in spreadsheets.  
This caused:

- slow data entry
- difficult comparisons across years
- manual calculations
- no quick visual insights
- no shareable report format

This dashboard converts that workflow into an interactive interface where data entry, visualization, and reporting happen instantly.

---

## ✨ Features

### Data Management
- Add monthly records through an input form
- Delete entries safely
- Prevent duplicate month entries
- Automatic totals calculation

### Visualization
- Year-wise bar charts
- Monthly trend line charts
- Multi-year comparison charts
- Collective comparison table

### Persistence
- Data stored securely in browser localStorage
- No backend required
- Data remains after refresh

### Reporting
- Export yearly reports as PDF
- Export comparison report
- Clean print layout (UI elements removed automatically)

---

## 🏗 Architecture

The app follows a modular structure with separation of concerns:

```
js/
 ├── main.js            → Controller (event handling & orchestration)
 ├── state/store.js     → State management & persistence
 ├── ui/dashboard.js    → Rendering & charts
 └── utils/helpers.js   → Constants & helpers
```

### Key Design Decisions

- Custom state management (no frameworks)
- DOM rendering separated from logic
- Centralized data store
- UI reacts to state changes
- Reusable rendering functions

---

## ⚙️ Tech Stack

- Vanilla JavaScript (ES Modules)
- HTML5 & CSS3
- Chart.js (data visualization)
- html2canvas (DOM capture)
- jsPDF (report generation)
- LocalStorage (client-side persistence)

No frameworks or backend used.

---

## 📈 What Makes This Interesting

This project demonstrates real-world frontend engineering patterns:

- Modular architecture
- Custom state management
- Dynamic DOM rendering
- Data visualization logic
- Client-side persistence strategy
- Report generation from live UI
- Multi-dataset comparison analytics

---

## 🚀 Future Improvements

Planned enhancements:

- Dynamically create new metric sections
- Configurable metric types
- Data import/export (CSV)
- User accounts & cloud storage
- Better mobile layout
- Editable entries
- Dark mode

---

## 👤 Author

**Sharon Grace Singh**

Built as a real client solution to replace spreadsheet-based reporting with an interactive dashboard.
