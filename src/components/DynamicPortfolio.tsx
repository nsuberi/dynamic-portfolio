import React, { useState, useCallback } from 'react';
import { PortfolioPiece } from '../types';
import { OpenAIService } from '../services/openaiService';
import Gallery from './Gallery';
import Modal from './Modal';
import './DynamicPortfolio.css';

interface DynamicPortfolioProps {
  allPieces: PortfolioPiece[];
}

const DynamicPortfolio: React.FC<DynamicPortfolioProps> = ({ allPieces }) => {
  const [userRequest, setUserRequest] = useState('');
  const [selectedPieces, setSelectedPieces] = useState<PortfolioPiece[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openaiResponse, setOpenaiResponse] = useState<string | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<PortfolioPiece | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!userRequest.trim()) {
      setError('Please enter a description of what you want to convey');
      return;
    }

    setIsLoading(true);
    setError(null);
    setOpenaiResponse(null);

    try {
      const openaiService = OpenAIService.getInstance();
      const response = await openaiService.selectPortfolioPieces(userRequest, allPieces);
      
      // Filter pieces based on selected IDs
      const filteredPieces = allPieces.filter(piece => 
        response.selectedIds.includes(piece.id)
      );
      
      setSelectedPieces(filteredPieces);
      setOpenaiResponse(JSON.stringify(response, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing your request');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userRequest, allPieces]);

  const handlePieceClick = useCallback((piece: PortfolioPiece) => {
    setSelectedPiece(piece);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPiece(null);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="dynamic-portfolio">
      <div className="portfolio-controls">
        <div className="input-section">
          <label htmlFor="user-request" className="input-label">
            Describe the feeling or message you want to convey:
          </label>
          <textarea
            id="user-request"
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="e.g., 'contemplative urban landscapes' or 'energetic experimental pieces'"
            className="request-input"
            rows={3}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !userRequest.trim()}
            className="submit-button"
          >
            {isLoading ? 'Curating...' : 'Curate Portfolio'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {openaiResponse && (
          <div className="debug-section">
            <h3 className="debug-title">OpenAI Response (Debug)</h3>
            <pre className="debug-content">{openaiResponse}</pre>
          </div>
        )}
      </div>

      {selectedPieces.length > 0 && (
        <div className="gallery-section">
          <h2 className="gallery-title">
            Curated Selection ({selectedPieces.length} pieces)
          </h2>
          <Gallery pieces={selectedPieces} onPieceClick={handlePieceClick} />
        </div>
      )}

      <Modal
        piece={selectedPiece}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default DynamicPortfolio;