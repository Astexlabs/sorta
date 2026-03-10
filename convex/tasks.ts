import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getPendingTasks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) return [];

    // Get task IDs already submitted by this user
    const userSubmissions = await ctx.db
      .query('submissions')
      .withIndex('by_user', (q) => q.eq('user_id', user._id))
      .collect();

    const submittedTaskIds = new Set(userSubmissions.map((s) => s.task_id));

    // Fetch pending tasks not yet submitted by this user
    const allTasks = await ctx.db
      .query('tasks')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .take(20);

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

    const user = await ctx.db
      .query('users')
      .withIndex('by_subject', (q) => q.eq('subject', identity.subject))
      .unique();

    if (!user) throw new Error('User profile not found');

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error('Task not found');

    const isCorrect =
      task.is_gold_standard && task.gold_standard_answer != null
        ? args.selectedValue === task.gold_standard_answer
        : undefined;

    // XP bonus for correct gold standard answers
    const earnedXp = isCorrect ? Math.floor(task.xp_reward * 1.5) : task.xp_reward;

    await ctx.db.insert('submissions', {
      task_id: args.taskId,
      user_id: user._id,
      selected_value: args.selectedValue,
      time_taken_ms: args.timeTakenMs,
      earned_xp: earnedXp,
      is_correct: isCorrect,
    });

    // Update user XP and streak
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = user.last_active_date !== today;
    const newStreak = isNewDay ? user.current_streak + 1 : user.current_streak;

    await ctx.db.patch(user._id, {
      total_xp: user.total_xp + earnedXp,
      current_streak: newStreak,
      last_active_date: today,
    });

    return { earnedXp, isCorrect, isGoldStandard: task.is_gold_standard };
  },
});

export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    return users
      .sort((a, b) => b.total_xp - a.total_xp)
      .slice(0, 20)
      .map((u, i) => ({
        rank: i + 1,
        name: u.name ?? u.email ?? 'Anonymous',
        total_xp: u.total_xp,
        current_streak: u.current_streak,
        accuracy_score: u.accuracy_score,
      }));
  },
});
