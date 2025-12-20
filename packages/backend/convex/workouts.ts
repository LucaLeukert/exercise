import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { workoutProgressValidator } from './schema'

export const start = mutation({
    args: {
        routineId: v.optional(v.id('routines')),
        visibility: v.optional(v.union(v.literal('private'), v.literal('public'))),
        initialProgress: v.optional(workoutProgressValidator)
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const now = Date.now()
        const progress = args.initialProgress ?? {
            sets: [],
            startedAt: now,
            lastUpdatedAt: now
        }

        // Ensure timestamps are set
        if (!progress.startedAt) progress.startedAt = now
        if (!progress.lastUpdatedAt) progress.lastUpdatedAt = now

        const workoutId = await ctx.db.insert('workoutSessions', {
            userId: identity.subject,
            routineId: args.routineId,
            status: 'active',
            visibility: args.visibility ?? 'private',
            state: progress,
            startedAt: now,
            lastHeartbeat: now
        })

        return {
            workoutId,
            status: 'active'
        }
    }
})

export const saveProgress = mutation({
    args: {
        workoutId: v.id('workoutSessions'),
        progress: workoutProgressValidator
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const session = await ctx.db.get(args.workoutId)
        if (!session || session.userId !== identity.subject) {
            throw new Error('Workout not found')
        }

        if (session.status !== 'active') {
            throw new Error('Workout is not active')
        }

        const now = Date.now()
        const progress = {
            ...args.progress,
            lastUpdatedAt: now
        }

        await ctx.db.patch(args.workoutId, {
            state: progress,
            lastHeartbeat: now
        })

        return { ok: true }
    }
})

export const complete = mutation({
    args: {
        workoutId: v.id('workoutSessions')
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const session = await ctx.db.get(args.workoutId)
        if (!session || session.userId !== identity.subject) {
            throw new Error('Workout not found')
        }

        const now = Date.now()

        await ctx.db.patch(args.workoutId, {
            status: 'completed',
            endedAt: now,
            lastHeartbeat: now
        })

        return { ok: true }
    }
})

export const cancel = mutation({
    args: {
        workoutId: v.id('workoutSessions')
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const session = await ctx.db.get(args.workoutId)
        if (!session || session.userId !== identity.subject) {
            throw new Error('Workout not found')
        }

        const now = Date.now()

        await ctx.db.patch(args.workoutId, {
            status: 'cancelled',
            endedAt: now,
            lastHeartbeat: now
        })

        return { ok: true }
    }
})

export const getById = query({
    args: { workoutId: v.id('workoutSessions') },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()

        const session = await ctx.db.get(args.workoutId)
        if (!session) {
            return null
        }

        // Check visibility - public workouts can be viewed by anyone
        if (session.visibility === 'private' && session.userId !== identity?.subject) {
            return null
        }

        return session
    }
})

export const getActive = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            return null
        }

        const activeWorkout = await ctx.db
            .query('workoutSessions')
            .withIndex('by_userId_status', (q) =>
                q.eq('userId', identity.subject).eq('status', 'active')
            )
            .first()

        return activeWorkout
    }
})

export const recent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        const workouts = await ctx.db
            .query('workoutSessions')
            .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
            .order('desc')
            .take(args.limit ?? 10)

        return workouts
    }
})

export const history = query({
    args: {
        status: v.optional(
            v.union(
                v.literal('active'),
                v.literal('completed'),
                v.literal('cancelled'),
                v.literal('archived')
            )
        ),
        limit: v.optional(v.number()),
        cursor: v.optional(v.id('workoutSessions'))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error('Unauthorized')
        }

        let workoutsQuery = ctx.db
            .query('workoutSessions')
            .withIndex('by_userId', (q) => q.eq('userId', identity.subject))
            .order('desc')

        const workouts = await workoutsQuery.take(args.limit ?? 20)

        const filtered = args.status ? workouts.filter((w) => w.status === args.status) : workouts

        return {
            workouts: filtered,
            hasMore: workouts.length === (args.limit ?? 20)
        }
    }
})

export const follow = query({
    args: { workoutId: v.id('workoutSessions') },
    handler: async (ctx, args) => {
        const session = await ctx.db.get(args.workoutId)

        if (!session) {
            throw new Error('Workout not found')
        }

        const identity = await ctx.auth.getUserIdentity()
        if (session.visibility === 'private' && session.userId !== identity?.subject) {
            throw new Error('Workout not found')
        }

        return {
            visibility: session.visibility,
            status: session.status,
            state: session.state
        }
    }
})
