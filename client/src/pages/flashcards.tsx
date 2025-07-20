import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw, Shuffle, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Word } from "@shared/schema";
import { Link } from "wouter";
import MobileHeader from "@/components/layout/mobile-header";

export default function Flashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedWords, setStudiedWords] = useState<Set<number>>(new Set());
  const [knownWords, setKnownWords] = useState<Set<number>>(new Set());

  const { data: words = [], isLoading } = useQuery<Word[]>({
    queryKey: ["/api/quiz/words?count=20"],
  });

  const currentWord = words[currentIndex];
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleKnown = () => {
    if (currentWord) {
      setStudiedWords(prev => new Set([...prev, currentWord.id]));
      setKnownWords(prev => new Set([...prev, currentWord.id]));
      handleNext();
    }
  };

  const handleUnknown = () => {
    if (currentWord) {
      setStudiedWords(prev => new Set([...prev, currentWord.id]));
      handleNext();
    }
  };

  const handleShuffle = () => {
    // Reset progress and shuffle words
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedWords(new Set());
    setKnownWords(new Set());
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedWords(new Set());
    setKnownWords(new Set());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <MobileHeader title="Flashcards" />
        <div className="p-4 flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <div className="text-slate-400">Loading flashcards...</div>
          </div>
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen">
        <MobileHeader title="Flashcards" />
        <main className="p-4 space-y-6">
          <Card className="bg-slate-800 border-slate-700 p-8 text-center">
            <div className="text-slate-400 mb-4">No words available for flashcards.</div>
            <Link href="/add-word">
              <Button className="gradient-button text-white">
                Add Some Words
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  if (currentIndex >= words.length) {
    const accuracy = Math.round((knownWords.size / studiedWords.size) * 100);
    
    return (
      <div className="min-h-screen">
        <MobileHeader title="Flashcards Complete" />
        <main className="p-4 space-y-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-8 text-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Session Complete!</h2>
                <p className="text-slate-300">Great job studying your flashcards</p>
              </div>
              
              <div className="space-y-4">
                <div className="text-6xl font-bold text-cyan-400">{accuracy}%</div>
                <div className="text-xl text-white">
                  {knownWords.size} out of {studiedWords.size} known
                </div>
                
                <div className="flex justify-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{knownWords.size}</div>
                    <div className="text-slate-400">Known</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{studiedWords.size - knownWords.size}</div>
                    <div className="text-slate-400">Review Needed</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button onClick={handleReset} className="w-full gradient-button text-white">
                  Study Again
                </Button>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full border-slate-600 text-slate-300">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MobileHeader title="Flashcards" />
      
      <main className="p-4 space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-center flex-1 mx-4">
            <div className="text-sm text-slate-400 mb-1">
              Card {currentIndex + 1} of {words.length}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{studiedWords.size}/{words.length}</div>
            <div className="text-xs text-slate-400">Studied</div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="relative perspective-1000">
          <Card 
            className={`bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 min-h-[300px] cursor-pointer transform-style-preserve-3d transition-transform duration-500 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={handleFlip}
          >
            <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center backface-hidden">
              <Badge className="bg-blue-500/20 text-blue-500 mb-4">
                {currentWord?.language}
              </Badge>
              <h2 className="text-4xl font-bold text-white mb-4">
                {currentWord?.word}
              </h2>
              <p className="text-slate-400">Tap to reveal translation</p>
            </div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center backface-hidden rotate-y-180">
              <Badge className="bg-cyan-500/20 text-cyan-500 mb-4">
                Translation
              </Badge>
              <h2 className="text-4xl font-bold text-white mb-4">
                {currentWord?.translation}
              </h2>
              <div className="text-slate-400 space-y-1">
                <p>Category: {currentWord?.category}</p>
                {currentWord?.dictionary && <p>Dictionary: {currentWord.dictionary}</p>}
              </div>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Previous
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleShuffle}
                className="p-2 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="p-2 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === words.length - 1}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Next
            </Button>
          </div>

          {/* Knowledge Assessment */}
          {isFlipped && (
            <div className="flex space-x-3">
              <Button
                onClick={handleUnknown}
                variant="outline"
                className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
              >
                <X className="h-4 w-4 mr-2" />
                Don't Know
              </Button>
              <Button
                onClick={handleKnown}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                Know It
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}