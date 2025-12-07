import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ExerciseInRoutine } from "@acme/validators";

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});


export const Routine = pgTable("routine", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 256 }).notNull(),
  description: t.text(),
  exercises: t.jsonb().notNull().$type<ExerciseInRoutine[]>().default([]),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CreateRoutineSchema = createInsertSchema(Routine, {
  name: z.string().max(256),
  description: z.string().optional(),
  exercises: z.array(ExerciseInRoutine).default([]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateRoutineSchema = CreateRoutineSchema.partial();
