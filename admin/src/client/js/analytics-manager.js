/**
 * Analytics Manager Component for Soundmaster Admin Dashboard
 * Handles analytics data visualization and reporting
 */

class AnalyticsManager {
  constructor() {
    this.charts = {};
    this.currentPeriod = 'week';
    this.contentType = 'all';
  }

  /**
   * Initialize the analytics manager component
   */
  async init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Load initial analytics data
    await this.loadAnalyticsData(this.currentPeriod);
    
    // Load content performance data
    await this.loadContentPerformance(this.contentType);
  }

  /**
   * Set up event listeners for analytics dashboard
   */
  setupEventListeners() {
    // Period selector
    document.querySelectorAll('.period-selector').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active button
        document.querySelectorAll('.period-selector').forEach(btn => {
          btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Get period from data attribute
        const period = button.getAttribute('data-period');
        this.loadAnalyticsData(period);
      });
    });
    
    // Content type selector
    document.getElementById('content-type-selector')?.addEventListener('change', (e) => {
      this.contentType = e.target.value;
      this.loadContentPerformance(this.contentType);
    });
    
    // Refresh button
    document.getElementById('refresh-analytics')?.addEventListener('click', () => {
      this.loadAnalyticsData(this.currentPeriod);
      this.loadContentPerformance(this.contentType);
    });
  }

  /**
   * Load analytics data from API
   * @param {string} period Time period (day, week, month, year)
   */
  async loadAnalyticsData(period) {
    try {
      this.currentPeriod = period;
      
      // Show loading indicators
      document.querySelectorAll('.analytics-loading').forEach(el => {
        el.style.display = 'block';
      });
      document.querySelectorAll('.analytics-content').forEach(el => {
        el.style.display = 'none';
      });
      
      // Fetch analytics data
      const response = await fetch(`/api/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Update summary metrics
          this.updateSummaryMetrics(data.data.summary);
          
          // Update charts
          this.updateCharts(data.data.charts);
          
          // Update sources and devices
          this.updateSourcesAndDevices(data.data.sources, data.data.devices);
        } else {
          this.showError('Failed to load analytics data');
        }
      } else {
        const error = await response.json();
        this.showError(error.error || 'Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      this.showError('Failed to load analytics data. Please try again later.');
    } finally {
      // Hide loading indicators
      document.querySelectorAll('.analytics-loading').forEach(el => {
        el.style.display = 'none';
      });
      document.querySelectorAll('.analytics-content').forEach(el => {
        el.style.display = 'block';
      });
    }
  }

  /**
   * Load content performance data from API
   * @param {string} contentType Content type (all, playlist, news, etc.)
   */
  async loadContentPerformance(contentType) {
    try {
      // Show loading indicator
      const loadingEl = document.getElementById('content-performance-loading');
      const contentEl = document.getElementById('content-performance-content');
      
      if (loadingEl) loadingEl.style.display = 'block';
      if (contentEl) contentEl.style.display = 'none';
      
      // Fetch content performance data
      const response = await fetch(`/api/analytics/content?type=${contentType}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Update content performance table
          this.updateContentPerformance(data.data);
        } else {
          this.showError('Failed to load content performance data', 'content-performance-error');
        }
      } else {
        const error = await response.json();
        this.showError(error.error || 'Failed to load content performance data', 'content-performance-error');
      }
    } catch (error) {
      console.error('Error loading content performance data:', error);
      this.showError('Failed to load content performance data. Please try again later.', 'content-performance-error');
    } finally {
      // Hide loading indicator
      const loadingEl = document.getElementById('content-performance-loading');
      const contentEl = document.getElementById('content-performance-content');
      
      if (loadingEl) loadingEl.style.display = 'none';
      if (contentEl) contentEl.style.display = 'block';
    }
  }

  /**
   * Update summary metrics
   * @param {object} summary Summary metrics data
   */
  updateSummaryMetrics(summary) {
    // Update visitor count
    const visitorCountEl = document.getElementById('visitor-count');
    if (visitorCountEl) {
      visitorCountEl.textContent = this.formatNumber(summary.totalVisitors);
    }
    
    // Update page views
    const pageViewsEl = document.getElementById('page-views');
    if (pageViewsEl) {
      pageViewsEl.textContent = this.formatNumber(summary.totalPageViews);
    }
    
    // Update bounce rate
    const bounceRateEl = document.getElementById('bounce-rate');
    if (bounceRateEl) {
      bounceRateEl.textContent = `${summary.bounceRate}%`;
    }
    
    // Update avg time on site
    const avgTimeEl = document.getElementById('avg-time');
    if (avgTimeEl) {
      avgTimeEl.textContent = this.formatTime(summary.avgTimeOnSite);
    }
    
    // Update avg pages per visit
    const avgPagesEl = document.getElementById('avg-pages');
    if (avgPagesEl) {
      avgPagesEl.textContent = summary.avgPagePerVisit;
    }
  }

  /**
   * Update charts with new data
   * @param {object} chartData Chart data
   */
  updateCharts(chartData) {
    // Get chart canvas
    const visitorChartCanvas = document.getElementById('visitor-chart');
    
    if (!visitorChartCanvas) return;
    
    // If chart already exists, destroy it
    if (this.charts.visitorChart) {
      this.charts.visitorChart.destroy();
    }
    
    // Create new chart
    const ctx = visitorChartCanvas.getContext('2d');
    this.charts.visitorChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Visitors',
            data: chartData.visitors,
            borderColor: '#15d2ef',
            backgroundColor: 'rgba(21, 210, 239, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          },
          {
            label: 'Page Views',
            data: chartData.pageViews,
            borderColor: '#071e24',
            backgroundColor: 'rgba(7, 30, 36, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  /**
   * Update sources and devices charts
   * @param {array} sources Traffic sources data
   * @param {array} devices Device types data
   */
  updateSourcesAndDevices(sources, devices) {
    // Get chart canvases
    const sourcesChartCanvas = document.getElementById('sources-chart');
    const devicesChartCanvas = document.getElementById('devices-chart');
    
    // Update sources chart
    if (sourcesChartCanvas) {
      // If chart already exists, destroy it
      if (this.charts.sourcesChart) {
        this.charts.sourcesChart.destroy();
      }
      
      // Create new chart
      const ctx = sourcesChartCanvas.getContext('2d');
      this.charts.sourcesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: sources.map(source => source.name),
          datasets: [{
            data: sources.map(source => source.percentage),
            backgroundColor: [
              '#15d2ef',
              '#071e24',
              '#3498db',
              '#e74c3c',
              '#95a5a6'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      });
    }
    
    // Update devices chart
    if (devicesChartCanvas) {
      // If chart already exists, destroy it
      if (this.charts.devicesChart) {
        this.charts.devicesChart.destroy();
      }
      
      // Create new chart
      const ctx = devicesChartCanvas.getContext('2d');
      this.charts.devicesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: devices.map(device => device.name),
          datasets: [{
            data: devices.map(device => device.percentage),
            backgroundColor: [
              '#071e24',
              '#15d2ef',
              '#9b59b6',
              '#f1c40f'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      });
    }
  }

  /**
   * Update content performance table
   * @param {array} contentData Content performance data
   */
  updateContentPerformance(contentData) {
    const tableBody = document.getElementById('content-performance-table')?.querySelector('tbody');
    
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows
    contentData.forEach(item => {
      const row = document.createElement('tr');
      
      // Format content type
      const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
      const typeClass = {
        'playlist': 'bg-warning',
        'news': 'bg-info',
        'show': 'bg-success'
      }[item.type] || 'bg-secondary';
      
      row.innerHTML = `
        <td>
          <div class="d-flex align-items-center">
            <span class="badge ${typeClass} me-2">${typeLabel}</span>
            <span>${item.title}</span>
          </div>
        </td>
        <td class="text-end">${this.formatNumber(item.views)}</td>
        <td class="text-end">${item.engagement}%</td>
        <td class="text-end">${this.formatTime(item.timeOnPage)}</td>
      `;
      
      tableBody.appendChild(row);
    });
  }

  /**
   * Format number with commas
   * @param {number} num Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    return num.toLocaleString();
  }

  /**
   * Format time in seconds to minutes and seconds
   * @param {number} seconds Time in seconds
   * @returns {string} Formatted time
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Show error message
   * @param {string} message Error message
   * @param {string} containerId Container ID to show error in
   */
  showError(message, containerId = 'analytics-error') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  }
}

/**
 * Initialize the analytics manager
 * This function is exported for use by the dashboard
 */
export function initAnalyticsManager() {
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    // Load Chart.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => {
      const analyticsManager = new AnalyticsManager();
      analyticsManager.init();
      
      // Make analyticsManager globally accessible
      window.analyticsManager = analyticsManager;
    };
    document.head.appendChild(script);
  } else {
    const analyticsManager = new AnalyticsManager();
    analyticsManager.init();
    
    // Make analyticsManager globally accessible
    window.analyticsManager = analyticsManager;
  }
  
  return window.analyticsManager;
}

// Initialize the analytics manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the analytics page and not already initialized
  if (document.getElementById('analytics-container') && !window.analyticsManager) {
    initAnalyticsManager();
  }
});
