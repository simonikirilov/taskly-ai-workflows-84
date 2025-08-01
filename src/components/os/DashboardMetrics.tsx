import { Battery, Target, TrendingUp, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    energy: 78,
    focus: 92,
    productivity: 89,
    streak: 5
  });

  useEffect(() => {
    // Simulate live metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        energy: Math.max(50, Math.min(100, prev.energy + (Math.random() - 0.5) * 4)),
        focus: Math.max(60, Math.min(100, prev.focus + (Math.random() - 0.5) * 2)),
        productivity: Math.max(70, Math.min(100, prev.productivity + (Math.random() - 0.5) * 3))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getEnergyEmoji = (energy: number) => {
    if (energy >= 80) return '⚡';
    if (energy >= 60) return '🔋';
    if (energy >= 40) return '🟡';
    return '🔴';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-400' };
    if (score >= 80) return { label: 'High', color: 'text-blue-400' };
    if (score >= 70) return { label: 'Good', color: 'text-yellow-400' };
    return { label: 'Fair', color: 'text-orange-400' };
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Energy Level */}
      <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Battery className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-muted-foreground">Energy</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getEnergyEmoji(metrics.energy)}</span>
          <span className="text-2xl font-bold text-foreground">{Math.round(metrics.energy)}%</span>
        </div>
      </div>

      {/* Focus Score */}
      <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-muted-foreground">Focus</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="text-2xl font-bold text-foreground">{Math.round(metrics.focus)}%</span>
        </div>
      </div>

      {/* Productivity */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium text-muted-foreground">Productivity</span>
        </div>
        <div className="space-y-1">
          <span className="text-2xl font-bold text-foreground">{Math.round(metrics.productivity)}%</span>
          <div className={`text-xs font-medium ${getPerformanceLevel(metrics.productivity).color}`}>
            {getPerformanceLevel(metrics.productivity).label}
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-muted-foreground">Streak</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-2xl font-bold text-foreground">{metrics.streak} days</span>
        </div>
      </div>
    </div>
  );
}