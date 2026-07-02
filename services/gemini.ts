
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { AnimalType, AiAnalysis, FoodAnalysis, DocVerificationResult } from "../types";

// Initialize the client with the API key from the environment
// configured in vite.config.ts
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models configuration based on guidelines
const REASONING_MODEL = 'gemini-3-flash-preview'; // Changed to flash to avoid 429 rate limits
const FAST_MODEL = 'gemini-3-flash-preview';    // Reverted to flash for quick text responses to avoid 429 rate limits

// Enhanced retry logic for network robustness with exponential backoff
const handleApiCall = async <T>(apiCall: () => Promise<T>, fallbackData: T, retries = 5, delay = 3000): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    console.error("Gemini API Error:", JSON.stringify(error, null, 2));
    
    // Check for common quota/rate limit errors
    const isRateLimit = error.status === 429 || error.message?.includes('429') || error.message?.includes('Quota');
    
    if (retries > 0) {
      // Add jitter and longer base delay for rate limits
      const jitter = Math.random() * 2000;
      const waitTime = isRateLimit ? delay + 5000 + jitter : delay + jitter;
      
      console.log(`Retrying API call... attempts left: ${retries}, waitTime: ${Math.round(waitTime)}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      // Exponential backoff: double the base delay for the next retry
      return handleApiCall(apiCall, fallbackData, retries - 1, delay * 2);
    }

    if (isRateLimit) {
      console.warn("Quota exceeded or rate limited after retries. Returning fallback data.");
    }
    
    return fallbackData;
  }
};

/**
 * Analyzes an image of an injured animal.
 * Uses gemini-3-flash-preview for high-level reasoning and medical triage.
 * Enhanced with thinkingConfig for deeper analysis.
 */
export const analyzeInjury = async (imageB64: string): Promise<AiAnalysis> => {
  const fallback: AiAnalysis = {
    isAiGenerated: false,
    isAnimalPresent: true,
    animalType: AnimalType.OTHER,
    breedSuggestion: "Unknown (Offline)",
    detectionNotes: "Service unavailable. Please proceed with manual report.",
    visualDescription: "Image analysis unavailable.",
    categories: ["Unknown"],
    severity: "Medium",
    visualObservation: "AI service is currently offline. Please assess the animal manually.",
    firstAidAdvice: ["Keep the animal warm", "Do not move if spinal injury suspected"],
    confidenceScore: 0,
    imageQuality: 'Medium'
  };

  return handleApiCall(async () => {
    // Remove header if present (data:image/jpeg;base64,)
    const base64Data = imageB64.includes(',') ? imageB64.split(',')[1] : imageB64;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: 'Analyze this image for an emergency report. Identify the animal and categorize visible issues.' }
        ]
      },
      config: {
        systemInstruction: `You are an AI Assistant specialized in identifying street animals and categorizing visible issues for emergency reporting.
        
        IMPORTANT: You are NOT a veterinarian. DO NOT provide a medical diagnosis or internal medical assessment. Focus ONLY on what is visually apparent.
        
        TASKS:
        1. **Precision Species Identification**: Identify the animal species (DOG, CAT, COW, OTHER).
        2. **Visual Categorization**: Identify visible issues into broad categories: 'Bleeding', 'Mobility Issue', 'Skin Condition', 'Injury', 'General Distress', 'Emaciated', 'Limping'.
        3. **Visual Observation**: Provide a brief, objective description of what is visible in the photo (e.g., 'Visible wound on right ear', 'Animal appears unable to stand').
        
        OUTPUT RULES:
        - **Severity**: 'Critical' (Life threatening/Heavy Bleeding), 'High' (Visible Fractures/Deep Wounds), 'Medium' (Skin issues/Limping), 'Low' (Minor issues).
        - **Animal Type**: Must be strictly one of: 'DOG', 'CAT', 'COW', 'OTHER'.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isAiGenerated: { type: Type.BOOLEAN },
            isAnimalPresent: { type: Type.BOOLEAN },
            animalType: { type: Type.STRING, enum: ['DOG', 'CAT', 'COW', 'OTHER'] },
            breedSuggestion: { type: Type.STRING },
            detectionNotes: { type: Type.STRING },
            visualDescription: { type: Type.STRING },
            categories: { type: Type.ARRAY, items: { type: Type.STRING } },
            severity: { type: Type.STRING, enum: ['Critical', 'High', 'Medium', 'Low'] },
            visualObservation: { type: Type.STRING },
            firstAidAdvice: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidenceScore: { type: Type.NUMBER },
            imageQuality: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
          },
          required: ['isAnimalPresent', 'animalType', 'severity', 'visualObservation', 'categories', 'firstAidAdvice']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    // Ensure strict type matching for the frontend enum
    if (!['DOG', 'CAT', 'COW', 'OTHER'].includes(result.animalType)) {
      result.animalType = 'OTHER';
    }
    return result;
  }, fallback);
};

