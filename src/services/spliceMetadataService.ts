import { AudioFileAnalysis, SpliceFileMetadata } from '../types';

export class SpliceMetadataService {
  private static instance: SpliceMetadataService;
  private metadata: SpliceFileMetadata = {};
  private readonly STORAGE_KEY = 'splice_metadata';

  private constructor() {
    this.loadMetadata();
  }

  public static getInstance(): SpliceMetadataService {
    if (!SpliceMetadataService.instance) {
      SpliceMetadataService.instance = new SpliceMetadataService();
    }
    return SpliceMetadataService.instance;
  }

  private loadMetadata(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.metadata = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load Splice metadata:', error);
      this.metadata = {};
    }
  }

  private saveMetadata(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metadata));
    } catch (error) {
      console.error('Failed to save Splice metadata:', error);
    }
  }

  public addAnalysis(analysis: AudioFileAnalysis): void {
    this.metadata[analysis.filePath] = analysis;
    this.saveMetadata();
  }

  public getAnalysis(filePath: string): AudioFileAnalysis | undefined {
    return this.metadata[filePath];
  }

  public getAllAnalyses(): AudioFileAnalysis[] {
    return Object.values(this.metadata);
  }

  public searchAnalyses(query: string): AudioFileAnalysis[] {
    const searchTerm = query.toLowerCase();
    return Object.values(this.metadata).filter(analysis => 
      analysis.fileName.toLowerCase().includes(searchTerm) ||
      analysis.analysis.artist?.toLowerCase().includes(searchTerm) ||
      analysis.analysis.title?.toLowerCase().includes(searchTerm) ||
      analysis.analysis.genre?.toLowerCase().includes(searchTerm) ||
      analysis.analysis.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      analysis.analysis.mood?.some(mood => mood.toLowerCase().includes(searchTerm)) ||
      analysis.analysis.description?.toLowerCase().includes(searchTerm) ||
      analysis.metadata.packName?.toLowerCase().includes(searchTerm) ||
      analysis.metadata.packArtist?.toLowerCase().includes(searchTerm)
    );
  }

  public filterByGenre(genre: string): AudioFileAnalysis[] {
    return Object.values(this.metadata).filter(analysis => 
      analysis.analysis.genre?.toLowerCase() === genre.toLowerCase()
    );
  }

  public filterByMood(mood: string): AudioFileAnalysis[] {
    return Object.values(this.metadata).filter(analysis => 
      analysis.analysis.mood?.some(m => m.toLowerCase() === mood.toLowerCase())
    );
  }

  public filterByBPM(minBPM: number, maxBPM: number): AudioFileAnalysis[] {
    return Object.values(this.metadata).filter(analysis => 
      analysis.analysis.bpm && 
      analysis.analysis.bpm >= minBPM && 
      analysis.analysis.bpm <= maxBPM
    );
  }

  public filterByKey(key: string): AudioFileAnalysis[] {
    return Object.values(this.metadata).filter(analysis => 
      analysis.analysis.key?.toLowerCase().includes(key.toLowerCase())
    );
  }

  public getUniqueGenres(): string[] {
    const genres = new Set<string>();
    Object.values(this.metadata).forEach(analysis => {
      if (analysis.analysis.genre) {
        genres.add(analysis.analysis.genre);
      }
    });
    return Array.from(genres).sort();
  }

  public getUniqueMoods(): string[] {
    const moods = new Set<string>();
    Object.values(this.metadata).forEach(analysis => {
      analysis.analysis.mood?.forEach(mood => moods.add(mood));
    });
    return Array.from(moods).sort();
  }

  public getUniqueTags(): string[] {
    const tags = new Set<string>();
    Object.values(this.metadata).forEach(analysis => {
      analysis.analysis.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  public getPackNames(): string[] {
    const packs = new Set<string>();
    Object.values(this.metadata).forEach(analysis => {
      if (analysis.metadata.packName) {
        packs.add(analysis.metadata.packName);
      }
    });
    return Array.from(packs).sort();
  }

  public getArtistNames(): string[] {
    const artists = new Set<string>();
    Object.values(this.metadata).forEach(analysis => {
      if (analysis.analysis.artist) {
        artists.add(analysis.analysis.artist);
      }
      if (analysis.metadata.packArtist) {
        artists.add(analysis.metadata.packArtist);
      }
    });
    return Array.from(artists).sort();
  }

  public removeAnalysis(filePath: string): void {
    delete this.metadata[filePath];
    this.saveMetadata();
  }

  public clearAllMetadata(): void {
    this.metadata = {};
    this.saveMetadata();
  }

  public exportMetadata(): string {
    return JSON.stringify(this.metadata, null, 2);
  }

  public importMetadata(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData);
      this.metadata = { ...this.metadata, ...imported };
      this.saveMetadata();
      return true;
    } catch (error) {
      console.error('Failed to import metadata:', error);
      return false;
    }
  }

  public getStats(): {
    totalFiles: number;
    totalSize: number;
    genres: number;
    moods: number;
    tags: number;
    packs: number;
    artists: number;
  } {
    const analyses = Object.values(this.metadata);
    return {
      totalFiles: analyses.length,
      totalSize: analyses.reduce((sum, analysis) => sum + analysis.fileSize, 0),
      genres: this.getUniqueGenres().length,
      moods: this.getUniqueMoods().length,
      tags: this.getUniqueTags().length,
      packs: this.getPackNames().length,
      artists: this.getArtistNames().length
    };
  }
}