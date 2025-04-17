import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// For automatic migrations
const migrationClient = postgres(process.env.DATABASE_URL!);
const db = drizzle(migrationClient, { schema });

// This will create the tables automatically
async function main() {
  try {
    console.log('Creating tables if they do not exist...');
    
    // Users table
    await migrationClient`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "full_name" TEXT NOT NULL
      );
    `;
    
    // Create transaction_type enum type if not exists
    await migrationClient`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
          CREATE TYPE transaction_type AS ENUM ('income', 'expense');
        END IF;
      END
      $$;
    `;
    
    // Categories table
    await migrationClient`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "icon" TEXT NOT NULL,
        "color" TEXT NOT NULL
      );
    `;
    
    // Transactions table
    await migrationClient`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id" SERIAL PRIMARY KEY,
        "amount" NUMERIC NOT NULL,
        "type" transaction_type NOT NULL,
        "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "description" TEXT,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "category_id" INTEGER REFERENCES "categories"("id")
      );
    `;
    
    // Budgets table
    await migrationClient`
      CREATE TABLE IF NOT EXISTS "budgets" (
        "id" SERIAL PRIMARY KEY,
        "amount" NUMERIC NOT NULL,
        "month" INTEGER NOT NULL,
        "year" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL REFERENCES "users"("id"),
        "category_id" INTEGER NOT NULL REFERENCES "categories"("id")
      );
    `;
    
    console.log('Tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await migrationClient.end();
    process.exit(0);
  }
}

main();