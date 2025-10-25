# **App Name**: DiseaseVision

## Core Features:

- Data Ingestion & Processing: Accept and process time-series data (disease indicators, weather, feature importances, risk scores). Transform for visualization. Tool determines usage.
- Interactive Time-Series Charts: Display disease cases (current & predicted) with uncertainty ribbons, outbreak flags.  Brush/zoom, hover tooltips. Toggle bands.
- Drill-Down Choropleth Maps: Render maps (country -> division -> district) with choropleth coloring for disease incidence.  On-click for details and linked charts.
- Non-Spatial Risk Heatmaps: Generate heatmaps for Upazila/Union levels, showing risk categories (Low/Medium/High) by time. Sortable by risk score and change vs baseline.
- Feature Importance Bar Chart: Display feature importance with direction of effect (+/−) and date/lag.
- Weather Panels: Display current and predicted temperature, humidity, rainfall, and highlight extreme weather events.
- Downloadable Reports: Enable users to download CSV/PDF reports of visualized data for selected locations and diseases. Provenance footer.
- Location Drill-Down & Filtering: Allow hierarchical navigation through location data (country -> union). Allow disease/date filtering. Persist filters in URL.
- Authentication & Role-Based Access: Secure login with NextAuth.js (JWT sessions). Support email/password + OAuth. Gate features based on user role.
- Data Contract Validation: Use Zod/JSON Schema for data validation on server & client; include units & provenance.
- Config-Driven Visuals: Implement config-driven visuals to allow retuning visuals without code changes.
- AI/Model Integration: Serve forecasts via a versioned API with model metadata. Ensure no PHI/PII leaves the browser. UI is model-agnostic.

## Style Guidelines:

- Background color: Light gray (#F5F5F5) to create a clean and minimal aesthetic.
- Primary color: Deep blue (#3F51B5) for data emphasis and trustworthiness.
- Accent color: Soft orange (#FFAB40) for interactive elements and highlighting.
- Use a colorblind-safe palette (Okabe–Ito). Avoid red/green for risk; add shape/texture cues on maps.
- Body font: 'Inter', a sans-serif font for clear data presentation. Headline font: 'Space Grotesk', sans-serif, for titles and headings. Code font: 'Source Code Pro'.
- Prioritize a dashboard layout with clear sections for visualizations, filters, and key metrics.
- Global filters (sticky): Disease, Date Range, Location (country→division→district→upazila→union).
- Use a consistent, simple icon set to represent different diseases, locations, and data types.
- Implement smooth transitions for navigation, drill-downs, and data updates to enhance user experience.
- Smooth animated transitions for drill-downs and time-range changes; preserve filter context.