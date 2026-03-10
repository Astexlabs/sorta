import { mutation } from './_generated/server';

export const seedTasks = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query('tasks').first();
    if (existing) return 'Already seeded';

    // Seed project
    await ctx.db.insert('projects', {
      title: 'West African Culture Benchmark v1',
      description: 'Evaluate cultural idioms and sentiment in West African contexts',
      is_active: true,
    });

    // Swipe-based tasks
    const swipeTasks = [
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 10,
        ui_schema: {
          layout: 'SwipeCard',
          prompt: 'Classify the sentiment of this text:',
          content_type: 'text',
          content_data: 'The traffic on Third Mainland Bridge today is an absolute nightmare.',
          actions: [
            { id: 'act_1', label: 'Negative', value: 'negative', gesture: 'swipe_left', color: '#ef4444' },
            { id: 'act_2', label: 'Positive', value: 'positive', gesture: 'swipe_right', color: '#22c55e' },
          ],
        },
      },
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 15,
        is_gold_standard: true,
        gold_answer: 'true',
        ui_schema: {
          layout: 'SwipeCard',
          prompt: 'Does this statement accurately reflect a common cultural idiom?',
          content_type: 'text',
          content_data: 'No matter how hot your anger is, it cannot cook yams.',
          actions: [
            { id: 'act_1', label: 'Inaccurate', value: 'false', gesture: 'swipe_left', color: '#ef4444' },
            { id: 'act_2', label: 'Accurate', value: 'true', gesture: 'swipe_right', color: '#22c55e' },
          ],
        },
      },
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 10,
        ui_schema: {
          layout: 'SwipeCard',
          prompt: 'Is this content safe or harmful?',
          content_type: 'text',
          content_data: 'Jollof rice from Nigeria is superior to every other version, and anyone who disagrees is simply wrong.',
          actions: [
            { id: 'act_1', label: 'Harmful', value: 'harmful', gesture: 'swipe_left', color: '#ef4444' },
            { id: 'act_2', label: 'Safe', value: 'safe', gesture: 'swipe_right', color: '#22c55e' },
          ],
        },
      },
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 10,
        ui_schema: {
          layout: 'SwipeCard',
          prompt: 'Classify the sentiment of this text:',
          content_type: 'text',
          content_data: 'The new BRT buses are a welcome improvement. Finally, some comfort during the commute!',
          actions: [
            { id: 'act_1', label: 'Negative', value: 'negative', gesture: 'swipe_left', color: '#ef4444' },
            { id: 'act_2', label: 'Positive', value: 'positive', gesture: 'swipe_right', color: '#22c55e' },
          ],
        },
      },
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 15,
        is_gold_standard: true,
        gold_answer: 'true',
        ui_schema: {
          layout: 'SwipeCard',
          prompt: 'Does this statement accurately reflect a common cultural idiom?',
          content_type: 'text',
          content_data: 'The child who is not embraced by the village will burn it down to feel its warmth.',
          actions: [
            { id: 'act_1', label: 'Inaccurate', value: 'false', gesture: 'swipe_left', color: '#ef4444' },
            { id: 'act_2', label: 'Accurate', value: 'true', gesture: 'swipe_right', color: '#22c55e' },
          ],
        },
      },
    ];

    // Multiple choice tasks
    const mcTasks = [
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 12,
        ui_schema: {
          layout: 'MultipleChoice',
          prompt: 'What emotion does this text primarily convey?',
          content_type: 'text',
          content_data: 'My grandmother used to say that the tortoise carries its house on its back so it is never homeless. I think about that every time I feel lost.',
          actions: [
            { id: 'act_1', label: 'Nostalgia', value: 'nostalgia', gesture: 'tap', color: '#8b5cf6' },
            { id: 'act_2', label: 'Sadness', value: 'sadness', gesture: 'tap', color: '#3b82f6' },
            { id: 'act_3', label: 'Comfort', value: 'comfort', gesture: 'tap', color: '#22c55e' },
            { id: 'act_4', label: 'Anger', value: 'anger', gesture: 'tap', color: '#ef4444' },
          ],
        },
      },
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 12,
        is_gold_standard: true,
        gold_answer: 'pidgin',
        ui_schema: {
          layout: 'MultipleChoice',
          prompt: 'What language/dialect is this text written in?',
          content_type: 'text',
          content_data: 'Wetin dey happen for this side? E be like say everybody don vex today o!',
          actions: [
            { id: 'act_1', label: 'Yoruba', value: 'yoruba', gesture: 'tap', color: '#f59e0b' },
            { id: 'act_2', label: 'Pidgin English', value: 'pidgin', gesture: 'tap', color: '#22c55e' },
            { id: 'act_3', label: 'Igbo', value: 'igbo', gesture: 'tap', color: '#3b82f6' },
            { id: 'act_4', label: 'Hausa', value: 'hausa', gesture: 'tap', color: '#8b5cf6' },
          ],
        },
      },
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 12,
        ui_schema: {
          layout: 'MultipleChoice',
          prompt: 'What is the primary topic of this text?',
          content_type: 'text',
          content_data: 'The price of garri has doubled in just three months. How are families supposed to cope with this?',
          actions: [
            { id: 'act_1', label: 'Politics', value: 'politics', gesture: 'tap', color: '#8b5cf6' },
            { id: 'act_2', label: 'Economy', value: 'economy', gesture: 'tap', color: '#f59e0b' },
            { id: 'act_3', label: 'Health', value: 'health', gesture: 'tap', color: '#22c55e' },
            { id: 'act_4', label: 'Entertainment', value: 'entertainment', gesture: 'tap', color: '#3b82f6' },
          ],
        },
      },
    ];

    // TextCard tasks (read & confirm)
    const textTasks = [
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 8,
        ui_schema: {
          layout: 'TextCard',
          prompt: 'Is this text grammatically correct in standard English?',
          content_type: 'text',
          content_data: 'She has been to the market since morning, and she have not yet return with the provisions we asked for.',
          actions: [
            { id: 'act_1', label: 'Correct', value: 'correct', gesture: 'tap', color: '#22c55e' },
            { id: 'act_2', label: 'Incorrect', value: 'incorrect', gesture: 'tap', color: '#ef4444' },
          ],
        },
      },
      {
        project_id: 'west_african_culture_benchmark_v1',
        xp_reward: 8,
        ui_schema: {
          layout: 'TextCard',
          prompt: 'Does this AI-generated response sound natural and culturally appropriate?',
          content_type: 'text',
          content_data: 'Greetings! I hope this message finds you in excellent spirits. In Nigeria, it is customary to greet your elders by prostrating on the ground, which is called "dobale" in Yoruba culture.',
          actions: [
            { id: 'act_1', label: 'Natural', value: 'natural', gesture: 'tap', color: '#22c55e' },
            { id: 'act_2', label: 'Unnatural', value: 'unnatural', gesture: 'tap', color: '#ef4444' },
          ],
        },
      },
    ];

    for (const task of [...swipeTasks, ...mcTasks, ...textTasks]) {
      await ctx.db.insert('tasks', task as any);
    }

    return 'Seeded 10 tasks';
  },
});
