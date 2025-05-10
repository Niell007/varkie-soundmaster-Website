import React, { useState, useRef, useCallback } from 'react';
import { MediaType } from '../../types/media';
import { mediaUtils } from '../../utils/mediaUtils';
import './MediaUploader.css';

interface MediaUploaderProps {
  onUpload: (file: File, type: MediaType, metadata: Record<string, string>) => Promise<any>;
  onCancel: () => void;
  allowedTypes?: MediaType[];
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUpload,
  onCancel,
  allowedTypes = ['audio', 'image', 'document']
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<MediaType>(allowedTypes[0]);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-detect type based on file mimetype
      if (selectedFile.type.startsWith('audio/')) {
        setType('audio');
      } else if (selectedFile.type.startsWith('image/')) {
        setType('image');
      } else {
        setType('document');
      }
      
      // Set filename as title in metadata
      setMetadata(prev => ({
        ...prev,
        title: selectedFile.name.split('.')[0]
      }));
    }
  };

  // Handle drag and drop
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      
      // Auto-detect type based on file mimetype
      if (droppedFile.type.startsWith('audio/')) {
        setType('audio');
      } else if (droppedFile.type.startsWith('image/')) {
        setType('image');
      } else {
        setType('document');
      }
      
      // Set filename as title in metadata
      setMetadata(prev => ({
        ...prev,
        title: droppedFile.name.split('.')[0]
      }));
    }
  }, []);

  // Handle metadata change
  const handleMetadataChange = (key: string, value: string) => {
    setMetadata(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      await onUpload(file, type, metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Get metadata fields based on media type
  const getMetadataFields = () => {
    const commonFields = [
      { key: 'title', label: 'Title', required: true },
      { key: 'description', label: 'Description', required: false }
    ];
    
    const typeSpecificFields = {
      audio: [
        { key: 'artist', label: 'Artist', required: false },
        { key: 'album', label: 'Album', required: false },
        { key: 'genre', label: 'Genre', required: false },
        { key: 'year', label: 'Year', required: false }
      ],
      image: [
        { key: 'alt', label: 'Alt Text', required: false },
        { key: 'credit', label: 'Credit', required: false }
      ],
      document: [
        { key: 'author', label: 'Author', required: false },
        { key: 'category', label: 'Category', required: false }
      ]
    };
    
    return [...commonFields, ...(typeSpecificFields[type] || [])];
  };

  return (
    <div className="media-uploader-overlay">
      <div className="media-uploader">
        <div className="media-uploader-header">
          <h3>Upload Media</h3>
          <button 
            className="close-button" 
            onClick={onCancel}
            disabled={isUploading}
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div className="media-uploader-error">
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div 
            className={`file-drop-area ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            
            {file ? (
              <div className="selected-file">
                <div className="file-preview">
                  {type === 'image' ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" />
                  ) : type === 'audio' ? (
                    <div className="audio-preview">
                      <i className="audio-icon">🎵</i>
                      <audio src={URL.createObjectURL(file)} controls />
                    </div>
                  ) : (
                    <div className="document-preview">
                      <i className="document-icon">📄</i>
                    </div>
                  )}
                </div>
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{mediaUtils.formatFileSize(file.size)}</p>
                  <button 
                    type="button" 
                    className="change-file-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Change File
                  </button>
                </div>
              </div>
            ) : (
              <div className="drop-message">
                <i className="upload-icon">📤</i>
                <p>Drag & drop a file here or click to browse</p>
                <p className="file-types">Supported types: {allowedTypes.join(', ')}</p>
              </div>
            )}
          </div>
          
          {file && (
            <>
              <div className="media-type-selector">
                <label>Media Type:</label>
                <div className="type-buttons">
                  {allowedTypes.map(mediaType => (
                    <button
                      key={mediaType}
                      type="button"
                      className={type === mediaType ? 'active' : ''}
                      onClick={() => setType(mediaType)}
                    >
                      {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="metadata-fields">
                <h4>Metadata</h4>
                {getMetadataFields().map(field => (
                  <div key={field.key} className="metadata-field">
                    <label htmlFor={`metadata-${field.key}`}>
                      {field.label}
                      {field.required && <span className="required">*</span>}
                    </label>
                    <input
                      type="text"
                      id={`metadata-${field.key}`}
                      value={metadata[field.key] || ''}
                      onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
          
          <div className="media-uploader-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onCancel}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="upload-button"
              disabled={!file || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaUploader;
