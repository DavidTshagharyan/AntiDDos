/* ============================================
   ANTI-DDOS PROTECTION WEBSITE - SCRIPTS
   ============================================ */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get element by ID
 */
function $(id) {
    return document.getElementById(id);
}

/**
 * Query selector
 */
function qs(selector) {
    return document.querySelector(selector);
}

/**
 * Query selector all
 */
function qsa(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Get query param by name
 */
function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
}

/**
 * Show element
 */
function show(element) {
    if (element) element.classList.add('show');
}

/**
 * Hide element
 */
function hide(element) {
    if (element) element.classList.remove('show');
}

// ============================================
// THEME TOGGLE (Dark/Light Mode)
// ============================================

/**
 * Initialize theme from localStorage or system preference
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.body.classList.toggle('light-mode', savedTheme === 'light');
    } else {
        // Auto-detect on first load
        document.body.classList.toggle('light-mode', !prefersDark);
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
    }
    
    updateThemeToggleText();
}

/**
 * Toggle theme between dark and light mode
 */
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
    updateThemeToggleText();
}

/**
 * Update theme toggle button text
 */
function updateThemeToggleText() {
    const toggleBtn = $('theme-toggle');
    if (toggleBtn) {
        const isLight = document.body.classList.contains('light-mode');
        toggleBtn.textContent = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
}

// ============================================
// NAVIGATION HIGHLIGHTING
// ============================================

function isHomePage() {
    const path = window.location.pathname;
    return path.endsWith('/') || path.endsWith('index.html') || path === '';
}

/**
 * Highlight active navigation link based on current page
 */
function highlightActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = qsa('.nav-links a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Add dashboard link to navigation if logged in
    const navLinksContainer = qs('.nav-links');
    if (navLinksContainer && isLoggedIn()) {
        // Check if dashboard link already exists
        let dashboardLink = qs('.nav-links a[href="dashboard.html"]');
        if (!dashboardLink) {
            const dashboardItem = document.createElement('li');
            dashboardItem.innerHTML = '<a href="dashboard.html">Dashboard</a>';
            navLinksContainer.insertBefore(dashboardItem, navLinksContainer.firstChild);
        }
    } else if (navLinksContainer && !isLoggedIn()) {
        // Remove dashboard link if not logged in
        const dashboardLink = qs('.nav-links a[href="dashboard.html"]');
        if (dashboardLink) {
            dashboardLink.parentElement.remove();
        }
    }
}

// ============================================
// AUTHENTICATION SYSTEM (Mock)
// ============================================

/**
 * Register a new user
 */
function registerUser(username, email, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email || u.username === username)) {
        return { success: false, message: 'User already exists' };
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        username,
        email,
        password: btoa(password), // Simple base64 encoding (not secure, just for demo)
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return { success: true, message: 'Registration successful' };
}

/**
 * Login user
 */
function loginUser(email, password) {
    const username = email.split('@')[0] || 'user';
    const user = { id: Date.now(), username, email };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return { success: true, message: 'Login successful', user };
}

/**
 * Logout user
 */
function logoutUser() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return localStorage.getItem('currentUser') !== null;
}

/**
 * Get current user
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Populate dashboard profile data
 */
function populateDashboardProfile() {
    const user = getCurrentUser();
    if (!user) return;

    const nameEl = $('profile-name');
    const emailEl = $('profile-email');
    const badgeEl = $('profile-badge');

    if (nameEl) nameEl.textContent = user.username || 'User';
    if (emailEl) emailEl.textContent = user.email || 'Unknown email';
    if (badgeEl) badgeEl.textContent = 'Active';
}

// ============================================
// PASSWORD STRENGTH INDICATOR
// ============================================

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(password) {
    const strengthBar = $('password-strength-bar');
    if (!strengthBar) return;
    
    const strength = calculatePasswordStrength(password);
    strengthBar.className = `password-strength-bar ${strength}`;
}

// ============================================
// FORM VALIDATION
// ============================================

/**
 * Validate email format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate form field
 */
function validateField(field, rules) {
    const value = field.value.trim();
    const errorElement = field.parentElement.querySelector('.error-message');
    
    // Clear previous errors
    if (errorElement) {
        errorElement.classList.remove('show');
        errorElement.textContent = '';
    }
    
    // Required validation
    if (rules.required && !value) {
        showError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (rules.email && value && !validateEmail(value)) {
        showError(field, 'Please enter a valid email address');
        return false;
    }
    
    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
        showError(field, `Minimum length is ${rules.minLength} characters`);
        return false;
    }
    
    // Password match validation
    if (rules.match && value !== $(rules.match).value) {
        showError(field, 'Passwords do not match');
        return false;
    }
    
    return true;
}

