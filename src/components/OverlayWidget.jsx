import React, { useState, useRef, useEffect } from 'react';
import { useGrindTimer } from '../hooks/useGrindTimer';
import { useGroq } from '../hooks/useGroq';
import TimerRing from './TimerRing';
import StatsPanel from './StatsPanel';
import { GripHorizontal, X, Play, Square, Copy, CheckCircle2, Loader2, PartyPopper } from 'lucide-react';

const OverlayWidget = () => {
  const {
    isActive, phase, timeLeft, totalCycleTime, 
    stats, currentLevelInfo, currentVariants, remainingMessages, totalPoolSize,
    startSession, stopSession, manualTrigger
  } = useGrindTimer();

  const { isFetchingBatch, fetchBatch } = useGroq();

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  
  const dragRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y
      });
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const onMouseDown = (e) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleStart = async () => {
    const pool = await fetchBatch();
    startSession(pool);
  };

  if (isMinimized) {
    return (
      <div className="widget-minimized" style={{ left: position.x, top: position.y }} onClick={() => setIsMinimized(false)}>
        <div className="widget-minimized-icon">XP</div>
      </div>
    );
  }

  const isPromptPhase = phase === 'PROMPT_FIRST' || phase === 'PROMPT_SECOND';

  return (
    <div className="widget-container" style={{ left: position.x, top: position.y }}>
      <div className="widget-header" onMouseDown={onMouseDown}>
        <div className="widget-header-title">
          <GripHorizontal size={14} />
          <span>XP Grinder v3</span>
        </div>
        <button onClick={() => setIsMinimized(true)} className="widget-header-close"><X size={14} /></button>
      </div>

      <div className="widget-content">
        
        {phase === 'COMPLETE' ? (
          <div className="flex flex-col items-center justify-center text-center py-6">
            <PartyPopper size={48} className="text-amber mb-4 animate-pulse" />
            <h2 className="text-lg font-bold text-mint mb-2">Session Complete!</h2>
            <p className="text-sm text-muted mb-4">You have successfully sent 100 messages.</p>
          </div>
        ) : (
          <>
            <TimerRing phase={phase} timeLeft={timeLeft} totalCycleTime={totalCycleTime} />
            
            <div className="status-text-container">
              {!isActive && !isFetchingBatch && <p className="text-muted">Ready to load batch?</p>}
              {isFetchingBatch && <p className="text-mint animate-pulse flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading 100 Msgs...</p>}
              {isActive && phase === 'PROMPT_FIRST' && <p className="text-mint animate-pulse">Send your XP message!</p>}
              {isActive && phase === 'WAITING_SECOND' && <p className="text-muted">16s Slowmode Delay...</p>}
              {isActive && phase === 'PROMPT_SECOND' && <p className="text-amber animate-pulse">Send a decoy message!</p>}
              {isActive && phase === 'COOLDOWN' && <p className="text-blurple">On cooldown...</p>}
            </div>

            {/* AI Variants UI */}
            {isActive && isPromptPhase && currentVariants.length > 0 && (
              <div className="ai-variants-container">
                <div className="ai-variants-header">
                  <span className="ai-title">Groq Suggestions</span>
                  <span className="text-xs text-muted font-mono">{remainingMessages} left</span>
                </div>
                
                {currentVariants.map((variant, i) => (
                  <div key={i} className="ai-variant-item" onClick={() => handleCopy(variant, i)}>
                    <span className="ai-variant-text">"{variant}"</span>
                    <button className="ai-copy-btn">
                      {copiedIndex === i ? <CheckCircle2 size={14} className="text-mint"/> : <Copy size={14}/>}
                    </button>
                  </div>
                ))}
                <button onClick={manualTrigger} className="btn-manual-trigger mt-2">MARK AS SENT</button>
              </div>
            )}
            
            <StatsPanel stats={stats} currentLevelInfo={currentLevelInfo} />
          </>
        )}

        <div className="controls-container">
          {!isActive && phase !== 'COMPLETE' ? (
            <button onClick={handleStart} disabled={isFetchingBatch} className="btn-start" style={{ opacity: isFetchingBatch ? 0.7 : 1 }}>
              {isFetchingBatch ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} 
              {isFetchingBatch ? 'LOADING BATCH...' : 'START SESSION'}
            </button>
          ) : phase === 'COMPLETE' ? (
            <button onClick={() => setPhase('IDLE')} className="btn-start">
              <Play size={16} /> NEW SESSION
            </button>
          ) : (
            <button onClick={stopSession} className="btn-stop">
              <Square size={16} /> STOP SESSION
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverlayWidget;
