import React, { useState, useCallback } from 'react';
import { PortfolioPiece, OpenAIResponseWithDebug } from '../types';
import { OpenAIService } from '../services/openaiService';
import Gallery from './Gallery';
import ListView from './ListView';
import Modal from './Modal';
import './DynamicPortfolio.css';

interface DynamicPortfolioProps {
  allPieces: PortfolioPiece[];
}

type ViewMode = 'gallery' | 'list';

const DynamicPortfolio: React.FC<DynamicPortfolioProps> = ({ allPieces }) => {
  const [userRequest, setUserRequest] = useState('');
  const [selectedPieces, setSelectedPieces] = useState<PortfolioPiece[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openaiResponse, setOpenaiResponse] = useState<OpenAIResponseWithDebug | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<PortfolioPiece | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');
  const [isDebugExpanded, setIsDebugExpanded] = useState(false);

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
      setOpenaiResponse(response);
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

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleDebugToggle = useCallback(() => {
    setIsDebugExpanded(prev => !prev);
  }, []);

  return (
    <div className="dynamic-portfolio">
      <div className="portfolio-controls">
        <div className="view-switcher">
          <button
            className={`view-button ${viewMode === 'gallery' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('gallery')}
          >
            Gallery View
          </button>
          <button
            className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => handleViewModeChange('list')}
          >
            List View
          </button>
        </div>

        {viewMode === 'gallery' && (
          <>
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
                <div className="debug-header" onClick={handleDebugToggle}>
                  <h3 className="debug-title">OpenAI Debug Information</h3>
                  <button className="debug-toggle-button">
                    {isDebugExpanded ? '▼' : '▶'}
                  </button>
                </div>
                
                {isDebugExpanded && (
                  <>
                    <div className="debug-notice">
                      <strong>Note:</strong> Sensitive data like API keys have been redacted for security.
                    </div>
                    
                    {openaiResponse.debugInfo && (
                      <>
                        <div className="debug-subsection">
                          <h4 className="debug-subtitle">Request Sent to OpenAI</h4>
                          <div className="debug-item">
                            <strong>URL:</strong> {openaiResponse.debugInfo.request.url}
                          </div>
                          <div className="debug-item">
                            <strong>Method:</strong> {openaiResponse.debugInfo.request.method}
                          </div>
                          <div className="debug-item">
                            <strong>Headers:</strong>
                            <pre className="debug-json">{JSON.stringify(openaiResponse.debugInfo.request.headers, null, 2)}</pre>
                          </div>
                          <div className="debug-item">
                            <strong>Request Body:</strong>
                            <pre className="debug-json">{JSON.stringify(openaiResponse.debugInfo.request.body, null, 2)}</pre>
                          </div>
                        </div>

                        <div className="debug-subsection">
                          <h4 className="debug-subtitle">Response from OpenAI</h4>
                          <div className="debug-item">
                            <strong>Status:</strong> {openaiResponse.debugInfo.response.status} {openaiResponse.debugInfo.response.statusText}
                          </div>
                          <div className="debug-item">
                            <strong>Response Headers:</strong>
                            <pre className="debug-json">{JSON.stringify(openaiResponse.debugInfo.response.headers, null, 2)}</pre>
                          </div>
                          <div className="debug-item">
                            <strong>Response Body:</strong>
                            <pre className="debug-json">{JSON.stringify(openaiResponse.debugInfo.response.body, null, 2)}</pre>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="debug-subsection">
                      <h4 className="debug-subtitle">Parsed Response</h4>
                      <pre className="debug-json">{JSON.stringify({
                        selectedIds: openaiResponse.selectedIds,
                        reasoning: openaiResponse.reasoning
                      }, null, 2)}</pre>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {viewMode === 'gallery' && selectedPieces.length > 0 && (
        <div className="gallery-section">
          <h2 className="gallery-title">
            Curated Selection ({selectedPieces.length} pieces)
          </h2>
          <Gallery pieces={selectedPieces} onPieceClick={handlePieceClick} />
        </div>
      )}

      {viewMode === 'list' && (
        <ListView pieces={allPieces} onPieceClick={handlePieceClick} />
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