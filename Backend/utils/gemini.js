import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Get model
const getModel = () => {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash"
  });
};

const SYSTEM_PROMPT = `
You are a calm, supportive mental health assistant.
- Be empathetic and understanding
- Keep responses short and helpful
- Avoid harmful or dangerous advice
- Encourage positivity and self-care
- Suggest professional help if needed
`;

const getFallbackReply = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes("low") || msg.includes("sad")) {
    return "I'm really sorry you're feeling this way. Do you want to share what's been on your mind?";
  }

  if (msg.includes("marks") || msg.includes("study")) {
    return "That sounds stressful. Marks can feel heavy, but they don’t define your worth. Want help figuring things out?";
  }

  if (msg.includes("trouble") || msg.includes("problem")) {
    return "I'm here with you. Want to tell me a bit more about what's going on?";
  }

  return "I'm here for you. You can talk to me about anything that's on your mind.";
};

export const generateReply = async (message) => {
  try {
    const model = getModel();

    const prompt = `
${SYSTEM_PROMPT}

User says: "${message}"

Respond in a warm, empathetic, human tone.
Always give a meaningful reply.
Never return an empty response.
Keep it 2–3 lines.
`;

    const result = await model.generateContent(prompt);

    let text = result.response.text();
    text = text?.trim();

    console.log("Generated reply:", text);

    if (!text) {
      return getFallbackReply(message);
    }

    return text;

  } catch (error) {
    console.error("Gemini Error:", error);

    return getFallbackReply(message);
  }
};

// export const detectMood = async (text) => {
//   try {
//     const model = getModel();

//     const prompt = `
// Analyze the mood of this message. Respond with ONLY one word:
// happy, sad, anxious, stressed, angry, or neutral.

// Message: "${text}"
// `;

//     const result = await model.generateContent(prompt);
//     return result.response.text().trim().toLowerCase();

//   } catch (error) {
//     console.error("Mood Detection Error:", error);
//     return "neutral";
//   }
// };

// export const translateText = async (text, targetLang) => {
//   try {
//     const model = getModel();

//     const prompt = `
// You are a translator.
// Translate the text to ${targetLang}.
// Only return the translated text. Do not explain.

// "${text}"
// `;

//     const result = await model.generateContent(prompt);
//     return result.response.text();

//   } catch (error) {
//     console.error("Translation Error:", error);
//     throw new Error("Translation failed");
//   }
// };

export { getModel };