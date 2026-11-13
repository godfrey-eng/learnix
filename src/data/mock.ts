import type { NavItem, WeakTopic, Subject, StudyResource, FlashcardDeck, Flashcard, QuizSet, QuizQuestion } from "@/types";

export const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard" },
  { label: "Library", icon: "book" },
  { label: "Flashcards", icon: "cards" },
  { label: "Quizzes", icon: "quiz" },
  { label: "Timer", icon: "timer" },
  { label: "Analytics", icon: "analytics" },
  { label: "Reminders", icon: "reminder" },
  { label: "Settings", icon: "settings" },
];

export const weakTopics: WeakTopic[] = [
  { name: "Audit sampling", subject: "Auditing Theory", accuracy: 42, status: "Weak" },
  { name: "Deferred tax assets", subject: "Taxation", accuracy: 61, status: "Needs review" },
  { name: "Bank reconciliation", subject: "Financial Accounting", accuracy: 86, status: "Strong" },
];

export const subjects: Subject[] = [
  {
    id: 1,
    name: "Auditing Theory",
    code: "AUD",
    description: "Standards, procedures, and assurance concepts",
    documents: 12,
    decks: 4,
    topics: 18,
    color: "#4F46E5",
    progress: 68,
  },
  {
    id: 2,
    name: "Financial Accounting",
    code: "FAR",
    description: "Recognition, measurement, and reporting",
    documents: 18,
    decks: 6,
    topics: 24,
    color: "#0D9488",
    progress: 54,
  },
  {
    id: 3,
    name: "Taxation",
    code: "TAX",
    description: "Income tax, business tax, and remedies",
    documents: 9,
    decks: 3,
    topics: 15,
    color: "#F59E0B",
    progress: 41,
  },
];

export const flashcardDecks: FlashcardDeck[] = [
  {
    id: 1,
    title: "Audit Assertions",
    subject: "Auditing Theory",
    cards: 64,
    due: 18,
    mastered: 72,
    color: "#4F46E5",
    lastStudied: "Today",
  },
  {
    id: 2,
    title: "Cash & Receivables",
    subject: "Financial Accounting",
    cards: 82,
    due: 12,
    mastered: 58,
    color: "#0D9488",
    lastStudied: "Yesterday",
  },
  {
    id: 3,
    title: "Philippine Tax Rates",
    subject: "Taxation",
    cards: 48,
    due: 8,
    mastered: 44,
    color: "#F59E0B",
    lastStudied: "May 18",
  },
  {
    id: 4,
    title: "Statistical Measures",
    subject: "Statistics",
    cards: 36,
    due: 0,
    mastered: 86,
    color: "#8B5CF6",
    lastStudied: "May 16",
  },
];

export const reviewCards: Flashcard[] = [
  {
    id: 1,
    front: "Which assertion asks whether recorded assets and liabilities actually exist?",
    back: "Existence. It addresses whether assets, liabilities, and equity interests exist at a given date.",
    topic: "Audit Assertions",
  },
  {
    id: 2,
    front: "What is the primary objective of an external audit?",
    back: "To obtain reasonable assurance that the financial statements are free from material misstatement and express an opinion.",
    topic: "Audit Objectives",
  },
  {
    id: 3,
    front: "Which audit procedure involves obtaining a direct response from a third party?",
    back: "External confirmation, such as confirming an accounts receivable balance directly with a customer.",
    topic: "Audit Evidence",
  },
  {
    id: 4,
    front: "What type of audit risk cannot be reduced by the auditor?",
    back: "Inherent risk and control risk are entity risks. The auditor can only adjust detection risk through audit procedures.",
    topic: "Audit Risk",
  },
  {
    id: 5,
    front: "What does professional skepticism require?",
    back: "A questioning mind, alertness to possible misstatement, and a critical assessment of audit evidence.",
    topic: "Professional Ethics",
  },
];

