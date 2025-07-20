import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import type { Word } from "@shared/schema";

interface WordCardProps {
  word: Word;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function WordCard({ word, onEdit, onDelete }: WordCardProps) {
  const accuracy = word.reviewCount > 0 
    ? Math.round((word.correctCount / word.reviewCount) * 100) 
    : 0;
  
  const getLanguageColor = (language: string) => {
    const colors = {
      'French': 'bg-blue-500/20 text-blue-500',
      'Spanish': 'bg-purple-500/20 text-purple-500',
      'German': 'bg-green-500/20 text-green-500',
      'Italian': 'bg-red-500/20 text-red-500',
      'Portuguese': 'bg-yellow-500/20 text-yellow-500',
      'Japanese': 'bg-pink-500/20 text-pink-500',
      'Korean': 'bg-indigo-500/20 text-indigo-500',
      'Chinese': 'bg-orange-500/20 text-orange-500',
    };
    return colors[language as keyof typeof colors] || 'bg-gray-500/20 text-gray-500';
  };

  const getCategoryColor = (category: string) => {
    return 'bg-cyan-500/20 text-cyan-500';
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{word.word}</h3>
            <p className="text-slate-300">{word.translation}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={`text-xs ${getLanguageColor(word.language)}`}>
                {word.language}
              </Badge>
              <Badge className={`text-xs ${getCategoryColor(word.category)}`}>
                {word.category}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            {word.reviewCount > 0 ? (
              <>
                <div className="text-sm text-slate-400">{accuracy}% accuracy</div>
                <div className="text-xs text-slate-500">Reviewed {word.reviewCount} times</div>
              </>
            ) : (
              <div className="text-sm text-slate-400">Not reviewed yet</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="text-xs text-slate-500">
            Added {formatDate(word.addedAt)}
            {word.dictionary && (
              <span className="ml-2">• {word.dictionary}</span>
            )}
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
