export interface SwipeAction {
  label: string;
  value: string;
  color: string;
}

export interface MultipleChoiceOption {
  label: string;
  value: string;
  color: string;
}

export interface SwipeCardProps {
  prompt: string;
  content_type: 'text' | 'image';
  content_data: string;
  actions: {
    swipe_right: SwipeAction;
    swipe_left: SwipeAction;
  };
}

export interface MultipleChoiceProps {
  prompt: string;
  content_type: 'text' | 'image';
  content_data: string;
  options: MultipleChoiceOption[];
}

export type SDUIComponent = 'SwipeCard' | 'MultipleChoice';

export interface SDUISchema {
  component: SDUIComponent;
  props: SwipeCardProps | MultipleChoiceProps;
}

export interface Task {
  _id: string;
  project_id: string;
  xp_reward: number;
  is_gold_standard: boolean;
  gold_standard_answer?: string;
  ui_schema: SDUISchema;
  status: 'pending' | 'completed';
}

export interface SubmitResult {
  earnedXp: number;
  isCorrect?: boolean;
  isGoldStandard: boolean;
}
