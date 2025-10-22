// Main Dashboard JavaScript
const DOMAIN = "";

// Global state
let currentUser = null;
let destinations = [];
let currentDestination = null;

// DOM Elements
const userInfoEl = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const addDestinationBtn = document.getElementById('addDestinationBtn');
const refreshBtn = document.getElementById('refreshBtn');
const destinationsGrid = document.getElementById('destinationsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');

// Modal elements
const destinationModal = document.getElementById('destinationModal');
const shortUrlModal = document.getElementById('shortUrlModal');
const analyticsModal = document.getElementById('analyticsModal');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Check authentication
        await checkAuth();
        
        // Load user data
        await loadUserData();
        
        // Load destinations
        await loadDestinations();
        
        // Setup event listeners
        setupEventListeners();
        
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Failed to initialize dashboard');
    }
});

// Authentication check
async function checkAuth() {
    try {
        const response = await fetch(`${DOMAIN}/authservice/check`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = '/signin';
            return;
        }
        
        const data = await response.json();
        console.log('Auth check successful');
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/signin';
    }
}

// Load user data
async function loadUserData() {
    try {
        // Get user info from JWT token (you might need to decode it)
        // For now, we'll use a placeholder
        currentUser = { username: 'User' };
        userInfoEl.textContent = `Welcome, ${currentUser.username}`;
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

// Load destinations
async function loadDestinations() {
    try {
        showLoading(true);
        
        const response = await fetch(`${DOMAIN}/api/urls`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load destinations');
        }
        
        destinations = await response.json();
        renderDestinations();
        
    } catch (error) {
        console.error('Failed to load destinations:', error);
        showError('Failed to load destinations');
    } finally {
        showLoading(false);
    }
}

// Render destinations
function renderDestinations() {
    if (destinations.length === 0) {
        destinationsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    destinationsGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    destinationsGrid.innerHTML = destinations.map(destination => `
        <div class="destination-card" data-id="${destination._id}">
            <div class="destination-card-header">
                <div>
                    <div class="destination-label">${escapeHtml(destination.label)}</div>
                    <div class="destination-url">${escapeHtml(destination.destinationUrl)}</div>
                </div>
                <div class="destination-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewDestination('${destination._id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
            <div class="destination-description">${escapeHtml(destination.description || 'No description')}</div>
            <div class="destination-stats">
                <div class="stat">
                    <div class="stat-value">${destination.shortUrls?.length || 0}</div>
                    <div class="stat-label">Short URLs</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${destination.totalClicks || 0}</div>
                    <div class="stat-label">Total Clicks</div>
                </div>
                <div class="stat">
                    <div class="stat-value">${formatDate(destination.createdAt)}</div>
                    <div class="stat-label">Created</div>
                </div>
            </div>
        </div>
    `).join('');
}

// View destination details
async function viewDestination(destinationId) {
    try {
        currentDestination = destinations.find(d => d._id === destinationId);
        if (!currentDestination) {
            throw new Error('Destination not found');
        }
        
        // Load short URLs for this destination
        const response = await fetch(`${DOMAIN}/api/shorturls/destination/${destinationId}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Failed to load short URLs');
        }
        
        const shortUrls = await response.json();
        currentDestination.shortUrls = shortUrls;
        
        // Show destination modal
        showDestinationModal();
        
    } catch (error) {
        console.error('Failed to view destination:', error);
        showError('Failed to load destination details');
    }
}

// Show destination modal
function showDestinationModal() {
    const modalTitle = document.getElementById('modalTitle');
    const destinationDetails = document.getElementById('destinationDetails');
    
    modalTitle.textContent = currentDestination.label;
    
    destinationDetails.innerHTML = `
        <div class="destination-info">
            <div class="form-group">
                <label>Label</label>
                <input type="text" id="editLabel" value="${escapeHtml(currentDestination.label)}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <input type="text" id="editDescription" value="${escapeHtml(currentDestination.description || '')}">
            </div>
            <div class="form-group">
                <label>Destination URL</label>
                <input type="url" id="editUrl" value="${escapeHtml(currentDestination.destinationUrl)}">
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="updateDestination()">
                    <i class="fas fa-save"></i> Update
                </button>
                <button class="btn btn-danger" onclick="deleteDestination()">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
        
        <div class="short-urls-section">
            <div class="section-header">
                <h3>Short URLs</h3>
                <button class="btn btn-primary" onclick="showShortUrlModal()">
                    <i class="fas fa-plus"></i> Create Short URL
                </button>
            </div>
            <div class="short-urls-list">
                ${currentDestination.shortUrls?.map(shortUrl => `
                    <div class="short-url-item">
                        <div class="short-url-header">
                            <div>
                                <div class="short-url-alias">${escapeHtml(shortUrl.alias)}</div>
                                <div class="short-url-code">${window.location.origin}/${escapeHtml(shortUrl.shortCode)}</div>
                            </div>
                            <div class="short-url-actions">
                                <button class="btn btn-sm btn-success" onclick="copyToClipboard('${window.location.origin}/${shortUrl.shortCode}')">
                                    <i class="fas fa-copy"></i> Copy
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="downloadQR('${shortUrl._id}')">
                                    <i class="fas fa-qrcode"></i> QR
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="viewAnalytics('${shortUrl._id}')">
                                    <i class="fas fa-chart-bar"></i> Analytics
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteShortUrl('${shortUrl._id}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                        <div class="short-url-stats">
                            <span>Clicks: ${shortUrl.usageCount}</span>
                            <span>Created: ${formatDate(shortUrl.createdAt)}</span>
                            <span>Expires: ${shortUrl.ttl ? formatDate(shortUrl.ttl) : 'Never'}</span>
                            <span>Rate Limit: ${shortUrl.rateLimit || 'Unlimited'}</span>
                        </div>
                    </div>
                `).join('') || '<p>No short URLs created yet.</p>'}
            </div>
        </div>
    `;
    
    destinationModal.style.display = 'flex';
}

// Update destination
async function updateDestination() {
    try {
        const label = document.getElementById('editLabel').value;
        const description = document.getElementById('editDescription').value;
        const url = document.getElementById('editUrl').value;
        
        if (!label || !url) {
            showError('Label and URL are required');
            return;
        }
        
        const response = await fetch(`${DOMAIN}/api/urls/${currentDestination._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ label, description, destinationUrl: url })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update destination');
        }
        
        // Update local data
        const updatedDestination = await response.json();
        const index = destinations.findIndex(d => d._id === currentDestination._id);
        
        // Preserve short URLs when updating
        updatedDestination.shortUrls = currentDestination.shortUrls || [];
        destinations[index] = updatedDestination;
        currentDestination = updatedDestination;
        
        // Refresh the view
        renderDestinations();
        showDestinationModal();
        
        showSuccess('Destination updated successfully');
        
    } catch (error) {
        console.error('Failed to update destination:', error);
        showError('Failed to update destination');
    }
}

async function deleteDestination() {
    if (!confirm('Are you sure you want to delete this destination and all its short URLs?')) return;

    console.log('Deleting destination:', currentDestination._id); // debug

    try {
        const response = await fetch(`${DOMAIN}/api/urls/${currentDestination._id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete destination');
        }

        // Update local state
        destinations = destinations.filter(d => d._id !== currentDestination._id);

        // Close modal and refresh
        closeModal('destinationModal');
        renderDestinations();

        showSuccess('Destination deleted successfully');

    } catch (error) {
        console.error('Failed to delete destination:', error);
        showError('Failed to delete destination: ' + error.message);
    }
}

// Show short URL modal
function showShortUrlModal() {
    shortUrlModal.style.display = 'flex';
}

// Create short URL
async function createShortUrl(event) {
    event.preventDefault();
    
    try {
        const alias = document.getElementById('shortUrlAlias').value;
        const ttl = document.getElementById('shortUrlTTL').value;
        const rateLimit = document.getElementById('shortUrlRateLimit').value;
        
        const response = await fetch(`${DOMAIN}/api/shorturls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                destinationId: currentDestination._id,
                alias: alias || undefined,
                ttl: ttl || undefined,
                rateLimit: rateLimit ? parseInt(rateLimit) : undefined
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create short URL');
        }
        
        const shortUrl = await response.json();
        
        // Add to current destination
        if (!currentDestination.shortUrls) {
            currentDestination.shortUrls = [];
        }
        currentDestination.shortUrls.push(shortUrl);
        
        // Refresh the modal
        showDestinationModal();
        closeModal('shortUrlModal');
        
        // Clear form
        document.getElementById('shortUrlForm').reset();
        
        showSuccess('Short URL created successfully');
        
    } catch (error) {
        console.error('Failed to create short URL:', error);
        showError(error.message || 'Failed to create short URL');
    }
}

async function deleteShortUrl(shortUrlId) {
    if (!confirm('Are you sure you want to delete this short URL?')) return;

    console.log('Deleting short URL:', shortUrlId); // Debug

    try {
        const response = await fetch(`${DOMAIN}/api/shorturls/${shortUrlId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete short URL');
        }

        // Remove from current destination in memory
        currentDestination.shortUrls = currentDestination.shortUrls.filter(su => su._id !== shortUrlId);

        // Refresh modal
        showDestinationModal();
        showSuccess('Short URL deleted successfully');

    } catch (error) {
        console.error('Failed to delete short URL:', error);
        showError('Failed to delete short URL: ' + error.message);
    }
}

// Generate and download QR code
async function downloadQR(shortUrlId) {
  try {
    // Construct API call to backend
    const response = await fetch(`/api/shorturls/qr/${shortUrlId}`, {
  method: 'GET',
  credentials: 'include'
});


    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${shortUrlId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Failed to download QR code:', error);
    showError('Failed to generate QR code');
  }
}

// View analytics
async function viewAnalytics(shortUrlId) {
    try {
        console.log('Loading analytics for short URL:', shortUrlId);
        
        const response = await fetch(`${DOMAIN}/api/metrics/shorturl/${shortUrlId}`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Analytics API error:', response.status, errorText);
            throw new Error(`Failed to load analytics: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Analytics data received:', data);
        
        // Check if we have analytics data
        if (!data.analytics || data.analytics.summary.totalClicks === 0) {
            showAnalyticsModal({
                shortUrl: data.shortUrl || { alias: 'Unknown', shortCode: 'unknown' },
                analytics: {
                    summary: { totalClicks: 0, uniqueVisitors: 0 },
                    timeSeries: [],
                    countryDistribution: [],
                    deviceDistribution: [],
                    browserDistribution: []
                },
                rawData: []
            });
        } else {
            showAnalyticsModal(data);
        }
        
    } catch (error) {
        console.error('Failed to load analytics:', error);
        showError('Failed to load analytics: ' + error.message);
    }
}

// Show analytics modal
function showAnalyticsModal(data) {
    const analyticsContent = document.getElementById('analyticsContent');
    
    analyticsContent.innerHTML = `
        <div class="analytics-header">
            <h3><i class="fas fa-chart-line"></i> Analytics for ${data.shortUrl.alias}</h3>
            <p>Short URL: <code>${window.location.origin}/${data.shortUrl.shortCode}</code></p>
        </div>
        
        <div class="analytics-summary">
            <div class="analytics-card">
                <div class="analytics-card-value">${data.analytics.summary.totalClicks}</div>
                <div class="analytics-card-label">Total Clicks</div>
            </div>
            <div class="analytics-card">
                <div class="analytics-card-value">${data.analytics.summary.uniqueVisitors}</div>
                <div class="analytics-card-label">Unique Visitors</div>
            </div>
            <div class="analytics-card">
                <div class="analytics-card-value">${data.shortUrl.usageCount}</div>
                <div class="analytics-card-label">Usage Count</div>
            </div>
            <div class="analytics-card">
                <div class="analytics-card-value">${new Date(data.shortUrl.createdAt).toLocaleDateString()}</div>
                <div class="analytics-card-label">Created</div>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="chart-container">
                <h4><i class="fas fa-clock"></i> Click Timeline</h4>
                <canvas id="timelineChart" width="400" height="200"></canvas>
                ${data.analytics.timeSeries.length === 0 ? '<p style="text-align: center; color: #666; margin-top: 1rem;">No click data available yet</p>' : ''}
            </div>
            
            <div class="chart-container">
                <h4><i class="fas fa-globe"></i> Country Distribution</h4>
                <canvas id="countryChart" width="400" height="200"></canvas>
                ${data.analytics.countryDistribution.length === 0 ? '<p style="text-align: center; color: #666; margin-top: 1rem;">No geographic data available yet</p>' : ''}
            </div>
            
            <div class="chart-container">
                <h4><i class="fas fa-mobile-alt"></i> Device Distribution</h4>
                <canvas id="deviceChart" width="400" height="200"></canvas>
                ${data.analytics.deviceDistribution.length === 0 ? '<p style="text-align: center; color: #666; margin-top: 1rem;">No device data available yet</p>' : ''}
            </div>
            
            <div class="chart-container">
                <h4><i class="fas fa-browser"></i> Browser Distribution</h4>
                <canvas id="browserChart" width="400" height="200"></canvas>
                ${data.analytics.browserDistribution.length === 0 ? '<p style="text-align: center; color: #666; margin-top: 1rem;">No browser data available yet</p>' : ''}
            </div>
        </div>
        
        <div class="raw-data-section">
            <h4><i class="fas fa-database"></i> Recent Clicks</h4>
            <div class="clicks-table">
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Country</th>
                            <th>City</th>
                            <th>Device</th>
                            <th>Browser</th>
                            <th>IP</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.rawData.slice(0, 10).map(click => `
                            <tr>
                                <td>${new Date(click.timestamp).toLocaleString()}</td>
                                <td>${click.country}</td>
                                <td>${click.city}</td>
                                <td>${click.device}</td>
                                <td>${click.browser}</td>
                                <td>${click.ip}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    analyticsModal.style.display = 'flex';
    
    // Initialize charts after modal is shown
    setTimeout(() => {
        initializeCharts(data.analytics);
    }, 100);
}

// Initialize charts
function initializeCharts(analytics) {
    // Timeline chart
    const timelineCtx = document.getElementById('timelineChart').getContext('2d');
    const timelineData = analytics.timeSeries.length > 0 ? analytics.timeSeries : [{ date: new Date().toISOString().split('T')[0], count: 0 }];
    
    new Chart(timelineCtx, {
        type: 'line',
        data: {
            labels: timelineData.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [{
                label: 'Clicks',
                data: timelineData.map(item => item.count),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                }
            }
        }
    });
    
    // Country chart
    const countryCtx = document.getElementById('countryChart').getContext('2d');
    const countryData = analytics.countryDistribution.length > 0 ? analytics.countryDistribution : [{ country: 'No Data', count: 1 }];
    
    new Chart(countryCtx, {
        type: 'doughnut',
        data: {
            labels: countryData.map(item => item.country),
            datasets: [{
                data: countryData.map(item => item.count),
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
                    '#43e97b', '#fa709a', '#ffecd2', '#a8edea'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
    
    // Device chart
    const deviceCtx = document.getElementById('deviceChart').getContext('2d');
    const deviceData = analytics.deviceDistribution.length > 0 ? analytics.deviceDistribution : [{ device: 'No Data', count: 1 }];
    
    new Chart(deviceCtx, {
        type: 'bar',
        data: {
            labels: deviceData.map(item => item.device),
            datasets: [{
                label: 'Clicks',
                data: deviceData.map(item => item.count),
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
                borderColor: '#667eea',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Browser chart
    const browserCtx = document.getElementById('browserChart').getContext('2d');
    const browserData = analytics.browserDistribution.length > 0 ? analytics.browserDistribution : [{ browser: 'No Data', count: 1 }];
    
    new Chart(browserCtx, {
        type: 'pie',
        data: {
            labels: browserData.map(item => item.browser),
            datasets: [{
                data: browserData.map(item => item.count),
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess('Copied to clipboard!');
    } catch (error) {
        console.error('Failed to copy:', error);
        showError('Failed to copy to clipboard');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add destination
    addDestinationBtn.addEventListener('click', addDestination);
    
    // Refresh
    refreshBtn.addEventListener('click', loadDestinations);
    
    // Logout
    logoutBtn.addEventListener('click', logout);
    
    // Modal close buttons
    document.getElementById('closeModal').addEventListener('click', () => closeModal('destinationModal'));
    document.getElementById('closeShortUrlModal').addEventListener('click', () => closeModal('shortUrlModal'));
    document.getElementById('closeAnalyticsModal').addEventListener('click', () => closeModal('analyticsModal'));
    
    // Short URL form
    document.getElementById('shortUrlForm').addEventListener('submit', createShortUrl);
    document.getElementById('cancelShortUrl').addEventListener('click', () => closeModal('shortUrlModal'));
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Add destination
async function addDestination() {
    const label = document.getElementById('destinationLabel').value;
    const description = document.getElementById('destinationDescription').value;
    const url = document.getElementById('destinationUrl').value;
    
    if (!label || !url) {
        showError('Label and URL are required');
        return;
    }
    
    try {
        const response = await fetch(`${DOMAIN}/api/urls`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ label, description, destinationUrl: url })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create destination');
        }
        
        const destination = await response.json();
        destinations.unshift(destination);
        
        // Clear form
        document.getElementById('destinationLabel').value = '';
        document.getElementById('destinationDescription').value = '';
        document.getElementById('destinationUrl').value = '';
        
        // Refresh view
        renderDestinations();
        showSuccess('Destination created successfully');
        
    } catch (error) {
        console.error('Failed to create destination:', error);
        showError(error.message || 'Failed to create destination');
    }
}

// Logout
async function logout() {
    try {
        await fetch(`${DOMAIN}/authservice/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        window.location.href = '/signin';
    }
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Show loading
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

// Show error
function showError(message) {
    // Simple alert for now - you can replace with a better notification system
    alert('Error: ' + message);
}

// Show success
function showSuccess(message) {
    // Simple alert for now - you can replace with a better notification system
    alert('Success: ' + message);
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}
