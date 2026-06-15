import { useState, useCallback } from 'react';

export const useGroq = () => {
  const [isFetchingBatch, setIsFetchingBatch] = useState(false);

  const fetchBatch = useCallback(async () => {
    setIsFetchingBatch(true);
    let messagesPool = [];
    
    try {
      // We send a message to the background service worker to bypass Discord's Content Security Policy
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: "FETCH_GROQ_BATCH" }, (res) => {
          if (chrome.runtime.lastError) {
            console.error("Runtime error:", chrome.runtime.lastError.message);
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(res);
          }
        });
      });

      if (response && response.success) {
        const content = response.data.choices[0].message.content;
        
        // Robust Parsing
        try {
          const jsonMatch = content.match(/\[(.*?)\]/s);
          if (jsonMatch) {
            const parsed = JSON.parse(`[${jsonMatch[1]}]`);
            if (Array.isArray(parsed)) {
              messagesPool = parsed.map(msg => String(msg).slice(0, 50));
            }
          } else {
            const fallbackMatches = content.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
            if (fallbackMatches) {
              messagesPool = fallbackMatches.map(m => m.replace(/^"|"$/g, '').slice(0, 50));
            }
          }
        } catch (parseError) {
          console.error("Failed to parse JSON, falling back to regex", parseError);
          const fallbackMatches = content.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
          if (fallbackMatches) {
            messagesPool = fallbackMatches.map(m => m.replace(/^"|"$/g, '').slice(0, 50));
          }
        }
      } else {
        console.error("Background script failed to fetch Groq batch:", response?.error);
      }
    } catch (error) {
      console.error("Failed to communicate with background script", error);
    } finally {
      setIsFetchingBatch(false);
    }

    // If we failed to get at least 20 messages, generate some basic fallbacks so the app doesn't crash
    if (messagesPool.length < 20) {
      const fallbackMessages = [
        'aur kia ho', 'kaise ho bhai', 'kya kar rahe', 'game khel rahe ho', 'donut time',
        'mazaa aa gaya', 'acha chal bye', 'arre legend', 'bhai shukriya', 'kya scene hai',
        'ek minute', 'lagta nahi', 'bilkul sahi', 'billo rani', 'waah bhai',
        'ghar ja bhai', 'tatti nahi hai', 'jaao na bhai', 'arre beta', 'shukriya bhaisab',
        'kiya hua', 'kaun sa game', 'donut khao na', 'mast hai yaar', 'kya chalraha',
        'legend lag gaya', 'arre saab', 'beta kehdo', 'shukriya sardar', 'kaise issue',
        'bilkul mast', 'kya idea hai', 'arre babu', 'kya kehna', 'arre bosss',
        'mast bro', 'legend bhai', 'top notch', 'acha babu', 'arre pakka',
        'khud se kehdo', 'mera pata', 'kya nikla', 'arrey shukriya', 'kya kehenge',
        'shukriya saab', 'acha shukriya', 'bolna na', 'yar legend', 'shukriya bhai',
        'beta kehdo', 'bro legend', 'arre saab', 'kya baath', 'pakka bhai'
      ];
      for (let i = messagesPool.length; i < 100; i++) {
        messagesPool.push(fallbackMessages[i % fallbackMessages.length]);
      }
    }

    return messagesPool;
  }, []);

  return { isFetchingBatch, fetchBatch };
};
