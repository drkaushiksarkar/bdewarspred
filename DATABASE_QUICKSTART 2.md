# Database Migration - Quick Start Guide

## What Changed?

Your dashboard now uses **PostgreSQL** instead of static JSON/CSV files for disease prediction data.

### Data Migration:
- `src/lib/model-output.json` → PostgreSQL `dashboard.dengue_predictions` table
- `src/lib/diarrhoea-data.json` → PostgreSQL `dashboard.diarrhoea_predictions` table
- `public/geo/malaria_predictions.csv` → PostgreSQL `dashboard.malaria_predictions` table

## Setup in 3 Steps

### 1. Install PostgreSQL

**Option A - Download:**
- Visit: https://www.postgresql.org/download/
- Install for your OS

**Option B - Docker (easiest):**
```bash
docker run -d \
  --name ewars-postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  postgres:latest
```

### 2. Configure Database Credentials

Update `.env.local` (already configured with defaults):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ewars
DB_USER=postgres
DB_PASSWORD=postgres  # CHANGE THIS in production!
DB_SCHEMA=dashboard
```

### 3. Run Migration

```bash
# Create database and tables
npm run db:setup

# Load data from JSON/CSV files
npm run db:migrate

# Or do both at once:
npm run db:reset
```

Expected output:
```
✓ Database "ewars" created successfully
✓ Schema and tables created successfully
✓ Dengue predictions: 3434 records migrated
✓ Diarrhoea predictions: 4622 records migrated
✓ Malaria predictions: 71 records migrated
```

## Start Application

```bash
npm run dev
```

Visit http://localhost:9002 - Your dashboard now uses PostgreSQL!

## Verify Migration

### Check Database:
```bash
psql -U postgres -d ewars
```

```sql
-- Check record counts
SELECT COUNT(*) FROM dashboard.dengue_predictions;     -- Should be 3434
SELECT COUNT(*) FROM dashboard.diarrhoea_predictions;  -- Should be 4622
SELECT COUNT(*) FROM dashboard.malaria_predictions;    -- Should be 71

-- View sample data
SELECT * FROM dashboard.dengue_predictions LIMIT 5;
```

### Test API Endpoints:

Open in browser:
- http://localhost:9002/api/data/malaria
- http://localhost:9002/api/data/dengue?aggregate=true
- http://localhost:9002/api/data/diarrhoea?aggregate=true

## Switching Between Different Databases

To use a different database (e.g., production server):

1. Update `.env.local`:
```env
DB_HOST=your-production-server.com
DB_PORT=5432
DB_NAME=ewars_production
DB_USER=your_username
DB_PASSWORD=your_secure_password
```

2. Run migration:
```bash
npm run db:reset
```

## Troubleshooting

### "Connection refused" error

**Solution:** PostgreSQL is not running
```bash
# Check if running:
psql -U postgres -c "SELECT 1;"

# Start PostgreSQL:
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start from Services
# Docker: docker start ewars-postgres
```

### "Database does not exist" error

**Solution:** Run setup script
```bash
npm run db:setup
```

### "No data showing in dashboard"

**Solution:** Run migration
```bash
npm run db:migrate
```

## What's Next?

1. **Test the dashboard** - Verify all features work correctly
2. **Secure credentials** - Change default password in production
3. **Set up backups** - Configure regular database backups
4. **Monitor performance** - Check query performance under load

## Files Changed

### New Files:
- `database/schema.sql` - Database schema definition
- `database/setup.ts` - Database setup script
- `database/migrate.ts` - Data migration script
- `database/README.md` - Detailed documentation
- `src/lib/db.ts` - Database connection utility
- `src/lib/data-db.ts` - Database data access layer
- `src/app/api/data/dengue/route.ts` - Dengue API endpoint
- `src/app/api/data/diarrhoea/route.ts` - Diarrhoea API endpoint
- `src/app/api/data/malaria/route.ts` - Malaria API endpoint

### Modified Files:
- `.env.local` - Added database credentials
- `package.json` - Added database scripts
- `src/components/dashboard/malaria-map.tsx` - Uses database API

### No Changes to:
- Frontend UI/UX remains exactly the same
- All features work identically
- API endpoints (external) unchanged
- GeoJSON files still served from `/public/geo/`

## Benefits

- **Scalability:** Database handles large datasets better than JSON files
- **Flexibility:** Easy to connect to different databases (dev/staging/prod)
- **Performance:** Indexed queries faster than filtering JSON in memory
- **Updates:** Can update data without rebuilding the app
- **Queries:** Can run complex queries and aggregations

## Need Help?

See detailed documentation: `database/README.md`
