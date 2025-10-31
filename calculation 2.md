# Monthly Cases Calculation Documentation

This document explains how the monthly disease cases are calculated and displayed in the Bangladesh EWARS dashboard for Malaria, Dengue, and Diarrhoea.

## Overview

The dashboard displays three disease metric cards showing monthly predicted cases:
- **Malaria**: Estimated cases based on risk data
- **Dengue**: Aggregated predictions from ML model output
- **Diarrhoea**: Aggregated predictions from prediction data

## Data Sources

### 1. Dengue Data
- **Source File**: `/lib/model-output.json`
- **Data Structure**: Array of time-series predictions by district and date
- **Fields Used**:
  - `district`: District name
  - `predicted`: Predicted case count for a specific date
  - `date`: Date of prediction

### 2. Diarrhoea Data
- **Source File**: `/lib/diarrhoea-data.json`
- **Data Structure**: Array of time-series predictions by district and date
- **Fields Used**:
  - `district`: District name
  - `predicted`: Predicted case count for a specific date
  - `date`: Date of prediction

### 3. Malaria Data
- **Source File**: Hardcoded in `/lib/data.ts` as `malariaRiskData`
- **Data Structure**: Static array of risk assessments for specific locations
- **Fields Used**:
  - `location`: Area name (e.g., "Khagrachari Sadar")
  - `risk_score`: Risk score (0-100)
  - `risk_category`: "Low", "Medium", or "High"

## Calculation Methods

### Dengue Monthly Cases

**Function**: `getAggregatedDenguePredictions()` → `getMonthlyCases()`

**Process**:
1. Load all prediction records from `model-output.json`
2. Group predictions by district name
3. Sum all predicted cases for each district across all dates
4. Calculate total across all districts

**Formula**:
```
Dengue Total = Σ (all predicted cases across all districts and dates)
```

**Code Implementation** (`src/lib/data.ts:56-71`):
```typescript
export const getAggregatedDenguePredictions = (): { [districtName: string]: number } => {
  const allData: any[] = modelOutput;
  const totals: { [districtName: string]: number } = {};

  allData.forEach(item => {
    const districtName = item.district;
    if (districtName) {
      if (!totals[districtName]) {
        totals[districtName] = 0;
      }
      totals[districtName] += item.predicted || 0;
    }
  });

  return totals;
};
```

**Final Calculation**:
```typescript
const dengueTotals = getAggregatedDenguePredictions();
const dengueCases = Math.round(Object.values(dengueTotals).reduce((sum, val) => sum + val, 0));
```

**Alert Threshold**: Cases > 10,000 (displayed in orange)

---

### Diarrhoea Monthly Cases

**Function**: `getAggregatedDiarrhoeaPredictions()` → `getMonthlyCases()`

**Process**:
1. Load all prediction records from `diarrhoea-data.json`
2. Match district names from the data to standard location names
3. Group predictions by district name
4. Sum all predicted cases for each district across all dates
5. Calculate total across all districts

**Formula**:
```
Diarrhoea Total = Σ (all predicted cases across all districts and dates)
```

**Code Implementation** (`src/lib/data.ts:73-93`):
```typescript
export const getAggregatedDiarrhoeaPredictions = (): { [districtName: string]: number } => {
  const allData: any[] = diarrhoeaData;
  const totals: { [districtName: string]: number } = {};

  allData.forEach(item => {
    // Match the lowercase district from JSON to the proper-case name
    const geojsonDistrictName = Object.keys(locations).find(
        (key: any) => locations[key].name.toLowerCase() === item.district.toLowerCase() && locations[key].level === 'district'
    );
    const districtName = geojsonDistrictName ? locations[geojsonDistrictName].name : item.district;

    if (districtName) {
      if (!totals[districtName]) {
        totals[districtName] = 0;
      }
      totals[districtName] += item.predicted || 0;
    }
  });

  return totals;
};
```

**Final Calculation**:
```typescript
const diarrhoeaTotals = getAggregatedDiarrhoeaPredictions();
const diarrhoeaCases = Math.round(Object.values(diarrhoeaTotals).reduce((sum, val) => sum + val, 0));
```

**Alert Threshold**: Cases > 8,000 (displayed in orange)

---

### Malaria Monthly Cases

**Function**: `getMonthlyCases()`

**Process**:
1. Use hardcoded risk data for 5 high-risk malaria areas
2. Convert risk scores to estimated case counts using a scale factor
3. Sum estimates across all areas

**Formula**:
```
Malaria Estimate = Σ (risk_score × 10) for each high-risk area
```

