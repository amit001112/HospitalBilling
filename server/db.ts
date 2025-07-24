import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { patients } from "@shared/schema";
import { bills, billItems } from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Patient Database Connection
export const patientPool = new Pool({ connectionString: process.env.DATABASE_URL });
export const patientDb = drizzle({ 
  client: patientPool, 
  schema: { patients } 
});

// Billing Database Connection  
export const billingPool = new Pool({ connectionString: process.env.DATABASE_URL });
export const billingDb = drizzle({ 
  client: billingPool, 
  schema: { bills, billItems } 
});

// Main database for compatibility
export const pool = patientPool;
export const db = drizzle({ client: pool, schema: { patients, bills, billItems } });