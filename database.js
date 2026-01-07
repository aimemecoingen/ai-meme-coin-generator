/**
 * Simple JSON File Database
 * For production: use MongoDB, PostgreSQL, or Firebase
 */

const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const COINS_FILE = path.join(DB_DIR, 'coins.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}

if (!fs.existsSync(COINS_FILE)) {
    fs.writeFileSync(COINS_FILE, JSON.stringify({}));
}

/**
 * Read users from file
 */
function readUsers() {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return {};
    }
}

/**
 * Write users to file
 */
function writeUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing users:', error);
        return false;
    }
}

/**
 * Read coins from file
 */
function readCoins() {
    try {
        const data = fs.readFileSync(COINS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading coins:', error);
        return {};
    }
}

/**
 * Write coins to file
 */
function writeCoins(coins) {
    try {
        fs.writeFileSync(COINS_FILE, JSON.stringify(coins, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing coins:', error);
        return false;
    }
}

/**
 * Get user by email
 */
function getUser(email) {
    const users = readUsers();
    return users[email.toLowerCase()];
}

/**
 * Save user
 */
function saveUser(email, userData) {
    const users = readUsers();
    users[email.toLowerCase()] = userData;
    return writeUsers(users);
}

/**
 * Get user's coins
 */
function getUserCoins(userId) {
    const coins = readCoins();
    return coins[userId] || [];
}

/**
 * Save coin for user
 */
function saveCoinForUser(userId, coinData) {
    const coins = readCoins();
    
    if (!coins[userId]) {
        coins[userId] = [];
    }
    
    // Check if coin already exists (update)
    const existingIndex = coins[userId].findIndex(c => c.id === coinData.id);
    
    if (existingIndex >= 0) {
        coins[userId][existingIndex] = coinData;
    } else {
        coins[userId].push(coinData);
    }
    
    return writeCoins(coins);
}

/**
 * Delete coin for user
 */
function deleteCoinForUser(userId, coinId) {
    const coins = readCoins();
    
    if (coins[userId]) {
        coins[userId] = coins[userId].filter(c => c.id !== coinId);
        return writeCoins(coins);
    }
    
    return false;
}

/**
 * Get all users (for admin)
 */
function getAllUsers() {
    return readUsers();
}

module.exports = {
    getUser,
    saveUser,
    getUserCoins,
    saveCoinForUser,
    deleteCoinForUser,
    getAllUsers
};

