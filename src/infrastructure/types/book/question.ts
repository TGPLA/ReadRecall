import type { QuestionType, Difficulty, MasteryLevel, AnswerStatus } from '../base/enums';

export interface QuestionAnnotation {
  id: string;
  text: string;
  cfiRange: string;
  yanSe: 'yellow' | 'green' | 'blue' | 'pink';
  leiXing: 'underline';
  beiZhu: string;
}

export interface Question {
  id: string;
  userId: string;
  bookId: string;
  chapterId?: string;
  paragraphId?: string;
  annotationId?: string;
  annotation?: QuestionAnnotation;
  question: string;
  answer: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  knowledgePoint?: string;
  masteryLevel: MasteryLevel;
  practiceCount: number;
  lastPracticedAt?: number;
  answerStatus?: AnswerStatus;
  answeredAt?: number;
  userAnswer?: string;
  category?: 'standard' | 'concept';
  createdAt: number;
  updatedAt?: number;
}

export interface CreateQuestionInput {
  bookId: string;
  chapterId: string;
  paragraphId?: string;
  question: string;
  answer: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  knowledgePoint?: string;
}

export interface UpdateQuestionInput {
  question?: string;
  answer?: string;
  questionType?: QuestionType;
  difficulty?: Difficulty;
  knowledgePoint?: string;
}
