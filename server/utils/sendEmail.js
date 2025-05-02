const nodemailer = require('nodemailer');
const WEBSITE_URL = 'http://localhost:3000';

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: 'smtp.ionos.co.uk',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'lufunds@araxy.co.uk',
    pass: 'FnbA7j_impdWfzqC',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send messages');
  }
});

const emailTemplates = {
  passwordChanged: (email, name = 'User') => ({
    from: '"LuFunds Security" <lufunds@araxy.co.uk>',
    to: email,
    subject: 'Your LuFunds Password Has Been Changed',
    text: `Dear ${name},\n\nYour LuFunds account password was successfully changed. If you didn't make this change, please contact our support team immediately at security@lufunds.com.\n\nThank you,\nThe LuFunds Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Password Changed Notification</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a365d; padding: 20px; text-align: center; }
          .header img { max-width: 150px; }
          .content { padding: 30px; background-color: #f8f9fa; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3182ce;
                   color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
          .alert { background-color: #fff5f5; padding: 15px; border-left: 4px solid #e53e3e; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://lufunds.com/logo.png" alt="LuFunds Logo">
          </div>
          <div class="content">
            <h2>Password Change Confirmation</h2>
            <p>Dear ${name},</p>
            <p>Your LuFunds account password was successfully changed on ${new Date().toLocaleString()}.</p>

            <div class="alert">
              <strong>Security Notice:</strong> If you didn't make this change, please contact our
              security team immediately at <a href="mailto:security@lufunds.com">security@lufunds.com</a>.
            </div>

            <p>For your security, we recommend:</p>
            <ul>
              <li>Using a strong, unique password</li>
              <li>Enabling two-factor authentication</li>
              <li>Regularly updating your password</li>
            </ul>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LuFunds. All rights reserved.</p>
            <p><a href="${WEBSITE_URL}/privacy">Privacy Policy</a> | <a href="${WEBSITE_URL}/terms">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (email, name = 'User', token) => ({
    from: '"LuFunds Support" <lufunds@araxy.co.uk>',
    to: email,
    subject: 'Reset Your LuFunds Password',
    text: `Dear ${name},\n\nYou requested to reset your LuFunds password. Please use this link to reset your password (expires in 1 hour):\n\n${WEBSITE_URL}/resetpassword?token=${token}\n\nIf you didn't request this, please ignore this email or contact support if you have concerns.\n\nThank you,\nThe LuFunds Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Password Reset Request</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a365d; padding: 20px; text-align: center; }
          .header img { max-width: 150px; }
          .content { padding: 30px; background-color: #f8f9fa; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3182ce;
                   color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
          .small { font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://lufunds.com/logo.png" alt="LuFunds Logo">
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Dear ${name},</p>
            <p>We received a request to reset your LuFunds account password. Click the button below to proceed:</p>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${WEBSITE_URL}/resetpassword?token=${token}" class="button">
                Reset Password
              </a>
            </p>

            <p class="small">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>

            <p>For your security, never share your password or this link with anyone.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LuFunds. All rights reserved.</p>
            <p><a href="${WEBSITE_URL}/privacy">Privacy Policy</a> | <a href="${WEBSITE_URL}/terms">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcomeEmail: (email, name) => ({
    from: '"LuFunds Team" <lufunds@araxy.co.uk>',
    to: email,
    subject: 'Welcome to LuFunds!',
    text: `Welcome ${name},\n\nThank you for joining LuFunds! We're excited to have you on board.\n\nGet started by exploring your dashboard and setting up your account.\n\nIf you have any questions, our support team is here to help.\n\nBest regards,\nThe LuFunds Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to LuFunds!</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a365d; padding: 20px; text-align: center; }
          .header img { max-width: 150px; }
          .content { padding: 30px; background-color: #f8f9fa; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3182ce;
                   color: white; text-decoration: none; border-radius: 4px; font-weight: bold; }
          .highlight { color: #3182ce; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://lufunds.com/logo.png" alt="LuFunds Logo">
          </div>
          <div class="content">
            <h2>Welcome to LuFunds, ${name}!</h2>
            <p>Dear ${name},</p>
            <p>Thank you for joining LuFunds! We're thrilled to have you on board and can't wait for you to explore all the features we have to offer.</p>

            <p>Here are some steps to get you started:</p>
            <ul>
              <li>Explore your <span class="highlight">dashboard</span> to get an overview of your account</li>
              <li>Set up your <span class="highlight">profile</span> with your personal information</li>
              <li>Start <span class="highlight">depositing</span> and <span class="highlight">withdrawing</span> funds</li>
              <li>Check out our <span class="highlight">FAQs</span> for any questions you might have</li>
            </ul>

            <p style="text-align: center; margin: 30px 0;">
              <a href="${WEBSITE_URL}/dashboard" class="button">
                Go to Dashboard
              </a>
            </p>

            <p>If you have any questions or need assistance, our support team is here to help. You can reach us at <a href="mailto:support@lufunds.com">support@lufunds.com</a>.</p>

            <p>Best regards,</p>
            <p>The LuFunds Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LuFunds. All rights reserved.</p>
            <p><a href="${WEBSITE_URL}/privacy">Privacy Policy</a> | <a href="${WEBSITE_URL}/terms">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  emailAuthCode: (email, code) => ({
    from: '"LuFunds Security" <lufunds@araxy.co.uk>',
    to: email,
    subject: 'Your LuFunds Authentication Code',
    text: `Your authentication code is: ${code}. This code will expire in 10 minutes.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Authentication Code</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1a365d; padding: 20px; text-align: center; }
          .header img { max-width: 150px; }
          .content { padding: 30px; background-color: #f8f9fa; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .code { font-size: 24px; font-weight: bold; color: #3182ce; text-align: center; margin: 20px 0; }
          .alert { background-color: #fff5f5; padding: 15px; border-left: 4px solid #e53e3e; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://lufunds.com/logo.png" alt="LuFunds Logo">
          </div>
          <div class="content">
            <h2>Your Authentication Code</h2>
            <p>Your authentication code is:</p>
            <div class="code">${code}</div>
            <p>This code will expire in 10 minutes. If you didn't request this code, please contact our support team immediately at <a href="mailto:security@lufunds.com">security@lufunds.com</a>.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} LuFunds. All rights reserved.</p>
            <p><a href="${WEBSITE_URL}/privacy">Privacy Policy</a> | <a href="${WEBSITE_URL}/terms">Terms of Service</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Email Service Methods
const EmailService = {
  sendPasswordReset: async (email, name, token) => {
    const info = emailTemplates.passwordReset(email, name, token);
    return await transporter.sendMail(info);
  },

  sendPasswordChanged: async (email, name) => {
    const info = emailTemplates.passwordChanged(email, name);
    await transporter.sendMail(info);
  },

  sendWelcomeEmail: async (email, name) => {
    const info = emailTemplates.welcomeEmail(email, name);
    return await transporter.sendMail(info);
  },

  sendEmailAuthCode: async (email, code) => {
    const info = emailTemplates.emailAuthCode(email, code);
    return await transporter.sendMail(info);
  },
};

module.exports = EmailService;