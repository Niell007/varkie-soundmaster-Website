import React, { useState, useEffect } from 'react';
import MediaLibrary from '../components/media/MediaLibrary';
import MediaSearch from '../components/media/MediaSearch';
import { useAuthContext } from '../contexts/AuthContext';
import { mediaUtils } from '../utils/mediaUtils';
import './MediaPage.css';

const MediaPage: React.FC = () => {
  const { token } = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Initialize with empty string instead of potentially null value
  // Initialize with empty string to avoid null values
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mediaType, setMediaType] = useState<string>('');
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Fetch media files when component mounts or search parameters change
    const fetchMedia = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        setError('');
        
        // TypeScript fix: Ensure searchTerm is a string by using empty string as fallback
        // This is needed because TypeScript is detecting a potential null value
        const search = typeof searchTerm === 'string' ? searchTerm : '';
        const files = await mediaUtils.fetchMedia('/api', token, mediaType || undefined, search);
        setMediaFiles(files);
      } catch (err) {
        console.error('Error fetching media:', err);
        setError('Failed to load media files. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMedia();
  }, [token, searchTerm, mediaType]);

  const handleSearch = (term: string, type?: string) => {
    setSearchTerm(term);
    setMediaType(type || '');
  };

  const handleMediaUpdate = async () => {
    // Refresh media files after an update (upload, delete, etc.)
    try {
      // Return early if token is not available
      if (!token) return;
      
      setIsLoading(true);
      // TypeScript fix: Ensure searchTerm is a string by using empty string as fallback
      // This is needed because TypeScript is detecting a potential null value
      const search = typeof searchTerm === 'string' ? searchTerm : '';
      const files = await mediaUtils.fetchMedia('/api', token, mediaType || undefined, search);
      setMediaFiles(files);
    } catch (err) {
      console.error('Error refreshing media:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Media Library</h1>
      </div>

      <div className="media-page-content">
        {token ? (
          <>
            <MediaSearch 
              onSearch={handleSearch}
              initialSearchTerm={searchTerm}
              initialType={mediaType}
            />
            
            {error !== '' && (
              <div className="alert alert-error">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="media-page-loading">
                <div className="spinner"></div>
                <p>Loading media files...</p>
              </div>
            ) : (
              <MediaLibrary 
                token={token} 
                apiUrl="/api"
                mediaFiles={mediaFiles}
                onUpdate={handleMediaUpdate}
              />
            )}
          </>
        ) : (
          <div className="auth-required">
            <p>Please log in to access the media library.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaPage;
