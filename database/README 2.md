# Database Migration Guide

This guide explains how to migrate your Bangladesh EWARS dashboard data from static JSON/CSV files to a PostgreSQL database.

## Overview

The migration moves the following data sources to PostgreSQL:
- **model-output.json** → `dashboard.dengue_predictions` table
- **diarrhoea-data.json** → `dashboard.diarrhoea_predictions` table
- **malaria_predictions.csv** → `dashboard.malaria_predictions` table

## Prerequisites

1. **PostgreSQL installed** on your system
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres`

2. **Node.js dependencies installed**
   ```bash
   npm install
   ```

## Database Configuration

The database credentials are configured in `.env.local`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ewars
DB_USER=postgres
DB_PASSWORD=postgres
DB_SCHEMA=dashboard
```

**Important:** Update these values to match your PostgreSQL setup, especially the password!

## Migration Steps

### Step 1: Create Database and Schema

Run the setup script to create the database, schema, and tables:

```bash
npm run db:setup
```

This will:
- Create the `ewars` database (if it doesn't exist)
- Create the `dashboard` schema
- Create three tables:
  - `dengue_predictions` - Time series predictions for dengue
  - `diarrhoea_predictions` - Time series predictions for diarrhoea
  - `malaria_predictions` - Malaria rate predictions by upazila
- Create indexes for better query performance
- Create views for easy access to latest predictions

### Step 2: Migrate Data

Run the migration script to load data from JSON/CSV files into PostgreSQL:

```bash
npm run db:migrate
```

This will:
- Load all dengue predictions from `model-output.json`
- Load all diarrhoea predictions from `diarrhoea-data.json`
- Load all malaria predictions from `malaria_predictions.csv`
- Display progress and final record counts

Expected output:
```
Starting data migration...

1. Migrating dengue predictions from model-output.json...
  Found 3,434 dengue prediction records
  Inserted 3434/3434 records
  ✓ Dengue predictions migrated successfully

2. Migrating diarrhoea predictions from diarrhoea-data.json...
  Found 4,622 diarrhoea prediction records
  Inserted 4622/4622 records
  ✓ Diarrhoea predictions migrated successfully

3. Migrating malaria predictions from malaria_predictions.csv...
  Found 71 malaria prediction records
  Inserted 71/71 records
  ✓ Malaria predictions migrated successfully

Data verification:
  - Dengue predictions: 3434 records
  - Diarrhoea predictions: 4622 records
  - Malaria predictions: 71 records

✓ Data migration completed successfully!
```

### Step 3: Start the Application

Start your Next.js application:

```bash
npm run dev
```

The dashboard will now load data from PostgreSQL instead of static files!

## Quick Reset

To reset the database and re-migrate all data:

```bash
npm run db:reset
```

This runs both `db:setup` and `db:migrate` in sequence.

## Database Schema

### dengue_predictions

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| date | DATE | Prediction date |
| district | VARCHAR(100) | District name (lowercase) |
| actual | DECIMAL(10,2) | Actual cases (if available) |
| predicted | DECIMAL(10,2) | Predicted cases |
| uncertainty_lower | DECIMAL(10,2) | Lower uncertainty bound |
| uncertainty_upper | DECIMAL(10,2) | Upper uncertainty bound |
| is_outbreak | BOOLEAN | Outbreak flag |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- `idx_dengue_date` on (date)
- `idx_dengue_district` on (district)
- `idx_dengue_date_district` on (date, district)

**Unique Constraint:** (date, district)

### diarrhoea_predictions

Same structure as `dengue_predictions` but for diarrhoea data.

### malaria_predictions

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| upazila_id | VARCHAR(50) | Upazila ID (unique) |
| pv_rate | DECIMAL(15,10) | P. vivax malaria rate |
| pf_rate | DECIMAL(15,10) | P. falciparum malaria rate |
| mixed_rate | DECIMAL(15,10) | Mixed malaria rate |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- `idx_malaria_upazila` on (upazila_id)

**Unique Constraint:** upazila_id

## API Endpoints

The following API endpoints serve data from PostgreSQL:

### Dengue Data

- **Aggregated predictions:** `GET /api/data/dengue?aggregate=true`
- **District time series:** `GET /api/data/dengue?district=Dhaka`

### Diarrhoea Data

- **Aggregated predictions:** `GET /api/data/diarrhoea?aggregate=true`
- **District time series:** `GET /api/data/diarrhoea?district=Dhaka`

### Malaria Data

- **All predictions:** `GET /api/data/malaria`

## Components Updated

The following components have been updated to use database data:

1. **MalariaMap** (`src/components/dashboard/malaria-map.tsx`)
   - Now fetches from `/api/data/malaria` instead of CSV file

## Troubleshooting

### Connection Issues

If you see connection errors:

1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres -c "SELECT version();"
   ```

2. Check credentials in `.env.local`

3. Ensure PostgreSQL accepts connections on localhost:5432

### Migration Errors

If migration fails:

1. Check PostgreSQL logs for detailed errors
2. Verify JSON/CSV files exist in correct locations
3. Try resetting: `npm run db:reset`

### Data Verification

To verify data was migrated correctly:

```bash
psql -U postgres -d ewars
```

Then run queries:
```sql
-- Check record counts
SELECT COUNT(*) FROM dashboard.dengue_predictions;
SELECT COUNT(*) FROM dashboard.diarrhoea_predictions;
SELECT COUNT(*) FROM dashboard.malaria_predictions;

-- View sample data
SELECT * FROM dashboard.dengue_predictions LIMIT 5;
SELECT * FROM dashboard.latest_dengue_predictions;
```

## Using Different Database

To connect to a different PostgreSQL database (e.g., production server):

1. Update `.env.local` with new credentials:
   ```env
   DB_HOST=production-server.example.com
   DB_PORT=5432
   DB_NAME=ewars_prod
   DB_USER=ewars_user
   DB_PASSWORD=secure_password
   ```

2. Run migration:
   ```bash
   npm run db:reset
   ```

## Backup and Restore

### Backup

```bash
pg_dump -U postgres -d ewars -n dashboard > backup.sql
```

### Restore

```bash
psql -U postgres -d ewars < backup.sql
```

## Performance Considerations

- All tables have appropriate indexes for fast queries
- Database connection pooling is configured (max 20 connections)
- Queries are optimized to fetch only required data
- Views provide pre-aggregated data for common queries

## Next Steps

After successful migration:

1. **Test thoroughly** - Verify all dashboard features work correctly
2. **Monitor performance** - Check query performance under load
3. **Set up backups** - Configure regular database backups
4. **Update data** - Plan for regular data updates from your data sources
5. **Consider caching** - Add Redis or similar for frequently accessed data

## Support

For issues or questions:
1. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
2. Check application logs: `npm run dev` output
3. Verify database connectivity and permissions
