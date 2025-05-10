import React from 'react';
import { MediaFile } from '../../types/media';
import { mediaUtils } from '../../utils/mediaUtils';
import './MediaGrid.css';

interface MediaGridProps {
  mediaFiles: MediaFile[];
  selectedMediaIds: string[];
  onSelectMedia: (media: MediaFile) => void;
  onDeleteMedia: (mediaKey: string) => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  mediaFiles,
  selectedMediaIds,
  onSelectMedia,
  onDeleteMedia
}) => {
  // Function to render preview based on media type
  const renderMediaPreview = (media: MediaFile) => {
    const { type, key, contentType, filename } = media;
    
    // Create a URL for the media file
    const mediaUrl = `/api/media/${encodeURIComponent(key)}`;
    
    if (type === 'image') {
      return (
        <img 
          src={mediaUrl} 
          alt={media.metadata?.title || filename} 
          className="media-preview-image"
          loading="lazy"
        />
      );
    } else if (type === 'audio') {
      return (
        <div className="media-preview-audio">
          <div className="audio-icon">🎵</div>
          <div className="audio-title">{media.metadata?.title || filename}</div>
          <audio src={mediaUrl} controls />
        </div>
      );
    } else {
      // Document or other file types
      return (
        <div className="media-preview-document">
          <div className="document-icon">📄</div>
          <div className="document-title">{media.metadata?.title || filename}</div>
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

  return (
    <div className="media-grid">
      {mediaFiles.map(media => (
        <div 
          key={media.key} 
          className={`media-grid-item ${selectedMediaIds.includes(media.key) ? 'selected' : ''}`}
          onClick={() => onSelectMedia(media)}
        >
          <div className="media-preview">
            {renderMediaPreview(media)}
          </div>
          <div className="media-info">
            <h4 className="media-title">{media.metadata?.title || media.filename}</h4>
            <div className="media-meta">
              <span className="media-type">{media.type}</span>
              <span className="media-size">{formatFileSize(media.size)}</span>
            </div>
            <div className="media-date">{formatDate(media.uploadedAt)}</div>
          </div>
          <div className="media-actions">
            <button 
              className="media-delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMedia(media.key);
              }}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;
