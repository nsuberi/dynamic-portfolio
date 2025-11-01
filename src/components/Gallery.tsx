import React, { useMemo } from 'react';
import { GalleryProps, PortfolioPiece } from '../types';
import './Gallery.css';

const Gallery: React.FC<GalleryProps> = ({ pieces, onPieceClick }) => {
  // Helper function to detect if an image is horizontal (landscape orientation)
  // Checks URL patterns or uses heuristic based on size
  const isHorizontalImage = (piece: PortfolioPiece): boolean => {
    if (piece.type !== 'image' && piece.type !== 'video') return false;
    
    // Check URL for common horizontal aspect ratio indicators
    if (piece.url) {
      // Check for common horizontal ratios in URLs (e.g., 800x600, 1200x800)
      const urlMatch = piece.url.match(/(\d+)x(\d+)/);
      if (urlMatch) {
        const width = parseInt(urlMatch[1]);
        const height = parseInt(urlMatch[2]);
        if (width > height * 1.2) return true; // Aspect ratio > 1.2:1
      }
      
      // Check for horizontal keywords in URL
      const horizontalKeywords = ['landscape', 'wide', 'horizontal', 'panorama'];
      if (horizontalKeywords.some(keyword => piece.url?.toLowerCase().includes(keyword))) {
        return true;
      }
    }
    
    // Heuristic: Large images are more likely to be horizontal
    // Medium and large pieces can span columns if they're images
    return piece.size === 'large' || piece.size === 'medium';
  };

  // Art-wall gallery layout algorithm
  // Implements salon-style gallery wall with aesthetic principles:
  // - Visual weight balance (large pieces offset by smaller ones)
  // - Consistent spacing (2-3 inches / 5-7.5cm between pieces)
  // - Alignment anchors (top alignment for columns 1-3)
  // - Clear hierarchy with focal point at center
  // - Generous white space (60% art, 40% white space)
  // - Column-spanning for horizontal images
  const layout = useMemo(() => {
    if (pieces.length === 0) return { items: [], focalPiece: null };

    // Find the focal piece - largest/most striking piece as visual anchor
    // Art-wall principle: Focal piece should be largest/boldest, placed at center
    const focalPiece = pieces.find(p => p.size === 'large' && p.type === 'image') 
      || pieces.find(p => p.size === 'large')
      || pieces[Math.floor(pieces.length / 2)];

    const otherPieces = pieces.filter(p => p.id !== focalPiece.id);
    
    // 4 columns for desktop (responsive via CSS)
    const numColumns = 4;
    
    // Standard heights for each size (creates alignment points)
    const standardHeights = {
      small: 200,
      medium: 320,
      large: 420
    };

    // Visual weight values for balance calculation
    const visualWeights = {
      small: 1,
      medium: 2,
      large: 4
    };

    // Grid-based layout: track which grid positions are occupied
    // Each item gets: { piece, column, span, height }
    interface GridItem {
      piece: PortfolioPiece;
      column: number; // Starting column (0-3)
      span: number; // Column span (1 or 2)
      height: number;
    }

    const gridItems: GridItem[] = [];
    const columnHeights: number[] = Array(numColumns).fill(0);
    const columnWeights: number[] = Array(numColumns).fill(0);
    
    // Place focal piece - can span columns if horizontal
    const focalIsHorizontal = isHorizontalImage(focalPiece);
    const focalColumnIndex = focalIsHorizontal ? 1 : 1; // Center-left for spanning, center for single
    const focalSpan = focalIsHorizontal ? 2 : 1;
    const focalHeight = 680;
    
    gridItems.push({
      piece: focalPiece,
      column: focalColumnIndex,
      span: focalSpan,
      height: focalHeight
    });
    
    // Update column heights for focal piece
    for (let i = 0; i < focalSpan; i++) {
      const colIdx = focalColumnIndex + i;
      if (colIdx < numColumns) {
        columnHeights[colIdx] = Math.max(columnHeights[colIdx], focalHeight);
        columnWeights[colIdx] += visualWeights.large * 2 / focalSpan; // Distribute weight
      }
    }

    // Sort other pieces by size for strategic distribution
    const sortedPieces = [...otherPieces].sort((a, b) => {
      const sizeOrder = { large: 3, medium: 2, small: 1 };
      return sizeOrder[b.size] - sizeOrder[a.size];
    });

    // Distribute pieces with visual weight balance
    sortedPieces.forEach((piece) => {
      const pieceWeight = visualWeights[piece.size];
      const pieceHeight = standardHeights[piece.size];
      const isHorizontal = isHorizontalImage(piece);
      const span = isHorizontal ? 2 : 1;
      
      // Find best column considering both height and visual weight balance
      let bestColumnIndex = 0;
      let bestScore = Infinity;
      
      // For spanning items, we can only place them where there's room
      const maxStartColumn = numColumns - span;
      
      // Check aligned columns first (0, 1, 2) for top alignment
      for (let i = 0; i <= Math.min(2, maxStartColumn); i++) {
        // Calculate average height/weight across spanned columns
        let avgHeight = 0;
        let avgWeight = 0;
        for (let j = 0; j < span; j++) {
          if (i + j < numColumns) {
            avgHeight += columnHeights[i + j];
            avgWeight += columnWeights[i + j];
          }
        }
        avgHeight /= span;
        avgWeight /= span;
        
        const heightScore = avgHeight;
        const weightScore = avgWeight * 30; // Reduced weight factor
        const totalScore = heightScore + weightScore;
        
        if (totalScore < bestScore) {
          bestScore = totalScore;
          bestColumnIndex = i;
        }
      }
      
      // Consider offset column (3) only if significantly shorter/lighter
      if (span === 1 && maxStartColumn >= 3) {
        const offsetHeightScore = columnHeights[3];
        const offsetWeightScore = columnWeights[3] * 30;
        const offsetTotalScore = offsetHeightScore + offsetWeightScore;
        
        if (offsetTotalScore < bestScore - 150) {
          bestColumnIndex = 3;
        }
      }

      // Add to grid
      gridItems.push({
        piece,
        column: bestColumnIndex,
        span,
        height: pieceHeight
      });
      
      // Update column heights
      for (let i = 0; i < span; i++) {
        const colIdx = bestColumnIndex + i;
        if (colIdx < numColumns) {
          columnHeights[colIdx] += pieceHeight;
          columnWeights[colIdx] += pieceWeight / span; // Distribute weight across spanned columns
        }
      }
    });

    // Sort grid items by column, then by height to maintain visual flow
    gridItems.sort((a, b) => {
      if (a.column !== b.column) return a.column - b.column;
      return 0; // Keep order within column
    });

    return { items: gridItems, focalPiece };
  }, [pieces]);

  const renderPiece = (item: { piece: PortfolioPiece; column: number; span: number }) => {
    const { piece, span } = item;
    const handleClick = () => {
      if (piece.type === 'audio') {
        // For audio, play directly instead of opening modal
        const audio = new Audio(piece.url);
        audio.play().catch(console.error);
      } else {
        onPieceClick(piece);
      }
    };

    const isHorizontal = span > 1;

    return (
      <div
        key={piece.id}
        className={`gallery-item ${piece.size} ${piece.type} ${
          piece.id === layout.focalPiece?.id ? 'focal-piece' : ''
        } ${isHorizontal ? 'span-columns' : ''}`}
        style={{
          gridColumn: `span ${span}`,
        }}
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
      <div className="art-wall-grid">
        {layout.items.map((item) => renderPiece(item))}
      </div>
    </div>
  );
};

export default Gallery;