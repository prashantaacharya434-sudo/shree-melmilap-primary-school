/**
 * admin.js
 * Admin Dashboard Logic
 */

function initAdminDashboard() {
    setupAdminNavigation();
    loadAdminHome();
}

function setupAdminNavigation() {
    const buttons = document.querySelectorAll('.sidebar button');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            buttons.forEach(b => b.classList.remove('active'));
            // Add to current
            e.target.classList.add('active');

            const view = e.target.dataset.view;
            if (view) {
                loadAdminView(view);
            }
        });
    });
}

function loadAdminView(view) {
    const content = document.getElementById('admin-content-area');
    content.innerHTML = '<p class="text-center">Loading...</p>';

    setTimeout(() => {
        switch (view) {
            case 'admin-home':
                loadAdminHome();
                break;
            case 'admin-student':
                loadAdminStudents();
                break;
            case 'admin-teacher':
                loadAdminTeachers();
                break;
            case 'admin-notices':
                loadAdminNotices();
                break;
            case 'admin-gallery':
                loadAdminGallery();
                break;
            case 'admin-achievers':
                loadAdminAchievers();
                break;
        }
    }, 200); // Small transition delay
}

// --- VIEWS ---

function loadAdminHome() {
    const content = document.getElementById('admin-content-area');
    const studentCount = dataManager.getUsers().filter(u => u.role === 'student').length;
    const teacherCount = dataManager.getUsers().filter(u => u.role === 'teacher').length;
    const noticeCount = dataManager.getNotices().length;
    const achieverCount = dataManager.getAchievers().length;
    const storage = dataManager.getStorageUsage();
    const storagePercent = Math.min((storage.total / 5120) * 100, 100).toFixed(1); // Assuming 5MB limit

    content.innerHTML = `
        <h3>Admin Overview</h3>
        <p class="mb-4">Welcome back, Admin. Here is the current status of the school system.</p>
        
        <!-- Storage Indicator -->
        <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h4>Storage Usage</h4>
            <div style="background: #eee; border-radius: 10px; height: 20px; width: 100%; margin: 10px 0; overflow: hidden;">
                <div style="background: ${storagePercent > 90 ? 'red' : 'var(--success-color)'}; width: ${storagePercent}%; height: 100%;"></div>
            </div>
            <p>Used: <strong>${storage.total} KB</strong> / Unlimited</p>
            <small style="color: #666;">
                Gallery: ${storage.details['school_gallery'] || '0 KB'} (Database) | 
                Users: ${storage.details['school_users'] || '0 KB'} | 
                Messages: ${storage.details['school_messages'] || '0 KB'}
            </small>
        </div>

        <!-- Appearance Settings -->
        <div class="auth-form" style="max-width: 100%; margin-bottom: 30px; border-top: 5px solid var(--primary-color);">
            <h4>Website Appearance</h4>
            <div class="form-group">
                <label>Home Page Background</label>
                <input type="file" id="bg-upload-input" accept="image/*">
                <small>Recommended: High Quality, Landscape (1920x1080). Max 10MB.</small>
            </div>
            <button class="btn btn-primary" onclick="updateSiteBackground()">Set Background</button>
            <button class="btn btn-danger" onclick="resetSiteBackground()">Reset to Default</button>
        </div>

        <!-- Announcement Pop-up Settings -->
        <div class="auth-form" style="max-width: 100%; margin-bottom: 30px; border-top: 5px solid var(--danger-color);">
            <h4>Pop-up Announcement (Festival/Events)</h4>
            <div class="form-group">
                <label>Announcement Title</label>
                <input type="text" id="popup-title" placeholder="e.g. Happy Dashain!">
            </div>
            <div class="form-group">
                <label>Banner Image (Optional)</label>
                <input type="file" id="popup-image" accept="image/*">
            </div>
            <div class="form-group" style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="popup-active" style="width: auto;">
                <label for="popup-active" style="margin:0; cursor:pointer;">Enable Pop-up on Home Page</label>
            </div>
            <button class="btn btn-primary" onclick="saveAnnouncement()">Save Settings</button>
        </div>

        <!-- Principal Section Settings -->
        <div class="auth-form" style="max-width: 100%; margin-bottom: 30px; border-top: 5px solid #2ecc71;">
            <h4>Principal's Message</h4>
            <div class="form-group">
                <label>Principal's Name</label>
                <input type="text" id="principal-name" placeholder="e.g. Mr. Sharma">
            </div>
             <div class="form-group">
                <label>Message</label>
                <textarea id="principal-msg" rows="3" placeholder="Welcome message..."></textarea>
            </div>
            <div class="form-group">
                <label>Photo (Optional)</label>
                <input type="file" id="principal-photo" accept="image/*">
            </div>
            <button class="btn btn-primary" onclick="savePrincipalSettings()">Update Principal Info</button>
        </div>

        <!-- Special Administration Members (Max 8) -->
        <div class="auth-form" style="max-width: 100%; margin-bottom: 30px; border-top: 5px solid #9b59b6;">
            <h4>Key Administration Members (e.g. VP, Coordinator)</h4>
            <p>Feature up to 8 special members on the home page.</p>
            
            <div class="form-group">
                <label>Name</label>
                <input type="text" id="sp-name" placeholder="e.g. Mrs. Adhikari">
            </div>
            <div class="form-group">
                <label>Position</label>
                <input type="text" id="sp-position" placeholder="e.g. Vice Principal">
            </div>
            <div class="form-group">
                <label>Photo</label>
                <input type="file" id="sp-photo" accept="image/*">
            </div>
            <button class="btn btn-primary" onclick="addSpecialPerson()">Add Member</button>

            <h5 style="margin-top:20px;">Current Members (<span id="sp-count">0</span>/8)</h5>
            <div id="sp-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:10px; margin-top:10px;">
                <!-- Dynamic List -->
            </div>
        </div>

        <!-- Footer / Contact Details -->
        <div class="auth-form" style="max-width: 100%; margin-bottom: 30px; border-top: 5px solid #34495e;">
            <h4>Footer & Contact Details</h4>
            <div class="form-group">
                <label>About School (Footer Text)</label>
                <textarea id="footer-about" rows="3" placeholder="Short description..."></textarea>
            </div>
            <div class="form-row">
                 <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="footer-address" placeholder="e.g. Kathmandu, Nepal">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="text" id="footer-phone" placeholder="e.g. +977-1-444444">
                </div>
            </div>
             <div class="form-group">
                <label>Email</label>
                <input type="email" id="footer-email" placeholder="info@school.edu.np">
            </div>
            <button class="btn btn-primary" onclick="saveFooterSettings()">Save Footer Details</button>
        </div>

        <div class="students-grid">
            <div class="student-card">
                <h4>Students</h4>
                <p style="font-size: 2rem; color: var(--primary-color); font-weight: bold;">${studentCount}</p>
                <p>Registered</p>
            </div>
            <div class="student-card">
                <h4>Teachers</h4>
                <p style="font-size: 2rem; color: var(--primary-color); font-weight: bold;">${teacherCount}</p>
                <p>Registered</p>
            </div>
            <div class="student-card">
                <h4>Notices</h4>
                <p style="font-size: 2rem; color: var(--primary-color); font-weight: bold;">${noticeCount}</p>
                <p>Published</p>
            </div>
             <div class="student-card">
                <h4>Achievers</h4>
                <p style="font-size: 2rem; color: var(--primary-color); font-weight: bold;">${achieverCount}</p>
                <p>Featured</p>
            </div>
        </div>
    `;

    // Initialize the Special People List
    loadSpecialPeopleList();
    // Pre-fill Footer Form
    loadFooterForm();
}

