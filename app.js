/**
 * app.js
 * Main Application Logic
 */

// Navigation Helper
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('hidden');
    });

    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();

    // Check Session
    const user = authManager.checkSession();
    if (user) {
        // If we are on index.html and logged in, redirect to dashboard
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            handleLoginSuccess(user);
        }
    } else {
        // If not logged in, show home
        if (document.getElementById('home-section')) {
            showSection('home-section');
            populateHomeNotices();
            populateTopStudents();
        }
    }
    applySiteBackground();
    checkPopup();
    checkPopup();
    loadPrincipalSection();
    loadSpecialPeople(); // New
    loadFooterDetails(); // New
});

async function loadSpecialPeople() {
    const container = document.getElementById('special-people-section');
    const grid = document.getElementById('special-people-grid');
    if (!container || !grid) return;

    try {
        const people = (await dataManager.getSetting('school_special_people')) || [];
        if (people.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        grid.innerHTML = people.map(p => `
            <div class="student-card" style="padding: 20px;">
                <div class="student-photo-placeholder" style="width:120px; height:120px; border: 3px solid var(--primary-color);">
                     <img src="${p.photo}" alt="${p.name}">
                </div>
                <h4 style="font-size: 1.1rem; margin-bottom: 5px;">${p.name}</h4>
                <p style="color: var(--secondary-color); font-weight: 600; font-size: 0.9rem;">${p.position}</p>
            </div>
        `).join('');

    } catch (e) {
        console.error("Special People Load Error", e);
    }
}

async function loadFooterDetails() {
    try {
        const about = await dataManager.getSetting('footer_about');
        const address = await dataManager.getSetting('footer_address');
        const phone = await dataManager.getSetting('footer_phone');
        const email = await dataManager.getSetting('footer_email');

        const aboutText = about || 'Dedicated to excellence in education.';

        if (document.getElementById('display-footer-about'))
            document.getElementById('display-footer-about').textContent = aboutText;

        if (document.getElementById('home-about-text'))
            document.getElementById('home-about-text').textContent = aboutText;

        if (document.getElementById('display-footer-address'))
            document.getElementById('display-footer-address').textContent = address || 'Not Set';

        if (document.getElementById('display-footer-phone'))
            document.getElementById('display-footer-phone').textContent = phone || 'Not Set';

        if (document.getElementById('display-footer-email'))
            document.getElementById('display-footer-email').textContent = email || 'Not Set';

    } catch (e) {
        console.error("Footer Load Error", e);
    }
}

async function loadPrincipalSection() {
    const container = document.getElementById('principal-section');
    if (!container) return;

    try {
        const name = await dataManager.getSetting('principal_name');
        const msg = await dataManager.getSetting('principal_message');
        const photo = await dataManager.getSetting('principal_photo');

        if (!name && !msg && !photo) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.style.flexDirection = 'row';
        container.style.alignItems = 'center';
        container.style.gap = '30px';
        container.style.flexWrap = 'wrap';
        container.style.justifyContent = 'center';

        container.innerHTML = `
            <div style="flex: 0 0 200px; text-align: center;">
                <img src="${photo || 'https://ui-avatars.com/api/?name=Principal&background=random'}" 
                     alt="Principal" 
                     style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary-color);">
                <h3 style="margin-top: 10px; color: var(--primary-color);">${name || 'Principal'}</h3>
                <p style="color: #666; font-weight: bold;">Principal</p>
            </div>
            <div style="flex: 1; min-width: 300px;">
                <h3 style="margin-bottom: 15px;">Message from the Principal</h3>
                <p style="font-size: 1.1rem; line-height: 1.6; color: #444;">
                    "${msg || 'Welcome to our school website.'}"
                </p>
            </div>
        `;
    } catch (e) {
        console.error("Principal Load Error", e);
    }
}

async function checkPopup() {
    // Only on home page (or global? User said "when website is opened", usually means landing page)
    // Let's restrict to Home for now as it's less intrusive, or check if it's the first visit session?
    // User said "immediately when the website is opened".
    if (!document.getElementById('home-section')) return;

    try {
        const isActive = await dataManager.getSetting('popup_active');
        if (!isActive) return;

        const title = await dataManager.getSetting('popup_title');
        const image = await dataManager.getSetting('popup_image');

        // If no content, don't show
        if (!title && !image) return;

        const modal = document.getElementById('announcement-modal');
        const body = document.getElementById('popup-body');

        body.innerHTML = '';

        if (title) {
            body.innerHTML += `<div class="popup-text"><h3>${title}</h3></div>`;
        }

        if (image) {
            body.innerHTML += `<div class="popup-image-container"><img src="${image}" alt="Announcement"></div>`;
        }

        modal.classList.add('active');

        // Add close logic
        modal.onclick = (e) => {
            if (e.target === modal) closeAnnouncement();
        };

    } catch (e) {
        console.error("Popup Error", e);
    }
}

function closeAnnouncement() {
    const modal = document.getElementById('announcement-modal');
    if (modal) modal.classList.remove('active');
}

async function applySiteBackground() {
    // Only apply if body has home-body class
    if (!document.body.classList.contains('home-body')) return;

    try {
        const bg = await dataManager.getSetting('home_bg');
        if (bg) {
            // Full page background with light overlay (Clearer) and FIXED attachment (Stable)
            document.body.style.backgroundImage = `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('${bg}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        }
    } catch (e) {
        console.error("Failed to load background", e);
    }
}

function handleLoginSuccess(user) {
    if (user.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
    } else if (user.role === 'teacher') {
        window.location.href = 'teacher-dashboard.html';
    } else if (user.role === 'student') {
        window.location.href = 'student-dashboard.html';
    }
}

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;

    container.appendChild(toast);

    // Close logic
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.onclick = () => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    };

    // Auto remove
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}


// --- NAVIGATION & UI HANDLERS ---

function setupNavigation() {
    // Nav Buttons
    const navs = ['home', 'register', 'login', 'gallery', 'teachers', 'notices'];
    navs.forEach(id => {
        document.getElementById(`nav-${id}`)?.addEventListener('click', () => {
            // Handle special cases
            if (id === 'gallery') loadGallery();
            else if (id === 'notices') loadNotices();
            else if (id === 'teachers') loadTeachers();
            else if (id === 'home') {
                showSection('home-section');
                populateHomeNotices();
                populateTopStudents();
            }
            else showSection(`${id}-section`);
        });
    });

    document.getElementById('btn-see-all-notices')?.addEventListener('click', loadNotices);

    // Register Toggles
    const btnStudent = document.getElementById('toggle-student');
    const btnTeacher = document.getElementById('toggle-teacher');

    btnStudent?.addEventListener('click', () => {
        setRegisterType('student');
        btnStudent.classList.add('active', 'btn-primary');
        btnStudent.classList.remove('btn-secondary');

        btnTeacher.classList.add('btn-secondary');
        btnTeacher.classList.remove('active', 'btn-primary');
    });

    btnTeacher?.addEventListener('click', () => {
        setRegisterType('teacher');
        btnTeacher.classList.add('active', 'btn-primary');
        btnTeacher.classList.remove('btn-secondary');

        btnStudent.classList.add('btn-secondary');
        btnStudent.classList.remove('active', 'btn-primary');
    });

    // Register Form Submit
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);

    // Login Form Submit
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);

    // Logout buttons
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', () => authManager.logout());
    });
}

function setRegisterType(type) {
    document.getElementById('reg-type').value = type;
    if (type === 'student') {
        document.getElementById('student-fields').classList.remove('hidden');
        document.getElementById('teacher-fields').classList.add('hidden');
        // Student Fields required
        document.getElementById('reg-rollno').setAttribute('required', 'true');
    } else {
        document.getElementById('teacher-fields').classList.remove('hidden');
        document.getElementById('student-fields').classList.add('hidden');
        // Student Fields not required
        document.getElementById('reg-rollno').removeAttribute('required');
    }
}

// --- FORM HANDLING ---

async function handleRegister(e) {
    e.preventDefault();

    try {
        // ... (Same File Handling) ...
        const photoFile = document.getElementById('reg-photo').files[0];
        if (photoFile && photoFile.size > 2 * 1024 * 1024) {
            showToast("Photo size must be less than 2 MB", 'error');
            return;
        }

        // ... (Password Check) ...
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm-password').value;

        if (password !== confirm) {
            showToast("Passwords do not match!", 'error');
            return;
        }

        // ... (Base64) ...
        let photoBase64 = null;
        if (photoFile) {
            // High Compress for Storage (100+ users goal)
            photoBase64 = await toBase64(photoFile, 120, 120, 0.5);
        }

        const type = document.getElementById('reg-type').value;
        const commonData = {
            firstName: document.getElementById('reg-firstname').value,
            lastName: document.getElementById('reg-lastname').value,
            mobile: document.getElementById('reg-mobile').value,
            photo: photoBase64,
            password: password, // Will be hashed in authManager
            isBlocked: false
        };

        // ... (User Data Setup) ...
        let userData = {};

        if (type === 'student') {
            const roll = document.getElementById('reg-rollno').value;
            userData = {
                ...commonData,
                role: 'student',
                class: document.getElementById('reg-class').value,
                rollNo: roll,
                fatherName: document.getElementById('reg-fathername').value,
                motherName: document.getElementById('reg-mothername').value,
                parentMobile: document.getElementById('reg-parentmobile').value,
                username: (commonData.lastName + roll).toLowerCase().replace(/\s/g, ''),
                id: 'stu_' + Date.now()
            };
        } else {
            userData = {
                ...commonData,
                role: 'teacher',
                address: document.getElementById('reg-address').value,
                username: (commonData.lastName + 't').toLowerCase().replace(/\s/g, ''),
                id: 'tch_' + Date.now()
            };
        }

        const result = await authManager.register(userData); // Await here
        if (result.success) {
            showToast(`Your account created successfully. Username: ${userData.username}`, 'success');
            showSection('login-section');
            e.target.reset();
            alert(`IMPORTANT: Your username is ${userData.username}`);
        } else {
            // Check if it's a duplicate error
            if (result.message.includes('already registered') || result.message.includes('already exists')) {
                // User requested "green colour font" for this error, so we use 'success' type which is green
                showToast("Your account already created", 'success');
            } else {
                showToast(result.message, 'error');
            }
        }
    } catch (error) {
        console.error("Registration Error:", error);
        showToast("An unexpected error occurred: " + error.message, 'error');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;

    const result = await authManager.login(u, p); // Await here
    if (result.success) {
        showToast("Login Successful", 'success');
        handleLoginSuccess(result.user);
    } else {
        showToast(result.message, 'error');
    }
}

// --- UTILS ---

// Compress Image to Base64 using Canvas
// Compress Image to Base64 using Canvas
function toBase64(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        // ... (Existing) ...
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (error) => reject(error);
    });
}

// XSS Sanitizer
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// --- PUBLIC PAGE RENDERERS ---

function populateHomeNotices() {
    const notices = dataManager.getNotices().slice(0, 3); // Top 3
    const container = document.getElementById('home-notices-list');
    container.innerHTML = '';

    if (notices.length === 0) {
        container.innerHTML = '<p class="text-center">No recent notices.</p>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'notices-grid';

    notices.forEach(n => {
        const div = document.createElement('div');
        div.className = 'notice-item';
        div.style.marginBottom = '0'; // Override for grid
        div.innerHTML = `<h4>${escapeHTML(n.title)}</h4><small>${escapeHTML(n.date)}</small><p>${escapeHTML(n.content).substring(0, 100)}...</p>`;
        grid.appendChild(div);
    });

    container.appendChild(grid);
}

// ...

function loadNotices() {
    showSection('notices-section');
    const notices = dataManager.getNotices();
    const list = document.getElementById('notices-list');
    list.innerHTML = '';

    if (notices.length === 0) {
        list.innerHTML = '<li>No notices available.</li>';
        return;
    }

    notices.forEach(n => {
        const li = document.createElement('li');
        li.className = 'notice-item';

        let imgHtml = '';
        if (n.photo) {
            imgHtml = `<div style="margin-bottom:15px; max-width:100%; overflow:hidden; border-radius:8px;">
                        <img src="${n.photo}" style="max-width:100%; max-height:400px; object-fit:contain;" alt="Notice Image">
                       </div>`;
        }

        li.innerHTML = `<h3>${escapeHTML(n.title)}</h3><small class="notice-date">${escapeHTML(n.date)}</small>${imgHtml}<p>${escapeHTML(n.content)}</p>`;
        list.appendChild(li);
    });
}

function populateTopStudents() {
    const achievers = dataManager.getAchievers();
    const homeSection = document.getElementById('home-section');
    if (!homeSection) return;

    let heroUsersGrid = document.getElementById('achievers-grid');

    if (!heroUsersGrid) {
        // Fallback or recovery if ID missing
        const h3 = document.createElement('h3');
        h3.textContent = "Our Achievers";
        h3.className = "text-center mb-4";
        homeSection.appendChild(h3);

        heroUsersGrid = document.createElement('div');
        heroUsersGrid.id = 'achievers-grid';
        heroUsersGrid.className = 'students-grid';
        homeSection.appendChild(heroUsersGrid);
    }

    heroUsersGrid.style.display = 'grid';
    heroUsersGrid.innerHTML = '';

    if (achievers.length === 0) {
        heroUsersGrid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No achievers featured yet.</p>';
        return;
    }

    achievers.forEach(student => {
        const div = document.createElement('div');
        div.className = 'student-card';
        div.innerHTML = `
            <div class="student-photo-placeholder">
                ${student.photo ? `<img src="${student.photo}" alt="${student.name}">` : '★'}
            </div>
            <h4>${escapeHTML(student.name)}</h4>
            <p>${escapeHTML(student.comment)}</p>
        `;
        heroUsersGrid.appendChild(div);
    });
}

function loadTeachers() {
    showSection('teachers-section');
    const users = dataManager.getUsers();
    const teachers = users.filter(u => u.role === 'teacher');
    const container = document.getElementById('teachers-grid');
    container.innerHTML = '';

    if (teachers.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No teachers registered yet.</p>';
        return;
    }

    teachers.forEach(t => {
        const div = document.createElement('div');
        div.className = 'student-card'; // Reuse styled card
        // Use standard background to avoid "too featured" complaint
        div.innerHTML = `
            <div class="student-photo-placeholder">
                ${t.photo ? `<img src="${t.photo}" style="width:100%; height:100%; object-fit:cover;">` : `<img src="https://ui-avatars.com/api/?name=${t.firstName}+${t.lastName}&background=ddd&color=333" style="width:100%; height:100%; object-fit:cover;">`}
            </div>
            <h4>${escapeHTML(t.firstName)} ${escapeHTML(t.lastName)}</h4>
            <p style="font-size: 0.9em; color: #666;">${escapeHTML(t.address || 'Teacher')}</p>
        `;
        container.appendChild(div);
    });
}

async function loadGallery() {
    showSection('gallery-section');
    const gallery = await dataManager.getGallery(); // Async
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';

    if (gallery.length === 0) {
        grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No photos added yet.</p>';
        return;
    }

    // Show newest first
    gallery.reverse().forEach(img => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.style.cursor = 'pointer';
        div.innerHTML = `<img src="${img.src}" alt="School Photo">`;
        div.onclick = () => openLightbox(img.src);
        grid.appendChild(div);
    });
}

// Lightbox Logic
function openLightbox(src) {
    let lightbox = document.getElementById('lightbox-modal');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox-modal';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
            <img class="lightbox-content" src="" alt="Full View">
        `;
        document.body.appendChild(lightbox);

        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    const img = lightbox.querySelector('img');
    img.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox-modal');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}


