import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Helper function to get image size based on social format
function getImageSizeFromSocialFormat(socialFormat: string): '1024x1024' | '1024x1792' | '1792x1024' {
  const formatSizes: Record<string, '1024x1024' | '1024x1792' | '1792x1024'> = {
    'instagram-post': '1024x1024',     // 1:1
    'instagram-story': '1024x1792',    // 9:16 (closest to)
    'linkedin': '1792x1024',           // 1.91:1 (closest to landscape)
    'twitter': '1792x1024',            // 16:9 (closest to landscape)
    'pinterest': '1024x1792'           // 2:3 (closest to vertical)
  }
  
  return formatSizes[socialFormat] || '1024x1024'
}

// SOMA Brand Context
const SOMA_BRAND_CONTEXT = `
SOMA: High-performance wearable technology brand
Style: Contemplative, artistic, minimalist with sophisticated aesthetic
Colors: Petróleo (#015965), Pino (#006D5A), Aquamarina (#2FFFCC), Lavanda (#D4C4FC), Negro (#051F22), Blanco (#F7FBFE)
Focus: Technology and human well-being connection, performance optimization, wellness
`

function enhancePromptWithBrand(userPrompt: string, count: number): string {
  let layoutInstructions = ''
  
  if (count === 3) {
    layoutInstructions = 'Create a wide horizontal image in 3:1 aspect ratio designed to be split into three equal square parts for Instagram grid. Each third should work as a standalone post but flow seamlessly together.'
  } else if (count === 6) {
    layoutInstructions = 'Create a wide horizontal image in 3:2 aspect ratio designed to be split into six equal square parts (2 rows, 3 columns) for Instagram grid. Each square should work as a standalone post but flow seamlessly together.'
  } else if (count === 1) {
    layoutInstructions = 'Create a single square image (1:1 aspect ratio) optimized for Instagram feed posts.'
  } else {
    layoutInstructions = 'Create multiple square images optimized for Instagram carousel posts.'
  }

  return `Create an image for SOMA wearable technology brand: ${SOMA_BRAND_CONTEXT}

User request: ${userPrompt}

Layout requirements: ${layoutInstructions}

Style: Sophisticated, contemplative, using SOMA brand colors. Focus on technology and human well-being connection.`;
}

export async function POST(req: Request) {
  console.log('🚀 [Generate Images API] Request received');
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("❌ CRITICAL: OPENAI_API_KEY environment variable not found.");
    return NextResponse.json({ error: 'The OpenAI API key is not configured on the server. Please check your .env.local file and restart the server.' }, { status: 500 });
  }
  console.log('✅ API Key found');

  try {
    const { prompt, count, socialFormat } = await req.json()
    console.log('📝 Request data:', { prompt: prompt?.substring(0, 100) + '...', count, socialFormat });

    if (!prompt || !count) {
      console.log('❌ Missing required fields:', { prompt: !!prompt, count: !!count });
      return NextResponse.json({ error: 'Prompt and count are required' }, { status: 400 });
    }

    // Get the appropriate image size based on social format
    const imageSize = getImageSizeFromSocialFormat(socialFormat)
    console.log('📐 Using image size:', imageSize, 'for social format:', socialFormat);

    if (prompt.length > 1000) {
      console.log('❌ Prompt too long:', prompt.length, 'characters');
      return NextResponse.json({ error: 'Prompt cannot be longer than 1000 characters.' }, { status: 400 });
    }

    console.log('🔄 Enhancing prompt with SOMA brand context...');
    // Enhance the user's prompt with SOMA brand context
    const enhancedPrompt = enhancePromptWithBrand(prompt, count);
    console.log('📏 Enhanced prompt length:', enhancedPrompt.length);
    console.log('📄 Enhanced prompt preview:', enhancedPrompt.substring(0, 200) + '...');

    // Generate images using dall-e-3 with timeout
            console.log('🎨 Starting image generation with dall-e-3 model...');
    const imagePromises = [];
    for (let i = 0; i < count; i++) {
      console.log(`🔄 Creating promise ${i + 1}/${count}`);
      const promise = Promise.race([
        openai.images.generate({
          model: "dall-e-3",
          prompt: enhancedPrompt,
          n: 1, // Each request can only be for one image
          size: imageSize,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 60 seconds')), 60000)
        )
      ]);
      imagePromises.push(promise);
    }

    console.log('⏳ Waiting for all image generation promises...');
    const responses = await Promise.all(imagePromises);
    console.log('✅ Image generation completed, responses received:', responses.length);
    
    // Each response contains one image URL. We need to collect them all.
    console.log('🔗 Extracting URLs from responses...');
    console.log('🔍 Raw responses structure:', {
      length: responses.length,
      type: typeof responses,
      isArray: Array.isArray(responses)
    });
    
    const urls = responses.flatMap((response: any) => {
      console.log('🔍 Processing response type:', typeof response);
      console.log('🔍 Response keys:', Object.keys(response || {}));
      console.log('🔍 Response data type:', typeof response?.data);
      console.log('🔍 Response data:', response?.data);
      
      if (response?.data && Array.isArray(response.data)) {
        const responseUrls = response.data.map((img: any, index: number) => {
          console.log(`🔍 Image ${index} object:`, img);
          console.log(`🔍 Image ${index} keys:`, Object.keys(img || {}));
          
          // Handle b64_json format (dall-e-3)
          if (img.b64_json) {
            console.log(`🔍 Image ${index} has b64_json data`);
            return `data:image/png;base64,${img.b64_json}`;
          }
          
          // Handle URL format (dall-e models)
          if (img.url) {
            console.log(`🔍 Image ${index} has URL:`, img.url);
            return img.url;
          }
          
          console.log(`🔍 Image ${index} has no valid format`);
          return null;
        }).filter((url: any): url is string => !!url);
        
        console.log('🔍 URLs from this response:', responseUrls);
        return responseUrls;
      } else if (response?.data && typeof response.data === 'object') {
        console.log('🔍 Response.data is object, not array');
        console.log('🔍 Response.data keys:', Object.keys(response.data));
        return [];
      }
      
      console.log('🔍 No data or invalid data structure in response');
      return [];
    });

    console.log('🎯 Generated URLs count:', urls.length);
    console.log('🔗 URLs:', urls);
    console.log('✅ [Generate Images API] Success - returning URLs');
    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error('❌ [Generate Images API Error]', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // It's good practice to check if the error is an OpenAI error
    if (error instanceof OpenAI.APIError) {
      console.log('🔍 OpenAI API Error detected');
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    
    console.log('🔍 Generic error - returning error message');
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}