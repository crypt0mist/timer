import React from 'react';

const TimerRing = ({ phase, timeLeft, totalCycleTime }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  let percentage = 100;
  let colorClass = 'stroke-blurple';
  let pulseClass = '';
  let text = 'IDLE';

  if (phase === 'PROMPT_FIRST') {
    percentage = 100;
    colorClass = 'stroke-neon-mint';
    pulseClass = 'animate-pulse';
    text = 'SEND\n1st MSG!';
  } else if (phase === 'PROMPT_SECOND') {
    percentage = 100;
    colorClass = 'stroke-amber';
    pulseClass = 'animate-pulse';
    text = 'SEND\n2nd MSG!';
  } else if (phase === 'WAITING_SECOND' || phase === 'COOLDOWN') {
    percentage = (timeLeft / totalCycleTime) * 100;
    colorClass = 'stroke-blurple';
    text = `${timeLeft}s`;
  }

  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="timer-container">
      <svg className="timer-svg" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          className="timer-bg-circle"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          className={`timer-ring-circle ${colorClass} ${pulseClass}`}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="timer-text">{text}</div>
    </div>
  );
};

export default TimerRing;
