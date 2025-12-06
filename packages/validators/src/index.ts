import { ZodIssueCode } from "zod/v3";
import { z } from "zod/v4";

export const muscleEnum = z.enum([
  "abdominals",
  "abductors",
  "adductors",
  "biceps",
  "calves",
  "chest",
  "forearms",
  "glutes",
  "hamstrings",
  "lats",
  "lower back",
  "middle back",
  "neck",
  "quadriceps",
  "shoulders",
  "traps",
  "triceps",
]);

export const Exercise = z.object({
  id: z.string().regex(/^[0-9a-zA-Z_-]+$/),
  name: z.string(),
  force: z.union([z.enum(["static", "pull", "push"]), z.null()]).optional(),
  level: z.enum(["beginner", "intermediate", "expert"]).default("beginner"),
  mechanic: z.union([z.enum(["isolation", "compound"]), z.null()]).optional(),
  equipment: z
    .union([
      z.enum([
        "medicine ball",
        "dumbbell",
        "body only",
        "bands",
        "kettlebells",
        "foam roll",
        "cable",
        "machine",
        "barbell",
        "exercise ball",
        "e-z curl bar",
        "other",
      ]),
      z.null(),
    ])
    .optional(),
  primaryMuscles: z.array(muscleEnum),
  secondaryMuscles: z.array(muscleEnum).optional(),
  instructions: z.array(z.string()),
  category: z.enum([
    "powerlifting",
    "strength",
    "stretching",
    "cardio",
    "olympic weightlifting",
    "strongman",
    "plyometrics",
  ]),
  images: z.array(z.url()),
});

export const ExerciseArray = z.array(Exercise);

export const parseJsonPreprocessor = (value: unknown, ctx: z.RefinementCtx) => {
  if (typeof value === "string") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return JSON.parse(value);
    } catch (e) {
      ctx.addIssue({
        code: ZodIssueCode.custom,
        message: (e as Error).message,
      });
    }
  }

  return value;
};

export const ExerciseWithJson = z.preprocess(parseJsonPreprocessor, Exercise);
export const ExerciseArrayWithJson = z.preprocess(
  parseJsonPreprocessor,
  ExerciseArray,
);
