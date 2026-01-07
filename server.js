// Laad .env file EERST!
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const auth = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration - Laad API key uit .env
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Check of API key bestaat
if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here' || OPENAI_API_KEY.includes('PLAK-HIER')) {
    console.error('\n❌ FOUT: Geen geldige OpenAI API key gevonden!\n');
    console.error('Stappen om te fixen:');
    console.error('1. Haal je API key: https://platform.openai.com/api-keys');
    console.error('2. Dubbelklik: ZET-API-KEY.bat');
    console.error('3. Plak je key en druk ENTER\n');
    process.exit(1);
}
const PINATA_API_KEY = process.env.PINATA_API_KEY || 'your-pinata-key'; // For IPFS logo hosting

// Store generated coins (in production, use a database)
const generatedCoins = [];

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * Register new user
 */
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        console.log('\n📝 REGISTRATION REQUEST');
        console.log('Email:', email);
        
        const result = await auth.registerUser(email, password, name);
        
        if (result.success) {
            console.log('✅ User registered:', email);
            res.json(result);
        } else {
            console.log('❌ Registration failed:', result.error);
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

/**
 * Login user
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('\n🔐 LOGIN REQUEST');
        console.log('Email:', email);
        
        const result = await auth.loginUser(email, password);
        
        if (result.success) {
            console.log('✅ User logged in:', email);
            res.json(result);
        } else {
            console.log('❌ Login failed:', result.error);
            res.status(401).json(result);
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

/**
 * Get current user info
 */
app.get('/api/auth/me', auth.authMiddleware, (req, res) => {
    try {
        const user = auth.getUserById(req.userId);
        
        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        console.error('❌ Get user error:', error);
        res.status(500).json({ success: false, error: 'Failed to get user' });
    }
});

/**
 * Save coin (protected route)
 */
app.post('/api/user/coins', auth.authMiddleware, (req, res) => {
    try {
        const coinData = req.body;
        
        console.log('\n💾 SAVE COIN FOR USER');
        console.log('User:', req.userEmail);
        console.log('Coin:', coinData.name);
        
        const result = auth.saveCoinForUser(req.userId, coinData);
        
        res.json(result);
    } catch (error) {
        console.error('❌ Save coin error:', error);
        res.status(500).json({ success: false, error: 'Failed to save coin' });
    }
});

/**
 * Get user's coins (protected route)
 */
app.get('/api/user/coins', auth.authMiddleware, (req, res) => {
    try {
        const coins = auth.getUserCoins(req.userId);
        
        console.log('\n📊 GET USER COINS');
        console.log('User:', req.userEmail);
        console.log('Coins:', coins.length);
        
        res.json({ success: true, coins });
    } catch (error) {
        console.error('❌ Get coins error:', error);
        res.status(500).json({ success: false, error: 'Failed to get coins' });
    }
});

/**
 * Delete coin (protected route)
 */
app.delete('/api/user/coins/:coinId', auth.authMiddleware, (req, res) => {
    try {
        const { coinId } = req.params;
        
        console.log('\n🗑️ DELETE COIN');
        console.log('User:', req.userEmail);
        console.log('Coin ID:', coinId);
        
        const result = auth.deleteCoinForUser(req.userId, coinId);
        
        res.json(result);
    } catch (error) {
        console.error('❌ Delete coin error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete coin' });
    }
});

// ============================================
// AI GENERATION ENDPOINTS
// ============================================

/**
 * Generate coin name, symbol, and branding suggestions
 */
