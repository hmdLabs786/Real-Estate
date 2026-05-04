import { chatWithAI } from '../lib/ai';
import { LeadStatus } from '../types';
import { createOrUpdateLead } from './leadService';

const CHATBOT_SYSTEM_INSTRUCTION = `
You are "Karachi Estates Assistant", a professional sales representative for real estate in Karachi, Pakistan.
Your goal is to qualify leads by collecting:
1. Budget (in PKR)
2. Preferred Location (DHA, Bahria Town, Gulshan, Clifton, etc.)
3. Property Type (house, apartment, plot)

Rules:
- Be polite and professional.
- Guide the user step-by-step.
- If they ask general questions about Karachi real estate, answer them but circle back to qualifying them.
- Once you have the budget, location, and type:
  - Suggest they browse specific properties.
  - Ask if they are interested in a physical visit.
- If they express interest in a visit for a specific property or in general, set 'bookingRequested' to true.
- Always output your response as a JSON string with the following structure:
{
  "message": "Your conversational response here",
  "data": {
    "budget": number | null,
    "location": string | null,
    "propertyType": string | null,
    "isSerious": boolean,
    "bookingRequested": boolean,
    "targetProperty": string | null
  },
  "status": "unqualified" | "qualified" | "serious"
}

Identify the data from the user's input and update the 'data' and 'status' accordingly.
"qualified" means they have provided budget, location, and type.
"serious" means they are qualified AND interested in a visit.
`;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function processChatMessage(message: string, history: ChatMessage[]) {
  const prompt = `
    History: ${JSON.stringify(history)}
    User: ${message}
  `;
  
  const responseText = await chatWithAI(prompt, CHATBOT_SYSTEM_INSTRUCTION);
  
  try {
    // Attempt to parse JSON from response
    // Sometimes Gemini might wrap it in markdown block
    const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    const parsed = JSON.parse(jsonStr || '{}');
    
    // Update Lead in DB if we have meaningful data
    if (parsed.data) {
      await createOrUpdateLead({
        budget: parsed.data.budget,
        location: parsed.data.location,
        propertyType: parsed.data.propertyType,
        status: parsed.status as LeadStatus,
        isSerious: parsed.data.isSerious
      });
    }
    
    return parsed;
  } catch (error) {
    console.error("Chatbot processing error:", error);
    console.error("Model response text:", responseText);
    return {
      message: responseText || "I'm having trouble processing that right now. Could you tell me more about your requirements?",
      data: null,
      status: "unqualified"
    };
  }
}