// ... (Other Views: loadAdminStudents, loadAdminTeachers, loadAdminNotices) ...

function loadAdminAchievers() {
    const content = document.getElementById('admin-content-area');
    const achievers = dataManager.getAchievers();

    let html = `
        <h3>Manage Top Achievers</h3>
        <div class="auth-form" style="max-width: 100%; margin: 0 0 30px;">
            <h4>Add New Achiever</h4>
            <div class="form-group">
                <input type="text" id="achiever-name" placeholder="Student Name">
            </div>
             <div class="form-group">
                <input type="text" id="achiever-comment" placeholder="Comment (e.g. 'Best Student of the Year')">
            </div>
            <div class="form-group">
                <label>Student Photo (Small size recommended)</label>
                <input type="file" id="achiever-photo" accept="image/*">
            </div>
            <button id="btn-add-achiever" class="btn btn-primary" onclick="addAchiever()">Add Achiever</button>
        </div>
        
        <h4>Current Achievers List</h4>
        <div class="students-grid">
    `;

    if (achievers.length === 0) {
        html += '<p style="grid-column: 1/-1;">No achievers added yet.</p>';
    } else {
        achievers.forEach(a => {
            html += `
            <div class="student-card">
                <div class="student-photo-placeholder">
                    ${a.photo ? `<img src="${a.photo}" style="width:100%; height:100%; object-fit:cover;">` : 'No Photo'}
                </div>
                <h4>${a.name}</h4>
                <p>"${a.comment}"</p>
                <div style="margin-top:10px; display:flex; gap:10px; justify-content:center;">
                    <button class="btn btn-sm btn-secondary" onclick="editAchiever(${a.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAchiever(${a.id})">Delete</button>
                </div>
            </div>`;
        });
    }

    html += `</div>`;
    content.innerHTML = html;
}