/**
 * Analyzes food donation images for safety and quantity.
 * Enhanced with thinkingConfig for toxicity checks.
 */
export const analyzeFoodDonation = async (imageB64: string): Promise<FoodAnalysis> => {
  const fallback: FoodAnalysis = {
    foodType: "Unknown Food",
    estimatedQuantity: "Unknown",
    suitability: { dog: true, cat: true, cow: true },
    comments: "Offline mode: Please ensure food is fresh and safe manually.",
    imageQuality: 'Medium'
  };

  return handleApiCall(async () => {
    const base64Data = imageB64.includes(',') ? imageB64.split(',')[1] : imageB64;

    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: 'Analyze this food donation.' }
        ]
      },
      config: {
        // Enable thinking to strictly check for toxic ingredients
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction: `You are a Veterinary Nutritionist AI.
        
        Tasks:
        1. Identify the general food category (foodType) AND specific food items present (specificFoodDetected).
        2. Estimate the quantity (e.g., "2 kg", "5 packets").
        3. STRICTLY check the image for expiration dates, mold, insect presence, or signs of spoilage. Set isSpoiledOrExpired appropriately.
        4. TOXICITY CHECK: Strictly check for items toxic to animals (Chocolate, Onions, Grapes, Xylitol, Cooked Bones).
        5. Determine suitability for Dogs, Cats, and Cows.
        6. If toxic or spoiled, mark suitability as false and warn clearly in comments (e.g. 'DO NOT CONSUME - SPOILED/TOXIC').`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodType: { type: Type.STRING },
            specificFoodDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
            isSpoiledOrExpired: { type: Type.BOOLEAN },
            estimatedQuantity: { type: Type.STRING },
            suitability: {
              type: Type.OBJECT,
              properties: {
                dog: { type: Type.BOOLEAN },
                cat: { type: Type.BOOLEAN },
                cow: { type: Type.BOOLEAN }
              },
              required: ['dog', 'cat', 'cow']
            },
            comments: { type: Type.STRING },
            imageQuality: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
          },
          required: ['foodType', 'specificFoodDetected', 'isSpoiledOrExpired', 'estimatedQuantity', 'suitability', 'comments']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  }, fallback);
};

/**
 * Chat assistant for first aid advice — STREAMING version.
 * Streams response chunks via onChunk callback for real-time display.
 * Uses condensed prompt + capped history for minimum latency.
 */
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// Fast retry specifically for chat — fewer retries, shorter delays
const handleChatApiCall = async <T>(apiCall: () => Promise<T>, fallbackData: T, retries = 2, delay = 1000): Promise<T> => {
  try {
    return await apiCall();
  } catch (error: any) {
    if (retries > 0) {
      const jitter = Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      return handleChatApiCall(apiCall, fallbackData, retries - 1, delay * 1.5);
    }
    return fallbackData;
  }
};

