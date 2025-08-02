import { GoogleGenAI } from "@google/genai";
import type { TournamentData } from '../types';

// This must be handled by an environment variable in a real-world scenario.
// Assuming `process.env.API_KEY` is configured in the build environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

/**
 * Analyzes tournament data using the Gemini AI model.
 * @param data The array of tournament data.
 * @returns A string containing the AI's analysis.
 */
export const analyzeTournamentData = async (data: TournamentData[]): Promise<string> => {
    if (!API_KEY) {
        throw new Error("API key is not configured for the AI service.");
    }
    
  // Prepare a clean, summary version of the data for the prompt
  const dataSummary = data.map(d => ({
    date: d.date.toISOString().split('T')[0],
    name: d.tournamentName,
    fee: d.entryFee,
    prizepool: d.prizepool,
    position: d.position,
    result: d.winOrLose,
    winnings: d.winningPrize,
  }));
  
  const prompt = `
    You are a professional esports performance analyst for "Team Crossbow", a competitive "Free Fire" team from Bangladesh.
    Based on the following tournament data (in JSON format), provide a concise yet insightful analysis of the team's performance.
    All monetary values are in Bangladeshi Taka (BDT). Please use the '৳' symbol for currency.
    
    Your analysis for Team Crossbow should be formatted in markdown and include:
    1.  A brief **Overall Summary** of the performance, including net profit/loss (in BDT).
    2.  **Key Strengths**: Identify what the team is doing well (e.g., performance in high-prizepool tournaments, consistency).
    3.  **Areas for Improvement**: Pinpoint weaknesses (e.g., poor win rate, high average position, struggles in certain tournament types).
    4.  **Actionable Advice**: Give 2-3 specific, actionable recommendations to improve future results in Free Fire.
    
    Keep the tone encouraging but data-driven. Use markdown headings (like '### Overall Summary'), bold text for emphasis, and unordered lists for advice.
    
    Here is the data:
    ${JSON.stringify(dataSummary, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The AI analysis request failed. This could be due to network issues or API key problems.");
  }
};