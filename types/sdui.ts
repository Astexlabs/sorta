export interface SDUIAction {
  id: string;
  label: string;
  value: string;
  gesture?: 'swipe_left' | 'swipe_right' | 'tap';
  color: string;
}

export type SDUIComponentType = 'SwipeCard' | 'MultipleChoice' | 'TextCard';

export interface SDUISchema {
  layout: SDUIComponentType;
  prompt: string;
  content_type: 'text' | 'image';
  content_data: string;
  actions: SDUIAction[];
}

export interface Task {
  _id: string;
  project_id: string;
  xp_reward: number;
  is_gold_standard?: boolean;
  gold_answer?: string;
  ui_schema: SDUISchema;
}
