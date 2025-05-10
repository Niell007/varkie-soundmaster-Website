import React, { useMemo } from 'react';
import { MediaFile } from '../../types/media';
import { mediaUtils } from '../../utils/mediaUtils';
import './MediaAnalytics.css';

interface MediaAnalyticsProps {
  mediaFiles: MediaFile[];
}

const MediaAnalytics: React.FC<MediaAnalyticsProps> = ({ mediaFiles }) => {
  // Calculate analytics data from media files
  const analytics = useMemo(() => {
    // Skip calculation if no files
    if (!mediaFiles.length) {
      return {
        totalCount: 0,
        totalSize: 0,
        typeBreakdown: {},
        recentUploads: []
      };
    }

    // Calculate total size
    const totalSize = mediaFiles.reduce((sum, file) => sum + file.size, 0);
    
    // Calculate type breakdown
    const typeBreakdown = mediaFiles.reduce((acc: Record<string, number>, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {});
    
    // Get recent uploads (last 5)
    const recentUploads = [...mediaFiles]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 5);
    
    return {
      totalCount: mediaFiles.length,
      totalSize,
      typeBreakdown,
      recentUploads
    };
  }, [mediaFiles]);

  // Calculate percentages for the type breakdown
  const typePercentages = useMemo(() => {
    const result: Record<string, number> = {};
    const total = analytics.totalCount;
    
    if (total === 0) return {};
    
    Object.entries(analytics.typeBreakdown).forEach(([type, count]) => {
      result[type] = Math.round((count / total) * 100);
    });
    
    return result;
  }, [analytics.typeBreakdown, analytics.totalCount]);

  return (
    <div className="media-analytics">
      <h2 className="analytics-title">Media Analytics</h2>
      
      <div className="analytics-summary">
        <div className="analytics-card">
          <div className="analytics-card-value">{analytics.totalCount}</div>
          <div className="analytics-card-label">Total Files</div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-card-value">{mediaUtils.formatFileSize(analytics.totalSize)}</div>
          <div className="analytics-card-label">Total Size</div>
        </div>
      </div>
      
      {analytics.totalCount > 0 && (
        <>
          <div className="analytics-breakdown">
            <h3>Media Type Breakdown</h3>
            <div className="breakdown-bars">
              {Object.entries(analytics.typeBreakdown).map(([type, count]) => (
                <div key={type} className="breakdown-item">
                  <div className="breakdown-label">
                    <span className="breakdown-type">{type}</span>
                    <span className="breakdown-count">{count} files</span>
                  </div>
                  <div className="breakdown-bar-container">
                    <div 
                      className={`breakdown-bar breakdown-bar-${type}`}
                      style={{ width: `${typePercentages[type]}%` }}
                    />
                    <span className="breakdown-percentage">{typePercentages[type]}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="analytics-recent">
            <h3>Recent Uploads</h3>
            {analytics.recentUploads.length > 0 ? (
              <ul className="recent-list">
                {analytics.recentUploads.map(file => (
                  <li key={file.key} className="recent-item">
                    <div className="recent-file-icon">
                      {file.type === 'audio' && '🎵'}
                      {file.type === 'image' && '🖼️'}
                      {file.type === 'document' && '📄'}
                    </div>
                    <div className="recent-file-details">
                      <div className="recent-file-name">{file.filename}</div>
                      <div className="recent-file-meta">
                        <span>{mediaUtils.formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{mediaUtils.formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-recent">No recent uploads</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MediaAnalytics;
