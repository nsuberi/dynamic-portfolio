import React from 'react';
import { PortfolioPiece } from '../types';
import './ListView.css';

interface ListViewProps {
  pieces: PortfolioPiece[];
  onPieceClick: (piece: PortfolioPiece) => void;
}

const ListView: React.FC<ListViewProps> = ({ pieces, onPieceClick }) => {
  const renderMedia = (piece: PortfolioPiece) => {
    switch (piece.type) {
      case 'image':
        return (
          <div className="list-media-container">
            <img 
              src={piece.url} 
              alt={piece.title} 
              className="list-media-image"
              onClick={() => onPieceClick(piece)}
            />
          </div>
        );
      case 'video':
        return (
          <div className="list-media-container">
            <video 
              className="list-media-video"
              onClick={() => onPieceClick(piece)}
            >
              <source src={piece.url} type="video/mp4" />
            </video>
            <div className="play-overlay" onClick={() => onPieceClick(piece)}>
              <div className="play-button">▶</div>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="list-media-container">
            <div 
              className="list-media-audio"
              onClick={() => onPieceClick(piece)}
            >
              <div className="audio-icon">♪</div>
              <div className="audio-title">{piece.title}</div>
            </div>
          </div>
        );
      case 'document':
        return (
          <div className="list-media-container">
            <div 
              className="list-media-document"
              onClick={() => onPieceClick(piece)}
            >
              <div className="document-icon">📄</div>
              <div className="document-preview">
                {piece.content?.substring(0, 150)}...
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderMetadata = (piece: PortfolioPiece) => {
    return (
      <div className="list-metadata">
        <div className="metadata-header">
          <h3 className="piece-title">{piece.title}</h3>
          <div className="piece-year-medium">
            <span className="piece-year">{piece.year}</span>
            <span className="separator">•</span>
            <span className="piece-medium">{piece.medium}</span>
          </div>
        </div>
        
        <p className="piece-description">{piece.description}</p>
        
        <div className="piece-tags">
          <div className="tag-group">
            <strong>Tags:</strong>
            <div className="tags">
              {piece.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
          <div className="tag-group">
            <strong>Mood:</strong>
            <div className="tags">
              {piece.mood.map((mood, index) => (
                <span key={index} className="tag mood-tag">{mood}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="list-view">
      <div className="list-header">
        <h2 className="list-title">All Portfolio Pieces</h2>
        <p className="list-count">{pieces.length} pieces</p>
      </div>
      
      <div className="list-container">
        {pieces.map((piece) => (
          <div key={piece.id} className="list-item">
            <div className="list-item-content">
              {renderMedia(piece)}
              {renderMetadata(piece)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListView;