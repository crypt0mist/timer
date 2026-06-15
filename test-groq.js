/* global process */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SYSTEM_PROMPT = `You are a casual Discord user chatting in Roman Urdu. Generate 100 UNIQUE messages.

STRICT RULES:
- Each message 2-6 words ONLY
- Topics MUST be ONLY these three: machli (fish/fishing/seafood), donut (cravings/eating), crypto (bitcoin/ETH/trading/gains/loss)
- DO NOT use: "bhai", "legend", "kia kr rahe", "kya ho raha" — these are BANNED words
- Every single message must mention machli, donut, OR crypto specifically
- Roman Urdu only, no generic filler messages
- NO duplicates, NO similar phrases

BAD examples (do NOT generate): "bhai kia kr raha", "kya ho gaya yaar", "bhai legend"
GOOD examples: "machli fry kar li", "donut khatam ho gaya", "bitcoin phir gira yaar", "ETH khareed li aaj", "machli bazar se lai", "donut mil gaya bhai", "crypto ne duba diya"

Return ONLY a valid JSON array of 100 strings. Nothing else.
Example: ["arre shukriya", "kya kar rahe ho?", "bhai legend"]`;

async function testGroq() {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("API Error:", data);
      return;
    }
    
    console.log("Success! Content length:", data.choices[0].message.content.length);
    console.log("First 200 chars:", data.choices[0].message.content.substring(0, 200));
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

testGroq();
