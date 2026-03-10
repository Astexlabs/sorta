import { mutation } from './_generated/server';

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query('projects').take(1);
    if (existing.length > 0) return { message: 'Already seeded' };

    // Create projects
    const proj1 = await ctx.db.insert('projects', {
      title: 'West African Culture Benchmark',
      description: 'Evaluating cultural nuance in West African idioms and expressions',
      is_active: true,
    });

    const proj2 = await ctx.db.insert('projects', {
      title: 'Nigerian Sentiment Analysis',
      description: 'Classifying sentiment in Nigerian English social media content',
      is_active: true,
    });

    // Swipe tasks – binary classification
    await ctx.db.insert('tasks', {
      project_id: proj1,
      xp_reward: 15,
      is_gold_standard: false,
      status: 'pending',
      ui_schema: {
        component: 'SwipeCard',
        props: {
          prompt: 'Does this statement accurately reflect a common cultural idiom?',
          content_type: 'text',
          content_data: 'No matter how hot your anger is, it cannot cook yams.',
          actions: {
            swipe_right: { label: 'Accurate', value: 'true', color: '#22c55e' },
            swipe_left: { label: 'Inaccurate', value: 'false', color: '#ef4444' },
          },
        },
      },
    });

    await ctx.db.insert('tasks', {
      project_id: proj1,
      xp_reward: 15,
      is_gold_standard: true,
      gold_standard_answer: 'true',
      status: 'pending',
      ui_schema: {
        component: 'SwipeCard',
        props: {
          prompt: 'Does this statement accurately reflect a common cultural idiom?',
          content_type: 'text',
          content_data: 'When the music changes, so does the dance.',
          actions: {
            swipe_right: { label: 'Accurate', value: 'true', color: '#22c55e' },
            swipe_left: { label: 'Inaccurate', value: 'false', color: '#ef4444' },
          },
        },
      },
    });

    await ctx.db.insert('tasks', {
      project_id: proj2,
      xp_reward: 10,
      is_gold_standard: false,
      status: 'pending',
      ui_schema: {
        component: 'SwipeCard',
        props: {
          prompt: 'Classify the sentiment of this text:',
          content_type: 'text',
          content_data: 'The traffic on Third Mainland Bridge today is an absolute nightmare.',
          actions: {
            swipe_right: { label: 'Positive', value: 'positive', color: '#22c55e' },
            swipe_left: { label: 'Negative', value: 'negative', color: '#ef4444' },
          },
        },
      },
    });

    await ctx.db.insert('tasks', {
      project_id: proj2,
      xp_reward: 10,
      is_gold_standard: true,
      gold_standard_answer: 'positive',
      status: 'pending',
      ui_schema: {
        component: 'SwipeCard',
        props: {
          prompt: 'Classify the sentiment of this text:',
          content_type: 'text',
          content_data: 'NEPA brought light all weekend! Best feeling ever.',
          actions: {
            swipe_right: { label: 'Positive', value: 'positive', color: '#22c55e' },
            swipe_left: { label: 'Negative', value: 'negative', color: '#ef4444' },
          },
        },
      },
    });

    // Multiple choice tasks
    await ctx.db.insert('tasks', {
      project_id: proj1,
      xp_reward: 20,
      is_gold_standard: false,
      status: 'pending',
      ui_schema: {
        component: 'MultipleChoice',
        props: {
          prompt: 'Which best describes the tone of this text?',
          content_type: 'text',
          content_data:
            'Abeg, no do like say you no sabi. Every time you dey form big man but your pocket dey cry.',
          options: [
            { label: 'Sarcastic / Mocking', value: 'sarcastic', color: '#f59e0b' },
            { label: 'Angry / Frustrated', value: 'angry', color: '#ef4444' },
            { label: 'Humorous / Playful', value: 'humorous', color: '#22c55e' },
            { label: 'Neutral / Informative', value: 'neutral', color: '#6b7280' },
          ],
        },
      },
    });

    await ctx.db.insert('tasks', {
      project_id: proj2,
      xp_reward: 20,
      is_gold_standard: false,
      status: 'pending',
      ui_schema: {
        component: 'MultipleChoice',
        props: {
          prompt: 'What is the primary language used in this text?',
          content_type: 'text',
          content_data:
            'Na today? Since forever this road don bad. Government no dey hear word.',
          options: [
            { label: 'Nigerian Pidgin', value: 'pidgin', color: '#8b5cf6' },
            { label: 'Standard English', value: 'english', color: '#3b82f6' },
            { label: 'Yoruba', value: 'yoruba', color: '#f59e0b' },
            { label: 'Igbo', value: 'igbo', color: '#22c55e' },
          ],
        },
      },
    });

    await ctx.db.insert('tasks', {
      project_id: proj1,
      xp_reward: 15,
      is_gold_standard: false,
      status: 'pending',
      ui_schema: {
        component: 'SwipeCard',
        props: {
          prompt: 'Is this a proverb commonly used in West Africa?',
          content_type: 'text',
          content_data: 'A child who is not embraced by the village will burn it down to feel its warmth.',
          actions: {
            swipe_right: { label: 'Yes', value: 'true', color: '#22c55e' },
            swipe_left: { label: 'No', value: 'false', color: '#ef4444' },
          },
        },
      },
    });

    await ctx.db.insert('tasks', {
      project_id: proj2,
      xp_reward: 10,
      is_gold_standard: false,
      status: 'pending',
      ui_schema: {
        component: 'SwipeCard',
        props: {
          prompt: 'Classify the sentiment of this text:',
          content_type: 'text',
          content_data: 'Just got my NYSC posting. Lagos! God is good!',
          actions: {
            swipe_right: { label: 'Positive', value: 'positive', color: '#22c55e' },
            swipe_left: { label: 'Negative', value: 'negative', color: '#ef4444' },
          },
        },
      },
    });

    return { message: 'Seeded successfully' };
  },
});
