import { words, quizSessions, quizAnswers, type Word, type InsertWord, type QuizSession, type InsertQuizSession, type QuizAnswer, type InsertQuizAnswer, type WordStats, type LanguageStat, type DailyProgress } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Word operations
  getWords(filters?: { category?: string; language?: string; dictionary?: string; search?: string }): Promise<Word[]>;
  getWordById(id: number): Promise<Word | undefined>;
  createWord(word: InsertWord): Promise<Word>;
  updateWord(id: number, word: Partial<InsertWord>): Promise<Word | undefined>;
  deleteWord(id: number): Promise<boolean>;
  updateWordStats(id: number, isCorrect: boolean): Promise<void>;

  // Quiz operations
  getRandomWordsForQuiz(count: number, filters?: { category?: string; language?: string }): Promise<Word[]>;
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  recordQuizAnswer(answer: InsertQuizAnswer): Promise<QuizAnswer>;

  // Statistics
  getWordStats(): Promise<WordStats>;
  getCategories(): Promise<string[]>;
  getLanguages(): Promise<string[]>;
  getDictionaries(): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private words: Map<number, Word>;
  private quizSessions: Map<number, QuizSession>;
  private quizAnswers: Map<number, QuizAnswer>;
  private currentWordId: number;
  private currentSessionId: number;
  private currentAnswerId: number;

  constructor() {
    this.words = new Map();
    this.quizSessions = new Map();
    this.quizAnswers = new Map();
    this.currentWordId = 1;
    this.currentSessionId = 1;
    this.currentAnswerId = 1;
    
    // Add some sample words for demo purposes
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleWords = [
      { word: "Bonjour", translation: "Hello", category: "Greetings", dictionary: "Collins", language: "French" },
      { word: "Au revoir", translation: "Goodbye", category: "Greetings", dictionary: "Collins", language: "French" },
      { word: "Merci", translation: "Thank you", category: "Greetings", dictionary: "Collins", language: "French" },
      { word: "Pain", translation: "Bread", category: "Food", dictionary: "Collins", language: "French" },
      { word: "Eau", translation: "Water", category: "Food", dictionary: "Collins", language: "French" },
      { word: "Fromage", translation: "Cheese", category: "Food", dictionary: "Collins", language: "French" },
      { word: "Rouge", translation: "Red", category: "Colors", dictionary: "Collins", language: "French" },
      { word: "Bleu", translation: "Blue", category: "Colors", dictionary: "Collins", language: "French" },
      { word: "Vert", translation: "Green", category: "Colors", dictionary: "Collins", language: "French" },
      { word: "Hola", translation: "Hello", category: "Greetings", dictionary: "Oxford", language: "Spanish" },
      { word: "Adiós", translation: "Goodbye", category: "Greetings", dictionary: "Oxford", language: "Spanish" },
      { word: "Gracias", translation: "Thank you", category: "Greetings", dictionary: "Oxford", language: "Spanish" },
      { word: "Casa", translation: "House", category: "Home", dictionary: "Oxford", language: "Spanish" },
      { word: "Perro", translation: "Dog", category: "Animals", dictionary: "Oxford", language: "Spanish" },
      { word: "Gato", translation: "Cat", category: "Animals", dictionary: "Oxford", language: "Spanish" },
    ];

    sampleWords.forEach(wordData => {
      const word: Word = {
        id: this.currentWordId++,
        ...wordData,
        addedAt: new Date(),
        reviewCount: Math.floor(Math.random() * 10),
        correctCount: Math.floor(Math.random() * 8),
      };
      this.words.set(word.id, word);
    });
  }

  async getWords(filters?: { category?: string; language?: string; dictionary?: string; search?: string }): Promise<Word[]> {
    let result = Array.from(this.words.values());

    if (filters?.category) {
      result = result.filter(word => word.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.language) {
      result = result.filter(word => word.language.toLowerCase() === filters.language!.toLowerCase());
    }
    if (filters?.dictionary) {
      result = result.filter(word => word.dictionary.toLowerCase() === filters.dictionary!.toLowerCase());
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(word => 
        word.word.toLowerCase().includes(searchLower) || 
        word.translation.toLowerCase().includes(searchLower)
      );
    }

    return result.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }

  async getWordById(id: number): Promise<Word | undefined> {
    return this.words.get(id);
  }

  async createWord(wordData: InsertWord): Promise<Word> {
    const word: Word = {
      id: this.currentWordId++,
      ...wordData,
      addedAt: new Date(),
      reviewCount: 0,
      correctCount: 0,
    };
    this.words.set(word.id, word);
    return word;
  }

  async updateWord(id: number, wordData: Partial<InsertWord>): Promise<Word | undefined> {
    const existingWord = this.words.get(id);
    if (!existingWord) return undefined;

    const updatedWord = { ...existingWord, ...wordData };
    this.words.set(id, updatedWord);
    return updatedWord;
  }

  async deleteWord(id: number): Promise<boolean> {
    return this.words.delete(id);
  }

  async updateWordStats(id: number, isCorrect: boolean): Promise<void> {
    const word = this.words.get(id);
    if (!word) return;

    word.reviewCount++;
    if (isCorrect) {
      word.correctCount++;
    }
    this.words.set(id, word);
  }

  async getRandomWordsForQuiz(count: number, filters?: { category?: string; language?: string }): Promise<Word[]> {
    const allWords = await this.getWords(filters);
    const shuffled = allWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  async createQuizSession(sessionData: InsertQuizSession): Promise<QuizSession> {
    const session: QuizSession = {
      id: this.currentSessionId++,
      totalQuestions: sessionData.totalQuestions,
      correctAnswers: sessionData.correctAnswers,
      language: sessionData.language || null,
      category: sessionData.category || null,
      completedAt: new Date(),
    };
    this.quizSessions.set(session.id, session);
    return session;
  }

  async recordQuizAnswer(answerData: InsertQuizAnswer): Promise<QuizAnswer> {
    const answer: QuizAnswer = {
      id: this.currentAnswerId++,
      ...answerData,
      answeredAt: new Date(),
    };
    this.quizAnswers.set(answer.id, answer);
    
    // Update word statistics
    await this.updateWordStats(answer.wordId, answer.isCorrect);
    
    return answer;
  }

  async getWordStats(): Promise<WordStats> {
    const allWords = Array.from(this.words.values());
    const totalWords = allWords.length;
    
    // Calculate mastered words (>80% accuracy with at least 3 reviews)
    const masteredWords = allWords.filter(word => 
      word.reviewCount >= 3 && (word.correctCount / word.reviewCount) >= 0.8
    ).length;

    // Calculate overall accuracy
    const totalReviews = allWords.reduce((sum, word) => sum + word.reviewCount, 0);
    const totalCorrect = allWords.reduce((sum, word) => sum + word.correctCount, 0);
    const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    // Calculate language stats
    const languageMap = new Map<string, { count: number; correct: number; total: number }>();
    allWords.forEach(word => {
      const stats = languageMap.get(word.language) || { count: 0, correct: 0, total: 0 };
      stats.count++;
      stats.correct += word.correctCount;
      stats.total += word.reviewCount;
      languageMap.set(word.language, stats);
    });

    const languageStats: LanguageStat[] = Array.from(languageMap.entries()).map(([language, stats]) => ({
      language,
      wordCount: stats.count,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));

    // Generate weekly progress (mock data for now)
    const weeklyProgress: DailyProgress[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      weeklyProgress.push({
        date: date.toISOString().split('T')[0],
        wordsStudied: Math.floor(Math.random() * 20) + 5, // Random for demo
      });
    }

    return {
      totalWords,
      masteredWords,
      overallAccuracy,
      studyStreak: 5, // Mock streak data
      languageStats,
      weeklyProgress,
    };
  }

  async getCategories(): Promise<string[]> {
    const categories = new Set(Array.from(this.words.values()).map(word => word.category));
    return Array.from(categories).sort();
  }

  async getLanguages(): Promise<string[]> {
    const languages = new Set(Array.from(this.words.values()).map(word => word.language));
    return Array.from(languages).sort();
  }

  async getDictionaries(): Promise<string[]> {
    const dictionaries = new Set(Array.from(this.words.values()).map(word => word.dictionary));
    return Array.from(dictionaries).sort();
  }
}

export class DatabaseStorage implements IStorage {
  async getWords(filters?: { category?: string; language?: string; dictionary?: string; search?: string }): Promise<Word[]> {
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(words.category, filters.category));
    }
    if (filters?.language) {
      conditions.push(eq(words.language, filters.language));
    }
    if (filters?.dictionary) {
      conditions.push(eq(words.dictionary, filters.dictionary));
    }
    if (filters?.search) {
      conditions.push(
        sql`(${words.word} ILIKE ${'%' + filters.search + '%'} OR ${words.translation} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    return await db.select()
      .from(words)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(words.addedAt));
  }

  async getWordById(id: number): Promise<Word | undefined> {
    const [word] = await db.select().from(words).where(eq(words.id, id));
    return word || undefined;
  }

  async createWord(insertWord: InsertWord): Promise<Word> {
    const [word] = await db
      .insert(words)
      .values(insertWord)
      .returning();
    return word;
  }

  async updateWord(id: number, updateData: Partial<InsertWord>): Promise<Word | undefined> {
    const [word] = await db
      .update(words)
      .set(updateData)
      .where(eq(words.id, id))
      .returning();
    return word || undefined;
  }

  async deleteWord(id: number): Promise<boolean> {
    const result = await db
      .delete(words)
      .where(eq(words.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateWordStats(id: number, isCorrect: boolean): Promise<void> {
    await db
      .update(words)
      .set({
        reviewCount: sql`${words.reviewCount} + 1`,
        correctCount: isCorrect ? sql`${words.correctCount} + 1` : words.correctCount,
      })
      .where(eq(words.id, id));
  }

  async getRandomWordsForQuiz(count: number, filters?: { category?: string; language?: string }): Promise<Word[]> {
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(words.category, filters.category));
    }
    if (filters?.language) {
      conditions.push(eq(words.language, filters.language));
    }

    return await db.select()
      .from(words)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }

  async createQuizSession(sessionData: InsertQuizSession): Promise<QuizSession> {
    const [session] = await db
      .insert(quizSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async recordQuizAnswer(answerData: InsertQuizAnswer): Promise<QuizAnswer> {
    const [answer] = await db
      .insert(quizAnswers)
      .values(answerData)
      .returning();
    
    // Update word statistics
    await this.updateWordStats(answer.wordId, answer.isCorrect);
    
    return answer;
  }

  async getWordStats(): Promise<WordStats> {
    const allWords = await db.select().from(words);
    const totalWords = allWords.length;
    
    // Calculate mastered words (>80% accuracy with at least 3 reviews)
    const masteredWords = allWords.filter(word => 
      word.reviewCount >= 3 && (word.correctCount / word.reviewCount) >= 0.8
    ).length;

    // Calculate overall accuracy
    const totalReviews = allWords.reduce((sum, word) => sum + word.reviewCount, 0);
    const totalCorrect = allWords.reduce((sum, word) => sum + word.correctCount, 0);
    const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    // Calculate language stats
    const languageMap = new Map<string, { count: number; correct: number; total: number }>();
    allWords.forEach(word => {
      const stats = languageMap.get(word.language) || { count: 0, correct: 0, total: 0 };
      stats.count++;
      stats.correct += word.correctCount;
      stats.total += word.reviewCount;
      languageMap.set(word.language, stats);
    });

    const languageStats: LanguageStat[] = Array.from(languageMap.entries()).map(([language, stats]) => ({
      language,
      wordCount: stats.count,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));

    // Generate weekly progress
    const weeklyProgress: DailyProgress[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Get quiz sessions for this day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const sessionsForDay = await db.select()
        .from(quizSessions)
        .where(and(
          sql`${quizSessions.completedAt} >= ${dayStart}`,
          sql`${quizSessions.completedAt} <= ${dayEnd}`
        ));
      
      const wordsStudied = sessionsForDay.reduce((sum, session) => sum + session.totalQuestions, 0);
      
      weeklyProgress.push({
        date: date.toISOString().split('T')[0],
        wordsStudied,
      });
    }

    return {
      totalWords,
      masteredWords,
      overallAccuracy,
      studyStreak: 5, // Can be calculated from session data
      languageStats,
      weeklyProgress,
    };
  }

  async getCategories(): Promise<string[]> {
    const result = await db.selectDistinct({ category: words.category }).from(words);
    return result.map(r => r.category).sort();
  }

  async getLanguages(): Promise<string[]> {
    const result = await db.selectDistinct({ language: words.language }).from(words);
    return result.map(r => r.language).sort();
  }

  async getDictionaries(): Promise<string[]> {
    const result = await db.selectDistinct({ dictionary: words.dictionary }).from(words);
    return result.map(r => r.dictionary).sort();
  }
}

export const storage = new DatabaseStorage();
