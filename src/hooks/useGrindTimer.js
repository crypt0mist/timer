import { useState, useEffect, useCallback, useRef } from 'react';

const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {
    console.error("Audio playback failed", e);
  }
};

const playCompleteChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.4);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch(e) {}
};

export const useGrindTimer = () => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('IDLE'); // IDLE | PROMPT_FIRST | WAITING_SECOND | PROMPT_SECOND | COOLDOWN | COMPLETE
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalCycleTime, setTotalCycleTime] = useState(60);
  
  // Message Pool State
  const [messagePool, setMessagePool] = useState([]);
  const [poolIndex, setPoolIndex] = useState(0);

  const [stats, setStats] = useState({
    streak: 0,
    xp: 0,
    level: 0,
    messagesSent: 0,
    totalLostTimeMs: 0
  });

  const timerRef = useRef(null);
  const cycleStartTimeRef = useRef(0);
  const nextPromptTimeRef = useRef(0);
  const promptShownTimeRef = useRef(0);

  const calculateLevel = (currentXp) => {
    let lvl = 0;
    let xpNeeded = 100;
    let tempXp = currentXp;
    while(tempXp >= xpNeeded) {
      tempXp -= xpNeeded;
      lvl++;
      xpNeeded = 5 * (lvl * lvl) + 50 * lvl + 100;
    }
    return { level: lvl, xpInLevel: tempXp, xpNeededForNext: xpNeeded };
  };

  const addXp = () => {
    const earned = 15;
    setStats(prev => {
      const newXp = prev.xp + earned;
      const calc = calculateLevel(newXp);
      return { ...prev, xp: newXp, level: calc.level, messagesSent: prev.messagesSent + 1 };
    });
  };

  const addDecoyMessage = () => {
    setStats(prev => ({ ...prev, messagesSent: prev.messagesSent + 1 }));
  };

  const triggerPrompt = (newPhase) => {
    setPhase(newPhase);
    promptShownTimeRef.current = Date.now();
    playChime();
  };

  const startSession = (loadedMessages) => {
    setMessagePool(loadedMessages);
    setPoolIndex(0);
    setIsActive(true);
    setStats(prev => ({ ...prev, streak: 0, totalLostTimeMs: 0 }));
    triggerPrompt('PROMPT_FIRST');
  };

  const stopSession = () => {
    setIsActive(false);
    setPhase('IDLE');
    setTimeLeft(0);
    setMessagePool([]);
    if(timerRef.current) clearInterval(timerRef.current);
  };

  const completeSession = useCallback(() => {
    setIsActive(false);
    setPhase('COMPLETE');
    setTimeLeft(0);
    playCompleteChime();
    if(timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleMessageSent = useCallback(() => {
    if (!isActive || phase === 'COMPLETE') return;
    const now = Date.now();
    
    // Check if pool is exhausted
    if (poolIndex >= messagePool.length - 2) {
      // 100 messages done!
      completeSession();
      return;
    }

    if (phase === 'PROMPT_FIRST' || phase === 'PROMPT_SECOND') {
      const lostTime = now - promptShownTimeRef.current;
      setStats(prev => ({ ...prev, totalLostTimeMs: prev.totalLostTimeMs + lostTime }));
      // Advance pool index so next prompt shows new variants
      setPoolIndex(prev => prev + 2);
    }

    if (phase === 'PROMPT_FIRST') {
      addXp();
      setStats(prev => ({ ...prev, streak: prev.streak + 1 }));
      cycleStartTimeRef.current = now;
      
      const delay = 16000 + Math.floor(Math.random() * 5000);
      nextPromptTimeRef.current = now + delay;
      setTotalCycleTime(delay / 1000);
      setPhase('WAITING_SECOND');
      
    } else if (phase === 'PROMPT_SECOND') {
      addDecoyMessage();
      setTotalCycleTime(60);
      setPhase('COOLDOWN');
    }
  }, [isActive, phase, poolIndex, messagePool.length, completeSession]);

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      
      if (phase === 'WAITING_SECOND') {
        const remaining = Math.max(0, Math.ceil((nextPromptTimeRef.current - now) / 1000));
        setTimeLeft(remaining);
        if (now >= nextPromptTimeRef.current) {
          triggerPrompt('PROMPT_SECOND');
        }
      } else if (phase === 'COOLDOWN') {
        const cycleEnd = cycleStartTimeRef.current + 60000;
        const remaining = Math.max(0, Math.ceil((cycleEnd - now) / 1000));
        setTimeLeft(remaining);
        
        if (now >= cycleEnd) {
          const variance = Math.floor(Math.random() * 3000);
          setTimeout(() => {
            if(isActive) triggerPrompt('PROMPT_FIRST');
          }, variance);
          setTimeLeft(0);
        }
      }
    }, 100);

    return () => clearInterval(timerRef.current);
  }, [isActive, phase]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const activeTag = document.activeElement.tagName;
        const isEditable = document.activeElement.isContentEditable || document.activeElement.getAttribute('role') === 'textbox';
        if (activeTag === 'TEXTAREA' || activeTag === 'INPUT' || isEditable) {
          handleMessageSent();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleMessageSent]);

  const currentVariants = messagePool.slice(poolIndex, poolIndex + 2);
  const remainingMessages = Math.max(0, messagePool.length - poolIndex);

  return {
    isActive,
    phase,
    timeLeft,
    totalCycleTime,
    stats,
    currentLevelInfo: calculateLevel(stats.xp),
    currentVariants,
    remainingMessages,
    totalPoolSize: messagePool.length,
    startSession,
    stopSession,
    manualTrigger: handleMessageSent
  };
};
