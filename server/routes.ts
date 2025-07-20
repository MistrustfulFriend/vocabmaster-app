import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWordSchema, insertQuizSessionSchema, insertQuizAnswerSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Word routes
  app.get("/api/words", async (req, res) => {
    try {
      const { category, language, dictionary, search } = req.query;
      const words = await storage.getWords({
        category: category as string,
        language: language as string,
        dictionary: dictionary as string,
        search: search as string,
      });
      res.json(words);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch words" });
    }
  });

  app.get("/api/words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const word = await storage.getWordById(id);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      res.json(word);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch word" });
    }
  });

  app.post("/api/words", async (req, res) => {
    try {
      const wordData = insertWordSchema.parse(req.body);
      const word = await storage.createWord(wordData);
      res.status(201).json(word);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid word data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create word" });
    }
  });

  app.put("/api/words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const wordData = insertWordSchema.partial().parse(req.body);
      const word = await storage.updateWord(id, wordData);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      res.json(word);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid word data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update word" });
    }
  });

  app.delete("/api/words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteWord(id);
      if (!deleted) {
        return res.status(404).json({ message: "Word not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete word" });
    }
  });

  // Quiz routes
  app.get("/api/quiz/words", async (req, res) => {
    try {
      const { count = "10", category, language } = req.query;
      const words = await storage.getRandomWordsForQuiz(parseInt(count as string), {
        category: category as string,
        language: language as string,
      });
      res.json(words);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quiz words" });
    }
  });

  app.post("/api/quiz/sessions", async (req, res) => {
    try {
      const sessionData = insertQuizSessionSchema.parse(req.body);
      const session = await storage.createQuizSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create quiz session" });
    }
  });

  app.post("/api/quiz/answers", async (req, res) => {
    try {
      const answerData = insertQuizAnswerSchema.parse(req.body);
      const answer = await storage.recordQuizAnswer(answerData);
      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid answer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to record answer" });
    }
  });

  // Statistics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getWordStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Metadata routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/languages", async (req, res) => {
    try {
      const languages = await storage.getLanguages();
      res.json(languages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch languages" });
    }
  });

  app.get("/api/dictionaries", async (req, res) => {
    try {
      const dictionaries = await storage.getDictionaries();
      res.json(dictionaries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dictionaries" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
