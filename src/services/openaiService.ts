import { PortfolioPiece, OpenAIResponse, OpenAIResponseWithDebug, DebugInfo } from '../types';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;

  private constructor() {
    this.apiKey = OPENAI_API_KEY || '';
  }

  private obscureSensitiveData(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.obscureSensitiveData(item));
    }

    const obscured = { ...obj };
    
    // Obscure API keys and other sensitive data
    if (obscured.Authorization) {
      obscured.Authorization = obscured.Authorization.replace(/Bearer\s+.+/, 'Bearer [REDACTED]');
    }
    if (obscured.authorization) {
      obscured.authorization = obscured.authorization.replace(/Bearer\s+.+/, 'Bearer [REDACTED]');
    }
    if (obscured['api-key']) {
      obscured['api-key'] = '[REDACTED]';
    }
    if (obscured['x-api-key']) {
      obscured['x-api-key'] = '[REDACTED]';
    }

    // Recursively process nested objects
    for (const key in obscured) {
      if (typeof obscured[key] === 'object' && obscured[key] !== null) {
        obscured[key] = this.obscureSensitiveData(obscured[key]);
      }
    }

    return obscured;
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async selectPortfolioPieces(
    userRequest: string,
    availablePieces: PortfolioPiece[]
  ): Promise<OpenAIResponseWithDebug> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY in your .env file.');
    }

    // Prepare metadata for each piece
    const piecesMetadata = availablePieces.map(piece => ({
      id: piece.id,
      title: piece.title,
      description: piece.description,
      tags: piece.tags,
      mood: piece.mood,
      type: piece.type,
      year: piece.year,
      medium: piece.medium
    }));

    const prompt = `You are an expert art curator. Based on the user's request and the available portfolio pieces, select the most appropriate pieces to display.

User Request: "${userRequest}"

Available Pieces:
${JSON.stringify(piecesMetadata, null, 2)}

Please analyze the user's request and select 6-12 pieces that best match their vision. Consider:
1. The mood and feeling they want to convey
2. The target audience they mentioned
3. The artistic coherence of the selected pieces
4. A good mix of different media types and sizes

Respond with a JSON object containing:
- "selectedIds": array of selected piece IDs (exact matches from the available pieces)
- "reasoning": explanation of your selection choices

IMPORTANT: Return ONLY valid JSON. Do not wrap it in markdown code blocks or add any other text. The response must be parseable JSON.`;

    // Prepare request data for debugging
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert art curator with deep knowledge of contemporary art, photography, and multimedia works. You excel at understanding artistic intent and creating cohesive visual experiences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const requestUrl = 'https://api.openai.com/v1/chat/completions';

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
      });

      // Capture response headers for debugging
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Clean the content to extract JSON from markdown code blocks
      let jsonContent = content.trim();
      
      // Remove markdown code block markers if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '');
      }
      if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '');
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.replace(/\s*```$/, '');
      }
      
      // Parse the cleaned JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', content);
        console.error('Cleaned content:', jsonContent);
        throw new Error(`Failed to parse OpenAI response as JSON. Raw response: ${content.substring(0, 200)}...`);
      }
      
      // Validate that all selected IDs exist in available pieces
      const availableIds = availablePieces.map(p => p.id);
      const invalidIds = parsedResponse.selectedIds.filter((id: string) => !availableIds.includes(id));
      
      if (invalidIds.length > 0) {
        throw new Error(`Invalid piece IDs returned: ${invalidIds.join(', ')}`);
      }

      // Create debug information with obscured sensitive data
      const debugInfo: DebugInfo = {
        request: {
          url: requestUrl,
          method: 'POST',
          headers: this.obscureSensitiveData(requestHeaders),
          body: this.obscureSensitiveData(requestBody)
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: this.obscureSensitiveData(responseHeaders),
          body: this.obscureSensitiveData(data)
        }
      };

      return {
        ...parsedResponse,
        debugInfo
      } as OpenAIResponseWithDebug;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
}