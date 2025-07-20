import { db } from "./db";
import { words } from "@shared/schema";

export async function seedDatabase() {
  // Check if database already has data
  const existingWords = await db.select().from(words).limit(1);
  if (existingWords.length > 0) {
    console.log("Database already seeded");
    return;
  }

  const sampleWords = [
    { word: "Bonjour", translation: "Hello", category: "Greetings", dictionary: "Collins", language: "French" },
    { word: "Au revoir", translation: "Goodbye", category: "Greetings", dictionary: "Collins", language: "French" },
    { word: "Merci", translation: "Thank you", category: "Greetings", dictionary: "Collins", language: "French" },
    { word: "S'il vous plaît", translation: "Please", category: "Greetings", dictionary: "Collins", language: "French" },
    { word: "Excusez-moi", translation: "Excuse me", category: "Greetings", dictionary: "Collins", language: "French" },
    { word: "Pain", translation: "Bread", category: "Food", dictionary: "Collins", language: "French" },
    { word: "Eau", translation: "Water", category: "Food", dictionary: "Collins", language: "French" },
    { word: "Fromage", translation: "Cheese", category: "Food", dictionary: "Collins", language: "French" },
    { word: "Viande", translation: "Meat", category: "Food", dictionary: "Collins", language: "French" },
    { word: "Légume", translation: "Vegetable", category: "Food", dictionary: "Collins", language: "French" },
    { word: "Rouge", translation: "Red", category: "Colors", dictionary: "Collins", language: "French" },
    { word: "Bleu", translation: "Blue", category: "Colors", dictionary: "Collins", language: "French" },
    { word: "Vert", translation: "Green", category: "Colors", dictionary: "Collins", language: "French" },
    { word: "Jaune", translation: "Yellow", category: "Colors", dictionary: "Collins", language: "French" },
    { word: "Noir", translation: "Black", category: "Colors", dictionary: "Collins", language: "French" },
    { word: "Hola", translation: "Hello", category: "Greetings", dictionary: "Oxford", language: "Spanish" },
    { word: "Adiós", translation: "Goodbye", category: "Greetings", dictionary: "Oxford", language: "Spanish" },
    { word: "Gracias", translation: "Thank you", category: "Greetings", dictionary: "Oxford", language: "Spanish" },
    { word: "Por favor", translation: "Please", category: "Greetings", dictionary: "Oxford", language: "Spanish" },
    { word: "Lo siento", translation: "Sorry", category: "Greetings", dictionary: "Oxford", language: "Spanish" },
    { word: "Casa", translation: "House", category: "Home", dictionary: "Oxford", language: "Spanish" },
    { word: "Puerta", translation: "Door", category: "Home", dictionary: "Oxford", language: "Spanish" },
    { word: "Ventana", translation: "Window", category: "Home", dictionary: "Oxford", language: "Spanish" },
    { word: "Mesa", translation: "Table", category: "Home", dictionary: "Oxford", language: "Spanish" },
    { word: "Silla", translation: "Chair", category: "Home", dictionary: "Oxford", language: "Spanish" },
    { word: "Perro", translation: "Dog", category: "Animals", dictionary: "Oxford", language: "Spanish" },
    { word: "Gato", translation: "Cat", category: "Animals", dictionary: "Oxford", language: "Spanish" },
    { word: "Pájaro", translation: "Bird", category: "Animals", dictionary: "Oxford", language: "Spanish" },
    { word: "Pez", translation: "Fish", category: "Animals", dictionary: "Oxford", language: "Spanish" },
    { word: "Caballo", translation: "Horse", category: "Animals", dictionary: "Oxford", language: "Spanish" },
  ];

  try {
    await db.insert(words).values(sampleWords);
    console.log(`Seeded database with ${sampleWords.length} words`);
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}