import type { DailyProgress } from "@shared/schema";

interface StatsChartProps {
  weeklyData: DailyProgress[];
}

export default function StatsChart({ weeklyData }: StatsChartProps) {
  const maxValue = Math.max(...weeklyData.map(day => day.wordsStudied));
  
  const getDayName = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="grid grid-cols-7 gap-2 mb-4">
      {weeklyData.map((day, index) => {
        const heightPercentage = maxValue > 0 ? (day.wordsStudied / maxValue) * 100 : 0;
        
        return (
          <div key={index} className="text-center">
            <div className="text-xs text-slate-400 mb-2">
              {getDayName(day.date)}
            </div>
            <div className="w-full bg-slate-700 rounded h-8 relative overflow-hidden">
              <div 
                className="bg-gradient-to-t from-blue-500 to-cyan-400 absolute bottom-0 w-full rounded transition-all duration-300"
                style={{ height: `${heightPercentage}%` }}
              />
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {day.wordsStudied}
            </div>
          </div>
        );
      })}
    </div>
  );
}
