export type Screen = "Dashboard" | "Library" | "Flashcards" | "Quizzes" | "Timer" | "Analytics" | "Plans" | "Reminders" | "Settings";

export type LibraryTab = "Notes" | "Files" | "Decks" | "Quizzes";

export type Status = "Strong" | "Needs review" | "Weak";

export type IconName =
  | "analytics"
  | "arrow"
  | "bell"
  | "book"
  | "calendar"
  | "cards"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "dashboard"
  | "document"
  | "download"
  | "file"
  | "folder"
  | "moon"
  | "more"
  | "plus"
  | "quiz"
  | "reminder"
  | "search"
  | "settings"
  | "sun"
  | "timer"
  | "trend";

export interface NavItem {
  label: string;
  icon: IconName;
}

export interface WeakTopic {
  name: string;
  subject: string;
  accuracy: number;
  status: Status;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  documents: number;
  decks: number;
  topics: number;
  color: string;
  progress: number;
}

export interface StudyResource {
  title: string;
  meta: string;
  type: LibraryTab;
  updated: string;
}

export interface FlashcardDeck {
  id: number;
  title: string;
  subject: string;
  cards: number;
  due: number;
  mastered: number;
  color: string;
  lastStudied: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  topic: string;
}

export type Rating = "Again" | "Hard" | "Good" | "Easy";

export type QuizQuestionType = "Multiple choice" | "True or false" | "Identification" | "Matching";

export interface QuizSet {
  id: number;
  title: string;
  subject: string;
  questions: number;
  attempts: number;
  bestScore: number;
  duration: number;
  color: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface QuizQuestion {
  id: number;
  type: QuizQuestionType;
  topic: string;
  prompt: string;
  choices?: string[];
  answer: string;
  explanation: string;
  pairs?: MatchPair[];
}

export interface QuizAnswerResult {
  questionId: number;
  topic: string;
  correct: boolean;
}

export type Plan = "free" | "plus";
export type Activity = "flashcards" | "quiz" | "reading";
export type Period = "Day" | "Week" | "Month";

export interface StudySession {
  id: string;
  subject: string;
  activity: Activity;
  startedAt: string;
  endedAt: string;
  focusSeconds: number;
  demo?: boolean;
}

export interface CardReview {
  id: string;
  cardId: number;
  topic: string;
  subject?: string;
  rating: Rating;
  reviewedAt: string;
  nextDueAt: string;
  demo?: boolean;
}

export interface QuizAttempt {
  id: string;
  questionId: number;
  topic: string;
  correct: boolean;
  answeredAt: string;
  quizId?: number;
  runId?: string;
  demo?: boolean;
}

export interface FsrsCardState {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days?: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  learning_steps: number;
  state: number;
  last_review?: string;
}
