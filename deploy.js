const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Blockchain Deployment Script for AI-Generated Meme Coins
 * Supports: Ethereum, Polygon, Base, BSC
 */

// Network configurations
const NETWORKS = {
    // Ethereum Mainnet
    ethereum: {
        name: 'Ethereum Mainnet',
        rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 1,
        explorer: 'https://etherscan.io',
        currency: 'ETH'
    },
    
    // Ethereum Sepolia Testnet
    'ethereum-sepolia': {
        name: 'Ethereum Sepolia',
        rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 11155111,
        explorer: 'https://sepolia.etherscan.io',
        currency: 'ETH'
    },
    
    // Polygon Mainnet
    polygon: {
        name: 'Polygon Mainnet',
        rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 137,
        explorer: 'https://polygonscan.com',
        currency: 'MATIC'
    },
    
    // Polygon Mumbai Testnet
    'polygon-mumbai': {
        name: 'Polygon Mumbai',
        rpcUrl: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 80001,
        explorer: 'https://mumbai.polygonscan.com',
        currency: 'MATIC'
    },
    
    // Base Mainnet
    base: {
        name: 'Base Mainnet',
        rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 8453,
        explorer: 'https://basescan.org',
        currency: 'ETH'
    },
    
    // Base Sepolia Testnet
    'base-sepolia': {
        name: 'Base Sepolia',
        rpcUrl: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        chainId: 84532,
        explorer: 'https://sepolia.basescan.org',
        currency: 'ETH'
    },
    
    // Binance Smart Chain
    bsc: {
        name: 'BSC Mainnet',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        chainId: 56,
        explorer: 'https://bscscan.com',
        currency: 'BNB'
    },
    
    // BSC Testnet
    'bsc-testnet': {
        name: 'BSC Testnet',
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
        chainId: 97,
        explorer: 'https://testnet.bscscan.com',
        currency: 'BNB'
    }
};

/**
 * Deploy a meme coin contract
 * @param {string} name - Token name
 * @param {string} symbol - Token symbol
 * @param {string} maxSupply - Maximum supply (without decimals)
 * @param {string} network - Network to deploy to
 * @param {string} ownerAddress - Address that will own the token
 */