/**
 * Show error message
 */
function showError(field, message) {
    let errorElement = field.parentElement.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        field.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.classList.add('show');
    field.style.borderColor = 'var(--accent-danger)';
}

/**
 * Show success message
 */
function showSuccess(field, message) {
    let successElement = field.parentElement.querySelector('.success-message');
    if (!successElement) {
        successElement = document.createElement('div');
        successElement.className = 'success-message';
        field.parentElement.appendChild(successElement);
    }
    successElement.textContent = message;
    successElement.classList.add('show');
    field.style.borderColor = 'var(--accent-primary)';
}

// ============================================
// LOGIN PAGE HANDLERS
// ============================================

function initLoginPage() {
    const loginForm = $('login-form');
    if (!loginForm) return;
    
    const emailField = $('login-email');
    const passwordField = $('login-password');
    const redirectTarget = getQueryParam('redirect') || 'index.html';
    
    // Real-time password strength for password field
    if (passwordField) {
        passwordField.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
        });
    }
    
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = emailField.value.trim();
        const password = passwordField.value;
        const redirectTarget = getQueryParam('redirect') || 'dashboard.html';
        
        // Minimal presence check
        if (!email || !password) {
            showError(emailField, 'Email and password are required');
            return;
        }
        
        // Attempt login (accept any credentials)
        const result = loginUser(email, password);
        
        if (result.success) {
            showSuccess(emailField, result.message);
            setTimeout(() => {
                window.location.href = redirectTarget;
            }, 1000);
        } else {
            showError(emailField, result.message);
        }
    });
}

// ============================================
// REGISTER PAGE HANDLERS
// ============================================

function initRegisterPage() {
    const registerForm = $('register-form');
    if (!registerForm) return;
    
    const usernameField = $('register-username');
    const emailField = $('register-email');
    const passwordField = $('register-password');
    const confirmPasswordField = $('register-confirm-password');
    const redirectTarget = getQueryParam('redirect') || 'dashboard.html';
    
    // Real-time password strength
    if (passwordField) {
        passwordField.addEventListener('input', (e) => {
            updatePasswordStrength(e.target.value);
        });
    }
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = usernameField.value.trim();
        const email = emailField.value.trim();
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;
        
        // Validate all fields
        const usernameValid = validateField(usernameField, { required: true, minLength: 3 });
        const emailValid = validateField(emailField, { required: true, email: true });
        const passwordValid = validateField(passwordField, { required: true, minLength: 8 });
        const confirmPasswordValid = validateField(confirmPasswordField, { required: true, match: 'register-password' });
        
        if (!usernameValid || !emailValid || !passwordValid || !confirmPasswordValid) {
            return;
        }
        
        // Attempt registration
        const result = registerUser(username, email, password);
        
        if (result.success) {
            showSuccess(emailField, result.message);
            setTimeout(() => {
                window.location.href = `login.html?redirect=${encodeURIComponent(redirectTarget)}`;
            }, 1500);
        } else {
            showError(emailField, result.message);
        }
    });
}

/**
 * Protect dashboard page from unauthenticated access
 */
function enforceDashboardAuth() {
    const isDashboard = window.location.pathname.split('/').pop() === 'dashboard.html';
    if (isDashboard && !isLoggedIn()) {
        window.location.href = 'login.html?redirect=dashboard.html';
    }
}

// ============================================
// DDoS DETECTION SIMULATION
// ============================================

let trafficData = [];
let animationFrameId = null;

/**
 * Generate random traffic data
 */
function generateTrafficData() {
    const data = [];
    const now = Date.now();
    const baseTraffic = 50 + Math.random() * 30;
    
    for (let i = 0; i < 100; i++) {
        const timestamp = now - (100 - i) * 1000; // Last 100 seconds
        let traffic = baseTraffic + Math.random() * 20;
        
        // Simulate traffic spikes (potential attacks)
        if (Math.random() > 0.7) {
            traffic += 50 + Math.random() * 100;
        }
        
        data.push({
            timestamp,
            traffic: Math.round(traffic)
        });
    }
    
    return data;
}

/**
 * Analyze traffic for anomalies
 */
