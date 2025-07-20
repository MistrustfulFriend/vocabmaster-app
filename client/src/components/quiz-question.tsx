import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import type { Word } from "@shared/schema";

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

interface QuizQuestionProps {
  question: QuizQuestionData;
  selectedAnswer: string;
  isAnswered: boolean;
  onAnswerSelect: (answer: string) => void;
}

export default function QuizQuestion({ 
  question, 
  selectedAnswer, 
  isAnswered, 
  onAnswerSelect 
}: QuizQuestionProps) {
  
  const getButtonState = (option: QuizOption) => {
    if (!isAnswered) {
      return "default";
    }
    
    if (option.isCorrect) {
      return "correct";
    }
    
    if (selectedAnswer === option.text && !option.isCorrect) {
      return "incorrect";
    }
    
    return "disabled";
  };

  const getButtonClassName = (state: string) => {
    switch (state) {
      case "correct":
        return "bg-green-500 border-green-500 text-white hover:bg-green-500";
      case "incorrect":
        return "bg-red-500 border-red-500 text-white hover:bg-red-500";
      case "disabled":
        return "bg-slate-700 border-slate-600 text-slate-400 opacity-50";
      default:
        return "bg-slate-700 hover:bg-slate-600 text-white border-slate-600 hover:border-blue-500/50";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 p-8 text-center">
      <div className="mb-8">
        <Badge className="bg-blue-500/20 text-blue-500 mb-2">
          {question.word.language}
        </Badge>
        <h2 className="text-3xl font-bold text-white mb-4">{question.question}</h2>
        <p className="text-slate-300">Choose the correct translation</p>
      </div>

      <div className="space-y-3">
        {question.options.map((option, index) => {
          const state = getButtonState(option);
          const letters = ['A', 'B', 'C', 'D'];
          
          return (
            <Button
              key={index}
              onClick={() => onAnswerSelect(option.text)}
              disabled={isAnswered}
              className={`
                w-full px-6 py-4 h-auto text-left transition-all duration-200 hover:shadow-lg
                ${getButtonClassName(state)}
              `}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">{option.text}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">{letters[index]}</span>
                  {isAnswered && option.isCorrect && (
                    <Check className="h-4 w-4 text-white" />
                  )}
                  {isAnswered && selectedAnswer === option.text && !option.isCorrect && (
                    <X className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