// ... (Action functions) ...

async function addAchiever() {
    const name = document.getElementById('achiever-name').value;
    const comment = document.getElementById('achiever-comment').value;
    const fileInput = document.getElementById('achiever-photo');

    if (!name || !comment) {
        return showToast("Name and Comment are required", 'error');
    }

    let photoBase64 = null;
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > 2 * 1024 * 1024) {
            return showToast("Photo too large (Max 2MB)", 'error');
        }
        try {
            photoBase64 = await toBase64(file, 150, 150, 0.6);
        } catch (e) {
            console.error(e);
            return showToast("Error processing photo", 'error');
        }
    }

    const achiever = {
        id: Date.now(),
        name,
        comment,
        photo: photoBase64
    };

    try {
        dataManager.addAchiever(achiever);
        showToast("Achiever Added Successfully", 'success');
        loadAdminAchievers(); // Reloads and clears form
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert("Storage Full! Clear old data.");
        }
        showToast("Error saving: " + e.message, 'error');
    }
}

function editAchiever(id) {
    const achiever = dataManager.getAchievers().find(a => a.id === id);
    if (!achiever) return;

    document.getElementById('achiever-name').value = achiever.name;
    document.getElementById('achiever-comment').value = achiever.comment;

    // Change button to Update
    const btn = document.getElementById('btn-add-achiever');
    btn.textContent = "Update Achiever";
    btn.onclick = () => updateAchiever(id);
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-success');

    // Scroll to top
    document.getElementById('admin-content-area').scrollIntoView({ behavior: 'smooth' });
}

async function updateAchiever(id) {
    const name = document.getElementById('achiever-name').value;
    const comment = document.getElementById('achiever-comment').value;
    const fileInput = document.getElementById('achiever-photo');

    const achievers = dataManager.getAchievers();
    const index = achievers.findIndex(a => a.id === id);
    if (index === -1) return;

    let photoBase64 = achievers[index].photo; // Keep old photo by default

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        try {
            photoBase64 = await toBase64(file, 150, 150, 0.6);
        } catch (e) {
            return showToast("Error processing photo", 'error');
        }
    }

    achievers[index].name = name;
    achievers[index].comment = comment;
    achievers[index].photo = photoBase64;

    dataManager.saveAchievers(achievers);
    showToast("Achiever Updated!", 'success');
    loadAdminAchievers(); // Resets UI
}

