/**
 * Payment Integration Module
 * Supports both Crypto and Fiat payments
 */

const axios = require('axios');
require('dotenv').config();

// ============================================
// STRIPE INTEGRATION (Fiat Payments)
// ============================================

/**
 * Create Stripe checkout session
 */
async function createStripeCheckout(coinData, successUrl, cancelUrl) {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('Stripe not configured');
        }

        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: `Deploy ${coinData.name} ($${coinData.symbol})`,
                        description: 'Meme coin blockchain deployment',
                        images: [coinData.logoUrl]
                    },
                    unit_amount: 500, // $5.00 in cents
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                coinId: coinData.id,
                coinName: coinData.name,
                coinSymbol: coinData.symbol,
                network: coinData.network || 'base-sepolia'
            }
        });
        
        return {
            success: true,
            sessionId: session.id,
            paymentUrl: session.url
        };
    } catch (error) {
        console.error('Stripe error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verify Stripe payment
 */
async function verifyStripePayment(sessionId) {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        return {
            success: true,
            paid: session.payment_status === 'paid',
            amount: session.amount_total / 100,
            metadata: session.metadata
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle Stripe webhook
 */
async function handleStripeWebhook(req) {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const sig = req.headers['stripe-signature'];
        
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            
            // Payment successful - trigger deployment
            return {
                success: true,
                action: 'deploy',
                metadata: session.metadata
            };
        }
        
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// CRYPTO PAYMENT INTEGRATION (Coinbase Commerce)
// ============================================

/**
 * Create Coinbase Commerce charge
 */
async function createCryptoPayment(coinData, redirectUrl) {
    try {
        if (!process.env.COINBASE_API_KEY) {
            throw new Error('Coinbase Commerce not configured');
        }

        const response = await axios.post(
            'https://api.commerce.coinbase.com/charges',
            {
                name: `Deploy ${coinData.name}`,
                description: `Deploy ${coinData.symbol} to blockchain`,
                pricing_type: 'fixed_price',
                local_price: {
                    amount: '5.00',
                    currency: 'USD'
                },
                metadata: {
                    coinId: coinData.id,
                    coinName: coinData.name,
                    coinSymbol: coinData.symbol,
                    network: coinData.network || 'base-sepolia'
                },
                redirect_url: redirectUrl,
                cancel_url: redirectUrl + '/cancel'
            },
            {
                headers: {
                    'X-CC-Api-Key': process.env.COINBASE_API_KEY,
                    'X-CC-Version': '2018-03-22',
                    'Content-Type': 'application/json'
                }
            }
        );

        return {
            success: true,
            chargeId: response.data.data.id,
            paymentUrl: response.data.data.hosted_url
        };
    } catch (error) {
        console.error('Coinbase error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verify Coinbase payment
 */
async function verifyCryptoPayment(chargeId) {
    try {
        const response = await axios.get(
            `https://api.commerce.coinbase.com/charges/${chargeId}`,
            {
                headers: {
                    'X-CC-Api-Key': process.env.COINBASE_API_KEY,
                    'X-CC-Version': '2018-03-22'
                }
            }
        );

        const charge = response.data.data;
        const isPaid = charge.timeline.some(event => 
            event.status === 'CONFIRMED' || event.status === 'COMPLETED'
        );

        return {
            success: true,
            paid: isPaid,
            amount: charge.pricing.local.amount,
            metadata: charge.metadata
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Handle Coinbase webhook
 */
async function handleCryptoWebhook(req) {
    try {
        const event = req.body.event;
        
        if (event.type === 'charge:confirmed') {
            // Payment confirmed - trigger deployment
            return {
                success: true,
                action: 'deploy',
                metadata: event.data.metadata
            };
        }
        
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// DIRECT WALLET PAYMENT (Web3)
// ============================================

/**
 * Generate payment address and verify transaction
 */
async function createDirectPayment(coinData, network = 'ethereum') {
    // Your payment wallet address
    const PAYMENT_ADDRESS = process.env.PAYMENT_WALLET_ADDRESS || '0xYourWalletAddress';
    
    // Expected payment amount in ETH/MATIC
    const PAYMENT_AMOUNT = '0.002'; // Adjust based on network
    
    return {
        success: true,
        paymentAddress: PAYMENT_ADDRESS,
        amount: PAYMENT_AMOUNT,
        network: network,
        coinData: coinData,
        instructions: `Send ${PAYMENT_AMOUNT} ${network.toUpperCase()} to ${PAYMENT_ADDRESS}`
    };
}

/**
 * Verify direct wallet payment
 */
async function verifyDirectPayment(txHash, network = 'ethereum') {
    try {
        const { ethers } = require('ethers');
        
        // Setup provider based on network
        let rpcUrl;
        if (network === 'ethereum') {
            rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
        } else if (network === 'polygon') {
            rpcUrl = `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
        }
        
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const tx = await provider.getTransaction(txHash);
        
        if (!tx) {
            return {
                success: false,
                error: 'Transaction not found'
            };
        }
        
        const receipt = await provider.getTransactionReceipt(txHash);
        
        // Verify transaction is confirmed
        const isPaid = receipt && receipt.status === 1;
        const toAddress = tx.to.toLowerCase();
        const expectedAddress = process.env.PAYMENT_WALLET_ADDRESS.toLowerCase();
        
        if (toAddress !== expectedAddress) {
            return {
                success: false,
                error: 'Payment sent to wrong address'
            };
        }
        
        return {
            success: true,
            paid: isPaid,
            amount: ethers.formatEther(tx.value),
            from: tx.from,
            confirmations: receipt.confirmations
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Create subscription for premium features
 */
async function createSubscription(userEmail, plan = 'premium') {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        // Get or create customer
        let customer;
        const existingCustomers = await stripe.customers.list({
            email: userEmail,
            limit: 1
        });
        
        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: userEmail
            });
        }
        
        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{
                price: process.env[`STRIPE_PRICE_${plan.toUpperCase()}`] // Set in .env
            }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent']
        });
        
        return {
            success: true,
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Check if user has active subscription
 */
async function hasActiveSubscription(userEmail) {
    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        const customers = await stripe.customers.list({
            email: userEmail,
            limit: 1
        });
        
        if (customers.data.length === 0) {
            return { active: false };
        }
        
        const subscriptions = await stripe.subscriptions.list({
            customer: customers.data[0].id,
            status: 'active',
            limit: 1
        });
        
        return {
            active: subscriptions.data.length > 0,
            subscription: subscriptions.data[0]
        };
    } catch (error) {
        return {
            active: false,
            error: error.message
        };
    }
}

// ============================================
// PAYMENT ROUTER
// ============================================

/**
 * Universal payment creation
 */
async function createPayment(coinData, paymentMethod = 'stripe', options = {}) {
    switch (paymentMethod) {
        case 'stripe':
            return await createStripeCheckout(
                coinData,
                options.successUrl || 'https://yourdomain.com/success',
                options.cancelUrl || 'https://yourdomain.com/cancel'
            );
        
        case 'crypto':
            return await createCryptoPayment(
                coinData,
                options.redirectUrl || 'https://yourdomain.com'
            );
        
        case 'direct':
            return await createDirectPayment(coinData, options.network);
        
        default:
            return {
                success: false,
                error: 'Invalid payment method'
            };
    }
}

/**
 * Universal payment verification
 */
async function verifyPayment(paymentId, paymentMethod = 'stripe') {
    switch (paymentMethod) {
        case 'stripe':
            return await verifyStripePayment(paymentId);
        
        case 'crypto':
            return await verifyCryptoPayment(paymentId);
        
        case 'direct':
            return await verifyDirectPayment(paymentId);
        
        default:
            return {
                success: false,
                error: 'Invalid payment method'
            };
    }
}

module.exports = {
    // Stripe
    createStripeCheckout,
    verifyStripePayment,
    handleStripeWebhook,
    
    // Crypto
    createCryptoPayment,
    verifyCryptoPayment,
    handleCryptoWebhook,
    
    // Direct
    createDirectPayment,
    verifyDirectPayment,
    
    // Subscriptions
    createSubscription,
    hasActiveSubscription,
    
    // Universal
    createPayment,
    verifyPayment
};
