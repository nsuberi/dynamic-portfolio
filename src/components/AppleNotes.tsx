import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppleNote, AppleNotesImportOptions } from '../types';
import { AppleNotesService } from '../services/appleNotesService';
import './AppleNotes.css';

const AppleNotes: React.FC = () => {
  const [notes, setNotes] = useState<AppleNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<AppleNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importOptions, setImportOptions] = useState<AppleNotesImportOptions>({
    includeAttachments: false,
    includeDeleted: false,
  });
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalFolders: 0,
    totalTags: 0,
    totalAttachments: 0,
    averageNoteLength: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const notesService = AppleNotesService.getInstance();

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = useCallback(() => {
    const allNotes = notesService.getAllNotes();
    setNotes(allNotes);
    setStats(notesService.getStats());
  }, [notesService]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const searchResults = notesService.searchNotes(query);
      setNotes(searchResults);
    } else {
      loadNotes();
    }
  }, [notesService, loadNotes]);

  const handleFolderFilter = useCallback((folder: string) => {
    setSelectedFolder(folder);
    if (folder === 'all') {
      loadNotes();
    } else {
      const folderNotes = notesService.getNotesByFolder(folder);
      setNotes(folderNotes);
    }
  }, [notesService, loadNotes]);

  const handleNoteClick = useCallback((note: AppleNote) => {
    setSelectedNote(note);
    setIsEditing(false);
  }, []);

  const handleEditNote = useCallback((note: AppleNote) => {
    setSelectedNote(note);
    setIsEditing(true);
  }, []);

  const handleSaveNote = useCallback((updatedNote: AppleNote) => {
    notesService.updateNote(updatedNote.id, updatedNote);
    loadNotes();
    setSelectedNote(updatedNote);
    setIsEditing(false);
  }, [notesService, loadNotes]);

  const handleDeleteNote = useCallback((noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      notesService.deleteNote(noteId);
      loadNotes();
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    }
  }, [notesService, loadNotes, selectedNote]);

  const handleCreateNote = useCallback(() => {
    const newNote = notesService.addNote({
      title: 'New Note',
      content: '',
      folder: 'General',
      tags: [],
    });
    setSelectedNote(newNote);
    setIsEditing(true);
    loadNotes();
  }, [notesService, loadNotes]);

  const handleImportFile = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await notesService.importFromFile(file, importOptions);
      if (result.success) {
        loadNotes();
        alert(`Successfully imported ${result.importedCount} notes`);
      } else {
        alert(`Import failed: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      alert(`Import error: ${error}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowImportModal(false);
  }, [notesService, loadNotes, importOptions]);

  const handleExportNotes = useCallback(() => {
    const exportData = notesService.exportNotes();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apple-notes-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [notesService]);

  const handleCreateSampleNotes = useCallback(() => {
    notesService.createSampleNotes();
    loadNotes();
  }, [notesService, loadNotes]);

  const getUniqueFolders = useCallback(() => {
    const folders = notes.map(note => note.folder).filter(Boolean) as string[];
    return Array.from(new Set(folders));
  }, [notes]);

  const getUniqueTags = useCallback(() => {
    const allTags = notes.flatMap(note => note.tags || []);
    return Array.from(new Set(allTags));
  }, [notes]);

  const filteredNotes = notes.filter(note => {
    if (selectedFolder !== 'all' && note.folder !== selectedFolder) return false;
    return true;
  });

  return (
    <div className="apple-notes">
      <div className="notes-header">
        <h2>Apple Notes</h2>
        <div className="notes-actions">
          <button className="action-button" onClick={handleCreateNote}>
            + New Note
          </button>
          <button className="action-button" onClick={() => setShowImportModal(true)}>
            Import
          </button>
          <button className="action-button" onClick={handleExportNotes}>
            Export
          </button>
          <button className="action-button" onClick={handleCreateSampleNotes}>
            Sample Data
          </button>
        </div>
      </div>

      <div className="notes-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.totalNotes}</span>
          <span className="stat-label">Notes</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.totalFolders}</span>
          <span className="stat-label">Folders</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.totalTags}</span>
          <span className="stat-label">Tags</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.totalAttachments}</span>
          <span className="stat-label">Attachments</span>
        </div>
      </div>

      <div className="notes-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="folder-filter">
          <select
            value={selectedFolder}
            onChange={(e) => handleFolderFilter(e.target.value)}
            className="folder-select"
          >
            <option value="all">All Folders</option>
            {getUniqueFolders().map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="notes-layout">
        <div className="notes-sidebar">
          <div className="notes-list">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                onClick={() => handleNoteClick(note)}
              >
                <div className="note-header">
                  <h3 className="note-title">{note.title}</h3>
                  {note.isPinned && <span className="pin-icon">📌</span>}
                </div>
                <p className="note-preview">
                  {note.content.substring(0, 100)}
                  {note.content.length > 100 && '...'}
                </p>
                <div className="note-meta">
                  <span className="note-folder">{note.folder}</span>
                  <span className="note-date">
                    {new Date(note.modifiedDate).toLocaleDateString()}
                  </span>
                </div>
                {note.tags && note.tags.length > 0 && (
                  <div className="note-tags">
                    {note.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="notes-main">
          {selectedNote ? (
            <div className="note-detail">
              <div className="note-detail-header">
                <h2>{selectedNote.title}</h2>
                <div className="note-actions">
                  <button
                    className="action-button"
                    onClick={() => handleEditNote(selectedNote)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteNote(selectedNote.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="note-detail-meta">
                <span className="note-folder">{selectedNote.folder}</span>
                <span className="note-date">
                  Created: {new Date(selectedNote.createdDate).toLocaleString()}
                </span>
                <span className="note-date">
                  Modified: {new Date(selectedNote.modifiedDate).toLocaleString()}
                </span>
              </div>

              {isEditing ? (
                <NoteEditor
                  note={selectedNote}
                  onSave={handleSaveNote}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <div className="note-content">
                  <pre>{selectedNote.content}</pre>
                </div>
              )}

              {selectedNote.attachments && selectedNote.attachments.length > 0 && (
                <div className="note-attachments">
                  <h3>Attachments</h3>
                  {selectedNote.attachments.map(attachment => (
                    <div key={attachment.id} className="attachment">
                      <span className="attachment-name">{attachment.name}</span>
                      <span className="attachment-size">{attachment.size} bytes</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="no-note-selected">
              <p>Select a note to view its content</p>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Import Notes</h3>
            <div className="import-options">
              <label>
                <input
                  type="checkbox"
                  checked={importOptions.includeAttachments}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    includeAttachments: e.target.checked
                  }))}
                />
                Include Attachments
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={importOptions.includeDeleted}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    includeDeleted: e.target.checked
                  }))}
                />
                Include Deleted Notes
              </label>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
            <button
              className="action-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </button>
            <button
              className="action-button"
              onClick={() => setShowImportModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Note Editor Component
interface NoteEditorProps {
  note: AppleNote;
  onSave: (note: AppleNote) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onCancel }) => {
  const [editedNote, setEditedNote] = useState<AppleNote>(note);

  const handleSave = () => {
    onSave(editedNote);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedNote(prev => ({ ...prev, title: e.target.value }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedNote(prev => ({ ...prev, content: e.target.value }));
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedNote(prev => ({ ...prev, folder: e.target.value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
    setEditedNote(prev => ({ ...prev, tags }));
  };

  return (
    <div className="note-editor">
      <div className="editor-field">
        <label>Title:</label>
        <input
          type="text"
          value={editedNote.title}
          onChange={handleTitleChange}
          className="editor-input"
        />
      </div>
      
      <div className="editor-field">
        <label>Folder:</label>
        <input
          type="text"
          value={editedNote.folder || ''}
          onChange={handleFolderChange}
          className="editor-input"
        />
      </div>
      
      <div className="editor-field">
        <label>Tags (comma-separated):</label>
        <input
          type="text"
          value={editedNote.tags?.join(', ') || ''}
          onChange={handleTagsChange}
          className="editor-input"
        />
      </div>
      
      <div className="editor-field">
        <label>Content:</label>
        <textarea
          value={editedNote.content}
          onChange={handleContentChange}
          className="editor-textarea"
          rows={20}
        />
      </div>
      
      <div className="editor-actions">
        <button className="action-button" onClick={handleSave}>
          Save
        </button>
        <button className="action-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AppleNotes;