export const quizSets: QuizSet[] = [
  {
    id: 1,
    title: "Auditing Theory Mock Exam",
    subject: "Auditing Theory",
    questions: 40,
    attempts: 3,
    bestScore: 82,
    duration: 45,
    color: "#4F46E5",
  },
  {
    id: 2,
    title: "Financial Accounting Drill",
    subject: "Financial Accounting",
    questions: 30,
    attempts: 5,
    bestScore: 76,
    duration: 35,
    color: "#0D9488",
  },
  {
    id: 3,
    title: "Taxation Pre-board Set",
    subject: "Taxation",
    questions: 50,
    attempts: 2,
    bestScore: 68,
    duration: 60,
    color: "#F59E0B",
  },
  {
    id: 4,
    title: "Statistics Fundamentals",
    subject: "Statistics",
    questions: 25,
    attempts: 1,
    bestScore: 88,
    duration: 25,
    color: "#8B5CF6",
  },
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: "Multiple choice",
    topic: "Audit Evidence",
    prompt: "Which form of audit evidence is generally considered the most reliable?",
    choices: [
      "An internally generated sales report",
      "A bank confirmation received directly by the auditor",
      "An oral representation from management",
      "A photocopy of an unsigned invoice",
    ],
    answer: "A bank confirmation received directly by the auditor",
    explanation:
      "Evidence obtained directly by the auditor from an independent external source is generally more reliable than internally generated or oral evidence.",
  },
  {
    id: 2,
    type: "True or false",
    topic: "Audit Risk",
    prompt:
      "Detection risk can be reduced by changing the nature, timing, and extent of audit procedures.",
    choices: ["True", "False"],
    answer: "True",
    explanation:
      "The auditor manages detection risk by designing more effective procedures, performing them closer to year-end, or increasing sample sizes.",
  },
  {
    id: 3,
    type: "Identification",
    topic: "Audit Opinions",
    prompt: "What opinion is issued when misstatements are both material and pervasive?",
    answer: "Adverse opinion",
    explanation:
      "An adverse opinion is appropriate when identified misstatements are material and pervasive to the financial statements.",
  },
  {
    id: 4,
    type: "Matching",
    topic: "Audit Assertions",
    prompt: "Match each audit procedure with the assertion it primarily tests.",
    answer: "matched",
    explanation:
      "Tracing supports completeness, vouching supports occurrence, and physical inspection commonly supports existence.",
    pairs: [
      { left: "Trace source documents to the ledger", right: "Completeness" },
      { left: "Vouch ledger entries to invoices", right: "Occurrence" },
      { left: "Physically inspect equipment", right: "Existence" },
    ],
  },
  {
    id: 5,
    type: "Multiple choice",
    topic: "Professional Ethics",
    prompt: "Which situation most directly threatens an auditor’s independence?",
    choices: [
      "Using data analytics",
      "Owning shares in the audit client",
      "Requesting written representations",
      "Rotating audit procedures",
    ],
    answer: "Owning shares in the audit client",
    explanation:
      "A direct financial interest in an audit client creates a self-interest threat and impairs independence.",
  },
];

export const resources: Record<number, StudyResource[]> = {
  1: [
    {
      title: "Philippine Standards on Auditing",
      meta: "12 pages",
      type: "Notes",
      updated: "Today",
    },
    { title: "Audit Evidence Summary", meta: "8 pages", type: "Notes", updated: "Yesterday" },
    { title: "PSA 500 Reference.pdf", meta: "2.4 MB", type: "Files", updated: "May 18" },
    { title: "Audit Assertions", meta: "42 cards", type: "Decks", updated: "May 17" },
    { title: "Internal Control Drill", meta: "25 questions", type: "Quizzes", updated: "May 14" },
  ],
  2: [
    { title: "Conceptual Framework", meta: "16 pages", type: "Notes", updated: "Today" },
    { title: "PFRS Quick Guide.pdf", meta: "4.8 MB", type: "Files", updated: "May 17" },
    { title: "Cash and Receivables", meta: "58 cards", type: "Decks", updated: "May 15" },
    {
      title: "Intermediate Accounting Set",
      meta: "30 questions",
      type: "Quizzes",
      updated: "May 12",
    },
  ],
  3: [
    { title: "Income Tax Fundamentals", meta: "14 pages", type: "Notes", updated: "Yesterday" },
    { title: "CREATE Law Notes.pdf", meta: "3.1 MB", type: "Files", updated: "May 16" },
    { title: "Tax Rates 2025", meta: "36 cards", type: "Decks", updated: "May 13" },
    { title: "Business Tax Practice", meta: "20 questions", type: "Quizzes", updated: "May 10" },
  ],
};

export const studyBars = [
  { day: "Mon", minutes: 45 },
  { day: "Tue", minutes: 72 },
  { day: "Wed", minutes: 38 },
  { day: "Thu", minutes: 85 },
  { day: "Fri", minutes: 54 },
  { day: "Sat", minutes: 96 },
  { day: "Sun", minutes: 62 },
];
