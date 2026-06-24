export interface EmotionalResource {
  empathy: number;
  resilience: number;
  clarity: number;
}

export interface KnowledgeFragment {
  bookTitle: string;
  quote: string;
  insight: string;
  question: string;
  correctAnswerExplanation: string;
}

export interface GameChoice {
  id: "A" | "B" | "C";
  text: string;
  consequenceText: string;
  resourceChanges: EmotionalResource;
}

export interface RealWorldQuest {
  title: string;
  description: string;
  reward: string;
}

export interface GameResponse {
  islandStatus: string;
  emotionalResource: EmotionalResource;
  narrative: string;
  knowledgeFragment: KnowledgeFragment;
  choices: GameChoice[];
  realWorldQuest: RealWorldQuest;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "architect";
  text: string;
  timestamp: string;
  // Dynamic parameters returned from server for rendering rich states
  stateData?: GameResponse;
}

export interface BookItem {
  title: string;
  author: string;
  quote: string;
  therapeuticValue: string;
  category: "Lo âu & Stress" | "Xung đột & Thấu cảm" | "Áp lực học tập" | "Bạo lực mạng";
}
