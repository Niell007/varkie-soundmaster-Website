// Analytics API for Soundmaster Admin Dashboard
import { Env } from '../types/env';
import { RequestWithParams } from '../types/request';
import { verifyToken } from './auth';

/**
 * Get analytics data
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with analytics data
 */
export async function getAnalytics(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'week';
    
    // Mock analytics data based on period
    // In a real application, this would come from a database or analytics service
    const analyticsData = generateMockAnalyticsData(period);
    
    return new Response(JSON.stringify({
      success: true,
      period,
      data: analyticsData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    return new Response(JSON.stringify({ error: 'Failed to get analytics data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get content performance data
 * @param request Request object
 * @param env Cloudflare environment
 * @returns Response with content performance data
 */
export async function getContentPerformance(request: RequestWithParams, env: Env): Promise<Response> {
  try {
    // Verify token
    const user = await verifyToken(request, env);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const contentType = url.searchParams.get('type') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // Get top performing content
    // In a real application, this would come from a database or analytics service
    const contentData = generateMockContentPerformance(contentType, limit);
    
    return new Response(JSON.stringify({
      success: true,
      contentType,
      data: contentData
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting content performance:', error);
    return new Response(JSON.stringify({ error: 'Failed to get content performance data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generate mock analytics data
 * @param period Time period (day, week, month, year)
 * @returns Mock analytics data
 */
function generateMockAnalyticsData(period: string) {
  let dataPoints = 0;
  let startDate = new Date();
  
  switch (period) {
    case 'day':
      dataPoints = 24; // Hours in a day
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      dataPoints = 7; // Days in a week
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      dataPoints = 30; // Approx. days in a month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      dataPoints = 12; // Months in a year
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      dataPoints = 7; // Default to week
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
  }
  
  // Generate visitors data
  const visitors = [];
  const pageViews = [];
  const labels = [];
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date(startDate);
    
    switch (period) {
      case 'day':
        date.setHours(date.getHours() + i);
        labels.push(date.getHours() + ':00');
        break;
      case 'week':
        date.setDate(date.getDate() + i);
        labels.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]);
        break;
      case 'month':
        date.setDate(date.getDate() + i);
        labels.push(date.getDate().toString());
        break;
      case 'year':
        date.setMonth(date.getMonth() + i);
        labels.push(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()]);
        break;
    }
    
    // Generate random data with some patterns
    const baseVisitors = period === 'day' ? 
      (i >= 8 && i <= 20 ? 50 + Math.floor(Math.random() * 100) : 10 + Math.floor(Math.random() * 30)) : 
      100 + Math.floor(Math.random() * 200);
    
    const visitorCount = baseVisitors;
    const pageViewCount = visitorCount * (1.5 + Math.random());
    
    visitors.push(visitorCount);
    pageViews.push(Math.floor(pageViewCount));
  }
  
  // Calculate totals and averages
  const totalVisitors = visitors.reduce((sum, count) => sum + count, 0);
  const totalPageViews = pageViews.reduce((sum, count) => sum + count, 0);
  const avgTimeOnSite = Math.floor(120 + Math.random() * 180); // 2-5 minutes in seconds
  const bounceRate = 25 + Math.floor(Math.random() * 15); // 25-40%
  
  return {
    summary: {
      totalVisitors,
      totalPageViews,
      avgTimeOnSite,
      bounceRate,
      avgPagePerVisit: +(totalPageViews / totalVisitors).toFixed(2)
    },
    charts: {
      labels,
      visitors,
      pageViews
    },
    sources: [
      { name: 'Direct', percentage: 35 + Math.floor(Math.random() * 10) },
      { name: 'Search', percentage: 25 + Math.floor(Math.random() * 10) },
      { name: 'Social', percentage: 20 + Math.floor(Math.random() * 10) },
      { name: 'Referral', percentage: 10 + Math.floor(Math.random() * 10) },
      { name: 'Other', percentage: 5 + Math.floor(Math.random() * 5) }
    ],
    devices: [
      { name: 'Desktop', percentage: 45 + Math.floor(Math.random() * 10) },
      { name: 'Mobile', percentage: 40 + Math.floor(Math.random() * 10) },
      { name: 'Tablet', percentage: 10 + Math.floor(Math.random() * 5) },
      { name: 'Other', percentage: 1 + Math.floor(Math.random() * 3) }
    ]
  };
}

/**
 * Generate mock content performance data
 * @param contentType Content type (all, playlist, news, etc.)
 * @param limit Number of items to return
 * @returns Mock content performance data
 */
function generateMockContentPerformance(contentType: string, limit: number) {
  const contentTypes = ['playlist', 'news', 'show'];
  const titles: Record<string, string[]> = {
    playlist: [
      'Summer Vibes 2025', 'Classic Rock Anthems', 'Chill Lounge Mix',
      'Top 40 Hits', 'Indie Discoveries', 'Jazz Essentials',
      'Electronic Dance Party', 'Acoustic Sessions', 'Hip Hop Classics',
      'Workout Motivation', 'Relaxing Ambient', 'Road Trip Mix'
    ],
    news: [
      'New Studio Opening Next Month', 'Interview with Famous DJ',
      'Music Festival Announced', 'Award Show Highlights',
      'New Album Reviews', 'Artist Spotlight Series',
      'Industry News Roundup', 'Upcoming Concert Dates',
      'Behind the Scenes Look', 'Charity Event Coverage',
      'Technology in Music', 'Throwback Thursday Feature'
    ],
    show: [
      'Morning Breakfast Show', 'Afternoon Delight', 'Evening Commute',
      'Late Night Sessions', 'Weekend Special', 'Interview Hour',
      'Request Line Live', 'DJ Spotlight', 'Genre Deep Dive',
      'Music History Hour', 'New Releases Show', 'Throwback Thursday'
    ]
  };
  
  const result = [];
  
  // If specific content type is requested
  if (contentType !== 'all' && contentType in titles) {
    const typeTitles = titles[contentType] || [];
    for (let i = 0; i < Math.min(limit, typeTitles.length); i++) {
      result.push({
        id: `${contentType}-${i + 1}`,
        title: typeTitles[i],
        type: contentType,
        views: 1000 + Math.floor(Math.random() * 9000),
        engagement: 5 + Math.floor(Math.random() * 15),
        timeOnPage: 30 + Math.floor(Math.random() * 270)
      });
    }
  } else {
    // Mix of all content types
    let count = 0;
    while (count < limit) {
      for (const type of contentTypes) {
        if (count >= limit) break;
        
        const typeTitles = titles[type] || [];
        const typeIndex = Math.floor(Math.random() * typeTitles.length);
        result.push({
          id: `${type}-${typeIndex + 1}`,
          title: typeTitles[typeIndex],
          type,
          views: 1000 + Math.floor(Math.random() * 9000),
          engagement: 5 + Math.floor(Math.random() * 15),
          timeOnPage: 30 + Math.floor(Math.random() * 270)
        });
        
        count++;
      }
    }
  }
  
  // Sort by views (descending)
  return result.sort((a, b) => b.views - a.views);
}
