// FILE: app/types/quiz.ts

export interface QuestionOption {
  value: string;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
  correctAnswer: string;
  domain: { id: number; name: string };
  strand: { id: string; name: string };
  indicator: { id: string; text: string };
  careerStage: number;
  soloLevel: string;
  difficultyParams: {
    value: number;
    category: string;
    discrimination: number;
    guessing: number;
  };
  explanation: string;
  contentTags: string[]; // This exists in the source Question
}

export interface DomainResult {
  id: number;
  name: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface StrandResult {
  id: string;
  name: string;
  domainId: number;
  domainName: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface CareerStageResult {
  stage: number;
  total: number;
  correct: number;
  percentage: number;
}

export interface SoloLevelResult {
    level: string;
    total: number;
    correct: number;
    percentage: number;
}

export interface DifficultyResult {
    category: string; // e.g., "Easy", "Medium", "Difficult"
    total: number;
    correct: number;
    percentage: number;
}


export interface DetailedAnswer {
  id: number;
  question: string;
  userAnswer?: string; // User might not have answered
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  domain: string;
  strand: string;
  indicator: string;
  careerStage: number;
  soloLevel: string;
  contentTags?: string[]; // Make optional as it might not always be present or needed everywhere
  difficulty?: string; // Added difficulty category for potential use in detailed view
}

export interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  overallPercentage: number;
  domainResults: DomainResult[];
  strandResults: StrandResult[];
  careerStageResults: CareerStageResult[];
  soloLevelResults: SoloLevelResult[];
  difficultyResults: DifficultyResult[];
  detailedAnswers: DetailedAnswer[];
  // --- New Fields ---
  estimatedAbilityScore: number; // Weighted score percentage
  eligibilityCategory: 'A' | 'B' | 'C';
  // --- End New Fields ---
}

export interface RadarChartDataPoint {
  subject: string;
  A: number; // Represents the score
  fullMark: number;
}

// --- END OF FILE app/types/quiz.ts ---