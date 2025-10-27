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

export interface GalleryProps {
  pieces: PortfolioPiece[];
  onPieceClick: (piece: PortfolioPiece) => void;
}

export interface ModalProps {
  piece: PortfolioPiece | null;
  isOpen: boolean;
  onClose: () => void;
}