function deleteAchiever(id) {
    if (!confirm('Remove this student from achievers?')) return;
    dataManager.deleteAchiever(id);
    loadAdminAchievers();
}

function loadAdminStudents() {
    const content = document.getElementById('admin-content-area');
    const users = dataManager.getUsers().filter(u => u.role === 'student');

    let html = `<h3>Manage Students</h3>`;

    if (users.length === 0) {
        html += `<p>No students registered yet.</p>`;
    } else {
        html += `
        <div style="overflow-x: auto;">
        <table class="user-table">
            <thead>
                <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Password</th>
                    <th>Class</th>
                    <th>Mobile</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
        `;
        users.forEach(u => {
            html += `
            <tr>
                <td>${u.rollNo}</td>
                <td>${u.firstName} ${u.lastName}</td>
                <td>${u.password}</td>
                <td>${u.class}</td>
                <td>${u.mobile}</td>
                <td><span style="color: ${u.isBlocked ? 'red' : 'green'}; font-weight: bold;">${u.isBlocked ? 'Blocked' : 'Active'}</span></td>
                <td>
                    <button class="btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-danger'}" 
                            onclick="toggleBlockUser('${u.id}')">
                        ${u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="viewUserProfile('${u.id}')">View</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')" style="margin-left: 5px;">Delete</button>
                </td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    }
    content.innerHTML = html;
}

function loadAdminTeachers() {
    const content = document.getElementById('admin-content-area');
    const users = dataManager.getUsers().filter(u => u.role === 'teacher');

    let html = `<h3>Manage Teachers</h3>`;

    if (users.length === 0) {
        html += `<p>No teachers registered yet.</p>`;
    } else {
        html += `
        <div style="overflow-x: auto;">
        <table class="user-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Password</th>
                    <th>Mobile</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
        `;
        users.forEach(u => {
            html += `
            <tr>
                <td>${u.firstName} ${u.lastName}</td>
                <td>${u.password}</td>
                <td>${u.mobile}</td>
                <td>${u.address}</td>
                <td><span style="color: ${u.isBlocked ? 'red' : 'green'}; font-weight: bold;">${u.isBlocked ? 'Blocked' : 'Active'}</span></td>
                <td>
                    <button class="btn btn-sm ${u.isBlocked ? 'btn-success' : 'btn-danger'}" 
                            onclick="toggleBlockUser('${u.id}')">
                        ${u.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="viewUserProfile('${u.id}')">View</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${u.id}')" style="margin-left: 5px;">Delete</button>
                </td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
    }
    content.innerHTML = html;
}

function loadAdminNotices() {
    const content = document.getElementById('admin-content-area');
    const notices = dataManager.getNotices();

    let html = `
        <h3>Notice Board</h3>
        <div class="auth-form" style="max-width: 100%; margin: 0 0 30px;">
            <h4>Add New Notice</h4>
            <div class="form-group">
                <input type="text" id="notice-title" placeholder="Notice Title">
            </div>
            <div class="form-group">
                <input type="date" id="notice-date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <textarea id="notice-content" rows="4" placeholder="Notice Content"></textarea>
            </div>
            <div class="form-group">
                <label>Photo (Optional)</label>
                <input type="file" id="notice-photo" accept="image/*">
            </div>
            <button class="btn btn-primary" onclick="addNotice()">Publish Notice</button>
        </div>
        
        <h4>Published Notices</h4>
        <ul class="notices-list" style="margin: 0; max-width: 100%;">
    `;

    if (notices.length === 0) {
        html += '<p>No notices found.</p>';
    } else {
        notices.forEach(n => {
            html += `
            <li class="notice-item">
                <div style="display:flex; justify-content:space-between; align-items: flex-start;">
                    <div>
                        <h3>${n.title}</h3>
                        <span class="notice-date">${n.date}</span>
                        <p>${n.content}</p>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="deleteNotice('${n.id}')">Delete</button>
                </div>
            </li>`;
        });
    }

    html += `</ul>`;
    content.innerHTML = html;
}

async function loadAdminGallery() {
    const content = document.getElementById('admin-content-area');
    const gallery = await dataManager.getGallery(); // Async for 500MB Support

    let html = `
        <h3>Gallery Management</h3>
        <p class="mb-4">Storage: Database (500MB+ Supported)</p>
        <div class="auth-form" style="max-width: 100%; margin: 0 0 30px;">
            <h4>Upload New Photo</h4>
            <div class="form-group">
                <input type="file" id="gallery-upload" accept="image/*">
                <small>Max size 10MB.</small>
            </div>
            <button class="btn btn-primary" onclick="addGalleryPhoto()">Upload Photo</button>
        </div>
        
        <div class="gallery-grid">
    `;

    gallery.reverse().forEach(img => {
        html += `
        <div class="gallery-item">
            <img src="${img.src}" alt="Gallery">
            <div style="padding: 10px;">
                <p style="font-size: 0.8rem; margin-bottom: 5px;">${new Date(img.date).toLocaleDateString()}</p>
                <button class="btn btn-sm btn-danger" style="width: 100%" onclick="deletePhoto(${img.id})">Delete</button>
            </div>
        </div>`;
    });

    html += `</div>`;
    content.innerHTML = html;
}

// ... Actions ...

async function addGalleryPhoto() {
    const fileInput = document.getElementById('gallery-upload');
    if (fileInput.files.length === 0) {
        showToast("Please select a photo", 'error');
        return;
    }

    const file = fileInput.files[0];
    if (file.size > 10 * 1024 * 1024) {
        showToast("File too large. Max size is 10MB.", 'error');
        return;
    }

    try {
        // High Quality for 500MB storage
        const base64 = await toBase64(file, 1920, 1920, 0.9);
        const photo = {
            id: Date.now(),
            src: base64,
            date: Date.now()
        };
        await dataManager.addPhoto(photo);
        showToast("Photo Uploaded Successfully!", 'success');
        loadAdminGallery();
    } catch (e) {
        console.error(e);
        showToast("Error uploading: " + e.message, 'error');
    }
}

async function deletePhoto(id) {
    if (!confirm('Delete this photo?')) return;
    await dataManager.deletePhoto(id);
    loadAdminGallery();
}

async function updateSiteBackground() {
    const fileInput = document.getElementById('bg-upload-input');
    if (fileInput.files.length === 0) {
        showToast("Please select an image", 'error');
        return;
    }
    const file = fileInput.files[0];
    if (file.size > 10 * 1024 * 1024) return showToast("File too large (Max 10MB)", 'error');

    try {
        showToast("Uploading... Step 1: Processing Image", 'info');
        // High Quality
        const base64 = await toBase64(file, 1920, 1080, 0.9);

        showToast("Step 2: Saving to Database", 'info');
        await dataManager.saveSetting('home_bg', base64);

        showToast("Success! Background Updated. Refresh page.", 'success');
    } catch (e) {
        showToast("Error: " + e.message, 'error');
    }
}

async function resetSiteBackground() {
    showToast("Background Reset. Refresh home page.", 'success');
}

async function saveAnnouncement() {
    console.log("saveAnnouncement: Started");
    const title = document.getElementById('popup-title').value;
    const active = document.getElementById('popup-active').checked;
    const fileInput = document.getElementById('popup-image');

    let imageBase64 = null;

    try {
        // If file selected, process it
        if (fileInput && fileInput.files.length > 0) {
            console.log("saveAnnouncement: File found");
            const file = fileInput.files[0];
            if (file.size > 5 * 1024 * 1024) return showToast("Image too large (Max 5MB)", 'error');

            showToast("Step 1: Processing Image...", 'info');
            // Use local toBase64 to ensure availability
            imageBase64 = await toBase64(file, 800, 800, 0.8);
            console.log("saveAnnouncement: Image processed");
        } else {
            console.log("saveAnnouncement: No new file, fetching old image");
            // Keep existing image if no new one provided
            const oldImg = await dataManager.getSetting('popup_image');
            imageBase64 = oldImg;
        }

        showToast("Step 2: Saving Settings to DB...", 'info');
        console.log("saveAnnouncement: Saving to DB");

        await dataManager.saveSetting('popup_title', title);
        await dataManager.saveSetting('popup_active', active);
        if (imageBase64 !== undefined) {
            await dataManager.saveSetting('popup_image', imageBase64);
        }

        console.log("saveAnnouncement: Full Success");
        showToast("Success! Settings Saved.", 'success');
        alert("Announcement Saved Successfully! Go to the home page (Log out) to view it.");

    } catch (e) {
        console.error("saveAnnouncement Error:", e);
        showToast("Error: " + e.message, 'error');
        alert("Critical Error: " + e.message);
    }
}

// Helper: Compress Image to Base64 (Local copy to ensure availability in Admin)
function toBase64(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
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
                // Compress to JPEG 
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (error) => reject(error);
    });
}

async function addNotice() {
    const title = document.getElementById('notice-title').value;
    const date = document.getElementById('notice-date').value;
    const content = document.getElementById('notice-content').value;
    const fileInput = document.getElementById('notice-photo');

    // Validation: Title and Date mandatory. Content OR Photo mandatory.
    let hasPhoto = (fileInput && fileInput.files.length > 0);
    if (!title || !date || (!content && !hasPhoto)) {
        return showToast("Please provide Title, Date, and at least Content OR Photo.", 'error');
    }

    let photoBase64 = null;
    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (file.size > 5 * 1024 * 1024) return showToast("Photo too large (Max 5MB)", 'error');
        try {
            photoBase64 = await toBase64(file, 800, 800, 0.8);
        } catch (e) {
            return showToast("Error processing photo", 'error');
        }
    }

    const notice = {
        id: Date.now().toString(),
        title,
        date,
        content,
        photo: photoBase64
    };

    try {
        dataManager.addNotice(notice);
        showToast("Notice Published!", 'success');
        loadAdminNotices(); // Reload list
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert("Storage Full! Clear old data.");
        }
        showToast("Error publishing: " + e.message, 'error');
    }
}

