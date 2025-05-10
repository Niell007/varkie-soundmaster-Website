import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { mediaUtils } from '../utils/mediaUtils';
import MediaAnalytics from '../components/media/MediaAnalytics';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { token, user } = useAuthContext();
  const [stats, setStats] = useState({
    totalMedia: 0,
    audioCount: 0,
    imageCount: 0,
    documentCount: 0
  });
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        
        // Fetch media stats
        const mediaFiles = await mediaUtils.fetchMedia('/api', token);
        
        // Store media files for analytics
        setMediaFiles(mediaFiles);
        
        // Calculate stats
        const audioFiles = mediaFiles.filter(file => file.type === 'audio');
        const imageFiles = mediaFiles.filter(file => file.type === 'image');
        const documentFiles = mediaFiles.filter(file => file.type === 'document');
        
        setStats({
          totalMedia: mediaFiles.length,
          audioCount: audioFiles.length,
          imageCount: imageFiles.length,
          documentCount: documentFiles.length
        });
      } catch (err) {
        setError('Failed to load dashboard stats');
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || 'Admin'}</p>
      </div>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalMedia}</h3>
            <p className="stat-label">Total Media</p>
          </div>
        </div>
        
        <div className="stat-card audio">
          <div className="stat-icon">🎵</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.audioCount}</h3>
            <p className="stat-label">Audio Files</p>
          </div>
        </div>
        
        <div className="stat-card image">
          <div className="stat-icon">🖼️</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.imageCount}</h3>
            <p className="stat-label">Images</p>
          </div>
        </div>
        
        <div className="stat-card document">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.documentCount}</h3>
            <p className="stat-label">Documents</p>
          </div>
        </div>
      </div>
      
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/media" className="action-button">
            <span className="action-icon">📁</span>
            <span className="action-text">Media Library</span>
          </Link>
          
          <Link to="/media?upload=true" className="action-button">
            <span className="action-icon">⬆️</span>
            <span className="action-text">Upload Media</span>
          </Link>
          
          <Link to="/settings" className="action-button">
            <span className="action-icon">⚙️</span>
            <span className="action-text">Settings</span>
          </Link>
        </div>
      </div>
      
      {/* Media Analytics Section */}
      <div className="dashboard-section">
        <h2>Media Insights</h2>
        <MediaAnalytics mediaFiles={mediaFiles} />
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">⬆️</div>
            <div className="activity-content">
              <p className="activity-text">New media uploaded</p>
              <p className="activity-time">Just now</p>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">🔄</div>
            <div className="activity-content">
              <p className="activity-text">Media metadata updated</p>
              <p className="activity-time">2 hours ago</p>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">🗑️</div>
            <div className="activity-content">
              <p className="activity-text">Media deleted</p>
              <p className="activity-time">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
