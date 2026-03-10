import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  pushTokens: defineTable({
    subject: v.string(),
    pushToken: v.string(),
  }).index('by_subject', ['subject']),

  annotators: defineTable({
    subject: v.string(),
    total_xp: v.number(),
    current_streak: v.number(),
    accuracy_score: v.number(),
    tasks_completed: v.number(),
    last_active: v.number(),
  }).index('by_subject', ['subject']).index('by_xp', ['total_xp']),

  projects: defineTable({
    title: v.string(),
    description: v.string(),
    is_active: v.boolean(),
  }),

  tasks: defineTable({
    project_id: v.string(),
    xp_reward: v.number(),
    is_gold_standard: v.optional(v.boolean()),
    gold_answer: v.optional(v.string()),
    ui_schema: v.any(),
  }),

  submissions: defineTable({
    task_id: v.id('tasks'),
    annotator_subject: v.string(),
    selected_value: v.string(),
    time_taken_ms: v.number(),
    earned_xp: v.number(),
  }).index('by_annotator', ['annotator_subject']).index('by_task', ['task_id']),
});
