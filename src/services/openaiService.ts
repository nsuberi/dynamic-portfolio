import { PortfolioPiece, OpenAIResponse } from '../types';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

export class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string;

  private constructor() {
    this.apiKey = OPENAI_API_KEY || '';
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
  ): Promise<OpenAIResponse> {
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

Only return the JSON response, no additional text.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
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
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(content);
      
      // Validate that all selected IDs exist in available pieces
      const availableIds = availablePieces.map(p => p.id);
      const invalidIds = parsedResponse.selectedIds.filter((id: string) => !availableIds.includes(id));
      
      if (invalidIds.length > 0) {
        throw new Error(`Invalid piece IDs returned: ${invalidIds.join(', ')}`);
      }

      return parsedResponse as OpenAIResponse;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
}