app.post('/api/generate-suggestions', async (req, res) => {
    try {
        const { idea } = req.body;
        
        console.log('\n🎨 NIEUWE AANVRAAG: Suggesties genereren');
        console.log('💡 Idee:', idea);
        
        if (!idea) {
            console.log('❌ ERROR: Geen idee ontvangen');
            return res.status(400).json({ error: 'Idea is required' });
        }

        console.log('📡 Roep OpenAI API aan...');
        // Call OpenAI API for suggestions
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a creative meme coin branding expert. Generate catchy, viral-worthy names and symbols for cryptocurrency tokens. Be creative, funny, and memorable.`
                    },
                    {
                        role: 'user',
                        content: `Create a meme coin based on this idea: "${idea}"\n\nProvide:\n1. A catchy coin name (1-2 words)\n2. A 3-5 letter symbol/ticker\n3. A tagline (max 10 words)\n4. Logo description for AI image generation\n\nRespond in JSON format: {"name": "", "symbol": "", "tagline": "", "logoDescription": ""}`
                    }
                ],
                temperature: 0.9,
                max_tokens: 300
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;
        console.log('📝 OpenAI response:', content);
        
        const suggestions = JSON.parse(content);
        console.log('✅ Suggesties gegenereerd:', suggestions);

        res.json({
            success: true,
            suggestions
        });

    } catch (error) {
        console.error('\n❌ ERROR generating suggestions:', error.response?.data || error.message);
        
        // Fallback suggestions if API fails
        const fallbackSuggestions = generateFallbackSuggestions(req.body.idea);
        res.json({
            success: true,
            suggestions: fallbackSuggestions
        });
    }
});

/**
 * Generate logo using AI image generation
 */
app.post('/api/generate-logo', async (req, res) => {
    try {
        const { name, symbol, logoDescription } = req.body;

        // Use DALL-E 3 for logo generation
        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                model: 'dall-e-3',
                prompt: `Create a professional cryptocurrency coin logo for "${name}" (${symbol}). ${logoDescription}. Style: vibrant, modern, meme-friendly, circular design, suitable for a crypto token. No text in the image.`,
                n: 1,
                size: '1024x1024',
                quality: 'standard',
                style: 'vivid'
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const logoUrl = response.data.data[0].url;

        res.json({
            success: true,
            logoUrl
        });

    } catch (error) {
        console.error('Error generating logo:', error.response?.data || error.message);
        
        // Return placeholder logo
        res.json({
            success: true,
            logoUrl: `https://via.placeholder.com/512/${getRandomColor()}/ffffff?text=${req.body.symbol}`
        });
    }
});

/**
 * Generate complete coin package
 */
app.post('/api/generate-coin', async (req, res) => {
    try {
        const { idea, name, symbol, supply } = req.body;

        console.log('\n🚀 NIEUWE AANVRAAG: Coin genereren');
        console.log('📋 Details:', { name, symbol, supply });

        // Validate inputs
        if (!idea || !name || !symbol || !supply) {
            console.log('❌ ERROR: Missende velden');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate all components
        const [suggestions, logoResult] = await Promise.all([
            generateSuggestions(idea),
            generateLogo(name, symbol, idea)
        ]);

        const smartContract = generateSmartContract(name, symbol, supply);
        const website = generateWebsite(name, symbol, supply, idea, logoResult.logoUrl);
        const tokenomics = generateTokenomics(supply);

        const coinData = {
            id: Date.now().toString(),
            name,
            symbol,
            supply,
            idea,
            tagline: suggestions.tagline,
            logoUrl: logoResult.logoUrl,
            smartContract,
            website,
            tokenomics,
            createdAt: new Date().toISOString()
        };

        // Store the coin
        generatedCoins.push(coinData);

        console.log('✅ Coin succesvol gegenereerd!');
        console.log('🎨 Logo URL:', coinData.logoUrl);
        console.log('💎 Coin ID:', coinData.id);

        res.json({
            success: true,
            coin: coinData
        });

    } catch (error) {
        console.error('\n❌ ERROR generating coin:', error.message);
        console.error('Details:', error.response?.data || error);
        res.status(500).json({ 
            error: 'Failed to generate coin',
            message: error.message 
        });
    }
});

/**
 * Deploy contract to Ethereum
 */
app.post('/api/deploy-contract', async (req, res) => {
    try {
        const { coinId, name, symbol, supply, walletAddress, network = 'ethereum' } = req.body;

        console.log('\n🚀 DEPLOYMENT REQUEST');
        console.log('📋 Details:', { name, symbol, supply, network });
        console.log('👤 Wallet:', walletAddress);

        if (!name || !symbol || !supply || !walletAddress) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if Alchemy API key exists
        if (!process.env.ALCHEMY_API_KEY) {
            console.log('⚠️  No Alchemy key, using mock deployment');
            // Return mock deployment
            const mockAddress = '0x' + Array(40).fill(0).map(() => 
                Math.floor(Math.random() * 16).toString(16)
            ).join('');
            
            return res.json({
                success: true,
                contractAddress: mockAddress,
                network: 'ethereum-sepolia',
                explorerUrl: `https://sepolia.etherscan.io/address/${mockAddress}`,
                transactionHash: '0x' + Array(64).fill(0).map(() => 
                    Math.floor(Math.random() * 16).toString(16)
                ).join(''),
                message: 'DEMO deployment - Add ALCHEMY_API_KEY to .env for real deployment'
            });
        }

        // Real deployment with ethers.js
        const { ethers } = require('ethers');
        
        // Setup provider
        const alchemyUrl = network === 'ethereum' 
            ? `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
            : `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
        
        const provider = new ethers.JsonRpcProvider(alchemyUrl);
        
        // Setup wallet (you'd need the deployer's private key)
        if (!process.env.DEPLOYER_PRIVATE_KEY) {
            throw new Error('DEPLOYER_PRIVATE_KEY not set in .env');
        }
        
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        console.log('📝 Compiling contract...');
        
        // Simple ERC-20 bytecode (pre-compiled)
        // In production, compile with solc or hardhat
        const contractABI = [
            "constructor(string memory name, string memory symbol, uint256 initialSupply, address owner)",
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)"
        ];
        
        // For real deployment, you need compiled bytecode
        // This is a placeholder - see note below
        throw new Error('Smart contract compilation required. See deploy.js for setup.');
        
        // Uncomment when you have compiled bytecode:
        /*
        const factory = new ethers.ContractFactory(contractABI, compiledBytecode, wallet);
        
        console.log('🚀 Deploying to blockchain...');
        const contract = await factory.deploy(name, symbol, supply, walletAddress);
        
        console.log('⏳ Waiting for confirmation...');
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        const deployTx = contract.deploymentTransaction();
        
        console.log('✅ Deployed!', contractAddress);
        
        const explorerBase = network === 'ethereum' 
            ? 'https://etherscan.io'
            : 'https://sepolia.etherscan.io';
        
        res.json({
            success: true,
            contractAddress,
            network,
            explorerUrl: `${explorerBase}/address/${contractAddress}`,
            transactionHash: deployTx.hash
        });
        */

    } catch (error) {
        console.error('\n❌ DEPLOYMENT ERROR:', error.message);
        res.status(500).json({ 
            error: 'Deployment failed',
            message: error.message 
        });
    }
});

/**
 * Get all generated coins (for showcase/leaderboard)
 */
app.get('/api/coins', (req, res) => {
    res.json({
        success: true,
        coins: generatedCoins.slice(-20).reverse(), // Last 20 coins
        total: generatedCoins.length
    });
});

/**
 * Customize website with AI
 */
app.post('/api/customize-website', async (req, res) => {
    try {
        const { originalWebsite, customization, coinName, coinSymbol } = req.body;
        
        console.log('\n🎨 WEBSITE CUSTOMIZATION REQUEST');
        console.log('💡 Changes:', customization);
        
        if (!originalWebsite || !customization) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Call OpenAI to customize the website
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert web designer. Modify HTML/CSS code based on user requests. Return ONLY the complete modified HTML code, no explanations.'
                    },
                    {
                        role: 'user',
                        content: `Modify this HTML for ${coinName} ($${coinSymbol}):\n\n${originalWebsite}\n\nChanges requested: ${customization}\n\nReturn the complete modified HTML.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 3000
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const customizedWebsite = response.data.choices[0].message.content;
        
        console.log('✅ Website customized!');
        
        res.json({
            success: true,
            customizedWebsite: customizedWebsite
        });
        
    } catch (error) {
        console.error('\n❌ ERROR customizing website:', error.message);
        res.status(500).json({ 
            error: 'Customization failed',
            message: error.message 
        });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function generateSuggestions(idea) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a creative meme coin branding expert.'
                    },
                    {
                        role: 'user',
                        content: `Create a meme coin based on: "${idea}"\n\nProvide JSON: {"name": "", "symbol": "", "tagline": ""}`
                    }
                ],
                temperature: 0.9,
                max_tokens: 200
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
        return generateFallbackSuggestions(idea);
    }
}

async function generateLogo(name, symbol, idea) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/images/generations',
            {
                model: 'dall-e-3',
                prompt: `Cryptocurrency coin logo for "${name}" (${symbol}). Based on: ${idea}. Vibrant, modern, circular, meme-style. No text.`,
                n: 1,
                size: '1024x1024'
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return { logoUrl: response.data.data[0].url };
    } catch (error) {
        return { logoUrl: `https://via.placeholder.com/512/${getRandomColor()}/ffffff?text=${symbol}` };
    }
}

function generateSmartContract(name, symbol, supply) {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
    
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${cleanName}
 * @dev ${name} Token - Generated by AI Meme Coin Generator
 */
contract ${cleanName} is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = ${supply} * 10**18;
    
    constructor(address initialOwner) ERC20("${name}", "${symbol}") Ownable(initialOwner) {
        _mint(initialOwner, MAX_SUPPLY);
    }
    
    /**
     * @dev Burns tokens from the caller's account
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
    
    /**
     * @dev Returns token information
     */
    function tokenInfo() public view returns (string memory, string memory, uint256) {
        return (name(), symbol(), totalSupply());
    }
}`;
}

function generateWebsite(name, symbol, supply, idea, logoUrl) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} ($${symbol}) - Official Website</title>
    <meta name="description" content="${idea}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { text-align: center; padding: 60px 20px; }
        .logo { width: 200px; height: 200px; border-radius: 50%; margin: 0 auto 30px; border: 5px solid white; box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
        h1 { font-size: 4em; margin-bottom: 10px; text-shadow: 2px 2px 20px rgba(0,0,0,0.3); }
        .symbol { font-size: 2em; opacity: 0.9; margin-bottom: 20px; }
        .tagline { font-size: 1.3em; opacity: 0.9; max-width: 700px; margin: 0 auto 40px; line-height: 1.6; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 40px 0; }
        .stat { background: rgba(255,255,255,0.2); padding: 30px; border-radius: 15px; text-align: center; backdrop-filter: blur(10px); }
        .stat-value { font-size: 2.5em; font-weight: bold; display: block; margin-bottom: 10px; }
        .stat-label { opacity: 0.9; }
        .buttons { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin: 40px 0; }
        button { background: white; color: #667eea; padding: 18px 40px; border: none; border-radius: 30px; font-size: 1.2em; font-weight: bold; cursor: pointer; transition: all 0.3s; box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
        button:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.3); }
        .features { background: rgba(255,255,255,0.1); padding: 50px; border-radius: 20px; margin: 40px 0; backdrop-filter: blur(10px); }
        .features h2 { font-size: 2.5em; margin-bottom: 30px; text-align: center; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-top: 30px; }
        .feature { text-align: center; }
        .feature-icon { font-size: 3em; margin-bottom: 15px; }
        .feature h3 { font-size: 1.5em; margin-bottom: 10px; }
        footer { text-align: center; padding: 40px 20px; opacity: 0.8; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <img src="${logoUrl}" alt="${name} Logo" class="logo">
            <h1>${name}</h1>
            <div class="symbol">$${symbol}</div>
            <p class="tagline">${idea}</p>
        </header>

        <div class="stats">
            <div class="stat">
                <span class="stat-value">${parseInt(supply).toLocaleString()}</span>
                <span class="stat-label">Total Supply</span>
            </div>
            <div class="stat">
                <span class="stat-value">0</span>
                <span class="stat-label">Holders</span>
            </div>
            <div class="stat">
                <span class="stat-value">$0</span>
                <span class="stat-label">Market Cap</span>
            </div>
            <div class="stat">
                <span class="stat-value">🔥</span>
                <span class="stat-label">Community Vibes</span>
            </div>
        </div>

        <div class="buttons">
            <button onclick="alert('Connect your wallet to buy $${symbol}!')">🚀 Buy $${symbol}</button>
            <button onclick="window.open('https://twitter.com', '_blank')">🐦 Twitter</button>
            <button onclick="window.open('https://t.me/', '_blank')">💬 Telegram</button>
            <button onclick="alert('Contract: [DEPLOYED_ADDRESS]')">📋 Contract</button>
        </div>

        <div class="features">
            <h2>Why $${symbol}?</h2>
            <div class="feature-grid">
                <div class="feature">
                    <div class="feature-icon">🎨</div>
                    <h3>AI Generated</h3>
                    <p>Created with cutting-edge AI technology</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <h3>Safe & Verified</h3>
                    <p>Audited smart contract on blockchain</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">👥</div>
                    <h3>Community Driven</h3>
                    <p>By the memes, for the memes</p>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚀</div>
                    <h3>To The Moon</h3>
                    <p>Join the journey to financial freedom</p>
                </div>
            </div>
        </div>

        <footer>
            <p>© 2026 ${name}. All rights reserved. | Built with AI 🤖</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Invest responsibly. Cryptocurrency involves risk.</p>
        </footer>
    </div>

    <script>
        // Add wallet connection logic here
        console.log('${name} website loaded!');
    </script>
</body>
</html>`;
}

