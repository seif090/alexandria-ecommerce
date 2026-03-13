const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

/**
 * Wallet & Subscription Management Routes
 * Comprehensive backend for user wallets, memberships, subscriptions, and rewards
 */

// ========== WALLET ROUTES ==========

/**
 * GET /wallet/balance
 * Get user's current wallet balance
 */
router.get('/balance', auth, (req, res) => {
  try {
    const userId = req.user.id;
    
    // Mock implementation - replace with database
    const walletData = {
      userId,
      balance: 2500.00,
      currency: 'EGP',
      lastUpdated: new Date(),
      accountStatus: 'active',
      totalAdded: 5000,
      totalSpent: 2500,
      transactions: 12
    };

    res.json({
      success: true,
      data: walletData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /wallet/add-funds
 * Add funds to wallet
 */
router.post('/add-funds', auth, (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!['card', 'bank', 'apple_pay', 'google_pay'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Mock transaction
    const transactionId = `TXN-${Date.now()}`;
    const newBalance = 2500 + amount;

    res.json({
      success: true,
      message: `✅ ${amount} EGP has been added to your wallet`,
      data: {
        transactionId,
        amount,
        paymentMethod,
        newBalance,
        timestamp: new Date(),
        status: 'completed'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /wallet/withdraw
 * Withdraw funds from wallet to bank account
 */
router.post('/withdraw', auth, (req, res) => {
  try {
    const { amount, bankAccount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0 || amount > 2500) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    res.json({
      success: true,
      message: `✅ Withdrawal of ${amount} EGP initiated`,
      data: {
        withdrawalId: `WTH-${Date.now()}`,
        amount,
        bankAccount: `****${bankAccount.slice(-4)}`,
        status: 'processing',
        estimatedTime: '1-3 business days',
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /wallet/transactions
 * Get wallet transaction history
 */
router.get('/transactions', auth, (req, res) => {
  try {
    const limit = req.query.limit || 50;

    const mockTransactions = [
      {
        id: 'TXN-001',
        type: 'debit',
        amount: 450,
        description: 'Purchase: Wireless Headphones',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        orderId: 'ORD-001'
      },
      {
        id: 'TXN-002',
        type: 'credit',
        amount: 100,
        description: 'Refund from Order ORD-001',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'completed'
      },
      {
        id: 'TXN-003',
        type: 'reward',
        amount: 50,
        description: 'Birthday Reward Bonus',
        timestamp: new Date(),
        status: 'completed'
      },
      {
        id: 'TXN-004',
        type: 'cashback',
        amount: 22.50,
        description: 'Cashback from Purchase (5%)',
        timestamp: new Date(),
        status: 'completed'
      }
    ];

    res.json({
      success: true,
      data: mockTransactions.slice(0, limit),
      count: mockTransactions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MEMBERSHIP & REWARDS ROUTES ==========

/**
 * GET /rewards/program
 * Get user's rewards program information
 */
router.get('/rewards/program', auth, (req, res) => {
  try {
    const userId = req.user.id;

    res.json({
      success: true,
      data: {
        userId,
        tier: 'gold',
        displayTier: 'Gold Member',
        totalPointsEarned: 12500,
        currentPoints: 4230,
        nextTierThreshold: 15000,
        progressToNextTier: 83,
        redeemableRewards: 423,
        annualSpent: 12500,
        memberSince: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        rewards: {
          availableBenefits: [
            '8% discount on all orders',
            'Free express shipping',
            'Early sale access',
            'VIP event invitations',
            'Personal shopping assistant'
          ],
          monthlyBonus: 500,
          birthdayBonus: 2000,
          specialOffers: ['Double points this weekend']
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /rewards/redeem
 * Redeem rewards points
 */
router.post('/rewards/redeem', auth, (req, res) => {
  try {
    const { points } = req.body;

    if (!points || points <= 0) {
      return res.status(400).json({ error: 'Invalid points amount' });
    }

    const creditAmount = points * 0.1; // 1 point = 0.1 EGP

    res.json({
      success: true,
      message: `✅ ${points} points redeemed for ${creditAmount} EGP`,
      data: {
        pointsRedeemed: points,
        creditAmount,
        remainingPoints: 4230 - points,
        timestamp: new Date(),
        status: 'completed'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SUBSCRIPTION ROUTES ==========

/**
 * GET /subscription/current
 * Get current subscription status
 */
router.get('/current', auth, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: 'SUB-001',
        planId: 'annual-premium',
        planName: 'Platinum Member - Annual',
        status: 'active',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        monthlyPrice: 83.25,
        annualPrice: 999,
        daysUntilRenewal: 305,
        tierLevel: 'platinum',
        benefits: [
          '12% discount on all orders',
          'Worldwide free shipping',
          'Private shopping access',
          'Concierge service',
          'VIP lounge access'
        ],
        paymentMethod: '**** **** **** 2024'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /subscription/plans
 * Get available subscription plans
 */
router.get('/plans', (req, res) => {
  try {
    const plans = [
      {
        id: 'monthly-basic',
        name: 'Silver Benefits - Monthly',
        price: 49,
        billing: 'monthly',
        tier: 'silver',
        features: ['5% discount', 'Free shipping', 'Early access'],
        bestFor: 'Casual Shoppers'
      },
      {
        id: 'monthly-premium',
        name: 'Gold Benefits - Monthly',
        price: 99,
        billing: 'monthly',
        tier: 'gold',
        features: ['8% discount', 'Express shipping', 'VIP events'],
        bestFor: 'Regular Shoppers'
      },
      {
        id: 'annual-premium',
        name: 'Platinum Benefits - Annual',
        price: 999,
        billing: 'annual',
        tier: 'platinum',
        features: ['12% discount', 'Worldwide shipping', 'Concierge service'],
        bestFor: 'Premium Customers'
      },
      {
        id: 'annual-elite',
        name: 'Pharaoh Benefits - Annual',
        price: 2499,
        billing: 'annual',
        tier: 'pharaoh',
        features: ['20% discount', 'White glove service', 'Private auctions'],
        bestFor: 'Luxury Customers',
        popular: true
      }
    ];

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /subscription/subscribe
 * Subscribe to a plan
 */
router.post('/subscribe', auth, (req, res) => {
  try {
    const { planId, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!planId) {
      return res.status(400).json({ error: 'Plan ID required' });
    }

    res.json({
      success: true,
      message: '✅ Successfully subscribed to plan',
      data: {
        subscriptionId: `SUB-${Date.now()}`,
        planId,
        status: 'active',
        startDate: new Date(),
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /subscription/cancel
 * Cancel current subscription
 */
router.post('/cancel', auth, (req, res) => {
  try {
    const { reason } = req.body;

    res.json({
      success: true,
      message: '✅ Subscription cancelled',
      data: {
        cancelledAt: new Date(),
        lastAccessDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
        refundAmount: 0,
        reason: reason || 'User requested',
        feedbackCollected: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /subscription/pause
 * Pause subscription temporarily
 */
router.post('/pause', auth, (req, res) => {
  try {
    const { months } = req.body;

    if (!months || months < 1 || months > 12) {
      return res.status(400).json({ error: 'Invalid pause duration (1-12 months)' });
    }

    res.json({
      success: true,
      message: `✅ Subscription paused for ${months} month(s)`,
      data: {
        pausedAt: new Date(),
        resumeDate: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000),
        status: 'paused',
        willAutoResume: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== REFERRAL PROGRAM ROUTES ==========

/**
 * GET /referral/rewards
 * Get referral rewards
 */
router.get('/referral/rewards', auth, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        totalReferrals: 5,
        completedReferrals: 4,
        totalEarned: 400,
        pendingRewards: 100,
        referralsThisMonth: 2,
        rewards: [
          {
            refereeId: 'USER-002',
            bonusAmount: 100,
            status: 'completed',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          {
            refereeId: 'USER-003',
            bonusAmount: 100,
            status: 'completed',
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
          },
          {
            refereeId: 'USER-004',
            bonusAmount: 100,
            status: 'pending',
            date: new Date()
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /referral/generate-link
 * Generate referral link
 */
router.post('/referral/generate-link', auth, (req, res) => {
  try {
    const userId = req.user.id;
    const referralCode = `REF-${userId}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const referralLink = `https://alexandrialastchance.com/join?ref=${referralCode}`;

    res.json({
      success: true,
      data: {
        referralCode,
        referralLink,
        message: 'Share this link to earn 100 EGP for each successful referral',
        copyableText: referralLink
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /referral/apply
 * Apply referral code during signup/login
 */
router.post('/referral/apply', auth, (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Referral code required' });
    }

    res.json({
      success: true,
      message: '✅ Referral code applied. You\'ll earn 100 EGP on your first purchase!',
      data: {
        bonusAmount: 100,
        appliedCode: code,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MEMBERSHIP TIER ROUTES ==========

/**
 * GET /membership/tiers
 * Get all membership tier information
 */
router.get('/membership/tiers', (req, res) => {
  try {
    const tiers = [
      {
        name: 'Bronze',
        minSpent: 0,
        maxSpent: 499,
        color: '#CD7F32',
        benefits: ['2% discount', 'Free shipping over 200 EGP', 'Birthday bonus'],
        icon: '🥉'
      },
      {
        name: 'Silver',
        minSpent: 500,
        maxSpent: 1499,
        color: '#C0C0C0',
        benefits: ['5% discount', 'Free all shipping', 'Early sale access', 'Priority support'],
        icon: '🥈'
      },
      {
        name: 'Gold',
        minSpent: 1500,
        maxSpent: 4999,
        color: '#D4AF37',
        benefits: ['8% discount', 'Express shipping', 'VIP events', 'Personal shopper', 'Concierge'],
        icon: '🥇'
      },
      {
        name: 'Platinum',
        minSpent: 5000,
        maxSpent: 9999,
        color: '#E5E4E2',
        benefits: ['12% discount', 'Worldwide shipping', 'Private shopping', 'Dedicated assistant', 'Lounge access'],
        icon: '💎'
      },
      {
        name: 'Pharaoh',
        minSpent: 10000,
        maxSpent: Infinity,
        color: '#D4AF37',
        benefits: ['20% discount', 'White glove service', 'Private auctions', 'Custom experiences', 'Lifetime warranty'],
        icon: '👑'
      }
    ];

    res.json({
      success: true,
      data: tiers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /membership/current
 * Get current user's membership tier
 */
router.get('/membership/current', auth, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        currentTier: 'gold',
        displayName: 'Gold Member',
        totalSpent: 2500,
        nextTierThreshold: 5000,
        progressPercentage: 50,
        benefits: [
          '8% discount on all orders',
          'Free express shipping',
          'VIP event invitations',
          'Personal AI shopping assistant',
          'Premium customer support'
        ],
        earnedThisMonth: 125,
        pointsMultiplier: 2
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
