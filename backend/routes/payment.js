const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

// Mock middleware for authentication
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Mock payment methods storage
const paymentMethods = new Map();
const wallets = new Map();
const transactions = new Map();
const promoCodes = {
  'SAVE10': { discount: 0.10, maxUses: 100, uses: 45 },
  'SUMMER20': { discount: 0.20, maxUses: 50, uses: 30 },
  'WELCOME15': { discount: 0.15, maxUses: 1000, uses: 234 },
  'FLASH50': { discount: 0.50, maxUses: 10, uses: 8 }
};

// ============ Payment Methods ============
router.get('/methods', auth, (req, res) => {
  const methods = paymentMethods.get(req.userId) || [];
  res.json(methods);
});

router.post('/methods', auth, (req, res) => {
  const { type, name, lastFour, expiryDate, isDefault } = req.body;
  const newMethod = {
    id: `method_${Date.now()}`,
    type,
    name,
    lastFour,
    expiryDate,
    isDefault,
    createdAt: new Date().toISOString()
  };

  let userMethods = paymentMethods.get(req.userId) || [];
  
  if (isDefault) {
    userMethods = userMethods.map(m => ({ ...m, isDefault: false }));
  }

  userMethods.push(newMethod);
  paymentMethods.set(req.userId, userMethods);

  res.json(newMethod);
});

router.delete('/methods/:methodId', auth, (req, res) => {
  const { methodId } = req.params;
  let userMethods = paymentMethods.get(req.userId) || [];
  userMethods = userMethods.filter(m => m.id !== methodId);
  paymentMethods.set(req.userId, userMethods);

  res.json({ message: 'Payment method deleted' });
});

router.put('/methods/:methodId/default', auth, (req, res) => {
  const { methodId } = req.params;
  let userMethods = paymentMethods.get(req.userId) || [];

  userMethods = userMethods.map(m => ({
    ...m,
    isDefault: m.id === methodId
  }));

  paymentMethods.set(req.userId, userMethods);
  const updated = userMethods.find(m => m.id === methodId);

  res.json(updated);
});

// ============ Card Payment Processing ============
router.post('/charge/card', auth, (req, res) => {
  const { card, amount, orderId, currency } = req.body;

  const transaction = {
    id: `txn_${Date.now()}`,
    orderId,
    amount,
    currency,
    status: 'success',
    paymentMethod: {
      type: 'credit_card',
      lastFour: card.cardNumber.slice(-4),
      brand: 'Visa'
    },
    timestamp: new Date().toISOString(),
    receiptUrl: `https://receipts.example.com/${orderId}`
  };

  const userTransactions = transactions.get(req.userId) || [];
  userTransactions.push(transaction);
  transactions.set(req.userId, userTransactions);

  res.json(transaction);
});

