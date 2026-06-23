const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dataService = require('./dataService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_siddhivinayak_token_key_123';

// Generate random 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const loginRequest = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const admin = await dataService.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 minutes

    // Save OTP to database
    await dataService.updateAdminOTP(email, otp, expires);

    // Print to server console for local testing!
    console.log('\n=============================================');
    console.log(`🔐  ADMIN LOGIN OTP INITIATED`);
    console.log(`📧  Email: ${email}`);
    console.log(`🔑  Verification OTP: ${otp}`);
    console.log(`⏰  Expires in 5 minutes`);
    console.log('=============================================\n');

    // Return success. In dev, we also provide the OTP in the API response IF we are not in strict production.
    // This allows seamless local automation/testing if needed. Let's make it conditional, or return it for easy UX in dev fallback.
    const isDev = !process.env.MONGODB_URI;
    return res.status(200).json({ 
      message: 'OTP sent to admin console.', 
      email,
      devOtp: isDev ? otp : undefined // only expose directly in dev mode for easy access
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  try {
    const admin = await dataService.getAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ error: 'Authentication failed.' });
    }

    if (!admin.otpSecret || !admin.otpExpires) {
      return res.status(401).json({ error: 'OTP request expired or not found. Please log in again.' });
    }

    const now = new Date();
    const expiry = new Date(admin.otpExpires);
    if (now > expiry) {
      return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (admin.otpSecret !== otp) {
      return res.status(401).json({ error: 'Incorrect OTP code.' });
    }

    // OTP matched - clear secret and issue JWT
    await dataService.updateAdminOTP(email, '', null);

    const token = jwt.sign({ email: admin.email }, JWT_SECRET, { expiresIn: '8h' });

    return res.status(200).json({
      message: 'Login successful',
      token,
      admin: { email: admin.email }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Middleware to verify JWT token
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = {
  loginRequest,
  verifyOTP,
  authenticateAdmin
};
