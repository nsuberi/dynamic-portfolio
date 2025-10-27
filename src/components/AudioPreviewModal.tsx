import React, { useState, useRef, useEffect } from 'react';
import { SpliceSoundBite } from '../types';
import { createAudioDebugInfo, AudioDebugInfo } from '../utils/debugUtils';
import './AudioPreviewModal.css';

interface AudioPreviewModalProps {
  soundBite: SpliceSoundBite | null;
  isOpen: boolean;
  onClose: () => void;
}

const AudioPreviewModal: React.FC<AudioPreviewModalProps> = ({ soundBite, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<AudioDebugInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const updateDebugInfo = () => {
    if (audioRef.current && soundBite) {
      // Try to get the original file from the soundBite if possible
      const file = soundBite.originalFile || null;
      const debug = createAudioDebugInfo(file, audioRef.current);
      setDebugInfo(debug);
    }
  };

  const resetAudioState = () => {
    if (audioRef.current) {
      // Reset audio element state
      audioRef.current.currentTime = 0;
      audioRef.current.load(); // Reload the audio source
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioError(null);
      setIsLoading(false);
    }
  };

  const retryAudio = () => {
    if (audioRef.current && soundBite) {
      setAudioError(null);
      setIsLoading(true);
      
      // Force reload the audio source
      const currentSrc = audioRef.current.src;
      audioRef.current.src = '';
      audioRef.current.src = currentSrc;
      audioRef.current.load();
    }
  };

  useEffect(() => {
    if (audioRef.current && soundBite) {
      const audio = audioRef.current;
      
      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleDurationChange = () => setDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleError = () => {
        const error = audio.error;
        let errorMessage = 'Failed to load audio file.';
        
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Audio playback was aborted.';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error occurred while loading audio.';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Audio file format is not supported or corrupted.';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Audio format is not supported by this browser.';
              break;
            default:
              errorMessage = `Audio error: ${error.message}`;
          }
        }
        
        setAudioError(errorMessage);
        console.error('Audio error:', error);
        setIsLoading(false);
        setIsPlaying(false);
        updateDebugInfo();
      };
      const handleLoadStart = () => {
        setAudioError(null);
        setIsLoading(true);
      };
      const handleCanPlay = () => {
        setIsLoading(false);
        updateDebugInfo();
      };

      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('durationchange', handleDurationChange);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('canplay', handleCanPlay);

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('durationchange', handleDurationChange);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [soundBite]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update debug info when modal opens or soundBite changes
  useEffect(() => {
    if (isOpen && soundBite) {
      updateDebugInfo();
    }
  }, [isOpen, soundBite]);

  // Reset audio state when modal opens with a new soundBite
  useEffect(() => {
    if (isOpen && soundBite && audioRef.current) {
      // Reset the audio element state
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      setAudioError(null);
      setIsLoading(false);
      
      // Force reload the audio source
      const currentSrc = audioRef.current.src;
      audioRef.current.src = '';
      audioRef.current.src = currentSrc;
    }
  }, [isOpen, soundBite]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Clear any previous errors
        setAudioError(null);
        
        // Try to play - let the browser handle the ready state
        audioRef.current.play().catch(error => {
          console.error('Play failed:', error);
          setAudioError(`Failed to play audio: ${error.message}`);
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !soundBite) return null;

  return (
    <div className="audio-preview-modal-overlay" onClick={onClose}>
      <div className="audio-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{soundBite.title}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="track-info">
            <p className="artist">{soundBite.artist}</p>
            <p className="genre">{soundBite.genre}</p>
            {soundBite.bpm > 0 && <p className="bpm">BPM: {soundBite.bpm}</p>}
            {soundBite.key && <p className="key">Key: {soundBite.key}</p>}
          </div>

          <div className="audio-player">
            <audio
              ref={audioRef}
              src={soundBite.previewUrl || soundBite.downloadUrl}
              preload="metadata"
              crossOrigin="anonymous"
            />
            
            {audioError && (
              <div className="audio-error">
                <p>⚠️ {audioError}</p>
                <p className="debug-info">Source: {soundBite.previewUrl || soundBite.downloadUrl}</p>
                <p className="debug-info">URL type: {typeof (soundBite.previewUrl || soundBite.downloadUrl)}</p>
                <p className="debug-info">Starts with blob: {(soundBite.previewUrl || soundBite.downloadUrl).startsWith('blob:')}</p>
                <button className="retry-button" onClick={retryAudio}>
                  🔄 Retry
                </button>
              </div>
            )}
            
            <div className="player-controls">
              <button 
                className="play-pause-button" 
                onClick={togglePlayPause}
                disabled={isLoading}
              >
                {isLoading ? '⏳' : isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <button 
                className="reset-button" 
                onClick={resetAudioState}
                title="Reset audio to beginning"
              >
                🔄
              </button>
              
              <div className="time-info">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="progress-container">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="progress-bar"
              />
            </div>

            <div className="volume-container">
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-bar"
              />
            </div>
          </div>

          {soundBite.description && (
            <div className="track-description">
              <p>{soundBite.description}</p>
            </div>
          )}

          {soundBite.tags && soundBite.tags.length > 0 && (
            <div className="track-tags">
              {soundBite.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Debug Section */}
          <div className="debug-section">
            <div className="debug-header" onClick={() => setShowDebug(!showDebug)}>
              <h3 className="debug-title">Audio Debug Information</h3>
              <button className="debug-toggle-button">
                {showDebug ? '▼' : '▶'}
              </button>
            </div>
            
            {showDebug && (
              <>
                <div className="debug-notice">
                  <strong>Note:</strong> Sensitive data like API keys have been redacted for security.
                </div>
                
                {debugInfo && (
                  <>
                    <div className="debug-subsection">
                      <h4 className="debug-subtitle">File Information</h4>
                      <div className="debug-item">
                        <strong>File Name:</strong> {debugInfo.fileInfo.fileName}
                      </div>
                      <div className="debug-item">
                        <strong>File Size:</strong> {debugInfo.fileInfo.fileSize} bytes
                      </div>
                      <div className="debug-item">
                        <strong>File Type:</strong> {debugInfo.fileInfo.fileType}
                      </div>
                      <div className="debug-item">
                        <strong>File Path:</strong> {debugInfo.fileInfo.filePath}
                      </div>
                      {debugInfo.fileInfo.objectUrl && (
                        <div className="debug-item">
                          <strong>Object URL:</strong> {debugInfo.fileInfo.objectUrl}
                        </div>
                      )}
                    </div>

                    <div className="debug-subsection">
                      <h4 className="debug-subtitle">Audio Element State</h4>
                      <div className="debug-item">
                        <strong>Source:</strong> {debugInfo.audioElement.src}
                      </div>
                      <div className="debug-item">
                        <strong>Ready State:</strong> {debugInfo.audioElement.readyState} ({getReadyStateText(debugInfo.audioElement.readyState)})
                      </div>
                      <div className="debug-item">
                        <strong>Network State:</strong> {debugInfo.audioElement.networkState} ({getNetworkStateText(debugInfo.audioElement.networkState)})
                      </div>
                      <div className="debug-item">
                        <strong>Duration:</strong> {debugInfo.audioElement.duration} seconds
                      </div>
                      <div className="debug-item">
                        <strong>Current Time:</strong> {debugInfo.audioElement.currentTime} seconds
                      </div>
                      <div className="debug-item">
                        <strong>Volume:</strong> {debugInfo.audioElement.volume}
                      </div>
                      <div className="debug-item">
                        <strong>Muted:</strong> {debugInfo.audioElement.muted ? 'Yes' : 'No'}
                      </div>
                      <div className="debug-item">
                        <strong>Paused:</strong> {debugInfo.audioElement.paused ? 'Yes' : 'No'}
                      </div>
                      <div className="debug-item">
                        <strong>Ended:</strong> {debugInfo.audioElement.ended ? 'Yes' : 'No'}
                      </div>
                      {debugInfo.audioElement.error && (
                        <div className="debug-item">
                          <strong>Error:</strong> {debugInfo.audioElement.error.code} - {debugInfo.audioElement.error.message}
                        </div>
                      )}
                    </div>

                    <div className="debug-subsection">
                      <h4 className="debug-subtitle">Browser Audio Support</h4>
                      <div className="debug-item">
                        <strong>MP3:</strong> {debugInfo.browserInfo.audioSupport.mp3 ? 'Supported' : 'Not Supported'}
                      </div>
                      <div className="debug-item">
                        <strong>WAV:</strong> {debugInfo.browserInfo.audioSupport.wav ? 'Supported' : 'Not Supported'}
                      </div>
                      <div className="debug-item">
                        <strong>OGG:</strong> {debugInfo.browserInfo.audioSupport.ogg ? 'Supported' : 'Not Supported'}
                      </div>
                      <div className="debug-item">
                        <strong>AAC:</strong> {debugInfo.browserInfo.audioSupport.aac ? 'Supported' : 'Not Supported'}
                      </div>
                      <div className="debug-item">
                        <strong>M4A:</strong> {debugInfo.browserInfo.audioSupport.m4a ? 'Supported' : 'Not Supported'}
                      </div>
                    </div>

                    <div className="debug-subsection">
                      <h4 className="debug-subtitle">Browser Information</h4>
                      <div className="debug-item">
                        <strong>User Agent:</strong>
                        <pre className="debug-json">{debugInfo.browserInfo.userAgent}</pre>
                      </div>
                    </div>

                    {debugInfo.requestResponse && (
                      <>
                        <div className="debug-subsection">
                          <h4 className="debug-subtitle">Request Details</h4>
                          <div className="debug-item">
                            <strong>Request:</strong>
                            <pre className="debug-json">{JSON.stringify(debugInfo.requestResponse.request, null, 2)}</pre>
                          </div>
                        </div>

                        <div className="debug-subsection">
                          <h4 className="debug-subtitle">Response Details</h4>
                          <div className="debug-item">
                            <strong>Response:</strong>
                            <pre className="debug-json">{JSON.stringify(debugInfo.requestResponse.response, null, 2)}</pre>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for debug display
function getReadyStateText(readyState: number): string {
  const states = [
    'HAVE_NOTHING',
    'HAVE_METADATA', 
    'HAVE_CURRENT_DATA',
    'HAVE_FUTURE_DATA',
    'HAVE_ENOUGH_DATA'
  ];
  return states[readyState] || 'UNKNOWN';
}

function getNetworkStateText(networkState: number): string {
  const states = [
    'NETWORK_EMPTY',
    'NETWORK_IDLE',
    'NETWORK_LOADING',
    'NETWORK_NO_SOURCE'
  ];
  return states[networkState] || 'UNKNOWN';
}

export default AudioPreviewModal;