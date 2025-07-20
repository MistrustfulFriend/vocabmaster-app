import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Target, Calendar } from "lucide-react";
import type { WordStats } from "@shared/schema";
import MobileHeader from "@/components/layout/mobile-header";
import StatsChart from "@/components/stats-chart";

export default function Statistics() {
  const { data: stats, isLoading } = useQuery<WordStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <MobileHeader title="Learning Statistics" />
        <div className="p-4 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-slate-800 rounded-2xl"></div>
            <div className="h-32 bg-slate-800 rounded-xl"></div>
            <div className="h-48 bg-slate-800 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <MobileHeader title="Learning Statistics" />
      
      <main className="p-4 space-y-6">
        {/* Overall Progress */}
        <Card className="gradient-card p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-white mb-2">{stats?.overallAccuracy || 0}%</div>
            <div className="text-slate-300">Overall Accuracy</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{stats?.totalWords || 0}</div>
              <div className="text-sm text-slate-400">Total Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{stats?.masteredWords || 0}</div>
              <div className="text-sm text-slate-400">Mastered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-500">{stats?.studyStreak || 0}</div>
              <div className="text-sm text-slate-400">Day Streak</div>
            </div>
          </div>
        </Card>

        {/* Language Breakdown */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-white">Progress by Language</h3>
          </div>
          
          <div className="space-y-4">
            {stats?.languageStats.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No language data available. Add some words to see your progress!
              </div>
            ) : (
              stats?.languageStats.map((lang) => (
                <div key={lang.language} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-500">
                        {lang.language.slice(0, 2).toUpperCase()}
                      </span>
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
                        style={{ width: `${Math.min(lang.accuracy, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Weekly Progress */}
        <Card className="bg-slate-800 border-slate-700 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-white">Weekly Progress</h3>
          </div>
          
          {stats?.weeklyProgress && <StatsChart weeklyData={stats.weeklyProgress} />}
          
          <div className="text-center text-sm text-slate-400 mt-4">
            Words practiced per day
          </div>
        </Card>

        {/* Achievement Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {stats?.masteredWords || 0}
                </div>
                <div className="text-sm text-slate-400">Words Mastered</div>
              </div>
            </div>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">
                  {stats?.languageStats.length || 0}
                </div>
                <div className="text-sm text-slate-400">Languages</div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