const CHAT_SYSTEM_PROMPT = `You are **PawMedic AI**, an emergency veterinary triage assistant for street animals in India. Be calm, concise, authoritative.

RESPONSE FORMAT (always):
**[URGENCY]:** 🔴 CRITICAL / 🟠 URGENT / 🟢 STABLE — (brief reason)
**⏱️ Time to Vet:** [e.g. "Within 30 min" / "Within 2 hours" / "Within 24 hours"]
**🩺 Steps:**
1-5 numbered, actionable first-aid steps
**⚠️ Do NOT:** dangerous actions to avoid
**🧰 Supplies:** household items needed
**🛡️ Safety:** human safety warning (rabies, aggression)

TRIAGE:
🔴 CRITICAL: heavy bleeding, vehicle hit, seizures, choking, unconscious, poisoning, open fractures, cold newborns
🟠 URGENT: moderate bleeding, closed fractures, vomiting >6h, heat stroke, eye injury, burns, trapped animal
🟢 STABLE: minor cuts, mild limp, skin conditions, feeding questions, general care

RULES: Never prescribe meds. Never suggest milk for cats. Never move spinal injuries. For CRITICAL, start with "🚨 This is a medical emergency." Keep it SHORT — max 150 words. Use prior conversation context. Simple language.`;

// Cap history to last 6 exchanges (12 messages) to reduce token count
const capHistory = (history: ChatMessage[], maxExchanges = 6): ChatMessage[] => {
  const maxMessages = maxExchanges * 2;
  return history.length > maxMessages ? history.slice(-maxMessages) : history;
};

/**
 * Streaming first aid advice — calls onChunk with each text fragment as it arrives.
 * Returns the full assembled text when complete.
 */
export const getFirstAidAdviceStream = async (
  query: string,
  history: ChatMessage[] = [],
  onChunk: (chunk: string, fullText: string) => void
): Promise<string> => {
  return handleChatApiCall(async () => {
    const cappedHistory = capHistory(history);
    const contents = [
      ...cappedHistory.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user' as const, parts: [{ text: query }] }
    ];

    const response = await ai.models.generateContentStream({
      model: FAST_MODEL,
      contents,
      config: {
        systemInstruction: CHAT_SYSTEM_PROMPT,
      }
    });

    let fullText = '';
    for await (const chunk of response) {
      const text = chunk.text || '';
      if (text) {
        fullText += text;
        onChunk(text, fullText);
      }
    }

    return fullText;
  }, "I am currently offline. **Please keep the animal warm, do not move it if you suspect spinal injury, and call the nearest veterinary clinic immediately.** If you see heavy bleeding, apply gentle pressure with a clean cloth.");
};

// Keep non-streaming version as fallback
export const getFirstAidAdvice = async (query: string, history: ChatMessage[] = []) => {
  return handleChatApiCall(async () => {
    const cappedHistory = capHistory(history);
    const contents = [
      ...cappedHistory.map(msg => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user' as const, parts: [{ text: query }] }
    ];

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents,
      config: {
        systemInstruction: CHAT_SYSTEM_PROMPT,
      }
    });
    return response.text;
  }, "I am currently offline. **Please keep the animal warm, do not move it if you suspect spinal injury, and call the nearest veterinary clinic immediately.** If you see heavy bleeding, apply gentle pressure with a clean cloth.");
};

/**
 * Finds local resources using Google Search Grounding.
 */
export const getLocalResources = async (lat: number, lng: number) => {
  const fallback = {
      text: "Unable to search online. Please look for 'Veterinary Clinic' on your maps app.",
      places: []
  };
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: `Find the 3 nearest open veterinary clinics or animal shelters to coordinates ${lat}, ${lng}. Return a brief summary list.`,
      config: {
        tools: [{googleSearch: {}}],
      }
    });
    
    // Extract grounding metadata to get actionable links
    const places = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title) || [];

    return {
      text: response.text,
      places: places
    };
  }, fallback);
};

/**
 * Gets a human-readable description of the location.
 */
