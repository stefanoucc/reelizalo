import OpenAI from 'openai';

// Ensure the API key is available
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please set the OPENAI_API_KEY environment variable.');
}

// Create and export the OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}); 