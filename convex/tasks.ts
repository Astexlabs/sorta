import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getPendingTasks = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const submitted = await ctx.db
      .query('submissions')
      .withIndex('by_annotator', (q) => q.eq('annotator_subject', identity.subject))
      .collect();

    const submittedTaskIds = new Set(submitted.map((s) => s.task_id));

    const allTasks = await ctx.db.query('tasks').take(50);
    return allTasks.filter((t) => !submittedTaskIds.has(t._id)).slice(0, 10);
  },
});

export const submitTask = mutation({
  args: {
    taskId: v.id('tasks'),
    selectedValue: v.string(),
    timeTakenMs: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    // Check for duplicate submission
    const existing = await ctx.db
      .query('submissions')
      .withIndex('by_task', (q) => q.eq('task_id', args.taskId))
      .filter((q) => q.eq(q.field('annotator_subject'), identity.subject))
      .first();
    if (existing) return { earned_xp: 0, is_gold: false, correct: false };

    let earnedXp = task.xp_reward;
    let correct = false;

    // Gold standard bonus
    if (task.is_gold_standard && task.gold_answer) {
      correct = args.selectedValue === task.gold_answer;
      if (correct) earnedXp = Math.round(earnedXp * 2);
    }

    await ctx.db.insert('submissions', {
      task_id: args.taskId,
      annotator_subject: identity.subject,
      selected_value: args.selectedValue,
      time_taken_ms: args.timeTakenMs,
      earned_xp: earnedXp,
    });

    // Update annotator stats
    const annotator = await ctx.db
      .query('annotators')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (annotator) {
      await ctx.db.patch(annotator._id, {
        total_xp: annotator.total_xp + earnedXp,
        tasks_completed: annotator.tasks_completed + 1,
        last_active: Date.now(),
      });
    } else {
      await ctx.db.insert('annotators', {
        subject: identity.subject,
        total_xp: earnedXp,
        current_streak: 1,
        accuracy_score: 100,
        tasks_completed: 1,
        last_active: Date.now(),
      });
    }

    return {
      earned_xp: earnedXp,
      is_gold: task.is_gold_standard ?? false,
      correct,
    };
  },
});

export const getUserStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const annotator = await ctx.db
      .query('annotators')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!annotator) {
      return {
        total_xp: 0,
        current_streak: 0,
        accuracy_score: 0,
        tasks_completed: 0,
        level: 1,
        xp_to_next: 100,
      };
    }

    const level = Math.floor(annotator.total_xp / 100) + 1;
    const xp_to_next = 100 - (annotator.total_xp % 100);

    return {
      total_xp: annotator.total_xp,
      current_streak: annotator.current_streak,
      accuracy_score: annotator.accuracy_score,
      tasks_completed: annotator.tasks_completed,
      level,
      xp_to_next,
    };
  },
});

export const getLeaderboard = query({
  handler: async (ctx) => {
    const annotators = await ctx.db.query('annotators').order('desc').take(20);

    // Sort by XP descending
    return annotators
      .sort((a, b) => b.total_xp - a.total_xp)
      .map((a, i) => ({
        rank: i + 1,
        subject: a.subject,
        total_xp: a.total_xp,
        tasks_completed: a.tasks_completed,
        accuracy_score: a.accuracy_score,
      }));
  },
});
