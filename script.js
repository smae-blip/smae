// Navigation Scroll Effect
const navbar = document.getElementById('navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

const isHomePage = !!document.querySelector('.hero');

const updateNavbarState = () => {
    if (!navbar) return;
    if (!isHomePage || window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
};

window.addEventListener('scroll', updateNavbarState);
updateNavbarState();

// Mobile Menu Toggle
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close mobile menu on clicking a link
document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.querySelector('i').classList.remove('fa-times');
        hamburger.querySelector('i').classList.add('fa-bars');
    });
});

// Intersection Observer for Animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // For timeline content specifically
                if (entry.target.classList.contains('slide-in-left') || entry.target.classList.contains('slide-in-right')) {
                    entry.target.querySelector('.timeline-content').classList.add('in-view');
                } else {
                    entry.target.classList.add('in-view');
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    // Elements to observe
    const animatedElements = document.querySelectorAll(
        '.fade-up, .fade-in, .fade-left, .fade-right, .slide-in-left, .slide-in-right'
    );

    animatedElements.forEach(el => observer.observe(el));
};

// Initial triggers
document.addEventListener('DOMContentLoaded', () => {
    observeElements();
    
    // Trigger hero animations immediately if visible
    setTimeout(() => {
        document.querySelectorAll('.hero .fade-up').forEach(el => {
            el.classList.add('in-view');
        });
    }, 100);
});

// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if(targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            const navbarHeight = navbar.offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

const BACKEND_URLS = ['http://localhost:5000', 'http://127.0.0.1:5000'];

function getBackendUrl(path) {
    const defaultUrl = BACKEND_URLS[0];
    return defaultUrl + path;
}

async function fetchWithFallback(url, options) {
    try {
        return await fetch(url, options);
    } catch (error) {
        console.warn(`Fetch failed for ${url}:`, error);
        if (url.includes('localhost')) {
            const altUrl = url.replace('localhost', '127.0.0.1');
            console.warn(`Retrying with fallback URL ${altUrl}`);
            return await fetch(altUrl, options);
        }
        throw error;
    }
}

// News & Activities Tabs
document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button and associated pane
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
});

// CAPTCHA Implementation
let captchaResult = '';

function generateCaptcha() {
    const canvas = document.getElementById('captchaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background color
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Generate a random 5-digit number
    const chars = '0123456789';
    let captchaStr = '';
    for (let i = 0; i < 5; i++) {
        captchaStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captchaResult = captchaStr;
    
    // Add noise lines
    for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*150},0.4)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineWidth = 1.2;
        ctx.stroke();
    }
    
    // Add text numbers
    ctx.font = 'bold 22px Outfit, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    
    for (let i = 0; i < captchaStr.length; i++) {
        ctx.fillStyle = `rgb(${Math.random()*80},${Math.random()*80},${Math.random()*80})`; // Dark text
        ctx.save();
        ctx.translate(15 + (i * 20), 22);
        const rotation = (Math.random() - 0.4) * 0.4; // Mild rotation for readability
        ctx.rotate(rotation);
        ctx.fillText(captchaStr[i], 0, 0);
        ctx.restore();
    }
    
    // Add noise dots
    for (let i = 0; i < 20; i++) {
        ctx.fillStyle = `rgba(${Math.random()*200},${Math.random()*200},${Math.random()*200},0.2)`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateCaptcha();
    
    const canvas = document.getElementById('captchaCanvas');
    const refreshBtn = document.getElementById('refreshCaptcha');
    
    if (canvas) canvas.addEventListener('click', generateCaptcha);
    if (refreshBtn) refreshBtn.addEventListener('click', generateCaptcha);
    
    const form = document.getElementById('studentForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userAnswer = document.getElementById('captchaAnswer').value.trim();
            const errorElement = document.getElementById('captchaError');
            const successElement = document.getElementById('formSuccessMessage');
            
            if (userAnswer.toLowerCase() !== captchaResult.toLowerCase()) {
                errorElement.textContent = 'Incorrect verification text. Please try again.';
                errorElement.style.display = 'block';
                successElement.style.display = 'none';
                generateCaptcha(); // Generate new CAPTCHA on failure
                document.getElementById('captchaAnswer').value = '';
                return;
            }

            // CAPTCHA passed
            errorElement.style.display = 'none';
            successElement.style.display = 'none';

            const formData = {
                applicantName: document.getElementById('applicantName').value.trim(),
                applicantEmail: document.getElementById('applicantEmail').value.trim(),
                applicantPhone: document.getElementById('applicantPhone').value.trim(),
                applicantDesignation: document.getElementById('applicantDesignation').value.trim(),
                instituteName: document.getElementById('instituteName').value.trim(),
                instituteAddress: document.getElementById('instituteAddress').value.trim(),
            };

            try {
                const response = await fetchWithFallback(getBackendUrl('/api/student-corner'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.ok) {
                    successElement.textContent = data.message || 'Application submitted successfully!';
                    successElement.style.display = 'block';
                    form.reset();
                    generateCaptcha();

                    setTimeout(() => {
                        successElement.style.display = 'none';
                    }, 5000);
                } else {
                    errorElement.textContent = data.error || 'Failed to submit application. Please try again.';
                    errorElement.style.display = 'block';
                }
            } catch (error) {
                console.error('Student corner submit error:', error);
                errorElement.textContent = 'Unable to connect to server. Please ensure backend is running on http://localhost:5000';
                errorElement.style.display = 'block';
            }
        });
    }
});


