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
    try {
        const response = await fetch('http://localhost:5000/api/feedback/all');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched feedback data:', data); // Debug log
        displayFeedbacks(data);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        document.getElementById('feedbackTableBody').innerHTML = `
            <tr>
                <td colspan="7" class="error-message">
                    <i class="fas fa-exclamation-circle"></i> Failed to load feedbacks. Please try again.
                </td>
            </tr>
        `;
    }
}

// Function to display feedbacks in table
function displayFeedbacks(feedbacks) {
    const tableBody = document.getElementById('feedbackTableBody');
    if (!feedbacks || feedbacks.length === 0) {
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
            <td>
                <span class="user-type ${feedback.userType.toLowerCase()}">
                    ${feedback.userType}
                </span>
            </td>
            <td>
                <div class="rating">
                    ${generateStars(feedback.rating)}
                    <span class="rating-text">${feedback.rating}/5</span>
                </div>
            </td>
            <td>
                ${feedback.benefits ? feedback.benefits.map(benefit => 
                    `<span class="benefit-tag">${benefit}</span>`
                ).join(' ') : 'No benefits listed'}
            </td>
            <td>
                <span class="future-use ${feedback.futureUse === 'yes' ? 'yes' : 'no'}">
                    ${feedback.futureUse}
                </span>
            </td>
            <td class="suggestions-cell" title="${feedback.suggestions || ''}">
                ${feedback.suggestions || 'No suggestions provided'}
            </td>
            <td>${new Date(feedback.submittedAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-action btn-view" onclick="viewFeedbackDetails('${feedback._id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteFeedback('${feedback._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Function to view feedback details (modal or detailed view)
function viewFeedbackDetails(id) {
    const feedback = document.querySelector(`tr[data-id="${id}"]`);
    if (feedback) {
        // Implement detailed view functionality here
        console.log('Viewing feedback:', id);
    }
}

// Function to delete feedback
async function deleteFeedback(id) {
    if (!confirm('Are you sure you want to delete this feedback?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/feedback/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete feedback');
        }

        alert('Feedback deleted successfully');
        fetchFeedbacks(); // Refresh the table
    } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Failed to delete feedback. Please try again.');
    }
}

// Initialize feedback loading
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is on feedbacks section
    const feedbacksSection = document.getElementById('feedbacks-section');
    if (feedbacksSection) {
        fetchFeedbacks();
    }
});
// Removed stray code block causing syntax error

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
