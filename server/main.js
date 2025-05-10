const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });
const Email = require('./utils/sendEmail.js');
const speakeasy = require('speakeasy');
const rateLimit = require('express-rate-limit'); 
const QRCode = require('qrcode');
const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,   // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter globally
app.use(limiter);

// Utility function to handle errors
const handleError = (res, error, status = 400) => res.status(status).json({ error: error.message || error });


// User Registration
app.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

	const secret = speakeasy.generateSecret({
		name: `LuFunds (${email})`
	}); 
	const qrcode = QRCode.toDataURL(secret.otpauth_url);

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{ email, name, password: hashedPassword, secret: secret.base32 }])
      .select()
      .single();
    if (userError) return handleError(res, userError);

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert([{ user_id: user.id, balance: 0, account_num: Math.floor(Math.random() * 100_000_000) }])
      .select()
      .single();
    if (accountError) return handleError(res, accountError);

    await Email.sendWelcomeEmail(email, name);

	const token = jwt.sign(
		{ id: user.id, email: user.email, name: user.name },
		process.env.JWT_SECRET,
		{ expiresIn: '30d' }
	  );
	res.json({ token, qrcode});
  } catch (error) {
    handleError(res, error);
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !user) return handleError(res, 'Invalid credentials');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return handleError(res, 'Invalid credentials');

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    res.json({ token });
  } catch (error) {
    handleError(res, error);
  }
});

// Request Password Reset
app.post('/requestreset', async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error || !user) return res.json({ status: 'done' });

    const token = jwt.sign({ id: user.id, type: 'requestreset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await Email.sendPasswordReset(email, user.name, token);

    res.json({ status: 'done' });
  } catch (error) {
    handleError(res, error);
  }
});

// Reset Password
app.post('/reset', async (req, res) => {
  try {
    const { password, token } = req.body;
    if (!password || !token) return handleError(res, 'Invalid request');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'requestreset') return handleError(res, 'Invalid token');

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', decoded.id)
      .select()
      .single();
    if (error) return handleError(res, error);

    res.json({ message: 'Password reset successfully' });
    Email.sendPasswordChanged(data.email, data.name);
  } catch (error) {
    handleError(res, 'Invalid token');
  }
});

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return handleError(res, 'Access denied', 401);

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    handleError(res, 'Invalid token', 400);
  }
};

const verifycodes = async (req, res, next) => {
	try {
		const { emailCode, totpCode } = req.body;
		if (!emailCode) return res.status(400).json({ error: 'Code is required' });

		const { data, error } = await supabase
		.from('email_auth_codes')
		.select('code, expires_at')
		.eq('user_id', req.user.id)
		.maybeSingle();

		if (error) return handleError(res, error);
		if (!data) return res.status(404).json({ error: 'Invalid codes' });

		const now = Date.now();

		if (parseInt(data.expires_at) < now) {
			return res.status(400).json({ error: 'Code expired' });
		}

		if (data.code !== emailCode) {
		return res.status(400).json({ error: 'Invalid codes. Please try again' });
		}

		await supabase
		.from('email_auth_codes')
		.delete()
		.eq('user_id', req.user.id);

		// 2FA Setup

		const { data: user, error: userError } = await supabase
		.from('users')
		.select('secret')
		.eq('id', req.user.id)
		.maybeSingle();

		if (userError) return handleError(res, userError);

		const verified = speakeasy.totp.verify({
			secret: user.secret,
			encoding: 'base32',
			token: totpCode,
			window: 1
		});

		if (!verified) {
			return res.status(400).json({ error: 'Invalid codes. Please try again' });
		}

		next();
	} catch (error) {
		handleError(res, error);
	}
}

// Send email auth code (updated expiration time handling)
app.post('/sendemailcode', authenticate, async (req, res) => {
	try {
	  const code = Math.floor(100000 + Math.random() * 900000).toString();
	  await Email.sendEmailAuthCode(req.user.email, code);
  
	  const expirationTime = (Date.now() + 10 * 60 * 1000).toString()
  
	  const { error } = await supabase
		.from('email_auth_codes')
		.upsert(
		  {
			user_id: req.user.id,
			code,
			expires_at: expirationTime,
		  },
		  { onConflict: ['user_id'] }
		);
  
	  if (error) return handleError(res, error);
	  res.json({ message: 'Authentication code sent successfully' });
	} catch (error) {
	  handleError(res, error);
	}
});

// Get Account Balance
app.get('/balance', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', req.user.id)
      .single();
    if (error) return handleError(res, error);

    res.json({ balance: data.balance });
  } catch (error) {
    handleError(res, error);
  }
});