// Instagram Widget Refresh for Live Updates
function reloadInstagramWidget() {
    const widget = document.getElementById('instagram-widget');
    if (widget) {
        // Clear existing content
        widget.innerHTML = '';
        
        // Re-add the link
        const link = document.createElement('a');
        link.href = 'https://instawidget.net/v/user/_s_m_a_e_';
        link.id = 'link-de7aff1700dda24b436ceee37dc88e2825a9780007ad4a1159267594eefb6652';
        link.textContent = '@_s_m_a_e_';
        widget.appendChild(link);
        
        // Re-add the script with timestamp to force reload
        const script = document.createElement('script');
        script.src = 'https://instawidget.net/js/instawidget.js?u=de7aff1700dda24b436ceee37dc88e2825a9780007ad4a1159267594eefb6652&width=100%&t=' + Date.now();
        widget.appendChild(script);
    }
}

// Reload every 1 minute (60000 ms) for testing - change to 300000 for production
setInterval(reloadInstagramWidget, 60000);

// ========================================
// Contact Form Handler
// ========================================

// ========================================
// Captcha Utilities
// ========================================
class CaptchaManager {
    static generateCaptcha(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background color
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Generate a random 5-digit number
        const chars = '0123456789';
        let captchaStr = '';
        for (let i = 0; i < 5; i++) {
            captchaStr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        // Add noise lines
        for (let i = 0; i < 4; i++) {
            ctx.strokeStyle = `rgba(${Math.random()*150},${Math.random()*150},${Math.random()*150},0.4)`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        // Add text numbers
        ctx.font = 'bold 20px Outfit, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        
        for (let i = 0; i < captchaStr.length; i++) {
            ctx.fillStyle = `rgb(${Math.random()*80},${Math.random()*80},${Math.random()*80})`; // Dark text
            ctx.save();
            ctx.translate(8 + (i * 18), 22);
            const rotation = (Math.random() - 0.4) * 0.4;
            ctx.rotate(rotation);
            ctx.fillText(captchaStr[i], 0, 0);
            ctx.restore();
        }
        
        // Add noise dots
        for (let i = 0; i < 12; i++) {
            ctx.fillStyle = `rgba(${Math.random()*200},${Math.random()*200},${Math.random()*200},0.2)`;
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        return captchaStr;
    }
}

// ========================================
// Contact Form Handler
// ========================================
class ContactFormHandler {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.successMsg = document.getElementById('formSuccessMsg');
        this.errorMsg = document.getElementById('formErrorMsg');
        this.errorText = document.getElementById('formErrorText');
        this.apiUrl = getBackendUrl('/api/contact');
        this.captchaResult = '';
        
        if (this.form) {
            this.initCaptcha();
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    initCaptcha() {
        const canvas = document.getElementById('contactCaptchaCanvas');
        const refreshBtn = document.getElementById('contactRefreshCaptcha');
        
        if (canvas) {
            this.captchaResult = CaptchaManager.generateCaptcha('contactCaptchaCanvas');
            canvas.addEventListener('click', () => {
                this.captchaResult = CaptchaManager.generateCaptcha('contactCaptchaCanvas');
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.captchaResult = CaptchaManager.generateCaptcha('contactCaptchaCanvas');
            });
        }
    }
    
    validateForm() {
        const name = document.getElementById('contactName').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const subject = document.getElementById('contactSubject').value.trim();
        const message = document.getElementById('contactMessage').value.trim();
        const captchaAnswer = document.getElementById('contactCaptchaAnswer').value.trim();
        
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('#contactForm .form-error').forEach(err => {
            err.classList.remove('show');
            err.textContent = '';
        });
        
        // Validation
        if (!name) {
            document.getElementById('nameError').textContent = 'Name is required';
            document.getElementById('nameError').classList.add('show');
            isValid = false;
        }
        
        if (!email || !this.isValidEmail(email)) {
            document.getElementById('emailError').textContent = 'Valid email is required';
            document.getElementById('emailError').classList.add('show');
            isValid = false;
        }
        
        if (!phone || phone.length < 10) {
            document.getElementById('phoneError').textContent = 'Valid phone number is required';
            document.getElementById('phoneError').classList.add('show');
            isValid = false;
        }
        
        if (!subject) {
            document.getElementById('subjectError').textContent = 'Subject is required';
            document.getElementById('subjectError').classList.add('show');
            isValid = false;
        }
        
        if (!message) {
            document.getElementById('messageError').textContent = 'Message is required';
            document.getElementById('messageError').classList.add('show');
            isValid = false;
        }
        
        if (!captchaAnswer || captchaAnswer !== this.captchaResult) {
            document.getElementById('contactCaptchaError').textContent = 'Incorrect verification code. Please try again.';
            document.getElementById('contactCaptchaError').classList.add('show');
            this.captchaResult = CaptchaManager.generateCaptcha('contactCaptchaCanvas');
            document.getElementById('contactCaptchaAnswer').value = '';
            isValid = false;
        }
        
        return isValid;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        if (this.successMsg) this.successMsg.style.display = 'none';
        if (this.errorMsg) this.errorMsg.style.display = 'none';
        
        try {
            const formData = {
                name: document.getElementById('contactName').value.trim(),
                email: document.getElementById('contactEmail').value.trim(),
                phone: document.getElementById('contactPhone').value.trim(),
                subject: document.getElementById('contactSubject').value.trim(),
                message: document.getElementById('contactMessage').value.trim(),
            };
            
            const response = await fetchWithFallback(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Success
                if (this.successMsg) this.successMsg.style.display = 'flex';
                this.form.reset();
                this.captchaResult = CaptchaManager.generateCaptcha('contactCaptchaCanvas');
            } else {
                // Error from server
                if (this.errorText) this.errorText.textContent = data.error || 'Failed to send message. Please try again.';
                if (this.errorMsg) this.errorMsg.style.display = 'flex';
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            if (this.errorText) this.errorText.textContent = 'Unable to connect to server. Make sure the backend is running.';
            if (this.errorMsg) this.errorMsg.style.display = 'flex';
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        }
    }
}

// Initialize contact form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormHandler();
});

// ========================================
// Membership Form Handler
// ========================================
class MembershipFormHandler {
    constructor() {
        this.form = document.getElementById('membershipForm');
        this.submitBtn = document.getElementById('membershipSubmitBtn');
        this.joinSuccess = document.getElementById('joinSuccess');
        this.apiUrl = getBackendUrl('/api/memberships');
        this.captchaResult = '';
        
        if (this.form) {
            this.initCaptcha();
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }
    
    initCaptcha() {
        const canvas = document.getElementById('memberCaptchaCanvas');
        const refreshBtn = document.getElementById('memberRefreshCaptcha');
        
        if (canvas) {
            this.captchaResult = CaptchaManager.generateCaptcha('memberCaptchaCanvas');
            canvas.addEventListener('click', () => {
                this.captchaResult = CaptchaManager.generateCaptcha('memberCaptchaCanvas');
            });
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.captchaResult = CaptchaManager.generateCaptcha('memberCaptchaCanvas');
            });
        }
    }
    
    validateForm() {
        const name = document.getElementById('memberName').value.trim();
        const email = document.getElementById('memberEmail').value.trim();
        const type = document.getElementById('memberType').value;
        const captchaAnswer = document.getElementById('memberCaptchaAnswer').value.trim();
        
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('#membershipForm .form-error').forEach(err => {
            err.classList.remove('show');
            err.textContent = '';
        });
        
        if (!name) {
            isValid = false;
        }
        
        if (!email || !this.isValidEmail(email)) {
            isValid = false;
        }
        
        if (!type) {
            isValid = false;
        }
        
        if (!captchaAnswer || captchaAnswer !== this.captchaResult) {
            document.getElementById('memberCaptchaError').textContent = 'Incorrect verification code. Please try again.';
            document.getElementById('memberCaptchaError').classList.add('show');
            this.captchaResult = CaptchaManager.generateCaptcha('memberCaptchaCanvas');
            document.getElementById('memberCaptchaAnswer').value = '';
            isValid = false;
        }
        
        return isValid;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        if (this.joinSuccess) this.joinSuccess.style.display = 'none';
        
        try {
            const formData = {
                name: document.getElementById('memberName').value.trim(),
                email: document.getElementById('memberEmail').value.trim(),
                phone: document.getElementById('memberPhone').value.trim(),
                type: document.getElementById('memberType').value,
            };
            
            const response = await fetchWithFallback(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Success
                if (this.joinSuccess) {
                    this.joinSuccess.querySelector('span').textContent = data.message || `Thank you ${formData.name}! Your membership application has been submitted successfully.`;
                    this.joinSuccess.style.display = 'flex';
                }
                this.form.reset();
                this.captchaResult = CaptchaManager.generateCaptcha('memberCaptchaCanvas');
            } else {
                // Error from server - show in captcha error area as fallback
                const errEl = document.getElementById('memberCaptchaError');
                if (errEl) {
                    errEl.textContent = data.error || 'Failed to submit membership. Please try again.';
                    errEl.classList.add('show');
                }
            }
        } catch (error) {
            console.error('Error submitting membership form:', error);
            const errEl = document.getElementById('memberCaptchaError');
            if (errEl) {
                errEl.textContent = 'Unable to connect to server. Please ensure the backend is running.';
                errEl.classList.add('show');
            }
        } finally {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Application';
        }
    }
}

// Initialize membership form handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MembershipFormHandler();
});

