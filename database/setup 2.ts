#!/usr/bin/env node

/**
 * Database Setup Script
 *
 * This script creates the database schema and tables.
 * Run this before running the migration script.
 *
 * Usage: npm run db:setup
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

async function setupDatabase() {
  console.log('Setting up database...\n');

  // Connect to PostgreSQL (without specifying database)
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database
  });

  try {
    // Check if database exists
    const dbName = process.env.DB_NAME || 'ewars';
    const dbCheckResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    // Create database if it doesn't exist
    if (dbCheckResult.rows.length === 0) {
      console.log(`Creating database "${dbName}"...`);
      await adminPool.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database "${dbName}" created successfully\n`);
    } else {
      console.log(`✓ Database "${dbName}" already exists\n`);
    }

    await adminPool.end();

    // Connect to the ewars database to create schema and tables
    const dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: dbName,
    });

    // Read and execute schema SQL
    const schemaSQL = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

    console.log('Creating schema and tables...');
    await dbPool.query(schemaSQL);
    console.log('✓ Schema and tables created successfully\n');

    // Verify tables were created
    const schema = process.env.DB_SCHEMA || 'dashboard';
    const tablesResult = await dbPool.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = $1
       ORDER BY table_name`,
      [schema]
    );

    console.log('Tables created:');
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${schema}.${row.table_name}`);
    });

    await dbPool.end();

    console.log('\n✓ Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Run: npm run db:migrate');
    console.log('  2. Start your application: npm run dev');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
