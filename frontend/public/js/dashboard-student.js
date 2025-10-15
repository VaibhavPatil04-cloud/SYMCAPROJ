const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
function getToken() {
    return localStorage.getItem('token');
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

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`API call failed: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        throw error;
    }
}

// Load student profile
async function loadStudentProfile() {
    try {
        const response = await apiCall('/auth/me');
        const student = response.user;
        
        // Update profile info in dashboard
        document.querySelector('.page-title p').textContent = 
            `Welcome back, ${student.fullName} | ${student.studentId} | ${student.major}`;
        
        return student;
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load all events
async function loadEvents() {
    try {
        // Changed from /events to /events/active to match the backend route
        const response = await apiCall('/events/active');
        const events = response.events || [];
        
        const eventsGrid = document.querySelector('.events-grid');
        eventsGrid.innerHTML = events.map(event => createEventCard(event)).join('');
        
        // Update overview stats
        updateOverviewStats(events);
    } catch (error) {
        console.error('Error loading events:', error);
        showNotification('Failed to load events. Please try again later.', 'error');
    }
}

// Create event card HTML
function createEventCard(event) {
    const isRegistrationOpen = new Date(event.deadline) > new Date();
    const statusClass = isRegistrationOpen ? 'open' : 'closed';
    const statusText = isRegistrationOpen ? 'Registration Open' : 'Registration Closed';

    return `
        <div class="event-card">
            <div class="event-header">
                <div>
                    <h3 class="event-title">${event.eventName}</h3>
                    <div class="event-status ${statusClass}">${statusText}</div>
                </div>
            </div>
            <div class="event-meta">
                <div class="event-date">
                    <i class="fas fa-calendar"></i>
                    <span>${new Date(event.eventDate).toLocaleDateString()}</span>
                </div>
                <div class="event-venue">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.venue}</span>
                </div>
                <div class="event-capacity">
                    <i class="fas fa-users"></i>
                    <span>${event.registeredStudents?.length || 0} / ${event.capacity} registered</span>
                </div>
            </div>
            <p class="event-description">${event.description}</p>
            <div class="event-tags">
                <span class="event-tag">${event.eventType}</span>
            </div>
            <div class="event-fee">${event.fees ? `₹${event.fees}` : 'Free'}</div>
            <div class="event-actions">
                ${isRegistrationOpen ? 
                    `<button class="btn btn-primary" onclick="registerForEvent('${event._id}')">
                        <i class="fas fa-plus"></i> Register Now
                    </button>` : 
                    `<button class="btn btn-primary" disabled>
                        <i class="fas fa-times"></i> Registration Closed
                    </button>`
                }
                <button class="btn btn-outline" onclick="viewEventDetails('${event._id}')">
                    <i class="fas fa-info-circle"></i> View Details
                </button>
            </div>
        </div>
    `;
}

// Register for event
async function registerForEvent(eventId) {
    try {
        await apiCall(`/events/${eventId}/register`, { method: 'POST' });
        showNotification('Successfully registered for event!', 'success');
        loadEvents(); // Refresh events
    } catch (error) {
        showNotification(error.message || 'Failed to register for event', 'error');
    }
}

// View event details
async function viewEventDetails(eventId) {
    try {
        const response = await apiCall(`/events/${eventId}`);
        const event = response.event;
        
        // Format dates
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

        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="eventModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${event.eventName}</h2>
                        <button onclick="closeEventModal()" class="close-btn">×</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Event Type:</strong> ${event.eventType}</p>
                        <p><strong>Date:</strong> ${eventDate}</p>
                        <p><strong>Venue:</strong> ${event.venue}</p>
                        <p><strong>Registration Deadline:</strong> ${deadline}</p>
                        <p><strong>Capacity:</strong> ${event.registeredStudents.length}/${event.capacity}</p>
                        <p><strong>Fees:</strong> ${event.fees ? `₹${event.fees}` : 'Free'}</p>
                        <p><strong>Description:</strong></p>
                        <p>${event.description}</p>
                        <p><strong>Organized by:</strong> ${event.instituteId.instituteName}</p>
                    </div>
                    <div class="modal-footer">
                        ${new Date(event.deadline) > new Date() && !event.registeredStudents.includes(localStorage.getItem('userId')) ?
                            `<button onclick="registerForEvent('${event._id}')" class="btn btn-primary">Register Now</button>` :
                            ''
                        }
                        <button onclick="closeEventModal()" class="btn btn-outline">Close</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add event listener to close modal when clicking outside
        document.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeEventModal();
            }
        });

    } catch (error) {
        console.error('Error loading event details:', error);
        showNotification('Failed to load event details', 'error');
    }
}

// Close event modal
function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.remove();
    }
}

// Update overview statistics
function updateOverviewStats(events) {
    try {
        const today = new Date();
        const activeEvents = events.filter(e => new Date(e.deadline) > today).length;
        const registeredEvents = events.filter(e => e.registeredStudents?.includes(localStorage.getItem('userId'))).length;
        const totalEvents = events.length;

        const cards = document.querySelectorAll('.card-value');
        if (cards.length >= 3) {
            cards[0].textContent = activeEvents;
            cards[1].textContent = registeredEvents;
            cards[2].textContent = totalEvents;
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Implement notification display
    alert(message);
}

// Tab switching functionality
function switchTab(tabId) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    // Add active class to clicked menu item
    const menuItem = document.querySelector(`.menu-item[data-section="${tabId.replace('-section', '')}"]`);
    if (menuItem) {
        menuItem.classList.add('active');
    }
}

// Load student profile and update UI
async function updateProfileSection(student) {
    console.log('Student data:', student); // Add this to debug

    // Update form fields with student data - matching exact field names from schema
    document.getElementById('fullname').value = student.fullname || '';
    document.getElementById('email').value = student.email || '';
    document.getElementById('phone').value = student.phone || '';
    document.getElementById('studentId').value = student.studentId || '';
    document.getElementById('major').value = student.major || '';
    document.getElementById('university').value = student.university || '';
    
    // Update welcome text with correct field name
    document.querySelector('.page-title p').textContent = 
        `Welcome back, ${student.fullname} | ${student.studentId} | ${student.major}`;
}

// Load my events
async function loadMyEvents(filter = 'all') {
    try {
        const userId = localStorage.getItem('userId');
        const response = await apiCall('/events/active');
        const events = response.events || [];
        
        // Filter events where student is registered
        const registeredEvents = events.filter(event => 
            event.registeredStudents && event.registeredStudents.includes(userId)
        );

        const myEventsList = document.querySelector('.my-events-list');
        if (!myEventsList) return;

        if (registeredEvents.length === 0) {
            myEventsList.innerHTML = '<div class="no-events">You haven\'t registered for any events yet.</div>';
            return;
        }

        // Filter events based on selected tab
        const filteredEvents = filterEvents(registeredEvents, filter);

        myEventsList.innerHTML = filteredEvents.map(event => {
            const status = getEventStatus(event);
            return `
                <div class="my-event-card ${status}">
                    <div class="event-info">
                        <h4>${event.eventName}</h4>
                        <p class="event-date-venue">
                            <i class="fas fa-calendar"></i> ${new Date(event.eventDate).toLocaleDateString()} | 
                            <i class="fas fa-map-marker-alt"></i> ${event.venue}
                        </p>
                        <span class="event-status-badge ${status}">${status}</span>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-outline btn-sm" onclick="viewEventDetails('${event._id}')">View Details</button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading my events:', error);
        showNotification('Failed to load your events', 'error');
    }
}

