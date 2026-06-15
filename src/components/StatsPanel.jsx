import React from 'react';
import { Flame, Star, Send } from 'lucide-react';

const StatsPanel = ({ stats, currentLevelInfo }) => {
  const { level, xpInLevel, xpNeededForNext } = currentLevelInfo;
  const progressPercent = (xpInLevel / xpNeededForNext) * 100;

  return (
    <div className="stats-panel">
      
      <div>
        <div className="stats-level-row">
          <span className="stats-level-label">Level {level}</span>
          <span className="stats-xp-label">{xpInLevel} / {xpNeededForNext} XP</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="stats-badges">
        <div className="badge badge-amber">
          <Flame size={16} />
          <span>{stats.streak} Streak</span>
        </div>
        
        <div className="badge badge-mint">
          <Star size={16} />
          <span>{stats.xp} Total</span>
        </div>

        <div className="badge badge-muted" title="Total Time Lost (reaction delay)">
          <Send size={16} />
          <span>{(stats.totalLostTimeMs / 1000).toFixed(1)}s Lost</span>
        </div>
      </div>
      
    </div>
  );
};

export default StatsPanel;
