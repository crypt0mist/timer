const GROQ_API_KEY = process.env.GROQ_API_KEY;
const SYSTEM_PROMPT = `You are a casual Discord user chatting in Roman Urdu. Generate 100 unique, natural messages that feel authentic.

Guidelines:
- Each message 2-6 words maximum
- Mix of greetings, casual reactions, questions, and playful banter
- Topics: crypto, donut, asking how someone is, random fun comments
- Use natural Roman Urdu (e.g., 'aur kia ho raha hai', 'kya ho gaya', 'game khel rahe ho?', 'donut time!', 'mazaa aa gaya')
- Make them feel like real Discord messages, not robotic
- Vary tone: some excited, some chill, some questioning
- NO English translations, NO numbering, NO markdown, NO duplicates

Return ONLY a valid JSON array of strings, nothing else.
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