async function deployMemeToken(name, symbol, maxSupply, network = 'base-sepolia', ownerAddress = null) {
    try {
        console.log('\n🚀 Starting Meme Coin Deployment...\n');
        
        // Get network config
        const networkConfig = NETWORKS[network];
        if (!networkConfig) {
            throw new Error(`Network "${network}" not supported`);
        }
        
        console.log(`📡 Network: ${networkConfig.name}`);
        console.log(`🔗 Chain ID: ${networkConfig.chainId}`);
        console.log(`💰 Currency: ${networkConfig.currency}\n`);
        
        // Setup provider and wallet
        const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
        const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
        
        // Use provided owner or default to deployer
        const owner = ownerAddress || wallet.address;
        
        console.log(`👤 Deployer: ${wallet.address}`);
        console.log(`👑 Owner: ${owner}\n`);
        
        // Check balance
        const balance = await provider.getBalance(wallet.address);
        const balanceInEth = ethers.formatEther(balance);
        console.log(`💵 Balance: ${balanceInEth} ${networkConfig.currency}`);
        
        if (balance === 0n) {
            throw new Error(`Insufficient balance. Please fund ${wallet.address}`);
        }
        
        // Read contract code
        const contractPath = path.join(__dirname, 'contracts', 'MemeToken.sol');
        let contractCode = fs.readFileSync(contractPath, 'utf8');
        
        // For this example, we'll use the bytecode
        // In production, you'd compile with Hardhat or Foundry
        console.log('\n📝 Compiling contract...');
        
        // Contract ABI (simplified for demo)
        const abi = [
            "constructor(string memory name_, string memory symbol_, uint256 maxSupply_, address initialOwner)",
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)",
            "function transfer(address to, uint256 amount) returns (bool)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function transferFrom(address from, address to, uint256 amount) returns (bool)"
        ];
        
        // Note: In production, you need actual bytecode from compilation
        // This is a placeholder - you need to compile the Solidity contract
        console.log('⚠️  For actual deployment, compile the contract first using Hardhat or Foundry\n');
        
        // Example deployment flow (uncomment when you have compiled bytecode)
        /*
        const factory = new ethers.ContractFactory(abi, bytecode, wallet);
        
        console.log('🚀 Deploying contract...');
        const contract = await factory.deploy(name, symbol, maxSupply, owner);
        
        console.log('⏳ Waiting for confirmation...');
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        
        console.log('\n✅ DEPLOYMENT SUCCESSFUL!\n');
        console.log('='.repeat(60));
        console.log(`📝 Contract Address: ${contractAddress}`);
        console.log(`🔍 Explorer: ${networkConfig.explorer}/address/${contractAddress}`);
        console.log(`💎 Token Name: ${name}`);
        console.log(`🎯 Symbol: ${symbol}`);
        console.log(`📊 Max Supply: ${maxSupply}`);
        console.log('='.repeat(60));
        
        // Save deployment info
        const deploymentInfo = {
            network: networkConfig.name,
            chainId: networkConfig.chainId,
            contractAddress,
            tokenName: name,
            tokenSymbol: symbol,
            maxSupply,
            owner,
            deployer: wallet.address,
            deployedAt: new Date().toISOString(),
            explorerUrl: `${networkConfig.explorer}/address/${contractAddress}`
        };
        
        const deploymentsDir = path.join(__dirname, 'deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir);
        }
        
        const deploymentFile = path.join(deploymentsDir, `${symbol}-${Date.now()}.json`);
        fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
        
        console.log(`\n💾 Deployment info saved to: ${deploymentFile}\n`);
        
        return deploymentInfo;
        */
        
        // For now, return mock data
        const mockAddress = '0x' + Array(40).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        return {
            success: true,
            network: networkConfig.name,
            chainId: networkConfig.chainId,
            contractAddress: mockAddress,
            tokenName: name,
            tokenSymbol: symbol,
            maxSupply,
            owner,
            deployer: wallet.address,
            deployedAt: new Date().toISOString(),
            explorerUrl: `${networkConfig.explorer}/address/${mockAddress}`,
            message: '⚠️  This is a DEMO deployment. To deploy for real, compile the contract first!'
        };
        
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        throw error;
    }
}

/**
 * Estimate deployment gas cost
 */
async function estimateGasCost(network = 'base-sepolia') {
    try {
        const networkConfig = NETWORKS[network];
        const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
        
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        
        // Typical deployment uses ~2M gas
        const estimatedGas = 2000000n;
        const estimatedCost = gasPrice * estimatedGas;
        const costInEth = ethers.formatEther(estimatedCost);
        
        return {
            gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
            estimatedGas: estimatedGas.toString(),
            estimatedCost: costInEth,
            currency: networkConfig.currency
        };
    } catch (error) {
        console.error('Error estimating gas:', error);
        return null;
    }
}

// CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.log(`
Usage: node deploy.js <name> <symbol> <maxSupply> [network] [ownerAddress]

Examples:
  node deploy.js "PizzaCoin" "PIZZA" "1000000000"
  node deploy.js "PizzaCoin" "PIZZA" "1000000000" "base-sepolia"
  node deploy.js "PizzaCoin" "PIZZA" "1000000000" "polygon" "0x123..."

Supported networks:
  - ethereum, ethereum-sepolia
  - polygon, polygon-mumbai
  - base, base-sepolia
  - bsc, bsc-testnet
        `);
        process.exit(1);
    }
    
    const [name, symbol, maxSupply, network, ownerAddress] = args;
    
    deployMemeToken(name, symbol, maxSupply, network, ownerAddress)
        .then(result => {
            console.log('\n✅ Deployment complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Deployment failed:', error);
            process.exit(1);
        });
}

module.exports = {
    deployMemeToken,
    estimateGasCost,
    NETWORKS
};
