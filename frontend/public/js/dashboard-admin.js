// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Utility function to get auth token
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

// ==================== OVERVIEW SECTION ====================
async function loadOverviewStats() {
    try {
        const token = getAuthToken();
        
        // If no token, use dummy data for now
        if (!token) {
            console.warn('No auth token found, using dummy data');
            updateStatsWithDummyData();
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn('Failed to fetch stats, using dummy data');
            updateStatsWithDummyData();
            return;
        }
        
        const data = await response.json();
        
        // Update dashboard cards
        const cards = document.querySelectorAll('.dashboard-cards .card-value');
        if (cards.length >= 4) {
            cards[0].textContent = data.totalUsers || 0;
            cards[1].textContent = data.totalEvents || 0;
            cards[2].textContent = data.totalStudents || 0;
            cards[3].textContent = data.totalInstitutes || 0;
        }
    } catch (error) {
        console.error('Error loading overview stats:', error);
        updateStatsWithDummyData();
    }
}

function updateStatsWithDummyData() {
    const cards = document.querySelectorAll('.dashboard-cards .card-value');
    if (cards.length >= 4) {
        cards[0].textContent = '0';
        cards[1].textContent = '0';
        cards[2].textContent = '0';
        cards[3].textContent = '0';
    }
}

// ==================== STUDENTS SECTION ====================
async function loadStudents() {
    try {
        const token = getAuthToken();
        
        if (!token) {
            displayNoAuthMessage('students-section', 8);
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/students`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            displayNoAuthMessage('students-section', 8);
            return;
        }
        
        const data = await response.json();
        displayStudents(data.students || []);
    } catch (error) {
        console.error('Error loading students:', error);
        displayNoAuthMessage('students-section', 8);
    }
}

function displayStudents(students) {
    const tableBody = document.querySelector('#students-section tbody');
    if (!tableBody) return;

    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    No students registered yet
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = students.map(student => `
        <tr>
            <td>${student.username || 'N/A'}</td>
            <td>${student.fullname || 'N/A'}</td>
            <td>${student.email || 'N/A'}</td>
            <td>${student.phone || 'N/A'}</td>
            <td>${student.studentId || 'N/A'}</td>
            <td>${student.major || 'N/A'}</td>
            <td>${student.university || 'N/A'}</td>
            <td>
                <button class="action-btn view" onclick="viewStudentDetails('${student._id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editStudent('${student._id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteStudent('${student._id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewStudentDetails(id) {
    console.log('View student:', id);
    showNotification('View details feature coming soon', 'info');
}

function editStudent(id) {
    console.log('Edit student:', id);
    showNotification('Edit feature coming soon', 'info');
}

async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student?')) return;
    console.log('Delete student:', id);
    showNotification('Delete feature coming soon', 'info');
}

// ==================== INSTITUTES SECTION ====================
async function loadInstitutes() {
    try {
        const token = getAuthToken();
        
        if (!token) {
            displayNoAuthMessage('institutes-section', 11);
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/institutes`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            displayNoAuthMessage('institutes-section', 11);
            return;
        }
        
        const data = await response.json();
        displayInstitutes(data.institutes || []);
    } catch (error) {
        console.error('Error loading institutes:', error);
        displayNoAuthMessage('institutes-section', 11);
    }
}

function displayInstitutes(institutes) {
    const tableBody = document.querySelector('#institutes-section tbody');
    if (!tableBody) return;

    if (institutes.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px;">
                    No institutes registered yet
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = institutes.map(institute => `
        <tr>
            <td>${institute.instituteName || 'N/A'}</td>
            <td>${institute.instituteType || 'N/A'}</td>
            <td>${institute.email || 'N/A'}</td>
            <td>${institute.phone || 'N/A'}</td>
            <td>${institute.city || 'N/A'}</td>
            <td>${institute.state || 'N/A'}</td>
            <td>${institute.establishedYear || 'N/A'}</td>
            <td>${institute.contactPersonName || 'N/A'}</td>
            <td>${institute.designation || 'N/A'}</td>
            <td>${institute.website ? `<a href="${institute.website}" target="_blank">${institute.website}</a>` : 'N/A'}</td>
            <td>
                <button class="action-btn view" onclick="viewInstituteDetails('${institute._id}')" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editInstitute('${institute._id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn reject" onclick="blockInstitute('${institute._id}')" title="Block">
                    <i class="fas fa-ban"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewInstituteDetails(id) {
    console.log('View institute:', id);
    showNotification('View details feature coming soon', 'info');
}

function editInstitute(id) {
    console.log('Edit institute:', id);
    showNotification('Edit feature coming soon', 'info');
}

function blockInstitute(id) {
    if (!confirm('Are you sure you want to block this institute?')) return;
    console.log('Block institute:', id);
    showNotification('Block feature coming soon', 'info');
}

// ==================== EVENTS SECTION ====================
async function loadAllEvents() {
    try {
        const token = getAuthToken();
        
        if (!token) {
            displayNoAuthMessage('events-section', 7);
            return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/events`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            displayNoAuthMessage('events-section', 7);
            return;
        }
        
        const data = await response.json();
        displayEvents(data.events || []);
    } catch (error) {
        console.error('Error loading events:', error);
        displayNoAuthMessage('events-section', 7);
    }
}

function displayEvents(events) {
    const tableBody = document.querySelector('#events-section tbody');
    if (!tableBody) return;

    if (events.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    No events created yet
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = events.map(event => {
        const instituteName = event.instituteId?.instituteName || 'N/A';
        const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const participants = event.registeredStudents?.length || 0;
        const statusClass = event.status.toLowerCase();

        return `
            <tr>
                <td>${event.eventName}</td>
                <td>${instituteName}</td>
                <td>${eventDate}</td>
                <td>${participants}</td>
                <td>${event.eventType}</td>
                <td><span class="status ${statusClass}">${event.status}</span></td>
                <td>
                    <button class="action-btn view" onclick="viewEventDetails('${event._id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="editEvent('${event._id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn reject" onclick="cancelEvent('${event._id}')" title="Cancel">
                        <i class="fas fa-ban"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewEventDetails(id) {
    console.log('View event:', id);
    showNotification('View details feature coming soon', 'info');
}

function editEvent(id) {
    console.log('Edit event:', id);
    showNotification('Edit feature coming soon', 'info');
}

function cancelEvent(id) {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    console.log('Cancel event:', id);
    showNotification('Cancel feature coming soon', 'info');
}

// ==================== FEEDBACKS SECTION ====================
async function loadFeedbacks() {
    try {
        const response = await fetch(`${API_BASE_URL}/feedback/all`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log('Fetched feedback data:', data);
        displayFeedbacks(data);
    } catch (error) {
        console.error('Error fetching feedbacks:', error);
        const tableBody = document.getElementById('feedbackTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="error-message">
                        <i class="fas fa-exclamation-circle"></i> Failed to load feedbacks. Please try again.
                    </td>
                </tr>
            `;
        }
    }
}

function displayFeedbacks(feedbacks) {
    const tableBody = document.getElementById('feedbackTableBody');
    if (!tableBody) return;

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
                <span class="future-use ${feedback.futureUse ? 'yes' : 'no'}">
                    ${feedback.futureUse ? 'Yes' : 'No'}
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

function viewFeedbackDetails(id) {
    console.log('Viewing feedback:', id);
    showNotification('View details feature coming soon', 'info');
}

async function deleteFeedback(id) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/feedback/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete feedback');

        showNotification('Feedback deleted successfully', 'success');
        loadFeedbacks();
    } catch (error) {
        console.error('Error deleting feedback:', error);
        showNotification('Failed to delete feedback. Please try again.', 'error');
    }
}

// ==================== HELPER FUNCTIONS ====================
function displayNoAuthMessage(sectionId, colspan) {
    const tableBody = document.querySelector(`#${sectionId} tbody`);
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colspan}" style="text-align: center; padding: 40px;">
                    <i class="fas fa-lock" style="font-size: 2rem; color: #999; margin-bottom: 10px;"></i>
                    <p>Please login as admin to view this data</p>
                </td>
            </tr>
        `;
    }
}

// ==================== TAB SWITCHING ====================
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-section`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active to clicked menu item
    const menuItem = document.querySelector(`.menu-item[data-section="${tabName}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }

    // Load data based on tab - ONLY load for the active tab
    switch(tabName) {
        case 'overview':
            loadOverviewStats();
            break;
        case 'students':
            loadStudents();
            break;
        case 'institutes':
            loadInstitutes();
            break;
        case 'events':
            loadAllEvents();
            break;
        case 'feedbacks':
            loadFeedbacks(); // Only load feedbacks when feedbacks tab is clicked
            break;
    }

    // Update page title
    const titles = {
        'overview': '<i class="fas fa-tachometer-alt"></i> Admin Dashboard',
        'institutes': '<i class="fas fa-university"></i> Institute Management',
        'students': '<i class="fas fa-user-graduate"></i> Student Management',
        'events': '<i class="fas fa-calendar-check"></i> All Events',
        'feedbacks': '<i class="fas fa-comments"></i> Feedbacks & Reviews'
    };

    const pageTitle = document.getElementById('page-title');
    if (pageTitle && titles[tabName]) {
        pageTitle.innerHTML = titles[tabName];
    }
}

// ==================== NOTIFICATION SYSTEM ====================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== SEARCH FUNCTIONALITY ====================
function initializeSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const table = this.closest('.section-container')?.querySelector('tbody');
            if (table) {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }
        });
    });
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin dashboard initializing...');
    
    // Initialize menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section) {
                switchTab(section);
            }
        });
    });

    // Initialize search
    initializeSearch();

    // Logout functionality
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('authToken');
                window.location.href = 'login-admin.html';
            }
        });
    }

    // Load initial overview data ONLY (not feedbacks)
    loadOverviewStats();
    
    console.log('Admin dashboard initialized');
});

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);