import * as schema from "./schema";
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.POSTGRES_URL ?? '');
export const db = drizzle(sql, {
  schema
}); 