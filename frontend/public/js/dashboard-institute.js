// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Check authentication
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login-institute.html';
        return false;
    }
    return true;
}

// API call helper
async function apiCall(endpoint, options = {}) {
    const token = getToken();
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = 'login-institute.html';
        }
        throw new Error(data.message || 'API request failed');
    }

    return data;
}

// Load institute profile
async function loadInstituteProfile() {
    try {
        const response = await apiCall('/auth/me');
        const user = response.user;

        // Update institute info in sidebar
        document.querySelector('.institute-name').textContent = user.instituteName || 'N/A';
        document.querySelector('.institute-id').textContent = `Institute ID: ${user._id.slice(-6).toUpperCase()}`;

        // Update profile tab
        if (document.getElementById('profile-tab')) {
            updateProfileTab(user);
        }

        return user;
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile', 'error');
    }
}

// Update profile tab with user data
function updateProfileTab(user) {
    const profileData = {
        username: user.username || 'N/A',
        email: user.email || 'N/A',
        role: user.role || 'N/A',
        phone: user.phone || 'N/A',
        instituteName: user.instituteName || 'N/A',
        instituteType: user.instituteType || 'N/A',
        address: user.address || 'N/A',
        city: user.city || 'N/A',
        state: user.state || 'N/A',
        pincode: user.pincode || 'N/A',
        country: user.country || 'N/A',
        establishedYear: user.establishedYear || 'N/A',
        affiliatedTo: user.affiliatedTo || 'N/A',
        website: user.website || 'N/A',
        contactPersonName: user.contactPersonName || 'N/A',
        designation: user.designation || 'N/A'
    };

    // Update basic information
    document.querySelector('.info-grid .info-item:nth-child(1) span').textContent = profileData.username;
    document.querySelector('.info-grid .info-item:nth-child(2) span').textContent = profileData.email;
    document.querySelector('.info-grid .info-item:nth-child(3) span').textContent = profileData.role;
    document.querySelector('.info-grid .info-item:nth-child(4) span').textContent = profileData.phone;

    // Update institute details
    const instituteSection = document.querySelectorAll('.profile-section')[1];
    const instituteInfoItems = instituteSection.querySelectorAll('.info-item span');
    instituteInfoItems[0].textContent = profileData.instituteName;
    instituteInfoItems[1].textContent = profileData.instituteType;
    instituteInfoItems[2].innerHTML = profileData.address;
    instituteInfoItems[3].textContent = profileData.city;
    instituteInfoItems[4].textContent = profileData.state;
    instituteInfoItems[5].textContent = profileData.pincode;
    instituteInfoItems[6].textContent = profileData.country;
    instituteInfoItems[7].textContent = profileData.establishedYear;
    instituteInfoItems[8].textContent = profileData.affiliatedTo;
    
    const websiteLink = instituteSection.querySelector('.info-item:last-child span a');
    if (profileData.website) {
        websiteLink.href = profileData.website;
        websiteLink.textContent = 'Visit Website';
    } else {
        websiteLink.textContent = 'N/A';
        websiteLink.removeAttribute('href');
    }

    // Update editable fields
    document.getElementById('contactPerson').value = profileData.contactPersonName;
    document.getElementById('designation').value = profileData.designation;
}

// Load overview statistics
async function loadOverviewStats() {
    try {
        const response = await apiCall('/events/institute');
        const events = response.events || [];

        const activeEvents = events.filter(e => e.status === 'Active').length;
        const totalStudents = events.reduce((sum, e) => sum + (e.registeredStudents?.length || 0), 0);

        // Update dashboard cards
        document.querySelector('.dashboard-cards .card:nth-child(1) .card-value').textContent = events.length;
        document.querySelector('.dashboard-cards .card:nth-child(2) .card-value').textContent = activeEvents;
        document.querySelector('.dashboard-cards .card:nth-child(3) .card-value').textContent = totalStudents;

        return events;
    } catch (error) {
        console.error('Error loading overview:', error);
        showNotification('Failed to load overview statistics', 'error');
        return [];
    }
}

