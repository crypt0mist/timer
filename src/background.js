/* global chrome */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;
const SYSTEM_PROMPT = `You are a casual Discord user chatting in Roman Urdu. Generate 100 unique, natural messages that feel authentic.

Guidelines:
- Each message 2-6 words maximum
- Mix of greetings, casual reactions, questions, and playful banter
- Topics: machli (fish talk, fishing, seafood), donuts (cravings, eating, sharing), and crypto (coins, trading, gains/losses, market hype)
- Use natural Roman Urdu (e.g., 'machli kha li?', 'donut chahiye abhi', 'crypto upar gaya', 'ETH khareed lo bhai', 'machli pakad li aaj', 'donut mila nahi', 'bitcoin phir gira')
- Make them feel like real Discord messages, not robotic
- Vary tone: some excited (crypto pumping, donut found), some sad (crypto dip, no donuts), some casual (machli talk)
- NO English translations, NO numbering, NO markdown, NO duplicates

Return ONLY a valid JSON array of strings, nothing else.
Example: ["arre machli kha li", "donut chahiye yaar", "crypto upar gaya bhai", "ETH buy kar lo"]`;

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