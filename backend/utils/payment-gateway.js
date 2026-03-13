/**
 * Mock Payment Gateway for Alexandria Last Chance
 * Simulates Stripe-like payment processing
 */

const generatePaymentId = () => {
  return 'pi_' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const generateBankReference = () => {
  return 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 9999);
};

const processPayment = async (amount, currency = 'EGP', cardToken, orderId) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simulate 98% success rate
  const isSuccess = Math.random() > 0.02;

  if (!isSuccess) {
    return {
      success: false,
      paymentId: generatePaymentId(),
      status: 'failed',
      error: 'Card declined - Insufficient funds',
      errorCode: 'card_declined',
      timestamp: new Date()
    };
  }

  return {
    success: true,
    paymentId: generatePaymentId(),
    bankReference: generateBankReference(),
    orderId,
    amount,
    currency,
    status: 'succeeded',
    method: 'card',
    last4Digits: cardToken ? cardToken.slice(-4) : '****',
    timestamp: new Date(),
    receiptUrl: `https://receipts.alexchance.com/${generatePaymentId()}.pdf`
  };
};

const refundPayment = async (paymentId, amount) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    success: true,
    refundId: 'ref_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    originalPaymentId: paymentId,
    amount,
    status: 'completed',
    timestamp: new Date()
  };
};

const getPaymentStatus = async (paymentId) => {
  // Mock historical data
  const statuses = ['succeeded', 'processing', 'requires_action'];
  return {
    paymentId,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    created: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    lastUpdate: new Date()
  };
};

module.exports = { processPayment, refundPayment, getPaymentStatus, generatePaymentId };
