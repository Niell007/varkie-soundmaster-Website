// Test script for Soundmaster Admin API
// This script tests the core API endpoints for the admin panel

async function testAdminAPI() {
  const baseUrl = 'http://localhost:8787';
  let authToken = null;
  
  console.log('🧪 Starting Soundmaster Admin API Tests');
  console.log('======================================');
  
  // Test authentication
  try {
    console.log('\n🔑 Testing Authentication API');
    console.log('----------------------------');
    
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@soundmaster.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok && loginData.token) {
      console.log('✅ Login successful');
      authToken = loginData.token;
    } else {
      console.log('❌ Login failed:', loginData.message || 'Unknown error');
      return;
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return;
  }
  
  // Test playlist API
  try {
    console.log('\n🎵 Testing Playlist API');
    console.log('----------------------');
    
    // Get all playlists
    const playlistsResponse = await fetch(`${baseUrl}/api/playlists`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const playlistsData = await playlistsResponse.json();
    
    if (playlistsResponse.ok) {
      console.log(`✅ Retrieved ${playlistsData.playlists?.length || 0} playlists`);
    } else {
      console.log('❌ Failed to retrieve playlists:', playlistsData.error || 'Unknown error');
    }
    
    // Create a test playlist
    const createPlaylistResponse = await fetch(`${baseUrl}/api/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Test Playlist',
        description: 'A test playlist created by the API test script',
        track_count: 10,
        duration: '45:30',
        featured: false
      })
    });
    
    const createPlaylistData = await createPlaylistResponse.json();
    
    if (createPlaylistResponse.ok && createPlaylistData.success) {
      console.log('✅ Created test playlist');
      
      // Test updating the playlist
      const playlistId = createPlaylistData.playlist.id;
      
      const updatePlaylistResponse = await fetch(`${baseUrl}/api/playlists/${playlistId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Updated Test Playlist',
          description: 'This playlist was updated by the API test script',
          featured: true
        })
      });
      
      const updatePlaylistData = await updatePlaylistResponse.json();
      
      if (updatePlaylistResponse.ok && updatePlaylistData.success) {
        console.log('✅ Updated test playlist');
      } else {
        console.log('❌ Failed to update playlist:', updatePlaylistData.error || 'Unknown error');
      }
      
      // Test deleting the playlist
      const deletePlaylistResponse = await fetch(`${baseUrl}/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const deletePlaylistData = await deletePlaylistResponse.json();
      
      if (deletePlaylistResponse.ok && deletePlaylistData.success) {
        console.log('✅ Deleted test playlist');
      } else {
        console.log('❌ Failed to delete playlist:', deletePlaylistData.error || 'Unknown error');
      }
    } else {
      console.log('❌ Failed to create test playlist:', createPlaylistData.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Playlist API test failed:', error.message);
  }
  
  // Test news API
  try {
    console.log('\n📰 Testing News API');
    console.log('------------------');
    
    // Get all news items
    const newsResponse = await fetch(`${baseUrl}/api/news`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const newsData = await newsResponse.json();
    
    if (newsResponse.ok) {
      console.log(`✅ Retrieved ${newsData.newsItems?.length || 0} news items`);
    } else {
      console.log('❌ Failed to retrieve news items:', newsData.error || 'Unknown error');
    }
    
    // Create a test news item
    const createNewsResponse = await fetch(`${baseUrl}/api/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'Test News Article',
        content: '<p>This is a test news article created by the API test script.</p>',
        summary: 'A test news article for API testing',
        publishDate: new Date().toISOString().split('T')[0],
        featured: false
      })
    });
    
    const createNewsData = await createNewsResponse.json();
    
    if (createNewsResponse.ok && createNewsData.success) {
      console.log('✅ Created test news article');
      
      // Test updating the news item
      const newsId = createNewsData.newsItem.id;
      
      const updateNewsResponse = await fetch(`${baseUrl}/api/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          title: 'Updated Test News Article',
          content: '<p>This news article was updated by the API test script.</p>',
          featured: true
        })
      });
      
      const updateNewsData = await updateNewsResponse.json();
      
      if (updateNewsResponse.ok && updateNewsData.success) {
        console.log('✅ Updated test news article');
      } else {
        console.log('❌ Failed to update news article:', updateNewsData.error || 'Unknown error');
      }
      
      // Test deleting the news item
      const deleteNewsResponse = await fetch(`${baseUrl}/api/news/${newsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      const deleteNewsData = await deleteNewsResponse.json();
      
      if (deleteNewsResponse.ok && deleteNewsData.success) {
        console.log('✅ Deleted test news article');
      } else {
        console.log('❌ Failed to delete news article:', deleteNewsData.error || 'Unknown error');
      }
    } else {
      console.log('❌ Failed to create test news article:', createNewsData.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ News API test failed:', error.message);
  }
  
  // Test schedule API
  try {
    console.log('\n📅 Testing Schedule API');
    console.log('----------------------');
    
    // Get all schedule items
    const scheduleResponse = await fetch(`${baseUrl}/api/schedule`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const scheduleData = await scheduleResponse.json();
    
    if (scheduleResponse.ok) {
      console.log(`✅ Retrieved ${scheduleData.scheduleItems?.length || 0} schedule items`);
    } else {
      console.log('❌ Failed to retrieve schedule items:', scheduleData.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Schedule API test failed:', error.message);
  }
  
  // Test deployment API
  try {
    console.log('\n🚀 Testing Deployment API');
    console.log('------------------------');
    
    const deployResponse = await fetch(`${baseUrl}/api/deploy`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    const deployData = await deployResponse.json();
    
    if (deployResponse.ok && deployData.success) {
      console.log('✅ Website deployed successfully');
    } else {
      console.log('❌ Failed to deploy website:', deployData.error || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Deployment API test failed:', error.message);
  }
  
  console.log('\n======================================');
  console.log('🏁 API Tests Completed');
}

// Run the tests
testAdminAPI().catch(error => {
  console.error('❌ Test script failed:', error);
});
