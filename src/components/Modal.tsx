import React from 'react';
import { ModalProps } from '../types';
import './Modal.css';

const Modal: React.FC<ModalProps> = ({ piece, isOpen, onClose }) => {
  if (!isOpen || !piece) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderContent = () => {
    switch (piece.type) {
      case 'image':
        return (
          <div className="modal-image-container">
            <img src={piece.url} alt={piece.title} className="modal-image" />
          </div>
        );
      case 'video':
        return (
          <div className="modal-video-container">
            <video controls className="modal-video">
              <source src={piece.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className="modal-audio-container">
            <audio controls className="modal-audio">
              <source src={piece.url} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        );
      case 'document':
        return (
          <div className="modal-document-container">
            <div className="modal-document-content">
              {piece.content}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <div className="modal-header">
          <h2 className="modal-title">{piece.title}</h2>
          <p className="modal-meta">
            {piece.year} • {piece.medium}
          </p>
        </div>
        <div className="modal-body">
          {renderContent()}
          <div className="modal-description">
            <p>{piece.description}</p>
            <div className="modal-tags">
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
        </div>
      </div>
    </div>
  );
};

export default Modal;