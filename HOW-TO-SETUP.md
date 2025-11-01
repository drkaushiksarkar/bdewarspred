# How to Setup - Bangladesh EWARS Prediction System

## Prerequisites

- Node.js (version 20 or higher recommended)
- npm (comes with Node.js)
- PostgreSQL database access
- Git (for cloning the repository)

---

## 1. Environment Configuration

### Create `.env.local` File

Create a `.env.local` file in the root directory of the project with the following environment variables:

```bash
# OpenWeather API Configuration
OPENWEATHER_API_KEY=your_openweather_api_key_here

# NextAuth Configuration (for authentication)
NEXTAUTH_SECRET=your-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:9002

# Primary PostgreSQL Database Configuration
PG_HOST=your_database_host
PG_PORT=5432
PG_DB=ewarsdb
PG_USER=your_database_user
PG_PASS=your_database_password

# Secondary Database Connection (used by some API routes)
PG_HOST_2=your_database_host
PG_PORT_2=5432
PG_DB_2=ewarsdb
PG_USER_2=your_database_user
PG_PASS_2=your_database_password

# Email Configuration (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=your_email@gmail.com
```

### Required Environment Variables Explained:

- **OPENWEATHER_API_KEY**: API key from OpenWeatherMap for weather data
- **NEXTAUTH_SECRET**: Secret key for NextAuth.js session encryption (change in production)
- **NEXTAUTH_URL**: Base URL of your application
- **PG_*** variables: PostgreSQL database connection details
- **EMAIL_*** variables: SMTP email configuration for sending notifications

---

## 2. Development Setup

### Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, database drivers, and other dependencies.

### Start Development Server

```bash
npm run dev
```

The development server will start on **http://localhost:9002** with Turbopack enabled for faster builds.

### Using a Different Port

If port 9002 is already in use or you want to use a different port, modify the `package.json`:

```json
"scripts": {
  "dev": "next dev --turbopack -p YOUR_PORT_NUMBER"
}
```

Or run directly with:

```bash
npx next dev --turbopack -p 3000
```

**Note**: If you change the port, update `NEXTAUTH_URL` in `.env.local` accordingly.

---

## 3. Production Build

### Build for Production

```bash
npm run build
```

This command creates an optimized production build of the application. It will:
- Compile TypeScript code
- Optimize assets
- Generate static pages
- Create production bundles

### Start Production Server

After building, start the production server:

```bash
npm run start
```

The production server will run on **http://localhost:9002**.

### Full Production Workflow

```bash
npm install
npm run build
npm run start
```

---

## 4. Database Setup (Optional)

If you need to set up or reset the database:

```bash
# Setup database tables
npm run db:setup

# Run migrations
npm run db:migrate

# Reset database (setup + migrate)
npm run db:reset
```

---

## 5. Additional Scripts

```bash
# Run ESLint for code quality
npm run lint

# Type checking (without emitting files)
npm run typecheck

# Start Genkit development server (for AI features)
npm run genkit:dev

# Start Genkit with watch mode
npm run genkit:watch
```

---

## 6. Common Issues & Debugging

### Issue: Port Already in Use

**Error**: `Port 9002 is already in use`

**Solution**:
1. Find the process using the port:
   ```bash
   # On macOS/Linux
   lsof -ti:9002

   # On Windows
   netstat -ano | findstr :9002
   ```

2. Kill the process or use a different port (see section 2.3)

### Issue: Database Connection Failed

**Error**: `ECONNREFUSED` or database connection errors

**Solution**:
1. Verify database credentials in `.env.local`
2. Check if PostgreSQL server is running
3. Verify network connectivity to database host
4. Check firewall settings
5. Test connection manually:
   ```bash
   psql -h YOUR_HOST -p 5432 -U YOUR_USER -d ewarsdb
   ```

### Issue: Missing Environment Variables

**Error**: `Environment variable ... is not defined`

**Solution**:
1. Ensure `.env.local` file exists in root directory
2. Verify all required variables are defined
3. Restart the development server after adding variables

### Issue: Module Not Found

**Error**: `Module not found: Can't resolve '...'`

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Build Fails with Type Errors

**Solution**:
```bash
# Run type checking to see all errors
npm run typecheck

# Fix TypeScript errors before building
npm run build
```

### Issue: Email Sending Fails

**Solution**:
1. For Gmail, use [App Passwords](https://support.google.com/accounts/answer/185833)
2. Verify EMAIL_USER and EMAIL_PASS in `.env.local`
3. Check if "Less secure app access" is enabled (not recommended)

### Issue: OpenWeather API Not Working

**Solution**:
1. Verify your API key is active at [OpenWeatherMap](https://openweathermap.org/)
2. Check API quota limits
3. Ensure OPENWEATHER_API_KEY is correctly set in `.env.local`

---

## 7. Verification Checklist

Before starting development, verify:

- [ ] `.env.local` file created with all required variables
- [ ] Dependencies installed successfully (`node_modules` folder exists)
- [ ] Database connection working
- [ ] Development server starts without errors
- [ ] Can access application at http://localhost:9002

---

## 8. Project Structure Overview

```
bdewarspred/
├── src/
│   ├── app/              # Next.js app directory (pages & routes)
│   ├── components/       # React components
│   ├── lib/              # Utility functions and configurations
│   └── ai/               # AI/ML related code
├── database/             # Database setup and migration scripts
├── public/               # Static assets
├── .env.local            # Environment variables (create this)
├── package.json          # Dependencies and scripts
└── HOW-TO-SETUP.md      # This file
```

---

## 9. Getting Help

If you encounter issues not covered in this guide:

1. Check the console/terminal for error messages
2. Review the `.env.local` configuration
3. Ensure all dependencies are up to date
4. Check the Next.js documentation: https://nextjs.org/docs
5. Review application logs for detailed error information

---

## 10. Quick Start Summary

```bash
# 1. Clone the repository (if not already done)
git clone <repository-url>
cd bdewarspred

# 2. Create .env.local file with required variables
# (See section 1)

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Open browser
# Navigate to http://localhost:9002
```

---

**Happy Coding!**
