import { PortfolioPiece } from '../types';

export const samplePortfolioData: PortfolioPiece[] = [
  // Images
  {
    id: 'img-001',
    type: 'image',
    title: 'Urban Solitude',
    description: 'A contemplative black and white photograph capturing the isolation of city life through the lens of a lone figure in an empty street.',
    year: 2023,
    medium: 'Digital Photography',
    size: 'large',
    url: 'https://picsum.photos/800/600?random=1',
    tags: ['urban', 'solitude', 'black-and-white', 'street', 'contemplative'],
    mood: ['melancholic', 'introspective', 'peaceful']
  },
  {
    id: 'img-002',
    type: 'image',
    title: 'Geometric Dreams',
    description: 'An abstract composition exploring the relationship between geometric forms and negative space.',
    year: 2023,
    medium: 'Digital Art',
    size: 'medium',
    url: 'https://picsum.photos/600/800?random=2',
    tags: ['abstract', 'geometric', 'minimalist', 'modern'],
    mood: ['energetic', 'futuristic', 'dynamic']
  },
  {
    id: 'img-003',
    type: 'image',
    title: 'Nature\'s Embrace',
    description: 'A serene landscape capturing the quiet beauty of a misty forest at dawn.',
    year: 2022,
    medium: 'Film Photography',
    size: 'large',
    url: 'https://picsum.photos/900/600?random=3',
    tags: ['nature', 'landscape', 'misty', 'serene', 'forest'],
    mood: ['peaceful', 'mysterious', 'calm']
  },
  {
    id: 'img-004',
    type: 'image',
    title: 'Industrial Decay',
    description: 'Documentary-style photography of abandoned industrial spaces, exploring themes of time and transformation.',
    year: 2022,
    medium: '35mm Film',
    size: 'medium',
    url: 'https://picsum.photos/700/500?random=4',
    tags: ['industrial', 'decay', 'documentary', 'abandoned', 'texture'],
    mood: ['nostalgic', 'melancholic', 'raw']
  },
  {
    id: 'img-005',
    type: 'image',
    title: 'Portrait of Resilience',
    description: 'An intimate portrait capturing the strength and vulnerability of the human spirit.',
    year: 2023,
    medium: 'Digital Photography',
    size: 'small',
    url: 'https://picsum.photos/400/600?random=5',
    tags: ['portrait', 'human', 'emotion', 'intimate'],
    mood: ['powerful', 'vulnerable', 'hopeful']
  },

  // Videos
  {
    id: 'vid-001',
    type: 'video',
    title: 'Time Lapse: City Pulse',
    description: 'A mesmerizing time-lapse capturing the rhythm and energy of urban life over 24 hours.',
    year: 2023,
    medium: '4K Video',
    size: 'large',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    tags: ['timelapse', 'urban', 'rhythm', 'energy', 'movement'],
    mood: ['energetic', 'overwhelming', 'dynamic']
  },
  {
    id: 'vid-002',
    type: 'video',
    title: 'Abstract Motion',
    description: 'Experimental video art exploring the intersection of light, shadow, and movement.',
    year: 2023,
    medium: 'Digital Video',
    size: 'medium',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
    tags: ['experimental', 'abstract', 'light', 'shadow', 'movement'],
    mood: ['mysterious', 'hypnotic', 'ethereal']
  },

  // Audio
  {
    id: 'aud-001',
    type: 'audio',
    title: 'Ambient Reverie',
    description: 'An ambient soundscape blending natural and electronic elements to create a meditative experience.',
    year: 2023,
    medium: 'Digital Audio',
    size: 'small',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    tags: ['ambient', 'meditative', 'electronic', 'natural'],
    mood: ['peaceful', 'contemplative', 'ethereal']
  },
  {
    id: 'aud-002',
    type: 'audio',
    title: 'Urban Symphony',
    description: 'A field recording composition capturing the musicality of everyday urban sounds.',
    year: 2022,
    medium: 'Field Recording',
    size: 'medium',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    tags: ['field-recording', 'urban', 'musical', 'everyday'],
    mood: ['rhythmic', 'nostalgic', 'energetic']
  },
  {
    id: 'aud-003',
    type: 'audio',
    title: 'Digital Dreams',
    description: 'Experimental electronic composition exploring the intersection of technology and emotion.',
    year: 2023,
    medium: 'Synthesized Audio',
    size: 'small',
    url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    tags: ['electronic', 'experimental', 'synthesized', 'futuristic'],
    mood: ['futuristic', 'mysterious', 'energetic']
  },

  // Documents
  {
    id: 'doc-001',
    type: 'document',
    title: 'The Art of Digital Minimalism',
    description: 'A manifesto exploring the philosophy of digital minimalism in contemporary art practice.',
    year: 2023,
    medium: 'Digital Text',
    size: 'medium',
    content: 'In an age of digital abundance, the artist must become a curator of attention. Digital minimalism is not about less technology, but about more intentional technology use. This manifesto explores how contemporary artists can navigate the digital landscape while maintaining creative integrity and authentic expression.',
    tags: ['manifesto', 'digital', 'minimalism', 'philosophy', 'contemporary'],
    mood: ['contemplative', 'philosophical', 'thoughtful']
  },
  {
    id: 'doc-002',
    type: 'document',
    title: 'Urban Photography: A Personal Journey',
    description: 'A reflective essay on the evolution of urban photography and its impact on modern visual culture.',
    year: 2022,
    medium: 'Digital Text',
    size: 'large',
    content: 'Urban photography has evolved from simple documentation to a complex art form that captures the soul of the city. This essay traces my personal journey through the streets, exploring how urban environments shape both the photographer and the photographed. From the early days of street photography to the modern digital age, we examine how technology has changed our relationship with urban spaces.',
    tags: ['essay', 'urban', 'photography', 'personal', 'reflection'],
    mood: ['nostalgic', 'reflective', 'personal']
  },
  {
    id: 'doc-003',
    type: 'document',
    title: 'Sound as Sculpture',
    description: 'An exploration of audio art as three-dimensional space, examining how sound creates physical presence.',
    year: 2023,
    medium: 'Digital Text',
    size: 'small',
    content: 'Sound exists in three dimensions, yet we often treat it as a linear experience. This piece examines how audio artists can sculpt space through sound, creating immersive environments that engage not just the ears, but the entire body. We explore techniques from field recording to spatial audio design.',
    tags: ['audio-art', 'sculpture', 'space', 'immersive', 'experimental'],
    mood: ['experimental', 'innovative', 'contemplative']
  }
];