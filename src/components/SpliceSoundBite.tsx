import React, { useState, useCallback, useRef } from 'react';
import { SpliceSoundBiteProps, AudioFileAnalysis, AudioAnalysisRequest } from '../types';
import { OpenAIService } from '../services/openaiService';
import { SpliceMetadataService } from '../services/spliceMetadataService';
import './SpliceSoundBite.css';

const SpliceSoundBite: React.FC<SpliceSoundBiteProps> = ({ onDownload, onPreview }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [analyses, setAnalyses] = useState<AudioFileAnalysis[]>([]);
  const [fileMap, setFileMap] = useState<Map<string, File>>(new Map());
  const [objectUrls, setObjectUrls] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebug, setShowDebug] = useState<string | null>(null); // null or filePath for individual cards
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openaiService = OpenAIService.getInstance();
  const metadataService = SpliceMetadataService.getInstance();

  // Load existing analyses on component mount
  React.useEffect(() => {
    setAnalyses(metadataService.getAllAnalyses());
  }, []);

  // Cleanup object URLs on component unmount
  React.useEffect(() => {
    return () => {
      // Cleanup all stored object URLs
      objectUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [objectUrls]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(0);
    setDebugInfo(null);

    const totalFiles = files.length;
    const newAnalyses: AudioFileAnalysis[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file.name);
        setAnalysisProgress((i / totalFiles) * 100);

        // Store the file object for later use
        const fileKey = file.webkitRelativePath || file.name;
        console.log('Storing file:', fileKey, 'Type:', file.type, 'Size:', file.size);
        setFileMap(prev => new Map(prev).set(fileKey, file));

        // Check if we already have analysis for this file
        const existingAnalysis = metadataService.getAnalysis(fileKey);
        if (existingAnalysis) {
          newAnalyses.push(existingAnalysis);
          continue;
        }

        // Create analysis request
        const request: AudioAnalysisRequest = {
          filePath: file.webkitRelativePath || file.name,
          fileName: file.name,
          fileSize: file.size,
          enableWebSearch: true
        };

        // Analyze the file
        const response = await openaiService.analyzeAudioFile(request);
        
        if (response.success && response.analysis) {
          // Save to metadata service
          metadataService.addAnalysis(response.analysis);
          newAnalyses.push(response.analysis);
          
          // Store debug info for the last file
          if (i === totalFiles - 1) {
            setDebugInfo(response.debugInfo);
          }
        } else {
          console.error(`Failed to analyze ${file.name}:`, response.error);
        }
      }

      setAnalyses(metadataService.getAllAnalyses());
      setAnalysisProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setCurrentFile('');
    }
  }, [openaiService, metadataService]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = metadataService.searchAnalyses(query);
      setAnalyses(results);
    } else {
      setAnalyses(metadataService.getAllAnalyses());
    }
  }, [metadataService]);

  const handleGenreFilter = useCallback((genre: string) => {
    setSelectedGenre(genre);
    let filtered = metadataService.getAllAnalyses();
    
    if (genre) {
      filtered = metadataService.filterByGenre(genre);
    }
    
    if (selectedMood) {
      filtered = filtered.filter(analysis => 
        analysis.analysis.mood?.some(mood => mood.toLowerCase() === selectedMood.toLowerCase())
      );
    }
    
    setAnalyses(filtered);
  }, [metadataService, selectedMood]);

  const handleMoodFilter = useCallback((mood: string) => {
    setSelectedMood(mood);
    let filtered = metadataService.getAllAnalyses();
    
    if (mood) {
      filtered = metadataService.filterByMood(mood);
    }
    
    if (selectedGenre) {
      filtered = filtered.filter(analysis => 
        analysis.analysis.genre?.toLowerCase() === selectedGenre.toLowerCase()
      );
    }
    
    setAnalyses(filtered);
  }, [metadataService, selectedGenre]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedGenre('');
    setSelectedMood('');
    setAnalyses(metadataService.getAllAnalyses());
  }, [metadataService]);

  const handleDownload = useCallback((analysis: AudioFileAnalysis) => {
    if (onDownload) {
      // Get the actual file object
      const file = fileMap.get(analysis.filePath);
      const fileUrl = file ? URL.createObjectURL(file) : analysis.filePath;
      
      // Store the object URL for cleanup
      if (file && fileUrl.startsWith('blob:')) {
        setObjectUrls(prev => new Set(prev).add(fileUrl));
      }
      
      // Convert AudioFileAnalysis to SpliceSoundBite format
      const soundBite = {
        id: analysis.filePath,
        title: analysis.analysis.title || analysis.fileName,
        artist: analysis.analysis.artist || analysis.metadata.packArtist || 'Unknown',
        genre: analysis.analysis.genre || 'Unknown',
        bpm: analysis.analysis.bpm || 0,
        key: analysis.analysis.key || 'Unknown',
        duration: analysis.duration || 0,
        previewUrl: fileUrl,
        downloadUrl: fileUrl,
        tags: analysis.analysis.tags || [],
        mood: analysis.analysis.mood || [],
        description: analysis.analysis.description || '',
        waveformUrl: undefined,
        coverArtUrl: undefined,
        originalFile: file
      };
      onDownload(soundBite);
    }
  }, [onDownload, fileMap]);

  const handlePreview = useCallback((analysis: AudioFileAnalysis) => {
    if (onPreview) {
      // Get the actual file object
      const file = fileMap.get(analysis.filePath);
      const fileUrl = file ? URL.createObjectURL(file) : analysis.filePath;
      
      // Store the object URL for cleanup
      if (file && fileUrl.startsWith('blob:')) {
        setObjectUrls(prev => new Set(prev).add(fileUrl));
      }
      
      console.log('Preview - File found:', !!file);
      console.log('Preview - File URL:', fileUrl);
      console.log('Preview - File type:', file?.type);
      console.log('Preview - File size:', file?.size);
      
      const soundBite = {
        id: analysis.filePath,
        title: analysis.analysis.title || analysis.fileName,
        artist: analysis.analysis.artist || analysis.metadata.packArtist || 'Unknown',
        genre: analysis.analysis.genre || 'Unknown',
        bpm: analysis.analysis.bpm || 0,
        key: analysis.analysis.key || 'Unknown',
        duration: analysis.duration || 0,
        previewUrl: fileUrl,
        downloadUrl: fileUrl,
        tags: analysis.analysis.tags || [],
        mood: analysis.analysis.mood || [],
        description: analysis.analysis.description || '',
        waveformUrl: undefined,
        coverArtUrl: undefined,
        // Add the original file for debug purposes
        originalFile: file
      };
      onPreview(soundBite);
    }
  }, [onPreview, fileMap]);

  const stats = metadataService.getStats();
  const uniqueGenres = metadataService.getUniqueGenres();
  const uniqueMoods = metadataService.getUniqueMoods();

  return (
    <div className="splice-sound-bite">
      <div className="splice-header">
        <h2>Splice Sound Analysis</h2>
        <p>Upload audio files from Splice to analyze and organize your sound library</p>
        
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{stats.totalFiles}</span>
            <span className="stat-label">Files Analyzed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.genres}</span>
            <span className="stat-label">Genres</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.moods}</span>
            <span className="stat-label">Moods</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.packs}</span>
            <span className="stat-label">Packs</span>
          </div>
        </div>
      </div>

      <div className="upload-section">
        <div className="file-input-container">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            onChange={handleFileSelect}
            className="file-input"
            id="audio-file-input"
          />
          <label htmlFor="audio-file-input" className="file-input-label">
            {isAnalyzing ? 'Analyzing...' : 'Select Audio Files'}
          </label>
        </div>

        {isAnalyzing && (
          <div className="analysis-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <p className="progress-text">
              Analyzing {currentFile}... ({Math.round(analysisProgress)}%)
            </p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <div className="search-and-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search files, artists, genres, tags..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters-container">
          <button 
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {showFilters ? '▲' : '▼'}
          </button>

          {showFilters && (
            <div className="filters">
              <div className="filter-group">
                <label>Genre:</label>
                <select 
                  value={selectedGenre} 
                  onChange={(e) => handleGenreFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Genres</option>
                  {uniqueGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Mood:</label>
                <select 
                  value={selectedMood} 
                  onChange={(e) => handleMoodFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Moods</option>
                  {uniqueMoods.map(mood => (
                    <option key={mood} value={mood}>{mood}</option>
                  ))}
                </select>
              </div>

              <button 
                className="clear-filters"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {debugInfo && (
        <div className="debug-section">
          <button 
            className="debug-toggle"
            onClick={() => setShowDebug(showDebug === 'main' ? null : 'main')}
          >
            Debug Info {showDebug === 'main' ? '▲' : '▼'}
          </button>
          {showDebug === 'main' && (
            <div className="debug-content">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      <div className="analyses-grid">
        {analyses.map((analysis) => (
          <div key={analysis.filePath} className="analysis-card">
            <div className="analysis-header">
              <h3 className="analysis-title">
                {analysis.analysis.title || analysis.fileName}
              </h3>
              <p className="analysis-artist">
                {analysis.analysis.artist || analysis.metadata.packArtist || 'Unknown Artist'}
              </p>
            </div>

            <div className="analysis-details">
              <div className="detail-row">
                <span className="detail-label">Genre:</span>
                <span className="detail-value">{analysis.analysis.genre || 'Unknown'}</span>
              </div>
              
              {analysis.analysis.bpm && (
                <div className="detail-row">
                  <span className="detail-label">BPM:</span>
                  <span className="detail-value">{analysis.analysis.bpm}</span>
                </div>
              )}
              
              {analysis.analysis.key && (
                <div className="detail-row">
                  <span className="detail-label">Key:</span>
                  <span className="detail-value">{analysis.analysis.key}</span>
                </div>
              )}

              {analysis.analysis.mood && analysis.analysis.mood.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Mood:</span>
                  <div className="mood-tags">
                    {analysis.analysis.mood.map((mood, index) => (
                      <span key={index} className="mood-tag">{mood}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.analysis.tags && analysis.analysis.tags.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Tags:</span>
                  <div className="tag-list">
                    {analysis.analysis.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {analysis.analysis.description && (
                <div className="detail-row">
                  <span className="detail-label">Description:</span>
                  <p className="analysis-description">{analysis.analysis.description}</p>
                </div>
              )}

              {analysis.metadata.packName && (
                <div className="detail-row">
                  <span className="detail-label">Pack:</span>
                  <span className="detail-value">{analysis.metadata.packName}</span>
                </div>
              )}
            </div>

            <div className="analysis-actions">
              <button 
                className="action-button preview"
                onClick={() => handlePreview(analysis)}
              >
                Preview
              </button>
              <button 
                className="action-button download"
                onClick={() => handleDownload(analysis)}
              >
                Download
              </button>
            </div>

            {analysis.gptAnalysis && (
              <div className="gpt-analysis">
                <h4>AI Analysis</h4>
                <p className="gpt-reasoning">{analysis.gptAnalysis.reasoning}</p>
                <div className="confidence-bar">
                  <span>Confidence: {Math.round(analysis.gptAnalysis.confidence * 100)}%</span>
                  <div className="confidence-fill" style={{ width: `${analysis.gptAnalysis.confidence * 100}%` }} />
                </div>
              </div>
            )}

            {/* Debug section for each card */}
            <div className="card-debug-section">
              <button 
                className="card-debug-toggle"
                onClick={() => {
                  const newShowDebug = analysis.filePath === showDebug ? null : analysis.filePath;
                  setShowDebug(newShowDebug);
                }}
              >
                Debug {showDebug === analysis.filePath ? '▲' : '▼'}
              </button>
              {showDebug === analysis.filePath && (
                <div className="card-debug-content">
                  <div className="debug-item">
                    <strong>File Path:</strong> {analysis.filePath}
                  </div>
                  <div className="debug-item">
                    <strong>File Name:</strong> {analysis.fileName}
                  </div>
                  <div className="debug-item">
                    <strong>Duration:</strong> {analysis.duration} seconds
                  </div>
                  <div className="debug-item">
                    <strong>File Size:</strong> {fileMap.get(analysis.filePath)?.size || 'Unknown'} bytes
                  </div>
                  <div className="debug-item">
                    <strong>File Type:</strong> {fileMap.get(analysis.filePath)?.type || 'Unknown'}
                  </div>
                  <div className="debug-item">
                    <strong>Analysis Status:</strong> {analysis.analysis ? 'Complete' : 'Incomplete'}
                  </div>
                  {analysis.analysis && (
                    <div className="debug-item">
                      <strong>Analysis Data:</strong>
                      <pre className="debug-json">{JSON.stringify(analysis.analysis, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {analyses.length === 0 && !isAnalyzing && (
        <div className="empty-state">
          <p>No audio files analyzed yet. Upload some files to get started!</p>
        </div>
      )}
    </div>
  );
};

export default SpliceSoundBite;