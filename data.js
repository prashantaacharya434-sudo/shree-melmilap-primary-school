/**
 * DataManager.js
 * Handles all interactions with localStorage to simulate a database.
 */
class DataManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize default data if not present
        if (!localStorage.getItem('school_users')) {
            const admin = {
                id: 'admin_001',
                role: 'admin',
                username: 'prashanta',
                password: '9748426436', // In a real app, this should be hashed!
                firstName: 'Prashanta',
                lastName: 'Admin'
            };
            this.saveUsers([admin]);
        }

        if (!localStorage.getItem('school_notices')) {
            this.saveNotices([]);
        }

        if (!localStorage.getItem('school_gallery')) {
            this.saveGallery([]);
        }

        if (!localStorage.getItem('school_messages')) {
            this.saveMessages([]);
        }

        if (!localStorage.getItem('school_achievers')) {
            this.saveAchievers([]);
        }
    }

    // --- USERS ---
    getUsers() {
        return JSON.parse(localStorage.getItem('school_users')) || [];
    }

    saveUsers(users) {
        localStorage.setItem('school_users', JSON.stringify(users));
    }

    addUser(user) {
        const users = this.getUsers();
        // Check for duplicates
        // Check for duplicates
        // 1. Username ID check
        if (users.find(u => (u.username === user.username) || (u.id === user.id))) {
            throw new Error('Username or ID already exists');
        }

        // 2. Semantic Duplicate Check (Same Person)
        if (user.role === 'student') {
            const duplicateStudent = users.find(u =>
                u.role === 'student' &&
                u.firstName.toLowerCase() === user.firstName.toLowerCase() &&
                u.lastName.toLowerCase() === user.lastName.toLowerCase() &&
                String(u.class) === String(user.class) &&
                String(u.rollNo) === String(user.rollNo)
            );
            if (duplicateStudent) throw new Error(`Student ${user.firstName} ${user.lastName} (Class ${user.class}, Roll ${user.rollNo}) is already registered.`);
        } else if (user.role === 'teacher') {
            const duplicateTeacher = users.find(u =>
                u.role === 'teacher' &&
                u.firstName.toLowerCase() === user.firstName.toLowerCase() &&
                u.lastName.toLowerCase() === user.lastName.toLowerCase() &&
                u.mobile === user.mobile
            );
            if (duplicateTeacher) throw new Error(`Teacher ${user.firstName} ${user.lastName} with this mobile number is already registered.`);
        }
        users.push(user);
        this.saveUsers(users);
        return user;
    }

    findUser(username, password) {
        const users = this.getUsers();
        return users.find(u => u.username === username && u.password === password);
    }

    updateUser(updatedUser) {
        let users = this.getUsers();
        users = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        this.saveUsers(users);
    }

    deleteUser(userId) {
        let users = this.getUsers();
        users = users.filter(u => u.id !== userId);
        this.saveUsers(users);
    }

    // --- NOTICES ---
    getNotices() {
        return JSON.parse(localStorage.getItem('school_notices')) || [];
    }

    saveNotices(notices) {
        localStorage.setItem('school_notices', JSON.stringify(notices));
    }

    addNotice(notice) {
        const notices = this.getNotices();
        notices.unshift(notice); // Add to beginning
        this.saveNotices(notices);
    }

    deleteNotice(id) {
        let notices = this.getNotices();
        notices = notices.filter(n => n.id !== id);
        this.saveNotices(notices);
    }

    // --- GALLERY & SETTINGS (IndexedDB Implementation) ---
    async initDB() {
        return new Promise((resolve, reject) => {
            if (this.db) return resolve(this.db);
            // Increment version to 3 to trigger upgrade for 'settings' (Force ensure)
            const request = indexedDB.open('SchoolDB', 3);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Gallery Store
                if (!db.objectStoreNames.contains('gallery')) {
                    db.createObjectStore('gallery', { keyPath: 'id' });
                }
                // Settings Store (key-value pairs)
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(this.db);
            };
            request.onerror = (e) => reject("DB Error: " + e.target.error);
            request.onblocked = () => {
                alert("Database upgrade blocked. Please close other tabs of this website and reload.");
                reject("DB Blocked");
            };
        });
    }

    // --- GENERIC SETTINGS (Async) ---
    async saveSetting(key, value) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('settings', 'readwrite');
            const store = tx.objectStore('settings');
            const request = store.put({ key: key, value: value });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getSetting(key) {
        try {
            const db = await this.initDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('settings', 'readonly');
                const store = tx.objectStore('settings');
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result ? request.result.value : null);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.error("Settings DB Error", e);
            return null;
        }
    }

    async getGallery() {
        try {
            const db = await this.initDB();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('gallery', 'readonly');
                const store = tx.objectStore('gallery');
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });
        } catch (e) {
            console.error("IDB Error", e);
            return [];
        }
    }

    async addPhoto(photo) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('gallery', 'readwrite');
            const store = tx.objectStore('gallery');
            const request = store.add(photo);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deletePhoto(id) {
        const db = await this.initDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction('gallery', 'readwrite');
            const store = tx.objectStore('gallery');
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // --- MESSAGES ---
    getMessages() {
        return JSON.parse(localStorage.getItem('school_messages')) || [];
    }

    saveMessages(messages) {
        localStorage.setItem('school_messages', JSON.stringify(messages));
    }

    addMessage(msg) {
        const messages = this.getMessages();
        messages.push(msg);
        this.saveMessages(messages);
    }

    getMessagesForUser(userId) {
        const messages = this.getMessages();
        // Return messages where user is sender or receiver, OR it's a group message to their class/group
        // Also ensure messages are for the user involved
        const user = this.getUsers().find(u => u.id === userId);
        const userClass = user ? user.class : null;

        return messages.filter(m =>
            m.to === userId ||
            m.from === userId ||
            (m.type === 'group' && m.targetGroup && m.targetGroup == userClass)
        );
    }

    // --- ACHIEVERS ---
    getAchievers() {
        return JSON.parse(localStorage.getItem('school_achievers')) || [];
    }

    saveAchievers(achievers) {
        localStorage.setItem('school_achievers', JSON.stringify(achievers));
    }

    addAchiever(achiever) {
        const list = this.getAchievers();
        list.unshift(achiever);
        this.saveAchievers(list);
    }

    deleteAchiever(id) {
        let list = this.getAchievers();
        list = list.filter(a => a.id !== id);
        this.saveAchievers(list);
    }

    // --- HELPERS ---
    getStorageUsage() {
        let total = 0;
        let details = {};
        for (let key in localStorage) {
            if (key.startsWith('school_')) {
                const size = (localStorage[key].length * 2) / 1024; // in KB (approx)
                total += size;
                details[key] = size.toFixed(2) + ' KB';
            }
        }
        return {
            total: total.toFixed(2),
            details: details
        };
    }

    updateSession(user) {
        localStorage.setItem('school_session', JSON.stringify(user));
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('school_session'));
    }

    logout() {
        localStorage.removeItem('school_session');
    }
}

const dataManager = new DataManager();
