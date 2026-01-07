/**
 * Simple Authentication System
 * No complex setup - just email & password
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

// Secret for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

/**
 * Register new user
 */
async function registerUser(email, password, name) {
    try {
        // Validate input
        if (!email || !password) {
            return { success: false, error: 'Email and password required' };
        }
        
        // Check if user exists
        const existingUser = db.getUser(email);
        if (existingUser) {
            return { success: false, error: 'Email already registered' };
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = {
            id: Date.now().toString(),
            email: email.toLowerCase(),
            name: name || email.split('@')[0],
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };
        
        // Save user
        db.saveUser(email, user);
        
        // Generate token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
        
        return {
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Registration failed' };
    }
}

/**
 * Login user
 */
async function loginUser(email, password) {
    try {
        // Get user
        const user = db.getUser(email);
        
        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return { success: false, error: 'Invalid email or password' };
        }
        
        // Generate token
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
        
        return {
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed' };
    }
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { success: true, userId: decoded.userId, email: decoded.email };
    } catch (error) {
        return { success: false, error: 'Invalid token' };
    }
}

/**
 * Get user by ID
 */
function getUserById(userId) {
    const allUsers = db.getAllUsers();
    
    for (const email in allUsers) {
        const user = allUsers[email];
        if (user.id === userId) {
            return {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            };
        }
    }
    return null;
}

/**
 * Save coin for user
 */
function saveCoinForUser(userId, coinData) {
    const success = db.saveCoinForUser(userId, coinData);
    return { success };
}

/**
 * Get user's coins
 */
function getUserCoins(userId) {
    return db.getUserCoins(userId);
}

/**
 * Delete coin
 */
function deleteCoinForUser(userId, coinId) {
    const success = db.deleteCoinForUser(userId, coinId);
    return { success };
}

/**
 * Middleware to protect routes
 */
function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const verified = verifyToken(token);
        
        if (!verified.success) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        req.userId = verified.userId;
        req.userEmail = verified.email;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    verifyToken,
    getUserById,
    saveCoinForUser,
    getUserCoins,
    deleteCoinForUser,
    authMiddleware
};