async function deleteNotice(id) {
    if (!confirm("Delete this notice?")) return;
    dataManager.deleteNotice(id);
    loadAdminNotices();
}

async function savePrincipalSettings() {
    const name = document.getElementById('principal-name').value;
    const msg = document.getElementById('principal-msg').value;
    const fileInput = document.getElementById('principal-photo');

    let photoBase64 = null;

    try {
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (file.size > 2 * 1024 * 1024) return showToast("Photo too large (Max 2MB)", 'error');
            photoBase64 = await toBase64(file, 400, 400, 0.8);
        } else {
            const oldPhoto = await dataManager.getSetting('principal_photo');
            photoBase64 = oldPhoto;
        }

        await dataManager.saveSetting('principal_name', name);
        await dataManager.saveSetting('principal_message', msg);
        if (photoBase64) await dataManager.saveSetting('principal_photo', photoBase64);

        showToast("Principal Info Saved!", 'success');

    } catch (e) {
        showToast("Error saving: " + e.message, 'error');
    }
}

// Global modal close function for profile view
function closeProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (modal) modal.remove();
}

function viewUserProfile(userId) {
    const user = dataManager.getUsers().find(u => u.id === userId);
    if (!user) return showToast("User not found", 'error');

    // Create Modal Element
    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.zIndex = '2000'; // Increased z-index to be on top of header
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    // Allow closing by clicking outside
    modal.onclick = (e) => {
        if (e.target === modal) closeProfileModal();
    }

    // Generate Role Specific Info
    let additionalInfo = '';
    if (user.role === 'student') {
        additionalInfo = `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Roll No:</td>
                <td style="padding: 10px; text-align: right;">${user.rollNo}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Class:</td>
                <td style="padding: 10px; text-align: right;">${user.class}</td>
            </tr>
             <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Father's Name:</td>
                <td style="padding: 10px; text-align: right;">${user.fatherName}</td>
            </tr>
             <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Mother's Name:</td>
                <td style="padding: 10px; text-align: right;">${user.motherName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Mobile:</td>
                <td style="padding: 10px; text-align: right;">${user.mobile}</td>
            </tr>
             <tr>
                <td style="padding: 10px; font-weight: bold; color: #555;">Parent's Contact:</td>
                <td style="padding: 10px; text-align: right;">${user.parentMobile}</td>
            </tr>
        `;
    } else if (user.role === 'teacher') {
        additionalInfo = `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Address:</td>
                <td style="padding: 10px; text-align: right;">${user.address}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: bold; color: #555;">Mobile:</td>
                <td style="padding: 10px; text-align: right;">${user.mobile}</td>
            </tr>
            <tr>
                <td style="padding: 10px; font-weight: bold; color: #555;">Username:</td>
                <td style="padding: 10px; text-align: right;">${user.username}</td>
            </tr>
        `;
    }

    const content = `
        <div style="background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 500px; position: relative; max-height: 90vh; overflow-y: auto;">
            <button onclick="closeProfileModal()" style="position: absolute; top: 15px; right: 15px; border: none; background: none; font-size: 1.5rem; cursor: pointer; color: #666;">&times;</button>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: var(--primary-color); margin-bottom: 5px;">${user.role === 'teacher' ? 'Teacher Profile' : 'Student Profile'}</h3>
                <p style="color: #666; font-size: 0.9rem;">${user.role.toUpperCase()}</p>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                <!-- Profile Image -->
                <div style="width: 200px; height: 200px; border-radius: 50%; overflow: hidden; border: 5px solid #eee; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <img src="${user.photo || 'https://ui-avatars.com/api/?name=' + user.firstName + '+' + user.lastName}" 
                         style="width: 100%; height: 100%; object-fit: cover;" 
                         alt="User Photo">
                </div>

                <!-- Info Table -->
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 10px; font-weight: bold; color: #555;">Name:</td>
                        <td style="padding: 10px; text-align: right;">${user.firstName} ${user.lastName}</td>
                    </tr>
                    ${additionalInfo}
                </table>

                 <button onclick="closeProfileModal()" class="btn btn-secondary" style="width: 100%; margin-top: 10px;">Close</button>
            </div>
        </div>
    `;

    modal.innerHTML = content;
    document.body.appendChild(modal);
}

