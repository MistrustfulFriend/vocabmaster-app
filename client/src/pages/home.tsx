import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Play, Plus, Brain, Check, CreditCard, Book, Edit } from "lucide-react";
import { Link } from "wouter";
import MobileHeader from "@/components/layout/mobile-header";
import type { WordStats } from "@shared/schema";

export default function Home() {
  const { data: stats, isLoading } = useQuery<WordStats>({
    queryKey: ["/api/stats"],
  });

  const { data: dictionaries = [] } = useQuery<string[]>({
    queryKey: ["/api/dictionaries"],
  });

  const { data: languages = [] } = useQuery<string[]>({
    queryKey: ["/api/languages"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <MobileHeader />
        <div className="p-4 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-800 rounded-2xl"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-800 rounded-xl"></div>
              <div className="h-20 bg-slate-800 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MobileHeader />
      
      <main className="p-4 space-y-6">
        {/* Welcome Banner */}
        <Card className="gradient-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back!</h2>
              <p className="text-slate-300">{stats?.studyStreak || 0} day learning streak 🔥</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-400">{stats?.totalWords || 0}</div>
              <div className="text-sm text-slate-400">Total Words</div>
            </div>
          </div>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats?.overallAccuracy || 0}%</div>
                <div className="text-sm text-slate-400">Accuracy</div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{stats?.masteredWords || 0}</div>
                <div className="text-sm text-slate-400">Mastered</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/quiz">
              <Button className="w-full gradient-button text-white p-4 h-auto justify-between hover:shadow-lg transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <Play className="h-5 w-5" />
                  <span className="font-medium">Start Quick Quiz</span>
                </div>
                <span className="text-sm opacity-75">→</span>
              </Button>
            </Link>
            
            <Link href="/flashcards">
              <Button 
                variant="outline"
                className="w-full bg-slate-800 border-slate-600 text-white p-4 h-auto justify-between hover:bg-slate-700 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">Study Flashcards</span>
                </div>
                <span className="text-sm opacity-75">→</span>
              </Button>
            </Link>
            
            <Link href="/add-word">
              <Button 
                variant="outline"
                className="w-full bg-slate-800 border-slate-600 text-white p-4 h-auto justify-between hover:bg-slate-700 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-cyan-400" />
                  <span className="font-medium">Add New Word</span>
                </div>
                <span className="text-sm opacity-75">→</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* My Dictionaries */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">My Dictionaries</h3>
            <Link href="/library">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                <Edit className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {dictionaries.map((dictionary) => {
              const dictWords = stats?.languageStats.reduce((total, lang) => total + lang.wordCount, 0) || 0;
              const wordsInDict = Math.floor(dictWords / dictionaries.length); // Approximate distribution
              
              return (
                <Link key={dictionary} href={`/library?dictionary=${encodeURIComponent(dictionary)}`}>
                  <Card className="bg-slate-800 border-slate-700 p-4 hover:bg-slate-750 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                          <Book className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <div className="text-white font-medium">{dictionary}</div>
                          <div className="text-sm text-slate-400">{wordsInDict} words</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Tap to browse</div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
            
            {dictionaries.length === 0 && (
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="text-center text-slate-400">
                  No dictionaries yet. Add some words to get started!
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Language Progress */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white">Language Progress</h3>
          <div className="space-y-3">
            {stats?.languageStats.slice(0, 3).map((lang, index) => (
              <Link key={lang.language} href={`/library?language=${encodeURIComponent(lang.language)}`}>
                <Card className="bg-slate-800 border-slate-700 p-4 hover:bg-slate-750 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-white font-medium">{lang.language}</div>
                        <div className="text-sm text-slate-400">{lang.wordCount} words</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{lang.accuracy}%</div>
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${lang.accuracy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
