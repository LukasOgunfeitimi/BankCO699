import nodemailer from "nodemailer";

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

const mailOptions = {
  from: '"Reset Password" <lufunds@araxy.co.uk>',
  to: 'lukas7865@yahoo.co.uk',
  subject: 'LuFunds - Password Reset',
  text: 'Click the link to reset your password: https://yourdomain.com/reset?token=abc123', // always include a plain text fallback
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested to reset your password. Click the button below to proceed:</p>
      <a href="https://yourdomain.com/reset?token=abc123" 
         style="display: inline-block; padding: 10px 20px; margin-top: 10px;
                background-color: #007bff; color: white; text-decoration: none;
                border-radius: 5px;">
        Reset Password
      </a>
      <p>If you didn’t request this, just ignore this email.</p>
      <p>– LuFunds</p>
    </div>
  `
};


transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Error:', error);
  }
  console.log('Message sent: %s', info.messageId);
});
