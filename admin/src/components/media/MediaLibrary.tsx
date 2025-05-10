import React, { useState, useEffect, useCallback } from 'react';
import { MediaFile, MediaType, MediaUpdate } from '../../types/media';
import { mediaUtils } from '../../utils/mediaUtils';
import MediaUploader from './MediaUploader';
import MediaGrid from './MediaGrid';
import MediaDetails from './MediaDetails';
import './MediaLibrary.css';

interface MediaLibraryProps {
  token: string;
  apiUrl: string;
  mediaFiles?: MediaFile[];
  onSelectMedia?: (media: MediaFile) => void;
  onUpdate?: () => Promise<void>;
  allowMultipleSelection?: boolean;
  filterTypes?: MediaType[];
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({
  token,
  apiUrl,
  mediaFiles: propMediaFiles,
  onSelectMedia,
  onUpdate,
  allowMultipleSelection = false,
  filterTypes
}) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeType, setActiveType] = useState<MediaType | 'all'>('all');
  const [showUploader, setShowUploader] = useState<boolean>(false);

  // Fetch media files from the API
  const fetchMediaFiles = useCallback(async () => {
    // If mediaFiles are provided via props, use those instead of fetching
    if (propMediaFiles) {
      setMediaFiles(propMediaFiles);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const type = activeType !== 'all' ? activeType : undefined;
      const search = searchQuery || undefined;
      
      const data = await mediaUtils.fetchMedia(apiUrl, token, type, search);
      setMediaFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching media files:', err);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, token, searchQuery, activeType, propMediaFiles]);

  // Initial fetch
  useEffect(() => {
    fetchMediaFiles();
  }, [fetchMediaFiles]);
  
  // Update mediaFiles when propMediaFiles changes
  useEffect(() => {
    if (propMediaFiles) {
      setMediaFiles(propMediaFiles);
      setIsLoading(false);
    }
  }, [propMediaFiles]);

  // Handle media selection
  const handleSelectMedia = (media: MediaFile) => {
    setSelectedMedia(media);
    
    if (onSelectMedia) {
      onSelectMedia(media);
    }
    
    if (allowMultipleSelection) {
      setSelectedMediaIds(prev => {
        const mediaId = media.key;
        if (prev.includes(mediaId)) {
          return prev.filter(id => id !== mediaId);
        } else {
          return [...prev, mediaId];
        }
      });
    } else {
      setSelectedMediaIds([media.key]);
    }
  };

  // Handle media upload
  const handleMediaUpload = async (file: File, type: MediaType, metadata: Record<string, string>) => {
    try {
      const uploadedMedia = await mediaUtils.uploadMedia(apiUrl, token, file, {
        ...metadata,
        type
      });
      
      setMediaFiles(prev => [uploadedMedia, ...prev]);
      setShowUploader(false);
      
      // Select the newly uploaded media
      handleSelectMedia(uploadedMedia);
      
      // Notify parent component of the update
      if (onUpdate) {
        await onUpdate();
      }
      
      return uploadedMedia;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error uploading media:', err);
      return null;
    }
  };

  // Handle media deletion
  const handleDeleteMedia = async (mediaKey: string) => {
    if (!confirm('Are you sure you want to delete this media?')) {
      return;
    }

    try {
      await mediaUtils.deleteMedia(apiUrl, token, mediaKey);

      // Remove the deleted media from the list
      setMediaFiles(prev => prev.filter(media => media.key !== mediaKey));
      
      // Clear selection if the deleted media was selected
      if (selectedMedia?.key === mediaKey) {
        setSelectedMedia(null);
      }
      
      // Remove from selected IDs
      setSelectedMediaIds(prev => prev.filter(id => id !== mediaKey));
      
      // Notify parent component of the update
      if (onUpdate) {
        await onUpdate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error deleting media:', err);
    }
  };

  // Handle media metadata update
  const handleUpdateMedia = async (mediaKey: string, updates: Partial<MediaFile>) => {
    try {
      const mediaUpdate: MediaUpdate = {
        filename: updates.filename,
        contentType: updates.contentType,
        type: updates.type,
        metadata: updates.metadata
      };

      const updatedMedia = await mediaUtils.updateMediaMetadata(apiUrl, token, mediaKey, mediaUpdate);
      
      // Update the media in the list
      setMediaFiles(prev => prev.map(media => 
        media.key === mediaKey ? updatedMedia : media
      ));
      
      // Update selected media if it was the one updated
      if (selectedMedia?.key === mediaKey) {
        setSelectedMedia(updatedMedia);
      }
      
      // Notify parent component of the update
      if (onUpdate) {
        await onUpdate();
      }
      
      return updatedMedia;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error updating media:', err);
      return null;
    }
  };

  // Filter types for the UI
  const mediaTypes: MediaType[] = filterTypes || ['audio', 'image', 'document'];

  return (
    <div className="media-library">
      <div className="media-library-header">
        <h2>Media Library</h2>
        <div className="media-library-actions">
          <div className="media-search">
            <input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMediaFiles()}
            />
            <button onClick={fetchMediaFiles}>Search</button>
          </div>
          <div className="media-filters">
            <button 
              className={activeType === 'all' ? 'active' : ''} 
              onClick={() => setActiveType('all')}
            >
              All
            </button>
            {mediaTypes.map(type => (
              <button
                key={type}
                className={activeType === type ? 'active' : ''}
                onClick={() => setActiveType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <button 
            className="upload-button"
            onClick={() => setShowUploader(true)}
          >
            Upload New
          </button>
        </div>
      </div>

      {error && (
        <div className="media-library-error">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="media-library-content">
        <div className="media-grid-container">
          {isLoading ? (
            <div className="media-loading">Loading media...</div>
          ) : mediaFiles.length === 0 ? (
            <div className="media-empty">
              <p>No media files found.</p>
              <button onClick={() => setShowUploader(true)}>Upload Media</button>
            </div>
          ) : (
            <MediaGrid
              mediaFiles={mediaFiles}
              selectedMediaIds={selectedMediaIds}
              onSelectMedia={handleSelectMedia}
              onDeleteMedia={handleDeleteMedia}
            />
          )}
        </div>

        {selectedMedia && (
          <MediaDetails
            media={selectedMedia}
            onClose={() => setSelectedMedia(null)}
            onUpdate={(updates) => handleUpdateMedia(selectedMedia.key, updates)}
            onDelete={() => handleDeleteMedia(selectedMedia.key)}
          />
        )}
      </div>

      {showUploader && (
        <MediaUploader
          onUpload={handleMediaUpload}
          onCancel={() => setShowUploader(false)}
          allowedTypes={mediaTypes}
        />
      )}
    </div>
  );
};

export default MediaLibrary;
