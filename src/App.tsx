import React, { useState } from 'react';
import DynamicPortfolio from './components/DynamicPortfolio';
import SpliceSoundBiteComponent from './components/SpliceSoundBite';
import AppleNotes from './components/AppleNotes';
import AudioPreviewModal from './components/AudioPreviewModal';
import { samplePortfolioData } from './data/sampleData';
import { allAudienceData, audienceDataMap } from './data/audienceSampleData';
import { SpliceSoundBite } from './types';
import './App.css';

type AppSection = 'portfolio' | 'splice' | 'notes';
type AudienceType = 'all' | 'radio-broadcasting' | 'film-industry' | 'arts-literature' | 'corporate-strategy';

function App() {
  const [currentSection, setCurrentSection] = useState<AppSection>('portfolio');
  const [selectedAudience, setSelectedAudience] = useState<AudienceType>('all');
  const [previewSoundBite, setPreviewSoundBite] = useState<SpliceSoundBite | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Get the appropriate portfolio data based on selected audience
  const getPortfolioData = () => {
    if (selectedAudience === 'all') {
      return allAudienceData;
    }
    return audienceDataMap[selectedAudience] || samplePortfolioData;
  };

  const handleDownload = (soundBite: SpliceSoundBite) => {
    try {
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = soundBite.downloadUrl;
      link.download = `${soundBite.title} - ${soundBite.artist}.${soundBite.downloadUrl.split('.').pop() || 'mp3'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Downloaded sound bite:', soundBite);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handlePreview = (soundBite: SpliceSoundBite) => {
    setPreviewSoundBite(soundBite);
    setIsPreviewOpen(true);
    console.log('Previewing sound bite:', soundBite);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewSoundBite(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">Dynamic Portfolio</h1>
        <p className="app-description">
          AI-powered portfolio curation that adapts to your vision. 
          Describe the feeling or message you want to convey, and watch as 
          intelligent algorithms curate the perfect selection of your work.
        </p>
        
        <nav className="app-navigation">
          <button 
            className={`nav-button ${currentSection === 'portfolio' ? 'active' : ''}`}
            onClick={() => setCurrentSection('portfolio')}
          >
            Portfolio
          </button>
          <button 
            className={`nav-button ${currentSection === 'splice' ? 'active' : ''}`}
            onClick={() => setCurrentSection('splice')}
          >
            Splice Sounds
          </button>
          <button 
            className={`nav-button ${currentSection === 'notes' ? 'active' : ''}`}
            onClick={() => setCurrentSection('notes')}
          >
            Apple Notes
          </button>
        </nav>

        {currentSection === 'portfolio' && (
          <div className="audience-selector">
            <label htmlFor="audience-select">Select Portfolio Audience:</label>
            <select 
              id="audience-select"
              value={selectedAudience} 
              onChange={(e) => setSelectedAudience(e.target.value as AudienceType)}
              className="audience-dropdown"
            >
              <option value="all">All Audiences (20 pieces)</option>
              <option value="radio-broadcasting">Radio Broadcasting (5 pieces)</option>
              <option value="film-industry">Film Industry (5 pieces)</option>
              <option value="arts-literature">Arts & Literature (5 pieces)</option>
              <option value="corporate-strategy">Corporate Strategy (5 pieces)</option>
            </select>
          </div>
        )}
      </header>
      
      <main className="app-main">
        {currentSection === 'portfolio' && (
          <DynamicPortfolio allPieces={getPortfolioData()} />
        )}
        {currentSection === 'splice' && (
          <SpliceSoundBiteComponent 
            onDownload={handleDownload}
            onPreview={handlePreview}
          />
        )}
        {currentSection === 'notes' && (
          <AppleNotes />
        )}
      </main>
      
      <footer className="app-footer">
        <p>
          Built with React, OpenAI GPT, and the power of intelligent curation.
        </p>
      </footer>

      <AudioPreviewModal
        soundBite={previewSoundBite}
        isOpen={isPreviewOpen}
        onClose={closePreview}
      />
    </div>
  );
}

export default App;