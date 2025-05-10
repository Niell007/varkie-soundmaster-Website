import React, { useState } from 'react';
import { MediaFile, MediaType, SignedUrlResponse } from '../../types/media';
import { mediaUtils } from '../../utils/mediaUtils';
import './MediaDetails.css';

interface MediaDetailsProps {
  media: MediaFile;
  onClose: () => void;
  onUpdate: (updates: Partial<MediaFile>) => Promise<MediaFile | null>;
  onDelete: () => void;
}

const MediaDetails: React.FC<MediaDetailsProps> = ({
  media,
  onClose,
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editedMetadata, setEditedMetadata] = useState<Record<string, string>>(
    media.metadata || {}
  );
  const [editedFilename, setEditedFilename] = useState<string>(media.filename);
  const [editedType, setEditedType] = useState<MediaType>(media.type);

  // Function to render preview based on media type
  const renderMediaPreview = () => {
    const { type, key, contentType, filename } = media;
    
    // Create a URL for the media file
    const mediaUrl = `/api/media/${encodeURIComponent(key)}`;
    
    if (type === 'image') {
      return (
        <div className="media-details-image">
          <img 
            src={mediaUrl} 
            alt={media.metadata?.title || filename} 
          />
        </div>
      );
    } else if (type === 'audio') {
      return (
        <div className="media-details-audio">
          <div className="audio-player">
            <audio src={mediaUrl} controls />
          </div>
          <div className="audio-waveform">
            {/* Placeholder for audio waveform visualization */}
            <div className="waveform-placeholder"></div>
          </div>
        </div>
      );
    } else {
      // Document or other file types
      return (
        <div className="media-details-document">
          <div className="document-icon">📄</div>
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="document-download">
            Download {filename}
          </a>
        </div>
      );
    }
  };

  // Function to format file size using mediaUtils
  const formatFileSize = (bytes: number) => {
    return mediaUtils.formatFileSize(bytes);
  };

  // Function to format date using mediaUtils
  const formatDate = (dateString: string) => {
    return mediaUtils.formatDate(dateString);
  };

  // Handle metadata field change
  const handleMetadataChange = (key: string, value: string) => {
    setEditedMetadata(prev => ({
      ...prev,
      [key]: value
    }));
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
    
    return [...commonFields, ...(typeSpecificFields[editedType] || [])];
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updates: Partial<MediaFile> = {
        filename: editedFilename,
        type: editedType,
        metadata: editedMetadata
      };
      
      const result = await onUpdate(updates);
      if (result) {
        setIsEditing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update media');
      console.error('Update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Generate a signed URL
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isGeneratingUrl, setIsGeneratingUrl] = useState<boolean>(false);

  const generateSignedUrl = async () => {
    setIsGeneratingUrl(true);
    setError(null);
    
    try {
      const data = await mediaUtils.generateSignedUrl('/api', '', media.key, 3600); // 1 hour
      setSignedUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate signed URL');
      console.error('Error generating signed URL:', err);
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  return (
    <div className="media-details">
      <div className="media-details-header">
        <h3>{isEditing ? 'Edit Media' : 'Media Details'}</h3>
        <div className="media-details-actions">
          {!isEditing && (
            <button 
              className="edit-button"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}
          <button 
            className="close-button"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
      </div>
      
      {error && (
        <div className="media-details-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <div className="media-details-content">
        <div className="media-details-preview">
          {renderMediaPreview()}
        </div>
        
        <div className="media-details-info">
          {isEditing ? (
            <div className="media-edit-form">
              <div className="edit-field">
                <label>Filename:</label>
                <input
                  type="text"
                  value={editedFilename}
                  onChange={(e) => setEditedFilename(e.target.value)}
                />
              </div>
              
              <div className="edit-field">
                <label>Media Type:</label>
                <select
                  value={editedType}
                  onChange={(e) => setEditedType(e.target.value as MediaType)}
                >
                  <option value="audio">Audio</option>
                  <option value="image">Image</option>
                  <option value="document">Document</option>
                </select>
              </div>
              
              <h4>Metadata</h4>
              {getMetadataFields().map(field => (
                <div key={field.key} className="edit-field">
                  <label>
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  <input
                    type="text"
                    value={editedMetadata[field.key] || ''}
                    onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                    required={field.required}
                  />
                </div>
              ))}
              
              <div className="edit-actions">
                <button 
                  className="cancel-button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedMetadata(media.metadata || {});
                    setEditedFilename(media.filename);
                    setEditedType(media.type);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button 
                  className="save-button"
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="media-info-group">
                <h4>File Information</h4>
                <div className="media-info-item">
                  <span className="info-label">Filename:</span>
                  <span className="info-value">{media.filename}</span>
                </div>
                <div className="media-info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{media.type}</span>
                </div>
                <div className="media-info-item">
                  <span className="info-label">Size:</span>
                  <span className="info-value">{formatFileSize(media.size)}</span>
                </div>
                <div className="media-info-item">
                  <span className="info-label">Uploaded:</span>
                  <span className="info-value">{formatDate(media.uploadedAt)}</span>
                </div>
                <div className="media-info-item">
                  <span className="info-label">Content Type:</span>
                  <span className="info-value">{media.contentType}</span>
                </div>
              </div>
              
              <div className="media-info-group">
                <h4>Metadata</h4>
                {media.metadata && Object.entries(media.metadata).length > 0 ? (
                  Object.entries(media.metadata).map(([key, value]) => (
                    <div key={key} className="media-info-item">
                      <span className="info-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                      <span className="info-value">{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-metadata">No metadata available</p>
                )}
              </div>
              
              <div className="media-actions-group">
                <h4>Actions</h4>
                <div className="media-action-buttons">
                  <a 
                    href={`/api/media/${media.key}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="action-button download-button"
                  >
                    Download
                  </a>
                  
                  <button 
                    className="action-button generate-url-button"
                    onClick={generateSignedUrl}
                    disabled={isGeneratingUrl}
                  >
                    {isGeneratingUrl ? 'Generating...' : 'Generate Signed URL'}
                  </button>
                  
                  <button 
                    className="action-button delete-button"
                    onClick={onDelete}
                  >
                    Delete
                  </button>
                </div>
                
                {signedUrl && (
                  <div className="signed-url-container">
                    <h5>Signed URL (expires in 1 hour):</h5>
                    <div className="signed-url">
                      <input 
                        type="text" 
                        value={signedUrl} 
                        readOnly 
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(signedUrl);
                          alert('URL copied to clipboard!');
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;