export const getAreaDescription = async (lat: number, lng: number) => {
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Describe the location at coordinates ${lat}, ${lng} briefly (nearest landmark or cross street).`,
      config: {
        tools: [{ googleSearch: {} }], 
      }
    });
    return response.text;
  }, "Location details unavailable.");
};

/**
 * Geocodes an address string to coordinates.
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number, lng: number }> => {
  const fallback = { lat: 19.0760, lng: 72.8777 }; // Default fallback
  return handleApiCall(async () => {
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Return the latitude and longitude for: "${address}". Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lat: { type: Type.NUMBER },
            lng: { type: Type.NUMBER }
          },
          required: ['lat', 'lng']
        },
        tools: [{googleSearch: {}}]
      }
    });
    return JSON.parse(response.text || '{}');
  }, fallback);
};

/**
 * Verifies adoption documents (ID, Address Proof, Landlord NOC).
 * Uses OCR capabilities of Gemini Pro.
 */
export const verifyAdoptionDoc = async (imageB64: string, docType: 'ID' | 'ADDRESS' | 'LANDLORD'): Promise<DocVerificationResult> => {
  const fallback: DocVerificationResult = {
      isValid: true,
      reason: "Manual verification required (Offline Mode).",
      documentTypeDetected: "Unknown",
      imageQuality: 'Medium'
  };

  return handleApiCall(async () => {
    const base64Data = imageB64.includes(',') ? imageB64.split(',')[1] : imageB64;
    
    const docPrompt = 
      docType === 'ID' ? "Government Photo ID (Passport/License/Aadhar)" :
      docType === 'ADDRESS' ? "Utility Bill or Rent Agreement" :
      "Landlord No Objection Certificate (NOC)";

    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Verify this document. It should be a ${docPrompt}.` }
        ]
      },
      config: {
        // Enable thinking to carefully check document authenticity and legibility
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction: `You are a Document Verification AI.
        1. **Check Legibility**: Can text be read?
        2. **Classify**: Is it the correct document type requested?
        3. **Analyze**: Does it look authentic?
        
        Output JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            documentTypeDetected: { type: Type.STRING },
            imageQuality: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
          },
          required: ['isValid', 'reason', 'documentTypeDetected', 'imageQuality']
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  }, fallback);
};

/**
 * Compares two images to determine if they show the exact same individual animal.
 */
export const checkIsSameAnimal = async (image1B64: string, image2B64: string): Promise<boolean> => {
  const fallback = false;
  return handleApiCall(async () => {
    const mime1 = image1B64.startsWith('data:') ? image1B64.split(';')[0].split(':')[1] : 'image/jpeg';
    const mime2 = image2B64.startsWith('data:') ? image2B64.split(';')[0].split(':')[1] : 'image/jpeg';
    
    const b1 = image1B64.includes(',') ? image1B64.split(',')[1] : image1B64;
    const b2 = image2B64.includes(',') ? image2B64.split(',')[1] : image2B64;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: {
        parts: [
          { inlineData: { data: b1, mimeType: mime1 } },
          { inlineData: { data: b2, mimeType: mime2 } },
          { text: 'Look at these two images. Do they show the exact same individual animal? Consider the species, breed, color, markings, and visible injuries. Return JSON with a boolean field "isSameAnimal".' }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSameAnimal: { type: Type.BOOLEAN }
          },
          required: ['isSameAnimal']
        }
      }
    });
    const result = JSON.parse(response.text || '{}');
    return result.isSameAnimal === true;
  }, fallback);
};

/**
 * Verifies professional documents (Vet License, NGO Certificate).
 * Uses OCR capabilities of Gemini.
 */
export const verifyProfessionalDoc = async (imageB64: string, role: 'VET' | 'NGO'): Promise<DocVerificationResult> => {
  const fallback: DocVerificationResult = {
      isValid: true,
      reason: "Manual verification required (Offline Mode).",
      documentTypeDetected: "Unknown",
      imageQuality: 'Medium'
  };

  return handleApiCall(async () => {
    const base64Data = imageB64.includes(',') ? imageB64.split(',')[1] : imageB64;
    
    const docPrompt = 
      role === 'VET' ? "Veterinary Medical License or Registration Certificate" :
      "NGO Registration Certificate or Non-Profit Organization Charter";

    const response = await ai.models.generateContent({
      model: REASONING_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Verify this document. It should be a ${docPrompt}.` }
        ]
      },
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction: `You are a Professional Document Verification AI.
        1. **Check Legibility**: Can text be read?
        2. **Classify**: Is it the correct document type requested?
        3. **Analyze**: Does it look authentic?
        
        Output JSON.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
            documentTypeDetected: { type: Type.STRING },
            imageQuality: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
          },
          required: ['isValid', 'reason', 'documentTypeDetected', 'imageQuality']
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  }, fallback);
};
