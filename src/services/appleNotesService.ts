import { AppleNote, AppleNotesImportOptions, AppleNotesImportResult, AppleNoteAttachment } from '../types';

export class AppleNotesService {
  private static instance: AppleNotesService;
  private notes: AppleNote[] = [];
  private storageKey = 'apple-notes-data';

  private constructor() {
    this.loadNotes();
  }

  public static getInstance(): AppleNotesService {
    if (!AppleNotesService.instance) {
      AppleNotesService.instance = new AppleNotesService();
    }
    return AppleNotesService.instance;
  }

  private loadNotes(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        this.notes = parsed.map((note: any) => ({
          ...note,
          createdDate: new Date(note.createdDate),
          modifiedDate: new Date(note.modifiedDate),
        }));
      }
    } catch (error) {
      console.error('Failed to load notes from localStorage:', error);
      this.notes = [];
    }
  }

  private saveNotes(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notes));
    } catch (error) {
      console.error('Failed to save notes to localStorage:', error);
    }
  }

  public getAllNotes(): AppleNote[] {
    return [...this.notes];
  }

  public getNoteById(id: string): AppleNote | undefined {
    return this.notes.find(note => note.id === id);
  }

  public getNotesByFolder(folder: string): AppleNote[] {
    return this.notes.filter(note => note.folder === folder);
  }

  public getNotesByTag(tag: string): AppleNote[] {
    return this.notes.filter(note => note.tags?.includes(tag));
  }

  public searchNotes(query: string): AppleNote[] {
    const lowercaseQuery = query.toLowerCase();
    return this.notes.filter(note => 
      note.title.toLowerCase().includes(lowercaseQuery) ||
      note.content.toLowerCase().includes(lowercaseQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  public addNote(note: Omit<AppleNote, 'id' | 'createdDate' | 'modifiedDate'>): AppleNote {
    const newNote: AppleNote = {
      ...note,
      id: this.generateId(),
      createdDate: new Date(),
      modifiedDate: new Date(),
    };
    
    this.notes.unshift(newNote); // Add to beginning
    this.saveNotes();
    return newNote;
  }

  public updateNote(id: string, updates: Partial<Omit<AppleNote, 'id' | 'createdDate'>>): AppleNote | null {
    const index = this.notes.findIndex(note => note.id === id);
    if (index === -1) return null;

    this.notes[index] = {
      ...this.notes[index],
      ...updates,
      modifiedDate: new Date(),
    };
    
    this.saveNotes();
    return this.notes[index];
  }

  public deleteNote(id: string): boolean {
    const index = this.notes.findIndex(note => note.id === id);
    if (index === -1) return false;

    this.notes.splice(index, 1);
    this.saveNotes();
    return true;
  }

  public importNotes(notes: AppleNote[]): AppleNotesImportResult {
    const errors: string[] = [];
    let importedCount = 0;
    let skippedCount = 0;

    notes.forEach(note => {
      try {
        // Check if note already exists
        const existingIndex = this.notes.findIndex(existing => existing.id === note.id);
        
        if (existingIndex !== -1) {
          // Update existing note
          this.notes[existingIndex] = {
            ...note,
            modifiedDate: new Date(),
          };
          importedCount++;
        } else {
          // Add new note
          this.notes.unshift({
            ...note,
            createdDate: new Date(note.createdDate),
            modifiedDate: new Date(note.modifiedDate),
          });
          importedCount++;
        }
      } catch (error) {
        errors.push(`Failed to import note "${note.title}": ${error}`);
        skippedCount++;
      }
    });

    this.saveNotes();

    return {
      success: errors.length === 0,
      importedCount,
      skippedCount,
      errors,
      notes: this.notes,
    };
  }

  public exportNotes(): string {
    return JSON.stringify(this.notes, null, 2);
  }

  public clearAllNotes(): void {
    this.notes = [];
    this.saveNotes();
  }

  public getStats(): {
    totalNotes: number;
    totalFolders: number;
    totalTags: number;
    totalAttachments: number;
    averageNoteLength: number;
  } {
    const folders = new Set(this.notes.map(note => note.folder).filter(Boolean));
    const allTags = this.notes.flatMap(note => note.tags || []);
    const uniqueTags = new Set(allTags);
    const totalAttachments = this.notes.reduce((sum, note) => sum + (note.attachments?.length || 0), 0);
    const totalContentLength = this.notes.reduce((sum, note) => sum + note.content.length, 0);
    const averageNoteLength = this.notes.length > 0 ? totalContentLength / this.notes.length : 0;

    return {
      totalNotes: this.notes.length,
      totalFolders: folders.size,
      totalTags: uniqueTags.size,
      totalAttachments,
      averageNoteLength: Math.round(averageNoteLength),
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Method to simulate Apple Notes import from various sources
  public async importFromFile(file: File, options: AppleNotesImportOptions = {
    includeAttachments: false,
    includeDeleted: false,
  }): Promise<AppleNotesImportResult> {
    try {
      const text = await file.text();
      let parsedNotes: AppleNote[];

      // Try to parse as JSON first
      try {
        const jsonData = JSON.parse(text);
        parsedNotes = Array.isArray(jsonData) ? jsonData : [jsonData];
      } catch {
        // If not JSON, try to parse as plain text and create notes
        parsedNotes = this.parseTextToNotes(text);
      }

      // Apply filters
      let filteredNotes = parsedNotes;

      if (options.folderFilter && options.folderFilter.length > 0) {
        filteredNotes = filteredNotes.filter(note => 
          note.folder && options.folderFilter!.includes(note.folder)
        );
      }

      if (options.dateRange) {
        filteredNotes = filteredNotes.filter(note => {
          const noteDate = new Date(note.createdDate);
          return noteDate >= options.dateRange!.start && noteDate <= options.dateRange!.end;
        });
      }

      if (!options.includeAttachments) {
        filteredNotes = filteredNotes.map(note => ({
          ...note,
          attachments: [],
        }));
      }

      return this.importNotes(filteredNotes);
    } catch (error) {
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errors: [`Failed to import file: ${error}`],
        notes: [],
      };
    }
  }

  private parseTextToNotes(text: string): AppleNote[] {
    // Simple text parsing - split by double newlines or common separators
    const sections = text.split(/\n\s*\n/).filter(section => section.trim().length > 0);
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0] || `Note ${index + 1}`;
      const content = lines.slice(1).join('\n').trim() || section.trim();
      
      return {
        id: this.generateId(),
        title,
        content,
        createdDate: new Date(),
        modifiedDate: new Date(),
        folder: 'Imported',
        tags: [],
        attachments: [],
      };
    });
  }

  // Method to create sample notes for demonstration
  public createSampleNotes(): AppleNote[] {
    const sampleNotes: Omit<AppleNote, 'id' | 'createdDate' | 'modifiedDate'>[] = [
      {
        title: 'Project Ideas',
        content: 'Here are some creative project ideas I want to explore:\n\n1. Interactive sound installation\n2. Generative music system\n3. Audio-visual performance piece\n4. Mobile app for music collaboration',
        folder: 'Creative',
        tags: ['ideas', 'projects', 'creative'],
        isPinned: true,
      },
      {
        title: 'Meeting Notes - Client Call',
        content: 'Client wants a more dynamic portfolio presentation. They mentioned:\n- Interactive elements\n- Better categorization\n- Mobile responsiveness\n- Integration with their existing workflow',
        folder: 'Work',
        tags: ['meeting', 'client', 'portfolio'],
        isPinned: false,
      },
      {
        title: 'Technical Research',
        content: 'Research on Web Audio API:\n- Real-time audio processing\n- Audio visualization\n- Cross-browser compatibility\n- Performance considerations',
        folder: 'Research',
        tags: ['technical', 'web-audio', 'research'],
        isPinned: false,
      },
      {
        title: 'Inspiration',
        content: 'Found this amazing artist: [Artist Name]\nTheir work combines traditional techniques with modern technology.\n\nKey takeaways:\n- Use of space and silence\n- Layered textures\n- Emotional storytelling',
        folder: 'Inspiration',
        tags: ['inspiration', 'art', 'learning'],
        isPinned: true,
      },
    ];

    return sampleNotes.map(note => this.addNote(note));
  }
}