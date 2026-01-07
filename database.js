/**
 * In-Memory Database for Vercel Serverless
 * NOTE: Data resets on each deployment!
 * For production: upgrade to MongoDB, PostgreSQL, or Vercel KV
 */

// In-memory storage (resets on deployment)
let usersDB = {};
let coinsDB = {};

/**
 * Read users from memory
 */
function readUsers() {
    return usersDB;
}

/**
 * Write users to memory
 */
function writeUsers(users) {
    usersDB = users;
    return true;
}

/**
 * Read coins from memory
 */
function readCoins() {
    return coinsDB;
}

/**
 * Write coins to memory
 */
function writeCoins(coins) {
    coinsDB = coins;
    return true;
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

