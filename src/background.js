/* global chrome */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const SYSTEM_PROMPT = `You are a casual Discord user chatting in Roman Urdu. Generate EXACTLY 100 unique messages.

*** ABSOLUTE RULES (MUST FOLLOW) ***
1. EVERY message MUST contain ONE of these words: machli, donut, OR crypto (no exceptions)
2. Each message 2-6 words ONLY
3. BANNED WORDS - NEVER use these anywhere: bhai, legend, kia, kya, ho, raha, gaya, aur, kar, kehdo, kehna, hain
4. Use only specific topic vocabulary:
   - machli: fry, bazar, pakad, khao, khatam, mil, fish, scale, tasty
   - donut: kha, khatam, chahiye, mil, craving, glazed, hole, sugar
   - crypto: bitcoin, ETH, phir, gira, pump, dump, hodl, buy, sell, trading, coin, blockchain
5. Every message different - NO repeats or similar messages
6. Roman Urdu only - NO English, NO generic filler

*** MUST NOT GENERATE ***
"bhai legend", "kya ho", "kia kr rahe", "legend bhai", "kya ho gaya", "kaise ho bhai", "game khel", "acha chal", "bhai shukriya", "kya scene"

*** GOOD EXAMPLES (follow this style) ***
"machli fry kar li", "donut khatam", "bitcoin phir gira", "ETH pump ho gaya", "machli pakad mil gaya", "donut craving start", "crypto hodl karte hain", "machli bazar se lo", "donut sugar coat", "bitcoin tumble kar rahi"

Return ONLY a valid JSON array of exactly 100 strings. Nothing else. No numbers, no bullets, no text, just the JSON array.`;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_GROQ_BATCH") {

    fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Generate 100 unique Roman Urdu casual messages as a JSON array. Only return the array, nothing else." }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errData => {
          sendResponse({ success: false, error: `API Error ${response.status}: ${errData.error?.message || 'Unknown error'}` });
        });
      }
      return response.json();
    })
    .then(data => {
      if (data && data.error) {
        sendResponse({ success: false, error: `Groq API Error: ${data.error.message}` });
      } else if (data && data.choices && data.choices[0]) {
        sendResponse({ success: true, data });
      } else {
        sendResponse({ success: false, error: 'Invalid API response format' });
      }
    })
    .catch(error => {
      sendResponse({ success: false, error: `Network error: ${error.message}` });
    });

    return true; // Indicates we will send a response asynchronously
  }
});