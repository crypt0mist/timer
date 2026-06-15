import { useState, useCallback } from 'react';

// Filter function to remove messages with banned words
const isBannedMessage = (msg) => {
  const lowerMsg = String(msg).toLowerCase();
  // Ban specific problematic phrases and words
  const bannedPhrases = [
    'bhai', 'legend', 'kya ho', 'kia kr', 'aur kia', 'kaise ho', 'game khel', 
    'acha chal', 'shukriya', 'kehdo', 'kehna', 'kya kar', 'kya scene', 
    'arre beta', 'arre saab', 'ek minute', 'acha babu', 'waah bhai'
  ];
  return bannedPhrases.some(phrase => lowerMsg.includes(phrase));
};

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
              messagesPool = parsed
                .map(msg => String(msg).slice(0, 50))
                .filter(msg => !isBannedMessage(msg));
            }
          } else {
            const fallbackMatches = content.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
            if (fallbackMatches) {
              messagesPool = fallbackMatches
                .map(m => m.replace(/^"|"$/g, '').slice(0, 50))
                .filter(msg => !isBannedMessage(msg));
            }
          }
        } catch (parseError) {
          console.error("Failed to parse JSON, falling back to regex", parseError);
          const fallbackMatches = content.match(/"([^"\\]*(?:\\.[^"\\]*)*)"/g);
          if (fallbackMatches) {
            messagesPool = fallbackMatches
              .map(m => m.replace(/^"|"$/g, '').slice(0, 50))
              .filter(msg => !isBannedMessage(msg));
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
        'machli fry kar li', 'donut khatam', 'bitcoin phir gira', 'ETH pump ho gaya', 
        'machli pakad mil gaya', 'donut craving start', 'crypto hodl karte', 'machli scale kat',
        'donut glazed lelo', 'bitcoin tumble kar', 'ETH pump kar raha', 'machli fresh lo',
        'donut hole khao', 'crypto sell mat karo', 'machli tasty likha', 'donut sugar coat',
        'bitcoin hodl strong', 'ETH moon jaega', 'machli net main', 'donut spread lagao',
        'crypto pump dekho', 'machli water main', 'donut bite karo', 'ETH rise dekho',
        'machli pakda tha', 'bitcoin dump hua', 'donut finish kar', 'ETH hold karo',
        'machli tadka lagao', 'crypto trading chalti', 'donut coffee se', 'bitcoin rise dekho',
        'machli grill kar', 'ETH rocket jaegi', 'donut missing salty', 'crypto bull chalega',
        'machli fal lo', 'donut missing sweetness', 'bitcoin chart dekho', 'ETH load kar',
        'machli fresh main', 'donut time now', 'crypto pump dekha', 'ETH top dekho',
        'machli cook kar', 'donut missing bite', 'bitcoin pump dekha', 'ETH sell na karo',
        'machli net se', 'donut finish tasty', 'bitcoin hold rakh', 'ETH sky jaegi',
        'machli salt add', 'donut glazed missing', 'crypto rise dekha', 'ETH pump dekha',
        'machli masala dal', 'donut share kar', 'bitcoin top dekha', 'ETH rise tha',
        'machli oil main', 'donut craving miss', 'crypto bull dekha', 'ETH top tha',
        'machli spicy kar', 'donut finish quick', 'bitcoin pump strong', 'ETH hold long',
        'machli perfect fry', 'donut sugar miss', 'bitcoin chart nice', 'ETH rocket dekha',
        'machli water dal', 'donut hole size', 'crypto hodl power', 'ETH pump power'
      ];
      for (let i = messagesPool.length; i < 100; i++) {
        messagesPool.push(fallbackMessages[i % fallbackMessages.length]);
      }
    }

    return messagesPool;
  }, []);

  return { isFetchingBatch, fetchBatch };
};
