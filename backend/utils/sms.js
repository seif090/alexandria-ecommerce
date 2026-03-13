const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID || 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const client = twilio(accountSid, authToken);

const sendPickupSMS = async (to, orderId, vendorName) => {
  try {
    const message = await client.messages.create({
      body: `Alexandria Last Chance: Your order ${orderId} from ${vendorName} is confirmed! Show your QR code at the shop for pickup.`,
      from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
      to: to
    });
    console.log('SMS Sent:', message.sid);
    return message;
  } catch (err) {
    console.error('Twilio Error:', err.message);
  }
};

module.exports = { sendPickupSMS };