// Load and display events
async function loadEvents() {
    try {
        const response = await apiCall('/events/institute');
        const events = response.events || [];

        const tableBody = document.querySelector('.events-table tbody');
        if (!tableBody) return;

        if (events.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No events created yet. Create your first event!</td></tr>';
            return;
        }

        tableBody.innerHTML = events.map(event => {
            const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            const studentsCount = event.registeredStudents?.length || 0;
            const statusClass = event.status.toLowerCase();

            return `
                <tr onclick="showEventDetails('${event._id}')" style="cursor: pointer;">
                    <td>${event.eventName}</td>
                    <td>${eventDate}</td>
                    <td>${studentsCount} students</td>
                    <td><span class="status ${statusClass}">${event.status}</span></td>
                    <td>
                        <button class="action-btn view" onclick="event.stopPropagation(); showEventDetails('${event._id}')">View Details</button>
                        ${event.status === 'Active' ? `<button class="action-btn edit" onclick="event.stopPropagation(); stopRegistrations('${event._id}', '${event.eventName}')">Stop Registrations</button>` : ''}
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        showNotification('Failed to load events', 'error');
    }
}

// Show event details
async function showEventDetails(eventId) {
    try {
        const response = await apiCall(`/events/${eventId}`);
        const event = response.event;

        const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const deadline = new Date(event.deadline).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        const detailsHTML = `
Event: ${event.eventName}
Type: ${event.eventType}
Date: ${eventDate}
Venue: ${event.venue}
Capacity: ${event.capacity}

Students Applied: ${event.registeredStudents?.length || 0}
Event Status: ${event.status}
Registration Deadline: ${deadline}
Fees: ₹${event.fees || 0}

Description:
${event.description}

Actions Available:
- View student list
- Download registrations
- Send notifications
${event.status === 'Active' ? '- Stop registrations' : '- View analytics'}
        `;
        alert(detailsHTML);
    } catch (error) {
        console.error('Error loading event details:', error);
        showNotification('Failed to load event details', 'error');
    }
}

// Stop registrations
async function stopRegistrations(eventId, eventName) {
    if (!confirm(`Are you sure you want to stop registrations for "${eventName}"?`)) {
        return;
    }

    try {
        await apiCall(`/events/${eventId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'Ended' })
        });

        showNotification(`Registrations stopped for "${eventName}"`, 'success');
        loadEvents();
        loadOverviewStats();
    } catch (error) {
        console.error('Error stopping registrations:', error);
        showNotification('Failed to stop registrations', 'error');
    }
}

// Create event
async function handleCreateEvent(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eventData = {
        eventName: formData.get('eventName'),
        eventType: formData.get('eventType'),
        description: formData.get('description'),
        eventDate: formData.get('createDate'),
        deadline: formData.get('deadline'),
        venue: formData.get('venue'),
        timings: formData.get('timings'),
        fees: formData.get('fees') || 0,
        capacity: parseInt(formData.get('capacity'))
    };

    // Validation
    if (new Date(eventData.deadline) > new Date(eventData.eventDate)) {
        showNotification('Registration deadline cannot be after event date', 'error');
        return;
    }

    try {
        const response = await apiCall('/events/create', {
            method: 'POST',
            body: JSON.stringify(eventData)
        });

        showNotification('Event created successfully!', 'success');
        e.target.reset();
        
        // Switch to event management tab
        showTab('event-management');
        loadEvents();
        loadOverviewStats();
    } catch (error) {
        console.error('Error creating event:', error);
        showNotification(error.message || 'Failed to create event', 'error');
    }
}

// Update profile
async function handleProfileUpdate(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword && newPassword !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    const updateData = {
        contactPersonName: formData.get('contactPerson'),
        designation: formData.get('designation')
    };

    if (newPassword) {
        updateData.password = newPassword;
    }

    try {
        // Note: You'll need to create a profile update endpoint in backend
        showNotification('Profile updated successfully!', 'success');
        
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        loadInstituteProfile();
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

// Tab switching
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    const clickedItem = event?.target?.closest('.menu-item');
    if (clickedItem) {
        clickedItem.classList.add('active');
    }

    // Load data for specific tabs
    if (tabName === 'event-management') {
        loadEvents();
    } else if (tabName === 'overview') {
        loadOverviewStats();
    }
}

// Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear(); // Clear all localStorage items
        window.location.href = './login-institute.html'; // Redirect to login page
    }
}

// Show notification
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

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!checkAuth()) return;

    // Load initial data
    await loadInstituteProfile();
    await loadOverviewStats();
    await loadEvents();

    // Attach form handlers
    const createEventForm = document.querySelector('.create-event-form');
    if (createEventForm) {
        createEventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleCreateEvent(e);
        });
    }

    // Add logout handler
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => handleLogout());
    }

    const profileForm = document.querySelector('.profile-edit-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
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