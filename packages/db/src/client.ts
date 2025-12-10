import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'

import * as schema from './schema'

export const createDbClient = (connectionString: string) => {
    const sql = neon(connectionString)
    return drizzle(sql, {
        schema,
        casing: 'snake_case'
    })
}

// For environments where process.env is available (like Node.js)
export const db =
    typeof process !== 'undefined' && process.env.POSTGRES_URL
        ? createDbClient(process.env.POSTGRES_URL)
        : null

export type DbClient = ReturnType<typeof createDbClient>
