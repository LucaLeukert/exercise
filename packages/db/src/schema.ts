import { sql } from 'drizzle-orm'
import { pgTable } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod/v4'

import { ExerciseInRoutine } from '@acme/validators'

export const Routine = pgTable('routine', (t) => ({
    id: t.uuid('id').notNull().primaryKey().defaultRandom(),
    userId: t.varchar('user_id', { length: 256 }).notNull(),
    name: t.varchar('name', { length: 256 }).notNull(),
    description: t.text('description'),
    exercises: t.jsonb('exercises').notNull().$type<ExerciseInRoutine[]>().default(sql`'[]'::jsonb`),
    createdAt: t.timestamp('created_at').defaultNow().notNull(),
    updatedAt: t.timestamp('updated_at', { mode: 'date', withTimezone: true }).$onUpdateFn(() => sql`now()`)
}))

export const CreateRoutineSchema = createInsertSchema(Routine, {
    name: z.string().max(256),
    description: z.string().optional(),
    exercises: z.array(ExerciseInRoutine).default([])
}).omit({
    id: true,
    userId: true,
    createdAt: true,
    updatedAt: true
})

export const UpdateRoutineSchema = CreateRoutineSchema.partial()
