import React, { useState, useEffect } from 'react';
import './MediaSearch.css';

interface MediaSearchProps {
  onSearch: (searchTerm: string, type?: string) => void;
  initialSearchTerm?: string;
  initialType?: string;
}

const MediaSearch: React.FC<MediaSearchProps> = ({ 
  onSearch, 
  initialSearchTerm = '', 
  initialType = ''
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Update search when props change
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    setSelectedType(initialType);
  }, [initialSearchTerm, initialType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, selectedType || undefined);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedType('');
    onSearch('', undefined);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`media-search ${isExpanded ? 'expanded' : ''}`}>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search media..."
            className="search-input"
          />
          {searchTerm && (
            <button 
              type="button" 
              className="clear-button"
              onClick={handleClear}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <button 
          type="button" 
          className="filter-toggle"
          onClick={toggleExpanded}
          aria-label={isExpanded ? "Hide filters" : "Show filters"}
        >
          <span className="filter-icon">⚙️</span>
          <span className="filter-text">Filters</span>
        </button>

        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {isExpanded && (
        <div className="search-filters">
          <div className="filter-group">
            <label htmlFor="type-filter">Media Type</label>
            <select
              id="type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="audio">Audio</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
            </select>
          </div>

          <div className="filter-actions">
            <button 
              type="button" 
              className="filter-reset"
              onClick={handleClear}
            >
              Reset Filters
            </button>
            <button 
              type="button" 
              className="filter-apply"
              onClick={handleSearch}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSearch;
