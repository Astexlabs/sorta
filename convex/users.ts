import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const currentIdentity = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      subject: identity.subject,
      email: identity.email,
      name: identity.name,
      pictureUrl: identity.pictureUrl,
    };
  },
});

export const getOrCreateUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const existing = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (existing) return existing;

    const userId = await ctx.db.insert('users', {
      subject: identity.subject,
      name: identity.name,
      email: identity.email,
      total_xp: 0,
      current_streak: 0,
      accuracy_score: 100,
    });

    return await ctx.db.get(userId);
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();
  },
});

export const savePushToken = mutation({
  args: { pushToken: v.string() },
  handler: async (ctx, { pushToken }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const existing = await ctx.db
      .query('pushTokens')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { pushToken });
      return existing._id;
    }

    return await ctx.db.insert('pushTokens', {
      subject: identity.subject,
      pushToken,
    });
  },
});