**Data Used** (`src/lib/data.ts:104-110`):
```typescript
export const malariaRiskData: RiskData[] = [
  { id: '1', location: 'Khagrachari Sadar', risk_category: 'High', risk_score: 88, change: 9 },
  { id: '2', location: 'Rangamati Sadar', risk_category: 'High', risk_score: 85, change: 5 },
  { id: '3', location: 'Bandarban Sadar', risk_category: 'Medium', risk_score: 76, change: 14 },
  { id: '4', location: 'Teknaf, Cox\'s Bazar', risk_category: 'Medium', risk_score: 65, change: -2 },
  { id: '5', location: 'Kaptai, Rangamati', risk_category: 'Low', risk_score: 52, change: 1 },
];
```

**Code Implementation** (`src/lib/data.ts:173-206`):
```typescript
const malariaEstimate = Math.round(malariaRiskData.reduce((sum, area) => {
  // Estimate cases based on risk score (higher risk = more cases)
  return sum + (area.risk_score * 10); // Scale factor for estimation
}, 0));
```

**Example Calculation**:
```
Malaria Estimate = (88 × 10) + (85 × 10) + (76 × 10) + (65 × 10) + (52 × 10)
                 = 880 + 850 + 760 + 650 + 520
                 = 3,660 cases
```

**Note**: This is an **estimation method** because no actual malaria prediction model output is available. The scale factor of 10 is arbitrary and used to convert risk scores (0-100) to case estimates.

**Alert Threshold**: Cases > 4,000 (displayed in orange)

---

## Display Logic

### Formatting

All case numbers are formatted with locale-specific thousand separators:
```typescript
value: `${cases.toLocaleString()}`
```

**Examples**:
- 3660 → "3,660"
- 15234 → "15,234"
- 8901 → "8,901"

### Alert Indicators

Cases are highlighted in orange when they exceed thresholds:

```typescript
{
  label: 'Malaria',
  value: `${malariaEstimate.toLocaleString()}`,
  is_high: malariaEstimate > 4000
}
```

**Thresholds**:
- Malaria: > 4,000 cases
- Dengue: > 10,000 cases
- Diarrhoea: > 8,000 cases

### Card Display

The metrics are displayed in the first row of the dashboard using the `MetricsPanels` component (`src/components/dashboard/metrics-panels.tsx`), with icons:
- **Malaria**: Bug icon
- **Dengue**: Activity icon
- **Diarrhoea**: Droplet icon

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                             │
├─────────────────────────────────────────────────────────────┤
│  model-output.json  │  diarrhoea-data.json  │  malariaRisk │
│  (Dengue ML Model)  │  (Diarrhoea Model)    │  Data (Static)│
└──────────┬──────────┴──────────┬─────────────┴──────┬───────┘
           │                     │                     │
           ▼                     ▼                     ▼
┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│ getAggregated    │  │ getAggregated    │  │ Risk Score      │
│ DenguePredictions│  │ DiarrhoePredictions  │ × 10 Scale      │
└──────────┬───────┘  └──────────┬───────┘  └────────┬────────┘
           │                     │                     │
           └──────────┬──────────┴──────────┬─────────┘
                      ▼                     ▼
              ┌────────────────────────────────┐
              │     getMonthlyCases()          │
              │  (Aggregates all sources)      │
              └───────────────┬────────────────┘
                              ▼
              ┌────────────────────────────────┐
              │   DiseaseData[] Array          │
              │   [Malaria, Dengue, Diarrhoea] │
              └───────────────┬────────────────┘
                              ▼
              ┌────────────────────────────────┐
              │    MetricsPanels Component     │
              │    (Dashboard Display)         │
              └────────────────────────────────┘
```

---

## Limitations & Considerations

### Dengue
- ✅ Uses actual ML model predictions
- ✅ Aggregates all temporal predictions
- ⚠️ Total represents sum of ALL dates in the dataset, not just current month

### Diarrhoea
- ✅ Uses actual prediction data
- ✅ Aggregates all temporal predictions
- ⚠️ Total represents sum of ALL dates in the dataset, not just current month

### Malaria
- ⚠️ Uses **estimation** based on risk scores, not actual predictions
- ⚠️ Limited to 5 predefined high-risk areas
- ⚠️ Scale factor (×10) is arbitrary
- ⚠️ Does not account for temporal variations
- ℹ️ Actual malaria prediction model data is not available

---

## Future Improvements

1. **Malaria**:
   - Add actual prediction model for malaria
   - Use real case data instead of risk-based estimation

2. **Temporal Filtering**:
   - Filter predictions to show only current month
   - Add date range selector

3. **Dynamic Thresholds**:
   - Calculate thresholds based on historical data
   - Use percentile-based alerts

4. **Confidence Intervals**:
   - Display uncertainty ranges with predictions
   - Show confidence levels for estimates

---

## References

- **Source Code**: `/src/lib/data.ts` (lines 56-206)
- **Type Definitions**: `/src/lib/types.ts` (lines 41-45)
- **Display Component**: `/src/components/dashboard/metrics-panels.tsx`
- **Dashboard Integration**: `/src/components/dashboard/dashboard-grid.tsx` (lines 79-81)
