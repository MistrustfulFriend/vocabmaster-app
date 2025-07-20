import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  translation: text("translation").notNull(),
  category: text("category").notNull(),
  dictionary: text("dictionary").notNull(),
  language: text("language").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  reviewCount: integer("review_count").default(0).notNull(),
  correctCount: integer("correct_count").default(0).notNull(),
});

export const quizSessions = pgTable("quiz_sessions", {
  id: serial("id").primaryKey(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  language: text("language"),
  category: text("category"),
});

export const quizAnswers = pgTable("quiz_answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => quizSessions.id).notNull(),
  wordId: integer("word_id").references(() => words.id).notNull(),
  isCorrect: boolean("is_correct").notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const insertWordSchema = createInsertSchema(words).omit({
  id: true,
  addedAt: true,
  reviewCount: true,
  correctCount: true,
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  completedAt: true,
});

export const insertQuizAnswerSchema = createInsertSchema(quizAnswers).omit({
  id: true,
  answeredAt: true,
});

export type Word = typeof words.$inferSelect;
export type InsertWord = z.infer<typeof insertWordSchema>;
export type QuizSession = typeof quizSessions.$inferSelect;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type QuizAnswer = typeof quizAnswers.$inferSelect;
export type InsertQuizAnswer = z.infer<typeof insertQuizAnswerSchema>;

// Stats interfaces
export interface WordStats {
  totalWords: number;
  masteredWords: number;
  overallAccuracy: number;
  studyStreak: number;
  languageStats: LanguageStat[];
  weeklyProgress: DailyProgress[];
}

export interface LanguageStat {
  language: string;
  wordCount: number;
  accuracy: number;
}

export interface DailyProgress {
  date: string;
  wordsStudied: number;
}
