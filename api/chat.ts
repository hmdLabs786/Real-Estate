import Groq from "groq-sdk";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemInstruction } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
  }

  try {
    const groq = new Groq({ apiKey });
    
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        ...(systemInstruction ? [{ role: "system", content: systemInstruction } as const] : []),
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content || "";
    res.status(200).json({ text });
  } catch (error: any) {
    if (error.status === 429) {
      console.error("Groq Rate Limit Exceeded:", error.message);
      return res.status(429).json({ 
        error: "Groq Rate Limit Exceeded. Please try again later." 
      });
    }
    console.error("Groq Vercel Error:", error);
    res.status(500).json({ error: 'Failed to communicate with AI service.' });
  }
}