// ============ Wallet Management ============
router.get('/wallet', auth, (req, res) => {
  let wallet = wallets.get(req.userId);

  if (!wallet) {
    wallet = {
      userId: req.userId,
      balance: 2500,
      currency: 'EGP',
      transactions: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    wallets.set(req.userId, wallet);
  }

  res.json(wallet);
});

router.post('/wallet/preload', auth, (req, res) => {
  const { amount, paymentMethod } = req.body;

  let wallet = wallets.get(req.userId) || {
    userId: req.userId,
    balance: 2500,
    currency: 'EGP',
    transactions: [],
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };

  const transaction = {
    id: `txn_${Date.now()}`,
    orderId: `PRELOAD_${Date.now()}`,
    amount,
    status: 'success',
    paymentMethod,
    timestamp: new Date().toISOString()
  };

  wallet.balance += amount;
  wallet.transactions.push({
    id: transaction.id,
    type: 'credit',
    amount,
    description: `Wallet preload via ${paymentMethod.name}`,
    timestamp: new Date().toISOString(),
    reason: 'bonus'
  });
  wallet.lastUpdated = new Date().toISOString();

  wallets.set(req.userId, wallet);

  res.json(transaction);
});

router.post('/wallet/pay', auth, (req, res) => {
  const { amount, orderId, description } = req.body;

  let wallet = wallets.get(req.userId);
  if (!wallet) {
    return res.status(400).json({ message: 'Wallet not found' });
  }

  if (wallet.balance < amount) {
    return res.status(400).json({ message: 'Insufficient wallet balance' });
  }

  const transaction = {
    id: `txn_wallet_${Date.now()}`,
    orderId,
    amount,
    currency: 'EGP',
    status: 'success',
    paymentMethod: { type: 'wallet' },
    timestamp: new Date().toISOString()
  };

  wallet.balance -= amount;
  wallet.transactions.push({
    id: transaction.id,
    type: 'debit',
    amount,
    description: description || `Payment for order ${orderId}`,
    timestamp: new Date().toISOString(),
    reason: 'purchase'
  });
  wallet.lastUpdated = new Date().toISOString();

  wallets.set(req.userId, wallet);

  const userTransactions = transactions.get(req.userId) || [];
  userTransactions.push(transaction);
  transactions.set(req.userId, userTransactions);

  res.json(transaction);
});

// ============ Bank Transfer ============
router.post('/bank-transfer/initiate', auth, (req, res) => {
  const { amount, orderId } = req.body;

  const transaction = {
    id: `transfer_${Date.now()}`,
    orderId,
    amount,
    status: 'pending',
    type: 'bank_transfer',
    reference: `REF${Date.now()}`,
    bankDetails: {
      accountName: 'Alexandria Last Chance',
      accountNumber: '1234567890',
      bankName: 'National Bank of Egypt',
      swiftCode: 'NBEGEGCX',
      iban: 'EG1234567890'
    },
    dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    timestamp: new Date().toISOString()
  };

  const userTransactions = transactions.get(req.userId) || [];
  userTransactions.push(transaction);
  transactions.set(req.userId, userTransactions);

  res.json(transaction);
});

router.get('/bank-transfer/details', auth, (req, res) => {
  res.json({
    accountName: 'Alexandria Last Chance Ltd.',
    accountNumber: '1234567890',
    bankName: 'National Bank of Egypt',
    branch: 'Alexandria Branch',
    swiftCode: 'NBEGEGCX',
    iban: 'EG1234567890',
    currency: 'EGP'
  });
});

// ============ Transaction History ============
router.get('/transactions', auth, (req, res) => {
  const userTransactions = transactions.get(req.userId) || [];
  res.json(userTransactions.slice(0, 50));
});

router.get('/transactions/:transactionId', auth, (req, res) => {
  const { transactionId } = req.params;
  const userTransactions = transactions.get(req.userId) || [];
  const transaction = userTransactions.find(t => t.id === transactionId);

  if (!transaction) {
    return res.status(404).json({ message: 'Transaction not found' });
  }

  res.json(transaction);
});

// ============ Refunds ============
router.post('/refunds', auth, (req, res) => {
  const { transactionId, reason } = req.body;

  const refund = {
    id: `refund_${Date.now()}`,
    transactionId,
    reason,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    expectedRefundDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  };

  res.json(refund);
});

router.get('/refunds/:refundId', auth, (req, res) => {
  const { refundId } = req.params;

  res.json({
    id: refundId,
    status: 'completed',
    amount: 1200,
    currency: 'EGP',
    refundedAt: new Date().toISOString()
  });
});

// ============ Invoice & Receipt ============
router.get('/invoice/:transactionId', auth, (req, res) => {
  const { transactionId } = req.params;

  const pdfContent = Buffer.from(`
    RECEIPT - Order ${transactionId}
    Date: ${new Date().toISOString()}
    Amount: 1200 EGP
    Status: Successful
  `);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${transactionId}.pdf"`);
  res.send(pdfContent);
});

// ============ Payment Verification ============
router.post('/verify', auth, (req, res) => {
  const { transactionId } = req.body;

  res.json({
    transactionId,
    verified: true,
    status: 'success',
    verificationCode: `VER${Date.now()}`
  });
});

// ============ Promo Codes ============
router.post('/promo/validate', auth, (req, res) => {
  const { code, amount } = req.body;

  const promoCode = promoCodes[code.toUpperCase()];
  if (!promoCode) {
    return res.status(400).json({ message: 'Invalid promo code' });
  }

  if (promoCode.uses >= promoCode.maxUses) {
    return res.status(400).json({ message: 'Promo code expired' });
  }

  const discountAmount = Math.round(amount * promoCode.discount);

  res.json({
    code: code.toUpperCase(),
    valid: true,
    discountPercentage: promoCode.discount * 100,
    discountAmount,
    newTotal: amount - discountAmount
  });
});

router.post('/promo/apply', auth, (req, res) => {
  const { code, orderId } = req.body;

  const promoCode = promoCodes[code.toUpperCase()];
  if (promoCode) {
    promoCode.uses++;
  }

  res.json({
    code: code.toUpperCase(),
    applied: true,
    orderId,
    appliedAt: new Date().toISOString()
  });
});

module.exports = router;
