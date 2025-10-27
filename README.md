# Dynamic Portfolio

A React component that creates a dynamic, responsive gallery wall for artists' portfolios. The component allows users to describe the feeling or message they want to convey, and it dynamically filters and displays portfolio pieces in a non-regular grid layout.

## Features

- **AI-Powered Curation**: Uses OpenAI GPT to intelligently select portfolio pieces based on user descriptions
- **Smart Filtering**: Analyzes mood, tags, descriptions, and artistic coherence to curate the perfect selection
- **Gallery Wall Layout**: Non-regular grid layout that minimizes white space between pieces
- **Multiple Media Types**: Support for images, videos, audio files, and documents
- **Interactive Elements**: Click pieces to view details, audio plays directly
- **Responsive Design**: Adapts to different screen sizes
- **Black & White Design**: Clean, minimalist aesthetic with Palatino and Caviar Dreams fonts
- **Real-time Loading**: Shows loading states and error handling for AI API calls

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dynamic-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Set up your OpenAI API key:
```bash
# Copy the environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
REACT_APP_OPENAI_API_KEY=your_actual_openai_api_key_here
```

4. Start the development server:
```bash
npm start
```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## Usage

1. **Describe Your Vision**: In the text area, describe what feeling or message you want to convey with your portfolio (e.g., "contemplative urban landscapes" or "energetic experimental pieces")

2. **View Gallery**: The portfolio pieces will automatically filter and display in a masonry-style grid layout

3. **Interact with Pieces**: 
   - Click on images, videos, or documents to view detailed information in a modal
   - Click on audio pieces to play them directly

## Sample Data

The component includes sample portfolio data with various media types:
- **Images**: Photography and digital art pieces
- **Videos**: Video art and time-lapse content
- **Audio**: Ambient soundscapes and experimental music
- **Documents**: Essays and manifestos

## Customization

### Adding Your Own Data

Replace the sample data in `src/data/sampleData.js` with your own portfolio pieces. Each piece should include:

```javascript
{
  id: uniqueId,
  type: 'image' | 'video' | 'audio' | 'document',
  title: 'Piece Title',
  description: 'Detailed description',
  year: 2023,
  medium: 'Medium used',
  size: 'small' | 'medium' | 'large',
  url: 'path/to/media', // for images, videos, audio
  content: 'text content', // for documents
  tags: ['tag1', 'tag2'],
  mood: ['mood1', 'mood2']
}
```

### Styling

The component uses CSS custom properties and can be easily customized by modifying the styles in `src/App.css`.

## Technologies Used

- React 18
- Vite
- react-masonry-css
- CSS3 with Flexbox and Grid
- Google Fonts (Palatino Linotype, Caviar Dreams)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).