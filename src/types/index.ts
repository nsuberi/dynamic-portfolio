export interface PortfolioPiece {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  title: string;
  description: string;
  year: number;
  medium: string;
  size: 'small' | 'medium' | 'large';
  url?: string; // for images, videos, audio
  content?: string; // for documents
  tags: string[];
  mood: string[];
}

export interface OpenAIResponse {
  selectedIds: string[];
  reasoning: string;
}

export interface DebugInfo {
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: any;
  };
  response: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
  };
}

export interface OpenAIResponseWithDebug extends OpenAIResponse {
  debugInfo?: DebugInfo;
}

export interface GalleryProps {
  pieces: PortfolioPiece[];
  onPieceClick: (piece: PortfolioPiece) => void;
}

export interface ModalProps {
  piece: PortfolioPiece | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface ListViewProps {
  pieces: PortfolioPiece[];
  onPieceClick: (piece: PortfolioPiece) => void;
}

// Splice Sound Bite interfaces
export interface SpliceSoundBite {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  key: string;
  duration: number; // in seconds
  previewUrl: string;
  downloadUrl: string;
  tags: string[];
  mood: string[];
  description: string;
  waveformUrl?: string;
  coverArtUrl?: string;
  originalFile?: File; // For debug purposes
}

export interface SpliceSearchParams {
  query: string;
  genre?: string;
  mood?: string;
  bpm?: {
    min: number;
    max: number;
  };
  key?: string;
  duration?: {
    min: number;
    max: number;
  };
  page?: number;
  limit?: number;
}

export interface SpliceSearchResponse {
  results: SpliceSoundBite[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SpliceSoundBiteProps {
  onDownload?: (soundBite: SpliceSoundBite) => void;
  onPreview?: (soundBite: SpliceSoundBite) => void;
}

// Audio file analysis interfaces
export interface AudioFileAnalysis {
  filePath: string;
  fileName: string;
  fileSize: number;
  duration?: number;
  sampleRate?: number;
  bitDepth?: number;
  channels?: number;
  format: string;
  analysis: {
    artist?: string;
    title?: string;
    genre?: string;
    mood?: string[];
    tags?: string[];
    description?: string;
    bpm?: number;
    key?: string;
    instruments?: string[];
    style?: string;
    energy?: 'low' | 'medium' | 'high';
    tempo?: 'slow' | 'medium' | 'fast';
    complexity?: 'simple' | 'moderate' | 'complex';
  };
  metadata: {
    originalFileName: string;
    packName?: string;
    packArtist?: string;
    category?: string;
    subcategory?: string;
    downloadDate?: string;
    fileHash?: string;
  };
  gptAnalysis?: {
    reasoning: string;
    confidence: number;
    additionalNotes?: string;
  };
}

export interface SpliceFileMetadata {
  [filePath: string]: AudioFileAnalysis;
}

export interface AudioAnalysisRequest {
  filePath: string;
  fileName: string;
  fileSize: number;
  audioData?: ArrayBuffer;
  enableWebSearch?: boolean;
}

export interface AudioAnalysisResponse {
  success: boolean;
  analysis?: AudioFileAnalysis;
  error?: string;
  debugInfo?: {
    processingTime: number;
    gptTokensUsed?: number;
    webSearchResults?: any;
  };
}