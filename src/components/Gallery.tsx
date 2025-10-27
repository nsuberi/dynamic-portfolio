import React from 'react';
import Masonry from 'react-masonry-css';
import { GalleryProps } from '../types';
import './Gallery.css';

const Gallery: React.FC<GalleryProps> = ({ pieces, onPieceClick }) => {
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  const renderPiece = (piece: any) => {
    const handleClick = () => {
      if (piece.type === 'audio') {
        // For audio, play directly instead of opening modal
        const audio = new Audio(piece.url);
        audio.play().catch(console.error);
      } else {
        onPieceClick(piece);
      }
    };

    return (
      <div
        key={piece.id}
        className={`gallery-item ${piece.size} ${piece.type}`}
        onClick={handleClick}
      >
        <div className="gallery-item-content">
          {piece.type === 'image' && (
            <div className="image-container">
              <img src={piece.url} alt={piece.title} />
              <div className="overlay">
                <h3 className="piece-title">{piece.title}</h3>
                <p className="piece-year">{piece.year}</p>
              </div>
            </div>
          )}
          
          {piece.type === 'video' && (
            <div className="video-container">
              <video>
                <source src={piece.url} type="video/mp4" />
              </video>
              <div className="play-button">▶</div>
              <div className="overlay">
                <h3 className="piece-title">{piece.title}</h3>
                <p className="piece-year">{piece.year}</p>
              </div>
            </div>
          )}
          
          {piece.type === 'audio' && (
            <div className="audio-container">
              <div className="audio-icon">♪</div>
              <div className="overlay">
                <h3 className="piece-title">{piece.title}</h3>
                <p className="piece-year">{piece.year}</p>
                <p className="play-hint">Click to play</p>
              </div>
            </div>
          )}
          
          {piece.type === 'document' && (
            <div className="document-container">
              <div className="document-icon">📄</div>
              <div className="overlay">
                <h3 className="piece-title">{piece.title}</h3>
                <p className="piece-year">{piece.year}</p>
                <p className="document-preview">{piece.content?.substring(0, 100)}...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="gallery-container">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {pieces.map(renderPiece)}
      </Masonry>
    </div>
  );
};

export default Gallery;