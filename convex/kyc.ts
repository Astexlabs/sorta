import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getKycProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query('kyc_profiles')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();
  },
});

export const saveKycProfile = mutation({
  args: {
    full_legal_name: v.string(),
    date_of_birth: v.string(),
    nationality: v.string(),
    phone_number: v.string(),
    address_line1: v.string(),
    address_city: v.string(),
    address_country: v.string(),
    work_eligibility: v.string(),
    tax_id: v.optional(v.string()),
    id_type: v.string(),
    id_number: v.string(),
    id_front_uri: v.string(),
    id_back_uri: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const existing = await ctx.db
      .query('kyc_profiles')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    const data = {
      ...args,
      subject: identity.subject,
      verification_status: 'submitted' as const,
      submitted_at: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert('kyc_profiles', data);
  },
});

// Simulates the mock API verification — called after a delay on the client
export const mockApproveKyc = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const profile = await ctx.db
      .query('kyc_profiles')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!profile) throw new Error('KYC profile not found');

    await ctx.db.patch(profile._id, { verification_status: 'approved' });
    return { status: 'approved' };
  },
});