function generateTokenomics(supply) {
    return {
        totalSupply: parseInt(supply),
        decimals: 18,
        initialDistribution: {
            liquidity: Math.floor(supply * 0.5),
            team: Math.floor(supply * 0.1),
            marketing: Math.floor(supply * 0.15),
            community: Math.floor(supply * 0.25)
        }
    };
}

function generateFallbackSuggestions(idea) {
    const words = idea.split(' ').filter(w => w.length > 3);
    const randomWord = words[Math.floor(Math.random() * words.length)] || 'Meme';
    const name = randomWord.charAt(0).toUpperCase() + randomWord.slice(1) + 'Coin';
    const symbol = randomWord.substring(0, 4).toUpperCase();
    
    return {
        name,
        symbol,
        tagline: 'The future of meme coins is here',
        logoDescription: `A fun and vibrant cryptocurrency logo featuring ${randomWord}`
    };
}

function getRandomColor() {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', '43e97b', 'fa709a'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ============================================
// START SERVER
// ============================================

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

/**
 * Register new user
 */
app.post('/api/auth/register', (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('\n👤 REGISTRATION REQUEST:', email);
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        const result = auth.register(email, password);
        
        if (result.success) {
            console.log('✅ User registered:', email);
        } else {
            console.log('❌ Registration failed:', result.error);
        }
        
        res.json(result);
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * Login user
 */
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('\n🔐 LOGIN REQUEST:', email);
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const result = auth.login(email, password);
        
        if (result.success) {
            console.log('✅ User logged in:', email);
        } else {
            console.log('❌ Login failed:', result.error);
        }
        
        res.json(result);
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * Verify session
 */
app.get('/api/auth/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const result = auth.verifySession(token);
        res.json(result);
    } catch (error) {
        console.error('❌ Verify error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

/**
 * Logout
 */
app.post('/api/auth/logout', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const result = auth.logout(token);
        console.log('👋 User logged out');
        res.json(result);
    } catch (error) {
        console.error('❌ Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

/**
 * Save coin (authenticated)
 */
app.post('/api/coins/save', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const verification = auth.verifySession(token);
        if (!verification.success) {
            return res.status(401).json({ error: 'Invalid session' });
        }
        
        const result = auth.saveCoin(verification.user.id, req.body);
        
        console.log('💾 Coin saved for user:', verification.user.email);
        
        res.json(result);
    } catch (error) {
        console.error('❌ Save coin error:', error);
        res.status(500).json({ error: 'Failed to save coin' });
    }
});

/**
 * Get user coins (authenticated)
 */
app.get('/api/coins/my', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const verification = auth.verifySession(token);
        if (!verification.success) {
            return res.status(401).json({ error: 'Invalid session' });
        }
        
        const result = auth.getUserCoins(verification.user.id);
        res.json(result);
    } catch (error) {
        console.error('❌ Get coins error:', error);
        res.status(500).json({ error: 'Failed to get coins' });
    }
});

/**
 * Delete coin (authenticated)
 */
app.delete('/api/coins/:coinId', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        const verification = auth.verifySession(token);
        if (!verification.success) {
            return res.status(401).json({ error: 'Invalid session' });
        }
        
        const result = auth.deleteCoin(verification.user.id, req.params.coinId);
        
        console.log('🗑️ Coin deleted for user:', verification.user.email);
        
        res.json(result);
    } catch (error) {
        console.error('❌ Delete coin error:', error);
        res.status(500).json({ error: 'Failed to delete coin' });
    }
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('🚀 AI MEME COIN GENERATOR');
    console.log('========================================');
    console.log(`✅ Server draait op: http://localhost:${PORT}`);
    console.log(`🔑 API Key geladen: ${OPENAI_API_KEY.substring(0, 12)}...`);
    console.log(`👤 Auth system: ACTIVE`);
    console.log('========================================\n');
    console.log('⏳ Wachten op API calls...\n');
});

module.exports = app;
