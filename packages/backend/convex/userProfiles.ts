import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { userProfileValidator } from "./schema";

// Get user profile by userId
export const getByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return profile;
  },
});

// Create or update user profile
export const upsert = mutation({
  args: {
    userId: v.string(),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    totalWorkouts: v.optional(v.number()),
    totalWorkoutTime: v.optional(v.number()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("expert"),
        v.null()
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Derive userId from authenticated identity
    const userId = identity.subject;

    // Validate that args.userId matches authenticated user (if provided)
    if (args.userId !== userId) {
      throw new Error("Unauthorized: cannot modify another user's profile");
    }

    // Enforce uniqueness: check if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing profile
      await ctx.db.patch(existing._id, {
        username: args.username ?? existing.username,
        bio: args.bio ?? existing.bio,
        profileImageUrl: args.profileImageUrl ?? existing.profileImageUrl,
        totalWorkouts: args.totalWorkouts ?? existing.totalWorkouts,
        totalWorkoutTime: args.totalWorkoutTime ?? existing.totalWorkoutTime,
        level: args.level ?? existing.level,
        updatedAt: now,
      });
      return await ctx.db.get(existing._id);
    } else {
      // Create new profile
      const profileId = await ctx.db.insert("userProfiles", {
        userId: userId,
        username: args.username,
        bio: args.bio,
        profileImageUrl: args.profileImageUrl,
        totalWorkouts: args.totalWorkouts ?? 0,
        totalWorkoutTime: args.totalWorkoutTime ?? 0,
        level: args.level ?? null,
        createdAt: now,
        updatedAt: now,
      });
      return await ctx.db.get(profileId);
    }
  },
});

// Create user profile (with uniqueness check)
export const create = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    totalWorkouts: v.optional(v.number()),
    totalWorkoutTime: v.optional(v.number()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("expert"),
        v.null()
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Derive userId from authenticated identity (ignore any userId in args)
    const userId = identity.subject;

    // Enforce uniqueness: check if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      throw new Error(
        `User profile already exists for userId: ${userId}`
      );
    }

    const now = Date.now();
    const profileId = await ctx.db.insert("userProfiles", {
      userId: userId,
      username: args.username,
      bio: args.bio,
      profileImageUrl: args.profileImageUrl,
      totalWorkouts: args.totalWorkouts ?? 0,
      totalWorkoutTime: args.totalWorkoutTime ?? 0,
      level: args.level ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(profileId);
  },
});

// Update user profile (with uniqueness check)
export const update = mutation({
  args: {
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    profileImageUrl: v.optional(v.string()),
    totalWorkouts: v.optional(v.number()),
    totalWorkoutTime: v.optional(v.number()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("expert"),
        v.null()
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.subject) {
      throw new Error("Unauthorized");
    }

    // Derive userId from authenticated identity (ignore any userId in args)
    const userId = identity.subject;

    // Find existing profile
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existing) {
      throw new Error(`User profile not found for userId: ${userId}`);
    }

    const now = Date.now();
    await ctx.db.patch(existing._id, {
      username: args.username ?? existing.username,
      bio: args.bio ?? existing.bio,
      profileImageUrl: args.profileImageUrl ?? existing.profileImageUrl,
      totalWorkouts: args.totalWorkouts ?? existing.totalWorkouts,
      totalWorkoutTime: args.totalWorkoutTime ?? existing.totalWorkoutTime,
      level: args.level ?? existing.level,
      updatedAt: now,
    });

    return await ctx.db.get(existing._id);
  },
});