// --- Special People Logic ---

async function loadSpecialPeopleList() {
    const listContainer = document.getElementById('sp-list');
    const countSpan = document.getElementById('sp-count');
    if (!listContainer) return;

    const people = (await dataManager.getSetting('school_special_people')) || [];

    if (countSpan) countSpan.textContent = people.length;

    if (people.length === 0) {
        listContainer.innerHTML = '<p style="grid-column:1/-1; color:#999;">No members added.</p>';
        return;
    }

    listContainer.innerHTML = people.map(p => `
        <div style="background:#f9f9f9; padding:10px; border-radius:8px; text-align:center; border:1px solid #eee;">
            <div style="width:60px; height:60px; margin:0 auto 5px; border-radius:50%; overflow:hidden;">
                <img src="${p.photo}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <strong style="display:block; font-size:0.9rem;">${p.name}</strong>
            <span style="font-size:0.8rem; color:#666;">${p.position}</span>
            <button class="btn btn-sm btn-danger" style="margin-top:5px; width:100%; font-size:0.7rem;" onclick="deleteSpecialPerson(${p.id})">Remove</button>
        </div>
    `).join('');
}

async function addSpecialPerson() {
    const name = document.getElementById('sp-name').value;
    const position = document.getElementById('sp-position').value;
    const fileInput = document.getElementById('sp-photo');

    if (!name || !position) return showToast("Name and Position required", 'error');
    if (!fileInput || fileInput.files.length === 0) return showToast("Photo is required", 'error');

    const file = fileInput.files[0];
    if (file.size > 2 * 1024 * 1024) return showToast("Photo max 2MB", 'error');

    const people = (await dataManager.getSetting('school_special_people')) || [];
    if (people.length >= 8) return showToast("Max 8 members allowed. Remove one first.", 'error');

    try {
        const photoBase64 = await toBase64(file, 300, 300, 0.7);
        const newPerson = {
            id: Date.now(),
            name,
            position,
            photo: photoBase64
        };
        people.push(newPerson);
        await dataManager.saveSetting('school_special_people', people);

        showToast("Member Added!", 'success');

        // Clear inputs
        document.getElementById('sp-name').value = '';
        document.getElementById('sp-position').value = '';
        fileInput.value = '';

        loadSpecialPeopleList();
    } catch (e) {
        console.error(e);
        showToast("Error: " + e.message, 'error');
    }
}

