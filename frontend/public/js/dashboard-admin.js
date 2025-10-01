// Configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your deployed URL

// Utility function to get auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Function to format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to fetch feedbacks
async function fetchFeedbacks() {
    const token = getAuthToken();
    if (!token) {
        console.error('No auth token found');
        return;
    }

    try {
        const response = await fetch('/api/feedbacks', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch feedbacks');
        }

        const feedbacks = await response.json();
        displayFeedbacks(feedbacks);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        document.getElementById('feedbackTableBody').innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: red; padding: 20px;">
                    Failed to load feedbacks. Please try again later.
                </td>
            </tr>
        `;
    }
}

// Function to display feedbacks in table
function displayFeedbacks(feedbacks) {
    const tableBody = document.getElementById('feedbackTableBody');
    if (!feedbacks.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px;">
                    No feedbacks available
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = feedbacks.map(feedback => `
        <tr>
            <td>${feedback.userType}</td>
            <td>${feedback.rating}/5</td>
            <td>${feedback.benefits}</td>
            <td>${feedback.futureUse ? 'Yes' : 'No'}</td>
            <td>${feedback.suggestions || 'N/A'}</td>
            <td>${formatDate(feedback.submittedAt)}</td>
            <td>
                <button class="action-btn view" title="View Details" onclick="viewFeedbackDetails('${feedback.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete" title="Delete" onclick="deleteFeedback('${feedback.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Initialize feedback loading
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is on feedbacks section
    const feedbacksSection = document.getElementById('feedbacks-section');
    if (feedbacksSection) {
        fetchFeedbacks();
    }
});
/* The following block was removed because it was an orphaned HTML fragment causing a syntax error. */

// Function to update feedback count
function updateFeedbackCount(count) {
  const countElement = document.querySelector('#feedbackCount');
  if (countElement) {
    countElement.textContent = count;
  }
}

// Function to show error messages
function showError(message) {
  const tableBody = document.querySelector('#feedbackTableBody');
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 20px; color: #e74c3c;">
          ${message}
        </td>
      </tr>
    `;
  }
}

// Function to view feedback details (modal or detailed view)
function viewFeedbackDetails(feedbackId) {
  // Create modal to show full feedback details
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Feedback Details</h3>
        <button class="modal-close" onclick="closeModal()">&times;</button>
      </div>
      <div class="modal-body" id="feedbackDetailsBody">
        Loading...
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  // Fetch specific feedback details
  fetchSingleFeedback(feedbackId);
}

// Function to fetch single feedback
async function fetchSingleFeedback(feedbackId) {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/feedback`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    if (response.ok && result.success) {
      const feedback = result.data.find(f => f._id === feedbackId);
      if (feedback) {
        displayFeedbackDetails(feedback);
      }
    }
  } catch (error) {
    console.error('Error fetching feedback details:', error);
  }
}

// Function to display feedback details in modal
function displayFeedbackDetails(feedback) {
  const detailsBody = document.getElementById('feedbackDetailsBody');
  if (!detailsBody) return;
  
  const stars = '⭐'.repeat(feedback.rating);
  const benefits = feedback.benefits.map(b => 
    b.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  ).join(', ');
  
  detailsBody.innerHTML = `
    <div class="feedback-detail">
      <p><strong>User Type:</strong> ${feedback.userType.charAt(0).toUpperCase() + feedback.userType.slice(1)}</p>
      <p><strong>Rating:</strong> ${stars} (${feedback.rating}/5)</p>
      <p><strong>Benefits:</strong> ${benefits}</p>
      <p><strong>Future Use:</strong> ${feedback.futureUse.charAt(0).toUpperCase() + feedback.futureUse.slice(1)}</p>
      <p><strong>Suggestions:</strong> ${feedback.suggestions || 'No suggestions provided'}</p>
      <p><strong>Submitted:</strong> ${new Date(feedback.submittedAt).toLocaleString()}</p>
      ${feedback.userAgent ? `<p><strong>Device:</strong> ${feedback.userAgent}</p>` : ''}
    </div>
  `;
}

// Function to close modal
function closeModal() {
  const modal = document.querySelector('.modal-overlay');
  if (modal) {
    modal.remove();
  }
}

// Function to delete feedback
async function deleteFeedback(feedbackId) {
  if (!confirm('Are you sure you want to delete this feedback?')) {
    return;
  }

  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/admin/feedback/${feedbackId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert('Feedback deleted successfully');
      fetchFeedbacks(); // Refresh the list
    } else {
      alert(result.message || 'Failed to delete feedback');
    }
  } catch (error) {
    console.error('Error deleting feedback:', error);
    alert('Network error. Please try again.');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the admin dashboard page
  if (document.querySelector('#feedbackTableBody')) {
    fetchFeedbacks();
    
    // Optional: Auto-refresh every 30 seconds
    setInterval(fetchFeedbacks, 30000);
  }
});

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal();
  }
});
