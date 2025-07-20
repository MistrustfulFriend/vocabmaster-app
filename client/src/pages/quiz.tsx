import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, ArrowRight, Lightbulb, SkipForward } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Word, InsertQuizSession, InsertQuizAnswer } from "@shared/schema";
import { Link } from "wouter";
import MobileHeader from "@/components/layout/mobile-header";
import QuizQuestion from "@/components/quiz-question";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestionData {
  word: Word;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
}

export default function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionData[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: words = [], isLoading } = useQuery<Word[]>({
    queryKey: ["/api/quiz/words?count=10"],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: InsertQuizSession) => {
      const response = await apiRequest("POST", "/api/quiz/sessions", data);
      return response.json();
    },
    onSuccess: (session) => {
      setSessionId(session.id);
    },
  });

  const recordAnswerMutation = useMutation({
    mutationFn: async (data: InsertQuizAnswer) => {
      const response = await apiRequest("POST", "/api/quiz/answers", data);
      return response.json();
    },
  });

  // Generate quiz questions from words
  useEffect(() => {
    if (words.length >= 4) {
      const questions = words.slice(0, 10).map((word, index) => {
        // Get other words for incorrect options
        const otherWords = words.filter(w => w.id !== word.id);
        const incorrectOptions = otherWords
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(w => ({ text: w.translation, isCorrect: false }));
        
        const correctOption = { text: word.translation, isCorrect: true };
        const allOptions = [correctOption, ...incorrectOptions]
          .sort(() => 0.5 - Math.random());

        return {
          word,
          question: word.word,
          options: allOptions,
          correctAnswer: word.translation,
        };
      });
      
      setQuizQuestions(questions);
      
      // Create quiz session
      if (questions.length > 0) {
        createSessionMutation.mutate({
          totalQuestions: questions.length,
          correctAnswers: 0,
          language: questions[0].word.language,
        });
      }
    }
  }, [words]);

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Record answer
    if (sessionId) {
      recordAnswerMutation.mutate({
        sessionId,
        wordId: currentQuestion.word.id,
        isCorrect,
      });
    }

    // Auto advance after 1.5 seconds
    setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer("");
      setIsAnswered(false);
    } else {
      setShowResult(true);
      // Update session with final score
      if (sessionId) {
        // This would update the session with the final score
        queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      }
    }
  };

  const handleSkipQuestion = () => {
    if (isAnswered) return;
    
    // Record as incorrect
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (sessionId) {
      recordAnswerMutation.mutate({
        sessionId,
        wordId: currentQuestion.word.id,
        isCorrect: false,
      });
    }
    
    handleNextQuestion();
  };

  const progressPercentage = quizQuestions.length > 0 
    ? ((currentQuestionIndex + 1) / quizQuestions.length) * 100 
    : 0;

  if (isLoading || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen">
        <MobileHeader />
        <div className="p-4 flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <div className="text-slate-400">Loading quiz questions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const accuracy = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <div className="min-h-screen">
        <MobileHeader />
        <main className="p-4 space-y-6">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-8 text-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
                <p className="text-slate-300">Great job on finishing the quiz</p>
              </div>
              
              <div className="space-y-4">
                <div className="text-6xl font-bold text-cyan-400">{accuracy}%</div>
                <div className="text-xl text-white">
                  {score} out of {quizQuestions.length} correct
                </div>
                
                <div className="flex justify-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{score}</div>
                    <div className="text-slate-400">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">{quizQuestions.length - score}</div>
                    <div className="text-slate-400">Incorrect</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full gradient-button text-white"
                >
                  Take Another Quiz
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

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen">
      <MobileHeader />
      
      <main className="p-4 space-y-6">
        {/* Quiz Header */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="p-2 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-center flex-1 mx-4">
            <div className="text-sm text-slate-400 mb-1">
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">{score}/{currentQuestionIndex + (isAnswered ? 1 : 0)}</div>
            <div className="text-xs text-slate-400">Score</div>
          </div>
        </div>

        {/* Quiz Question */}
        <QuizQuestion
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          onAnswerSelect={handleAnswerSelect}
        />

        {/* Quiz Controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleSkipQuestion}
            disabled={isAnswered}
            className="text-slate-400 hover:text-white"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip
          </Button>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Hint
            </Button>
            
            {isAnswered && (
              <Button
                onClick={handleNextQuestion}
                className="gradient-button text-white"
              >
                {currentQuestionIndex < quizQuestions.length - 1 ? "Next" : "Finish"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