// Deposit Funds
app.post('/deposit', authenticate, verifycodes, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return handleError(res, 'Invalid amount');

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    if (accountError) return handleError(res, accountError);

    const newBalance = account.balance + amount;

    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('user_id', req.user.id);
    if (updateError) return handleError(res, updateError);

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{ account_id: account.id, type: 'deposit', amount, status: 'completed', currency: 'USD' }]);
    if (transactionError) return handleError(res, transactionError);

    res.json({ message: 'Deposit successful', newBalance });
  } catch (error) {
    handleError(res, error);
  }
});

// Withdraw Funds
app.post('/withdraw', authenticate, verifycodes, async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return handleError(res, 'Invalid amount');

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    if (accountError) return handleError(res, accountError);

    if (account.balance < amount) return handleError(res, 'Insufficient funds');

    const newBalance = account.balance - amount;

    const { error: updateError } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('user_id', req.user.id);
    if (updateError) return handleError(res, updateError);

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert([{ account_id: account.id, type: 'withdrawal', amount, status: 'completed', currency: 'USD' }]);
    if (transactionError) return handleError(res, transactionError);

    res.json({ message: 'Withdrawal successful', newBalance });
  } catch (error) {
    handleError(res, error);
  }
});

// Get Transaction History
app.get('/transactions', authenticate, async (req, res) => {
  try {
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', req.user.id)
      .single();
    if (accountError) return handleError(res, accountError);

    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('account_id', account.id)
      .order('created_at', { ascending: false });
    if (transactionsError) return handleError(res, transactionsError);

    res.json({ transactions });
  } catch (error) {
    handleError(res, error);
  }
});

// Get User Info
app.get('/userinfo', authenticate, async (req, res) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', req.user.id)
      .single();
    if (userError) return handleError(res, userError);

    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('account_num')
      .eq('user_id', req.user.id)
      .single();
    if (accountError) return handleError(res, accountError);

    res.json({ name: user.name, email: user.email, account_num: account.account_num });
  } catch (error) {
    handleError(res, error);
  }
});

// Update User Settings
app.put('/settings', authenticate, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return handleError(res, 'Username is required');

    const { data, error } = await supabase
      .from('users')
      .update({ name: username })
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) return handleError(res, error);

    res.json({ message: 'Profile updated successfully', user: data });
  } catch (error) {
    handleError(res, error);
  }
});

// Update User Password
app.put('/settings/password', authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return handleError(res, 'New password is required');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) return handleError(res, error);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

// Transfer Funds
app.post('/transfer', authenticate, verifycodes, async (req, res) => {
  try {
    const { amount, recipientAccountNum } = req.body;
    if (amount <= 0) return handleError(res, 'Invalid amount');
    if (!recipientAccountNum) return handleError(res, 'Recipient account number is required');

    // Get sender's account
    const { data: senderAccount, error: senderAccountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', req.user.id)
      .single();
    if (senderAccountError) return handleError(res, senderAccountError);

    // Check if sender has sufficient funds
    if (senderAccount.balance < amount) return handleError(res, 'Insufficient funds');

    // Get recipient's account
    const { data: recipientAccount, error: recipientAccountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('account_num', recipientAccountNum)
      .single();
    if (recipientAccountError) return handleError(res, 'Recipient account not found');

    // Update sender's balance
    const newSenderBalance = senderAccount.balance - amount;
    const { error: senderUpdateError } = await supabase
      .from('accounts')
      .update({ balance: newSenderBalance })
      .eq('user_id', req.user.id);
    if (senderUpdateError) return handleError(res, senderUpdateError);

    // Update recipient's balance
    const newRecipientBalance = recipientAccount.balance + amount;
    const { error: recipientUpdateError } = await supabase
      .from('accounts')
      .update({ balance: newRecipientBalance })
      .eq('account_num', recipientAccountNum);
    if (recipientUpdateError) return handleError(res, recipientUpdateError);

    // Record the transaction for the sender
    const { error: senderTransactionError } = await supabase
      .from('transactions')
      .insert([{ account_id: senderAccount.id, type: 'transfer', amount, status: 'completed', currency: 'USD', recipient_account_num: recipientAccountNum }]);
    if (senderTransactionError) return handleError(res, senderTransactionError);

    // Record the transaction for the recipient
    const { error: recipientTransactionError } = await supabase
      .from('transactions')
      .insert([{ account_id: recipientAccount.id, type: 'transfer', amount, status: 'completed', currency: 'USD', sender_account_num: senderAccount.account_num }]);
    if (recipientTransactionError) return handleError(res, recipientTransactionError);

    res.json({ message: 'Transfer successful', newBalance: newSenderBalance });
  } catch (error) {
    handleError(res, error);
  }
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));