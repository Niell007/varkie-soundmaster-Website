/**
 * Deploy Manager Component for Soundmaster Admin Dashboard
 * Handles website deployment functionality
 */

/**
 * Initialize the deployment manager
 */
export function initDeployManager() {
  // Get DOM elements
  const deployBtn = document.getElementById('deploy-website-btn');
  const deployStatusElement = document.getElementById('deploy-status');
  
  // Add event listeners
  if (deployBtn) {
    deployBtn.addEventListener('click', handleDeploy);
  }
}

/**
 * Handle website deployment
 */
async function handleDeploy() {
  // Get DOM elements
  const deployBtn = document.getElementById('deploy-website-btn');
  const deployStatusElement = document.getElementById('deploy-status');
  
  if (!deployBtn || !deployStatusElement) return;
  
  try {
    // Update UI to show deployment in progress
    deployBtn.disabled = true;
    deployBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deploying...';
    deployStatusElement.innerHTML = '<div class="alert alert-info">Deployment in progress...</div>';
    
    // Call deploy API
    const response = await fetch('/api/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Update UI to show successful deployment
      deployStatusElement.innerHTML = `
        <div class="alert alert-success">
          <i class="fas fa-check-circle"></i> ${data.message || 'Website deployed successfully!'}
        </div>
      `;
      
      // Show deployment details if available
      if (data.details) {
        const detailsList = document.createElement('ul');
        detailsList.className = 'list-group mt-3';
        
        Object.entries(data.details).forEach(([key, value]) => {
          const item = document.createElement('li');
          item.className = 'list-group-item d-flex justify-content-between align-items-center';
          item.innerHTML = `
            <span>${key}</span>
            <span class="badge bg-primary rounded-pill">${value}</span>
          `;
          detailsList.appendChild(item);
        });
        
        deployStatusElement.appendChild(detailsList);
      }
    } else {
      // Update UI to show deployment failure
      deployStatusElement.innerHTML = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle"></i> ${data.error || 'Deployment failed'}
        </div>
      `;
    }
  } catch (error) {
    console.error('Error deploying website:', error);
    
    // Update UI to show error
    deployStatusElement.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-triangle"></i> Error deploying website: ${error.message}
      </div>
    `;
  } finally {
    // Reset button state
    deployBtn.disabled = false;
    deployBtn.innerHTML = '<i class="fas fa-rocket"></i> Deploy Website';
    
    // Add timestamp
    const timestamp = new Date().toLocaleString();
    const timestampElement = document.createElement('div');
    timestampElement.className = 'text-muted small mt-2';
    timestampElement.textContent = `Last deployment attempt: ${timestamp}`;
    deployStatusElement.appendChild(timestampElement);
  }
}
