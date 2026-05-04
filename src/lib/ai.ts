import axios from 'axios';

export const chatWithAI = async (prompt: string, systemInstruction?: string) => {
  try {
    const response = await axios.post("/api/chat", {
      prompt,
      systemInstruction,
    });

    return response.data.text;
  } catch (error: any) {
    console.error("AI Proxy Error:", error);
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    return "I'm sorry, I encountered an error. Please try again.";
  }
};
