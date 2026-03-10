import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  pushTokens: defineTable({
    subject: v.string(),
    pushToken: v.string(),
  }).index('by_subject', ['subject']),

  users: defineTable({
    subject: v.string(), // Clerk user subject ID
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    total_xp: v.number(),
    current_streak: v.number(),
    last_active_date: v.optional(v.string()), // ISO date string YYYY-MM-DD
    accuracy_score: v.number(), // 0-100
  }).index('by_subject', ['subject']),

  projects: defineTable({
    title: v.string(),
    description: v.string(),
    is_active: v.boolean(),
  }),

  tasks: defineTable({
    project_id: v.id('projects'),
    xp_reward: v.number(),
    is_gold_standard: v.boolean(),
    gold_standard_answer: v.optional(v.string()),
    ui_schema: v.any(), // SDUI JSON payload
    status: v.union(v.literal('pending'), v.literal('completed')),
  })
    .index('by_project', ['project_id'])
    .index('by_status', ['status']),

  submissions: defineTable({
    task_id: v.id('tasks'),
    user_id: v.id('users'),
    selected_value: v.string(),
    time_taken_ms: v.number(),
    earned_xp: v.number(),
    is_correct: v.optional(v.boolean()),
  })
    .index('by_task', ['task_id'])
    .index('by_user', ['user_id']),
});
