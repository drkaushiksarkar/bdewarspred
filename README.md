# Early Warning, Alert, and Response System – Bangladesh

This is an AI-powered Climate Informed Early Warning, Alert, and Response System designed by the Institute for Health Modeling and Climate Solutions as part of the technical assistance provided to the Ministry of Health & Family Welfare, Bangladesh with funding from The Global Fund COVID19 Response Mechanism.

## Project Structure and File Overview

Here is a breakdown of the key files and directories in this project:

### Root Directory

-   **`next.config.ts`**: Configuration file for Next.js. It includes settings for image optimization and build process adjustments.
-   **`tailwind.config.ts`**: Configuration for the Tailwind CSS framework, where the design components (e.g., colors, fonts, spacing) are defined.
-   **`package.json`**: Lists all project dependencies (like React, Next.js, Genkit) and defines scripts for running, building, and testing the application (e.g., `npm run dev`).
-   **`components.json`**: Configuration file for `shadcn/ui`, defining paths and settings for the UI components.
-   **`tsconfig.json`**: TypeScript configuration file, which sets the rules for how TypeScript code is compiled into JavaScript.

### `src/` Directory

This is where the main source code for the application resides.

#### `src/app/`

This directory uses the Next.js App Router for routing, pages, and layouts.

-   **`page.tsx`**: The main entry point for the dashboard UI. This is the primary component rendered for the root URL (`/`).
-   **`layout.tsx`**: The root layout for the application. It wraps all pages and is used to include global elements like fonts, stylesheets, and the main `<body>` tag.
-   **`globals.css`**: The global stylesheet. It defines the base styles for the application, including CSS variables for theming (e.g., `--background`, `--primary`) and Tailwind CSS directives.
-   **`actions.ts`**: Contains Server Actions. These are server-side functions that can be called directly from client-side components, used for handling form submissions and data mutations securely without needing to create separate API endpoints (e.g., `downloadReportAction`, `searchAction`).

#### `src/components/`

This folder contains all the reusable React components.

-   **`dashboard/`**: Contains the high-level widgets that make up the main dashboard grid, such as `TimeSeriesChart.tsx`, `ChoroplethMap.tsx`, and `RiskHeatmap.tsx`.
-   **`filters/`**: Holds the components used for data filtering in the sidebar, like `LocationFilter.tsx` and `DateRangeFilter.tsx`.
-   **`layout/`**: Structural components that define the overall layout of the app, including `Header.tsx`, `AppSidebar.tsx`, and `HelpDrawer.tsx`.
-   **`ui/`**: Base UI components from `shadcn/ui`, such as `Button.tsx`, `Card.tsx`, and `Input.tsx`. These are the fundamental building blocks for the UI.

#### `src/lib/`

A central place for shared code, data, type definitions, and utilities.

-   **`data.ts`**: The source of predicted data for the application's visualizations (e.g., time-series data, risk scores). In the production app, this is replaced by API calls to a live database. Currently, the PostGreSQL database is hosted on the server of the IEDCR, Bangladesh, with potential for transition to any other server, including DGHS MIS server.
-   **`locations.ts`**: Contains the hierarchical location data (divisions, districts, etc.) used by the location filter.
-   **`types.ts`**: Defines all the core TypeScript types used across the application (e.g., `Location`, `Disease`, `TimeSeriesDataPoint`), ensuring data consistency.
-   **`utils.ts`**: Contains utility functions, most notably the `cn` function for conditionally combining Tailwind CSS class names.
-   **`weather.ts`**: Includes the server-side logic for fetching live weather data from the OpenWeatherMap API.

#### `src/ai/`

This directory holds all the Generative AI logic, powered by Genkit.

-   **`genkit.ts`**: Initializes and configures the core Genkit instance, including setting up the model provider (e.g., Google AI).
-   **`flows/`**: Contains the AI workflows (flows). Each file defines a specific multi-step AI task.
    -   `data-qa.ts`: Powers the natural language search bar, answering questions based on the provided data context.
    -   `generate-report-from-prompt.ts`: Handles the logic for generating downloadable reports based on user prompts and filters.
    -   `data-insights-from-prompt.ts`: An AI agent for generating insights from data.

    ## Development

    The system is architected by Dr Kaushik Sarkar, Director, IMACS