// Filter events based on status
function getEventStatus(event) {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    const deadline = new Date(event.deadline);

    if (now > eventDate) return 'completed';
    if (now > deadline) return 'upcoming';
    return 'active';
}

// Filter events based on status
function filterEvents(events, filter) {
    const now = new Date();
    switch(filter) {
        case 'upcoming':
            return events.filter(event => new Date(event.eventDate) > now);
        case 'completed':
            return events.filter(event => new Date(event.eventDate) < now);
        case 'saved':
            return events.filter(event => event.isSaved); // If you implement saved events feature
        default:
            return events;
    }
}

// Filter my events based on tab
function filterMyEvents(filter) {
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    
    // Load filtered events
    loadMyEvents(filter);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load student profile
        const response = await apiCall('/auth/me');
        const student = response.user;
        
        if (student) {
            updateProfileSection(student);
            localStorage.setItem('userId', student._id);
        }
        
        // Add click handlers to menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', async () => {
                const section = item.getAttribute('data-section');
                if (section) {
                    switchTab(`${section}-section`);
                    if (section === 'my-events') {
                        await loadMyEvents('all'); // Load all events when switching to my events tab
                    }
                }
            });
        });

        // Add filter tab handlers
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.getAttribute('data-filter');
                filterMyEvents(filter);
            });
        });

        // Load initial data
        await loadEvents();
        if (document.getElementById('my-events-section').classList.contains('active')) {
            await loadMyEvents();
        }

        // Add logout handler
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('token');
                    window.location.href = 'login-student.html';
                }
            });
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Failed to initialize dashboard', 'error');
    }
});

// Add CSS for modal
const modalStyle = document.createElement('style');
modalStyle.textContent = `
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 20px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
        margin: 0;
        color: var(--dark);
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }

    .modal-body {
        margin-bottom: 20px;
    }

    .modal-body p {
        margin: 10px 0;
        line-height: 1.5;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }
`;
document.head.appendChild(modalStyle);