function analyzeTraffic(data) {
    const avgTraffic = data.reduce((sum, d) => sum + d.traffic, 0) / data.length;
    const maxTraffic = Math.max(...data.map(d => d.traffic));
    const spikes = data.filter(d => d.traffic > avgTraffic * 2).length;
    
    let status = 'safe';
    let message = 'No anomalies detected. Traffic is normal.';
    let risk = 0;
    
    if (maxTraffic > avgTraffic * 3) {
        status = 'danger';
        message = 'CRITICAL: Multiple high-intensity traffic spikes detected. Potential DDoS attack in progress!';
        risk = 90;
    } else if (spikes > 10 || maxTraffic > avgTraffic * 2) {
        status = 'warning';
        message = 'WARNING: Unusual traffic patterns detected. Monitor closely for potential attacks.';
        risk = 50;
    } else {
        risk = Math.min(30, (maxTraffic / avgTraffic - 1) * 30);
    }
    
    return {
        status,
        message,
        risk: Math.round(risk),
        avgTraffic: Math.round(avgTraffic),
        maxTraffic,
        spikes
    };
}

/**
 * Draw traffic graph on canvas
 */
function drawTrafficGraph(canvas, data) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set styles based on theme
    const isLight = document.body.classList.contains('light-mode');
    ctx.strokeStyle = isLight ? '#0969da' : '#00ff88';
    ctx.fillStyle = isLight ? 'rgba(9, 105, 218, 0.2)' : 'rgba(0, 255, 136, 0.2)';
    ctx.lineWidth = 2;
    
    // Find min and max traffic values
    const trafficValues = data.map(d => d.traffic);
    const minTraffic = Math.min(...trafficValues);
    const maxTraffic = Math.max(...trafficValues);
    const range = maxTraffic - minTraffic || 1;
    
    // Draw grid lines
    ctx.strokeStyle = isLight ? 'rgba(9, 105, 218, 0.1)' : 'rgba(0, 255, 136, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (graphHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Draw traffic line
    ctx.strokeStyle = isLight ? '#0969da' : '#00ff88';
    ctx.fillStyle = isLight ? 'rgba(9, 105, 218, 0.2)' : 'rgba(0, 255, 136, 0.2)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    data.forEach((point, index) => {
        const x = padding + (graphWidth / (data.length - 1)) * index;
        const y = padding + graphHeight - ((point.traffic - minTraffic) / range) * graphHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    // Fill area under curve
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();
    
    // Draw line
    ctx.stroke();
    
    // Draw data points
    ctx.fillStyle = isLight ? '#0969da' : '#00ff88';
    data.forEach((point, index) => {
        const x = padding + (graphWidth / (data.length - 1)) * index;
        const y = padding + graphHeight - ((point.traffic - minTraffic) / range) * graphHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = isLight ? '#24292f' : '#e6edf3';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(maxTraffic)} req/s`, padding - 10, padding + 5);
    ctx.fillText(`${Math.round(minTraffic)} req/s`, padding - 10, height - padding + 5);
}

/**
 * Animate traffic graph
 */
function animateTrafficGraph(canvas) {
    if (!canvas) return;
    
    // Update traffic data (add new point, remove old)
    const now = Date.now();
    const baseTraffic = 50 + Math.random() * 30;
    let traffic = baseTraffic;
    
    // Random spikes
    if (Math.random() > 0.85) {
        traffic += 50 + Math.random() * 100;
    }
    
    trafficData.push({
        timestamp: now,
        traffic: Math.round(traffic)
    });
    
    // Keep only last 100 points
    if (trafficData.length > 100) {
        trafficData.shift();
    }
    
    // Draw graph
    drawTrafficGraph(canvas, trafficData);
    
    // Continue animation
    animationFrameId = requestAnimationFrame(() => animateTrafficGraph(canvas));
}

/**
 * Stop traffic graph animation
 */
function stopTrafficAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

/**
 * Initialize detection page
 */
function initDetectionPage() {
    const detectionForm = $('detection-form');
    const domainInput = $('domain-input');
    const runDetectionBtn = $('run-detection-btn');
    const detectionResults = $('detection-results');
    const resultStatus = $('result-status');
    const resultMessage = $('result-message');
    const resultDetails = $('result-details');
    const trafficCanvas = $('traffic-canvas');
    
    if (!detectionForm) return;
    
    // Set canvas size
    if (trafficCanvas) {
        trafficCanvas.width = trafficCanvas.offsetWidth;
        trafficCanvas.height = 300;
    }
    
    detectionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const domain = domainInput.value.trim();
        
        if (!domain) {
            alert('Please enter a domain or IP address');
            return;
        }
        
        // Show loading state
        if (runDetectionBtn) {
            runDetectionBtn.disabled = true;
            runDetectionBtn.textContent = 'Analyzing...';
        }
        
        // Generate traffic data
        trafficData = generateTrafficData();
        
        // Analyze after short delay (simulate analysis)
        setTimeout(() => {
            const analysis = analyzeTraffic(trafficData);
            
            // Update results
            if (resultStatus) {
                resultStatus.className = `result-status ${analysis.status}`;
                resultStatus.textContent = analysis.status.toUpperCase();
            }
            
            if (resultMessage) {
                resultMessage.textContent = analysis.message;
            }
            
            if (resultDetails) {
                resultDetails.innerHTML = `
                    <p><strong>Risk Level:</strong> ${analysis.risk}%</p>
                    <p><strong>Average Traffic:</strong> ${analysis.avgTraffic} requests/second</p>
                    <p><strong>Peak Traffic:</strong> ${Math.round(analysis.maxTraffic)} requests/second</p>
                    <p><strong>Anomalies Detected:</strong> ${analysis.spikes}</p>
                    <p><strong>Domain Analyzed:</strong> ${domain}</p>
                `;
            }
            
            // Show results
            if (detectionResults) {
                detectionResults.classList.add('show');
            }
            
            // Draw initial graph
            if (trafficCanvas) {
                drawTrafficGraph(trafficCanvas, trafficData);
                // Start animation
                animateTrafficGraph(trafficCanvas);
            }
            
            // Reset button
            if (runDetectionBtn) {
                runDetectionBtn.disabled = false;
                runDetectionBtn.textContent = 'Run Detection';
            }
        }, 1500);
    });
}

// ============================================
// ACCORDION FUNCTIONALITY
// ============================================

function initAccordions() {
    const accordionHeaders = qsa('.accordion-header');
    const setIcon = (header, active) => {
        const icon = header.querySelector('.accordion-icon');
        if (icon) icon.textContent = active ? '-' : '+';
    };

    accordionHeaders.forEach(header => setIcon(header, header.classList.contains('active')));
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.closest('.accordion');
            const content = accordion.querySelector('.accordion-content');
            const isActive = header.classList.contains('active');
            
            // Close all accordions
            qsa('.accordion-header').forEach(h => {
                h.classList.remove('active');
                h.nextElementSibling?.classList.remove('active');
                setIcon(h, false);
            });
            
            // Open clicked accordion if it wasn't active
            if (!isActive) {
                header.classList.add('active');
                if (content) {
                    content.classList.add('active');
                }
                setIcon(header, true);
            }
        });
    });
}

// ============================================
// MITIGATION SIMULATION
// ============================================

function initMitigationSimulation() {
    const applyBtn = $('apply-mitigation-btn');
    const simulationResult = $('simulation-result');
    
    if (!applyBtn) return;
    
    applyBtn.addEventListener('click', () => {
        const mitigations = [];
        qsa('input[type="checkbox"]:checked').forEach(checkbox => {
            mitigations.push(checkbox.value);
        });
        
        if (mitigations.length === 0) {
            alert('Please select at least one mitigation strategy');
            return;
        }
        
        // Simulate mitigation effects
        const effectiveness = mitigations.length * 20 + Math.random() * 20;
        const attackBlocked = effectiveness > 50;
        
        if (simulationResult) {
            simulationResult.className = `simulation-result ${attackBlocked ? 'safe' : 'warning'}`;
            simulationResult.innerHTML = `
                <h3>Simulation Results</h3>
                <p><strong>Mitigations Applied:</strong> ${mitigations.join(', ')}</p>
                <p><strong>Effectiveness:</strong> ${Math.round(effectiveness)}%</p>
                <p><strong>Status:</strong> ${attackBlocked ? 'Attack successfully mitigated!' : 'Partial mitigation. Consider additional strategies.'}</p>
            `;
            simulationResult.classList.add('show');
        }
    });
}

// ============================================
// RESOURCES PAGE
// ============================================

// Default resources data
const defaultResources = [
    {
        title: 'OWASP DDoS Protection',
        description: 'Comprehensive guide on DDoS attack prevention and mitigation strategies.',
        url: 'https://owasp.org/www-community/attacks/Denial_of_Service',
        category: 'Guide'
    },
    {
        title: 'Cloudflare DDoS Protection',
        description: 'Enterprise-grade DDoS protection and mitigation services.',
        url: 'https://www.cloudflare.com/ddos/',
        category: 'Service'
    },
    {
        title: 'AWS Shield',
        description: 'Managed DDoS protection service for AWS infrastructure.',
        url: 'https://aws.amazon.com/shield/',
        category: 'Service'
    },
    {
        title: 'DDoS Attack Types Explained',
        description: 'Learn about different types of DDoS attacks and their characteristics.',
        url: 'https://www.cloudflare.com/learning/ddos/what-is-a-ddos-attack/',
        category: 'Guide'
    },
    {
        title: 'NIST Cybersecurity Framework',
        description: 'Framework for improving critical infrastructure cybersecurity.',
        url: 'https://www.nist.gov/cyberframework',
        category: 'Framework'
    },
    {
        title: 'Rate Limiting Best Practices',
        description: 'Guide to implementing effective rate limiting strategies.',
        url: 'https://www.nginx.com/blog/rate-limiting-nginx/',
        category: 'Guide'
    }
];

/**
 * Load and display resources
 */
function loadResources() {
    const resourcesList = $('resources-list');
    if (!resourcesList) return;
    
    // Get resources from localStorage or use default
    let resources = JSON.parse(localStorage.getItem('resources') || JSON.stringify(defaultResources));
    
    // Display resources
    displayResources(resources);
    
    // Setup search
    const searchBar = $('resources-search');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = resources.filter(r => 
                r.title.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query) ||
                r.category.toLowerCase().includes(query)
            );
            displayResources(filtered);
        });
    }
}

/**
 * Display resources in the list
 */
function displayResources(resources) {
    const resourcesList = $('resources-list');
    if (!resourcesList) return;
    
    if (resources.length === 0) {
        resourcesList.innerHTML = '<p class="text-center">No resources found.</p>';
        return;
    }
    
    resourcesList.innerHTML = resources.map(resource => `
        <div class="resource-item">
            <h3>${resource.title}</h3>
            <p>${resource.description}</p>
            <p><strong>Category:</strong> ${resource.category}</p>
            <a href="${resource.url}" target="_blank" rel="noopener noreferrer">Visit Resource -></a>
        </div>
    `).join('');
}

// ============================================
// CONTACT FORM
// ============================================

function initContactForm() {
    const contactForm = $('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameField = $('contact-name');
        const emailField = $('contact-email');
        const messageField = $('contact-message');
        
        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const message = messageField.value.trim();
        
        // Validate fields
        const nameValid = validateField(nameField, { required: true, minLength: 2 });
        const emailValid = validateField(emailField, { required: true, email: true });
        const messageValid = validateField(messageField, { required: true, minLength: 10 });
        
        if (!nameValid || !emailValid || !messageValid) {
            return;
        }
        
        // Simulate form submission
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
}

// ============================================
// PAGE INITIALIZATION
// ============================================

// ============================================
// MOBILE MENU TOGGLE
// ============================================

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const themeToggle = $('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    highlightActiveNav();
    initMobileMenu();
    
    // Initialize page-specific functionality
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'login.html':
            initLoginPage();
            break;
        case 'register.html':
            initRegisterPage();
            break;
        case 'detect.html':
            initDetectionPage();
            break;
        case 'mitigate.html':
            initAccordions();
            initMitigationSimulation();
            break;
        case 'resources.html':
            loadResources();
            break;
        case 'about.html':
            initContactForm();
            break;
        case 'dashboard.html':
            populateDashboardProfile();
            break;
    }
    
    if (isHomePage()) {
        initNetworkCanvas();
    }

    enforceDashboardAuth();

});

// ============================================
// NETWORK CANVAS ANIMATION (Home Page)
// ============================================

function initNetworkCanvas() {
    const canvas = $('network-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height || 400;
    }
    
    resizeCanvas();
    
    window.addEventListener('resize', () => {
        resizeCanvas();
        createNodes();
    });
    
    const nodes = [];
    const nodeCount = 30;
    
    // Create nodes
    function createNodes() {
        nodes.length = 0;
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 3 + Math.random() * 2
            });
        }
    }
    
    createNodes();
    
    function animate() {
        const isLight = document.body.classList.contains('light-mode');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw nodes
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
            
            // Reinitialize if canvas was resized
            if (node.x > canvas.width || node.y > canvas.height) {
                node.x = Math.random() * canvas.width;
                node.y = Math.random() * canvas.height;
            }
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = isLight ? '#0969da' : '#00ff88';
            ctx.fill();
        });
        
        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = isLight 
                        ? `rgba(9, 105, 218, ${0.3 * (1 - dist / 100)})`
                        : `rgba(0, 255, 136, ${0.3 * (1 - dist / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Stop animation when navigating away
window.addEventListener('beforeunload', stopTrafficAnimation);