async function deleteSpecialPerson(id) {
    if (!confirm("Remove this member?")) return;
    let people = (await dataManager.getSetting('school_special_people')) || [];
    people = people.filter(p => p.id !== id);
    await dataManager.saveSetting('school_special_people', people);
    loadSpecialPeopleList();
}

// --- Footer Logic ---

async function loadFooterForm() {
    const about = await dataManager.getSetting('footer_about');
    const address = await dataManager.getSetting('footer_address');
    const phone = await dataManager.getSetting('footer_phone');
    const email = await dataManager.getSetting('footer_email');

    if (document.getElementById('footer-about')) document.getElementById('footer-about').value = about || '';
    if (document.getElementById('footer-address')) document.getElementById('footer-address').value = address || '';
    if (document.getElementById('footer-phone')) document.getElementById('footer-phone').value = phone || '';
    if (document.getElementById('footer-email')) document.getElementById('footer-email').value = email || '';
}

async function saveFooterSettings() {
    const about = document.getElementById('footer-about').value;
    const address = document.getElementById('footer-address').value;
    const phone = document.getElementById('footer-phone').value;
    const email = document.getElementById('footer-email').value;

    try {
        await dataManager.saveSetting('footer_about', about);
        await dataManager.saveSetting('footer_address', address);
        await dataManager.saveSetting('footer_phone', phone);
        await dataManager.saveSetting('footer_email', email);
        showToast("Footer Details Saved!", 'success');
    } catch (e) {
        showToast("Error: " + e.message, 'error');
    }
}

function deleteUser(id) {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    dataManager.deleteUser(id);
    showToast("User Deleted Successfully", 'success');
    // Refresh current view
    const activeBtn = document.querySelector('.sidebar button.active');
    if (activeBtn) {
        if (activeBtn.dataset.view === 'admin-student') loadAdminStudents();
        if (activeBtn.dataset.view === 'admin-teacher') loadAdminTeachers();
    }
}

function toggleBlockUser(id) {
    const user = dataManager.getUsers().find(u => u.id === id);
    if (!user) return showToast("User not found", 'error');

    // Toggle status
    user.isBlocked = !user.isBlocked;

    // Update in DB
    dataManager.updateUser(user);

    showToast(`User ${user.isBlocked ? 'Blocked' : 'Unblocked'} Successfully`, 'success');

    // Refresh view
    const activeBtn = document.querySelector('.sidebar button.active');
    if (activeBtn) {
        if (activeBtn.dataset.view === 'admin-student') loadAdminStudents();
        if (activeBtn.dataset.view === 'admin-teacher') loadAdminTeachers();
    }
}
