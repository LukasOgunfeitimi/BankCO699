const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.co.uk',      // your SMTP server
  port: 587,                         // usually 587 for TLS, 465 for SSL
  secure: false,                     // true for port 465, false for others
  auth: {
    user: 'lufunds@araxy.co.uk',         // your email address
    pass: 'FnbA7j_impdWfzqC',    // or an app password if using 2FA
  },
  tls: {
    rejectUnauthorized: false        // if self-signed certs are used
  }
});

function getInfo(email, website, token) {
  return {
    from: '"Reset Password" <lufunds@araxy.co.uk>',
    to: email,
    subject: 'LuFunds - Password Reset',
    text: `Click the link to reset your password: ${website + "/reset?token=" + token}`, 
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${website + "/reset?token=" + token}" 
          style="display: inline-block; padding: 10px 20px; margin-top: 10px;
                  background-color: #007bff; color: white; text-decoration: none;
                  border-radius: 5px;">
          Reset Password
        </a>
        <p>If you didn’t request this, just ignore this email.</p>
        <p>– LuFunds</p>
      </div>
    `
  }
};

module.exports = async (email, website, token) => await transporter.sendMail(getInfo(email, website, token));