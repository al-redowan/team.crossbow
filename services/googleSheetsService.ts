
import type { TournamentData } from '../types';

// The public URL for the Google Sheet, exported as CSV
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/18dVUNXAO9AGFERQgFQkpLadhYNpuaOfPZ2SnYvrfIFM/export?format=csv';

// A list of CORS proxies to try in order. If the first fails, the next will be used.
const PROXIES = [
  `https://corsproxy.io/?${encodeURIComponent(GOOGLE_SHEET_URL)}`, // Primary
  `https://api.allorigins.win/raw?url=${encodeURIComponent(GOOGLE_SHEET_URL)}` // Fallback
];

/**
 * Attempts to fetch a resource from a list of URLs, returning the first successful response.
 * @param urls An array of URLs to try in sequence.
 * @returns A Promise that resolves with the first successful Response object.
 * @throws An error if all fetch attempts fail.
 */
async function fetchWithFallbacks(urls: string[]): Promise<Response> {
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`Successfully fetched from: ${url}`);
        return response;
      }
      console.warn(`Proxy failed, but was handled: ${url}, status: ${response.status}`);
    } catch (error) {
      console.warn(`Proxy failed with error: ${url}`, error);
    }
  }
  throw new Error("All proxy fetch attempts failed.");
}

/**
 * Cleans and parses strings like "50 tk", "1,000 BDT", "34 Points", "1st" into a number.
 * @param value The string value to parse.
 * @returns The parsed number, or 0 if parsing fails.
 */
const parseNumeric = (value: string): number => {
  if (!value) return 0;
  // Cleans and parses strings containing numbers by removing non-numeric characters.
  return Number(value.replace(/[^0-9.-]+/g, "")) || 0;
};

/**
 * Parses a date string in DD-MM-YYYY format.
 * @param dateStr The date string to parse.
 * @returns A Date object, or an invalid Date if parsing fails.
 */
const parseDate = (dateStr: string): Date => {
  if (!dateStr) return new Date(NaN);
  const trimmedDateStr = dateStr.trim();
  // Expects DD-MM-YYYY format
  const parts = trimmedDateStr.split('-');
  if (parts.length !== 3) return new Date(NaN);
  
  const [day, month, year] = parts.map(Number);
  // Basic validation on date parts
  if (isNaN(day) || isNaN(month) || isNaN(year) || year < 2000 || year > 3000 || month < 1 || month > 12 || day < 1 || day > 31) {
      return new Date(NaN);
  }
  // Month is 0-indexed in JavaScript Date constructor. Use UTC to avoid timezone issues.
  return new Date(Date.UTC(year, month - 1, day));
};

const parseWinLose = (value: string): 'Win' | 'Lose' | 'N/A' => {
  const lowerValue = value ? value.trim().toLowerCase() : '';
  if (lowerValue === 'win') return 'Win';
  if (lowerValue === 'lose') return 'Lose';
  return 'N/A';
};

/**
 * A simple but effective CSV row parser that handles commas within double-quoted fields.
 */
const parseCsvRow = (row: string): string[] => {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  for (const char of row) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim());
  return result;
};

export const fetchTournamentData = async (): Promise<TournamentData[]> => {
  try {
    const response = await fetchWithFallbacks(PROXIES);
    
    const csvText = await response.text();
    // Split by newline, skip header row, and filter out any potential empty/whitespace lines
    const rows = csvText.trim().split(/\r?\n/).slice(1).filter(row => row.trim().length > 0 && !row.trim().startsWith(',,,,,'));

    const data: TournamentData[] = rows.map(row => {
      const values = parseCsvRow(row);
      
      const [
        dateStr,
        time,
        tournamentName,
        teamSlot,
        entryFee,
        prizepool,
        qualifying,
        point,
        position,
        winOrLose,
        winningPrize,
      ] = values;

      return {
        date: parseDate(dateStr),
        time: time || 'N/A',
        tournamentName: tournamentName || 'N/A',
        teamSlot: teamSlot || 'N/A',
        entryFee: parseNumeric(entryFee),
        prizepool: parseNumeric(prizepool),
        qualifying: qualifying || 'N/A',
        point: parseNumeric(point),
        position: parseNumeric(position),
        winOrLose: parseWinLose(winOrLose),
        winningPrize: parseNumeric(winningPrize),
      };
    }).filter((item): item is TournamentData => 
        item !== null && !isNaN(item.date.getTime())
    );
    
    // Sort by date descending to show most recent first
    return data.sort((a, b) => b.date.getTime() - a.date.getTime());

  } catch (error) {
    console.error("Error fetching or parsing tournament data:", error);
    throw new Error("Could not load or process data from Google Sheets.");
  }
};
