import { PortfolioPiece, OpenAIResponse, OpenAIResponseWithDebug, DebugInfo, AudioFileAnalysis, AudioAnalysisRequest, AudioAnalysisResponse } from '../types';

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

  public async analyzeAudioFile(request: AudioAnalysisRequest): Promise<AudioAnalysisResponse> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found. Please set REACT_APP_OPENAI_API_KEY in your .env file.');
    }

    const startTime = Date.now();
    
    try {
      // Extract metadata from file path (Splice format)
      const pathMetadata = this.extractSpliceMetadata(request.filePath);
      
      // Prepare the prompt for GPT-4o
      const prompt = `You are an expert music analyst and audio engineer. Analyze the following audio file and provide detailed metadata.

File Information:
- File Name: ${request.fileName}
- File Path: ${request.filePath}
- File Size: ${(request.fileSize / 1024 / 1024).toFixed(2)} MB
- Format: ${request.fileName.split('.').pop()?.toUpperCase()}

${pathMetadata ? `Path Analysis (Splice format):
- Pack: ${pathMetadata.packName || 'Unknown'}
- Artist: ${pathMetadata.packArtist || 'Unknown'}
- Category: ${pathMetadata.category || 'Unknown'}
- Subcategory: ${pathMetadata.subcategory || 'Unknown'}` : ''}

Please analyze this audio file and provide the following information in JSON format:

{
  "analysis": {
    "artist": "Artist name if identifiable",
    "title": "Track title if identifiable",
    "genre": "Primary genre (e.g., hip-hop, electronic, jazz, etc.)",
    "mood": ["mood1", "mood2", "mood3"],
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "description": "Detailed description of the audio content",
    "bpm": 120,
    "key": "C major",
    "instruments": ["instrument1", "instrument2"],
    "style": "musical style description",
    "energy": "low|medium|high",
    "tempo": "slow|medium|fast",
    "complexity": "simple|moderate|complex"
  },
  "gptAnalysis": {
    "reasoning": "Explanation of how you determined these characteristics",
    "confidence": 0.85,
    "additionalNotes": "Any additional insights or notes"
  }
}

${request.enableWebSearch ? `
IMPORTANT: You can also search the internet for information about this specific file or similar files from the same pack/artist to enhance your analysis. Use any available web search capabilities to find additional metadata, reviews, or information about this audio file or the pack it belongs to.` : ''}

Please provide a comprehensive analysis based on the file name, path structure, and any patterns you can identify. Be as specific and accurate as possible.`;

      const requestBody = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert music analyst with deep knowledge of audio production, music theory, and audio file formats. You excel at analyzing audio files and extracting meaningful metadata from file names, paths, and content patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      };

      const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      };

      const requestUrl = 'https://api.openai.com/v1/chat/completions';

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Clean and parse the JSON response
      let jsonContent = content.trim();
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '');
      }
      if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '');
      }
      if (jsonContent.endsWith('```')) {
        jsonContent = jsonContent.replace(/\s*```$/, '');
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw content:', content);
        throw new Error(`Failed to parse OpenAI response as JSON. Raw response: ${content.substring(0, 200)}...`);
      }

      const analysis: AudioFileAnalysis = {
        filePath: request.filePath,
        fileName: request.fileName,
        fileSize: request.fileSize,
        format: request.fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN',
        analysis: parsedResponse.analysis,
        metadata: {
          originalFileName: request.fileName,
          ...pathMetadata
        },
        gptAnalysis: parsedResponse.gptAnalysis
      };

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        analysis,
        debugInfo: {
          processingTime,
          gptTokensUsed: data.usage?.total_tokens || 0
        }
      };

    } catch (error) {
      console.error('Audio Analysis Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        debugInfo: {
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  private extractSpliceMetadata(filePath: string): any {
    // Parse Splice file path format:
    // /Users/nathansuberi/Splice/sounds/packs/Summer's Soul/Soul_Surplus_-_Summer_Soul/Loops/Melodic_Loops/SLS_SS_75_finally_Gmin/SLS_SS_75_music_loop_resample_finally_Bmin.wav
    
    const pathParts = filePath.split('/');
    const spliceIndex = pathParts.findIndex(part => part === 'Splice');
    
    if (spliceIndex === -1) return null;
    
    const soundsIndex = pathParts.findIndex(part => part === 'sounds');
    if (soundsIndex === -1 || soundsIndex <= spliceIndex) return null;
    
    const packsIndex = pathParts.findIndex(part => part === 'packs');
    if (packsIndex === -1 || packsIndex <= soundsIndex) return null;
    
    const metadata: any = {};
    
    // Extract pack name (first folder after packs)
    if (packsIndex + 1 < pathParts.length) {
      metadata.packName = pathParts[packsIndex + 1];
    }
    
    // Extract pack artist (second folder after packs)
    if (packsIndex + 2 < pathParts.length) {
      metadata.packArtist = pathParts[packsIndex + 2];
    }
    
    // Extract category (third folder after packs)
    if (packsIndex + 3 < pathParts.length) {
      metadata.category = pathParts[packsIndex + 3];
    }
    
    // Extract subcategory (fourth folder after packs)
    if (packsIndex + 4 < pathParts.length) {
      metadata.subcategory = pathParts[packsIndex + 4];
    }
    
    // Extract specific track folder (fifth folder after packs)
    if (packsIndex + 5 < pathParts.length) {
      metadata.trackFolder = pathParts[packsIndex + 5];
    }
    
    return metadata;
  }
}