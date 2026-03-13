const nodemailer = require('nodemailer');

const sendDealAlert = async (email, productName, discount) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'no-reply@alexchance.com',
      pass: process.env.EMAIL_PASS || 'pass-mock'
    }
  });

  let info = await transporter.sendMail({
    from: '"Alex Chance Deals" <no-reply@alexchance.com>',
    to: email,
    subject: `🔥 HOT DEAL: ${productName} is now ${discount}% OFF!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px;">
        <h1 style="color: #1e40af; text-align: center;">Alexandria Last Chance</h1>
        <p style="font-size: 18px; color: #333;">A new clearance deal just dropped near you in Alexandria!</p>
        <div style="background-color: #f97316; color: white; padding: 20px; border-radius: 15px; text-align: center; margin: 20px 0;">
          <h2 style="margin: 0;">${productName}</h2>
          <p style="font-size: 30px; font-weight: bold; margin: 10px 0;">${discount}% OFF</p>
        </div>
        <p style="color: #666; font-style: italic; text-align: center;">Don't wait! Only a few units left in stock at our local vendor.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="http://localhost:4200" style="background-color: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; text-transform: uppercase; font-size: 14px;">Grab Deal Now</a>
        </div>
      </div>
    `
  });

  return info;
};

module.exports = { sendDealAlert };
