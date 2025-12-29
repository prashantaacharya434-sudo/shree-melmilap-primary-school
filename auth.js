/**
 * auth.js
 * Handles Authentication (Register, Login, Session)
 */

class AuthManager {
    constructor() {
        this.currentUser = null;
    }

    async register(user) {
        try {
            // STORE PASSWORD AS PLAINTEXT (User Request)
            // user.password = await this.hashPassword(user.password); 
            dataManager.addUser(user);
            return { success: true, message: 'Registration Successful' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async login(username, password) {
        // Normalize inputs
        username = username.trim().toLowerCase();
        password = password.trim();

        // Admin Hardcoded Check
        if (username === 'prashanta' && password === '9748426436') {
            const adminUser = {
                id: 'admin',
                username: 'prashanta',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin',
                photo: null
            };
            this.saveSession(adminUser);
            return { success: true, user: adminUser };
        }

        // 1. Check Plaintext (New Users)
        const userPlain = dataManager.findUser(username, password);
        if (userPlain) {
            if (userPlain.isBlocked) {
                return { success: false, message: 'Your account is blocked.' };
            }
            this.saveSession(userPlain);
            return { success: true, user: userPlain };
        }

        // 2. Check Hash (Legacy Users)
        const inputHash = await this.hashPassword(password);
        const userHash = dataManager.findUser(username, inputHash); // Compare hashes

        if (userHash) {
            if (userHash.isBlocked) {
                return { success: false, message: 'Your account is blocked.' };
            }
            // Optional: Migrating legacy user to plaintext could go here, but let's just allow login
            this.saveSession(userHash);
            return { success: true, user: userHash };
        }

        return { success: false, message: 'Invalid Username or Password' };
    }

    async hashPassword(str) {
        const msgBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    saveSession(user) {
        // Don't save sensitive data like password in session if possible, 
        // but for this demo we just store the user object.
        this.currentUser = user;
        localStorage.setItem('school_session', JSON.stringify(user));
    }

    checkSession() {
        const session = localStorage.getItem('school_session');
        if (session) {
            this.currentUser = JSON.parse(session);
            // Verify if user still exists/blocked (optional security step)
            // const freshUser = dataManager.getUsers().find(u => u.id === this.currentUser.id);
            // if(freshUser && freshUser.isBlocked) { this.logout(); return null; }
            return this.currentUser;
        }
        return null;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('school_session');
        window.location.href = 'index.html';
    }
}

const authManager = new AuthManager();