// ========================================
// Formula SAE Blueprint Hero Animation
// ========================================

class BlueprintHeroAnimation {
    constructor() {
        this.container = document.querySelector('.particles-container');
        this.blueprintContainer = document.querySelector('.blueprint-container');
        this.formulaCar = document.querySelector('.formula-car');
        this.hero = document.querySelector('.hero');
        
        if (!this.container) return;
        
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Generate floating particles
        this.generateParticles();
        
        // Trigger animations
        this.triggerAnimations();
    }
    
    generateParticles() {
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
            this.container.appendChild(particle);
        }
    }
    
    triggerAnimations() {
        // Blueprint car drawing animation - SVG elements already have animations via CSS
        if (this.blueprintContainer) {
            this.blueprintContainer.style.opacity = '1';
        }
    }
    
    setupEventListeners() {
        // Mouse move parallax
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        // Touch support for mobile
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.handleMouseMove(e.touches[0]);
            }
        });
    }
    
    handleMouseMove(event) {
        const rect = this.hero.getBoundingClientRect();
        
        // Check if mouse is within hero section
        if (event.clientY < rect.top || event.clientY > rect.bottom) {
            return;
        }
        
        this.targetX = (event.clientX - rect.left) / rect.width - 0.5;
        this.targetY = (event.clientY - rect.top) / rect.height - 0.5;
        
        // Smooth parallax movement
        this.mouseX += (this.targetX - this.mouseX) * 0.1;
        this.mouseY += (this.targetY - this.mouseY) * 0.1;
        
        if (this.blueprintContainer) {
            const maxOffset = 30;
            this.blueprintContainer.style.transform = `
                translate(
                    calc(-50% + ${this.mouseX * maxOffset}px),
                    calc(-50% + ${this.mouseY * maxOffset * 0.5}px)
                )
            `;
        }
        
        requestAnimationFrame(() => {
            // Continuous parallax update
            if (this.blueprintContainer) {
                const maxOffset = 30;
                this.blueprintContainer.style.transform = `
                    translate(
                        calc(-50% + ${this.mouseX * maxOffset}px),
                        calc(-50% + ${this.mouseY * maxOffset * 0.5}px)
                    )
                `;
            }
        });
    }
}

// Initialize animation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new BlueprintHeroAnimation();
});

// Also initialize on page load in case DOMContentLoaded already fired
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BlueprintHeroAnimation();
    });
} else {
    new BlueprintHeroAnimation();
}

