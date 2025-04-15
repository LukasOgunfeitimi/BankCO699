const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });
const sendEmail = require('./utils/sendEmail.js');

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(cors());

// User Registration
app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert([{ email, name, password: hashedPassword }])
    .select()
    .single();

  if (userError) return res.status(400).json({ error: userError.message });

  // Create an account for the user
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert([{ user_id: user.id, balance: 0, account_num: Math.floor(Math.random() * 100_000_000) }])
    .select()
    .single();

  if (accountError) return res.status(400).json({ error: accountError.message });

  res.json({ message: 'User registered successfully', user, account });
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(400).json({ error: 'Invalid credentials' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

/**
 * make sure to talk about how u dont tell the client if the user isnt found due to security
 */
app.post('/requestreset', async (req, res) => {
  const { email } = req.body;

  /*
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.json({ status: "done" });
*/
  // Generate a password reset token
  const token = jwt.sign({ id: 1, type: 'requestreset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  //const email = await sendEmail('lukas7865@yahoo.co.uk', 'http://localhost:3000', token)

  return res.json({ status: "done" });
});

// Reset Password
app.post('/reset', async (req, res) => {
  const { password, token } = req.body;
  if (!password || !token) return res.status(400).json({ error: 'Invalid request' });
  try { 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'requestreset') return res.status(400).json({ error: 'Invalid token' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', decoded.id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
});

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Get Account Balance
app.get('/balance', authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', req.user.id)
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ balance: data.balance});
});

// Deposit Funds
app.post('/deposit', authenticate, async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  // Update account balance
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (accountError) return res.status(400).json({ error: accountError.message });

  const newBalance = account.balance + amount;

  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('user_id', req.user.id);

  if (updateError) return res.status(400).json({ error: updateError.message });

  // Add transaction record
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([{ account_id: account.id, type: 'deposit', amount }]);

  if (transactionError) return res.status(400).json({ error: transactionError.message });

  res.json({ message: 'Deposit successful', newBalance });
});

// Withdraw Funds
app.post('/withdraw', authenticate, async (req, res) => {
  const { amount } = req.body;
  if (amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  // Update account balance
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', req.user.id)
    .single();

  if (accountError) return res.status(400).json({ error: accountError.message });

  if (account.balance < amount) return res.status(400).json({ error: 'Insufficient funds' });

  const newBalance = account.balance - amount;

  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('user_id', req.user.id);

  if (updateError) return res.status(400).json({ error: updateError.message });

  // Add transaction record
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert([{ account_id: account.id, type: 'withdrawal', amount }]);

  if (transactionError) return res.status(400).json({ error: transactionError.message });

  res.json({ message: 'Withdrawal successful', newBalance });
});

// Get Transaction History
app.get('/transactions', authenticate, async (req, res) => {
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', req.user.id)
    .single();

  if (accountError) return res.status(400).json({ error: accountError.message });

  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false });

  if (transactionsError) return res.status(400).json({ error: transactionsError.message });

  res.json({ transactions });
});

app.listen(port, () => console.log(`Server running on port ${port}`));