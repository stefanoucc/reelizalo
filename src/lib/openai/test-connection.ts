"use server";

import { openai } from '@/lib/openai/client';

/**
 * Tests the connection to the OpenAI API by fetching the list of models.
 * @returns A promise that resolves to an object indicating success or failure.
 */
export async function testOpenAIConnection(): Promise<{ 
  success: boolean; 
  error?: string; 
  data?: any;
}> {
  console.log("Attempting to connect to OpenAI...");
  try {
    const response = await openai.models.list();
    
    // Check if we received at least one model
    if (response.data && response.data.length > 0) {
      console.log("✅ OpenAI connection successful.");
      return { 
        success: true, 
        data: {
          modelCount: response.data.length,
          firstModelId: response.data[0]?.id
        }
      };
    } else {
      console.error("❌ OpenAI connection test failed: No models returned.");
      return { success: false, error: "No models returned from OpenAI API." };
    }
  } catch (error) {
    console.error("❌ OpenAI connection failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      success: false,
      error: errorMessage,
    };
  }
} 