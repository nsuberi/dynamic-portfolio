import React from 'react';
import DynamicPortfolio from './components/DynamicPortfolio';
import { samplePortfolioData } from './data/sampleData';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">Dynamic Portfolio</h1>
        <p className="app-description">
          AI-powered portfolio curation that adapts to your vision. 
          Describe the feeling or message you want to convey, and watch as 
          intelligent algorithms curate the perfect selection of your work.
        </p>
      </header>
      
      <main className="app-main">
        <DynamicPortfolio allPieces={samplePortfolioData} />
      </main>
      
      <footer className="app-footer">
        <p>
          Built with React, OpenAI GPT, and the power of intelligent curation.
        </p>
      </footer>
    </div>
  );
}

export default App;